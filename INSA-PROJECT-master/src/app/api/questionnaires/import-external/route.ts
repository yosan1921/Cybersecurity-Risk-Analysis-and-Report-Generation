import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Questionnaire from "@/models/Questionnaire";
import { performRiskAnalysis } from "@/services/riskAnalyzer";

export async function POST(req: NextRequest) {
    try {
        // Add authentication check
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        let questionnaireData = body.questionnaire || body.data || body;

        // Enhanced validation
        if (!questionnaireData || typeof questionnaireData !== 'object') {
            return NextResponse.json(
                { error: "Invalid JSON format. Please provide a valid questionnaire object." },
                { status: 400 }
            );
        }

        // Sanitize input data
        if (questionnaireData.title) {
            questionnaireData.title = String(questionnaireData.title).substring(0, 200);
        }
        if (questionnaireData.company) {
            questionnaireData.company = String(questionnaireData.company).substring(0, 200);
        }

        // Transform the data to match internal format
        const transformedData = transformQuestionnaireData(questionnaireData);

        // Validate required fields
        if (!transformedData.title || !transformedData.company || !transformedData.questions?.length) {
            return NextResponse.json(
                { error: "Missing required fields: title, company, and questions are required." },
                { status: 400 }
            );
        }

        // Generate unique external ID if not provided
        const externalId = transformedData.externalId ||
            `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Check if questionnaire already exists
        const existing = await Questionnaire.findOne({ externalId });
        if (existing) {
            return NextResponse.json({
                success: false,
                error: "Questionnaire already exists",
                questionnaire: existing,
            });
        }

        // Determine category based on question levels
        const questions = transformedData.questions;
        const levelCounts = {
            operational: questions.filter((q: any) => q.level === "operational").length,
            tactical: questions.filter((q: any) => q.level === "tactical").length,
            strategic: questions.filter((q: any) => q.level === "strategic").length,
        };
        const category = Object.entries(levelCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

        // Create new questionnaire
        const newQuestionnaire = new Questionnaire({
            externalId,
            title: transformedData.title,
            company: transformedData.company,
            filledBy: transformedData.filledBy || "Unknown",
            role: transformedData.role || "Unknown",
            filledDate: transformedData.filledDate ? new Date(transformedData.filledDate) : new Date(),
            category,
            status: "pending",
            questions: questions.map((q: any, index: number) => ({
                id: q.id || index + 1,
                question: q.question,
                answer: q.answer || "",
                section: q.section || "General",
                level: q.level || "operational"
            }))
        });

        const savedQuestionnaire = await newQuestionnaire.save();

        // Trigger risk analysis if API key is available
        const openRouterApiKey = process.env.OPENROUTER_API_KEY;
        if (openRouterApiKey && questions.some((q: any) => q.answer)) {
            try {
                await performRiskAnalysis(savedQuestionnaire._id.toString());
            } catch (analysisError) {
                console.warn("Risk analysis failed:", analysisError);
            }
        }

        return NextResponse.json({
            success: true,
            message: "Questionnaire imported successfully",
            questionnaire: {
                _id: savedQuestionnaire._id,
                title: savedQuestionnaire.title,
                company: savedQuestionnaire.company,
                questionCount: savedQuestionnaire.questions.length,
                status: savedQuestionnaire.status
            }
        });

    } catch (error) {
        console.error("Import error:", error);
        const message = error instanceof Error ? error.message : String(error);

        // Handle JSON parsing errors specifically
        if (message.includes("Unexpected token")) {
            return NextResponse.json(
                { error: "Invalid JSON format. Please check your JSON syntax." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: message || "Failed to import questionnaire" },
            { status: 500 }
        );
    }
}

function transformQuestionnaireData(data: any) {
    // Handle your specific JSON format
    if (data.sections && Array.isArray(data.sections)) {
        const questions: any[] = [];

        data.sections.forEach((section: any) => {
            if (section.questions && Array.isArray(section.questions)) {
                section.questions.forEach((q: any, index: number) => {
                    questions.push({
                        id: questions.length + 1,
                        question: q.questionText || q.question || q.text,
                        answer: q.answer || q.response || "",
                        section: section.sectionTitle || section.title || "General",
                        level: q.level || "operational"
                    });
                });
            }
        });

        return {
            externalId: data.id || data.externalId,
            title: data.title,
            company: data.company,
            filledBy: data.filledBy,
            role: data.role,
            filledDate: data.filledDate,
            questions
        };
    }

    // Handle flat question array format
    if (data.questions && Array.isArray(data.questions)) {
        return {
            externalId: data.id || data.externalId,
            title: data.title,
            company: data.company,
            filledBy: data.filledBy,
            role: data.role,
            filledDate: data.filledDate,
            questions: data.questions.map((q: any, index: number) => ({
                id: index + 1,
                question: q.questionText || q.question || q.text,
                answer: q.answer || q.response || "",
                section: q.section || "General",
                level: q.level || "operational"
            }))
        };
    }

    // Return as-is if already in correct format
    return data;
}