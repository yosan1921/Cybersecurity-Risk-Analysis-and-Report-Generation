"use client";
import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "credentials" | "mfa";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── credentials submit ────────────────────────────────────────────────────
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // First attempt without MFA token to detect if MFA is required
      const result = await signIn("credentials", {
        email,
        password,
        mfaToken: "",
        redirect: false,
      });

      if (result?.error === "MFA_REQUIRED") {
        setStep("mfa");
      } else if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── MFA submit ────────────────────────────────────────────────────────────
  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        mfaToken: mfaToken.trim(),
        redirect: false,
      });

      if (result?.error === "MFA_INVALID") {
        setError("Invalid code. Try again or use a backup code.");
      } else if (result?.error) {
        setError("Authentication failed. Please start over.");
        setStep("credentials");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── SSO ───────────────────────────────────────────────────────────────────
  const handleSSO = (provider: string) => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="w-20 h-5 mx-auto mb-8 flex items-center justify-center">
          <Image src="/logo2.png" alt="CSRARS Logo" width={240} height={80}
            className="object-contain" style={{ height: "auto" }} priority />
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-8 border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            {step === "mfa" ? "Two-Factor Authentication" : "Login"}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* ── Step 1: credentials ── */}
          {step === "credentials" && (
            <>
              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input id="email" type="email" value={email} required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <input id="password" type="password" value={password} required
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-50">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              {/* SSO divider */}
              <div className="my-5 flex items-center gap-3">
                <hr className="flex-1 border-slate-600" />
                <span className="text-slate-500 text-xs">or continue with</span>
                <hr className="flex-1 border-slate-600" />
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => handleSSO("google")}
                  className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-md transition text-sm font-medium">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </button>

                <button onClick={() => handleSSO("github")}
                  className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-md transition text-sm font-medium">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  Sign in with GitHub
                </button>
              </div>

              <p className="mt-4 text-center text-slate-400 text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link>
              </p>
            </>
          )}

          {/* ── Step 2: MFA challenge ── */}
          {step === "mfa" && (
            <form onSubmit={handleMFA} className="space-y-4">
              <p className="text-slate-400 text-sm text-center">
                Enter the 6-digit code from your authenticator app, or a backup code.
              </p>
              <div>
                <label htmlFor="mfaToken" className="block text-sm font-medium text-slate-300 mb-2">
                  Authentication Code
                </label>
                <input id="mfaToken" type="text" value={mfaToken} required autoFocus
                  onChange={(e) => setMfaToken(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000000" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition disabled:opacity-50">
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button type="button" onClick={() => { setStep("credentials"); setMfaToken(""); setError(""); }}
                className="w-full py-2 px-4 bg-transparent border border-slate-600 text-slate-400 hover:text-white rounded-md transition text-sm">
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
