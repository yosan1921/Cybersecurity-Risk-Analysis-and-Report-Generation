"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [name, setName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        if (status === "authenticated") {
            setName((session?.user as any)?.name ?? "");
        }
    }, [status]);

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

            const res = await fetch("/api/users/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
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

    if (status === "loading") {
        return <Layout><div className="flex items-center justify-center h-64 text-slate-400">Loading...</div></Layout>;
    }
    if (!session) return null;

    const user = session.user as any;

    return (
        <Layout>
            <div className="max-w-xl space-y-6">
                <h1 className="text-3xl font-bold text-white">My Profile</h1>

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
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <hr className="border-slate-700" />
                        <p className="text-sm text-slate-400 font-semibold">Change Password (optional)</p>

                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
