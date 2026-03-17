/**
 * Level-differentiated multi-format report export (CSRARS §2.4.1–2.4.3, §2.4.5)
 * POST /api/reports/level-export
 * Body: { analysisId, level, format }
 *   level:  'strategic' | 'tactical' | 'operational'
 *   format: 'pdf' | 'docx' | 'excel' | 'powerpoint'
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import RiskAnalysis from '@/models/RiskAnalysis';
import { generateDocxReport } from '@/services/docxReportService';
import { generateExcelReport } from '@/services/excelReportService';
import { generatePDFReport } from '@/services/pdfReportService';
import { generatePresentation } from '@/services/presentationService';
import { writeAuditLog, buildAuditContext } from '@/services/auditLogService';
import { deliverWebhook } from '@/services/webhookService';

const MIME_TYPES: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    powerpoint: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const EXTENSIONS: Record<string, string> = {
    pdf: 'pdf',
    docx: 'docx',
    excel: 'xlsx',
    powerpoint: 'pptx',
};

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { analysisId, level = 'strategic', format = 'pdf' } = await req.json();

    if (!analysisId) return NextResponse.json({ error: 'analysisId is required' }, { status: 400 });

    const validLevels = ['strategic', 'tactical', 'operational'];
    const validFormats = ['pdf', 'docx', 'excel', 'powerpoint'];

    if (!validLevels.includes(level)) {
        return NextResponse.json({ error: `level must be one of: ${validLevels.join(', ')}` }, { status: 400 });
    }
    if (!validFormats.includes(format)) {
        return NextResponse.json({ error: `format must be one of: ${validFormats.join(', ')}` }, { status: 400 });
    }

    await dbConnect();
    const analysis = await RiskAnalysis.findById(analysisId);
    if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });

    let buffer: Buffer;

    switch (format) {
        case 'docx':
            buffer = await generateDocxReport(analysis, level as any);
            break;
        case 'excel':
            buffer = await generateExcelReport(analysis);
            break;
        case 'powerpoint':
            buffer = await generatePresentation(analysis);
            break;
        case 'pdf':
        default:
            buffer = await generatePDFReport(analysis);
            break;
    }

    const date = new Date().toISOString().split('T')[0];
    const filename = `CSRARS_${level}_${analysis.company}_${date}.${EXTENSIONS[format]}`;

    const ctx = buildAuditContext(session.user as any, req);
    if (ctx) {
        await writeAuditLog(ctx, 'GENERATE_REPORT', 'RiskAnalysis', analysisId, {
            level, format, company: analysis.company,
        });
    }

    await deliverWebhook('report.generated', {
        analysisId,
        level,
        format,
        company: analysis.company,
        generatedAt: new Date().toISOString(),
    });

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': MIME_TYPES[format],
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length.toString(),
        },
    });
}
