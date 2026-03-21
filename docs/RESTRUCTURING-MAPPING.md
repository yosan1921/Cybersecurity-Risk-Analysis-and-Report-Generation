# Project Restructuring Mapping Guide
## Current Structure → Target Structure

This document maps every file and folder from your current structure to the new target structure shown in your reference image.

---

## 📋 OVERVIEW

### Current State (Root Level)
```
INSA-PROJECT-master/
├── app/                    (Next.js App Router - pages & API routes)
├── lib/                    (Utilities, services, models)
├── models/                 (Database models)
├── components/             (Shared components)
├── public/                 (Static assets)
├── types/                  (TypeScript definitions)
├── src/                    (Legacy - to be removed)
├── [80+ .md files]         (Documentation)
├── Config files            (package.json, tsconfig.json, etc.)
└── Root-level files        (.env.local, middleware.ts, etc.)
```

### Target State (src/ Based)
```
INSA-PROJECT-master/
├── src/
│   ├── app/                (Next.js App Router)
│   ├── components/         (React components)
│   ├── hooks/              (Custom React hooks)
│   ├── layouts/            (Layout components)
│   ├── lib/                (Utilities & helpers)
│   ├── models/             (Database models)
│   ├── pages/              (API routes)
│   ├── services/           (Business logic)
│   ├── styles/             (Global styles)
│   ├── types/              (TypeScript definitions)
│   └── utils/              (Utility functions)
├── public/                 (Static assets - stays at root)
├── docs/                   (Documentation)
├── Config files            (stays at root)
└── Root-level files        (stays at root)
```

---

## 🗂️ DETAILED FILE MAPPING

### 1. APP ROUTER & PAGES
**Current Location** → **Target Location**

```
app/layout.tsx                          → src/app/layout.tsx
app/page.tsx                            → src/app/page.tsx
app/globals.css                         → src/styles/globals.css
app/icon.png                            → src/assets/icon.png

app/dashboard/page.tsx                  → src/app/dashboard/page.tsx
app/login/page.tsx                      → src/app/login/page.tsx
app/signup/page.tsx                     → src/app/signup/page.tsx
app/questionnaires/page.tsx             → src/app/questionnaires/page.tsx
app/reports/page.tsx                    → src/app/reports/page.tsx
app/risks/page.tsx                      → src/app/risks/page.tsx
app/risk-analysis/page.tsx              → src/app/risk-analysis/page.tsx
app/risk-evaluation/page.tsx            → src/app/risk-evaluation/page.tsx
app/risk-matrix/page.tsx                → src/app/risk-matrix/page.tsx
app/risk-treatment/page.tsx             → src/app/risk-treatment/page.tsx
```

### 2. API ROUTES
**Current Location** → **Target Location**

```
app/api/auth/[...nextauth]/route.ts     → src/app/api/auth/[...nextauth]/route.ts
app/api/auth/signup/route.ts            → src/app/api/auth/signup/route.ts

app/api/analysis/get/[id]/route.ts      → src/app/api/analysis/get/[id]/route.ts
app/api/analysis/process/route.ts       → src/app/api/analysis/process/route.ts
app/api/analysis/processed/route.ts     → src/app/api/analysis/processed/route.ts
app/api/analysis/processed/update/route.ts → src/app/api/analysis/processed/update/route.ts
app/api/analysis/reanalyze/route.ts     → src/app/api/analysis/reanalyze/route.ts

app/api/companies/list/route.ts         → src/app/api/companies/list/route.ts

app/api/excelreport/generate/route.ts   → src/app/api/excelreport/generate/route.ts

app/api/notifications/route.ts          → src/app/api/notifications/route.ts
app/api/notifications/stream/route.ts   → src/app/api/notifications/stream/route.ts

app/api/questionnaires/fetch/route.ts   → src/app/api/questionnaires/fetch/route.ts
app/api/questionnaires/list/route.ts    → src/app/api/questionnaires/list/route.ts

app/api/reports/export/route.ts         → src/app/api/reports/export/route.ts
app/api/reports/generate/route.ts       → src/app/api/reports/generate/route.ts
app/api/reports/list/route.ts           → src/app/api/reports/list/route.ts
```

### 3. COMPONENTS
**Current Location** → **Target Location**

```
app/components/Layout.tsx                → src/components/Layout.tsx
app/components/NotificationPanel.tsx     → src/components/NotificationPanel.tsx
app/components/QuestionnaireSidebar.tsx  → src/components/QuestionnaireSidebar.tsx
app/components/RiskCharts.tsx            → src/components/RiskCharts.tsx
app/components/SessionProvider.tsx       → src/components/SessionProvider.tsx

components/RiskMatrix.tsx                → src/components/RiskMatrix.tsx
```

