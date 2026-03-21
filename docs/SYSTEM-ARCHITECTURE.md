# CSRARS System Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CSRARS - Cyber Security Risk                  │
│                   Analysis & Reporting System                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
├─────────────────────────────────────────────────────────────────┤
│  Assessment Page  │  Risk Analysis  │  Reports  │  Dashboard    │
│  • Import         │  • View Results │  • Generate│  • Overview   │
│  • Answer         │  • 3 Levels     │  • Export  │  • Metrics    │
│  • Submit         │  • Risk Scores  │  • Share   │  • Charts     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  /api/questionnaires/  │  /api/analysis/  │  /api/reports/      │
│  • import              │  • process       │  • generate         │
│  • submit              │  • get           │  • export           │
│  • list                │  • reanalyze     │  • list             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC                              │
├─────────────────────────────────────────────────────────────────┤
│  Risk Analyzer         │  Report Generator  │  Analysis Lock    │
│  • AI Analysis         │  • Strategic       │  • Prevent Dupes  │
│  • Risk Scoring        │  • Tactical        │  • Concurrency    │
│  • Gap/Threat ID       │  • Operational     │  • Consistency    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Collections:                                            │
│  • Questionnaires  • RiskAnalysis  • Reports  • Users  • Locks  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│  OpenRouter API (AI Analysis)  │  NextAuth (Authentication)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### 1. Questionnaire Import & Submission

```
User Action
    ↓
Import Questionnaire
    ↓
Answer Questions (58 questions)
    ↓
Submit for Analysis
    ↓
Status: draft → pending
    ↓
Trigger Analysis
```

### 2. Automatic Risk Analysis

```
Questionnaire (pending status)
    ↓
Acquire Analysis Lock
    ↓
Extract Questions by Level
    ├── Operational Questions
    ├── Tactical Questions
    └── Strategic Questions
    ↓
For Each Question:
    ├── Send to AI (OpenRouter)
    ├── Calculate Likelihood (1-5)
    ├── Calculate Impact (1-5)
    ├── Compute Risk Score (L × I)
    ├── Identify Gap
    ├── Identify Threat
    └── Suggest Mitigation
    ↓
Aggregate Results
    ├── Operational Summary
    ├── Tactical Summary
    ├── Strategic Summary
    └── Overall Summary
    ↓
Save to RiskAnalysis Collection
    ↓
Update Questionnaire Status: analyzed
    ↓
Release Analysis Lock
    ↓
Broadcast Notification (SSE)
```

### 3. Report Generation

```
User Selects:
    • Analysis ID
    • Report Level (Strategic/Tactical/Operational)
    ↓
Fetch Analysis Data
    ↓
Extract Level-Specific Data
    ↓
Calculate Metrics:
    ├── Inherent Risk
    ├── Residual Risk
    ├── Risk Reduction
    └── Risk Distribution
    ↓
Generate AI Insights
    ↓
Build Report Content:
    ├── Header & Summary
    ├── Level-Specific Analysis
    ├── Risk Matrix
    ├── Charts Data
    └── Recommendations
    ↓
Save to Reports Collection
    ↓
Return Report to User
    ↓
Export (PDF/DOCX/Excel)
```

---

## 🎯 Three-Level Analysis Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUESTIONNAIRE (58 Questions)                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ OPERATIONAL  │    │   TACTICAL   │    │  STRATEGIC   │
│    LEVEL     │    │    LEVEL     │    │    LEVEL     │
├──────────────┤    ├──────────────┤    ├──────────────┤
│ Technical    │    │ Management   │    │ Executive    │
│ Questions    │    │ Questions    │    │ Questions    │
└──────────────┘    └──────────────┘    └──────────────┘
        ↓                     ↓                     ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ AI Analysis  │    │ AI Analysis  │    │ AI Analysis  │
│ • Likelihood │    │ • Likelihood │    │ • Likelihood │
│ • Impact     │    │ • Impact     │    │ • Impact     │
│ • Gap        │    │ • Gap        │    │ • Gap        │
│ • Threat     │    │ • Threat     │    │ • Threat     │
│ • Mitigation │    │ • Mitigation │    │ • Mitigation │
└──────────────┘    └──────────────┘    └──────────────┘
        ↓                     ↓                     ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Operational  │    │  Tactical    │    │  Strategic   │
