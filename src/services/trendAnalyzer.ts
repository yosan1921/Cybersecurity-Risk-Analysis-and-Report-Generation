import dbConnect from "@/lib/mongodb";
import RiskAnalysis from "@/models/RiskAnalysis";

export interface TrendData {
    date: string;
    totalRisks: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    veryLowCount: number;
    averageRiskScore: number;
    company: string;
    category: string;
}

export interface TrendAnalysis {
    timeSeriesData: TrendData[];
    riskTrends: {
        critical: { trend: 'increasing' | 'decreasing' | 'stable'; change: number };
        high: { trend: 'increasing' | 'decreasing' | 'stable'; change: number };
        medium: { trend: 'increasing' | 'decreasing' | 'stable'; change: number };
        overall: { trend: 'increasing' | 'decreasing' | 'stable'; change: number };
    };
    insights: string[];
    recommendations: string[];
}

export const generateTrendAnalysis = async (
    company?: string,
    startDate?: Date,
    endDate?: Date
): Promise<TrendAnalysis> => {
    await dbConnect();

    // Build query
    const query: any = {};
    if (company) query.company = company;
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
    }

    // Get historical analyses
    const analyses = await RiskAnalysis.find(query)
        .sort({ createdAt: 1 })
        .select('company category createdAt operational tactical strategic summary');

    // Process trend data
    const trendData: TrendData[] = analyses.map(analysis => {
        const allRisks = [
            ...analysis.operational,
            ...analysis.tactical,
            ...analysis.strategic
        ];

        const riskCounts = {
            critical: allRisks.filter(r => r.analysis.riskLevel === 'CRITICAL').length,
            high: allRisks.filter(r => r.analysis.riskLevel === 'HIGH').length,
            medium: allRisks.filter(r => r.analysis.riskLevel === 'MEDIUM').length,
            low: allRisks.filter(r => r.analysis.riskLevel === 'LOW').length,
            veryLow: allRisks.filter(r => r.analysis.riskLevel === 'VERY_LOW').length
        };

        const avgScore = allRisks.length > 0
            ? allRisks.reduce((sum, r) => sum + r.analysis.riskScore, 0) / allRisks.length
            : 0;

        return {
            date: analysis.createdAt.toISOString().split('T')[0],
            totalRisks: allRisks.length,
            criticalCount: riskCounts.critical,
            highCount: riskCounts.high,
            mediumCount: riskCounts.medium,
            lowCount: riskCounts.low,
            veryLowCount: riskCounts.veryLow,
            averageRiskScore: Math.round(avgScore * 100) / 100,
            company: analysis.company,
            category: analysis.category
        };
    });

    // Calculate trends
    const riskTrends = calculateRiskTrends(trendData);

    // Generate insights
    const insights = generateInsights(trendData, riskTrends);

    // Generate recommendations
    const recommendations = generateRecommendations(riskTrends, insights);

    return {
        timeSeriesData: trendData,
        riskTrends,
        insights,
        recommendations
    };
};

const calculateRiskTrends = (data: TrendData[]) => {
    if (data.length < 2) {
        return {
            critical: { trend: 'stable' as const, change: 0 },
            high: { trend: 'stable' as const, change: 0 },
            medium: { trend: 'stable' as const, change: 0 },
            overall: { trend: 'stable' as const, change: 0 }
        };
    }

    const first = data[0];
    const last = data[data.length - 1];

    const calculateTrend = (initial: number, final: number) => {
        const change = ((final - initial) / (initial || 1)) * 100;
        const trend = Math.abs(change) < 5 ? 'stable' : change > 0 ? 'increasing' : 'decreasing';
        return { trend: trend as 'increasing' | 'decreasing' | 'stable', change: Math.round(change * 100) / 100 };
    };

    return {
        critical: calculateTrend(first.criticalCount, last.criticalCount),
        high: calculateTrend(first.highCount, last.highCount),
        medium: calculateTrend(first.mediumCount, last.mediumCount),
        overall: calculateTrend(first.averageRiskScore, last.averageRiskScore)
    };
};

const generateInsights = (data: TrendData[], trends: any): string[] => {
    const insights: string[] = [];

    if (data.length === 0) {
        insights.push("No historical data available for trend analysis");
        return insights;
    }

    const latest = data[data.length - 1];
    const totalHighRisk = latest.criticalCount + latest.highCount;

    // Risk level insights
    if (trends.critical.trend === 'increasing') {
        insights.push(`Critical risks have increased by ${trends.critical.change}% over the analysis period`);
    } else if (trends.critical.trend === 'decreasing') {
        insights.push(`Critical risks have decreased by ${Math.abs(trends.critical.change)}% - showing improvement`);
    }

    if (trends.overall.trend === 'increasing') {
        insights.push(`Overall risk score trending upward by ${trends.overall.change}% - requires attention`);
    } else if (trends.overall.trend === 'decreasing') {
        insights.push(`Overall risk score improving by ${Math.abs(trends.overall.change)}% - positive trend`);
    }

    // Current state insights
    if (totalHighRisk > latest.totalRisks * 0.3) {
        insights.push(`${totalHighRisk} high/critical risks represent ${Math.round((totalHighRisk / latest.totalRisks) * 100)}% of total risks`);
    }

    // Trend patterns
    const recentData = data.slice(-3);
    if (recentData.length >= 3) {
        const recentCritical = recentData.map(d => d.criticalCount);
        const isIncreasing = recentCritical.every((val, i) => i === 0 || val >= recentCritical[i - 1]);
        const isDecreasing = recentCritical.every((val, i) => i === 0 || val <= recentCritical[i - 1]);

        if (isIncreasing && recentCritical[0] !== recentCritical[recentCritical.length - 1]) {
            insights.push("Critical risks showing consistent upward trend in recent assessments");
        } else if (isDecreasing && recentCritical[0] !== recentCritical[recentCritical.length - 1]) {
            insights.push("Critical risks showing consistent downward trend in recent assessments");
        }
    }

    return insights;
};

const generateRecommendations = (trends: any, insights: string[]): string[] => {
    const recommendations: string[] = [];

    // Based on critical risk trends
    if (trends.critical.trend === 'increasing') {
        recommendations.push("Implement immediate action plan to address increasing critical risks");
        recommendations.push("Conduct emergency risk review and allocate additional resources");
    }

    // Based on overall trends
    if (trends.overall.trend === 'increasing') {
        recommendations.push("Review and strengthen existing security controls");
        recommendations.push("Consider increasing security budget and staffing");
    } else if (trends.overall.trend === 'decreasing') {
        recommendations.push("Continue current risk management practices - showing positive results");
        recommendations.push("Document successful mitigation strategies for future reference");
    }

    // Based on high risk trends
    if (trends.high.trend === 'increasing') {
        recommendations.push("Prioritize high-risk mitigation to prevent escalation to critical");
    }

    // General recommendations
    recommendations.push("Establish regular quarterly risk assessments to maintain trend visibility");
    recommendations.push("Implement automated risk monitoring for early warning indicators");

    return recommendations;
};