# Google OAuth Error - Quick Fix (2 Minutes)

## The Error
When you click "Continue with Google", you see "localhost:3000" error.

## The Fix

### Step 1: Go to Google Console
https://console.cloud.google.com/

### Step 2: Add Redirect URI
1. APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Add this to "Authorized redirect URIs":
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Click Save

### Step 3: Restart App
```bash
# Stop: Ctrl+C
# Clear: rm -r .next
# Start: npm run dev
```

### Step 4: Test
1. Open private browser
2. Go to `http://localhost:3000/login`
3. Click "Google"
4. ✅ Should work now!

---

## That's It!

The code has been updated with better error handling. Just fix the Google Console redirect URI and restart.

---

## If Still Not Working

Check:
- Redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- NEXTAUTH_URL in `.env.local` is: `http://localhost:3000`
- Browser cache cleared (F12 → right-click refresh → empty cache)
- Dev server restarted

---

## For Production

Change redirect URI to:
```
https://yourdomain.com/api/auth/callback/google
```
