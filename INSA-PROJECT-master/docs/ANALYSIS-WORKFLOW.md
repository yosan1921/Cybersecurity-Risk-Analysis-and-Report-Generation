# Risk Analysis Workflow Guide

## 🎯 System Overview

CSRARS automatically analyzes cyber security risks using **both qualitative and quantitative methods** across three organizational levels:

- **Strategic Level** - Executive decision-making and business impact
- **Tactical Level** - Risk management and control implementation
- **Operational Level** - Technical vulnerability assessment

### Analysis Methods

**Quantitative:** Risk Score = Likelihood × Impact (1-25 scale)  
**Qualitative:** Gap analysis, threat identification, mitigation recommendations

---

## 📊 Understanding Questionnaire Status

Your CSRARS system now supports three questionnaire statuses:

| Status | Description | Analysis Status | Actions Available |
|--------|-------------|-----------------|-------------------|
| **draft** | Questions imported but not answered | Not analyzed | Fill answers, then submit |
| **pending** | Submitted for analysis | Analysis in progress | Wait for completion |
| **analyzed** | Analysis complete | Complete with gap/impact/threat | View results, re-analyze |

---

## 🔄 Complete Workflow

### Scenario 1: Import Template (No Answers)

```
1. Import INSA Template
   ↓
2. Status: draft
   ↓
3. Fill out all 58 questions
   ↓
4. Click "Submit for Analysis"
   ↓
5. Status changes to: pending
   ↓
6. AI analyzes each question
   - Calculates likelihood & impact
   - Identifies gaps
   - Identifies threats
   - Suggests mitigations
   ↓
7. Status changes to: analyzed
   ↓
8. View results in Risk Analysis dashboard
```

### Scenario 2: Import from External System (With Answers)

```
1. Import questionnaire with answers
   ↓
2. Status: pending (auto-set if answers present)
   ↓
3. AI automatically analyzes
   - Calculates likelihood & impact
   - Identifies gaps
   - Identifies threats
   - Suggests mitigations
   ↓
4. Status changes to: analyzed
   ↓
5. View results in Risk Analysis dashboard
```

---

## 🎯 When Analysis Happens

### Automatic Analysis Triggers

Analysis runs automatically when:
1. **New questionnaire saved** with `status: 'pending'`
2. **Questionnaire updated** from `draft` to `pending`
3. **Manual trigger** via "Run Analysis" button

### What Gets Analyzed

For each question, the AI evaluates:

✅ **Likelihood** (1-5): Probability of risk occurring
- 1 = Remote (< 10%)
- 2 = Low (10-30%)
- 3 = Moderate (30-50%)
- 4 = High (50-80%)
- 5 = Almost Certain (> 80%)

✅ **Impact** (1-5): Severity of consequences
- 1 = Minimal (minor inconvenience)
- 2 = Low (slight disruption)
- 3 = Moderate (significant disruption)
- 4 = High (severe impact)
- 5 = Critical (catastrophic consequences)

✅ **Risk Score**: Likelihood × Impact (1-25 range)

✅ **Gap**: What security control is missing or weak

✅ **Threat**: What attack or risk could exploit this gap

✅ **Mitigation**: Recommended action to address the risk

✅ **Impact Description**: Detailed business/security consequences

### Analysis Levels

The system analyzes questions at three organizational levels:

**Operational Level:**
- Technical vulnerabilities and system-level risks
- Day-to-day security operations
- Implementation details

**Tactical Level:**
- Policy and procedure effectiveness
- Control implementation status
- Management actions needed

**Strategic Level:**
- Business impact and governance
- Executive decision requirements
- Strategic priorities

---

## 📋 Import Methods Comparison

### Method 1: INSA Template Import

**URL:** http://localhost:3000/import-questionnaire-web.html

**Result:**
- 58 questions with "Not Answered" default
- Status: `draft`
- **No analysis** until you fill answers and submit

**Use When:**
- Starting a new assessment
- Need to fill out questions manually
- Want to review questions before answering

### Method 2: External System Import

**URL:** http://localhost:3000/import-external-questionnaire.html

**Result:**
- Questions with your provided answers
- Status: `pending` (if answers provided) or `draft` (if no answers)
- **Automatic analysis** if answers are present

**Use When:**
- Importing completed assessments
- Migrating from another system
- Bulk importing historical data

---

## 🔍 Checking Analysis Status

### Via Assessment Dashboard

1. Navigate to **Assessment** page
2. Look at the status badge:
   - 🟦 **Draft** = Not submitted yet
   - 🟨 **Pending** = Analysis in progress
   - 🟦 **Analyzed** = Complete

### Via Risk Analysis Dashboard

1. Navigate to **Risk Analysis** page
2. Find your company/questionnaire
3. View detailed results:
   - Risk scores
   - Gaps identified
   - Threats identified
   - Mitigation recommendations

