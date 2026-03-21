import mongoose, { Schema, Document } from 'mongoose';

export interface IControlMapping {
  frameworkControlId: string;
  frameworkControlName: string;
  questionIds: number[];
  mappingStrength: 'direct' | 'partial' | 'indirect';
  gapAnalysis: string;
  complianceStatus: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
}

export interface IComplianceFramework extends Document {
  name: string;
  version: string;
  description: string;
  type: 'iso27001' | 'nist_csf' | 'cis_controls' | 'custom';
  controlMappings: IControlMapping[];
  totalControls: number;
  createdAt: Date;
  updatedAt: Date;
}

const ControlMappingSchema = new Schema<IControlMapping>({
  frameworkControlId: { type: String, required: true },
  frameworkControlName: { type: String, required: true },
  questionIds: { type: [Number], default: [] },
  mappingStrength: { type: String, enum: ['direct', 'partial', 'indirect'], required: true },
  gapAnalysis: { type: String, default: '' },
  complianceStatus: { type: String, enum: ['compliant', 'partial', 'non_compliant', 'not_assessed'], default: 'not_assessed' },
});

const ComplianceFrameworkSchema = new Schema<IComplianceFramework>(
  {
    name: { type: String, required: true },
    version: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['iso27001', 'nist_csf', 'cis_controls', 'custom'], required: true },
    controlMappings: { type: [ControlMappingSchema], default: [] },
    totalControls: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ComplianceFramework =
  mongoose.models.ComplianceFramework ||
  mongoose.model<IComplianceFramework>('ComplianceFramework', ComplianceFrameworkSchema);

export default ComplianceFramework;
