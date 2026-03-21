# Risk Evaluation System - Complete Implementation Guide

## Overview

The Risk Evaluation system has been fully enhanced to meet all requirements for comprehensive risk assessment, scoring, treatment planning, and visualization.

## Requirements Met

### 1. ✅ Predefined Scales/Formulas for Risk Scoring
- **Likelihood × Impact Formula**: Core scoring mechanism (1-5 scale)
- **Risk Score Calculation**: `riskScore = likelihood × impact` (range: 1-25)
- **Risk Level Classification**:
  - Critical: 16-25
  - High: 9-15
  - Medium: 4-8
  - Low: 1-3

**Implementation**: `lib/services/riskEvaluation.ts` - `calculateRiskLevel()`, `generateRiskEvaluation()`

### 2. ✅ Qualitative and Quantitative Methods

#### Qualitative Assessment (High/Medium/Low)
- Risk level determination based on likelihood × impact
- Qualitative labels for likelihood and impact
- Action requirements based on risk category

**Implementation**: `lib/services/riskEvaluation.ts` - `getQualitativeAssessment()`, `getLikelihoodLabel()`, `getImpactLabel()`

#### Quantitative Methods
- **CVSS Score**: Vulnerability severity scoring (0-10 scale)
- **ALES Score**: Asset, Likelihood, Effect, Severity calculation
- **ALE (Annual Loss Expectancy)**: `ALE = SLE × Annual Rate of Occurrence`
- **SLE (Single Loss Expectancy)**: `SLE = Asset Value × Impact Percentage`
- **ROSI (Return on Security Investment)**: Cost-benefit analysis

**Implementation**: 
- `lib/services/riskEvaluation.ts` - `calculateCVSS()`, `calculateALES()`, `calculateALE()`, `calculateROSI()`
- `lib/services/scoringMetricsService.ts` - Full CVSS 3.1 and ALE calculations

### 3. ✅ Risk Criteria Comparison for Significance Determination

The system compares analyzed risks against predefined criteria to determine significance:

**Risk Criteria Levels**:
- **Acceptable** (1-3): Risk within acceptable parameters
- **Tolerable** (4-8): Risk tolerable but monitored
- **Unacceptable** (9-25): Risk requires immediate action

**Significance Determination**:
- Risks marked as "unacceptable" are flagged as significant
- Automatic action recommendations based on criteria
- Acceptability status returned with each evaluation

**Implementation**: 
- `lib/services/riskTreatmentService.ts` - `compareRiskAgainstCriteria()`, `DEFAULT_RISK_CRITERIA`
- `app/api/risk-evaluation/compare-criteria/route.ts` - API endpoint for criteria comparison

### 4. ✅ Risk Matrix Generation for Visualization

#### Standard 5×5 Matrix
- Likelihood (1-5) vs Impact (1-5)
- Color-coded cells for risk levels
- Support for multiple matrix configurations

#### Dynamic Matrix Generation
- Customizable matrix dimensions (3×10)
- Heat-mapping of risk distribution
- Support for inherent and residual risk visualization

**Implementation**:
- `lib/services/riskMatrixService.ts` - Matrix generation and visualization
- `app/api/analysis/risk-matrix/route.ts` - Matrix API endpoints
- `app/api/risk-evaluation/matrix-dynamic/route.ts` - Dynamic matrix generation

### 5. ✅ Customizable Risk Matrices with Heat-Mapping

**Features**:
- Dynamic 5×5 matrix generation from current risk scores
- Heat-map visualization showing risk concentration
- Inherent vs Residual risk comparison
- Risk distribution statistics
- Color-coded intensity based on risk count

**Matrix Customization**:
- Adjustable matrix size (3-10 dimensions)
- Custom likelihood and impact scales
- Custom risk level thresholds
- Custom color schemes

**Implementation**: `app/api/risk-evaluation/matrix-dynamic/route.ts` - Full dynamic matrix generation with heatmapping

### 6. ✅ Risk Treatment Options (Avoid, Transfer, Mitigate, Accept)

#### Treatment Strategies

**Avoid**
- Eliminate the risk source
- Discontinue the activity
- Best for: Critical risks, high-impact scenarios
- Effectiveness: 100%

