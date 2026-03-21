# Server Errors - Comprehensive Analysis (No Code Modifications)

**Analysis Date**: March 13, 2026  
**Status**: 3 Issues Identified  

---

## 🔴 CRITICAL ISSUE #1: User Validation Error (OAuth Failing)

### Error Message
```
User validation failed: role: `user` is not a valid enum value for path `role`
```

### Root Cause
When a new user signs up via Google OAuth, the code tries to create a User with `role: "user"`, but the User schema only accepts these roles:
- `"Director"`
- `"Division Head"`
- `"Risk Analyst"`
- `"Staff"`

### Where the Problem Is
**File**: `lib/auth.ts` (Line 136)

```typescript
dbUser = new User({
  email: user.email?.toLowerCase(),
  name: user.name || profile?.name || user.email?.split("@")[0],
  password: "", // OAuth users don't have passwords
  role: "user",  // ❌ INVALID - not in enum
  isActive: true,
  ssoProvider: account.provider,
  ssoId: account.providerAccountId,
  emailVerified: user.email_verified || true,
});
```

### User Model Definition
**File**: `models/User.ts` (Lines 3, 30-33)

```typescript
export type UserRole = "Director" | "Division Head" | "Risk Analyst" | "Staff";

// In schema:
role: {
  type: String,
  enum: ["Director", "Division Head", "Risk Analyst", "Staff"],
  required: true,
}
```

### Why Google OAuth Fails
1. User clicks "Google" button
2. Google redirects back with authorization code
3. OAuth callback tries to create new user
4. Code sets `role: "user"`
5. MongoDB validation fails (not in enum)
6. User creation fails
7. OAuth flow fails
8. User redirected to error page

### Impact
- ❌ Google OAuth login fails for new users
- ❌ GitHub OAuth login fails for new users
- ❌ Microsoft OAuth login fails for new users
- ✅ Existing users with valid roles can still login
- ✅ Credentials authentication still works

### What Needs to Change
The `role: "user"` on line 136 must be changed to one of the valid enum values:
- `"Director"`
- `"Division Head"`
- `"Risk Analyst"`
- `"Staff"`

**Recommended**: Use `"Staff"` as the default role for new OAuth users (lowest privilege level).

---

## ⚠️ WARNING ISSUE #2: Tailwind darkMode Configuration

### Warning Message
```
warn - The `darkMode` option in your Tailwind CSS configuration is set to `false`, 
which now behaves the same as `media`.
warn - Change `darkMode` to `media` or remove it entirely.
```

### Root Cause
The Tailwind configuration explicitly sets `darkMode: false`, which is deprecated in newer Tailwind versions.

### Where the Problem Is
**File**: `tailwind.config.js` (Line 8)

