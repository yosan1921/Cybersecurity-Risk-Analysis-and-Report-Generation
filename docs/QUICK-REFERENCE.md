# CSRARS Quick Reference Guide

## 🚀 Quick Start

### What This System Does
Automatically analyzes cyber security risks and generates reports at three levels:
- **Strategic** (for executives)
- **Tactical** (for managers)  
- **Operational** (for technical staff)

### Basic Workflow
```
1. Import Questionnaire
2. Answer Questions
3. Submit for Analysis
4. View Results
5. Generate Reports
```

---

## 📊 Risk Scoring

### Risk Score Formula
```
Risk Score = Likelihood × Impact
Range: 1 to 25
```

### Likelihood (1-5)
| Score | Label | Probability |
|-------|-------|-------------|
| 1 | Remote | < 10% |
| 2 | Low | 10-30% |
| 3 | Moderate | 30-50% |
| 4 | High | 50-80% |
| 5 | Almost Certain | > 80% |

### Impact (1-5)
| Score | Label | Description |
|-------|-------|-------------|
| 1 | Minimal | Minor inconvenience |
| 2 | Low | Slight disruption |
| 3 | Moderate | Significant disruption |
| 4 | High | Severe impact |
| 5 | Critical | Catastrophic consequences |

### Risk Levels
| Score | Level | Color | Action Timeline |
|-------|-------|-------|-----------------|
| 21-25 | CRITICAL | 🔴 Red | 0-30 days |
| 16-20 | HIGH | 🟠 Orange | 30-90 days |
| 9-15 | MEDIUM | 🟡 Yellow | 3-6 months |
| 4-8 | LOW | 🟢 Green | 6-12 months |
| 1-3 | VERY LOW | 🔵 Blue | 12+ months |

---

## 🎯 Report Types

### Strategic Report
**For:** CEO, CIO, CISO, Board of Directors

**Contains:**
- Executive summary
- Business impact assessment
- Strategic priorities
- Governance recommendations
- Budget and resource guidance

**Use For:**
- Board presentations
- Budget justification
- Strategic planning

---

### Tactical Report
**For:** IT Managers, Security Managers, Risk Managers

**Contains:**
- Control effectiveness analysis
- Policy recommendations
- Training programs
- Incident response planning
- Vendor risk management

**Use For:**
- Management meetings
- Policy development
- Training planning

---

### Operational Report
**For:** System Admins, Security Engineers, IT Staff

**Contains:**
- Detailed vulnerability assessment
- Technical specifications
- Implementation procedures
- Patch priorities
- Monitoring requirements

**Use For:**
- Technical implementation
- Remediation tracking
- Daily operations

---

## 📋 Common Tasks

### Import Questionnaire
```
1. Go to: Assessment page
2. Click: "Import Questionnaire"
3. Choose: INSA Template or External Import
4. Fill in company details
5. Click: "Import"
```

### Submit for Analysis
```
1. Go to: Assessment page
2. Find your questionnaire
3. Ensure all questions are answered
4. Click: "Submit for Analysis"
5. Wait for status to change to "analyzed"
```

### View Results
```
1. Go to: Risk Analysis Dashboard
2. Select your company
3. View risk scores by level:
   - Operational
   - Tactical
   - Strategic
4. Review top risks and recommendations
```

### Generate Report
```
1. Go to: Reports page
2. Select your analysis
3. Choose level: Strategic/Tactical/Operational
4. Click: "Generate Report"
5. Download in preferred format (PDF/DOCX)
```

---

## 🔍 Understanding Results

### Risk Analysis Dashboard

**Operational Section:**
- Technical vulnerabilities
- System-level risks
- Implementation gaps

**Tactical Section:**
- Policy gaps
- Control effectiveness
- Management actions

**Strategic Section:**
- Business impact
- Governance issues
- Executive decisions

### Summary Statistics

**Per Level:**
- Total questions analyzed
- Risk distribution (Critical/High/Medium/Low/Very Low)
- Average risk score
- Top 3 risks

**Overall:**
- Total questions (all levels)
- Overall risk distribution
- Overall average score

---

## ⚡ Tips & Best Practices

### For Accurate Analysis
✅ Answer all questions completely  
✅ Be specific and honest  
✅ Use consistent terminology  
✅ Provide context when needed  

### For Better Reports
✅ Choose the right level for your audience  
✅ Review results before generating reports  
✅ Customize recommendations if needed  
✅ Export in appropriate format  

### For Ongoing Management
✅ Re-assess quarterly  
✅ Track remediation progress  
✅ Update after major changes  
✅ Share reports with stakeholders  

---

## 🛠️ Troubleshooting

### Analysis Not Starting
**Problem:** Status stuck on "draft"  
**Solution:** Click "Submit for Analysis" button

**Problem:** Status stuck on "pending"  
**Solution:** Wait 5-10 minutes, then refresh page

**Problem:** Error message appears  
**Solution:** Check that all questions are answered

### No Results Showing
**Problem:** Dashboard is empty  
**Solution:** Ensure analysis status is "analyzed"

**Problem:** Results incomplete  
**Solution:** Re-run analysis from Assessment page

### Report Generation Fails
**Problem:** "Analysis not found" error  
**Solution:** Verify analysis is complete first

**Problem:** "Invalid level" error  
**Solution:** Use strategic, tactical, or operational

---

## 📞 Need Help?

### Documentation
- **SYSTEM-OVERVIEW.md** - Complete system documentation
- **ANALYSIS-WORKFLOW.md** - Detailed workflow guide
- **IMPORT-SUMMARY.md** - Import methods
- **README.md** - Technical setup

### Support
Contact via Telegram: @novat123

---

## 🎓 Key Concepts

### Inherent Risk
Risk level **before** security controls are applied

### Residual Risk
Risk level **after** security controls are implemented

### Risk Reduction
Difference between inherent and residual risk

### Gap Analysis
Identifies missing or weak security controls

### Threat Identification
Identifies potential attacks that could exploit gaps

### Mitigation
Recommended actions to reduce risk

---

## 📈 Metrics Explained

### Average Risk Score
Mean of all risk scores for a level or overall

### Risk Distribution
Count of risks by level (Critical/High/Medium/Low/Very Low)

### Top Risks
Highest-scoring risks requiring immediate attention

### Total Questions
Number of questions analyzed at each level

---

## ✅ Checklist

### Before Analysis
- [ ] Questionnaire imported
- [ ] All questions answered
- [ ] Company details correct
- [ ] Status is "draft"

### During Analysis
- [ ] Status changed to "pending"
- [ ] Wait for completion (5-10 min)
- [ ] Check for notifications

### After Analysis
- [ ] Status is "analyzed"
- [ ] Results visible in dashboard
- [ ] Review risk scores
- [ ] Check top risks

### Report Generation
- [ ] Analysis complete
- [ ] Level selected
- [ ] Report generated
- [ ] Downloaded/shared

---

**Version:** 2.0  
**Last Updated:** 2024
