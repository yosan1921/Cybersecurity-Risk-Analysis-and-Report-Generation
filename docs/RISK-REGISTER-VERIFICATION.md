# Risk Register - Verification & Testing Guide

## ✅ Quick Verification (5 minutes)

### Step 1: Check Files Exist
```bash
ls -la lib/models/RiskRegister.ts
ls -la app/api/risk-register/create/route.ts
ls -la app/api/risk-register/list/route.ts
ls -la app/api/risk-register/update/route.ts
ls -la app/api/risk-register/analytics/route.ts
ls -la app/components/RiskRegisterManager.tsx
```

**Expected:** All files exist

### Step 2: Build Project
```bash
npm run build
```

**Expected:** Build completes without errors

### Step 3: Start Dev Server
```bash
npm run dev
```

**Expected:** Server starts successfully

## 🧪 Functional Testing (15 minutes)

### Test 1: Create Risk Entry
```bash
curl -X POST http://localhost:3000/api/risk-register/create \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "test-123",
    "company": "Test Corp",
    "riskData": {
      "riskName": "Data Breach",
      "description": "Unauthorized access to customer data",
      "likelihood": 3,
      "impact": 5,
      "riskLevel": "HIGH"
    },
    "owner": "security@test.com"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "riskId": "RISK-...",
  "entry": { ... }
}
```

**Verification:**
- ✅ Returns success: true
- ✅ riskId is generated
- ✅ Entry contains all fields
- ✅ Status is "open"
- ✅ History has initial entry

### Test 2: List Risks
```bash
curl "http://localhost:3000/api/risk-register/list?company=Test%20Corp"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

**Verification:**
- ✅ Returns success: true
- ✅ Data array contains risks
- ✅ Pagination info present
- ✅ Can filter by company

### Test 3: Update Risk Status
```bash
curl -X PUT http://localhost:3000/api/risk-register/update \
  -H "Content-Type: application/json" \
  -d '{
    "riskId": "RISK-...",
    "updateType": "status",
    "data": {
      "newStatus": "in_progress",
      "reason": "Mitigation plan approved"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "entry": { ... }
}
```

**Verification:**
- ✅ Status changed to "in_progress"
- ✅ statusReason recorded
- ✅ History updated with change
- ✅ updatedAt timestamp changed

### Test 4: Add Treatment Action
```bash
curl -X PUT http://localhost:3000/api/risk-register/update \
  -H "Content-Type: application/json" \
  -d '{
    "riskId": "RISK-...",
    "updateType": "add_action",
    "data": {
      "description": "Implement encryption",
      "owner": "tech@test.com",
      "dueDate": "2026-04-15",
      "notes": "Use AES-256"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "entry": { ... }
}
```

**Verification:**
- ✅ Action added to treatment.actions
- ✅ actionId generated
- ✅ Status is "not_started"
- ✅ History updated

### Test 5: Update Action Status
```bash
curl -X PUT http://localhost:3000/api/risk-register/update \
  -H "Content-Type: application/json" \
  -d '{
    "riskId": "RISK-...",
    "updateType": "update_action",
    "data": {
      "actionId": "ACT-...",
      "newStatus": "completed",
      "notes": "Encryption implemented successfully"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "entry": { ... }
}
```

**Verification:**
- ✅ Action status changed
- ✅ completionDate set
- ✅ Notes recorded
- ✅ History updated

### Test 6: Add Control
```bash
curl -X PUT http://localhost:3000/api/risk-register/update \
  -H "Content-Type: application/json" \
  -d '{
    "riskId": "RISK-...",
    "updateType": "add_control",
    "data": {
      "name": "Data Encryption",
      "description": "AES-256 encryption for data at rest",
      "type": "preventive",
      "effectiveness": 95,
      "status": "implemented"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "entry": { ... }
}
```

**Verification:**
- ✅ Control added to controls array
- ✅ controlId generated
- ✅ Effectiveness recorded
- ✅ History updated

### Test 7: Update Residual Risk
```bash
curl -X PUT http://localhost:3000/api/risk-register/update \
  -H "Content-Type: application/json" \
  -d '{
    "riskId": "RISK-...",
    "updateType": "update_residual_risk",
    "data": {
      "newLikelihood": 1,
      "newImpact": 3
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "entry": { ... }
}
```

**Verification:**
- ✅ residualLikelihood updated
- ✅ residualImpact updated
- ✅ residualRisk recalculated
- ✅ History updated with old/new values

### Test 8: Get Analytics
```bash
curl -X POST http://localhost:3000/api/risk-register/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Test Corp",
    "analyticsType": "full"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "summary": {
    "totalRisks": 1,
    "criticalRisks": 0,
    "overdueActions": 0,
    "averageInherentRisk": 15,
    "averageResidualRisk": 3,
    "riskReductionPercentage": 80,
    "overallTrend": "improving"
  },
  "distribution": { ... },
  "criticalRisks": [ ... ],
  "overdueActions": [ ... ],
  "trends": { ... }
}
```

**Verification:**
- ✅ Summary metrics calculated
- ✅ Distribution by status/level/category
- ✅ Critical risks identified
- ✅ Overdue actions tracked
- ✅ Trends analyzed

## 🎨 UI Testing (10 minutes)

### Create Test Page
Create `app/risk-register/test/page.tsx`:
```tsx
'use client';

import RiskRegisterManager from '@/app/components/RiskRegisterManager';

export default function TestPage() {
  return (
    <div className="p-6">
      <RiskRegisterManager company="Test Corp" />
    </div>
  );
}
```

### Test in Browser
1. Navigate to: `http://localhost:3000/risk-register/test`
2. Verify page loads without errors
3. Check console for errors (F12)

