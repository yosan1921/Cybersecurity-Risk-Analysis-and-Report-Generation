import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    userEmail: string;
    userRole: string;
    action: string; // e.g. 'UPDATE_RISK_SCORE', 'GENERATE_REPORT', 'LOGIN'
    resource: string; // e.g. 'RiskAnalysis', 'Report', 'User'
    resourceId?: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userEmail: { type: String, required: true },
        userRole: { type: String, required: true },
        action: { type: String, required: true, index: true },
        resource: { type: String, required: true, index: true },
        resourceId: { type: String },
        details: { type: Schema.Types.Mixed, default: {} },
        ipAddress: { type: String },
        userAgent: { type: String },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { timestamps: false }
);

AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });

const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
