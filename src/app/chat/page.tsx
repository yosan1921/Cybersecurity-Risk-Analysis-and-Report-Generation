"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";

interface ChatMsg {
    _id: string;
    roomId: string;
    senderName: string;
    senderRole: string;
    message: string;
    createdAt: string;
}

const ROOMS = [
    { id: "director-divisionhead", label: "Director ↔ Division Head", roles: ["Director", "Division Head"] },
    { id: "director-staff", label: "Director ↔ Staff", roles: ["Director", "Staff", "Risk Analyst"] },
    { id: "divisionhead-staff", label: "Division Head ↔ Staff", roles: ["Division Head", "Staff", "Risk Analyst"] },
];

export default function ChatPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeRoom, setActiveRoom] = useState(ROOMS[0].id);
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const userRole = (session?.user as any)?.role ?? "";

    const accessibleRooms = ROOMS.filter(r => r.roles.includes(userRole));

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status]);

    useEffect(() => {
        if (status === "authenticated") fetchMessages();
    }, [activeRoom, status]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // SSE for real-time chat
    useEffect(() => {
        if (status !== "authenticated") return;
        const es = new EventSource("/api/notifications/stream");
        es.addEventListener("chat", (e) => {
            const data = JSON.parse(e.data);
            if (data.roomId === activeRoom) {
                setMessages(prev => [...prev, {
                    _id: data.messageId,
                    roomId: data.roomId,
                    senderName: data.senderName,
                    senderRole: data.senderRole,
                    message: data.message,
                    createdAt: data.createdAt,
                }]);
            }
        });
        return () => es.close();
    }, [activeRoom, status]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat/messages?roomId=${activeRoom}`);
            const data = await res.json();
            setMessages(data.messages ?? []);
        } catch { setMessages([]); }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setSending(true);
        try {
            await fetch("/api/chat/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: activeRoom, message: input.trim() }),
            });
            setInput("");
            fetchMessages();
        } finally { setSending(false); }
    };

    if (status === "loading") {
        return <Layout><div className="flex items-center justify-center h-64 text-slate-400">Loading...</div></Layout>;
    }
    if (!session) return null;

    return (
        <Layout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white">Team Chat</h1>

                <div className="flex gap-4 h-[70vh]">
                    {/* Room list */}
                    <div className="w-56 bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-2">
                        <p className="text-xs text-slate-400 font-semibold uppercase mb-3">Channels</p>
                        {accessibleRooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoom(room.id)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition ${activeRoom === room.id ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-700"}`}
                            >
                                {room.label}
                            </button>
                        ))}
                        {accessibleRooms.length === 0 && (
                            <p className="text-xs text-slate-500">No accessible channels for your role.</p>
                        )}
                    </div>

                    {/* Chat area */}
                    <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 flex flex-col">
                        <div className="border-b border-slate-700 px-4 py-3">
                            <p className="text-white font-semibold">
                                {ROOMS.find(r => r.id === activeRoom)?.label ?? activeRoom}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 && (
                                <p className="text-slate-500 text-sm text-center mt-8">No messages yet. Start the conversation.</p>
                            )}
                            {messages.map(msg => {
                                const isOwn = msg.senderName === (session.user as any)?.name || msg.senderName === (session.user as any)?.email;
                                return (
                                    <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-100"}`}>
                                            {!isOwn && (
                                                <p className="text-xs text-slate-400 mb-1">{msg.senderName} · {msg.senderRole}</p>
                                            )}
                                            <p className="text-sm">{msg.message}</p>
                                            <p className="text-xs opacity-60 mt-1 text-right">
                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        <form onSubmit={sendMessage} className="border-t border-slate-700 p-3 flex gap-2">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message..."
                                disabled={accessibleRooms.length === 0}
                                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={sending || !input.trim() || accessibleRooms.length === 0}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
