# External Questionnaire Import Guide

This guide explains how to import questionnaires from external systems into CSRARS, with or without answers already filled in.

## 🌐 Import Methods

### Method 1: Web Interface (Easiest)

**URL:** http://localhost:3000/import-external-questionnaire.html

Features:
- Paste JSON directly
- Upload JSON file
- View example format
- Real-time validation

### Method 2: API Endpoint (For Automation)

**Endpoint:** `POST /api/questionnaires/import-external`

```bash
curl -X POST http://localhost:3000/api/questionnaires/import-external \
  -H "Content-Type: application/json" \
  -d @questionnaire.json
```

---

## 📋 JSON Format

### Complete Format (With Answers)

```json
{
  "title": "Security Assessment Q1 2024",
  "company": "Acme Corporation",
  "filledBy": "John Doe",
  "role": "IT Security Manager",
  "filledDate": "2024-03-07",
  "status": "pending",
  "sections": [
    {
      "sectionTitle": "Physical Security Controls",
      "questions": [
        {
          "questionText": "Are all data center entry points protected by controlled access systems?",
          "answer": "Yes",
          "level": "operational"
        },
        {
          "questionText": "Is CCTV installed to cover all critical areas?",
          "answer": "Partially Implemented",
          "level": "operational"
        }
      ]
    },
    {
      "sectionTitle": "Network and Infrastructure Security",
      "questions": [
        {
          "questionText": "Is the network properly segmented?",
          "answer": "No",
          "level": "operational"
        }
      ]
    }
  ]
}
```

### Template Format (Without Answers)

```json
{
  "title": "Security Assessment Template",
  "company": "Acme Corporation",
  "filledBy": "John Doe",
  "role": "IT Security Manager",
  "filledDate": "2024-03-07",
  "sections": [
    {
      "sectionTitle": "Physical Security Controls",
      "questions": [
        {
          "questionText": "Are all data center entry points protected?"
        },
        {
          "questionText": "Is CCTV installed in critical areas?"
        }
      ]
    }
  ]
}
```

---

## 📊 Field Descriptions

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | string | Questionnaire title | "Security Assessment Q1 2024" |
| `company` | string | Organization name | "Acme Corporation" |
| `filledBy` | string | Person who filled it | "John Doe" |
| `role` | string | Their role | "IT Security Manager" |
| `sections` | array | Array of sections | See below |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `filledDate` | string | Date filled (ISO format) | Current date |
| `status` | string | "pending" or "analyzed" | "pending" |
| `externalId` | string | ID from external system | Auto-generated UUID |

### Section Fields

| Field | Type | Description |
|-------|------|-------------|
| `sectionTitle` | string | Section name |
| `questions` | array | Array of questions |

### Question Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `questionText` | string | Yes | The question text |
| `answer` | string | No | Answer (if omitted, defaults to "Not Answered") |
| `level` | string | No | "operational", "tactical", or "strategic" (default: "operational") |

### Valid Answer Values

- `"Yes"`
- `"No"`
- `"Partially Implemented"`
- `"Not Applicable"`
- `"Not Answered"` (default if omitted)

---

## 🔄 Integration Examples

### Example 1: Export from External System

If your external system has questionnaires, export them in this format:

```javascript
// External system export function
function exportToCSRARS(assessment) {
  return {
    title: assessment.name,
    company: assessment.organization,
    filledBy: assessment.assessor.name,
    role: assessment.assessor.role,
    filledDate: assessment.completedDate,
    sections: assessment.categories.map(category => ({
      sectionTitle: category.name,
      questions: category.items.map(item => ({
        questionText: item.question,
        answer: item.response,
        level: item.criticality
      }))
    }))
  };
}
```

### Example 2: Bulk Import Script

```javascript
const fs = require('fs');
const fetch = require('node-fetch');

async function bulkImport(files) {
  for (const file of files) {
    const questionnaire = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    const response = await fetch('http://localhost:3000/api/questionnaires/import-external', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionnaire })
    });
    
    const result = await response.json();
    console.log(`Imported: ${result.questionnaire.title}`);
  }
}

// Usage
bulkImport(['assessment1.json', 'assessment2.json', 'assessment3.json']);
```

