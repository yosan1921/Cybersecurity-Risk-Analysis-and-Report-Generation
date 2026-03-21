# Google OAuth - Quick Setup (2 Minutes)

## Copy This URL

```
http://localhost:3000/api/auth/callback/google
```

---

## Add It to Google Console

1. Go to: https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. Scroll to "Authorized redirect URIs"
5. Click "Add URI"
6. Paste the URL above
7. Click "Save"

---

## Restart Your App

```bash
rm -r .next
npm run dev
```

---

## Test It

1. Go to: http://localhost:3000/login
2. Click "Google"
3. ✅ Should work!

---

## That's It!

Everything else is already configured.

---

## For Production

Add this instead:
```
https://yourdomain.com/api/auth/callback/google
```

Replace `yourdomain.com` with your domain.
