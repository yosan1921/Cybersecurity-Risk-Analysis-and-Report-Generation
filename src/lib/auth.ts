/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User, { UserRole } from "@/models/User";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Upsert an SSO user and return a normalised user object for the JWT. */
async function upsertSSOUser(
  providerField: "googleId" | "githubId" | "azureId",
  providerId: string,
  email: string,
  name?: string | null
) {
  await dbConnect();
  let user = await User.findOne({ [providerField]: providerId });
  if (!user) {
    // Try to link to an existing account with the same email
    user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      (user as any)[providerField] = providerId;
      await user.save();
    } else {
      user = await User.create({
        email: email.toLowerCase(),
        [providerField]: providerId,
        role: "Staff",
        name: name ?? "",
        mfaEnabled: false,
      });
    }
  }
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
    name: user.name,
    mfaEnabled: user.mfaEnabled,
  };
}

// ── authOptions ───────────────────────────────────────────────────────────────

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      // MFA token passed as a third credential after the challenge step
      mfaToken: { label: "MFA Token", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      await dbConnect();
      const user = await User.findOne({ email: credentials.email.toLowerCase() });
      if (!user || !user.password) return null;

      const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordValid) return null;

      // If MFA is enabled, verify the token here
      if (user.mfaEnabled) {
        const token = credentials.mfaToken?.trim();
        if (!token) {
          // Signal to the client that MFA is required
          throw new Error("MFA_REQUIRED");
        }

        const { verifyTOTP, verifyBackupCode } = await import("@/lib/mfa");
        const { decrypt, isEncrypted } = await import("@/lib/encryption");
        const rawSecret = user.mfaSecret ?? "";
        const secret = rawSecret && isEncrypted(rawSecret) ? decrypt(rawSecret) : rawSecret;

        const isBackup = token.length > 6;
        if (isBackup) {
          const ok = await verifyBackupCode(token, user.mfaBackupCodes ?? []);
          if (!ok) throw new Error("MFA_INVALID");
          // Consume the backup code (must use async-safe helper, not .filter with async cb)
          const { consumeBackupCode } = await import("@/lib/mfa");
          user.mfaBackupCodes = await consumeBackupCode(token, user.mfaBackupCodes ?? []);
          await user.save();
        } else {
          const ok = verifyTOTP(secret, token);
          if (!ok) throw new Error("MFA_INVALID");
        }
      }

      return {
        id: String(user._id),
        email: user.email,
        role: user.role,
        name: user.name,
        mfaEnabled: user.mfaEnabled,
      };
    },
  }),
];

// Wire SSO providers only when credentials are present
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

if (
  process.env.AZURE_AD_CLIENT_ID &&
  process.env.AZURE_AD_CLIENT_SECRET &&
  process.env.AZURE_AD_TENANT_ID
) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    /** Called after a successful OAuth sign-in — upsert the user in MongoDB. */
    async signIn({ user, account, profile }) {
      if (!account || account.type !== "oauth") return true; // credentials handled in authorize()
      try {
        const email = user.email ?? (profile as any)?.email;
        if (!email) return false;

        if (account.provider === "google") {
          const dbUser = await upsertSSOUser("googleId", account.providerAccountId, email, user.name);
          (user as any).id = dbUser.id;
          (user as any).role = dbUser.role;
          (user as any).mfaEnabled = dbUser.mfaEnabled;
        } else if (account.provider === "github") {
          const dbUser = await upsertSSOUser("githubId", account.providerAccountId, email, user.name);
          (user as any).id = dbUser.id;
          (user as any).role = dbUser.role;
          (user as any).mfaEnabled = dbUser.mfaEnabled;
        } else if (account.provider === "azure-ad") {
          const dbUser = await upsertSSOUser("azureId", account.providerAccountId, email, user.name);
          (user as any).id = dbUser.id;
          (user as any).role = dbUser.role;
          (user as any).mfaEnabled = dbUser.mfaEnabled;
        }
        return true;
      } catch {
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id ?? user.id;
        token.role = (user as any).role;
        token.mfaEnabled = (user as any).mfaEnabled ?? false;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).mfaEnabled = token.mfaEnabled;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  return await getServerSession(authOptions);
}

export function requireAuth(roles?: UserRole[]) {
  return async (req: any, res: any, next: any) => {
    const session = await getSession();
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    if (roles && !roles.includes((session.user as any).role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}
