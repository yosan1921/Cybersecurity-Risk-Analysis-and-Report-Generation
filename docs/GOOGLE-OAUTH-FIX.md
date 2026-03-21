# Fix Google OAuth Error - "localhost:3000"

## Problem
When clicking "Continue with Google", you get an error showing "localhost:3000" instead of redirecting properly.

## Root Cause
The redirect URI in your Google OAuth credentials doesn't match what NextAuth.js expects.

---

## Solution: Update Google Console

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Credentials"

### Step 2: Find Your OAuth 2.0 Client
1. Look for "OAuth 2.0 Client IDs"
2. Click on the one named "Web client" (or similar)

### Step 3: Update Authorized Redirect URIs
In the "Authorized redirect URIs" section, add this exact URI:

```
http://localhost:3000/api/auth/callback/google
```

**Important**: 
- Must be exactly as shown above
- Include `/api/auth/callback/google` at the end
- Use `http://` (not https) for localhost

### Step 4: Save Changes
Click "Save" button

### Step 5: Restart Your App
1. Stop the dev server (Ctrl+C)
2. Restart: `npm run dev`

---

## Test It

1. Open private/incognito browser
2. Go to `http://localhost:3000/login`
3. Click "Google" button
4. You should be redirected to Google login
5. After authenticating, you should be redirected back to dashboard
6. ✅ If it works, you're done!

---

## If Still Not Working

### Check 1: Verify the Redirect URI
In Google Console, make sure you have:
```
http://localhost:3000/api/auth/callback/google
```

Not:
- ❌ `http://localhost:3000/` (missing callback path)
- ❌ `https://localhost:3000/api/auth/callback/google` (https instead of http)
- ❌ `localhost:3000/api/auth/callback/google` (missing http://)

### Check 2: Clear Browser Cache
1. Press F12 to open DevTools
2. Right-click the refresh button
3. Select "Empty cache and hard refresh"
4. Try again

### Check 3: Check Environment Variables
Make sure `.env.local` has:
```
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=b94c9be6776937c9b140dcdb68423ddf5ca704ef6da146ba4d46ae6e7493abb1
```

### Check 4: Check Browser Console
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for red error messages
4. Share the error message

---

## For Production Deployment

When deploying to production, update the redirect URI to:

```
https://yourdomain.com/api/auth/callback/google
```

Replace `yourdomain.com` with your actual domain.

---

## Visual Guide

### Current (Wrong)
```
Google Console:
  Redirect URI: http://localhost:3000/
  
NextAuth expects:
  http://localhost:3000/api/auth/callback/google
  
Result: ❌ Mismatch → Error
```

### Fixed (Correct)
```
Google Console:
  Redirect URI: http://localhost:3000/api/auth/callback/google
  
NextAuth expects:
  http://localhost:3000/api/auth/callback/google
  
Result: ✅ Match → Works!
```

---

## Quick Checklist

- [ ] Opened Google Cloud Console
- [ ] Found OAuth 2.0 Client ID
- [ ] Added redirect URI: `http://localhost:3000/api/auth/callback/google`
- [ ] Clicked Save
- [ ] Restarted dev server
- [ ] Tested in private/incognito browser
- [ ] Google login works ✅

---

## Still Having Issues?

1. Share the exact error message you see
2. Share the redirect URI from Google Console
3. Check if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
4. Try clearing `.next` folder and restarting

---

## How NextAuth.js Handles Google OAuth

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

## No Other Functionality Affected

✅ Credentials login still works  
✅ Dashboard still works  
✅ All other features unaffected  
✅ Only Google OAuth is fixed  

This is a configuration-only fix with no code changes to other parts of the app.
