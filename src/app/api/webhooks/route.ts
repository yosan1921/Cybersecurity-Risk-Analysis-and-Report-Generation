/**
 * Webhook Subscription Management API (CSRARS §3.5.7)
 * GET    /api/webhooks  – list subscriptions
 * POST   /api/webhooks  – create subscription
 * DELETE /api/webhooks?id=...  – delete subscription
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import WebhookSubscription from '@/models/WebhookSubscription';
import crypto from 'crypto';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (!['Director', 'Division Head', 'Risk Analyst'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const subs = await WebhookSubscription.find({ createdBy: (session.user as any).id })
        .select('-secret')
        .lean();

    return NextResponse.json({ success: true, subscriptions: subs });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (!['Director', 'Division Head', 'Risk Analyst'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { url, events } = body;

    if (!url || !Array.isArray(events) || events.length === 0) {
        return NextResponse.json({ error: 'url and events[] are required' }, { status: 400 });
    }

    try { new URL(url); } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    await dbConnect();
    const secret = crypto.randomBytes(32).toString('hex');
    const sub = await WebhookSubscription.create({
        url,
        events,
        secret,
        createdBy: (session.user as any).id,
    });

    return NextResponse.json({
        success: true,
        subscription: { ...sub.toObject(), secret }, // Return secret once on creation
    }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await dbConnect();
    const sub = await WebhookSubscription.findOneAndDelete({
        _id: id,
        createdBy: (session.user as any).id,
    });

    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
}
