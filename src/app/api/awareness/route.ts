/**
 * Human Awareness Assessment API (CSRARS §2.4.4)
 * GET  /api/awareness  – list awareness assessments
 * POST /api/awareness  – create awareness assessment
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AwarenessAssessment from '@/models/AwarenessAssessment';
import { writeAuditLog, buildAuditContext } from '@/services/auditLogService';

function deriveMaturityLevel(score: number): string {
    if (score >= 90) return 'optimizing';
    if (score >= 75) return 'managed';
    if (score >= 60) return 'defined';
    if (score >= 40) return 'developing';
    return 'initial';
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company');

    const query: any = {};
    if (company) query.company = company;

    const assessments = await AwarenessAssessment.find(query).sort({ assessedDate: -1 }).lean();
    return NextResponse.json({ success: true, assessments });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (!['Director', 'Division Head', 'Risk Analyst'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { company, department, questions, linkedAnalysisId } = body;

    if (!company || !department || !Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: 'Missing required fields: company, department, questions' }, { status: 400 });
    }

    // Calculate overall score
    const overallScore = Math.round(
        questions.reduce((sum: number, q: any) => sum + (q.score ?? 0), 0) / questions.length
    );

    // Derive strengths and weaknesses
    const strengths = questions
        .filter((q: any) => q.score >= 70)
        .map((q: any) => q.category)
        .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

    const weaknesses = questions
        .filter((q: any) => q.score < 50)
        .map((q: any) => q.category)
        .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

    const recommendations = weaknesses.map((w: string) =>
        `Improve ${w} awareness through targeted training and simulations`
    );

    await dbConnect();
    const assessment = await AwarenessAssessment.create({
        company,
        department,
        assessedBy: (session.user as any).email,
        questions,
        overallScore,
        maturityLevel: deriveMaturityLevel(overallScore),
        strengths,
        weaknesses,
        recommendations,
        linkedAnalysisId: linkedAnalysisId ?? undefined,
    });

    const ctx = buildAuditContext(session.user as any, req);
    if (ctx) await writeAuditLog(ctx, 'CREATE_AWARENESS_ASSESSMENT', 'AwarenessAssessment', String(assessment._id), { company, overallScore });

    return NextResponse.json({ success: true, assessment }, { status: 201 });
}
