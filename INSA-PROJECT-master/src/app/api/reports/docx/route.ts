/**
 * DOCX Report Export API (CSRARS §2.4.5)
 * POST /api/reports/docx
 * Body: { analysisId: string, level: 'strategic' | 'tactical' | 'operational' }
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import RiskAnalysis from '@/models/RiskAnalysis';
import { generateDocxReport } from '@/services/docxReportService';
import { writeAuditLog, buildAuditContext } from '@/services/auditLogService';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { analysisId, level = 'strategic' } = await req.json();

    if (!analysisId) {
        return NextResponse.json({ error: 'analysisId is required' }, { status: 400 });
    }

    const validLevels = ['strategic', 'tactical', 'operational', 'awareness'];
    if (!validLevels.includes(level)) {
        return NextResponse.json({ error: `level must be one of: ${validLevels.join(', ')}` }, { status: 400 });
    }

    await dbConnect();
    const analysis = await RiskAnalysis.findById(analysisId);
    if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });

    const buffer = await generateDocxReport(analysis, level);
    const filename = `CSRARS_${level}_Report_${analysis.company}_${new Date().toISOString().split('T')[0]}.docx`;

    const ctx = buildAuditContext(session.user as any, req);
    if (ctx) await writeAuditLog(ctx, 'GENERATE_DOCX_REPORT', 'RiskAnalysis', analysisId, { level, company: analysis.company });

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length.toString(),
        },
    });
}
