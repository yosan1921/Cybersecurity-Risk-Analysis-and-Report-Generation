# Reporting System - Testing & Verification Guide

## 🧪 Complete Testing Procedures

This guide provides step-by-step instructions to verify the reporting system is working correctly.

## ✅ Pre-Testing Checklist

Before testing, verify:
- [ ] All files created successfully
- [ ] No syntax errors in code
- [ ] Development server running (`npm run dev`)
- [ ] MongoDB connection working
- [ ] Have a valid analysisId from database

## 🔍 Step 1: Verify Files Exist

### Check Core Services
```bash
# Check if service files exist
ls -la lib/services/multiLevelReportService.ts
ls -la lib/services/reportExportService.ts
```

**Expected Output:**
```
-rw-r--r-- ... multiLevelReportService.ts (26.77 KB)
-rw-r--r-- ... reportExportService.ts (23.93 KB)
```

### Check API Endpoints
```bash
# Check if API route files exist
ls -la app/api/reports/generate-multilevel/route.ts
ls -la app/api/reports/analytics/route.ts
```

**Expected Output:**
```
-rw-r--r-- ... generate-multilevel/route.ts (5.70 KB)
-rw-r--r-- ... analytics/route.ts (9.19 KB)
```

### Check UI Component
```bash
# Check if component file exists
ls -la app/components/MultiLevelReportGenerator.tsx
```

**Expected Output:**
```
-rw-r--r-- ... MultiLevelReportGenerator.tsx (16.21 KB)
```

## 🔧 Step 2: Check for Syntax Errors

### Verify TypeScript Compilation
```bash
# Run TypeScript compiler
npx tsc --noEmit

# Or use Next.js build
npm run build
```

**Expected Output:**
```
✓ No errors found
```

**If errors occur:**
- Check error messages
- Review file syntax
- Verify imports are correct

## 🚀 Step 3: Start Development Server

```bash
# Start the dev server
npm run dev
```

**Expected Output:**
```
> next dev
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

**Wait for:** "Ready in X.Xs" message

## 📊 Step 4: Get a Valid Analysis ID

### Option A: From MongoDB
```bash
# Connect to MongoDB and find an analysis
mongo
use your_database
db.riskanalyses.findOne()
```

**Look for:** `_id` field (e.g., "507f1f77bcf86cd799439011")

### Option B: From Your Application
1. Log in to your app
2. Complete a risk assessment
3. Copy the analysis ID from the URL or response

### Option C: Create Test Data
```bash
# Use MongoDB to insert test data
db.riskanalyses.insertOne({
  company: "Test Company",
  category: "Security",
  createdAt: new Date(),
  strategic: [
    {
      questionId: 1,
      question: "Test question",
      answer: "Test answer",
      analysis: {
        likelihood: 3,
        impact: 4,
        riskScore: 12,
        riskLevel: "HIGH",
        gap: "Test gap",
        threat: "Test threat",
        mitigation: "Test mitigation",
        impactDescription: "Test impact"
      }
    }
  ],
  tactical: [],
  operational: [],
  summary: {
    strategic: {
      averageRiskScore: 12,
      criticalCount: 0,
      highCount: 1,
      mediumCount: 0,
      lowCount: 0,
      riskDistribution: {}
    }
  }
})
```

## 🧪 Step 5: Test API Endpoints

### Test 5A: Generate Strategic Report (PDF)

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "level": "strategic",
    "format": "PDF"
  }' \
  -o strategic-report.pdf
```

**Expected Result:**
- ✅ File downloads as `strategic-report.pdf`
- ✅ File size: 500KB - 2MB
- ✅ Can open in PDF reader

**Using JavaScript (in browser console):**
```javascript
fetch('/api/reports/generate-multilevel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    analysisId: 'YOUR_ANALYSIS_ID',
    level: 'strategic',
    format: 'PDF'
  })
})
.then(r => r.blob())
.then(blob => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'strategic-report.pdf';
  a.click();
});
```

### Test 5B: Generate Tactical Report (DOCX)

```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "level": "tactical",
    "format": "DOCX"
  }' \
  -o tactical-report.docx
```

**Expected Result:**
- ✅ File downloads as `tactical-report.docx`
- ✅ File size: 300KB - 1MB
- ✅ Can open in Word

### Test 5C: Generate Operational Report (PPTX)