│   Summary    │    │   Summary    │    │   Summary    │
│ • Avg Score  │    │ • Avg Score  │    │ • Avg Score  │
│ • Risk Dist  │    │ • Risk Dist  │    │ • Risk Dist  │
│ • Top Risks  │    │ • Top Risks  │    │ • Top Risks  │
└──────────────┘    └──────────────┘    └──────────────┘
        ↓                     ↓                     ↓
        └─────────────────────┼─────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │ OVERALL SUMMARY  │
                    │ • Total Questions│
                    │ • Overall Score  │
                    │ • Risk Matrix    │
                    └──────────────────┘
```

---

## 📊 Risk Scoring Engine

```
┌─────────────────────────────────────────────────────────────────┐
│                    RISK SCORING ENGINE                           │
└─────────────────────────────────────────────────────────────────┘

Question + Answer
        ↓
┌──────────────────────┐
│   AI Analysis        │
│   (OpenRouter API)   │
└──────────────────────┘
        ↓
┌──────────────────────┐
│ Quantitative Scoring │
├──────────────────────┤
│ Likelihood: 1-5      │
│ Impact: 1-5          │
│ Risk Score: L × I    │
│ Range: 1-25          │
└──────────────────────┘
        ↓
┌──────────────────────┐
│ Risk Classification  │
├──────────────────────┤
│ 21-25: CRITICAL      │
│ 16-20: HIGH          │
│ 9-15:  MEDIUM        │
│ 4-8:   LOW           │
│ 1-3:   VERY LOW      │
└──────────────────────┘
        ↓
┌──────────────────────┐
│ Qualitative Analysis │
├──────────────────────┤
│ • Gap Identification │
│ • Threat Assessment  │
│ • Mitigation Plan    │
│ • Impact Description │
└──────────────────────┘
        ↓
┌──────────────────────┐
│   Store Results      │
│   (MongoDB)          │
└──────────────────────┘
```

---

## 📈 Report Generation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REPORT GENERATION                             │
└─────────────────────────────────────────────────────────────────┘

Analysis Data + Report Level
        ↓
┌──────────────────────┐
│ Data Preparation     │
├──────────────────────┤
│ • Extract Level Data │
│ • Calculate Metrics  │
│ • Generate Insights  │
└──────────────────────┘
        ↓
        ├─────────────────┬─────────────────┬─────────────────┐
        ↓                 ↓                 ↓                 ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  STRATEGIC   │  │   TACTICAL   │  │ OPERATIONAL  │  │    COMMON    │
│   REPORT     │  │    REPORT    │  │   REPORT     │  │   CONTENT    │
├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤
│ • Exec       │  │ • Control    │  │ • Technical  │  │ • Header     │
│   Summary    │  │   Analysis   │  │   Vulns      │  │ • Summary    │
│ • Business   │  │ • Policy     │  │ • Impl Steps │  │ • Risk Matrix│
│   Impact     │  │   Gaps       │  │ • Patch Mgmt │  │ • Charts     │
│ • Governance │  │ • Training   │  │ • Monitoring │  │ • Recommend  │
│ • Resources  │  │ • Incident   │  │ • Backup     │  │ • Timeline   │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
        ↓                 ↓                 ↓                 ↓
        └─────────────────┴─────────────────┴─────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  FINAL REPORT    │
                    │  • Content       │
                    │  • Risk Matrix   │
                    │  • Charts        │
                    │  • Metadata      │
                    └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  EXPORT FORMAT   │
                    │  • PDF           │
                    │  • DOCX          │
                    │  • Excel         │
                    └──────────────────┘
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
└─────────────────────────────────────────────────────────────────┘

User Request
    ↓
┌──────────────────────┐
│  Authentication      │
│  (NextAuth.js)       │
│  • Session Check     │
│  • JWT Validation    │
└──────────────────────┘
    ↓
┌──────────────────────┐
│  Authorization       │
│  • Role Check        │
│  • Permission Check  │
└──────────────────────┘
    ↓
┌──────────────────────┐
│  Input Validation    │
│  • Schema Check      │
│  • Sanitization      │
└──────────────────────┘
    ↓
┌──────────────────────┐
│  Business Logic      │
│  • Analysis Lock     │
│  • Rate Limiting     │
└──────────────────────┘
    ↓
┌──────────────────────┐
│  Data Access         │
│  • MongoDB           │
│  • Encrypted         │
└──────────────────────┘
    ↓
Response
```

---

## 🔄 Real-Time Updates (SSE)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER-SENT EVENTS                            │
└─────────────────────────────────────────────────────────────────┘

Client (Dashboard)
    ↓
Connect to /api/notifications/stream
    ↓
┌──────────────────────┐
│  SSE Connection      │
│  • Keep-Alive        │
│  • Event Stream      │
└──────────────────────┘
    ↑
    │ (Events)
    │