**Transfer**
- Transfer risk to third party (insurance, outsourcing)
- Best for: Financial risks, operational risks
- Effectiveness: 40-60%

**Mitigate**
- Reduce risk likelihood or impact through controls
- Best for: Most risks, especially medium and high
- Effectiveness: 50-85%

**Accept**
- Accept risk with monitoring and contingency planning
- Best for: Low risks, acceptable residual risks
- Effectiveness: 5-20%

#### Treatment Recommendation Logic
- **Critical Risk**: Avoid (unless business-critical, then Mitigate)
- **High Risk**: Mitigate (or Transfer if cost-sensitive)
- **Medium Risk**: Mitigate (or Accept if controls exist)
- **Low Risk**: Accept with monitoring

**Implementation**:
- `lib/services/riskTreatmentService.ts` - Treatment options and recommendations
- `app/api/risk-evaluation/treatment/route.ts` - Treatment API endpoint

## API Endpoints

### 1. Risk Evaluation Calculation
```
POST /api/risk-evaluation/calculate
```
**Parameters**:
- `likelihood` (1-5): Risk likelihood
- `impact` (1-5): Risk impact
- `assetValue` (optional): Asset value for quantitative analysis
- `hasControls` (optional): Whether controls exist
- `businessCritical` (optional): Whether asset is business-critical
- `costSensitive` (optional): Whether cost is a constraint
- `controlEffectiveness` (optional): Control effectiveness (0-1)

**Response**: Comprehensive risk evaluation with all scoring methods

### 2. Risk Treatment Options
```
POST /api/risk-evaluation/treatment
```
**Parameters**:
- `riskScore`: Calculated risk score
- `riskLevel`: Risk level (low/medium/high/critical)
- `businessCritical`: Whether asset is business-critical
- `costSensitive`: Whether cost is a constraint
- `hasExistingControls`: Whether controls exist

**Response**: Available treatment options and recommendations

### 3. Risk Criteria Comparison
```
POST /api/risk-evaluation/compare-criteria
```
**Parameters**:
- `riskScore`: Risk score to compare
- `riskLevel`: Risk level
- OR `risks`: Array of risks for batch comparison

**Response**: Significance determination and acceptability status

### 4. Dynamic Matrix Generation
```
POST /api/risk-evaluation/matrix-dynamic
```
**Parameters**:
- `risks`: Array of risk objects with likelihood, impact, inherent/residual risk
- `matrixSize`: Matrix dimensions (3-10, default 5)
- `includeInherent`: Include inherent risk matrix
- `includeResidual`: Include residual risk matrix
- `heatmapType`: 'inherent', 'residual', or 'both'

**Response**: Generated matrices with heatmap data and statistics

### 5. Risk Matrix Configuration
```
GET /api/analysis/risk-matrix
POST /api/analysis/risk-matrix
```
**Features**:
- Retrieve available matrix configurations
- Categorize risks using specific matrices
- Get matrix visualization data

## UI Components

### RiskEvaluationCalculator Component
Enhanced calculator with:
- Likelihood and Impact sliders (1-5)
- Asset Value slider
- Control Effectiveness slider
- Context checkboxes (Business Critical, Cost Sensitive, Has Controls)
- Real-time risk calculation
- Treatment option display
- Inherent vs Residual risk comparison
- Risk acceptability indicator
- CVSS score display

**Location**: `app/components/RiskEvaluationCalculator.tsx`

### Risk Evaluation Page
Enhanced page with:
- Assessment filtering and search
- Risk evaluation results display
- Treatment recommendations
- Risk matrix visualization
- Edit capabilities for manual adjustments
- Re-analysis functionality

**Location**: `app/risk-evaluation/page.tsx`

## Data Models

### RiskMetrics
```typescript
interface RiskMetrics {
    likelihood: number;
    impact: number;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    inherentRisk?: number;
    residualRisk?: number;
}
```

### RiskTreatment
```typescript
interface RiskTreatment {
    strategy: 'avoid' | 'transfer' | 'mitigate' | 'accept';
    priority: 'immediate' | 'urgent' | 'planned' | 'routine';
    timeline: string;
    rationale: string;
    estimatedCost?: 'low' | 'medium' | 'high';
}
```