```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "level": "operational",
    "format": "PPTX"
  }' \
  -o operational-report.pptx
```

**Expected Result:**
- ✅ File downloads as `operational-report.pptx`
- ✅ File size: 400KB - 1.5MB
- ✅ Can open in PowerPoint

### Test 5D: Generate Human Awareness Report (XLSX)

```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "level": "human-awareness",
    "format": "XLSX"
  }' \
  -o awareness-report.xlsx
```

**Expected Result:**
- ✅ File downloads as `awareness-report.xlsx`
- ✅ File size: 200KB - 800KB
- ✅ Can open in Excel

### Test 5E: Get Analytics Data

```bash
curl -X POST http://localhost:3000/api/reports/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "analyticsType": "all"
  }'
```

**Expected Result:**
```json
{
  "success": true,
  "data": {
    "heatmap": [
      {
        "x": "Strategic",
        "y": "Governance",
        "value": 12,
        "riskLevel": "HIGH"
      }
    ],
    "trends": [
      {
        "period": "Current",
        "criticalCount": 0,
        "highCount": 1,
        "mediumCount": 0,
        "lowCount": 0,
        "averageRiskScore": 12
      }
    ],
    "recommendations": [
      {
        "riskId": "RISK-1",
        "gap": "Test gap",
        "currentRiskScore": 12,
        "recommendedTreatment": "MITIGATE - Implement controls...",
        "expectedResidualRisk": 6,
        "implementationCost": "Medium",
        "timeline": "1-2 months",
        "priority": "URGENT"
      }
    ]
  }
}
```

## 🎨 Step 6: Test UI Component

### Create Test Page

Create `app/reports/test/page.tsx`:
```tsx
'use client';

import MultiLevelReportGenerator from '@/app/components/MultiLevelReportGenerator';

export default function TestReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Report Generator Test</h1>
      <MultiLevelReportGenerator 
        analysisId="YOUR_ANALYSIS_ID"
        company="Test Company"
      />
    </div>
  );
}
```

### Test in Browser

1. Navigate to: `http://localhost:3000/reports/test`
2. Verify UI loads without errors
3. Check console for errors: Press `F12` → Console tab

**Expected UI Elements:**
- ✅ Report level selection (4 radio buttons)
- ✅ Export format selection (4 radio buttons)
- ✅ "Generate & Download Report" button
- ✅ "View Analytics" button
- ✅ No console errors

### Test Report Generation from UI

1. Select "Strategic Level"
2. Select "PDF" format
3. Click "Generate & Download Report"
4. Verify file downloads

**Expected Result:**
- ✅ Button shows "Generating..."
- ✅ File downloads after 2-4 seconds
- ✅ Button returns to normal state
- ✅ No error messages

### Test Analytics Visualization

1. Click "View Analytics"
2. Wait for data to load

**Expected Result:**
- ✅ Heatmap displays with colored cells
- ✅ Trend chart shows with lines
- ✅ Recommendations display as cards
- ✅ No console errors

## 📋 Step 7: Verify Report Content

### Check PDF Content

1. Open generated PDF file
2. Verify sections:
   - ✅ Title page with company name
   - ✅ Executive summary
   - ✅ Risk assessment overview
   - ✅ Detailed findings
   - ✅ Risk analysis table
   - ✅ Recommendations
   - ✅ Implementation roadmap

### Check DOCX Content

1. Open generated DOCX file in Word
2. Verify:
   - ✅ Editable text
   - ✅ Formatted tables
   - ✅ Proper styling
   - ✅ All sections present

### Check PPTX Content

1. Open generated PPTX file in PowerPoint
2. Verify:
   - ✅ Title slide
   - ✅ Executive summary slide
   - ✅ Risk distribution chart
   - ✅ Key findings slide
   - ✅ Recommendations slide
   - ✅ Timeline slide

### Check XLSX Content

1. Open generated XLSX file in Excel
2. Verify sheets:
   - ✅ Summary sheet with metrics
   - ✅ Risk Details sheet with table
   - ✅ Recommendations sheet
   - ✅ Trends sheet

## 🔍 Step 8: Error Testing

### Test Invalid Analysis ID

```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "invalid-id",
    "level": "strategic",
    "format": "PDF"
  }'
```

**Expected Result:**
```json
{
  "error": "Analysis not found"
}
```

### Test Invalid Level

```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "level": "invalid",
    "format": "PDF"
  }'
```

