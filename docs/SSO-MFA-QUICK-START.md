# SSO & MFA Quick Start

## What Changed?

✅ **SSO Support Added** - Users can now login with Google, GitHub, or Microsoft  
✅ **MFA Already Available** - TOTP-based 2FA with backup codes  
✅ **No Breaking Changes** - Existing credentials authentication still works  

## Enable SSO in 3 Steps

### Step 1: Get OAuth Credentials
Choose one or more providers:
- **Google**: [console.cloud.google.com](https://console.cloud.google.com/)
- **GitHub**: [github.com/settings/developers](https://github.com/settings/developers)
- **Microsoft**: [portal.azure.com](https://portal.azure.com/)

### Step 2: Add to `.env.local`
```env
# Example: Google
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret

# Example: GitHub
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret

# Example: Microsoft
AZURE_AD_CLIENT_ID=your_id
AZURE_AD_CLIENT_SECRET=your_secret
AZURE_AD_TENANT_ID=your_tenant_id
```

### Step 3: Restart Server
```bash
npm run dev
```

SSO buttons will automatically appear on the login page.

## User Experience

### Login with Credentials (Existing)
1. Enter email and password
2. Click "Login"
3. (Optional) Enter MFA code if enabled

### Login with SSO (New)
1. Click provider button (Google/GitHub/Microsoft)
2. Authenticate with provider
3. Automatically logged in
4. (Optional) Enable MFA in settings

## For Developers

### Key Files Modified
- `lib/auth.ts` - Added OAuth providers
- `models/User.ts` - Added SSO fields
- `app/login/page.tsx` - Added SSO buttons
- `.env.local` - Added SSO credentials

### New User Fields
```typescript
ssoProvider?: "google" | "github" | "azure-ad"
ssoId?: string
emailVerified?: boolean
```

### Session Includes
```typescript
session.user.ssoProvider  // Which provider user used
session.user.provider     // Current provider
```

## Testing Locally

1. Configure at least one SSO provider
2. Go to `http://localhost:3000/login`
3. Click SSO button
4. Verify user is created and logged in

## Redirect URIs for Providers

**Development:**
```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/azure-ad
```

**Production:**
```
https://yourdomain.com/api/auth/callback/google
https://yourdomain.com/api/auth/callback/github
https://yourdomain.com/api/auth/callback/azure-ad
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| SSO buttons not showing | Add credentials to `.env.local` and restart |
| "Invalid redirect URI" | Check URI matches provider settings exactly |
| User not created | Check MongoDB connection and email uniqueness |
| MFA not working | Ensure `speakeasy` package is installed |

## Security Notes

- SSO users are auto-verified (email verified by provider)
- Users can enable MFA regardless of auth method
- Passwords not required for SSO users
- Account linking by email (same email = same account)

## Full Documentation

See `SSO-MFA-SETUP-GUIDE.md` for detailed setup instructions.
