/**
 * DOCX Report Service (CSRARS §2.4.5)
 * Generates level-differentiated Word documents using the `docx` library.
 * Supports Strategic, Tactical, and Operational report levels.
 */
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    HeadingLevel,
    AlignmentType,
    WidthType,
    BorderStyle,
    ShadingType,
    PageBreak,
} from 'docx';
import { IRiskAnalysis } from '@/models/RiskAnalysis';

type ReportLevel = 'strategic' | 'tactical' | 'operational' | 'awareness';

interface RiskRow {
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
}

function getRiskColor(level: string): string {
    switch (level) {
        case 'CRITICAL': return 'C00000';
        case 'HIGH': return 'FF0000';
        case 'MEDIUM': return 'FFC000';
        case 'LOW': return '70AD47';
        default: return '808080';
    }
}

function heading(text: string, level: HeadingLevel = HeadingLevel.HEADING_1): Paragraph {
    return new Paragraph({ text, heading: level, spacing: { before: 300, after: 150 } });
}

function para(text: string, bold = false): Paragraph {
    return new Paragraph({
        children: [new TextRun({ text, bold, size: 22 })],
        spacing: { after: 100 },
    });
}

function riskTable(risks: RiskRow[], columns: string[]): Table {
    const colMap: Record<string, (r: RiskRow) => string> = {
        'ID': r => String(r.questionId),
        'Level': r => r.level.toUpperCase(),
        'Question': r => r.question,
        'Answer': r => r.answer,
        'Likelihood': r => String(r.likelihood),
        'Impact': r => String(r.impact),
        'Risk Score': r => String(r.riskScore),
        'Risk Level': r => r.riskLevel,
        'Gap': r => r.gap,
        'Threat': r => r.threat,
        'Mitigation': r => r.mitigation,
    };

    const headerRow = new TableRow({
        children: columns.map(col =>
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: col, bold: true, color: 'FFFFFF', size: 20 })] })],
                shading: { type: ShadingType.SOLID, color: '1F2937' },
                width: { size: Math.floor(9000 / columns.length), type: WidthType.DXA },
            })
        ),
        tableHeader: true,
    });

    const dataRows = risks.map(r =>
        new TableRow({
            children: columns.map(col => {
                const val = colMap[col]?.(r) ?? '';
                const isRiskLevel = col === 'Risk Level';
                return new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({
                            text: val,
                            size: 18,
                            color: isRiskLevel ? 'FFFFFF' : '000000',
                            bold: isRiskLevel,
                        })],
                    })],
                    shading: isRiskLevel
                        ? { type: ShadingType.SOLID, color: getRiskColor(val) }
                        : undefined,
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                });
            }),
        })
    );

    return new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } });
}

