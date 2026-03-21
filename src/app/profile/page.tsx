"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

type MFASetupState = "idle" | "scanning" | "confirming" | "done";

export default function ProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();

    // Profile form
    const [name, setName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // MFA state
    const [mfaSetupState, setMfaSetupState] = useState<MFASetupState>("idle");
    const [mfaQR, setMfaQR] = useState("");
    const [mfaSecret, setMfaSecret] = useState("");
    const [mfaToken, setMfaToken] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [mfaLoading, setMfaLoading] = useState(false);
    const [mfaMessage, setMfaMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [disablePassword, setDisablePassword] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (status === "authenticated") setName((session?.user as any)?.name ?? "");
    }, [status]);

    // ── Profile update ────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }
        setSaving(true);
        try {
            const body: any = { name };
            if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
            const res = await fetch("/api/users/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: "Profile updated successfully" });
                setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
            } else {
                setMessage({ type: "error", text: data.error ?? "Update failed" });
            }
        } catch {
            setMessage({ type: "error", text: "Network error" });
        } finally { setSaving(false); }
    };

    // ── MFA: start setup ──────────────────────────────────────────────────────
    const startMFASetup = async () => {
        setMfaLoading(true); setMfaMessage(null);
        try {
            const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
            const data = await res.json();
            if (!res.ok) { setMfaMessage({ type: "error", text: data.error }); return; }
            setMfaQR(data.qr);
            setMfaSecret(data.secret);
            setMfaSetupState("scanning");
        } catch {
            setMfaMessage({ type: "error", text: "Failed to start MFA setup" });
        } finally { setMfaLoading(false); }
    };

    // ── MFA: confirm enrollment ───────────────────────────────────────────────
    const confirmMFA = async (e: React.FormEvent) => {
        e.preventDefault();
        setMfaLoading(true); setMfaMessage(null);
        try {
            const res = await fetch("/api/auth/mfa/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: mfaToken }) });
            const data = await res.json();
            if (!res.ok) { setMfaMessage({ type: "error", text: data.error }); return; }
            setBackupCodes(data.backupCodes);
            setMfaSetupState("done");
            await update(); // refresh session so mfaEnabled reflects in UI
        } catch {
            setMfaMessage({ type: "error", text: "Verification failed" });
        } finally { setMfaLoading(false); }
    };

    // ── MFA: disable ─────────────────────────────────────────────────────────
    const disableMFA = async (e: React.FormEvent) => {
        e.preventDefault();
        setMfaLoading(true); setMfaMessage(null);
        try {
            const res = await fetch("/api/auth/mfa/disable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: disablePassword }) });
            const data = await res.json();
            if (!res.ok) { setMfaMessage({ type: "error", text: data.error }); return; }
            setMfaMessage({ type: "success", text: "MFA disabled successfully" });
            setDisablePassword("");
            await update();
        } catch {
            setMfaMessage({ type: "error", text: "Failed to disable MFA" });
        } finally { setMfaLoading(false); }
    };

    if (status === "loading") {
        return <Layout><div className="flex items-center justify-center h-64 text-slate-400">Loading...</div></Layout>;
    }
    if (!session) return null;

    const user = session.user as any;
    const mfaEnabled = user.mfaEnabled ?? false;

    return (
        <Layout>
            <div className="max-w-xl space-y-6">
                <h1 className="text-3xl font-bold text-white">My Profile</h1>

                {/* ── Profile card ── */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                    <div className="mb-6 space-y-1">
                        <p className="text-sm text-slate-400">Email</p>
                        <p className="text-white font-medium">{user.email}</p>
                        <p className="text-sm text-slate-400 mt-2">Role</p>
                        <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 border border-blue-700 rounded text-sm font-semibold">
                            {user.role}
                        </span>
                    </div>

                    {message && (
                        <div className={`mb-4 px-4 py-2 rounded border text-sm ${message.type === "success" ? "bg-green-900/40 text-green-300 border-green-700" : "bg-red-900/40 text-red-300 border-red-700"}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Display Name</label>
                            <input value={name} onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <hr className="border-slate-700" />
                        <p className="text-sm text-slate-400 font-semibold">Change Password (optional)</p>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Current Password</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <button type="submit" disabled={saving}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-50">
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* ── MFA card ── */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-semibold">Two-Factor Authentication</p>
                            <p className="text-slate-400 text-sm mt-0.5">
                                {mfaEnabled ? "MFA is active on your account." : "Add an extra layer of security."}
                            </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${mfaEnabled ? "bg-green-900/50 text-green-300 border border-green-700" : "bg-slate-700 text-slate-400 border border-slate-600"}`}>
                            {mfaEnabled ? "Enabled" : "Disabled"}
                        </span>
                    </div>

                    {mfaMessage && (
                        <div className={`px-4 py-2 rounded border text-sm ${mfaMessage.type === "success" ? "bg-green-900/40 text-green-300 border-green-700" : "bg-red-900/40 text-red-300 border-red-700"}`}>
                            {mfaMessage.text}
                        </div>
                    )}

                    {/* Not enabled — setup flow */}
                    {!mfaEnabled && mfaSetupState === "idle" && (
                        <button onClick={startMFASetup} disabled={mfaLoading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50">
                            {mfaLoading ? "Loading..." : "Enable MFA"}
                        </button>
                    )}

                    {!mfaEnabled && mfaSetupState === "scanning" && (
                        <div className="space-y-4">
                            <p className="text-slate-300 text-sm">
                                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code below.
                            </p>
                            {mfaQR && (
                                <div className="flex justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={mfaQR} alt="MFA QR Code" className="rounded border border-slate-600 bg-white p-2" width={180} height={180} />
                                </div>
                            )}
                            <details className="text-xs text-slate-500">
                                <summary className="cursor-pointer">Can&apos;t scan? Enter manually</summary>
                                <code className="block mt-1 break-all text-slate-400">{mfaSecret}</code>
                            </details>
                            <form onSubmit={confirmMFA} className="flex gap-2">
                                <input type="text" value={mfaToken} onChange={e => setMfaToken(e.target.value)}
                                    placeholder="000000" maxLength={6} required
                                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm text-center tracking-widest focus:outline-none focus:border-blue-500" />
                                <button type="submit" disabled={mfaLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50">
                                    {mfaLoading ? "..." : "Confirm"}
                                </button>
                            </form>
                        </div>
                    )}

                    {!mfaEnabled && mfaSetupState === "done" && (
                        <div className="space-y-3">
                            <p className="text-green-300 text-sm font-medium">MFA enabled successfully.</p>
                            <p className="text-slate-400 text-sm">Save these backup codes somewhere safe. Each can only be used once.</p>
                            <div className="grid grid-cols-2 gap-1">
                                {backupCodes.map((c) => (
                                    <code key={c} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 text-center tracking-widest">
                                        {c}
                                    </code>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Enabled — disable flow */}
                    {mfaEnabled && (
                        <form onSubmit={disableMFA} className="space-y-3">
                            <p className="text-slate-400 text-sm">Enter your password to disable MFA.</p>
                            <div className="flex gap-2">
                                <input type="password" value={disablePassword} onChange={e => setDisablePassword(e.target.value)}
                                    placeholder="Your password" required
                                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-red-500" />
                                <button type="submit" disabled={mfaLoading}
                                    className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md text-sm font-medium transition disabled:opacity-50">
                                    {mfaLoading ? "..." : "Disable"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
}
