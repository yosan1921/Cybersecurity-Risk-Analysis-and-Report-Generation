/**
 * ALE / Quantitative Risk Scoring API (CSRARS §2.2.1, §2.3.2)
 * POST /api/analysis/ale
 * Body: { analysisId: string, assetValues: { [questionId]: number } }
 *
 * Returns ALE calculations for each risk item in the analysis.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import RiskAnalysis from '@/models/RiskAnalysis';
import { deriveALEFromQualitative } from '@/services/aleCalculator';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { analysisId, assetValues = {}, defaultAssetValue = 100_000 } = await req.json();

    if (!analysisId) {
        return NextResponse.json({ error: 'analysisId is required' }, { status: 400 });
    }

    await dbConnect();
    const analysis = await RiskAnalysis.findById(analysisId);
    if (!analysis) return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });

    const allRisks = [
        ...analysis.operational,
        ...analysis.tactical,
        ...analysis.strategic,
    ];

    const aleResults = allRisks.map(item => {
        const assetValue = assetValues[item.questionId] ?? defaultAssetValue;
        const ale = deriveALEFromQualitative(
            item.analysis.likelihood,
            item.analysis.impact,
            assetValue
        );
        return {
            questionId: item.questionId,
            level: item.level,
            question: item.question,
            likelihood: item.analysis.likelihood,
            impact: item.analysis.impact,
            riskScore: item.analysis.riskScore,
            riskLevel: item.analysis.riskLevel,
            assetValue,
            sle: ale.singleLossExpectancy,
            ale: ale.annualLossExpectancy,
            aro: ale.annualizedRateOfOccurrence,
            quantitativeRating: ale.riskRating,
        };
    });

    const totalALE = aleResults.reduce((sum, r) => sum + r.ale, 0);
    const totalSLE = aleResults.reduce((sum, r) => sum + r.sle, 0);

    return NextResponse.json({
        success: true,
        summary: {
            totalALE: Math.round(totalALE * 100) / 100,
            totalSLE: Math.round(totalSLE * 100) / 100,
            currency: 'USD',
        },
        items: aleResults,
    });
}
