/**
 * Incident detail/update API
 * GET   /api/incidents/[id]  – get single incident
 * PATCH /api/incidents/[id]  – update status / add update note
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Incident from '@/models/Incident';
import { writeAuditLog, buildAuditContext } from '@/services/auditLogService';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const incident = await Incident.findById(params.id).lean();
    if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, incident });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { status, note, resolvedAt, lessonsLearned } = body;

    const incident = await Incident.findById(params.id);
    if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (status) incident.status = status;
    if (lessonsLearned) incident.lessonsLearned = lessonsLearned;
    if (resolvedAt) incident.resolvedAt = new Date(resolvedAt);

    if (note && status) {
        incident.updates.push({
            updatedBy: (session.user as any).email,
            note,
            status,
            timestamp: new Date(),
        });
    }

    await incident.save();

    const ctx = buildAuditContext(session.user as any, req);
    if (ctx) await writeAuditLog(ctx, 'UPDATE_INCIDENT', 'Incident', params.id, { status, note });

    return NextResponse.json({ success: true, incident });
}
