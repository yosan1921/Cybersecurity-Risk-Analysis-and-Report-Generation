/**
 * POST /api/auth/mfa/verify
 * Confirms MFA enrollment by verifying the first TOTP token.
 * Activates MFA and returns one-time backup codes.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyTOTP, generateBackupCodes } from "@/lib/mfa";
import { decrypt } from "@/lib/encryption";
import { writeAuditLog, buildAuditContext } from "@/services/auditLogService";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Token is required" }, { status: 400 });

    await dbConnect();
    const user = await User.findById((session.user as any).id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.mfaPending || !user.mfaSecret) {
        return NextResponse.json({ error: "No pending MFA setup found" }, { status: 400 });
    }

    const valid = verifyTOTP(decrypt(user.mfaSecret), token.trim());
    if (!valid) {
        return NextResponse.json({ error: "Invalid token — check your authenticator app" }, { status: 400 });
    }

    const { plain, hashed } = await generateBackupCodes();
    user.mfaEnabled = true;
    user.mfaPending = false;
    user.mfaBackupCodes = hashed;
    await user.save();

    const ctx = buildAuditContext(session.user as any, req);
    if (ctx) await writeAuditLog(ctx, "MFA_ENABLED", "User", String(user._id));

    return NextResponse.json({ success: true, backupCodes: plain });
}