### RiskTreatmentOption
```typescript
interface RiskTreatmentOption {
    id: string;
    strategy: 'avoid' | 'transfer' | 'mitigate' | 'accept';
    title: string;
    description: string;
    estimatedCost: 'low' | 'medium' | 'high';
    implementationTimeline: string;
    expectedRiskReduction: number;
    effectiveness: number;
}
```

### RiskCriteria
```typescript
interface RiskCriteria {
    riskLevel: string;
    scoreRange: [number, number];
    acceptability: 'acceptable' | 'tolerable' | 'unacceptable';
    actionRequired: boolean;
    treatmentStrategy: 'avoid' | 'transfer' | 'mitigate' | 'accept';
    timelineForAction: string;
}
```

## Workflow Examples

### Example 1: Complete Risk Evaluation
```
1. User inputs: Likelihood=4, Impact=5, Business Critical=true
2. System calculates:
   - Risk Score: 20 (Critical)
   - Inherent Risk: 25 (worst case)
   - Residual Risk: 15 (with 40% control effectiveness)
   - CVSS Score: 8.5 (High)
3. System recommends:
   - Strategy: Mitigate (because business-critical)
   - Priority: Immediate
   - Timeline: 24-48 hours
4. Treatment options provided:
   - Emergency controls implementation
   - Insurance transfer (if applicable)
5. Risk matrix updated with new risk position
```

### Example 2: Batch Risk Comparison
```
1. System receives 50 analyzed risks
2. Each risk compared against criteria
3. Results:
   - 5 unacceptable risks (require immediate action)
   - 15 tolerable risks (require monitoring)
   - 30 acceptable risks (routine monitoring)
4. Statistics generated for reporting
```

### Example 3: Dynamic Matrix Generation
```
1. User requests 5×5 matrix for 100 risks
2. System generates:
   - Inherent risk matrix (before controls)
   - Residual risk matrix (after controls)
   - Heat-map showing risk concentration
   - Statistics on risk distribution
3. Visualization shows:
   - High concentration in critical zone
   - Risk reduction effectiveness
   - Areas requiring attention
```

## Integration Points

### With Risk Analysis
- Risk analysis results feed into evaluation
- Likelihood and impact from analysis used for scoring
- Threat and gap information used for context

### With Risk Matrix
- Risk scores plotted on matrix
- Matrix visualization updated with new risks
- Heat-mapping shows risk distribution

### With Reports
- Risk evaluation data included in reports
- Treatment recommendations documented
- Risk reduction metrics tracked

## Best Practices

1. **Regular Re-evaluation**: Re-evaluate risks when controls change
2. **Context Awareness**: Consider business criticality and cost constraints
3. **Treatment Tracking**: Monitor treatment implementation and effectiveness
4. **Criteria Review**: Periodically review and update risk criteria
5. **Documentation**: Document treatment decisions and rationale

## Files Modified/Created

### New Files
- `lib/services/riskTreatmentService.ts` - Risk treatment logic
- `app/api/risk-evaluation/treatment/route.ts` - Treatment API
- `app/api/risk-evaluation/compare-criteria/route.ts` - Criteria comparison API
- `app/api/risk-evaluation/matrix-dynamic/route.ts` - Dynamic matrix API

### Enhanced Files
- `lib/services/riskEvaluation.ts` - Added significance determination
- `app/api/risk-evaluation/calculate/route.ts` - Added control effectiveness parameter
- `app/components/RiskEvaluationCalculator.tsx` - Complete rewrite with new features

## Testing Recommendations

1. **Unit Tests**: Test each scoring formula independently
2. **Integration Tests**: Test API endpoints with various inputs
3. **UI Tests**: Test calculator with different parameter combinations
4. **Matrix Tests**: Verify matrix generation with various risk distributions
5. **Criteria Tests**: Verify significance determination accuracy

## Future Enhancements

1. **Machine Learning**: Predict risk scores based on historical data
2. **Trend Analysis**: Track risk trends over time
3. **Predictive Analytics**: Forecast future risk levels
4. **Advanced Reporting**: Generate detailed risk reports with visualizations
5. **Risk Aggregation**: Aggregate risks across departments/projects
6. **Compliance Mapping**: Map risks to compliance requirements
