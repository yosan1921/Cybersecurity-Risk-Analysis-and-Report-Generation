# Multi-Level Reporting & Visualization System

## Overview

The enhanced reporting system provides comprehensive, multi-level risk assessment reports tailored for different stakeholder groups. It supports four distinct report types and multiple export formats with advanced analytics including heatmaps, trend analysis, and risk treatment recommendations.

## System Architecture

### Core Components

1. **MultiLevelReportService** (`lib/services/multiLevelReportService.ts`)
   - Generates content for all four report levels
   - Produces structured, stakeholder-specific narratives
   - Includes trend analysis and recommendations

2. **ReportExportService** (`lib/services/reportExportService.ts`)
   - Exports reports in multiple formats (PDF, DOCX, PPTX, XLSX)
   - Handles formatting and styling for each format
   - Manages data visualization for presentations

3. **API Endpoints**
   - `/api/reports/generate-multilevel` - Main report generation
   - `/api/reports/analytics` - Heatmaps, trends, and recommendations
   - `/api/reports/export` - Legacy DOCX export (still supported)

4. **UI Component**
   - `MultiLevelReportGenerator.tsx` - React component for report generation UI

## Report Levels

### 1. Strategic Level Report
**Target Audience:** C-Suite Executives, Board Members, Strategic Planners

**Focus Areas:**
- Overall organizational risk posture
- Risk trends and patterns
- Risk appetite alignment
- Resource allocation recommendations
- Governance and compliance requirements
- Business continuity implications
- Stakeholder communication strategy

**Key Metrics:**
- Average risk score across organization
- Critical risk count and trends
- Compliance alignment percentage
- Risk posture classification (HIGH/MEDIUM/LOW)
- Resource allocation priorities

**Typical Sections:**
1. Executive Summary
2. Overall Risk Posture
3. Key Findings
4. Risk Trends
5. Resource Allocation Plan
6. Strategic Recommendations
7. Governance Framework

### 2. Tactical Level Report
**Target Audience:** Security Managers, IT Managers, Department Heads

**Focus Areas:**
- Control effectiveness analysis
- Risk treatment implementation plans
- Compliance framework status
- Implementation roadmap
- Management action items
- Control maturity assessment

**Key Metrics:**
- Control effectiveness percentage
- Compliance status (COMPLIANT/PARTIALLY/NON-COMPLIANT)
- Control maturity level (1-5)
- Treatment plan timeline
- Framework alignment percentages

**Typical Sections:**
1. Management Summary
2. Control Effectiveness Analysis
3. Risk Treatment Plans
4. Compliance Framework Status
5. Implementation Roadmap
6. Management Actions Required

### 3. Operational Level Report
**Target Audience:** Security Teams, System Administrators, Technical Staff

**Focus Areas:**
- Specific vulnerabilities and threats
- Patching requirements
- Configuration changes needed
- Immediate technical action items
- Implementation timeline
- Verification procedures

**Key Metrics:**
- Total vulnerabilities count
- Critical/High vulnerability breakdown
- Patch requirements by priority
- Configuration change count
- Implementation timeline phases

**Typical Sections:**
1. Technical Summary
2. Critical Vulnerabilities (Immediate Action)
3. High-Priority Vulnerabilities
4. Patching Requirements
5. Configuration Changes Required
6. Technical Action Items
7. Implementation Timeline

### 4. Human Awareness Assessment
**Target Audience:** HR, Training Departments, Personnel Managers

**Focus Areas:**
- Cybersecurity awareness capabilities
- Training effectiveness
- Human control effectiveness
- Phishing and social engineering resilience
- Awareness program recommendations
- Improvement roadmap

**Key Metrics:**
- Awareness level (HIGH/MEDIUM/LOW)
- Training effectiveness percentage
- Human error risk percentage
- Phishing click rate
- Incident reporting rate

**Typical Sections:**
1. Awareness Summary
2. Awareness Capabilities
3. Control Effectiveness (Human Factors)
4. Training Assessment
5. Phishing & Social Engineering Resilience
6. Recommendations for Improvement
7. Awareness Program Roadmap

## Export Formats

### PDF Format
- Professional document layout
- Suitable for printing and distribution
- Includes all text content
- Optimized for archival

**Use Cases:**
- Executive briefings
- Regulatory submissions
- Formal documentation
- Email distribution

### DOCX Format (Word)
- Editable document
- Allows customization and annotations
- Includes tables and formatting
- Compatible with Microsoft Office

**Use Cases:**
- Internal editing and customization
- Collaborative review
- Integration with existing workflows
- Template-based modifications

### PPTX Format (PowerPoint)
- Presentation slides
- Visual emphasis on key findings
- Includes charts and graphics
- Suitable for presentations

