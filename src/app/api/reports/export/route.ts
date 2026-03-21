import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RiskAnalysis from "@/models/RiskAnalysis";
import { generateReport, getAvailableFormats } from "@/services/reportingService";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { analysisId, format } = await req.json();

    if (!analysisId || !format) {
      return NextResponse.json(
        { error: "Analysis ID and format are required" },
        { status: 400 }
      );
    }

    const availableFormats = getAvailableFormats();
    if (!availableFormats.includes(format)) {
      return NextResponse.json(
        { error: `Invalid format. Available formats: ${availableFormats.join(', ')}` },
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

    const report = await generateReport(analysis, {
      format,
      includeExecutiveSummary: true,
      includeDetailedFindings: true,
      includeRecommendations: true,
      includeCharts: true
    });

    return new NextResponse(report.buffer, {
      status: 200,
      headers: {
        'Content-Type': report.mimeType,
        'Content-Disposition': `attachment; filename="${report.filename}"`,
        'Content-Length': report.buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    const message = error instanceof Error ? error.message : 'Failed to generate report';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const availableFormats = getAvailableFormats();
    return NextResponse.json({
      success: true,
      availableFormats
    });
  } catch (error) {
    console.error("Error fetching available formats:", error);
    return NextResponse.json(
      { error: "Failed to fetch available formats" },
      { status: 500 }
    );
  }
}