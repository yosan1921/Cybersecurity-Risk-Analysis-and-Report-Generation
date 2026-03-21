/**
 * Incident Management API (CSRARS §3.2.7, §3.8.7)
 * GET  /api/incidents  – list incidents
 * POST /api/incidents  – create incident
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Incident from '@/models/Incident';
import { writeAuditLog, buildAuditContext } from '@/services/auditLogService';
import { deliverWebhook } from '@/services/webhookService';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');

    const query: any = {};
    if (company) query.company = company;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const incidents = await Incident.find(query).sort({ reportedAt: -1 }).lean();
    return NextResponse.json({ success: true, incidents });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (!['Director', 'Division Head', 'Risk Analyst'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, severity, company, affectedAssets, assignedTo, mitigationSteps, estimatedImpact, relatedAnalysisId } = body;

    if (!title || !description || !severity || !company || !assignedTo) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();
    const incident = await Incident.create({
        title, description, severity, company,
        affectedAssets: affectedAssets ?? [],
        assignedTo,
        reportedBy: (session.user as any).email,
        mitigationSteps: mitigationSteps ?? [],
        estimatedImpact: estimatedImpact ?? 0,
        relatedAnalysisId: relatedAnalysisId ?? undefined,
        updates: [],
    });

    const ctx = buildAuditContext(session.user as any, req);
    if (ctx) await writeAuditLog(ctx, 'CREATE_INCIDENT', 'Incident', String(incident._id), { title, severity, company });

    // Fire webhook
    await deliverWebhook('incident.created', { incidentId: String(incident._id), title, severity, company });

    return NextResponse.json({ success: true, incident }, { status: 201 });
}
