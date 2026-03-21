#!/bin/bash

# Reporting System - Quick Test Script
# Run this to verify the reporting system is working

echo "=========================================="
echo "REPORTING SYSTEM - QUICK TEST"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to print test result
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    ((FAILED++))
  fi
}

# Test 1: Check if files exist
echo "Test 1: Checking if all files exist..."
if [ -f "lib/services/multiLevelReportService.ts" ] && \
   [ -f "lib/services/reportExportService.ts" ] && \
   [ -f "app/api/reports/generate-multilevel/route.ts" ] && \
   [ -f "app/api/reports/analytics/route.ts" ] && \
   [ -f "app/components/MultiLevelReportGenerator.tsx" ]; then
  test_result 0 "All implementation files exist"
else
  test_result 1 "Some implementation files are missing"
fi
echo ""

# Test 2: Check file sizes
echo "Test 2: Checking file sizes..."
SIZE1=$(stat -f%z "lib/services/multiLevelReportService.ts" 2>/dev/null || stat -c%s "lib/services/multiLevelReportService.ts" 2>/dev/null)
if [ "$SIZE1" -gt 20000 ]; then
  test_result 0 "multiLevelReportService.ts has correct size ($SIZE1 bytes)"
else
  test_result 1 "multiLevelReportService.ts size is too small"
fi
echo ""

# Test 3: Check for TypeScript syntax errors
echo "Test 3: Checking for TypeScript errors..."
if command -v npx &> /dev/null; then
  npx tsc --noEmit lib/services/multiLevelReportService.ts 2>/dev/null
  if [ $? -eq 0 ]; then
    test_result 0 "No TypeScript syntax errors"
  else
    test_result 1 "TypeScript syntax errors found"
  fi
else
  echo -e "${YELLOW}⚠️  SKIP${NC}: npx not found (install Node.js)"
fi
echo ""

# Test 4: Check if npm packages are installed
echo "Test 4: Checking if required npm packages are installed..."
if npm list docx exceljs jspdf pptxgenjs &>/dev/null; then
  test_result 0 "All required npm packages are installed"
else
  test_result 1 "Some npm packages are missing"
fi
echo ""

# Test 5: Check if MongoDB connection is available
echo "Test 5: Checking MongoDB connection..."
if command -v mongo &> /dev/null; then
  if mongo --eval "db.adminCommand('ping')" &>/dev/null; then
    test_result 0 "MongoDB is running"
  else
    test_result 1 "MongoDB is not responding"
  fi
else
  echo -e "${YELLOW}⚠️  SKIP${NC}: MongoDB CLI not found"
fi
echo ""

# Test 6: Check if dev server can start
echo "Test 6: Checking if dev server can start..."
if command -v npm &> /dev/null; then
  # Try to build
  npm run build &>/dev/null
  if [ $? -eq 0 ]; then
    test_result 0 "Project builds successfully"
  else
    test_result 1 "Project build failed"
  fi
else
  echo -e "${YELLOW}⚠️  SKIP${NC}: npm not found"
fi
echo ""

# Test 7: Check documentation files
echo "Test 7: Checking documentation files..."
if [ -f "REPORTING-SYSTEM-GUIDE.md" ] && \
   [ -f "REPORTING-QUICK-START.md" ] && \
   [ -f "REPORTING-TESTING-GUIDE.md" ]; then
  test_result 0 "All documentation files exist"
else
  test_result 1 "Some documentation files are missing"
fi
echo ""

# Summary
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start dev server: npm run dev"
  echo "2. Get an analysis ID from your database"
  echo "3. Test API endpoint:"
  echo "   curl -X POST http://localhost:3000/api/reports/generate-multilevel \\"
  echo "     -H 'Content-Type: application/json' \\"
  echo "     -d '{\"analysisId\": \"YOUR_ID\", \"level\": \"strategic\", \"format\": \"PDF\"}'"
  echo ""
  echo "See REPORTING-QUICK-START.md for more details"
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo ""
  echo "Troubleshooting:"
  echo "1. Check if you're in the INSA-PROJECT-master directory"
  echo "2. Run: npm install"
  echo "3. Check MongoDB is running"
  echo "4. See REPORTING-TESTING-GUIDE.md for detailed troubleshooting"
fi

echo ""
echo "=========================================="
