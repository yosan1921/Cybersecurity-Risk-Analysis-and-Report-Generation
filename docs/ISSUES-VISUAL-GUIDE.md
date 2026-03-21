# Issues Visual Guide

## Issue #1: 🔴 CRITICAL - User Role Enum (OAuth Failing)

### The Error
```
User validation failed: role: `user` is not a valid enum value for path `role`
```

### Where It Happens
```
Google OAuth Flow
    ↓
User clicks "Google"
    ↓
Google redirects back
    ↓
Code tries to create user
    ↓
Sets: role: "user"  ❌ INVALID
    ↓
MongoDB rejects it
    ↓
OAuth fails ❌
```

### The Problem
**File**: `lib/auth.ts` line 136

Current (WRONG):
```typescript
role: "user",  // ❌ Not in enum
```

Valid values (from `models/User.ts`):
```typescript
enum: ["Director", "Division Head", "Risk Analyst", "Staff"]
```

### The Fix
Change to one of the valid values:
```typescript
role: "Staff",  // ✅ Valid
```

---

## Issue #2: ⚠️ WARNING - Tailwind darkMode

### The Warning
```
warn - The `darkMode` option in your Tailwind CSS configuration is set to `false`, 
which now behaves the same as `media`.
```

### Where It Happens
**File**: `tailwind.config.js` line 8

Current (DEPRECATED):
```javascript
darkMode: false,  // ⚠️ Deprecated
```

### The Fix
Option 1 - Remove it:
```javascript
// Delete the line entirely
```

Option 2 - Update it:
```javascript
darkMode: 'media',  // ✅ Recommended
```

---

## Issue #3: ⚠️ WARNING - Logo Image

### The Error
```
The requested resource isn't a valid image for /logo2.png received null
```

### Where It's Used
- `app/login/page.tsx` - Login page logo
- `app/signup/page.tsx` - Signup page logo
- `app/layout.tsx` - Favicon
- `app/components/Layout.tsx` - Layout logo

### The Problem
**File**: `/public/logo2.png`

The file exists but Next.js can't process it:
- ❌ File might be corrupted
- ❌ File might be invalid PNG
- ❌ File might be too large
- ❌ Build cache issue

### The Fix
1. Verify the file is valid
2. Or replace with a fresh copy of the logo

---

## Priority Matrix

```
┌─────────────────────────────────────────┐
│ PRIORITY vs IMPACT                      │
├─────────────────────────────────────────┤
│                                         │
│  HIGH PRIORITY                          │
│  ┌─────────────────────────────────┐   │
│  │ 🔴 User Role Enum              │   │
│  │ - Breaks OAuth                  │   │
│  │ - Must fix first                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  MEDIUM PRIORITY                        │
│  ┌─────────────────────────────────┐   │
│  │ ⚠️ Tailwind darkMode            │   │
│  │ - Console warning               │   │
│  │ - Should fix                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  LOW PRIORITY                           │
│  ┌─────────────────────────────────┐   │
│  │ ⚠️ Logo Image                   │   │
│  │ - UI issue                      │   │
│  │ - Nice to fix                   │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Impact on Features

### OAuth (Google, GitHub, Microsoft)
```
Before Fix:
  New users: ❌ FAILS (role enum error)
  Existing users: ✅ Works

After Fix:
  New users: ✅ WORKS
  Existing users: ✅ Works
```

### Credentials Login
```
Before Fix: ✅ Works
After Fix: ✅ Works (unchanged)
```

### Dashboard & Other Features
```
Before Fix: ✅ Works
After Fix: ✅ Works (unchanged)
```

---

## Fix Checklist

- [ ] Fix role enum in `lib/auth.ts` line 136
  - Change `role: "user"` to `role: "Staff"`

- [ ] Fix Tailwind config in `tailwind.config.js` line 8
  - Remove `darkMode: false` or change to `darkMode: 'media'`

- [ ] Fix logo in `/public/logo2.png`
  - Verify file is valid or replace with fresh copy

- [ ] Restart dev server
  ```bash
  rm -r .next
  npm run dev
  ```

- [ ] Test Google OAuth
  - Go to login page
  - Click "Google"
  - Should work now ✅

---

## Summary

| Issue | Severity | File | Line | Fix |
|-------|----------|------|------|-----|
| Role enum | 🔴 CRITICAL | `lib/auth.ts` | 136 | Change `"user"` to `"Staff"` |
| Tailwind | ⚠️ WARNING | `tailwind.config.js` | 8 | Remove or update `darkMode` |
| Logo | ⚠️ WARNING | `/public/logo2.png` | - | Verify/replace file |

All fixes are simple and don't affect other functionality.