---

## ⚙️ API Endpoints

### Submit Draft for Analysis

```bash
POST /api/questionnaires/submit
Content-Type: application/json

{
  "questionnaireId": "65f8a3b2c1d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Questionnaire submitted for analysis",
  "questionnaire": {
    "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
    "title": "INSA Cyber Security Risk Assessment Checklist",
    "status": "pending"
  }
}
```

### Trigger Re-Analysis

```bash
POST /api/analysis/process
Content-Type: application/json

{
  "questionnaireId": "65f8a3b2c1d4e5f6a7b8c9d0"
}
```

---

## 🛠️ Troubleshooting

### Issue: "No gap/impact/threat in results"

**Possible Causes:**
1. Questionnaire status is still `draft`
2. Analysis hasn't completed yet
3. Questions have "Not Answered" as answers

**Solutions:**
1. Check status on Assessment page
2. If `draft`, click "Submit for Analysis"
3. Wait for status to change to `analyzed`
4. Refresh Risk Analysis page

### Issue: "Analysis not starting"

**Possible Causes:**
1. No API key configured
2. Questions not answered
3. Status not set to `pending`

**Solutions:**
1. Check `.env.local` for `OPENROUTER_API_KEY`
2. Ensure questions have real answers (not "Not Answered")
3. Click "Submit for Analysis" button

### Issue: "Analysis stuck on pending"

**Possible Causes:**
1. API rate limiting
2. Network issues
3. Analysis lock not released

**Solutions:**
1. Wait 5-10 minutes
2. Check server logs for errors
3. Try "Run Analysis" again

---

## 📊 Analysis Output Example

For each question, you'll see:

```json
{
  "questionId": 1,
  "question": "Are all data center entry points protected?",
  "answer": "No",
  "section": "Physical Security Controls",
  "level": "operational",
  "analysis": {
    "likelihood": 4,
    "likelihoodLabel": "High",
    "impact": 3,
    "impactLabel": "Moderate",
    "riskScore": 12,
    "riskLevel": "MEDIUM",
    "riskColor": "#f97316",
    "gap": "Physical access controls are not implemented at all data center entry points",
    "threat": "Unauthorized physical access could lead to data theft, equipment tampering, or service disruption",
    "mitigation": "Implement badge readers, biometric authentication, and mantrap systems at all entry points",
    "impactDescription": "Significant disruption to operations with potential data breach and compliance violations"
  }
}
```

### Report Generation

After analysis completes, you can generate three types of reports:

**Strategic Report:**
- Executive summary and business impact
- Strategic priorities and governance
- Resource allocation recommendations
- For: CEO, CIO, CISO, Board

**Tactical Report:**
- Control effectiveness analysis
- Policy and procedure recommendations
- Training and incident response planning
- For: IT Managers, Security Managers, Risk Managers

**Operational Report:**
- Detailed vulnerability assessment
- Technical implementation steps
- Patch management priorities
- For: System Admins, Security Engineers, IT Staff

Each report includes:
- Risk matrix visualization
- Quantitative metrics (risk scores, distributions)
- Qualitative assessments (gaps, threats, mitigations)
- Prioritized recommendations with timelines

---

## 💡 Best Practices

1. **Answer all questions** before submitting for analysis
2. **Use specific answers** (Yes/No/Partially Implemented/Not Applicable)
3. **Submit once** - avoid multiple submissions while analysis is running
4. **Review results** in Risk Analysis dashboard
5. **Re-analyze** after implementing mitigations to track improvement
6. **Export reports** for stakeholders and compliance

---

## 🎓 Understanding Risk Scores

### Risk Score Calculation

```
Risk Score = Likelihood × Impact
Range: 1-25
```

### Risk Levels

| Score | Level | Color | Action Required |
|-------|-------|-------|-----------------|
| 21-25 | CRITICAL | 🔴 Red | Immediate action (within 30 days) |
| 16-20 | HIGH | 🟠 Orange | Priority action (30-90 days) |
| 9-15 | MEDIUM | 🟡 Yellow | Address soon (3-6 months) |
| 4-8 | LOW | 🟢 Green | Monitor (6-12 months) |
| 1-3 | VERY LOW | 🔵 Blue | Acceptable (12+ months) |

### Risk Metrics

**Inherent Risk:** Risk level before security controls are applied  
**Residual Risk:** Risk level after security controls are implemented  
**Risk Reduction:** Difference between inherent and residual risk

---

## 📚 Related Documentation

- **SYSTEM-OVERVIEW.md** - Complete system documentation
- **QUICK-REFERENCE.md** - Quick reference guide
- **IMPORT-SUMMARY.md** - Overview of import methods
- **EXTERNAL-IMPORT-GUIDE.md** - External system integration
- **README.md** - Technical setup and architecture

---

For questions or issues, refer to the main documentation or contact your system administrator.
