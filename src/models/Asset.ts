import mongoose, { Schema, Document, Model } from 'mongoose';

export type AssetType = 'hardware' | 'software' | 'data' | 'network' | 'personnel' | 'facility';
export type AssetCriticality = 'critical' | 'high' | 'medium' | 'low';

export interface IAsset extends Document {
    name: string;
    type: AssetType;
    description: string;
    owner: string;
    company: string;
    criticality: AssetCriticality;
    value: number; // monetary value for ALE calculation
    location?: string;
    ipAddress?: string;
    vulnerabilities: string[];
    associatedRisks: mongoose.Types.ObjectId[];
    tags: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['hardware', 'software', 'data', 'network', 'personnel', 'facility'],
            required: true,
        },
        description: { type: String, default: '' },
        owner: { type: String, required: true },
        company: { type: String, required: true, index: true },
        criticality: {
            type: String,
            enum: ['critical', 'high', 'medium', 'low'],
            required: true,
        },
        value: { type: Number, default: 0 },
        location: { type: String },
        ipAddress: { type: String },
        vulnerabilities: [{ type: String }],
        associatedRisks: [{ type: Schema.Types.ObjectId, ref: 'RiskAnalysis' }],
        tags: [{ type: String }],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

AssetSchema.index({ company: 1, criticality: 1 });

const Asset: Model<IAsset> =
    mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default Asset;