```javascript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: false,  // ⚠️ Deprecated
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Impact
- ⚠️ Warning in console (non-critical)
- ✅ App still works correctly
- ✅ Dark mode functionality not affected
- ✅ No user-facing issues

### What Needs to Change
Option 1: Remove the line entirely (defaults to `'media'`)
```javascript
// Remove: darkMode: false,
```

Option 2: Change to explicit value
```javascript
darkMode: 'media',  // Uses system preference
// OR
darkMode: 'class',  // Uses class-based dark mode
```

---

## ⚠️ WARNING ISSUE #3: Logo Image Error

### Error Message
```
The requested resource isn't a valid image for /logo2.png received null
```

### Root Cause
The `logo2.png` file exists in `/public/logo2.png`, but Next.js Image component is failing to process it. Possible causes:
1. Image file is corrupted
2. Image format is unsupported
3. Build cache issue
4. File size too large

### Where It's Referenced
- `app/layout.tsx` - Favicon and icons
- `app/login/page.tsx` - Line 77-79
- `app/signup/page.tsx` - Line 68-70
- `app/components/Layout.tsx` - Line 31

### Impact
- ⚠️ Logo doesn't display on login/signup pages
- ⚠️ Favicon might not display
- ✅ App still works (just missing logo)
- ✅ No functionality affected

### What Needs to Check
1. Verify `/public/logo2.png` exists and is valid
2. Check file size (should be reasonable, not too large)
3. Verify it's a valid PNG file (not corrupted)
4. Try replacing with a fresh copy of the logo

---

## Summary Table

| Issue | Severity | Type | Impact | Fix Required |
|-------|----------|------|--------|--------------|
| User role enum | 🔴 CRITICAL | Logic Error | OAuth fails | YES - Change role value |
| Tailwind darkMode | ⚠️ WARNING | Config | Console warning | YES - Remove or update config |
| Logo image | ⚠️ WARNING | Asset | Missing logo | YES - Verify/replace file |

---

## Priority Order

### 1️⃣ CRITICAL (Must Fix)
**User role enum error** - This is why Google OAuth is failing
- Location: `lib/auth.ts` line 136
- Change: `role: "user"` → `role: "Staff"` (or other valid role)

### 2️⃣ IMPORTANT (Should Fix)
**Tailwind darkMode warning** - Clean up configuration
- Location: `tailwind.config.js` line 8
- Change: Remove `darkMode: false,` or change to `darkMode: 'media'`

### 3️⃣ NICE TO HAVE (Can Fix)
**Logo image error** - Improve UI
- Location: `/public/logo2.png`
- Action: Verify file is valid or replace with fresh copy

---

## How These Issues Affect OAuth Flow

### Current Flow (BROKEN)
```
1. User clicks "Google"
   ↓
2. Google redirects with auth code
   ↓
3. OAuth callback triggered
   ↓
4. Code tries to create user with role: "user"
   ↓
5. ❌ MongoDB validation fails (invalid enum)
   ↓
6. User creation fails
   ↓
7. OAuth flow fails
   ↓
8. User redirected to error page
```

### After Fixing Role Enum
```
1. User clicks "Google"
   ↓
2. Google redirects with auth code
   ↓
3. OAuth callback triggered
   ↓
4. Code creates user with role: "Staff" (valid)
   ↓
5. ✅ MongoDB validation passes
   ↓
6. User created successfully
   ↓
7. JWT token created
   ↓
8. Session established
   ↓
9. ✅ User redirected to dashboard
```

---

## What NOT to Change

✅ **Don't change**:
- Authentication logic
- Middleware configuration
- NextAuth setup
- Database connection
- API routes
- Other user fields

✅ **Only change**:
- Line 136 in `lib/auth.ts`: `role: "user"` → `role: "Staff"`
- Line 8 in `tailwind.config.js`: Remove or update `darkMode`
- `/public/logo2.png`: Verify/replace file

---

## Verification After Fixes

### Test 1: Google OAuth
1. Go to `http://localhost:3000/login`
2. Click "Google" button
3. Authenticate with Google
4. ✅ Should redirect to dashboard (not error page)

### Test 2: Tailwind Warning
1. Check server console
2. ✅ Should not see darkMode warning

### Test 3: Logo Display
1. Go to `http://localhost:3000/login`
2. ✅ Logo should display at top of page

---

## No Other Functionality Affected

These fixes only affect:
- ✅ OAuth user creation (currently broken)
- ✅ Build warnings (non-critical)
- ✅ UI appearance (logo display)

They do NOT affect:
- ✅ Credentials authentication
- ✅ Dashboard functionality
- ✅ API routes
- ✅ Database operations
- ✅ MFA functionality
- ✅ Questionnaires
- ✅ Reports
- ✅ Risk analysis
- ✅ Any other features

---

## Conclusion

**3 issues identified:**
1. 🔴 **CRITICAL**: User role enum - Causes OAuth to fail
2. ⚠️ **WARNING**: Tailwind darkMode - Console warning
3. ⚠️ **WARNING**: Logo image - Missing UI element

**All are fixable without affecting other functionality.**

The main issue preventing Google OAuth from working is the invalid role value. Once that's fixed, OAuth will work correctly.
