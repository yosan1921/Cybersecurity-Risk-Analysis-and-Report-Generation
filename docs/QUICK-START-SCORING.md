# Quick Start - Vulnerability Scoring & Risk Analysis

## 30-Second Overview

The system now provides comprehensive vulnerability scoring using CVSS, ALE, SLE, configurable risk matrices, hybrid scoring, and automatic threat-vulnerability-asset correlation.

---

## Key Features

1. **CVSS 3.1 Scoring** - Full vulnerability severity assessment
2. **ALE/SLE Calculation** - Financial impact assessment
3. **Inherent & Residual Risk** - Control effectiveness measurement
4. **Risk Matrices** - Configurable 2D and 3D categorization
5. **Hybrid Scoring** - Combine questionnaire and automated analysis
6. **Threat Correlation** - Automatic threat-vulnerability-asset linking

---

## API Quick Reference

### Calculate Vulnerability Score
```bash
curl -X POST http://localhost:3000/api/analysis/scoring-metrics \
  -H "Content-Type: application/json" \
  -d '{
    "vulnerabilityId": "CVE-2024-1234",
    "title": "Critical RCE",
    "cvssMetrics": {
      "baseMetrics": {
        "attackVector": "network",
        "attackComplexity": "low",
        "privilegesRequired": "none",
        "userInteraction": "none",
        "scope": "unchanged",
        "confidentiality": "high",
        "integrity": "high",
        "availability": "high"
      }
    },
    "assetValue": 100000,
    "impactPercentage": 50,
    "questionnaireScore": 75,
    "automatedScore": 85,
    "inherentRisk": 20,
    "residualRisk": 8
  }'
```

### Categorize Risk
```bash
curl -X POST http://localhost:3000/api/analysis/risk-matrix \
  -H "Content-Type: application/json" \
  -d '{
    "likelihood": 4,
    "impact": 5,
    "criticality": 3
  }'
```

### Correlate Threats
```bash
curl -X POST http://localhost:3000/api/analysis/threat-correlation \
  -H "Content-Type: application/json" \
  -d '{
    "threat": {
      "id": "CVE-2024-1234",
      "title": "Critical RCE",
      "severity": "critical",
      "affectedSystems": ["web-servers"],
      "exploitAvailable": true
    },
    "vulnerability": {
      "id": "VULN-001",
      "title": "Unpatched Web Framework",
      "severity": "critical",
      "affectedSystems": ["web-servers"]
    },
    "asset": {
      "id": "ASSET-001",
      "name": "Production Web Server",
      "type": "server",
      "criticality": "critical"
    }
  }'
```

---

## Code Examples

### Calculate SLE
```typescript
import { calculateSLE } from '@/lib/services/scoringMetricsService';

const sle = calculateSLE(100000, 50); // $100k asset, 50% impact
// Result: { assetValue: 100000, impactPercentage: 50, singleLossExpectancy: 50000 }
```

### Calculate CVSS
```typescript
import { calculateCVSSFull } from '@/lib/services/scoringMetricsService';

const cvss = calculateCVSSFull({
  attackVector: 'network',
  attackComplexity: 'low',
  privilegesRequired: 'none',
  userInteraction: 'none',
  scope: 'unchanged',
  confidentiality: 'high',
  integrity: 'high',
  availability: 'high'
});
// Result: { baseScore: 9.8, finalScore: 9.8, severity: 'critical', ... }
```

### Categorize Risk
```typescript
import { categorizeRisk, DEFAULT_RISK_MATRIX } from '@/lib/services/riskMatrixService';

const categorization = categorizeRisk(4, 5, undefined, DEFAULT_RISK_MATRIX);
// Result: { riskScore: 20, riskLevel: 'high', category: 'High', ... }
```

### Correlate Threats
```typescript
import { correlateThreats } from '@/lib/services/threatCorrelationService';

const correlation = correlateThreats(threat, vulnerability, asset);
// Result: { correlationStrength: 92, correlationType: 'direct', cascadingRisk: 85, ... }
```

### Hybrid Scoring
```typescript
import { calculateHybridScore } from '@/lib/services/scoringMetricsService';

const hybrid = calculateHybridScore(75, 85, { questionnaire: 0.4, automated: 0.6 });
// Result: { hybridScore: 81, confidenceLevel: 82, scoringMethod: 'automated-primary' }
```

---

## Configuration

### Change Scoring Thresholds
Edit `lib/services/scoringMetricsService.ts`:
```typescript
export const DEFAULT_SCORING_THRESHOLDS = {
    cvssHigh: 7.0,
    cvssVeryHigh: 9.0,
    aleThreshold: 50000,
    rosiThreshold: 0.5,
    residualRiskAcceptance: 5
};
```

