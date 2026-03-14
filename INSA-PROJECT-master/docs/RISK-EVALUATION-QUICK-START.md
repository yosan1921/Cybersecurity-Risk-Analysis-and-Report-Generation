# Risk Evaluation System - Quick Start Guide

## What's New

The Risk Evaluation system now provides complete enterprise-grade risk assessment with:
- ✅ Predefined scoring formulas (Likelihood × Impact)
- ✅ Qualitative (High/Medium/Low) and Quantitative (CVSS, ALES, ALE) methods
- ✅ Automatic risk significance determination
- ✅ Dynamic risk matrix generation with heat-mapping
- ✅ Comprehensive treatment options (Avoid, Transfer, Mitigate, Accept)

## Quick Examples

### 1. Calculate Risk Score
```javascript
// Input: Likelihood=4, Impact=5
// Output: Risk Score = 20 (Critical)

const response = await fetch('/api/risk-evaluation/calculate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    likelihood: 4,
    impact: 5,
    businessCritical: true,
    controlEffectiveness: 0.4
  })
});

const { evaluation } = await response.json();
console.log(evaluation.riskLevel); // "critical"
console.log(evaluation.riskScore); // 20
console.log(evaluation.inherentRisk); // 25
console.log(evaluation.residualRisk); // 15
```

### 2. Get Treatment Options
```javascript
const response = await fetch('/api/risk-evaluation/treatment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    riskScore: 20,
    riskLevel: 'critical',
    businessCritical: true
  })
});

const { recommendation, options } = await response.json();
console.log(recommendation.recommendedStrategy); // "mitigate"
console.log(recommendation.priority); // "immediate"
console.log(recommendation.timeline); // "24-48 hours"
```

### 3. Compare Against Risk Criteria
```javascript
const response = await fetch('/api/risk-evaluation/compare-criteria', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    riskScore: 20,
    riskLevel: 'critical'
  })
});

const { comparison } = await response.json();
console.log(comparison.acceptability); // "unacceptable"
console.log(comparison.isSignificant); // true
console.log(comparison.recommendation); // Action required
```

### 4. Generate Risk Matrix
```javascript
const response = await fetch('/api/risk-evaluation/matrix-dynamic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    risks: [
      { id: 'r1', likelihood: 4, impact: 5, inherentRisk: 20, residualRisk: 8 },
      { id: 'r2', likelihood: 2, impact: 3, inherentRisk: 6, residualRisk: 3 }
    ],
    matrixSize: 5,
    heatmapType: 'both'
  })
});

const { matrices, heatmap, statistics } = await response.json();
console.log(statistics.inherent.average); // Average inherent risk
console.log(statistics.residual.average); // Average residual risk
console.log(statistics.riskReduction.percentage); // % reduction
```

## Risk Scoring Quick Reference

### Risk Levels
| Score | Level | Action |
|-------|-------|--------|
| 1-3 | Low | Accept, Monitor |
| 4-8 | Medium | Mitigate or Accept |
| 9-15 | High | Mitigate |
| 16-20 | Critical | Avoid or Mitigate |
| 21-25 | Critical | Avoid or Mitigate |

### Treatment Strategies
| Strategy | Best For | Effectiveness | Cost |
|----------|----------|---------------|------|
| Avoid | Critical risks | 100% | High |
| Transfer | Financial risks | 40-60% | Medium |
| Mitigate | Most risks | 50-85% | Low-Medium |
| Accept | Low risks | 5-20% | Low |

## UI Usage

