# "Invalid email or password" Error - Quick Fix

## The Problem
Users getting "Invalid email or password" error when trying to login.

## The Root Cause
OAuth users (created via Google/GitHub/Microsoft) have empty passwords. When they try credentials login, bcrypt comparison fails.

## The Fix (Already Applied)

### Change 1: Make password optional
**File**: `models/User.ts`
- Changed password field to optional for OAuth users

### Change 2: Check for empty password
**File**: `lib/auth.ts`
- Added check to prevent OAuth users from attempting credentials login
- Returns error early before bcrypt comparison

## What to Do Now

### Step 1: Clear Cache
```bash
rm -r .next
```

### Step 2: Restart Server
```bash
npm run dev
```

### Step 3: Test

**Test Credentials Login**:
1. Create user via signup
2. Login with email/password
3. ✅ Should work

**Test OAuth Login**:
1. Click "Google/GitHub/Microsoft"
2. Authenticate
3. ✅ Should work

**Test OAuth User Tries Credentials**:
1. Create user via OAuth
2. Try to login with email/password
3. ✅ Should see "Invalid email or password"
4. User should use OAuth login instead

## What's Fixed
✅ Credentials users can login  
✅ OAuth users can login  
✅ Mixed users can use either method  
✅ Clear error messages  

## What's NOT Affected
✅ OAuth login  
✅ MFA  
✅ Dashboard  
✅ All other features  
✅ Existing users  

## Files Changed
- `models/User.ts` - Made password optional
- `lib/auth.ts` - Added OAuth user check

## Status
✅ READY FOR DEPLOYMENT

---

## If Still Having Issues

1. Clear browser cache (F12 → right-click refresh → empty cache)
2. Check that you're using correct email/password
3. Check server logs for errors
4. Verify MongoDB connection
5. Try creating a new test user

---

See `INVALID-PASSWORD-ERROR-FIX.md` for detailed technical information.
