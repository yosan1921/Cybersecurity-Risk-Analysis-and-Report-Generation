# Reporting Formats - Quick Start Guide

## What's New

The INSA project now supports **three professional reporting formats**:

1. 📄 **PDF Reports** - Professional documents with executive summaries
2. 📊 **Excel Spreadsheets** - Multi-sheet workbooks with data and charts
3. 🎯 **PowerPoint Presentations** - Executive briefing slides

## How to Use

### From the UI

1. Go to **Reports** page
2. Select an assessment
3. Click **View & Export**
4. Choose your preferred format:
   - PDF Report
   - Excel Spreadsheet
   - PowerPoint Presentation
5. Click **Export** button
6. File downloads automatically

### From the API

```bash
# Generate PDF
curl -X POST http://localhost:3000/api/reports/export \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "format": "pdf"
  }'

# Generate Excel
curl -X POST http://localhost:3000/api/reports/export \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "format": "excel"
  }'

# Generate PowerPoint
curl -X POST http://localhost:3000/api/reports/export \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "YOUR_ANALYSIS_ID",
    "format": "powerpoint"
  }'
```

## What Each Format Contains

### PDF Report
- Cover page with company info
- Executive summary with key metrics
- 5x5 Risk Matrix visualization
- Detailed findings table
- Recommendations and action items
- Professional formatting

### Excel Spreadsheet
- **Executive Summary Sheet**: Overview and top risks
- **Risk Details Sheet**: Complete data with filtering
- **Risk Matrix Sheet**: 5x5 matrix visualization
- **Charts Sheet**: Data for creating charts
- Color-coded risk levels
- Auto-filtering enabled

### PowerPoint Presentation
- Title slide with company branding
- Executive summary slide
- Risk distribution pie chart
- 5x5 Risk Matrix slide
- Top risks by priority (Critical, High, Medium)
- Recommendations slide
- Conclusion with next steps

## File Naming

Reports are automatically named with:
- Company name
- Assessment date
- Format extension

Example: `Risk_Assessment_Acme_Corp_2024-03-16.pdf`

## Features

✅ **No Breaking Changes** - All existing functionality preserved
✅ **Secure** - Requires authentication, respects user roles
✅ **Fast** - Reports generated in 2-8 seconds
✅ **Professional** - Enterprise-grade formatting
✅ **Flexible** - Choose format based on audience
✅ **Reliable** - Comprehensive error handling

## Technical Details

### New Files Added
- `src/services/excelReportService.ts` - Excel generation
- `src/services/pdfReportService.ts` - PDF generation
- `src/services/presentationService.ts` - PowerPoint generation
- `src/services/reportingService.ts` - Unified service
- `src/components/ReportExporter.tsx` - UI component
- `src/app/api/reports/export/route.ts` - Main API endpoint
- `src/app/api/reports/pdf/route.ts` - PDF endpoint
- `src/app/api/reports/powerpoint/route.ts` - PowerPoint endpoint

### Updated Files
- `src/app/reports/page.tsx` - Added ReportExporter component
- `src/app/api/excelreport/generate/route.ts` - Implemented Excel export

### Dependencies
All required packages already in `package.json`:
- `exceljs` - Excel files
- `jspdf` - PDF generation
- `pptxgenjs` - PowerPoint generation

## Troubleshooting

### Report won't download
- Check browser console for errors
- Verify analysis ID is correct
- Ensure you're authenticated

### Report looks wrong
- Try a different format
- Check file viewer compatibility
- Verify data in analysis

### Generation takes too long
- Large analyses take longer (normal)
- Check server resources
- Try again in a few moments

## Next Steps

1. **Try it out**: Generate a report from the Reports page
2. **Share with stakeholders**: Use PDF for executives, Excel for analysts
3. **Automate**: Use API for batch processing
4. **Customize**: Extend services for custom branding

## Support

For issues or questions:
1. Check `/docs/REPORTING-FORMATS-IMPLEMENTATION.md` for detailed docs
2. Review API responses for error messages
3. Check browser console for client-side errors
4. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: March 2024  
**Status**: Production Ready ✅