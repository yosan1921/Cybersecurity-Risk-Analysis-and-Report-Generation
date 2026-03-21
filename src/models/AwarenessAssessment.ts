import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAwarenessQuestion {
    id: number;
    question: string;
    answer: string;
    category: string; // e.g. 'phishing', 'password', 'social_engineering'
    score: number; // 0-100
    feedback: string;
}

export interface IAwarenessAssessment extends Document {
    company: string;
    department: string;
    assessedBy: string;
    assessedDate: Date;
    questions: IAwarenessQuestion[];
    overallScore: number; // 0-100
    maturityLevel: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    linkedAnalysisId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AwarenessQuestionSchema = new Schema({
    id: { type: Number, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true },
    score: { type: Number, min: 0, max: 100, default: 0 },
    feedback: { type: String, default: '' },
});

const AwarenessAssessmentSchema = new Schema<IAwarenessAssessment>(
    {
        company: { type: String, required: true, index: true },
        department: { type: String, required: true },
        assessedBy: { type: String, required: true },
        assessedDate: { type: Date, default: Date.now },
        questions: [AwarenessQuestionSchema],
        overallScore: { type: Number, min: 0, max: 100, default: 0 },
        maturityLevel: {
            type: String,
            enum: ['initial', 'developing', 'defined', 'managed', 'optimizing'],
            default: 'initial',
        },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        recommendations: [{ type: String }],
        linkedAnalysisId: { type: Schema.Types.ObjectId, ref: 'RiskAnalysis' },
    },
    { timestamps: true }
);

const AwarenessAssessment: Model<IAwarenessAssessment> =
    mongoose.models.AwarenessAssessment ||
    mongoose.model<IAwarenessAssessment>('AwarenessAssessment', AwarenessAssessmentSchema);

export default AwarenessAssessment;
