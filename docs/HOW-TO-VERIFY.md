# How to Verify the Reporting System is Working

## 🎯 Quick Answer

The reporting system is working if you can:
1. ✅ Generate reports in all 4 formats (PDF, DOCX, PPTX, XLSX)
2. ✅ Get analytics data (heatmaps, trends, recommendations)
3. ✅ See the UI component load without errors
4. ✅ Download files successfully

---

## ⚡ Fastest Verification (5 minutes)

### Step 1: Run the Test Script
```bash
chmod +x test-reporting-system.sh
./test-reporting-system.sh
```

**Expected Output:**
```
✅ PASS: All implementation files exist
✅ PASS: multiLevelReportService.ts has correct size
✅ PASS: No TypeScript syntax errors
✅ PASS: All required npm packages are installed
✅ PASS: Project builds successfully
✅ PASS: All documentation files exist

✅ ALL TESTS PASSED!
```

---

## 📋 Manual Verification (10 minutes)

### Step 1: Check Files Exist
```bash
# Verify all 5 implementation files exist
ls -la lib/services/multiLevelReportService.ts
ls -la lib/services/reportExportService.ts
ls -la app/api/reports/generate-multilevel/route.ts
ls -la app/api/reports/analytics/route.ts
ls -la app/components/MultiLevelReportGenerator.tsx
```

**Expected:** All files exist with sizes shown

### Step 2: Build Project
```bash
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
```

### Step 3: Start Dev Server
```bash
npm run dev
```

**Expected Output:**
```
✓ Ready in X.Xs
```

### Step 4: Test Report Generation
```bash
# Get an analysis ID from your database first
# Then run this command:

curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "level": "strategic",
    "format": "PDF"
  }' \
  -o test-report.pdf
```

**Expected:** File `test-report.pdf` is created (>100KB)

### Step 5: Test Analytics
```bash
curl -X POST http://localhost:3000/api/reports/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "analyticsType": "all"
  }'
```

**Expected:** JSON response with heatmap, trends, and recommendations

---

## 🌐 Browser Testing (5 minutes)

### Step 1: Create Test Page
Create `app/reports/test/page.tsx`:
```tsx
'use client';
import MultiLevelReportGenerator from '@/app/components/MultiLevelReportGenerator';

export default function Test() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Report Generator Test</h1>
      <MultiLevelReportGenerator 
        analysisId="YOUR_ANALYSIS_ID"
        company="Test Company"
      />
    </div>
  );
}
```

### Step 2: Open in Browser
Navigate to: `http://localhost:3000/reports/test`

**Expected:**
- ✅ Page loads without errors
- ✅ Report level selection visible
- ✅ Export format selection visible
- ✅ Buttons are clickable
- ✅ No red errors in console (F12)

### Step 3: Generate Report from UI
1. Select "Strategic Level"
2. Select "PDF" format
3. Click "Generate & Download Report"
4. Wait 2-4 seconds

**Expected:**
- ✅ Button shows "Generating..."
- ✅ File downloads as `strategic-report-YOUR_ID.pdf`
- ✅ File can be opened in PDF reader

### Step 4: View Analytics
1. Click "View Analytics"
2. Wait for data to load

**Expected:**
- ✅ Heatmap displays with colored cells
- ✅ Trend chart shows with lines
- ✅ Recommendations display as cards

---

## 📊 Comprehensive Verification Checklist

Use this checklist to verify everything is working:

### Files & Structure
- [ ] `lib/services/multiLevelReportService.ts` exists (26.77 KB)
- [ ] `lib/services/reportExportService.ts` exists (23.93 KB)
- [ ] `app/api/reports/generate-multilevel/route.ts` exists (5.70 KB)
- [ ] `app/api/reports/analytics/route.ts` exists (9.19 KB)
- [ ] `app/components/MultiLevelReportGenerator.tsx` exists (16.21 KB)

### Build & Compilation
- [ ] `npm run build` completes without errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Dev server starts successfully

### API Endpoints
- [ ] Strategic report generates (PDF)
- [ ] Tactical report generates (DOCX)
- [ ] Operational report generates (PPTX)
- [ ] Human awareness report generates (XLSX)
- [ ] Analytics endpoint returns data
- [ ] Error handling works (invalid ID, format, etc.)

### UI Component
- [ ] Component loads without errors
- [ ] Report level selection works
- [ ] Export format selection works
- [ ] Generate button works
- [ ] Analytics button works
- [ ] Files download correctly

### Performance
- [ ] Report generation: <5 seconds
- [ ] File sizes: 200KB - 2MB
- [ ] No memory leaks
- [ ] No console errors

### Security
- [ ] Authentication works (if required)
- [ ] Input validation works
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities

---

## 🔍 Detailed Verification Steps

### Verify Each Report Type

**Strategic Report:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "YOUR_ID", "level": "strategic", "format": "PDF"}' \
  -o strategic.pdf && echo "✅ Strategic PDF generated"
