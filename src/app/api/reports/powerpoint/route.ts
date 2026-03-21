import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RiskAnalysis from "@/models/RiskAnalysis";
import { generatePresentation } from "@/services/presentationService";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { analysisId } = await req.json();

        if (!analysisId) {
            return NextResponse.json(
                { error: "Analysis ID is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const analysis = await RiskAnalysis.findById(analysisId);
        if (!analysis) {
            return NextResponse.json(
                { error: "Analysis not found" },
                { status: 404 }
            );
        }

        const pptBuffer = await generatePresentation(analysis);

        return new NextResponse(pptBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'Content-Disposition': `attachment; filename="Risk_Assessment_${analysis.company}_${new Date().toISOString().split('T')[0]}.pptx"`,
                'Content-Length': pptBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("PowerPoint generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate PowerPoint presentation" },
            { status: 500 }
        );
    }
}