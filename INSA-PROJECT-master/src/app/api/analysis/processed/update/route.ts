import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { AnalysisService } from "@/services/updateanalysisService";

export async function PATCH(request: Request) {
  try {
    // Add authentication check
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      analysisId,
      level,
      questionId,
      likelihood,
      impact,
      gap,
      threat,
      mitigation,
      impactLabel,
      likelihoodLabel,
      impactDescription,
    } = body;

    // Enhanced validation
    if (!analysisId || !level || typeof questionId !== "number") {
      return NextResponse.json(
        { error: "analysisId, level and questionId are required" },
        { status: 400 }
      );
    }

    // Validate likelihood and impact ranges
    if (likelihood !== undefined && (likelihood < 1 || likelihood > 5 || !Number.isInteger(likelihood))) {
      return NextResponse.json(
        { error: "Likelihood must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    if (impact !== undefined && (impact < 1 || impact > 5 || !Number.isInteger(impact))) {
      return NextResponse.json(
        { error: "Impact must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate text field lengths
    if (gap && gap.length > 500) {
      return NextResponse.json(
        { error: "Gap description must be less than 500 characters" },
        { status: 400 }
      );
    }

    if (threat && threat.length > 500) {
      return NextResponse.json(
        { error: "Threat description must be less than 500 characters" },
        { status: 400 }
      );
    }

    if (mitigation && mitigation.length > 500) {
      return NextResponse.json(
        { error: "Mitigation description must be less than 500 characters" },
        { status: 400 }
      );
    }

    const updated = await AnalysisService.updateQuestionAnalysis({
      analysisId,
      level,
      questionId,
      likelihood,
      impact,
      gap,
      threat,
      mitigation,
      impactLabel,
      likelihoodLabel,
      impactDescription,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Analysis or question not found" },
        { status: 404 }
      );
    }

    // Option A: return the full updated analysis document
    // Option B: re-use your processed shape – here is Option B:

    const allAnalyses = [
      ...(updated.operational || []),
      ...(updated.tactical || []),
      ...(updated.strategic || []),
    ];

    const riskMatrix: { [key: string]: number } = {};
    allAnalyses.forEach((item: any) => {
      const key = `${item.analysis.likelihood}-${item.analysis.impact}`;
      riskMatrix[key] = (riskMatrix[key] || 0) + 1;
    });

    const riskMatrixArray = Object.entries(riskMatrix).map(
      ([key, count]) => {
        const [likelihood, impact] = key.split("-").map(Number);
        return { likelihood, impact, count };
      }
    );

    const formattedAnalysis = {
      _id: String(updated._id),
      company: updated.company,
      category: updated.category,
      date: updated.createdAt,
      analyses: allAnalyses.map((a: any) => ({
        questionId: a.questionId,
        level: a.level,
        question: a.question,
        answer: a.answer,
        likelihood: a.analysis?.likelihood || 0,
        impact: a.analysis?.impact || 0,
        riskScore: a.analysis?.riskScore || 0,
        riskLevel: a.analysis?.riskLevel || "UNKNOWN",
        gap: a.analysis?.gap || "",
        threat: a.analysis?.threat || "",
        mitigation: a.analysis?.mitigation || "",
        impactLabel: a.analysis?.impactLabel || "",
        impactDescription: a.analysis?.impactDescription || "",
      })),
      riskMatrix: riskMatrixArray,
      summary: updated.summary,
    };

    return NextResponse.json({
      success: true,
      assessment: formattedAnalysis,
    });
  } catch (error) {
    console.error("Error updating processed analysis:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message || "Failed to update analysis" },
      { status: 500 }
    );
  }
}