### Create Custom Risk Matrix
```typescript
import { createCustomMatrix } from '@/lib/services/riskMatrixService';

const customMatrix = createCustomMatrix(
    'My Matrix',
    'Custom risk matrix',
    likelihoodScale,
    impactScale,
    riskLevels,
    criticalityScale
);
```

### Adjust Hybrid Score Weights
```typescript
const hybrid = calculateHybridScore(
    questionnaireScore,
    automatedScore,
    {
        questionnaire: 0.3,  // 30% weight
        automated: 0.7       // 70% weight
    }
);
```

---

## Workflow Integration

### Step 1: Complete Questionnaire
User fills out security questionnaire

### Step 2: Analyze Risk
System analyzes questionnaire responses
- Calculates likelihood and impact
- Generates questionnaire score

### Step 3: Calculate Metrics
System calculates scoring metrics
- CVSS, ALE, SLE, ALES
- Inherent and residual risk
- Hybrid score

### Step 4: Categorize Risk
System categorizes using risk matrix
- Determines risk level
- Generates recommendations
- Calculates timeline

### Step 5: Correlate Threats
System correlates threats with vulnerabilities and assets
- Identifies affected systems
- Calculates cascading risk
- Generates business impact

### Step 6: Create Risk Register
System creates risk register entries
- Links to questionnaire
- Tracks remediation
- Monitors progress

---

## Key Metrics

### CVSS Score
- **Range**: 0-10
- **Severity**: none, low, medium, high, critical
- **Use**: Vulnerability severity assessment

### ALE (Annual Loss Expectancy)
- **Formula**: SLE × Annual Rate of Occurrence
- **Range**: $0 - unlimited
- **Use**: Financial impact assessment

### SLE (Single Loss Expectancy)
- **Formula**: Asset Value × Impact Percentage
- **Range**: $0 - unlimited
- **Use**: Single incident impact

### Hybrid Score
- **Range**: 0-100
- **Confidence**: 0-100
- **Use**: Combined risk assessment

### Correlation Strength
- **Range**: 0-100
- **Type**: direct (≥70), indirect (40-69), potential (<40)
- **Use**: Threat-vulnerability-asset linking

### Cascading Risk
- **Range**: 0-100
- **Use**: Lateral movement and impact potential

---

## Common Tasks

### Task 1: Assess Vulnerability Severity
```typescript
const cvss = calculateCVSSFull(baseMetrics);
if (cvss.finalScore >= 9.0) {
    // Critical - immediate action
} else if (cvss.finalScore >= 7.0) {
    // High - urgent action
}
```

### Task 2: Calculate Financial Impact
```typescript
const sle = calculateSLE(assetValue, impactPercentage);
const ale = sle.singleLossExpectancy * annualRateOfOccurrence;
console.log(`Annual loss expectancy: $${ale}`);
```

### Task 3: Determine Treatment Strategy
```typescript
const treatment = determineTreatmentStrategy(cvssScore, aleValue, residualRisk);
console.log(`Strategy: ${treatment.strategy}`);
console.log(`Priority: ${treatment.priority}`);
```

### Task 4: Find Affected Assets
```typescript
const correlations = correlateMultipleThreats(threats, vulnerabilities, assets);
const criticalCorrelations = correlations.filter(c => c.remediationPriority === 'critical');
```

---

## Troubleshooting

### Issue: Correlation strength too low
**Solution**: Check keyword matching in threat/vulnerability titles and descriptions

### Issue: Risk score seems incorrect
**Solution**: Verify likelihood and impact values are 1-5 scale

### Issue: Hybrid score not reflecting questionnaire
**Solution**: Check weight configuration - increase questionnaire weight

### Issue: CVSS score calculation error
**Solution**: Ensure all base metrics are provided (AV, AC, PR, UI, S, C, I, A)

---

## Performance Tips

1. **Batch Correlations**: Use `correlateMultipleThreats()` for multiple items
2. **Cache Matrices**: Retrieve matrices once and reuse
3. **Parallel Processing**: Calculate metrics independently
4. **Optimize Thresholds**: Adjust thresholds to reduce false positives

---

## Next Steps

1. Review `VULNERABILITY-SCORING-ENHANCEMENT.md` for detailed documentation
2. Test API endpoints with sample data
3. Configure thresholds for your organization
4. Create custom risk matrices if needed
5. Integrate with existing risk management workflow

---

## Support

- **Documentation**: `VULNERABILITY-SCORING-ENHANCEMENT.md`
- **Verification**: `ENHANCEMENT-VERIFICATION.md`
- **API Docs**: See endpoint descriptions in documentation
- **Code**: See inline comments in service files

---

**Last Updated**: March 11, 2026
**Status**: Production Ready