export async function generateDocxReport(
    analysis: IRiskAnalysis,
    level: ReportLevel = 'strategic'
): Promise<Buffer> {
    const allRisks: RiskRow[] = [
        ...analysis.operational,
        ...analysis.tactical,
        ...analysis.strategic,
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
    }));

    const levelRisks = level === 'strategic'
        ? allRisks
        : allRisks.filter(r => r.level === level);

    const criticalCount = allRisks.filter(r => r.riskLevel === 'CRITICAL').length;
    const highCount = allRisks.filter(r => r.riskLevel === 'HIGH').length;
    const mediumCount = allRisks.filter(r => r.riskLevel === 'MEDIUM').length;
    const lowCount = allRisks.filter(r => r.riskLevel === 'LOW').length;
    const avgScore = allRisks.length
        ? (allRisks.reduce((s, r) => s + r.riskScore, 0) / allRisks.length).toFixed(2)
        : '0.00';

    const sections: any[] = [];

    // ── Cover Page ──────────────────────────────────────────────────────────────
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: 'CSRARS – Cybersecurity Risk Assessment Report', bold: true, size: 48 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 },
        }),
        new Paragraph({
            children: [new TextRun({ text: `Company: ${analysis.company}`, size: 28 })],
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            children: [new TextRun({ text: `Report Level: ${level.toUpperCase()}`, size: 28 })],
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString()}`, size: 24 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({ children: [new PageBreak()] })
    );

    // ── Executive Summary ────────────────────────────────────────────────────────
    sections.push(
        heading('1. Executive Summary'),
        para(`This report presents the cybersecurity risk assessment results for ${analysis.company}.`),
        para(`Assessment Category: ${analysis.category}`),
        para(`Total Questions Analyzed: ${analysis.metadata.totalQuestions}`),
        para(`  • Strategic: ${analysis.metadata.levels.strategic}`),
        para(`  • Tactical: ${analysis.metadata.levels.tactical}`),
        para(`  • Operational: ${analysis.metadata.levels.operational}`),
        para(''),
        heading('Risk Distribution Summary', HeadingLevel.HEADING_2),
        riskTable(
            [
                { questionId: 0, level: '', question: '', answer: '', likelihood: 0, impact: 0, riskScore: 0, riskLevel: 'CRITICAL', gap: `${criticalCount} risks`, threat: '', mitigation: 'Immediate Action Required' },
                { questionId: 0, level: '', question: '', answer: '', likelihood: 0, impact: 0, riskScore: 0, riskLevel: 'HIGH', gap: `${highCount} risks`, threat: '', mitigation: 'Action within 90 days' },
                { questionId: 0, level: '', question: '', answer: '', likelihood: 0, impact: 0, riskScore: 0, riskLevel: 'MEDIUM', gap: `${mediumCount} risks`, threat: '', mitigation: 'Address within 6 months' },
                { questionId: 0, level: '', question: '', answer: '', likelihood: 0, impact: 0, riskScore: 0, riskLevel: 'LOW', gap: `${lowCount} risks`, threat: '', mitigation: 'Monitor' },
            ],
            ['Risk Level', 'Gap', 'Mitigation']
        ),
        para(`Average Risk Score: ${avgScore} / 25`, true),
        new Paragraph({ children: [new PageBreak()] })
    );

    // ── Level-specific content ───────────────────────────────────────────────────
    if (level === 'strategic') {
        sections.push(
            heading('2. Strategic Risk Overview'),
            para('This section provides a high-level view of the overall risk posture, trending, and resource allocation guidance for executive leadership.'),
            para(''),
            heading('Overall Risk Posture', HeadingLevel.HEADING_2),
            para(`The organization demonstrates an average risk score of ${avgScore}/25 across all assessment levels.`),
            para(`Critical risks requiring immediate executive attention: ${criticalCount}`),
            para(`High-priority risks requiring near-term action: ${highCount}`),
            para(''),
            heading('Top Strategic Risks', HeadingLevel.HEADING_2),
            riskTable(
                allRisks.filter(r => r.level === 'strategic').sort((a, b) => b.riskScore - a.riskScore).slice(0, 10),
                ['ID', 'Risk Level', 'Risk Score', 'Gap', 'Mitigation']
            ),
            new Paragraph({ children: [new PageBreak()] })
        );
    }

    if (level === 'tactical' || level === 'strategic') {
        sections.push(
            heading(level === 'strategic' ? '3. Tactical Risk Details' : '2. Tactical Risk Details'),
            para('This section covers control effectiveness, specific risk treatment plans, and compliance status for security managers.'),
            para(''),
            riskTable(
                allRisks.filter(r => r.level === 'tactical').sort((a, b) => b.riskScore - a.riskScore),
                ['ID', 'Question', 'Likelihood', 'Impact', 'Risk Score', 'Risk Level', 'Gap', 'Mitigation']
            ),
            new Paragraph({ children: [new PageBreak()] })
        );
    }

    if (level === 'operational' || level === 'strategic') {
        sections.push(
            heading(level === 'strategic' ? '4. Operational Risk Details' : '2. Operational Risk Details'),
            para('This section lists specific vulnerabilities, required patching/configuration changes, and immediate action items for technical teams.'),
            para(''),
            riskTable(
                allRisks.filter(r => r.level === 'operational').sort((a, b) => b.riskScore - a.riskScore),
                ['ID', 'Question', 'Answer', 'Likelihood', 'Impact', 'Risk Score', 'Risk Level', 'Gap', 'Threat', 'Mitigation']
            ),
            new Paragraph({ children: [new PageBreak()] })
        );
    }

    // ── Risk Treatment Recommendations ──────────────────────────────────────────
    const sectionNum = level === 'strategic' ? '5' : '3';
    sections.push(
        heading(`${sectionNum}. Risk Treatment Recommendations`),
        para('The following treatment options are recommended based on risk scores:'),
        para(''),
        heading('Immediate Actions (Critical Risks – within 30 days)', HeadingLevel.HEADING_2),
        ...allRisks
            .filter(r => r.riskLevel === 'CRITICAL')
            .slice(0, 5)
            .map(r => para(`• [Score: ${r.riskScore}] ${r.gap} → ${r.mitigation}`)),
        para(''),
        heading('High Priority Actions (30–90 days)', HeadingLevel.HEADING_2),
        ...allRisks
            .filter(r => r.riskLevel === 'HIGH')
            .slice(0, 5)
            .map(r => para(`• [Score: ${r.riskScore}] ${r.gap} → ${r.mitigation}`)),
        para(''),
        heading('General Recommendations', HeadingLevel.HEADING_2),
        para('• Establish a formal risk management program with quarterly reviews'),
        para('• Implement a risk register to track remediation progress'),
        para('• Provide security awareness training for all staff'),
        para('• Establish incident response and business continuity plans'),
        para('• Conduct regular penetration testing and vulnerability assessments'),
        para('• Align controls with ISO 27001 and NIST CSF frameworks'),
        new Paragraph({ children: [new PageBreak()] })
    );

    // ── Compliance Notes ─────────────────────────────────────────────────────────
    sections.push(
        heading(`${Number(sectionNum) + 1}. Compliance & Audit Notes`),
        para('This assessment aligns with the following frameworks:'),
        para('• ISO/IEC 27001:2022 – Information Security Management'),
        para('• NIST Cybersecurity Framework (CSF) v2.0'),
        para('• Critical Mass Cyber Security Requirement Standards V.2.0'),
        para('• INSA National Cybersecurity Standards'),
        para(''),
        para(`Report generated by CSRARS on ${new Date().toISOString()}`, true),
        para(`Assessment ID: ${String(analysis._id)}`)
    );

    const doc = new Document({
        sections: [{ children: sections }],
        creator: 'CSRARS – INSA',
        title: `Risk Assessment Report – ${analysis.company}`,
        description: `${level.toUpperCase()} level cybersecurity risk assessment report`,
    });

    return await Packer.toBuffer(doc);
}
