# Google OAuth Setup - Visual Steps

## The One URL You Need to Add

```
http://localhost:3000/api/auth/callback/google
```

---

## Step 1: Open Google Cloud Console

Go to: https://console.cloud.google.com/

![Step 1]
- Sign in with your Google account
- You should see your project

---

## Step 2: Go to APIs & Services

In the left sidebar:
1. Click "APIs & Services"
2. Click "Credentials"

![Step 2]
You should see a list of credentials.

---

## Step 3: Find Your OAuth Client

Look for "OAuth 2.0 Client IDs" section.

You should see something like:
- Name: "Web client" (or similar)
- Type: "OAuth 2.0 Client ID"

Click on it.

![Step 3]

---

## Step 4: Open the Client Details

After clicking, you'll see a page with:
- Client ID
- Client Secret
- Authorized JavaScript origins
- **Authorized redirect URIs** ← This is what we need

![Step 4]

---

## Step 5: Add the Redirect URI

In the "Authorized redirect URIs" section:

1. Click the "Add URI" button
2. A text field will appear
3. Paste this exact URL:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Click "Save"

![Step 5]

---

## Step 6: Verify It's Saved

After clicking Save:
1. Wait a few seconds
2. Refresh the page
3. Verify the URI appears in the list:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

![Step 6]

---

## Step 7: Restart Your App

In your terminal:
```bash
# Stop the dev server (Ctrl+C)

# Clear cache
rm -r .next

# Restart
npm run dev
```

---

## Step 8: Test It

1. Open private/incognito browser
2. Go to: http://localhost:3000/login
3. Click "Google" button
4. You should be redirected to Google login
5. After authenticating, you should be redirected to dashboard

✅ If this works, you're done!

---

## What You're Adding

| Component | Value |
|-----------|-------|
| Protocol | `http://` |
| Domain | `localhost` |
| Port | `3000` |
| Path | `/api/auth/callback/google` |

**Full URL**: `http://localhost:3000/api/auth/callback/google`

---

## Common Issues

### Issue: "Redirect URI mismatch"
**Solution**: Make sure the URL is exactly:
```
http://localhost:3000/api/auth/callback/google
```

Not:
- `http://localhost:3000/` (missing path)
- `https://localhost:3000/api/auth/callback/google` (https instead of http)
- `http://localhost:3000/api/auth/callback` (missing /google)

### Issue: Still not working after adding URI
**Solution**:
1. Wait 30 seconds for Google to update
2. Restart your dev server
3. Clear browser cache
4. Try in private/incognito window

### Issue: Can't find the OAuth client
**Solution**:
1. Make sure you're in the right project
2. Make sure you created OAuth credentials (not API key)
3. Make sure it's a "Web client" type

---

## For Production

When you deploy to production, add another URI:

```
https://yourdomain.com/api/auth/callback/google
```

Replace `yourdomain.com` with your actual domain.

---

## That's It!

Once you add the redirect URI and restart your app, Google OAuth should work.

The rest of the setup is already done in your project.
