# Import Paths Update Guide

After the restructuring, you need to update all import statements in your code to use the new paths with the `@/` alias.

---

## 🔧 Step 1: Update `tsconfig.json`

Add or update the `paths` configuration in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 📝 Step 2: Update Import Statements

### Pattern 1: Services

**Before:**
```typescript
import { analyzeRisk } from '../lib/services/riskAnalyzer'
import { reportService } from '../lib/services/reportService'
import { analysisLock } from '../lib/services/analysisLock'
```

**After:**
```typescript
import { analyzeRisk } from '@/services/riskAnalyzer'
import { reportService } from '@/services/reportService'
import { analysisLock } from '@/services/analysisLock'
```

---

### Pattern 2: Models

**Before:**
```typescript
import { User } from '../models/User'
import { Questionnaire } from '../models/Questionnaire'
import { Report } from '../models/Report'
import { RiskAnalysis } from '../models/RiskAnalysis'
```

**After:**
```typescript
import { User } from '@/models/User'
import { Questionnaire } from '@/models/Questionnaire'
import { Report } from '@/models/Report'
import { RiskAnalysis } from '@/models/RiskAnalysis'
```

---

### Pattern 3: Components

**Before:**
```typescript
import Layout from '../app/components/Layout'
import { NotificationPanel } from '../app/components/NotificationPanel'
import { RiskCharts } from '../app/components/RiskCharts'
```

**After:**
```typescript
import Layout from '@/components/Layout'
import { NotificationPanel } from '@/components/NotificationPanel'
import { RiskCharts } from '@/components/RiskCharts'
```

---

### Pattern 4: Utilities

**Before:**
```typescript
import { someUtil } from '../lib/utils/ai'
import { helper } from '../lib/ai'
```

**After:**
```typescript
import { someUtil } from '@/utils/ai'
import { helper } from '@/lib/ai'
```

---

### Pattern 5: Library Files

**Before:**
```typescript
import { auth } from '../lib/auth'
import { connectDB } from '../lib/mongodb'
import { sseHub } from '../lib/sseHub'
```

**After:**
```typescript
import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { sseHub } from '@/lib/sseHub'
```

---

### Pattern 6: Types

**Before:**
```typescript
import type { NextAuthOptions } from '../types/next-auth'
```

**After:**
```typescript
import type { NextAuthOptions } from '@/types/next-auth'
```

---

## 🔍 Files That Need Import Updates

### API Routes
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/analysis/**/*.ts`
- `src/app/api/companies/**/*.ts`
- `src/app/api/excelreport/**/*.ts`
- `src/app/api/notifications/**/*.ts`
- `src/app/api/questionnaires/**/*.ts`
- `src/app/api/reports/**/*.ts`

### Page Components
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/questionnaires/page.tsx`
- `src/app/reports/page.tsx`
- `src/app/risks/page.tsx`
- `src/app/risk-analysis/page.tsx`
- `src/app/risk-evaluation/page.tsx`
- `src/app/risk-matrix/page.tsx`
- `src/app/risk-treatment/page.tsx`

### Components
- `src/components/Layout.tsx`
- `src/components/NotificationPanel.tsx`
- `src/components/QuestionnaireSidebar.tsx`
- `src/components/RiskCharts.tsx`
- `src/components/RiskMatrix.tsx`
- `src/components/SessionProvider.tsx`

### Services
- `src/services/riskAnalyzer.ts`
- `src/services/analysisLock.ts`
- `src/services/reportService.ts`
- `src/services/updateanalysisService.ts`

### Library Files
- `src/lib/ai.ts`
- `src/lib/auth.ts`
- `src/lib/mongodb.ts`
- `src/lib/sseHub.ts`

---

## 🛠️ Quick Find & Replace

You can use your IDE's Find & Replace feature to update imports quickly:

### Find & Replace Examples

**Replace relative imports with @ alias:**

1. **Services:**
   - Find: `from '../lib/services/`
   - Replace: `from '@/services/`

2. **Models:**
   - Find: `from '../models/`
   - Replace: `from '@/models/`

3. **Components:**
   - Find: `from '../app/components/`
   - Replace: `from '@/components/`

4. **Utils:**
   - Find: `from '../lib/utils/`
   - Replace: `from '@/utils/`

5. **Lib:**
   - Find: `from '../lib/`
   - Replace: `from '@/lib/`

---

## ✅ Verification Checklist

After updating imports:

- [ ] All imports use `@/` prefix
- [ ] No relative imports like `../` remain
- [ ] `tsconfig.json` has path aliases configured
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run dev` - server starts
- [ ] All pages load correctly
- [ ] All API routes work
- [ ] No console errors in browser

---

## 🚀 Testing

After updating imports, test your application:

```bash
# Build the project
npm run build

# Start development server
npm run dev

# Run linter
npm run lint
```

---

## 📚 Additional Resources

- [Next.js Path Aliases Documentation](https://nextjs.org/docs/advanced-features/module-path-aliases)
- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)

