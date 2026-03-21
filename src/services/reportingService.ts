import { IRiskAnalysis } from '@/models/RiskAnalysis';
import { generateExcelReport } from './excelReportService';
import { generatePDFReport } from './pdfReportService';
import { generatePresentation } from './presentationService';

export type ReportFormat = 'excel' | 'pdf' | 'powerpoint' | 'docx';

export interface ReportGenerationOptions {
    format: ReportFormat;
    includeExecutiveSummary?: boolean;
    includeDetailedFindings?: boolean;
    includeRecommendations?: boolean;
    includeCharts?: boolean;
}

export const generateReport = async (
    analysis: IRiskAnalysis,
    options: ReportGenerationOptions
): Promise<{ buffer: Buffer; mimeType: string; filename: string }> => {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = `Risk_Assessment_${analysis.company}_${timestamp}`;

    switch (options.format) {
        case 'excel':
            return {
                buffer: await generateExcelReport(analysis),
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: `${baseFilename}.xlsx`
            };

        case 'pdf':
            return {
                buffer: await generatePDFReport(analysis),
                mimeType: 'application/pdf',
                filename: `${baseFilename}.pdf`
            };

        case 'powerpoint':
            return {
                buffer: await generatePresentation(analysis),
                mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                filename: `${baseFilename}.pptx`
            };

        default:
            throw new Error(`Unsupported report format: ${options.format}`);
    }
};

export const getAvailableFormats = (): ReportFormat[] => {
    return ['excel', 'pdf', 'powerpoint'];
};