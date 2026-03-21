/**
 * Chat / In-app Messaging API (CSRARS §3.1.4)
 * GET  /api/chat/messages?roomId=...  – fetch messages for a room
 * POST /api/chat/messages             – send a message
 *
 * Room naming convention:
 *   director-divisionhead   → Director ↔ Division Head
 *   director-staff          → Director ↔ all Staff
 *   divisionhead-staff      → Division Head ↔ all Staff
 *   dm-<userId>-<userId>    → Direct message between two users
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import { broadcastEvent } from '@/lib/sseHub';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) return NextResponse.json({ error: 'roomId is required' }, { status: 400 });

    await dbConnect();
    const messages = await ChatMessage.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    return NextResponse.json({ success: true, messages: messages.reverse() });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { roomId, message, recipientId } = body;

    if (!roomId || !message?.trim()) {
        return NextResponse.json({ error: 'roomId and message are required' }, { status: 400 });
    }

    const user = session.user as any;
    await dbConnect();

    const chatMsg = await ChatMessage.create({
        roomId,
        senderId: user.id,
        senderName: user.name ?? user.email,
        senderRole: user.role,
        recipientId: recipientId ?? undefined,
        message: message.trim(),
        read: false,
    });

    // Broadcast via SSE so connected clients get real-time updates
    broadcastEvent('chat', {
        roomId,
        messageId: String(chatMsg._id),
        senderName: chatMsg.senderName,
        senderRole: chatMsg.senderRole,
        message: chatMsg.message,
        createdAt: chatMsg.createdAt,
    });

    return NextResponse.json({ success: true, message: chatMsg }, { status: 201 });
}