**Expected Result:**
```json
{
  "error": "Invalid level. Must be one of: strategic, tactical, operational, human-awareness"
}
```

### Test Invalid Format

```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "level": "strategic",
    "format": "INVALID"
  }'
```

**Expected Result:**
```json
{
  "error": "Invalid format. Must be one of: PDF, DOCX, PPTX, XLSX"
}
```

### Test Missing Parameters

```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Result:**
```json
{
  "error": "analysisId, level, and format are required"
}
```

## 📊 Step 9: Performance Testing

### Measure Report Generation Time

```bash
# Time the report generation
time curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "level": "strategic",
    "format": "PDF"
  }' \
  -o report.pdf
```

**Expected Result:**
- ✅ Strategic: 2-3 seconds
- ✅ Tactical: 2-3 seconds
- ✅ Operational: 3-4 seconds
- ✅ Human Awareness: 2-3 seconds

### Check File Sizes

```bash
# Check generated file sizes
ls -lh *.pdf *.docx *.pptx *.xlsx
```

**Expected Sizes:**
- ✅ PDF: 500KB - 2MB
- ✅ DOCX: 300KB - 1MB
- ✅ PPTX: 400KB - 1.5MB
- ✅ XLSX: 200KB - 800KB

## 🔐 Step 10: Security Testing

### Test Authentication

```bash
# Try without authentication (should fail if auth is required)
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "level": "strategic",
    "format": "PDF"
  }'
```

**Expected Result:**
- ✅ Returns 401 Unauthorized (if auth required)
- OR ✅ Returns report (if auth not required)

### Test Input Validation

```bash
# Try with special characters
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "'; DROP TABLE--",
    "level": "strategic",
    "format": "PDF"
  }'
```

**Expected Result:**
- ✅ Returns error (not executed)
- ✅ No database damage

## 📝 Step 11: Browser Console Testing

### Open Developer Tools

1. Press `F12` or `Ctrl+Shift+I`
2. Go to Console tab
3. Generate a report

**Expected Result:**
- ✅ No red error messages
- ✅ No warnings about missing files
- ✅ Network requests show 200 status

### Check Network Tab

1. Open Network tab
2. Generate a report
3. Look for API requests

**Expected Requests:**
- ✅ POST /api/reports/generate-multilevel (200)
- ✅ Response headers include Content-Type
- ✅ Response size matches file size

## ✅ Step 12: Complete Test Checklist

### Core Functionality
- [ ] All files exist and have correct sizes
- [ ] No TypeScript compilation errors
- [ ] Development server starts successfully
- [ ] API endpoints respond to requests

### Report Generation
- [ ] Strategic report generates (all formats)
- [ ] Tactical report generates (all formats)
- [ ] Operational report generates (all formats)
- [ ] Human awareness report generates (all formats)

### Export Formats
- [ ] PDF exports correctly
- [ ] DOCX exports correctly
- [ ] PPTX exports correctly
- [ ] XLSX exports correctly

### Analytics
- [ ] Heatmap data returns correctly
- [ ] Trend data returns correctly
- [ ] Recommendations return correctly
- [ ] Combined analytics work

### UI Component
- [ ] Component loads without errors
- [ ] Report level selection works
- [ ] Export format selection works
- [ ] Generate button works
- [ ] Analytics button works
- [ ] Error messages display correctly

### Error Handling
- [ ] Invalid analysis ID returns error
- [ ] Invalid level returns error
- [ ] Invalid format returns error
- [ ] Missing parameters return error

### Performance
- [ ] Report generation completes in <5 seconds
- [ ] File sizes are within expected range
- [ ] No memory leaks
- [ ] No console errors

### Security
- [ ] Authentication works (if required)
- [ ] Input validation works
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

## 🎯 Quick Test Script

Create `test-reporting.sh`:
```bash
#!/bin/bash

ANALYSIS_ID="YOUR_ANALYSIS_ID"
BASE_URL="http://localhost:3000"

echo "Testing Reporting System..."
echo ""

# Test Strategic PDF
echo "1. Testing Strategic Report (PDF)..."
curl -X POST $BASE_URL/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d "{\"analysisId\": \"$ANALYSIS_ID\", \"level\": \"strategic\", \"format\": \"PDF\"}" \
  -o strategic.pdf && echo "✅ Strategic PDF generated" || echo "❌ Failed"

