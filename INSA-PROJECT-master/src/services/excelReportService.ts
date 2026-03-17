import ExcelJS from 'exceljs';
import { IRiskAnalysis } from '@/models/RiskAnalysis';

interface ExcelRiskData {
    questionId: number;
    level: string;
    question: string;
    answer: string;
    likelihood: number;
    impact: number;
    riskScore: number;
    riskLevel: string;
    gap: string;
    threat: string;
    mitigation: string;
    impactLabel: string;
    likelihoodLabel: string;
    impactDescription: string;
}

export const generateExcelReport = async (analysis: IRiskAnalysis): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = 'INSA Risk Analysis System';
    workbook.lastModifiedBy = 'INSA System';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create worksheets
    const summarySheet = workbook.addWorksheet('Executive Summary');
    const detailsSheet = workbook.addWorksheet('Risk Details');
    const matrixSheet = workbook.addWorksheet('Risk Matrix');
    const chartsSheet = workbook.addWorksheet('Risk Charts');

    // Prepare data
    const allRisks: ExcelRiskData[] = [
        ...analysis.operational,
        ...analysis.tactical,
        ...analysis.strategic
    ].map(item => ({
        questionId: item.questionId,
        level: item.level,
        question: item.question,
        answer: item.answer,
        likelihood: item.analysis.likelihood,
        impact: item.analysis.impact,
        riskScore: item.analysis.riskScore,
        riskLevel: item.analysis.riskLevel,
        gap: item.analysis.gap,
        threat: item.analysis.threat,
        mitigation: item.analysis.mitigation,
        impactLabel: item.analysis.impactLabel || 'Moderate',
        likelihoodLabel: item.analysis.likelihoodLabel || 'Moderate',
        impactDescription: item.analysis.impactDescription || 'Impact assessment pending'
    }));

    // Generate Executive Summary Sheet
    await generateSummarySheet(summarySheet, analysis, allRisks);

    // Generate Risk Details Sheet
    await generateDetailsSheet(detailsSheet, allRisks);

    // Generate Risk Matrix Sheet
    await generateMatrixSheet(matrixSheet, allRisks);

    // Generate Charts Sheet
    await generateChartsSheet(chartsSheet, allRisks);

    // Return buffer
    return await workbook.xlsx.writeBuffer() as Buffer;
};

