import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RiskAnalysis from "@/models/RiskAnalysis";
import { generatePDFReport } from "@/services/pdfReportService";

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

        const pdfBuffer = await generatePDFReport(analysis);

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Risk_Assessment_${analysis.company}_${new Date().toISOString().split('T')[0]}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error("PDF report generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate PDF report" },
            { status: 500 }
        );
    }
}