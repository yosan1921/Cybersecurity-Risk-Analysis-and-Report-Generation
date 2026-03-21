# Google OAuth - Authorized Redirect URI Setup

## What to Add

When setting up Google OAuth, you need to add this exact URL to the "Authorized redirect URIs" field:

```
http://localhost:3000/api/auth/callback/google
```

---

## Step-by-Step Instructions

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 2: Select Your Project
1. At the top, click the project dropdown
2. Select the project where you created the OAuth credentials
3. (If you don't have a project, create one first)

### Step 3: Go to APIs & Services
1. In the left sidebar, click "APIs & Services"
2. Click "Credentials"

### Step 4: Find Your OAuth Client
1. Look for "OAuth 2.0 Client IDs" section
2. You should see a "Web client" entry
3. Click on it to open the details

### Step 5: Add the Redirect URI
1. Scroll down to "Authorized redirect URIs"
2. Click "Add URI"
3. Paste this exact URL:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Click "Save"

---

## Visual Guide

```
Google Cloud Console
    ↓
APIs & Services
    ↓
Credentials
    ↓
OAuth 2.0 Client IDs (Web client)
    ↓
Authorized redirect URIs section
    ↓
Add URI button
    ↓
Paste: http://localhost:3000/api/auth/callback/google
    ↓
Save
```

---

## Important Details

### For Development (Local)
```
http://localhost:3000/api/auth/callback/google
```

### For Production (When Deploying)
```
https://yourdomain.com/api/auth/callback/google
```

Replace `yourdomain.com` with your actual domain.

---

## What Each Part Means

| Part | Meaning |
|------|---------|
| `http://` | Protocol (use http for localhost, https for production) |
| `localhost:3000` | Your app's domain and port |
| `/api/auth/callback/google` | The OAuth callback endpoint |

---

## Common Mistakes to Avoid

❌ **Wrong**: `http://localhost:3000/` (missing callback path)  
❌ **Wrong**: `https://localhost:3000/api/auth/callback/google` (https for localhost)  
❌ **Wrong**: `localhost:3000/api/auth/callback/google` (missing http://)  
❌ **Wrong**: `http://localhost:3000/api/auth/callback` (missing /google)  

✅ **Correct**: `http://localhost:3000/api/auth/callback/google`

---

## After Adding the URI

1. Click "Save"
2. Wait a few seconds for changes to take effect
3. Restart your dev server:
   ```bash
   npm run dev
   ```
4. Test Google login:
   - Go to `http://localhost:3000/login`
   - Click "Google" button
   - Should redirect to Google login
   - After authenticating, should redirect to dashboard

---

## If It Still Doesn't Work

### Check 1: Verify the URI is Saved
1. Go back to Google Cloud Console
2. Click on your OAuth client
3. Scroll to "Authorized redirect URIs"
4. Verify the URI is there exactly as shown above

### Check 2: Check Your Environment Variables
In `.env.local`, verify:
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
```

### Check 3: Clear Cache and Restart
```bash
rm -r .next
npm run dev
```

### Check 4: Check Browser Console
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for error messages
4. Share the error message

---

## Multiple Redirect URIs

You can add multiple URIs for different environments:

```
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google
https://staging.yourdomain.com/api/auth/callback/google
```

Each on a separate line.

---

## Summary

**Add this to Google Console:**
```
http://localhost:3000/api/auth/callback/google
```

**That's it!** Everything else is already configured in your project.

---

## Need Help?

If you're stuck:
1. Double-check the URL is exactly as shown
2. Make sure you clicked "Save"
3. Restart your dev server
4. Clear browser cache
5. Try in a private/incognito browser window