# Test Tactical DOCX
echo "2. Testing Tactical Report (DOCX)..."
curl -X POST $BASE_URL/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d "{\"analysisId\": \"$ANALYSIS_ID\", \"level\": \"tactical\", \"format\": \"DOCX\"}" \
  -o tactical.docx && echo "✅ Tactical DOCX generated" || echo "❌ Failed"

# Test Operational PPTX
echo "3. Testing Operational Report (PPTX)..."
curl -X POST $BASE_URL/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d "{\"analysisId\": \"$ANALYSIS_ID\", \"level\": \"operational\", \"format\": \"PPTX\"}" \
  -o operational.pptx && echo "✅ Operational PPTX generated" || echo "❌ Failed"

# Test Human Awareness XLSX
echo "4. Testing Human Awareness Report (XLSX)..."
curl -X POST $BASE_URL/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d "{\"analysisId\": \"$ANALYSIS_ID\", \"level\": \"human-awareness\", \"format\": \"XLSX\"}" \
  -o awareness.xlsx && echo "✅ Human Awareness XLSX generated" || echo "❌ Failed"

# Test Analytics
echo "5. Testing Analytics..."
curl -X POST $BASE_URL/api/reports/analytics \
  -H "Content-Type: application/json" \
  -d "{\"analysisId\": \"$ANALYSIS_ID\", \"analyticsType\": \"all\"}" \
  | grep -q "success" && echo "✅ Analytics generated" || echo "❌ Failed"

echo ""
echo "Testing complete!"
echo "Generated files:"
ls -lh *.pdf *.docx *.pptx *.xlsx 2>/dev/null
```

Run with:
```bash
chmod +x test-reporting.sh
./test-reporting.sh
```

## 📊 Test Results Template

Use this to document your test results:

```
REPORTING SYSTEM TEST RESULTS
=============================

Date: ___________
Tester: ___________
Analysis ID: ___________

CORE FUNCTIONALITY
- Files exist: [ ] Pass [ ] Fail
- No compilation errors: [ ] Pass [ ] Fail
- Server starts: [ ] Pass [ ] Fail
- API responds: [ ] Pass [ ] Fail

REPORT GENERATION
- Strategic PDF: [ ] Pass [ ] Fail
- Tactical DOCX: [ ] Pass [ ] Fail
- Operational PPTX: [ ] Pass [ ] Fail
- Human Awareness XLSX: [ ] Pass [ ] Fail

ANALYTICS
- Heatmap: [ ] Pass [ ] Fail
- Trends: [ ] Pass [ ] Fail
- Recommendations: [ ] Pass [ ] Fail

UI COMPONENT
- Loads: [ ] Pass [ ] Fail
- Selection works: [ ] Pass [ ] Fail
- Generation works: [ ] Pass [ ] Fail
- Analytics display: [ ] Pass [ ] Fail

ERROR HANDLING
- Invalid ID: [ ] Pass [ ] Fail
- Invalid level: [ ] Pass [ ] Fail
- Invalid format: [ ] Pass [ ] Fail
- Missing params: [ ] Pass [ ] Fail

PERFORMANCE
- Generation time: _____ seconds
- File sizes: PDF _____ DOCX _____ PPTX _____ XLSX _____
- No errors: [ ] Pass [ ] Fail

OVERALL RESULT: [ ] PASS [ ] FAIL

Notes:
_________________________________
_________________________________
```

## 🐛 Troubleshooting Test Failures

### If API returns 404
- Check file paths are correct
- Verify Next.js server restarted
- Check for typos in endpoint URLs

### If report generation fails
- Verify analysis ID exists in MongoDB
- Check MongoDB connection
- Review server logs for errors

### If file download fails
- Check browser console for errors
- Verify Content-Type headers
- Check file size limits

### If UI component doesn't load
- Check for TypeScript errors
- Verify component import path
- Check browser console

### If analytics are empty
- Verify analysis has data
- Check data structure matches requirements
- Review server logs

## ✨ Success Indicators

You'll know the system is working when:
- ✅ All 4 report types generate successfully
- ✅ All 4 export formats work
- ✅ Files download with correct names
- ✅ Files open in correct applications
- ✅ Analytics display with data
- ✅ UI component renders without errors
- ✅ No console errors
- ✅ Performance is acceptable (<5 seconds)

---

**Testing Status:** Ready to Test
**Last Updated:** March 2026
