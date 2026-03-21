# Redirect URI Verification Guide

## Quick Answer

Your redirect URI `http://localhost:3000/api/auth/callback/google` is **correct** if:

1. ✅ Your app runs on `http://localhost:3000`
2. ✅ You're in **development** (not production)
3. ✅ You added it **exactly** to Google Console

---

## How to Verify Your Redirect URI

### Step 1: Check Your App is Running

```bash
npm run dev
```

Then visit: `http://localhost:3000/login`

You should see the login page with SSO buttons.

### Step 2: Verify the Exact URL

The redirect URI has **three parts** that must match exactly:

```
http://localhost:3000/api/auth/callback/google
│      │            │   │                    │
│      │            │   │                    └─ Provider name (google/github/azure-ad)
│      │            │   └─ Fixed path (don't change)
│      │            └─ Port number (must match your app)
│      └─ Domain (localhost for development)
└─ Protocol (http for local, https for production)
```

### Step 3: Check Google Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **Credentials** → Your OAuth 2.0 Client ID
4. Click **Edit** (pencil icon)
5. Look for **Authorized redirect URIs** section
6. You should see: `http://localhost:3000/api/auth/callback/google`

**Important**: The URI must be **exactly** as shown - no trailing slashes, no extra spaces.

---

## Common Mistakes

### ❌ Wrong: Missing Protocol
```
localhost:3000/api/auth/callback/google
```
**Fix**: Add `http://` at the start

### ❌ Wrong: Wrong Port
```
http://localhost:8000/api/auth/callback/google
```
**Fix**: Use `3000` (or whatever port your app uses)

### ❌ Wrong: Trailing Slash
```
http://localhost:3000/api/auth/callback/google/
```
**Fix**: Remove the trailing `/`

### ❌ Wrong: Wrong Provider Name
```
http://localhost:3000/api/auth/callback/oauth
```
**Fix**: Use exact provider name: `google`, `github`, or `azure-ad`

### ❌ Wrong: Extra Spaces
```
http://localhost:3000/api/auth/callback/google 
```
**Fix**: Remove any spaces

### ❌ Wrong: HTTPS for Local Development
```
https://localhost:3000/api/auth/callback/google
```
**Fix**: Use `http://` for localhost (unless you have SSL certificates)

---

## How to Test If It's Working

### Test 1: Check NextAuth Route Exists

Visit this URL in your browser:
```
http://localhost:3000/api/auth/providers
```

You should see JSON output like:
```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    "signinUrl": "http://localhost:3000/api/auth/signin/google",
    "callbackUrl": "http://localhost:3000/api/auth/callback/google"
  }
}
```

**Key**: The `callbackUrl` should match your redirect URI exactly.

### Test 2: Try the Login Flow

1. Go to `http://localhost:3000/login`
2. Click the **Google** button
3. You'll be redirected to Google login
4. After authenticating, you should be redirected back to your app
5. If you see an error, check the error message (see troubleshooting below)

### Test 3: Check Browser Console

If something goes wrong:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for error messages
4. Check **Network** tab to see the redirect URL

---

## Redirect URI by Environment

### Development (Local)
```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/azure-ad
```

### Staging
```
https://staging.yourdomain.com/api/auth/callback/google
https://staging.yourdomain.com/api/auth/callback/github
https://staging.yourdomain.com/api/auth/callback/azure-ad
```

### Production
```
https://yourdomain.com/api/auth/callback/google
https://yourdomain.com/api/auth/callback/github
https://yourdomain.com/api/auth/callback/azure-ad
```

**Note**: Production uses `https://` (secure), not `http://`

---

## Troubleshooting Redirect URI Errors

### Error: "Redirect URI mismatch"

**Cause**: The URI you added in Google Console doesn't match what NextAuth is using.

**Solution**:
1. Copy the exact error message
2. Check Google Console for the registered URI
3. Make sure they match character-for-character
4. Restart your dev server
5. Try again

### Error: "Invalid redirect_uri"

**Cause**: The URI format is invalid.

**Solution**:
1. Check for typos
2. Verify protocol (http/https)
3. Verify port number
4. Remove trailing slashes
5. Check for extra spaces

### Error: "The redirect URI is not whitelisted"

**Cause**: You haven't added the URI to Google Console yet.

**Solution**:
1. Go to Google Cloud Console
2. Find your OAuth 2.0 Client ID
3. Click Edit
4. Add the redirect URI to "Authorized redirect URIs"
5. Click Save
6. Wait a few seconds
7. Try again

### Error: "localhost refused to connect"

**Cause**: Your app isn't running.

**Solution**:
1. Make sure you ran `npm run dev`
2. Check that it's running on port 3000
3. Visit `http://localhost:3000` to verify

---

## How NextAuth Handles Redirect URIs

### Behind the Scenes

