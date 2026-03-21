import PptxGenJS from 'pptxgenjs';
import { IRiskAnalysis } from '@/models/RiskAnalysis';

interface PresentationRiskData {
    questionId: number;
    level: string;
    gap: string;
    threat: string;
    mitigation: string;
    riskScore: number;
    riskLevel: string;
    likelihood: number;
    impact: number;
}

export const generatePresentation = async (analysis: IRiskAnalysis): Promise<Buffer> => {
    const pres = new PptxGenJS();

    // Set presentation properties
    pres.defineLayout({ name: 'TITLE_SLIDE', master: 'MASTER_SLIDE' });
    pres.defineLayout({ name: 'CONTENT_SLIDE', master: 'MASTER_SLIDE' });

    // Prepare data
    const allRisks: PresentationRiskData[] = [
        ...analysis.operational,
        ...analysis.tactical,
        ...analysis.strategic
    ].map(item => ({
        questionId: item.questionId,
        level: item.level,
        gap: item.analysis.gap,
        threat: item.analysis.threat,
        mitigation: item.analysis.mitigation,
        riskScore: item.analysis.riskScore,
        riskLevel: item.analysis.riskLevel,
        likelihood: item.analysis.likelihood,
        impact: item.analysis.impact
    }));

    // Slide 1: Title Slide
    addTitleSlide(pres, analysis);

    // Slide 2: Executive Summary
    addExecutiveSummarySlide(pres, analysis, allRisks);

    // Slide 3: Risk Distribution
    addRiskDistributionSlide(pres, allRisks);

    // Slide 4: Risk Matrix
    addRiskMatrixSlide(pres, allRisks);

    // Slide 5-7: Top Risks by Level
    addTopRisksSlides(pres, allRisks);

    // Slide 8: Recommendations
    addRecommendationsSlide(pres, allRisks);

    // Slide 9: Conclusion
    addConclusionSlide(pres, analysis, allRisks);

    return Buffer.from(await pres.write({ outputType: 'arraybuffer' }));
};

const addTitleSlide = (pres: PptxGenJS.PresentationProps, analysis: IRiskAnalysis) => {
    const slide = pres.addSlide();

    // Background
    slide.background = { color: '1F2937' };

    // Title
    slide.addText('Cybersecurity Risk Assessment Report', {
        x: 0.5,
        y: 2,
        w: 9,
        h: 1,
        fontSize: 44,
        bold: true,
        color: 'FFFFFF',
        align: 'center'
    });

    // Company
    slide.addText(analysis.company, {
        x: 0.5,
        y: 3.2,
        w: 9,
        h: 0.6,
        fontSize: 28,
        color: 'F3F4F6',
        align: 'center'
    });

    // Date
    slide.addText(`Assessment Date: ${new Date(analysis.createdAt).toLocaleDateString()}`, {
        x: 0.5,
        y: 4.2,
        w: 9,
        h: 0.5,
        fontSize: 16,
        color: 'D1D5DB',
        align: 'center'
    });

    // Category
    slide.addText(`Category: ${analysis.category}`, {
        x: 0.5,
        y: 4.8,
        w: 9,
        h: 0.5,
        fontSize: 16,
        color: 'D1D5DB',
        align: 'center'
    });
};

const addExecutiveSummarySlide = (pres: PptxGenJS.PresentationProps, analysis: IRiskAnalysis, risks: PresentationRiskData[]) => {
    const slide = pres.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Title
    slide.addText('Executive Summary', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 32,
        bold: true,
        color: '1F2937'
    });

    // Assessment overview
    slide.addText(`Total Controls Assessed: ${analysis.metadata.totalQuestions}`, {
        x: 0.5,
        y: 1,
        w: 9,
        h: 0.4,
        fontSize: 14,
        color: '374151'
    });

    // Risk counts
    const riskCounts = {
        CRITICAL: risks.filter(r => r.riskLevel === 'CRITICAL').length,
        HIGH: risks.filter(r => r.riskLevel === 'HIGH').length,
        MEDIUM: risks.filter(r => r.riskLevel === 'MEDIUM').length,
        LOW: risks.filter(r => r.riskLevel === 'LOW').length,
        VERY_LOW: risks.filter(r => r.riskLevel === 'VERY_LOW').length
    };

    let yPos = 1.6;
    const riskLevels = [
        { label: 'Critical', count: riskCounts.CRITICAL, color: '991B1B' },
        { label: 'High', count: riskCounts.HIGH, color: 'DC2626' },
        { label: 'Medium', count: riskCounts.MEDIUM, color: 'F59E0B' },
        { label: 'Low', count: riskCounts.LOW, color: '10B981' },
        { label: 'Very Low', count: riskCounts.VERY_LOW, color: '6B7280' }
    ];

    riskLevels.forEach(level => {
        slide.addShape(pres.ShapeType.rect, {
            x: 0.5,
            y: yPos,
            w: 0.3,
            h: 0.3,
            fill: { color: level.color }
        });

        slide.addText(`${level.label}: ${level.count}`, {
            x: 1,
            y: yPos,
            w: 8,
            h: 0.3,
            fontSize: 12,
            color: '1F2937'
        });

        yPos += 0.4;
    });

    // Average risk score
    const avgScore = risks.length > 0
        ? (risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length).toFixed(2)
        : '0.00';

    slide.addText(`Average Risk Score: ${avgScore}/25`, {
        x: 0.5,
        y: yPos + 0.3,
        w: 9,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: '1F2937'
    });
};