### 4. LAYOUTS
**Current Location** → **Target Location**

```
app/components/Layout.tsx                → src/layouts/Layout.tsx
                                           (or keep in components if not a page layout)
```

### 5. LIBRARY & UTILITIES
**Current Location** → **Target Location**

```
lib/ai.ts                               → src/lib/ai.ts
lib/auth.ts                             → src/lib/auth.ts
lib/mongodb.ts                          → src/lib/mongodb.ts
lib/sseHub.ts                           → src/lib/sseHub.ts

lib/utils/ai.ts                         → src/utils/ai.ts
```

### 6. SERVICES (Business Logic)
**Current Location** → **Target Location**

```
lib/services/riskAnalyzer.ts            → src/services/riskAnalyzer.ts
lib/services/analysisLock.ts            → src/services/analysisLock.ts
lib/services/reportService.ts           → src/services/reportService.ts
lib/services/updateanalysisService.ts   → src/services/updateanalysisService.ts
```

### 7. MODELS (Database Schemas)
**Current Location** → **Target Location**

```
models/User.ts                          → src/models/User.ts
models/Questionnaire.ts                 → src/models/Questionnaire.ts
models/Report.ts                        → src/models/Report.ts
models/RiskAnalysis.ts                  → src/models/RiskAnalysis.ts
models/AnalysisLock.ts                  → src/models/AnalysisLock.ts

lib/models/RiskModel.ts                 → src/models/RiskModel.ts
```

### 8. TYPES & DEFINITIONS
**Current Location** → **Target Location**

```
types/next-auth.d.ts                    → src/types/next-auth.d.ts
```

### 9. STATIC ASSETS
**Current Location** → **Target Location**

```
public/favicon.png                      → public/favicon.png (stays at root)
public/logo1.png                        → public/logo1.png (stays at root)
public/logo2.png                        → public/logo2.png (stays at root)
public/import-external-questionnaire.html → public/import-external-questionnaire.html
public/import-questionnaire-web.html    → public/import-questionnaire-web.html
public/questionnaire-template.json      → public/questionnaire-template.json

app/icon.png                            → src/assets/icon.png
```

### 10. STYLES
**Current Location** → **Target Location**

```
app/globals.css                         → src/styles/globals.css
```

### 11. DOCUMENTATION
**Current Location** → **Target Location**

```
AUTHENTICATION-FLOWS.md                 → docs/AUTHENTICATION-FLOWS.md
GOOGLE-OAUTH-SETUP-VISUAL.md            → docs/GOOGLE-OAUTH-SETUP-VISUAL.md
SECURITY-VERIFICATION.md                → docs/SECURITY-VERIFICATION.md
SSO-MFA-IMPLEMENTATION-SUMMARY.md       → docs/SSO-MFA-IMPLEMENTATION-SUMMARY.md
EXTERNAL-IMPORT-GUIDE.md                → docs/EXTERNAL-IMPORT-GUIDE.md
[All other .md files]                   → docs/[filename].md
```

### 12. CONFIGURATION FILES (Stay at Root)
**Current Location** → **Target Location**

```
.env.local                              → .env.local (stays at root)
.gitignore                              → .gitignore (stays at root)
.eslintrc.json                          → .eslintrc.json (stays at root)
package.json                            → package.json (stays at root)
package-lock.json                       → package-lock.json (stays at root)
tsconfig.json                           → tsconfig.json (stays at root)
next.config.js                          → next.config.js (stays at root)
tailwind.config.js                      → tailwind.config.js (stays at root)
postcss.config.js                       → postcss.config.js (stays at root)
middleware.ts                           → middleware.ts (stays at root)
next-env.d.ts                           → next-env.d.ts (stays at root)
```

### 13. FOLDERS TO DELETE
```
src/                                    (Legacy - DELETE after migration)
.idea/                                  (IDE folder - can delete)
.next/                                  (Build cache - will regenerate)
node_modules/                           (Will regenerate on npm install)
```

---

## 📁 COMPLETE TARGET STRUCTURE