### Example 3: API Integration

```python
import requests
import json

def import_to_csrars(questionnaire_data):
    url = "http://localhost:3000/api/questionnaires/import-external"
    headers = {"Content-Type": "application/json"}
    payload = {"questionnaire": questionnaire_data}
    
    response = requests.post(url, headers=headers, json=payload)
    return response.json()

# Example usage
questionnaire = {
    "title": "Security Assessment",
    "company": "Acme Corp",
    "filledBy": "Jane Smith",
    "role": "CISO",
    "filledDate": "2024-03-07",
    "sections": [
        {
            "sectionTitle": "Access Control",
            "questions": [
                {
                    "questionText": "Is MFA enabled?",
                    "answer": "Yes"
                }
            ]
        }
    ]
}

result = import_to_csrars(questionnaire)
print(f"Success: {result['success']}")
print(f"Questionnaire ID: {result['questionnaire']['_id']}")
```

---

## ✅ Validation Rules

The import API validates:

1. **Required fields present:** title, company, filledBy, role
2. **Sections array exists** and is not empty
3. **Each section has questions** array
4. **Questions have questionText** field
5. **Answer values are valid** (if provided)
6. **Level values are valid** (if provided)

---

## 🎯 After Import

Once imported, the questionnaire:

1. Appears on the **Assessment** dashboard
2. Can be viewed and edited
3. Can trigger **AI risk analysis** (if status is "pending")
4. Can generate **reports** (PDF, Excel, PowerPoint)

---

## 🔍 Checking Import Status

### Via Web Interface

1. Navigate to Assessment page
2. Look for your questionnaire by company name or title
3. Click "View Details" to see all questions and answers

### Via API

```bash
# List all questionnaires
curl http://localhost:3000/api/questionnaires/list

# Get specific questionnaire
curl http://localhost:3000/api/questionnaires/fetch?id=QUESTIONNAIRE_ID
```

---

## 🛠️ Troubleshooting

### Common Issues

**Issue:** "Missing required field: title"
- **Solution:** Ensure all required fields are present in JSON

**Issue:** "Invalid format. Expected 'sections' array"
- **Solution:** Check that sections is an array with at least one section

**Issue:** "No questions found in the questionnaire"
- **Solution:** Ensure each section has a questions array with at least one question

**Issue:** "Questionnaire validation failed: answer is required"
- **Solution:** This shouldn't happen with the new endpoint - contact support

### Validation Test

Test your JSON before importing:

```bash
# Validate JSON syntax
cat questionnaire.json | jq .

# Test import (dry run)
curl -X POST http://localhost:3000/api/questionnaires/import-external \
  -H "Content-Type: application/json" \
  -d @questionnaire.json
```

---

## 📚 Related Documentation

- **IMPORT-SUMMARY.md** - Overview of all import methods
- **QUESTIONNAIRE-IMPORT-GUIDE.md** - INSA template import guide
- **QUICK-START.md** - Quick reference for imports

---

## 💡 Best Practices

1. **Use consistent naming:** Keep company names consistent across imports
2. **Include dates:** Always provide filledDate for tracking
3. **Validate before import:** Test JSON syntax before importing
4. **Backup data:** Keep original files from external systems
5. **Use externalId:** Include external system IDs for traceability
6. **Batch imports:** Use scripts for importing multiple questionnaires

---

## 🔗 API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Successfully imported questionnaire with 58 questions",
  "questionnaire": {
    "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
    "externalId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Security Assessment Q1 2024",
    "company": "Acme Corporation",
    "questionCount": 58,
    "sectionCount": 10,
    "status": "pending",
    "hasAnswers": true
  }
}
```

### Error Response

```json
{
  "error": "Missing required field: company"
}
```

---

For questions or issues, refer to the main documentation or contact your system administrator.
