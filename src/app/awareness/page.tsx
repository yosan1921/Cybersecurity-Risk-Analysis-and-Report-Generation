"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { useRBAC } from "@/hooks/useRBAC";

interface AwarenessAssessment {
    _id: string;
    company: string;
    department: string;
    assessedBy: string;
    assessedDate: string;
    overallScore: number;
    maturityLevel: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

const MATURITY_COLORS: Record<string, string> = {
    initial: "text-red-400",
    developing: "text-orange-400",
    defined: "text-yellow-400",
    managed: "text-blue-400",
    optimizing: "text-green-400",
};

export default function AwarenessPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { can } = useRBAC();
    const [assessments, setAssessments] = useState<AwarenessAssessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [company, setCompany] = useState("");
    const [department, setDepartment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Simple awareness questions
    const defaultQuestions = [
        { id: 1, question: "Does the organization conduct regular phishing simulations?", category: "phishing", score: 0 },
        { id: 2, question: "Are employees trained on password management best practices?", category: "password", score: 0 },
        { id: 3, question: "Is there a formal security awareness training program?", category: "training", score: 0 },
        { id: 4, question: "Do employees know how to report suspicious activity?", category: "incident_reporting", score: 0 },
        { id: 5, question: "Is social engineering awareness included in training?", category: "social_engineering", score: 0 },
    ];
    const [questions, setQuestions] = useState(defaultQuestions.map(q => ({ ...q, answer: "" })));

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated") fetchAssessments();
    }, [status]);

    const fetchAssessments = async () => {
        try {
            const res = await fetch("/api/awareness");
            const data = await res.json();
            setAssessments(data.assessments ?? []);
        } catch { setAssessments([]); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const scoredQuestions = questions.map(q => ({
                ...q,
                score: q.answer.toLowerCase().includes("yes") ? 80 :
                    q.answer.toLowerCase().includes("partial") ? 50 : 20,
                feedback: q.answer.toLowerCase().includes("yes")
                    ? "Good practice in place"
                    : "Improvement needed",
            }));
            const res = await fetch("/api/awareness", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company, department, questions: scoredQuestions }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: "success", text: "Awareness assessment submitted" });
                setShowForm(false);
                fetchAssessments();
            } else {
                setMessage({ type: "error", text: data.error ?? "Failed" });
            }
        } catch { setMessage({ type: "error", text: "Network error" }); }
        finally { setSubmitting(false); }
    };

    if (status === "loading" || loading) {
        return <Layout><div className="flex items-center justify-center h-64 text-slate-400">Loading...</div></Layout>;
    }
    if (!session) return null;

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">Human Awareness Assessments</h1>
                    {can("CREATE_AWARENESS") && (
                        <button onClick={() => setShowForm(!showForm)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition">
                            + New Assessment
                        </button>
                    )}
                </div>

                {message && (
                    <div className={`px-4 py-2 rounded border text-sm ${message.type === "success" ? "bg-green-900/40 text-green-300 border-green-700" : "bg-red-900/40 text-red-300 border-red-700"}`}>
                        {message.text}
                    </div>
                )}

                {showForm && (
                    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                        <h2 className="text-xl font-bold text-white mb-4">New Awareness Assessment</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Company *</label>
                                    <input value={company} onChange={e => setCompany(e.target.value)} required
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-1">Department *</label>
                                    <input value={department} onChange={e => setDepartment(e.target.value)} required
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm" />
                                </div>
                            </div>
                            {questions.map((q, i) => (
                                <div key={q.id} className="bg-slate-900/50 rounded p-4">
                                    <p className="text-sm text-white mb-2">{q.question}</p>
                                    <select value={q.answer} onChange={e => setQuestions(prev => prev.map((pq, pi) => pi === i ? { ...pq, answer: e.target.value } : pq))}
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm">
                                        <option value="">Select answer...</option>
                                        <option value="Yes">Yes – fully implemented</option>
                                        <option value="Partial">Partial – in progress</option>
                                        <option value="No">No – not implemented</option>
                                    </select>
                                </div>
                            ))}
                            <div className="flex gap-3">
                                <button type="submit" disabled={submitting}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition disabled:opacity-50">
                                    {submitting ? "Submitting..." : "Submit Assessment"}
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
                    {assessments.length === 0 ? (
                        <div className="bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg p-12 text-center">
                            <p className="text-white font-semibold">No awareness assessments yet</p>
                        </div>
                    ) : assessments.map(a => (
                        <div key={a._id} className="bg-slate-800 rounded-lg border border-slate-700 p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{a.company} – {a.department}</h3>
                                    <p className="text-sm text-slate-400 mt-1">Assessed by {a.assessedBy} on {new Date(a.assessedDate).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-white">{a.overallScore}<span className="text-lg text-slate-400">/100</span></p>
                                    <p className={`text-sm font-semibold capitalize ${MATURITY_COLORS[a.maturityLevel] ?? "text-slate-400"}`}>
                                        {a.maturityLevel}
                                    </p>
                                </div>
                            </div>
                            {a.weaknesses.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs text-slate-400 mb-1">Areas needing improvement:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {a.weaknesses.map(w => (
                                            <span key={w} className="px-2 py-0.5 bg-red-900/40 text-red-300 border border-red-700 rounded text-xs">{w}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
