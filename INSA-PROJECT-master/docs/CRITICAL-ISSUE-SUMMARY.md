# Critical Issue Summary - Why Google OAuth is Failing

## The Problem

When you try to login with Google, you get this error:
```
User validation failed: role: `user` is not a valid enum value for path `role`
```

## Root Cause

In `lib/auth.ts` line 136, when creating a new OAuth user, the code sets:
```typescript
role: "user"
```

But the User model only accepts these roles:
- `"Director"`
- `"Division Head"`
- `"Risk Analyst"`
- `"Staff"`

The value `"user"` is NOT in the allowed list.

## Why This Breaks OAuth

1. User clicks "Google"
2. Google redirects back
3. Code tries to create user with `role: "user"`
4. ❌ MongoDB rejects it (invalid enum value)
5. User creation fails
6. OAuth flow fails
7. User sees error

## The Fix

Change line 136 in `lib/auth.ts` from:
```typescript
role: "user",
```

To one of the valid values (recommended: `"Staff"`):
```typescript
role: "Staff",
```

## Other Issues Found

### 1. Tailwind Warning
**File**: `tailwind.config.js` line 8
**Issue**: `darkMode: false` is deprecated
**Fix**: Remove the line or change to `darkMode: 'media'`

### 2. Logo Error
**File**: `/public/logo2.png`
**Issue**: Image not loading
**Fix**: Verify file is valid or replace with fresh copy

## Impact

- 🔴 **CRITICAL**: OAuth fails (needs fix)
- ⚠️ **WARNING**: Tailwind warning (should fix)
- ⚠️ **WARNING**: Logo missing (nice to fix)

## What's NOT Affected

✅ Credentials login still works  
✅ Dashboard still works  
✅ All other features still work  
✅ Database still works  
✅ MFA still works  

Only OAuth is broken due to the role enum issue.

## Next Steps

1. Fix the role value in `lib/auth.ts` line 136
2. Fix the Tailwind config in `tailwind.config.js` line 8
3. Verify/replace logo in `/public/logo2.png`
4. Restart dev server
5. Test Google OAuth

See `ERROR-ANALYSIS-AND-FIXES.md` for detailed analysis.
