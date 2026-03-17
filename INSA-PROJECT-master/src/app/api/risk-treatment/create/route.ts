import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RiskTreatment from "@/models/RiskTreatment";
import { calculateRiskScore, getRiskLevel } from "@/utils/ai";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            analysisId,
            questionId,
            riskId,
            treatmentType,
            priority,
            assignedTo,
            targetDate,
            description,
            mitigationActions,
            cost,
            residualLikelihood,
            residualImpact
        } = body;

        // Validate required fields
        if (!analysisId || !questionId || !riskId || !treatmentType || !assignedTo || !targetDate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Calculate residual risk if provided
        let residualRisk = null;
        if (residualLikelihood && residualImpact) {
            const riskScore = calculateRiskScore(residualLikelihood, residualImpact);
            const riskLevel = getRiskLevel(residualLikelihood, residualImpact);
            residualRisk = {
                likelihood: residualLikelihood,
                impact: residualImpact,
                riskScore,
                riskLevel: riskLevel.riskLevel
            };
        }

        const treatment = new RiskTreatment({
            analysisId,
            questionId,
            riskId,
            treatmentType,
            priority,
            assignedTo,
            targetDate: new Date(targetDate),
            description,
            mitigationActions: mitigationActions || [],
            cost: cost || 0,
            residualRisk,
            evidence: [],
            notes: ''
        });

        await treatment.save();

        return NextResponse.json({
            success: true,
            treatment
        });
    } catch (error) {
        console.error("Risk treatment creation error:", error);
        return NextResponse.json(
            { error: "Failed to create risk treatment" },
            { status: 500 }
        );
    }
}