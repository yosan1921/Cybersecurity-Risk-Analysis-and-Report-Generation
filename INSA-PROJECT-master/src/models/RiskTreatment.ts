import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskTreatment extends Document {
    analysisId: mongoose.Types.ObjectId;
    questionId: number;
    riskId: string;
    treatmentType: 'accept' | 'mitigate' | 'transfer' | 'avoid';
    status: 'planned' | 'in_progress' | 'completed' | 'overdue';
    priority: 'critical' | 'high' | 'medium' | 'low';
    assignedTo: string;
    assignedDate: Date;
    targetDate: Date;
    completedDate?: Date;
    description: string;
    mitigationActions: string[];
    cost: number;
    residualRisk: {
        likelihood: number;
        impact: number;
        riskScore: number;
        riskLevel: string;
    };
    evidence: string[];
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const RiskTreatmentSchema = new Schema({
    analysisId: { type: Schema.Types.ObjectId, ref: 'RiskAnalysis', required: true },
    questionId: { type: Number, required: true },
    riskId: { type: String, required: true },
    treatmentType: {
        type: String,
        enum: ['accept', 'mitigate', 'transfer', 'avoid'],
        required: true
    },
    status: {
        type: String,
        enum: ['planned', 'in_progress', 'completed', 'overdue'],
        default: 'planned'
    },
    priority: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        required: true
    },
    assignedTo: { type: String, required: true },
    assignedDate: { type: Date, default: Date.now },
    targetDate: { type: Date, required: true },
    completedDate: { type: Date },
    description: { type: String, required: true },
    mitigationActions: [{ type: String }],
    cost: { type: Number, default: 0 },
    residualRisk: {
        likelihood: { type: Number, min: 1, max: 5 },
        impact: { type: Number, min: 1, max: 5 },
        riskScore: { type: Number, min: 1, max: 25 },
        riskLevel: { type: String }
    },
    evidence: [{ type: String }],
    notes: { type: String }
}, {
    timestamps: true
});

export default mongoose.models.RiskTreatment || mongoose.model<IRiskTreatment>('RiskTreatment', RiskTreatmentSchema);