**Expected:**
- ✅ Page loads
- ✅ Risk register tab visible
- ✅ Analytics tab visible
- ✅ Actions tab visible
- ✅ No console errors

### Test Risk Register Tab
1. Click "Risk Register" tab
2. Verify risks display
3. Test filters (status, level)
4. Click on a risk to see details

**Expected:**
- ✅ Risks display in list
- ✅ Filters work
- ✅ Details show when clicked
- ✅ No errors

### Test Analytics Tab
1. Click "Analytics" tab
2. Wait for data to load
3. Verify charts display

**Expected:**
- ✅ Summary cards show
- ✅ Charts render
- ✅ Data is accurate
- ✅ No errors

### Test Actions Tab
1. Click "Actions" tab
2. Verify overdue actions display

**Expected:**
- ✅ Overdue actions show
- ✅ Days overdue calculated
- ✅ Owner info displayed
- ✅ No errors

## 📋 Requirement Verification

### Requirement 1: Document Identified Risks
- [ ] Can create risk entries
- [ ] Risk name captured
- [ ] Description captured
- [ ] Category captured
- [ ] Risk level captured
- [ ] Owner assigned

### Requirement 2: Track Risk Status
- [ ] Status options available (7 types)
- [ ] Status changes recorded
- [ ] Reason tracked
- [ ] History maintained
- [ ] Closure date recorded

### Requirement 3: Mitigation Strategies
- [ ] Four strategies available (Avoid, Transfer, Mitigate, Accept)
- [ ] Priority levels set
- [ ] Target dates calculated
- [ ] Cost estimated
- [ ] Strategy documented

### Requirement 4: Treatment Actions
- [ ] Can add multiple actions
- [ ] Action status tracked
- [ ] Owners assigned
- [ ] Due dates set
- [ ] Completion tracked
- [ ] Overdue identified

### Requirement 5: Control Implementation
- [ ] Can add controls
- [ ] Control types available (Preventive, Detective, Corrective)
- [ ] Effectiveness tracked
- [ ] Status monitored
- [ ] Test results recorded

### Requirement 6: Risk Metrics
- [ ] Can add metrics
- [ ] Measurements tracked
- [ ] Trends recorded
- [ ] Units supported

### Requirement 7: Audit Trail
- [ ] Changes recorded
- [ ] Timestamps present
- [ ] Users tracked
- [ ] Previous values stored
- [ ] Notes recorded

## 🔍 Error Testing

### Test Invalid Company
```bash
curl "http://localhost:3000/api/risk-register/list?company="
```

**Expected:** Error or empty list

### Test Invalid Risk ID
```bash
curl -X PUT http://localhost:3000/api/risk-register/update \
  -H "Content-Type: application/json" \
  -d '{
    "riskId": "INVALID",
    "updateType": "status",
    "data": {"newStatus": "closed", "reason": "test"}
  }'
```

**Expected:** Error "Risk register entry not found"

### Test Missing Fields
```bash
curl -X POST http://localhost:3000/api/risk-register/create \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:** Error "Missing required fields"

## 📊 Performance Testing

### Measure Create Time
```bash
time curl -X POST http://localhost:3000/api/risk-register/create \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

**Expected:** <500ms

### Measure List Time
```bash
time curl "http://localhost:3000/api/risk-register/list?company=Test%20Corp"
```

**Expected:** <200ms

### Measure Analytics Time
```bash
time curl -X POST http://localhost:3000/api/risk-register/analytics \
  -H "Content-Type: application/json" \
  -d '{"company": "Test Corp"}'
```

**Expected:** <1000ms

## ✅ Final Verification Checklist

### Files
- [ ] RiskRegister.ts exists
- [ ] create/route.ts exists
- [ ] list/route.ts exists
- [ ] update/route.ts exists
- [ ] analytics/route.ts exists
- [ ] RiskRegisterManager.tsx exists

### Compilation
- [ ] No TypeScript errors
- [ ] No build errors
- [ ] Project builds successfully

### API Endpoints
- [ ] Create endpoint works
- [ ] List endpoint works
- [ ] Update endpoint works
- [ ] Analytics endpoint works
- [ ] Delete endpoint works

### Functionality
- [ ] Can create risks
- [ ] Can list risks
- [ ] Can update status
- [ ] Can add actions
- [ ] Can add controls
- [ ] Can get analytics

### UI
- [ ] Component loads
- [ ] Tabs work
- [ ] Filters work
- [ ] Charts display
- [ ] No console errors

### Data
- [ ] Risks saved to database
- [ ] History recorded
- [ ] Audit trail complete
- [ ] Calculations correct

### Performance
- [ ] Create: <500ms
- [ ] List: <200ms
- [ ] Analytics: <1000ms
- [ ] UI responsive

## 🎯 Success Criteria

✅ **All tests pass**
✅ **No errors in console**
✅ **All requirements met**
✅ **Performance acceptable**
✅ **Data persists correctly**
✅ **Audit trail complete**

## 📞 Troubleshooting

### "Risk register entry not found"
- Verify riskId is correct
- Check database connection
- Ensure risk was created

### "Missing required fields"
- Check all required fields present
- Verify field names match API
- Check data types

### "Unauthorized"
- Verify session is active
- Check authentication
- Login if needed

### "Database connection error"
- Check MongoDB is running
- Verify connection string
- Check network connectivity

---

**Status:** ✅ Ready to Verify
**Last Updated:** March 2026