┌──────────────────────┐
│  SSE Hub             │
│  • Broadcast Events  │
│  • Manage Clients    │
└──────────────────────┘
    ↑
    │ (Notifications)
    │
┌──────────────────────┐
│  Analysis Process    │
│  • Start Event       │
│  • Progress Event    │
│  • Complete Event    │
└──────────────────────┘
```

---

## 💾 Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB COLLECTIONS                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  Questionnaires      │
├──────────────────────┤
│ • _id                │
│ • externalId         │
│ • title              │
│ • company            │
│ • category           │
│ • status             │
│ • questions[]        │
│   - id               │
│   - question         │
│   - answer           │
│   - section          │
│   - level            │
│ • createdAt          │
│ • updatedAt          │
└──────────────────────┘
        ↓ (1:1)
┌──────────────────────┐
│  RiskAnalysis        │
├──────────────────────┤
│ • _id                │
│ • questionnaireId    │
│ • company            │
│ • category           │
│ • metadata           │
│ • operational[]      │
│   - questionId       │
│   - analysis         │
│     * likelihood     │
│     * impact         │
│     * riskScore      │
│     * gap            │
│     * threat         │
│     * mitigation     │
│ • tactical[]         │
│ • strategic[]        │
│ • summary            │
│   - operational      │
│   - tactical         │
│   - strategic        │
│   - overall          │
│ • createdAt          │
│ • updatedAt          │
└──────────────────────┘
        ↓ (1:N)
┌──────────────────────┐
│  Reports             │
├──────────────────────┤
│ • _id                │
│ • analysisId         │
│ • level              │
│ • content            │
│ • riskMatrix         │
│ • charts             │
│ • exportFormats[]    │
│ • generatedAt        │
│ • createdAt          │
│ • updatedAt          │
└──────────────────────┘

┌──────────────────────┐
│  Users               │
├──────────────────────┤
│ • _id                │
│ • email              │
│ • password (hashed)  │
│ • name               │
│ • role               │
│ • createdAt          │
└──────────────────────┘

┌──────────────────────┐
│  AnalysisLocks       │
├──────────────────────┤
│ • _id                │
│ • questionnaireId    │
│ • lockedAt           │
│ • expiresAt          │
└──────────────────────┘
```

---

## 🔧 Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                              │
└─────────────────────────────────────────────────────────────────┘

Frontend:
├── Next.js 14 (App Router)
├── React 18
├── TypeScript
├── Tailwind CSS
└── Recharts (Visualization)

Backend:
├── Next.js API Routes
├── Node.js Runtime
└── TypeScript

Database:
├── MongoDB
└── Mongoose ODM

Authentication:
├── NextAuth.js
└── JWT

AI Integration:
├── OpenRouter API
└── GPT-4o Mini Model

Report Generation:
├── ExcelJS (Excel)
├── jsPDF (PDF)
├── docx (Word)
└── pptxgenjs (PowerPoint)

Real-Time:
└── Server-Sent Events (SSE)

Deployment:
├── Vercel (Recommended)
├── Docker (Optional)
└── Self-Hosted (Supported)
```

---

## 📊 Performance Considerations

### Analysis Processing
- **Average Time:** 5-10 minutes for 58 questions
- **Concurrency:** Analysis lock prevents duplicate processing
- **Rate Limiting:** API calls throttled to avoid rate limits
- **Caching:** Results cached in MongoDB

### Report Generation
- **Average Time:** 2-5 seconds per report
- **Caching:** Reports cached after first generation
- **Export:** On-demand generation for PDF/DOCX

### Database Queries
- **Indexes:** Created on frequently queried fields
- **Pagination:** Implemented for large result sets
- **Aggregation:** Used for summary statistics

---

## 🔄 Scalability

### Horizontal Scaling
- Stateless API design
- MongoDB replica sets
- Load balancer compatible

### Vertical Scaling
- Optimized queries
- Efficient data structures
- Minimal memory footprint

### Future Enhancements
- Queue-based analysis processing
- Distributed caching (Redis)
- Microservices architecture
- GraphQL API

---

## 📚 Related Documentation

- **SYSTEM-OVERVIEW.md** - Complete system documentation
- **QUICK-REFERENCE.md** - Quick reference guide
- **ANALYSIS-WORKFLOW.md** - Workflow details
- **UPDATE-SUMMARY.md** - Recent updates
- **README.md** - Setup and configuration

---

**Architecture Version:** 2.0  
**Last Updated:** 2024
