"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

interface Incident {
    _id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    company: string;
    assignedTo: string;
    reportedBy: string;
    reportedAt: string;
    estimatedImpact: number;
    affectedAssets: string[];
}

const SEVERITY_COLORS: Record<string, string> = {
    critical: "bg-red-900/50 text-red-300 border-red-700",
    high: "bg-orange-900/50 text-orange-300 border-orange-700",
    medium: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
    low: "bg-green-900/50 text-green-300 border-green-700",
};

const STATUS_COLORS: Record<string, string> = {
    open: "bg-red-800 text-red-200",
    investigating: "bg-orange-800 text-orange-200",
    contained: "bg-yellow-800 text-yellow-200",
    resolved: "bg-green-800 text-green-200",
    closed: "bg-slate-700 text-slate-300",
};

export default function IncidentsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: "", description: "", severity: "medium",
        company: "", assignedTo: "", estimatedImpact: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated") fetchIncidents();
    }, [status]);

    const fetchIncidents = async () => {
        try {
            const res = await fetch("/api/incidents");
            const data = await res.json();
            setIncidents(data.incidents ?? []);
        } catch { setIncidents([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    estimatedImpact: Number(form.estimatedImpact) || 0,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: "Incident reported successfully" });
                setShowForm(false);
                setForm({ title: "", description: "", severity: "medium", company: "", assignedTo: "", estimatedImpact: "" });
                fetchIncidents();
            } else {
                setMessage({ type: "error", text: data.error ?? "Failed to create incident" });
            }
        } catch {
            setMessage({ type: "error", text: "Network error" });
        } finally { setSubmitting(false); }
    };

    if (status === "loading" || loading) {
        return <Layout><div className="flex items-center justify-center h-64 text-slate-400">Loading...</div></Layout>;
    }
    if (!session) return null;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Incident Management</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition"
                    >
                        + Report Incident
                    </button>
                </div>

                {message && (
                    <div className={`px-4 py-2 rounded border ${message.type === "success" ? "bg-green-900/40 text-green-300 border-green-700" : "bg-red-900/40 text-red-300 border-red-700"}`}>
                        {message.text}
                    </div>
                )}

                {showForm && (
                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Report New Incident</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Title *</label>
                                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Company *</label>
                                    <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} required
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Severity *</label>
                                    <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm">
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Assigned To *</label>
                                    <input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} required
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Estimated Impact (USD)</label>
                                    <input type="number" value={form.estimatedImpact} onChange={e => setForm(f => ({ ...f, estimatedImpact: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-300 mb-1">Description *</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={submitting}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition disabled:opacity-50">
                                    {submitting ? "Submitting..." : "Report Incident"}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)}
                                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-medium transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-3">
                    {incidents.length === 0 ? (
                        <div className="bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg p-12 text-center">
                            <p className="text-white font-semibold">No incidents reported</p>
                            <p className="text-slate-400 text-sm mt-1">Use the button above to report a new incident</p>
                        </div>
                    ) : incidents.map(inc => (
                        <div key={inc._id} className={`bg-slate-800 rounded-lg border p-5 ${SEVERITY_COLORS[inc.severity] ?? "border-slate-700"}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white">{inc.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${STATUS_COLORS[inc.status] ?? ""}`}>
                                            {inc.status}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase border ${SEVERITY_COLORS[inc.severity] ?? ""}`}>
                                            {inc.severity}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-2">{inc.description}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-400">
                                        <span>Company: <span className="text-slate-200">{inc.company}</span></span>
                                        <span>Assigned: <span className="text-slate-200">{inc.assignedTo}</span></span>
                                        <span>Reported: <span className="text-slate-200">{new Date(inc.reportedAt).toLocaleDateString()}</span></span>
                                        {inc.estimatedImpact > 0 && (
                                            <span>Impact: <span className="text-red-300">${inc.estimatedImpact.toLocaleString()}</span></span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