const addRiskDistributionSlide = (pres: PptxGenJS.PresentationProps, risks: PresentationRiskData[]) => {
    const slide = pres.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Title
    slide.addText('Risk Distribution', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 32,
        bold: true,
        color: '1F2937'
    });

    // Calculate distribution
    const riskCounts = {
        CRITICAL: risks.filter(r => r.riskLevel === 'CRITICAL').length,
        HIGH: risks.filter(r => r.riskLevel === 'HIGH').length,
        MEDIUM: risks.filter(r => r.riskLevel === 'MEDIUM').length,
        LOW: risks.filter(r => r.riskLevel === 'LOW').length,
        VERY_LOW: risks.filter(r => r.riskLevel === 'VERY_LOW').length
    };

    // Create pie chart data
    const chartData = [
        {
            name: 'Critical',
            labels: ['Critical'],
            values: [riskCounts.CRITICAL]
        },
        {
            name: 'High',
            labels: ['High'],
            values: [riskCounts.HIGH]
        },
        {
            name: 'Medium',
            labels: ['Medium'],
            values: [riskCounts.MEDIUM]
        },
        {
            name: 'Low',
            labels: ['Low'],
            values: [riskCounts.LOW]
        },
        {
            name: 'Very Low',
            labels: ['Very Low'],
            values: [riskCounts.VERY_LOW]
        }
    ];

    // Add pie chart
    slide.addChart(pres.ChartType.pie, chartData, {
        x: 1,
        y: 1.2,
        w: 4,
        h: 4,
        chartColors: ['991B1B', 'DC2626', 'F59E0B', '10B981', '6B7280']
    });

    // Add legend
    let yPos = 1.2;
    const colors = ['991B1B', 'DC2626', 'F59E0B', '10B981', '6B7280'];
    const labels = ['Critical', 'High', 'Medium', 'Low', 'Very Low'];
    const values = [riskCounts.CRITICAL, riskCounts.HIGH, riskCounts.MEDIUM, riskCounts.LOW, riskCounts.VERY_LOW];

    labels.forEach((label, index) => {
        slide.addShape(pres.ShapeType.rect, {
            x: 5.5,
            y: yPos,
            w: 0.3,
            h: 0.3,
            fill: { color: colors[index] }
        });

        const percentage = risks.length > 0 ? ((values[index] / risks.length) * 100).toFixed(1) : '0.0';
        slide.addText(`${label}: ${values[index]} (${percentage}%)`, {
            x: 6,
            y: yPos,
            w: 3,
            h: 0.3,
            fontSize: 12,
            color: '1F2937'
        });

        yPos += 0.5;
    });
};

