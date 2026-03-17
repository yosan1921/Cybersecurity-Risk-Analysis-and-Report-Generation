"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

interface AuditLog {
    _id: string;
    userEmail: string;
    userRole: string;
    action: string;
    resource: string;
    resourceId?: string;
    details: Record<string, any>;
    ipAddress?: string;
    timestamp: string;
}

export default function AuditPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState("");
    const [resourceFilter, setResourceFilter] = useState("");

    const role = (session?.user as any)?.role;

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated") {
            if (!["Director", "Division Head"].includes(role)) {
                router.push("/dashboard");
            } else {
                fetchLogs();
            }
        }
    }, [status, page, actionFilter, resourceFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: "50" });
            if (actionFilter) params.set("action", actionFilter);
            if (resourceFilter) params.set("resource", resourceFilter);
            const res = await fetch(`/api/audit/logs?${params}`);
            const data = await res.json();
            setLogs(data.logs ?? []);
            setTotal(data.total ?? 0);
        } catch { setLogs([]); }
        finally { setLoading(false); }
    };

    if (status === "loading" || loading) {
        return <Layout><div className="flex items-center justify-center h-64 text-slate-400">Loading...</div></Layout>;
    }
    if (!session) return null;

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
                <p className="text-slate-400 text-sm">All system actions are logged and timestamped for compliance (CSRARS §3.6.2, §4.2)</p>

                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Filter by Action</label>
                            <input value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                                placeholder="e.g. GENERATE_REPORT"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Filter by Resource</label>
                            <input value={resourceFilter} onChange={e => { setResourceFilter(e.target.value); setPage(1); }}
                                placeholder="e.g. RiskAnalysis"
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
                    <table className="min-w-full text-xs text-left text-slate-300">
                        <thead className="border-b border-slate-700">
                            <tr>
                                {["Timestamp", "User", "Role", "Action", "Resource", "Resource ID", "IP"].map(h => (
                                    <th key={h} className="px-4 py-3 font-semibold text-slate-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No audit logs found</td></tr>
                            ) : logs.map(log => (
                                <tr key={log._id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                    <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-4 py-2">{log.userEmail}</td>
                                    <td className="px-4 py-2">{log.userRole}</td>
                                    <td className="px-4 py-2 font-mono text-blue-300">{log.action}</td>
                                    <td className="px-4 py-2">{log.resource}</td>
                                    <td className="px-4 py-2 font-mono text-slate-500 text-xs">{log.resourceId ?? "—"}</td>
                                    <td className="px-4 py-2 text-slate-500">{log.ipAddress ?? "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center text-sm text-slate-400">
                    <span>Total: {total} entries</span>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-40">← Prev</button>
                        <span className="px-3 py-1">Page {page}</span>
                        <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 50}
                            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-40">Next →</button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
