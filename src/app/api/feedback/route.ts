/**
 * User Feedback API (CSRARS §3.7.1)
 * GET  /api/feedback  – list feedback (Director/Division Head)
 * POST /api/feedback  – submit feedback (any authenticated user)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import UserFeedback from '@/models/UserFeedback';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (!['Director', 'Division Head'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const feedback = await UserFeedback.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, feedback });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { category, rating, title, description, page } = body;

    if (!category || !rating || !title || !description) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    await dbConnect();
    const user = session.user as any;
    const feedback = await UserFeedback.create({
        userId: user.id,
        userEmail: user.email,
        category,
        rating,
        title,
        description,
        page: page ?? undefined,
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
}
