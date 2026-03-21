# Risk Register - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Files Created
✅ MongoDB Model: `lib/models/RiskRegister.ts`
✅ API Endpoints: `app/api/risk-register/` (create, list, update, analytics)
✅ UI Component: `app/components/RiskRegisterManager.tsx`
✅ Service: Already exists in `lib/services/riskRegisterService.ts`

### 2. Add to Your App

Create `app/risk-register/page.tsx`:
```tsx
'use client';

import RiskRegisterManager from '@/app/components/RiskRegisterManager';

export default function RiskRegisterPage() {
  return (
    <div className="p-6">
      <RiskRegisterManager company="Your Company" />
    </div>
  );
}
```

### 3. Add Navigation Link
```tsx
<Link href="/risk-register">📋 Risk Register</Link>
```

## 🚀 Quick API Tests

### Create a Risk
```bash
curl -X POST http://localhost:3000/api/risk-register/create \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "test-123",
    "company": "Acme Corp",
    "riskData": {
      "riskName": "Data Breach",
      "description": "Unauthorized access",
      "likelihood": 3,
      "impact": 5,
      "riskLevel": "HIGH"
    },
    "owner": "security@acme.com"
  }'
```

### List Risks
```bash
curl "http://localhost:3000/api/risk-register/list?company=Acme%20Corp"
```

### Update Risk Status
```bash
curl -X PUT http://localhost:3000/api/risk-register/update \
  -H "Content-Type: application/json" \
  -d '{
    "riskId": "RISK-1234567890",
    "updateType": "status",
    "data": {
      "newStatus": "in_progress",
      "reason": "Mitigation started"
    }
  }'
```

### Add Treatment Action
```bash
curl -X PUT http://localhost:3000/api/risk-register/update \
  -H "Content-Type: application/json" \
  -d '{
    "riskId": "RISK-1234567890",
    "updateType": "add_action",
    "data": {
      "description": "Implement encryption",
      "owner": "tech@acme.com",
      "dueDate": "2026-04-15"
    }
  }'
```

### Get Analytics
```bash
curl -X POST http://localhost:3000/api/risk-register/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Acme Corp",
    "analyticsType": "full"
  }'
```

## 📋 Risk Register Features

### Document Risks
- ✅ Risk name and description
- ✅ Category and level
- ✅ Inherent and residual risk scores
- ✅ Owner assignment

### Track Status
- ✅ Open, In Progress, Mitigated, Accepted, Transferred, Avoided, Closed
- ✅ Status change history
- ✅ Reason tracking

### Plan Treatment
- ✅ Four strategies: Avoid, Transfer, Mitigate, Accept
- ✅ Priority levels: Immediate, Urgent, Planned, Routine
- ✅ Target dates and cost estimates

### Manage Actions
- ✅ Add multiple treatment actions
- ✅ Track status and progress
- ✅ Assign owners and due dates
- ✅ Monitor overdue items

### Implement Controls
- ✅ Preventive, Detective, Corrective
- ✅ Effectiveness tracking (0-100%)
- ✅ Implementation status
- ✅ Test results

### Monitor Metrics
- ✅ Custom metrics per risk
- ✅ Trend tracking
- ✅ Measurement dates

### Audit Trail
- ✅ Complete change history
- ✅ User tracking
- ✅ Timestamps
- ✅ Previous/new values

## 📊 Analytics Available

### Portfolio Summary
- Total risks
- Critical risks
- Overdue actions
- Risk reduction %
- Overall trend

### Distribution
- By status
- By level
- By category

### Critical Risks
- High residual risk items
- Owner and status

### Overdue Actions
- Past due items
- Days overdue
- Owner info

## 🔄 Typical Workflow

1. **Identify Risk**
   - Create risk entry from analysis
   - Set inherent risk scores
   - Assign owner

2. **Plan Treatment**
   - Choose treatment strategy
   - Set priority and target date
   - Estimate cost

3. **Add Actions**
   - Break down into actions
   - Assign owners
   - Set due dates

4. **Implement Controls**
   - Add preventive controls
   - Implement and test
   - Record effectiveness

5. **Monitor Progress**
   - Update action status
   - Track metrics
   - Update residual risk

6. **Close Risk**
   - Mark as closed
   - Record closure date
   - Document lessons learned

## 📈 Key Metrics

### Risk Scores
- Inherent Risk = Likelihood × Impact (1-25)
- Residual Risk = After controls (1-25)
- Risk Reduction = (Inherent - Residual) / Inherent × 100%

### Status Distribution
- Open: Not yet addressed
- In Progress: Treatment underway
- Mitigated: Controls implemented
- Accepted: Risk accepted
- Transferred: Risk transferred
- Avoided: Risk eliminated
- Closed: Risk resolved

### Priority Levels
- Immediate: CRITICAL risks (0-2 days)
- Urgent: HIGH risks (0-14 days)
- Planned: MEDIUM risks (0-90 days)
- Routine: LOW risks (0-180 days)

## 🎯 Common Tasks

### Create Risk from Analysis
```typescript
const risks = analysis.strategic.map(item => ({
  riskName: item.analysis.gap,
  description: item.analysis.threat,
  likelihood: item.analysis.likelihood,
  impact: item.analysis.impact,
  riskLevel: item.analysis.riskLevel
}));

for (const risk of risks) {
  await fetch('/api/risk-register/create', {
    method: 'POST',
    body: JSON.stringify({
      analysisId: analysis._id,
      company: analysis.company,
      riskData: risk,
      owner: currentUser.email
    })
  });
}
```

### Get Critical Risks
```typescript
const response = await fetch('/api/risk-register/analytics', {
  method: 'POST',
  body: JSON.stringify({
    company: 'Acme Corp',
    analyticsType: 'critical'
  })
});
const data = await response.json();
console.log(data.criticalRisks);
```

### Track Overdue Actions
```typescript
const response = await fetch('/api/risk-register/analytics', {
  method: 'POST',
  body: JSON.stringify({
    company: 'Acme Corp',
    analyticsType: 'actions'
  })
});
const data = await response.json();
console.log(data.overdueActions);
```

## ✅ Verification Checklist

- [ ] All files created successfully
- [ ] No TypeScript errors
- [ ] Project builds without errors
- [ ] Can create risk entries
- [ ] Can list risks
- [ ] Can update risk status
- [ ] Can add treatment actions
- [ ] Can get analytics
- [ ] UI component loads
- [ ] All features working

## 📚 Documentation

- **RISK-REGISTER-COMPLETE.md** - Full documentation
- **RISK-REGISTER-QUICK-START.md** - This file
- **lib/services/riskRegisterService.ts** - Service functions
- **lib/models/RiskRegister.ts** - Data model

## 🚀 Next Steps

1. ✅ Add risk register page to navigation
2. ✅ Create risks from analysis
3. ✅ Assign treatment strategies
4. ✅ Add treatment actions
5. ✅ Implement controls
6. ✅ Monitor progress
7. ✅ Close resolved risks

---

**Status:** ✅ Ready to Use
**Version:** 1.0
**Last Updated:** March 2026
