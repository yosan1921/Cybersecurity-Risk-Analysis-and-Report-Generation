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
  type: 'iso27001' | 'nist_csf' | 'cis_controls' | '