**Use Cases:**
- Executive presentations
- Board meetings
- Stakeholder briefings
- Training sessions

### XLSX Format (Excel)
- Spreadsheet format
- Detailed data tables
- Sortable and filterable
- Suitable for data analysis

**Use Cases:**
- Detailed data analysis
- Trend tracking
- Comparative analysis
- Integration with BI tools

## Analytics Features

### 1. Risk Heatmap
Visualizes risk distribution across organizational levels and categories.

**Data Structure:**
```
{
  x: "Strategic/Tactical/Operational",
  y: "Category (Governance/Technical/Operational/Compliance)",
  value: "Average Risk Score",
  riskLevel: "CRITICAL/HIGH/MEDIUM/LOW"
}
```

**Interpretation:**
- Red cells: Critical risks requiring immediate attention
- Orange cells: High risks needing urgent mitigation
- Yellow cells: Medium risks for planned treatment
- Green cells: Low risks under control

### 2. Trend Analysis
Shows risk evolution over time with current, projected, and target states.

**Metrics Tracked:**
- Critical risk count
- High risk count
- Medium risk count
- Low risk count
- Average risk score

**Periods:**
- Current: Baseline assessment
- Projected (3 months): Expected improvement with planned mitigations
- Target (12 months): Goal state after full implementation

### 3. Risk Treatment Recommendations
Provides specific mitigation strategies with cost and timeline estimates.

**Treatment Strategies:**
1. **AVOID** - Eliminate the risk source
   - Highest cost, longest timeline
   - Residual risk: 0
   - Use for: High impact, low likelihood risks

2. **TRANSFER** - Use insurance or outsourcing
   - Medium cost, medium timeline
   - Residual risk: 30% of original
   - Use for: High impact, medium likelihood risks

3. **MITIGATE** - Implement controls
   - Medium cost, short timeline
   - Residual risk: 50% of original
   - Use for: Most risks

4. **ACCEPT** - Monitor and accept
   - Low cost, ongoing monitoring
   - Residual risk: 100% of original
   - Use for: Low risks

## API Usage

### Generate Multi-Level Report

**Endpoint:** `POST /api/reports/generate-multilevel`

**Request:**
```json
{
  "analysisId": "507f1f77bcf86cd799439011",
  "level": "strategic",
  "format": "PDF"
}
```

**Parameters:**
- `analysisId` (required): MongoDB ObjectId of the analysis
- `level` (required): One of `strategic`, `tactical`, `operational`, `human-awareness`
- `format` (required): One of `PDF`, `DOCX`, `PPTX`, `XLSX`

**Response:**
- File download with appropriate content-type header
- Filename format: `{level}-report-{analysisId}.{extension}`

**Example:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "507f1f77bcf86cd799439011",
    "level": "strategic",
    "format": "PDF"
  }' \
  -o strategic-report.pdf
```

### Get Report Analytics

**Endpoint:** `POST /api/reports/analytics`

**Request:**
```json
{
  "analysisId": "507f1f77bcf86cd799439011",
  "analyticsType": "all"
}
```

**Parameters:**
- `analysisId` (required): MongoDB ObjectId of the analysis
- `analyticsType` (required): One of `heatmap`, `trends`, `recommendations`, `all`

**Response:**
```json
{
  "success": true,
  "data": {
    "heatmap": [...],
    "trends": [...],
    "recommendations": [...]
  }
}
```

## UI Component Usage

### Basic Implementation

```tsx
import MultiLevelReportGenerator from '@/app/components/MultiLevelReportGenerator';

export default function ReportsPage() {
  return (
    <MultiLevelReportGenerator 
      analysisId="507f1f77bcf86cd799439011"
      company="Acme Corporation"
    />
  );
}
```

### Features

1. **Report Level Selection**
   - Radio button selection
   - Descriptions for each level
   - Visual feedback

2. **Export Format Selection**
   - Grid layout with icons
   - Format descriptions
   - Visual selection

3. **Report Generation**
   - Single-click download
   - Progress indication
   - Error handling

4. **Analytics Visualization**
   - Heatmap display
   - Trend charts
   - Recommendation cards

## Data Requirements

### Minimum Data Structure

```typescript
interface RiskAnalysis {
  _id: ObjectId;
  company: string;
  category: string;
  createdAt: Date;
  strategic: AnalysisItem[];
  tactical: AnalysisItem[];
  operational: AnalysisItem[];
  summary: {
    strategic?: LevelSummary;
    tactical?: LevelSummary;
    operational?: LevelSummary;
  };
}

interface AnalysisItem {
  questionId: number;
  question: string;
  answer: string;
  analysis: {
    likelihood: number;      // 1-5
    impact: number;          // 1-5
    riskScore: number;       // 1-25
    riskLevel: string;       // CRITICAL/HIGH/MEDIUM/LOW
    gap: string;
    threat: string;
    mitigation: string;
    impactDescription: string;
  };
}