const generateSummarySheet = async (
    sheet: ExcelJS.Worksheet,
    analysis: IRiskAnalysis,
    risks: ExcelRiskData[]
) => {
    // Set column widths
    sheet.columns = [
        { width: 25 },
        { width: 20 },
        { width: 15 },
        { width: 30 }
    ];

    // Title
    sheet.mergeCells('A1:D1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'Cybersecurity Risk Assessment - Executive Summary';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF1F2937' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

    // Assessment Information
    let row = 3;
    sheet.getCell(`A${row}`).value = 'Assessment Information';
    sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row++;

    const assessmentInfo = [
        ['Company:', analysis.company],
        ['Category:', analysis.category],
        ['Assessment Date:', new Date(analysis.createdAt).toLocaleDateString()],
        ['Total Questions:', analysis.metadata.totalQuestions],
        ['Operational Questions:', analysis.metadata.levels.operational],
        ['Tactical Questions:', analysis.metadata.levels.tactical],
        ['Strategic Questions:', analysis.metadata.levels.strategic]
    ];

    assessmentInfo.forEach(([label, value]) => {
        sheet.getCell(`A${row}`).value = label;
        sheet.getCell(`A${row}`).font = { bold: true };
        sheet.getCell(`B${row}`).value = value;
        row++;
    });

    // Risk Distribution
    row += 2;
    sheet.getCell(`A${row}`).value = 'Risk Distribution';
    sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row++;

    const riskCounts = {
        CRITICAL: risks.filter(r => r.riskLevel === 'CRITICAL').length,
        HIGH: risks.filter(r => r.riskLevel === 'HIGH').length,
        MEDIUM: risks.filter(r => r.riskLevel === 'MEDIUM').length,
        LOW: risks.filter(r => r.riskLevel === 'LOW').length,
        VERY_LOW: risks.filter(r => r.riskLevel === 'VERY_LOW').length
    };

    // Risk distribution table headers
    sheet.getCell(`A${row}`).value = 'Risk Level';
    sheet.getCell(`B${row}`).value = 'Count';
    sheet.getCell(`C${row}`).value = 'Percentage';
    sheet.getCell(`D${row}`).value = 'Priority';

    // Style headers
    ['A', 'B', 'C', 'D'].forEach(col => {
        const cell = sheet.getCell(`${col}${row}`);
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    row++;

    // Risk distribution data
    const riskLevelData = [
        ['Critical', riskCounts.CRITICAL, 'Immediate Action', 'FF991B1B'],
        ['High', riskCounts.HIGH, 'Priority Action', 'FFDC2626'],
        ['Medium', riskCounts.MEDIUM, 'Address Soon', 'FFF59E0B'],
        ['Low', riskCounts.LOW, 'Monitor', 'FF10B981'],
        ['Very Low', riskCounts.VERY_LOW, 'Acceptable', 'FF6B7280']
    ];

    riskLevelData.forEach(([level, count, priority, color]) => {
        const percentage = risks.length > 0 ? ((count as number / risks.length) * 100).toFixed(1) : '0.0';

        sheet.getCell(`A${row}`).value = level;
        sheet.getCell(`B${row}`).value = count;
        sheet.getCell(`C${row}`).value = `${percentage}%`;
        sheet.getCell(`D${row}`).value = priority;

        // Color coding
        sheet.getCell(`A${row}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color as string }
        };
        sheet.getCell(`A${row}`).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Borders
        ['A', 'B', 'C', 'D'].forEach(col => {
            sheet.getCell(`${col}${row}`).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        row++;
    });

    // Top Risks
    row += 2;
    sheet.getCell(`A${row}`).value = 'Top 5 Priority Risks';
    sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row++;

    const topRisks = risks
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5);

    // Top risks headers
    sheet.getCell(`A${row}`).value = 'Risk';
    sheet.getCell(`B${row}`).value = 'Score';
    sheet.getCell(`C${row}`).value = 'Level';
    sheet.getCell(`D${row}`).value = 'Mitigation';

    ['A', 'B', 'C', 'D'].forEach(col => {
        const cell = sheet.getCell(`${col}${row}`);
        cell.font = { bold: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
    });
    row++;

    topRisks.forEach((risk, index) => {
        sheet.getCell(`A${row}`).value = risk.gap.substring(0, 50) + (risk.gap.length > 50 ? '...' : '');
        sheet.getCell(`B${row}`).value = risk.riskScore;
        sheet.getCell(`C${row}`).value = risk.riskLevel;
        sheet.getCell(`D${row}`).value = risk.mitigation.substring(0, 40) + (risk.mitigation.length > 40 ? '...' : '');
        row++;
    });
};

const generateDetailsSheet = async (sheet: ExcelJS.Worksheet, risks: ExcelRiskData[]) => {
    // Set column widths
    sheet.columns = [
        { width: 8 },   // ID
        { width: 12 },  // Level
        { width: 40 },  // Question
        { width: 30 },  // Answer
        { width: 12 },  // Likelihood
        { width: 10 },  // Impact
        { width: 10 },  // Score
        { width: 12 },  // Risk Level
        { width: 35 },  // Gap
        { width: 35 },  // Threat
        { width: 35 }   // Mitigation
    ];

    // Headers
    const headers = [
        'ID', 'Level', 'Question', 'Answer', 'Likelihood', 'Impact',
        'Risk Score', 'Risk Level', 'Security Gap', 'Threat', 'Mitigation'
    ];

    headers.forEach((header, index) => {
        const cell = sheet.getCell(1, index + 1);
        cell.value = header;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Data rows
    risks.forEach((risk, index) => {
        const row = index + 2;

        sheet.getCell(row, 1).value = risk.questionId;
        sheet.getCell(row, 2).value = risk.level.toUpperCase();
        sheet.getCell(row, 3).value = risk.question;
        sheet.getCell(row, 4).value = risk.answer;
        sheet.getCell(row, 5).value = `${risk.likelihood} (${risk.likelihoodLabel})`;
        sheet.getCell(row, 6).value = `${risk.impact} (${risk.impactLabel})`;
        sheet.getCell(row, 7).value = risk.riskScore;
        sheet.getCell(row, 8).value = risk.riskLevel;
        sheet.getCell(row, 9).value = risk.gap;
        sheet.getCell(row, 10).value = risk.threat;
        sheet.getCell(row, 11).value = risk.mitigation;

        // Color code risk level
        const riskColors: { [key: string]: string } = {
            'CRITICAL': 'FF991B1B',
            'HIGH': 'FFDC2626',
            'MEDIUM': 'FFF59E0B',
            'LOW': 'FF10B981',
            'VERY_LOW': 'FF6B7280'
        };

        const riskLevelCell = sheet.getCell(row, 8);
        riskLevelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: riskColors[risk.riskLevel] || 'FF6B7280' }
        };
        riskLevelCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Add borders to all cells
        for (let col = 1; col <= 11; col++) {
            sheet.getCell(row, col).border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    });

    // Auto-filter
    sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: risks.length + 1, column: 11 }
    };
};

const generateMatrixSheet = async (sheet: ExcelJS.Worksheet, risks: ExcelRiskData[]) => {
    // Create 5x5 risk matrix
    sheet.columns = Array(7).fill({ width: 12 });

    // Title
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '5x5 Risk Matrix';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Matrix headers
    sheet.getCell('B3').value = 'Impact →';
    sheet.getCell('B3').font = { bold: true };

    // Impact scale (columns)
    for (let i = 1; i <= 5; i++) {
        sheet.getCell(3, i + 2).value = i;
        sheet.getCell(3, i + 2).font = { bold: true };
        sheet.getCell(3, i + 2).alignment = { horizontal: 'center' };
    }

    // Likelihood scale (rows)
    sheet.getCell('A4').value = 'Likelihood ↓';
    sheet.getCell('A4').font = { bold: true };

    for (let i = 5; i >= 1; i--) {
        const row = 9 - i;
        sheet.getCell(row, 2).value = i;
        sheet.getCell(row, 2).font = { bold: true };
        sheet.getCell(row, 2).alignment = { horizontal: 'center' };
    }

    // Fill matrix with risk counts and colors
    const matrixData: { [key: string]: number } = {};

    risks.forEach(risk => {
        const key = `${risk.likelihood}-${risk.impact}`;
        matrixData[key] = (matrixData[key] || 0) + 1;
    });

    for (let likelihood = 1; likelihood <= 5; likelihood++) {
        for (let impact = 1; impact <= 5; impact++) {
            const row = 9 - likelihood;
            const col = impact + 2;
            const count = matrixData[`${likelihood}-${impact}`] || 0;
            const riskScore = likelihood * impact;

            const cell = sheet.getCell(row, col);
            cell.value = count > 0 ? count : '';
            cell.alignment = { horizontal: 'center', vertical: 'middle' };

            // Color based on risk score
            let color = 'FF10B981'; // Very Low/Low
            if (riskScore >= 21) color = 'FF991B1B'; // Critical
            else if (riskScore >= 16) color = 'FFDC2626'; // High
            else if (riskScore >= 9) color = 'FFF59E0B'; // Medium
            else if (riskScore >= 4) color = 'FFFBBF24'; // Low

            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            cell.border = {
                top: { style: 'thick' },
                left: { style: 'thick' },
                bottom: { style: 'thick' },
                right: { style: 'thick' }
            };
        }
    }

    // Legend
    let legendRow = 12;
    sheet.getCell(`A${legendRow}`).value = 'Risk Level Legend:';
    sheet.getCell(`A${legendRow}`).font = { bold: true };
    legendRow++;

    const legend = [
        ['Critical (21-25)', 'FF991B1B'],
        ['High (16-20)', 'FFDC2626'],
        ['Medium (9-15)', 'FFF59E0B'],
        ['Low (4-8)', 'FFFBBF24'],
        ['Very Low (1-3)', 'FF10B981']
    ];

    legend.forEach(([label, color]) => {
        sheet.getCell(`A${legendRow}`).value = label;
        sheet.getCell(`A${legendRow}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
        };
        sheet.getCell(`A${legendRow}`).font = { color: { argb: 'FFFFFFFF' }, bold: true };
        legendRow++;
    });
};

const generateChartsSheet = async (sheet: ExcelJS.Worksheet, risks: ExcelRiskData[]) => {
    // This would typically create charts, but ExcelJS chart support is limited
    // Instead, we'll create data tables that can be used to create charts manually

    sheet.columns = [
        { width: 20 },
        { width: 15 },
        { width: 15 },
        { width: 20 }
    ];

    // Risk Level Distribution Data
    sheet.getCell('A1').value = 'Risk Level Distribution';
    sheet.getCell('A1').font = { bold: true, size: 14 };

    sheet.getCell('A3').value = 'Risk Level';
    sheet.getCell('B3').value = 'Count';
    sheet.getCell('C3').value = 'Percentage';

    const riskCounts = {
        'Critical': risks.filter(r => r.riskLevel === 'CRITICAL').length,
        'High': risks.filter(r => r.riskLevel === 'HIGH').length,
        'Medium': risks.filter(r => r.riskLevel === 'MEDIUM').length,
        'Low': risks.filter(r => r.riskLevel === 'LOW').length,
        'Very Low': risks.filter(r => r.riskLevel === 'VERY_LOW').length
    };

    let row = 4;
    Object.entries(riskCounts).forEach(([level, count]) => {
        const percentage = risks.length > 0 ? ((count / risks.length) * 100).toFixed(1) : '0.0';
        sheet.getCell(`A${row}`).value = level;
        sheet.getCell(`B${row}`).value = count;
        sheet.getCell(`C${row}`).value = `${percentage}%`;
        row++;
    });

    // Level Distribution Data
    row += 2;
    sheet.getCell(`A${row}`).value = 'Assessment Level Distribution';
    sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    row++;

    sheet.getCell(`A${row}`).value = 'Level';
    sheet.getCell(`B${row}`).value = 'Count';
    sheet.getCell(`C${row}`).value = 'Avg Risk Score';
    row++;

    const levelData = {
        'Strategic': risks.filter(r => r.level === 'strategic'),
        'Tactical': risks.filter(r => r.level === 'tactical'),
        'Operational': risks.filter(r => r.level === 'operational')
    };

    Object.entries(levelData).forEach(([level, levelRisks]) => {
        const avgScore = levelRisks.length > 0
            ? (levelRisks.reduce((sum, r) => sum + r.riskScore, 0) / levelRisks.length).toFixed(2)
            : '0.00';

        sheet.getCell(`A${row}`).value = level;
        sheet.getCell(`B${row}`).value = levelRisks.length;
        sheet.getCell(`C${row}`).value = avgScore;
        row++;
    });
};