import mongoose, { Schema, Document, Model } from 'mongoose';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';

export interface IIncidentUpdate {
    updatedBy: string;
    note: string;
    status: IncidentStatus;
    timestamp: Date;
}

export interface IIncident extends Document {
    title: string;
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    company: string;
    affectedAssets: string[];
    relatedAnalysisId?: mongoose.Types.ObjectId;
    assignedTo: string;
    reportedBy: string;
    reportedAt: Date;
    resolvedAt?: Date;
    updates: IIncidentUpdate[];
    mitigationSteps: string[];
    lessonsLearned?: string;
    estimatedImpact: number; // monetary
    createdAt: Date;
    updatedAt: Date;
}

const IncidentUpdateSchema = new Schema({
    updatedBy: { type: String, required: true },
    note: { type: String, required: true },
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const IncidentSchema = new Schema<IIncident>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        severity: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
            required: true,
        },
        status: {
            type: String,
            enum: ['open', 'investigating', 'contained', 'resolved', 'closed'],
            default: 'open',
        },
        company: { type: String, required: true, index: true },
        affectedAssets: [{ type: String }],
        relatedAnalysisId: { type: Schema.Types.ObjectId, ref: 'RiskAnalysis' },
        assignedTo: { type: String, required: true },
        reportedBy: { type: String, required: true },
        reportedAt: { type: Date, default: Date.now },
        resolvedAt: { type: Date },
        updates: [IncidentUpdateSchema],
        mitigationSteps: [{ type: String }],
        lessonsLearned: { type: String },
        estimatedImpact: { type: Number, default: 0 },
    },
    { timestamps: true }
);

IncidentSchema.index({ company: 1, status: 1, severity: 1 });

const Incident: Model<IIncident> =
    mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);

export default Incident;
