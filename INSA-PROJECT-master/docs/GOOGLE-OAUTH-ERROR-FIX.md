# Fix Google OAuth Error - Complete Solution

## Problem
When clicking "Continue with Google", you get an error showing "localhost:3000" instead of redirecting properly.

## Root Cause
The redirect URI in Google OAuth Console doesn't match what NextAuth.js expects.

---

## Solution (3 Steps)

### Step 1: Update Google Console

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click on your OAuth 2.0 Client ID (Web client)
5. In "Authorized redirect URIs", add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Click "Save"

**Important**: Must be exactly as shown - include the full path `/api/auth/callback/google`

### Step 2: Restart Your App

```bash
# Stop the dev server (Ctrl+C)

# Clear cache
rm -r .next

# Restart
npm run dev
```

### Step 3: Test It

1. Open private/incognito browser
2. Go to `http://localhost:3000/login`
3. Click "Google" button
4. You should be redirected to Google login
5. After authenticating, you should be redirected to dashboard
6. ✅ If it works, you're done!

---

## What Was Fixed in Code

### Enhanced Error Handling
The login page now:
- Detects OAuth errors from URL parameters
- Shows helpful error messages
- Clears errors when retrying
- Handles all OAuth error types

### Error Messages
- **OAuthSignin**: "Failed to connect to OAuth provider..."
- **OAuthCallback**: "OAuth callback failed..."
- **OAuthCreateAccount**: "Could not create account..."

---

## Verification Checklist

- [ ] Google Console has redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Dev server restarted
- [ ] `.next` folder cleared
- [ ] Testing in private/incognito browser
- [ ] Google login works ✅

---

## If Still Not Working

### Check 1: Verify Redirect URI in Google Console
Must be exactly:
```
http://localhost:3000/api/auth/callback/google
```

Not:
- ❌ `http://localhost:3000/` (missing callback path)
- ❌ `https://localhost:3000/api/auth/callback/google` (https instead of http)
- ❌ `localhost:3000/api/auth/callback/google` (missing http://)

### Check 2: Verify Environment Variables
In `.env.local`:
```
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=b94c9be6776937c9b140dcdb68423ddf5ca704ef6da146ba4d46ae6e7493abb1
```

### Check 3: Check Browser Console
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for error messages
4. Share the error

### Check 4: Check Server Logs
Look at terminal where `npm run dev` is running for errors.

---

## How It Works

```
1. User clicks "Google" button
   ↓
2. Redirects to Google login
   ↓
3. User authenticates with Google
   ↓
4. Google redirects to:
   http://localhost:3000/api/auth/callback/google?code=...&state=...
   ↓
5. NextAuth exchanges code for token
   ↓
6. User is created/updated in database
   ↓
7. Redirects to dashboard
```

The redirect URI must match exactly for step 4 to work.

---

## For Production

When deploying to production, update the redirect URI to:

```
https://yourdomain.com/api/auth/callback/google
```

Replace `yourdomain.com` with your actual domain.

---

## No Other Functionality Affected

✅ Credentials login still works  
✅ Dashboard still works  
✅ All other features unaffected  
✅ Only Google OAuth is fixed  

This is a configuration-only fix with minimal code changes to error handling.

---

## Quick Reference

| Item | Value |
|------|-------|
| Redirect URI (Dev) | `http://localhost:3000/api/auth/callback/google` |
| Redirect URI (Prod) | `https://yourdomain.com/api/auth/callback/google` |
| NEXTAUTH_URL (Dev) | `http://localhost:3000` |
| NEXTAUTH_URL (Prod) | `https://yourdomain.com` |

---

## Support

If you're still having issues:
1. Verify redirect URI in Google Console
2. Check environment variables
3. Clear browser cache (F12 → right-click refresh → empty cache)
4. Restart dev server
5. Check browser console for errors
6. Check server terminal for errors