```
INSA-PROJECT-master/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analysis/
│   │   │   │   ├── get/[id]/route.ts
│   │   │   │   ├── process/route.ts
│   │   │   │   ├── processed/route.ts
│   │   │   │   ├── processed/update/route.ts
│   │   │   │   └── reanalyze/route.ts
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── signup/route.ts
│   │   │   ├── companies/
│   │   │   │   └── list/route.ts
│   │   │   ├── excelreport/
│   │   │   │   └── generate/route.ts
│   │   │   ├── notifications/
│   │   │   │   ├── route.ts
│   │   │   │   └── stream/route.ts
│   │   │   ├── questionnaires/
│   │   │   │   ├── fetch/route.ts
│   │   │   │   └── list/route.ts
│   │   │   └── reports/
│   │   │       ├── export/route.ts
│   │   │       ├── generate/route.ts
│   │   │       └── list/route.ts
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── questionnaires/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── risks/
│   │   │   └── page.tsx
│   │   ├── risk-analysis/
│   │   │   └── page.tsx
│   │   ├── risk-evaluation/
│   │   │   └── page.tsx
│   │   ├── risk-matrix/
│   │   │   └── page.tsx
│   │   ├── risk-treatment/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── NotificationPanel.tsx
│   │   ├── QuestionnaireSidebar.tsx
│   │   ├── RiskCharts.tsx
│   │   ├── RiskMatrix.tsx
│   │   └── SessionProvider.tsx
│   │
│   ├── hooks/
│   │   └── (custom hooks if any)
│   │
│   ├── layouts/
│   │   └── (layout components if needed)
│   │
│   ├── lib/
│   │   ├── ai.ts
│   │   ├── auth.ts
│   │   ├── mongodb.ts
│   │   └── sseHub.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Questionnaire.ts
│   │   ├── Report.ts
│   │   ├── RiskAnalysis.ts
│   │   ├── AnalysisLock.ts
│   │   └── RiskModel.ts
│   │
│   ├── services/
│   │   ├── riskAnalyzer.ts
│   │   ├── analysisLock.ts
│   │   ├── reportService.ts
│   │   └── updateanalysisService.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── types/
│   │   └── next-auth.d.ts
│   │
│   ├── utils/
│   │   └── ai.ts
│   │
│   └── assets/
│       └── icon.png
│
├── public/
│   ├── favicon.png
│   ├── logo1.png
│   ├── logo2.png
│   ├── import-external-questionnaire.html
│   ├── import-questionnaire-web.html
│   └── questionnaire-template.json
│
├── docs/
│   ├── AUTHENTICATION-FLOWS.md
│   ├── GOOGLE-OAUTH-SETUP-VISUAL.md
│   ├── SECURITY-VERIFICATION.md
│   ├── SSO-MFA-IMPLEMENTATION-SUMMARY.md
│   ├── EXTERNAL-IMPORT-GUIDE.md
│   └── (all other .md files)
│
├── .env.local
├── .gitignore
├── .eslintrc.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── middleware.ts
├── next-env.d.ts
└── README.md
```

---

## 🔄 IMPORT PATH CHANGES REQUIRED

After moving files, update imports in your code:

### Example 1: Service Imports
```typescript
// BEFORE
import { analyzeRisk } from '../lib/services/riskAnalyzer'

// AFTER
import { analyzeRisk } from '@/services/riskAnalyzer'
```

### Example 2: Model Imports
```typescript
// BEFORE
import { User } from '../models/User'

// AFTER
import { User } from '@/models/User'
```

### Example 3: Component Imports
```typescript
// BEFORE
import Layout from '../app/components/Layout'

// AFTER
import Layout from '@/components/Layout'
```

### Example 4: Utility Imports
```typescript
// BEFORE
import { someUtil } from '../lib/utils/ai'

// AFTER
import { someUtil } from '@/utils/ai'
```

---

## ✅ MIGRATION CHECKLIST

- [ ] Create `src/` folder structure
- [ ] Move `app/` to `src/app/`
- [ ] Move `lib/` to `src/lib/`
- [ ] Move `models/` to `src/models/`
- [ ] Move `components/` to `src/components/`
- [ ] Move `types/` to `src/types/`
- [ ] Create `src/services/` and move service files
- [ ] Create `src/utils/` and move utility files
- [ ] Create `src/styles/` and move CSS files
- [ ] Create `src/assets/` and move asset files
- [ ] Create `docs/` folder and move all `.md` files
- [ ] Update `tsconfig.json` with path aliases
- [ ] Update all import statements in code
- [ ] Delete old `src/` folder (legacy)
- [ ] Delete old root-level folders (`app/`, `lib/`, `models/`, `components/`, `types/`)
- [ ] Test build: `npm run build`
- [ ] Test dev server: `npm run dev`
- [ ] Verify all routes work
- [ ] Verify all API endpoints work

---

## 📝 NOTES

1. **Next.js Requirements**: The `app/` folder must be inside `src/` for Next.js to recognize it as the App Router
2. **Public Folder**: Always stays at the root level - Next.js requirement
3. **Config Files**: All configuration files stay at root
4. **Path Aliases**: Use `@/` prefix for cleaner imports (configured in `tsconfig.json`)
5. **Environment Variables**: `.env.local` stays at root
6. **Middleware**: `middleware.ts` stays at root (Next.js requirement)