```

**Tactical Report:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "YOUR_ID", "level": "tactical", "format": "DOCX"}' \
  -o tactical.docx && echo "✅ Tactical DOCX generated"
```

**Operational Report:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "YOUR_ID", "level": "operational", "format": "PPTX"}' \
  -o operational.pptx && echo "✅ Operational PPTX generated"
```

**Human Awareness Report:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "YOUR_ID", "level": "human-awareness", "format": "XLSX"}' \
  -o awareness.xlsx && echo "✅ Human Awareness XLSX generated"
```

### Verify Each Export Format

**PDF Export:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "YOUR_ID", "level": "strategic", "format": "PDF"}' \
  -o report.pdf && file report.pdf
```

**DOCX Export:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "YOUR_ID", "level": "strategic", "format": "DOCX"}' \
  -o report.docx && file report.docx
```

**PPTX Export:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "YOUR_ID", "level": "strategic", "format": "PPTX"}' \
  -o report.pptx && file report.pptx
```

**XLSX Export:**
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "YOUR_ID", "level": "strategic", "format": "XLSX"}' \
  -o report.xlsx && file report.xlsx
```

---

## 🧪 Testing Different Scenarios

### Test 1: Valid Request
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "VALID_ID", "level": "strategic", "format": "PDF"}'
```
**Expected:** File downloads

### Test 2: Invalid Analysis ID
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "invalid", "level": "strategic", "format": "PDF"}'
```
**Expected:** `{"error": "Analysis not found"}`

### Test 3: Invalid Level
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "VALID_ID", "level": "invalid", "format": "PDF"}'
```
**Expected:** `{"error": "Invalid level..."}`

### Test 4: Invalid Format
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "VALID_ID", "level": "strategic", "format": "INVALID"}'
```
**Expected:** `{"error": "Invalid format..."}`

### Test 5: Missing Parameters
```bash
curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected:** `{"error": "analysisId, level, and format are required"}`

---

## 📈 Performance Verification

### Measure Generation Time
```bash
time curl -X POST http://localhost:3000/api/reports/generate-multilevel \
  -H "Content-Type: application/json" \
  -d '{"analysisId": "YOUR_ID", "level": "strategic", "format": "PDF"}' \
  -o report.pdf
```

**Expected:** 2-4 seconds

### Check File Sizes
```bash
ls -lh *.pdf *.docx *.pptx *.xlsx
```

**Expected Sizes:**
- PDF: 500KB - 2MB
- DOCX: 300KB - 1MB
- PPTX: 400KB - 1.5MB
- XLSX: 200KB - 800KB

---

## 🐛 Troubleshooting

### Problem: "Files not found"
**Solution:**
```bash
# Make sure you're in the right directory
pwd  # Should end with INSA-PROJECT-master

# List the files
ls -la lib/services/ | grep -i report
```

### Problem: "Build errors"
**Solution:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Install dependencies
npm install

# Try building again
npm run build
```

### Problem: "API returns 404"
**Solution:**
```bash
# Check if server is running
curl http://localhost:3000

# Check if endpoint exists
curl -X POST http://localhost:3000/api/reports/generate-multilevel

# Restart dev server
# Stop with Ctrl+C, then run: npm run dev
```

### Problem: "Analysis not found"
**Solution:**
```bash
# Get a valid analysis ID
mongo
use your_database
db.riskanalyses.findOne()._id

# Use that ID in your request
```

### Problem: "UI component not loading"
**Solution:**
```bash
# Check browser console (F12)
# Look for error messages

# Verify component file exists
ls -la app/components/MultiLevelReportGenerator.tsx

# Check for TypeScript errors
npx tsc app/components/MultiLevelReportGenerator.tsx --noEmit
```

---

## ✅ Success Indicators

You'll know the system is working when you see:

✅ **All files exist** with correct sizes
✅ **Build completes** without errors
✅ **Dev server starts** successfully
✅ **Reports generate** in all 4 formats
✅ **Files download** with correct names
✅ **Files open** in correct applications
✅ **Analytics return** JSON data
✅ **UI component** renders without errors
✅ **No console errors** (F12)
✅ **Performance** is acceptable (<5 seconds)

---

## 📚 Documentation References

For more detailed information, see:
- **REPORTING-QUICK-START.md** - 5-minute setup
- **REPORTING-TESTING-GUIDE.md** - Comprehensive testing
- **QUICK-VERIFICATION-CHECKLIST.md** - 10-minute verification
- **REPORTING-SYSTEM-GUIDE.md** - Complete documentation

---

## 🎯 Summary

**To verify the system is working:**

1. **Quick (5 min):** Run `./test-reporting-system.sh`
2. **Manual (10 min):** Follow QUICK-VERIFICATION-CHECKLIST.md
3. **Comprehensive (30 min):** Follow REPORTING-TESTING-GUIDE.md

**If all tests pass:** ✅ System is working correctly!

**If tests fail:** See troubleshooting section above or check REPORTING-TESTING-GUIDE.md

---

**Status:** Ready to Verify
**Last Updated:** March 2026
