/**
 * Audit Log API (CSRARS §3.6.2, §4.2)
 * GET  /api/audit/logs  – retrieve audit logs (Director/Division Head only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (!['Director', 'Division Head'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(100, Number(searchParams.get('limit') ?? 50));
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const userId = searchParams.get('userId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const query: any = {};
    if (action) query.action = { $regex: action, $options: 'i' };
    if (resource) query.resource = resource;
    if (userId) query.userId = userId;
    if (from || to) {
        query.timestamp = {};
        if (from) query.timestamp.$gte = new Date(from);
        if (to) query.timestamp.$lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
        AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        AuditLog.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, logs, total, page, limit });
}