### Risk Evaluation Calculator
1. Open Risk Evaluation page
2. Adjust Likelihood slider (1-5)
3. Adjust Impact slider (1-5)
4. Set Asset Value if needed
5. Check context boxes (Business Critical, Cost Sensitive, etc.)
6. Click "Calculate Risk"
7. Review results:
   - Risk Score and Level
   - Inherent vs Residual Risk
   - Treatment Recommendation
   - Available Treatment Options
   - CVSS Score

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/risk-evaluation/calculate` | POST | Calculate comprehensive risk evaluation |
| `/api/risk-evaluation/treatment` | POST | Get treatment options and recommendations |
| `/api/risk-evaluation/compare-criteria` | POST | Compare risk against criteria |
| `/api/risk-evaluation/matrix-dynamic` | POST | Generate dynamic risk matrices |
| `/api/analysis/risk-matrix` | GET/POST | Manage risk matrix configurations |

## Key Metrics Explained

### Risk Score
- **Formula**: Likelihood × Impact
- **Range**: 1-25
- **Example**: 4 × 5 = 20 (Critical)

### Inherent Risk
- **Definition**: Risk before controls
- **Calculation**: Assumes worst-case scenario
- **Use**: Baseline for risk reduction measurement

### Residual Risk
- **Definition**: Risk after controls
- **Calculation**: Inherent Risk × (1 - Control Effectiveness)
- **Use**: Actual risk level with controls in place

### Risk Reduction
- **Formula**: Inherent Risk - Residual Risk
- **Percentage**: (Risk Reduction / Inherent Risk) × 100
- **Use**: Measure control effectiveness

### CVSS Score
- **Range**: 0-10
- **Severity**: None, Low, Medium, High, Critical
- **Use**: Vulnerability severity assessment

### ALE (Annual Loss Expectancy)
- **Formula**: SLE × Annual Rate of Occurrence
- **Use**: Financial impact quantification
- **Example**: $100,000 × 0.2 = $20,000/year

## Common Workflows

### Workflow 1: Evaluate New Risk
```
1. Input likelihood and impact
2. System calculates risk score
3. Review risk level and significance
4. Get treatment recommendations
5. Select treatment option
6. Calculate residual risk
7. Document decision
```

### Workflow 2: Batch Risk Assessment
```
1. Import multiple risks
2. Calculate scores for all
3. Compare against criteria
4. Identify significant risks
5. Generate risk matrix
6. Prioritize treatment
7. Create action plan
```

### Workflow 3: Risk Reduction Tracking
```
1. Record inherent risk
2. Implement treatment
3. Recalculate with controls
4. Measure residual risk
5. Calculate risk reduction %
6. Verify effectiveness
7. Update risk register
```

## Tips & Best Practices

1. **Use Context**: Always provide business context (critical, cost-sensitive)
2. **Update Controls**: Adjust control effectiveness as controls improve
3. **Regular Review**: Re-evaluate risks quarterly or when conditions change
4. **Document Decisions**: Record treatment decisions and rationale
5. **Track Effectiveness**: Monitor treatment implementation and results
6. **Batch Processing**: Use batch comparison for portfolio-level analysis
7. **Matrix Visualization**: Use heat-maps to identify risk concentrations

## Troubleshooting

### Issue: Risk score seems wrong
- **Check**: Likelihood and Impact values (should be 1-5)
- **Verify**: Formula is Likelihood × Impact
- **Example**: 4 × 5 = 20 ✓

### Issue: Treatment options not showing
- **Check**: Risk level is correctly calculated
- **Verify**: API endpoint is accessible
- **Try**: Refresh the page

### Issue: Matrix not generating
- **Check**: Risk data includes likelihood and impact
- **Verify**: Matrix size is between 3-10
- **Try**: Use default 5×5 matrix

## Support Resources

- **Documentation**: See `RISK-EVALUATION-IMPLEMENTATION.md`
- **API Examples**: See `RISK-EVALUATION-SUMMARY.md`
- **Code**: Check `lib/services/riskTreatmentService.ts`
- **UI**: Check `app/components/RiskEvaluationCalculator.tsx`

## Next Steps

1. ✅ Review this quick start guide
2. ✅ Try the Risk Evaluation Calculator
3. ✅ Test API endpoints with sample data
4. ✅ Review treatment recommendations
5. ✅ Generate risk matrices
6. ✅ Integrate with your workflow
7. ✅ Train team members
8. ✅ Start using for risk assessments