const addRiskMatrixSlide = (pres: PptxGenJS.PresentationProps, risks: PresentationRiskData[]) => {
    const slide = pres.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Title
    slide.addText('5x5 Risk Matrix', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 32,
        bold: true,
        color: '1F2937'
    });

    // Create matrix data
    const matrixData: number[][] = Array(5).fill(null).map(() => Array(5).fill(0));

    risks.forEach(risk => {
        const likelihoodIndex = risk.likelihood - 1;
        const impactIndex = risk.impact - 1;
        if (likelihoodIndex >= 0 && likelihoodIndex < 5 && impactIndex >= 0 && impactIndex < 5) {
            matrixData[4 - likelihoodIndex][impactIndex]++;
        }
    });

    // Draw matrix
    const cellSize = 0.8;
    const startX = 1.5;
    const startY = 1.2;

    // Headers
    const impactLabels = ['1\n(Min)', '2\n(Low)', '3\n(Mod)', '4\n(High)', '5\n(Crit)'];
    const likelihoodLabels = ['5\n(Almost\nCertain)', '4\n(High)', '3\n(Mod)', '2\n(Low)', '1\n(Remote)'];

    // Impact headers
    impactLabels.forEach((label, index) => {
        slide.addText(label, {
            x: startX + (index + 1) * cellSize,
            y: startY - 0.6,
            w: cellSize,
            h: 0.5,
            fontSize: 9,
            bold: true,
            color: '1F2937',
            align: 'center'
        });
    });

    // Likelihood headers and matrix cells
    matrixData.forEach((row, rowIndex) => {
        slide.addText(likelihoodLabels[rowIndex], {
            x: startX - 0.8,
            y: startY + rowIndex * cellSize,
            w: 0.7,
            h: cellSize,
            fontSize: 8,
            bold: true,
            color: '1F2937',
            align: 'center',
            valign: 'middle'
        });

        row.forEach((count, colIndex) => {
            const riskScore = (5 - rowIndex) * (colIndex + 1);
            let color = '10B981'; // Very Low

            if (riskScore >= 21) color = '991B1B'; // Critical
            else if (riskScore >= 16) color = 'DC2626'; // High
            else if (riskScore >= 9) color = 'F59E0B'; // Medium
            else if (riskScore >= 4) color = 'FBBF24'; // Low

            slide.addShape(pres.ShapeType.rect, {
                x: startX + (colIndex + 1) * cellSize,
                y: startY + rowIndex * cellSize,
                w: cellSize,
                h: cellSize,
                fill: { color },
                line: { color: '1F2937', width: 1 }
            });

            if (count > 0) {
                slide.addText(count.toString(), {
                    x: startX + (colIndex + 1) * cellSize,
                    y: startY + rowIndex * cellSize,
                    w: cellSize,
                    h: cellSize,
                    fontSize: 14,
                    bold: true,
                    color: 'FFFFFF',
                    align: 'center',
                    valign: 'middle'
                });
            }
        });
    });
};

const addTopRisksSlides = (pres: PptxGenJS.PresentationProps, risks: PresentationRiskData[]) => {
    const sortedRisks = risks.sort((a, b) => b.riskScore - a.riskScore);

    // Slide: Top Critical Risks
    const criticalRisks = sortedRisks.filter(r => r.riskLevel === 'CRITICAL').slice(0, 5);
    if (criticalRisks.length > 0) {
        addTopRisksDetailSlide(pres, 'Critical Risks', criticalRisks, '991B1B');
    }

    // Slide: Top High Risks
    const highRisks = sortedRisks.filter(r => r.riskLevel === 'HIGH').slice(0, 5);
    if (highRisks.length > 0) {
        addTopRisksDetailSlide(pres, 'High Priority Risks', highRisks, 'DC2626');
    }

    // Slide: Top Medium Risks
    const mediumRisks = sortedRisks.filter(r => r.riskLevel === 'MEDIUM').slice(0, 5);
    if (mediumRisks.length > 0) {
        addTopRisksDetailSlide(pres, 'Medium Priority Risks', mediumRisks, 'F59E0B');
    }
};

const addTopRisksDetailSlide = (pres: PptxGenJS.PresentationProps, title: string, risks: PresentationRiskData[], color: string) => {
    const slide = pres.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Title
    slide.addText(title, {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 32,
        bold: true,
        color: '1F2937'
    });

    // Risk items
    let yPos = 1.1;
    risks.forEach((risk, index) => {
        // Risk number and gap
        slide.addText(`${index + 1}. ${risk.gap}`, {
            x: 0.5,
            y: yPos,
            w: 9,
            h: 0.4,
            fontSize: 12,
            bold: true,
            color: color
        });
        yPos += 0.45;

        // Details
        slide.addText(`Score: ${risk.riskScore}/25 | Likelihood: ${risk.likelihood}/5 | Impact: ${risk.impact}/5`, {
            x: 0.7,
            y: yPos,
            w: 8.8,
            h: 0.3,
            fontSize: 10,
            color: '6B7280'
        });
        yPos += 0.35;

        // Threat
        slide.addText(`Threat: ${risk.threat}`, {
            x: 0.7,
            y: yPos,
            w: 8.8,
            h: 0.3,
            fontSize: 10,
            color: '374151'
        });
        yPos += 0.35;

        // Mitigation
        slide.addText(`Mitigation: ${risk.mitigation}`, {
            x: 0.7,
            y: yPos,
            w: 8.8,
            h: 0.3,
            fontSize: 10,
            color: '374151'
        });
        yPos += 0.6;
    });
};

