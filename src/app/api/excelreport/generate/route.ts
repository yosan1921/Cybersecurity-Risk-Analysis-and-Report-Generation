import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RiskAnalysis from "@/models/RiskAnalysis";
import { generateExcelReport } from "@/services/excelReportService";

export async function POST(request: Request) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { analysisId } = body;

    // Validate input
    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: "analysisId is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the risk analysis
    const analysis = await RiskAnalysis.findById(analysisId);
    if (!analysis) {
      return NextResponse.json(
        { success: false, error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Generate Excel report
    const excelBuffer = await generateExcelReport(analysis);

    // Return Excel file
    return new NextResponse(new Uint8Array(excelBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Risk_Analysis_${analysis.company}_${new Date().toISOString().split("T")[0]}.xlsx"`,
        "Content-Length": excelBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating Excel report:", error);
    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: message || "Failed to generate Excel report",
      },
      { status: 500 }
    );
  }
}
