/**
 * Asset Inventory API (CSRARS §2.1.2, §2.2.6)
 * GET  /api/assets  – list assets
 * POST /api/assets  – create asset
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Asset from '@/models/Asset';
import { writeAuditLog, buildAuditContext } from '@/services/auditLogService';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');
    const criticality = searchParams.get('criticality');

    const query: any = {};
    if (company) query.company = company;
    if (criticality) query.criticality = criticality;

    const assets = await Asset.find(query).sort({ criticality: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, assets });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, type, description, owner, company, criticality, value, location, ipAddress, tags } = body;

    if (!name || !type || !owner || !company || !criticality) {
        return NextResponse.json({ error: 'Missing required fields: name, type, owner, company, criticality' }, { status: 400 });
    }

    await dbConnect();
    const asset = await Asset.create({
        name, type, description, owner, company, criticality,
        value: value ?? 0,
        location, ipAddress,
        tags: tags ?? [],
        createdBy: (session.user as any).id,
    });

    const ctx = buildAuditContext(session.user as any, req);
    if (ctx) await writeAuditLog(ctx, 'CREATE_ASSET', 'Asset', String(asset._id), { name, company });

    return NextResponse.json({ success: true, asset }, { status: 201 });
}
