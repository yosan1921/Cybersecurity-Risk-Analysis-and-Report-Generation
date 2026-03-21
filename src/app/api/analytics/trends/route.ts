import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateTrendAnalysis } from "@/services/trendAnalyzer";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const company = searchParams.get('company');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const startDateObj = startDate ? new Date(startDate) : undefined;
        const endDateObj = endDate ? new Date(endDate) : undefined;

        const trendAnalysis = await generateTrendAnalysis(
            company || undefined,
            startDateObj,
            endDateObj
        );

        return NextResponse.json({
            success: true,
            analysis: trendAnalysis
        });
    } catch (error) {
        console.error("Trend analysis error:", error);
        return NextResponse.json(
            { error: "Failed to generate trend analysis" },
            { status: 500 }
        );
    }
}