const addRecommendationsSlide = (pres: PptxGenJS.PresentationProps, risks: PresentationRiskData[]) => {
    const slide = pres.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Title
    slide.addText('Recommendations', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 32,
        bold: true,
        color: '1F2937'
    });

    const criticalCount = risks.filter(r => r.riskLevel === 'CRITICAL').length;
    const highCount = risks.filter(r => r.riskLevel === 'HIGH').length;

    let yPos = 1.1;

    const recommendations = [
        `Address ${criticalCount} critical risks within 30 days`,
        `Remediate ${highCount} high-priority risks within 90 days`,
        'Establish formal risk management program',
        'Implement quarterly risk assessments',
        'Provide security awareness training',
        'Establish incident response procedures',
        'Conduct regular penetration testing',
        'Maintain risk register and track progress'
    ];

    recommendations.forEach((rec, index) => {
        slide.addText(`${index + 1}. ${rec}`, {
            x: 0.7,
            y: yPos,
            w: 8.8,
            h: 0.35,
            fontSize: 12,
            color: '1F2937'
        });
        yPos += 0.45;
    });
};

const addConclusionSlide = (pres: PptxGenJS.PresentationProps, analysis: IRiskAnalysis, risks: PresentationRiskData[]) => {
    const slide = pres.addSlide();
    slide.background = { color: '1F2937' };

    // Title
    slide.addText('Conclusion', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.6,
        fontSize: 36,
        bold: true,
        color: 'FFFFFF'
    });

    const avgScore = risks.length > 0
        ? (risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length).toFixed(2)
        : '0.00';

    const criticalCount = risks.filter(r => r.riskLevel === 'CRITICAL').length;
    const highCount = risks.filter(r => r.riskLevel === 'HIGH').length;

    let yPos = 1.5;

    slide.addText(`Assessment Summary for ${analysis.company}`, {
        x: 0.5,
        y: yPos,
        w: 9,
        h: 0.4,
        fontSize: 16,
        color: 'F3F4F6'
    });
    yPos += 0.6;

    slide.addText(`Total Controls: ${analysis.metadata.totalQuestions}`, {
        x: 0.7,
        y: yPos,
        w: 8.8,
        h: 0.35,
        fontSize: 12,
        color: 'D1D5DB'
    });
    yPos += 0.45;

    slide.addText(`Average Risk Score: ${avgScore}/25`, {
        x: 0.7,
        y: yPos,
        w: 8.8,
        h: 0.35,
        fontSize: 12,
        color: 'D1D5DB'
    });
    yPos += 0.45;

    slide.addText(`Critical Risks: ${criticalCount} | High Risks: ${highCount}`, {
        x: 0.7,
        y: yPos,
        w: 8.8,
        h: 0.35,
        fontSize: 12,
        color: 'D1D5DB'
    });
    yPos += 0.8;

    slide.addText('Next Steps:', {
        x: 0.7,
        y: yPos,
        w: 8.8,
        h: 0.35,
        fontSize: 14,
        bold: true,
        color: 'FBBF24'
    });
    yPos += 0.5;

    slide.addText('1. Review critical findings with leadership', {
        x: 0.9,
        y: yPos,
        w: 8.6,
        h: 0.3,
        fontSize: 11,
        color: 'D1D5DB'
    });
    yPos += 0.4;

    slide.addText('2. Develop remediation plans for high-risk items', {
        x: 0.9,
        y: yPos,
        w: 8.6,
        h: 0.3,
        fontSize: 11,
        color: 'D1D5DB'
    });
    yPos += 0.4;

    slide.addText('3. Allocate resources and assign ownership', {
        x: 0.9,
        y: yPos,
        w: 8.6,
        h: 0.3,
        fontSize: 11,
        color: 'D1D5DB'
    });
    yPos += 0.4;

    slide.addText('4. Schedule follow-up assessment in 90 days', {
        x: 0.9,
        y: yPos,
        w: 8.6,
        h: 0.3,
        fontSize: 11,
        color: 'D1D5DB'
    });
};