When you click the Google button:

```
1. User clicks "Google" button
   ↓
2. NextAuth redirects to Google:
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=YOUR_CLIENT_ID
     redirect_uri=http://localhost:3000/api/auth/callback/google
     ...
   ↓
3. Google checks if redirect_uri is in your whitelist
   ↓
4. If YES: User logs in, Google redirects back to:
   http://localhost:3000/api/auth/callback/google?code=...&state=...
   ↓
5. If NO: Google shows error "Redirect URI mismatch"
```

**Key Point**: Google must recognize the exact redirect URI you're sending.

---

## Verification Checklist

Before testing, verify:

- [ ] App is running: `npm run dev`
- [ ] App is on port 3000: `http://localhost:3000`
- [ ] Redirect URI in `.env.local`: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- [ ] Redirect URI in Google Console: Added to "Authorized redirect URIs"
- [ ] Redirect URI format: `http://localhost:3000/api/auth/callback/google`
- [ ] No typos in redirect URI
- [ ] No trailing slashes
- [ ] No extra spaces
- [ ] Protocol matches (http for local, https for production)
- [ ] Port number is correct (3000)
- [ ] Provider name is correct (google/github/azure-ad)

---

## Quick Reference: Redirect URIs for All Providers

### Google
```
Development:  http://localhost:3000/api/auth/callback/google
Production:   https://yourdomain.com/api/auth/callback/google
```

### GitHub
```
Development:  http://localhost:3000/api/auth/callback/github
Production:   https://yourdomain.com/api/auth/callback/github
```

### Microsoft Azure AD
```
Development:  http://localhost:3000/api/auth/callback/azure-ad
Production:   https://yourdomain.com/api/auth/callback/azure-ad
```

---

## Testing the Redirect URI Programmatically

### Check if Route Exists

```bash
# In your terminal, run:
curl http://localhost:3000/api/auth/providers
```

You should get JSON with your providers.

### Check NextAuth Configuration

In `lib/auth.ts`, the redirect URI is automatically generated by NextAuth:

```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // NextAuth automatically uses: http://localhost:3000/api/auth/callback/google
})
```

You don't need to specify it - NextAuth handles it automatically.

---

## Environment Variables Check

Make sure your `.env.local` has:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**Important**: `NEXTAUTH_URL` must match your app's URL.

---

## Common Questions

### Q: Do I need to add the redirect URI for each environment?

**A**: Yes. You need separate OAuth credentials for:
- Development (localhost:3000)
- Staging (staging.yourdomain.com)
- Production (yourdomain.com)

Each has its own redirect URI.

### Q: Can I use the same credentials for multiple environments?

**A**: No. Each environment needs its own OAuth credentials with its own redirect URIs.

### Q: What if I change my port number?

**A**: You need to:
1. Update `NEXTAUTH_URL` in `.env.local`
2. Add the new redirect URI to Google Console
3. Restart your dev server

### Q: Can I test with HTTPS on localhost?

**A**: Yes, but it's complicated. For development, use `http://localhost:3000`.

### Q: How long does it take for Google to recognize the redirect URI?

**A**: Usually instant, but sometimes takes a few seconds. If you just added it, wait 10 seconds and try again.

---

## Still Having Issues?

### Step 1: Verify the Exact Error

1. Go to `http://localhost:3000/login`
2. Click Google button
3. Note the exact error message
4. Search for that error in this guide

### Step 2: Check the Logs

1. Look at your terminal where `npm run dev` is running
2. Check for error messages
3. Check browser console (F12)

### Step 3: Verify Each Component

- [ ] Google Client ID is correct
- [ ] Google Client Secret is correct
- [ ] Redirect URI in Google Console is correct
- [ ] Redirect URI in NextAuth is correct
- [ ] App is running on correct port
- [ ] No typos anywhere

### Step 4: Try a Fresh Start

```bash
# Stop the dev server (Ctrl+C)
# Clear browser cache (Ctrl+Shift+Delete)
# Restart the dev server
npm run dev
# Try again
```

---

## Summary

Your redirect URI is correct if:

1. ✅ Format: `http://localhost:3000/api/auth/callback/google`
2. ✅ Added to Google Console exactly as shown
3. ✅ App is running on `http://localhost:3000`
4. ✅ No typos, spaces, or trailing slashes
5. ✅ Protocol is `http://` for local, `https://` for production

**Test it**: Click the Google button on the login page. If you're redirected to Google login, it's working!

---

## Next Steps

1. ✅ Verify redirect URI is in Google Console
2. ✅ Verify `.env.local` has credentials
3. ✅ Run `npm run dev`
4. ✅ Go to `http://localhost:3000/login`
5. ✅ Click Google button
6. ✅ You should be redirected to Google login

If you get stuck, check the error message and refer to the troubleshooting section above.
