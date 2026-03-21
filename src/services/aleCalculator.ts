/**
 * ALE (Annual Loss Expectancy) and quantitative risk scoring utilities.
 * Implements CSRARS §2.2.1 and §2.3.2 quantitative methods.
 */

export interface ALEInput {
    assetValue: number;          // Asset Value (AV) in currency
    exposureFactor: number;      // EF: 0.0 – 1.0 (fraction of asset lost per incident)
    annualRateOfOccurrence: number; // ARO: expected incidents per year
}

export interface ALEResult {
    singleLossExpectancy: number;  // SLE = AV × EF
    annualLossExpectancy: number;  // ALE = SLE × ARO
    annualizedRateOfOccurrence: number;
    riskRating: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Calculate SLE and ALE per NIST SP 800-30 methodology.
 */
export function calculateALE(input: ALEInput): ALEResult {
    const sle = input.assetValue * input.exposureFactor;
    const ale = sle * input.annualRateOfOccurrence;

    let riskRating: ALEResult['riskRating'];
    if (ale >= 1_000_000) riskRating = 'critical';
    else if (ale >= 100_000) riskRating = 'high';
    else if (ale >= 10_000) riskRating = 'medium';
    else riskRating = 'low';

    return {
        singleLossExpectancy: Math.round(sle * 100) / 100,
        annualLossExpectancy: Math.round(ale * 100) / 100,
        annualizedRateOfOccurrence: input.annualRateOfOccurrence,
        riskRating,
    };
}

/**
 * Map qualitative likelihood (1-5) to ARO for ALE calculation.
 */
export function likelihoodToARO(likelihood: number): number {
    const map: Record<number, number> = {
        1: 0.01,  // Remote: once in 100 years
        2: 0.1,   // Low: once in 10 years
        3: 1,     // Moderate: once per year
        4: 10,    // High: 10 times per year
        5: 52,    // Almost Certain: weekly
    };
    return map[likelihood] ?? 1;
}

/**
 * Map qualitative impact (1-5) to exposure factor for ALE calculation.
 */
export function impactToEF(impact: number): number {
    const map: Record<number, number> = {
        1: 0.05,
        2: 0.15,
        3: 0.35,
        4: 0.65,
        5: 0.90,
    };
    return map[impact] ?? 0.35;
}

/**
 * Derive ALE from qualitative scores + asset value.
 */
export function deriveALEFromQualitative(
    likelihood: number,
    impact: number,
    assetValue: number
): ALEResult {
    return calculateALE({
        assetValue,
        exposureFactor: impactToEF(impact),
        annualRateOfOccurrence: likelihoodToARO(likelihood),
    });
}
