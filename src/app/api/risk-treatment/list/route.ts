import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import RiskTreatment from "@/models/RiskTreatment";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const analysisId = searchParams.get('analysisId');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedTo = searchParams.get('assignedTo');

        await dbConnect();

        // Build query
        const query: any = {};
        if (analysisId) query.analysisId = analysisId;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;

        const treatments = await RiskTreatment.find(query)
            .populate('analysisId', 'company category createdAt')
            .sort({ priority: 1, targetDate: 1 });

        // Update overdue status
        const now = new Date();
        const overdueUpdates = treatments
            .filter(t => t.status !== 'completed' && new Date(t.targetDate) < now && t.status !== 'overdue')
            .map(t => t._id);

        if (overdueUpdates.length > 0) {
            await RiskTreatment.updateMany(
                { _id: { $in: overdueUpdates } },
                { status: 'overdue' }
            );
        }

        // Refresh data after updates
        const updatedTreatments = await RiskTreatment.find(query)
            .populate('analysisId', 'company category createdAt')
            .sort({ priority: 1, targetDate: 1 });

        return NextResponse.json({
            success: true,
            treatments: updatedTreatments
        });
    } catch (error) {
        console.error("Risk treatment list error:", error);
        return NextResponse.json(
            { error: "Failed to fetch risk treatments" },
            { status: 500 }
        );
    }
}