interface LevelSummary {
  averageRiskScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  riskDistribution: Record<string, number>;
}
```

## Customization Guide

### Adding Custom Report Sections

1. **Extend MultiLevelReportService:**
```typescript
static generateCustomSection(riskData: RiskData): string {
  // Your custom logic here
  return "Custom section content";
}
```

2. **Update Report Generation:**
```typescript
reportContent += MultiLevelReportService.generateCustomSection(riskData);
```

### Modifying Export Formatting

1. **Edit ReportExportService methods:**
```typescript
static async exportToDOCX(
  reportContent: string,
  metadata: ReportMetadata,
  riskData: RiskData
): Promise<Buffer> {
  // Customize formatting here
}
```

### Adding New Export Formats

1. **Add format to validation:**
```typescript
const validFormats = ["PDF", "DOCX", "PPTX", "XLSX", "YOUR_FORMAT"];
```

2. **Implement export method:**
```typescript
case "YOUR_FORMAT":
  buffer = await ReportExportService.exportToYourFormat(...);
  break;
```

## Performance Considerations

### Report Generation Time
- Strategic: ~2-3 seconds
- Tactical: ~2-3 seconds
- Operational: ~3-4 seconds
- Human Awareness: ~2-3 seconds

### File Sizes (Typical)
- PDF: 500KB - 2MB
- DOCX: 300KB - 1MB
- PPTX: 400KB - 1.5MB
- XLSX: 200KB - 800KB

### Optimization Tips
1. Cache frequently generated reports
2. Use background jobs for large analyses
3. Implement pagination for large datasets
4. Compress images in presentations

## Security Considerations

1. **Authentication:** All endpoints require valid session
2. **Authorization:** Users can only access their own analyses
3. **Data Sanitization:** All user input is validated
4. **File Handling:** Temporary files are cleaned up
5. **Export Limits:** Rate limiting on report generation

## Troubleshooting

### Common Issues

**Issue: Report generation fails with "Analysis not found"**
- Verify analysisId is correct
- Check MongoDB connection
- Ensure analysis has required data

**Issue: Export format not supported**
- Verify format is one of: PDF, DOCX, PPTX, XLSX
- Check library versions in package.json
- Review error logs

**Issue: Analytics data is empty**
- Ensure analysis has data for selected level
- Check data structure matches requirements
- Verify risk scores are calculated

### Debug Mode

Enable detailed logging:
```typescript
console.log('Report generation started:', { analysisId, level, format });
console.log('Risk data:', riskData);
console.log('Report content:', reportContent);
```

## Best Practices

1. **Report Generation**
   - Generate reports after analysis completion
   - Cache reports for frequently accessed analyses
   - Use appropriate level for audience

2. **Export Selection**
   - PDF for formal distribution
   - DOCX for internal editing
   - PPTX for presentations
   - XLSX for detailed analysis

3. **Analytics Usage**
   - Review heatmaps for risk concentration
   - Track trends over time
   - Prioritize recommendations by impact

4. **Stakeholder Communication**
   - Use strategic reports for executives
   - Use tactical reports for managers
   - Use operational reports for technical teams
   - Use human awareness for training

## Integration Examples

### With Dashboard
```tsx
<MultiLevelReportGenerator 
  analysisId={selectedAnalysis._id}
  company={selectedAnalysis.company}
/>
```

### With Notification System
```typescript
// After report generation
await notifyStakeholders({
  level: 'strategic',
  analysisId: analysis._id,
  reportUrl: `/reports/${analysis._id}/strategic`
});
```

### With Scheduling
```typescript
// Generate reports on schedule
schedule.every('1 week').do(async () => {
  const analyses = await RiskAnalysis.find({ active: true });
  for (const analysis of analyses) {
    await generateReport(analysis._id, 'strategic', 'PDF');
  }
});
```

## Future Enhancements

1. **Real-time Collaboration**
   - Multi-user report editing
   - Comment and annotation system
   - Version control

2. **Advanced Analytics**
   - Predictive risk modeling
   - Anomaly detection
   - Comparative analysis

3. **Integration**
   - SIEM integration
   - Ticketing system integration
   - Email distribution

4. **Customization**
   - Custom branding
   - Template system
   - Workflow automation

## Support & Resources

- **Documentation:** See this file
- **API Reference:** Check endpoint comments
- **Component Props:** Review TypeScript interfaces
- **Examples:** See integration examples section

## Version History

- **v1.0** (Current)
  - Multi-level report generation
  - Four export formats
  - Analytics and heatmaps
  - Trend analysis
  - Risk treatment recommendations

---

**Last Updated:** March 2026
**Status:** Production Ready
