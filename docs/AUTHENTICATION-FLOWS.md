# Authentication Flows

Visual guide to all authentication methods in CSRARS.

---

## 1. Credentials Authentication (Existing)

```
┌─────────────────────────────────────────────────────────────┐
│ User visits /login                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ User enters email and password                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Click "Login" button                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ signIn("credentials", { email, password })                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ CredentialsProvider.authorize()                            │
│ - Find user by email                                       │
│ - Check if account locked                                  │
│ - Verify password with bcrypt                              │
│ - Update lastLogin timestamp                               │
│ - Log login attempt                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
            ✅ Valid          ❌ Invalid
                    ↓                ↓
            Create JWT         Return error
            Create session      Increment attempts
                    ↓                ↓
                    └───────┬────────┘
                            ↓
                    ┌───────────────────┐
                    │ MFA Enabled?      │
                    └───────┬───────────┘
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
                   YES              NO
                    ↓                ↓
            Prompt for TOTP    Redirect to
            code               dashboard
                    ↓
            ┌───────────────────┐
            │ Verify TOTP code  │
            └───────┬───────────┘
                    ↓
            ┌───────┴────────┐
            ↓                ↓
        ✅ Valid        ❌ Invalid
            ↓                ↓
        Redirect to      Show error
        dashboard        Retry
```

---

## 2. Google OAuth (New)

```
┌─────────────────────────────────────────────────────────────┐
│ User visits /login                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Google" button                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ signIn("google", { redirect: true })                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Redirect to Google login page                              │
│ https://accounts.google.com/...                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ User authenticates with Google                             │
│ (or uses existing Google session)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Google redirects back to:                                  │
│ /api/auth/callback/google?code=...&state=...              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NextAuth exchanges code for access token                   │
│ Fetches user profile from Google                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ signIn callback triggered                                  │
│ - Check if user exists by email                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
            User exists      User doesn't exist
                    ↓                ↓
            Update SSO info   Create new user
            (if not set)      - Email from Google
                    ↓         - Name from Google
                    │         - Role: "user"
                    │         - ssoProvider: "google"
                    │         - ssoId: Google ID
                    │         - emailVerified: true
                    │         - password: ""
                    ↓
            ┌───────────────────┐
            │ Create JWT token  │
            │ Create session    │
            └───────┬───────────┘
                    ↓
            ┌───────────────────┐
            │ MFA Enabled?      │
            └───────┬───────────┘
                    ↓
            ┌───────┴────────┐
            ↓                ↓
           YES              NO
            ↓                ↓
    Prompt for TOTP    Redirect to
    code               dashboard
            ↓
    ┌───────────────────┐
    │ Verify TOTP code  │
    └───────┬───────────┘
            ↓
    ┌───────┴────────┐
    ↓                ↓
✅ Valid        ❌ Invalid
    ↓                ↓
Redirect to      Show error
dashboard        Retry
```

---

## 3. GitHub OAuth (New)

```
Same as Google OAuth, but:
- Redirect to GitHub login: https://github.com/login/oauth/authorize
- Callback: /api/auth/callback/github
- User profile fetched from GitHub API
- ssoProvider: "github"
- ssoId: GitHub user ID
```

---

## 4. Microsoft Azure AD (New)

```
Same as Google OAuth, but:
- Redirect to Microsoft login: https://login.microsoftonline.com/...
- Callback: /api/auth/callback/azure-ad
- User profile fetched from Microsoft Graph API
- ssoProvider: "azure-ad"
- ssoId: Azure AD object ID
- Tenant ID used for multi-tenant support
```

---

## 5. MFA Setup Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User logged in, visits account settings                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Enable MFA"                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ POST /api/mfa/setup                                        │
│ - Generate TOTP secret (speakeasy)                         │
│ - Generate QR code                                         │
│ - Generate 10 backup codes                                 │
│ - Hash backup codes (SHA-256)                              │
│ - Store in MFASecret collection                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Display QR code to user                                    │
│ Show backup codes                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ User scans QR code with authenticator app                  │
│ (Google Authenticator, Authy, Microsoft Authenticator)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ User enters 6-digit code from app                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ POST /api/mfa/verify                                       │
│ - Verify TOTP code (with 2-time window tolerance)         │
│ - Update User.mfaEnabled = true                            │
│ - Log MFA enable event                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
                ✅ Valid        ❌ Invalid
                    ↓                ↓
            MFA enabled         Show error
            Display backup      Retry
            codes
                    ↓
            User stores
            backup codes
            securely
```

---

## 6. Login with MFA Enabled

```
┌─────────────────────────────────────────────────────────────┐
│ User enters email and password (or uses SSO)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Credentials verified / SSO authenticated                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Check User.mfaEnabled                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
                   YES              NO
                    ↓                ↓
            Prompt for TOTP    Redirect to
            code               dashboard
                    ↓
            ┌───────────────────┐
            │ User enters code  │
            │ from authenticator│
            └───────┬───────────┘
                    ↓
            ┌───────────────────┐
            │ POST /api/mfa/verify
            │ - Verify TOTP code
            │ - Check backup codes
            │ - Log verification
            └───────┬───────────┘
                    ↓
            ┌───────┴────────┐
            ↓                ↓
        ✅ Valid        ❌ Invalid
            ↓                ↓
        Redirect to      Show error
        dashboard        Retry or use
                         backup code
```

---

## 7. Account Linking (Email-based)

```
Scenario: User has credentials account, then uses SSO with same email

┌─────────────────────────────────────────────────────────────┐
│ User has existing account:                                 │
│ - email: user@example.com                                  │
│ - password: hashed                                         │
│ - ssoProvider: null                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Google" button                                │
│ Authenticates with Google                                  │
│ Google returns: user@example.com                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ signIn callback:                                           │
│ - Find user by email: user@example.com                    │
│ - User exists!                                            │
│ - Check if ssoProvider already set                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────┴────────┐
                    ↓                ↓
            ssoProvider set   ssoProvider null
                    ↓                ↓
            Don't update      Update with:
            (already linked)  - ssoProvider: "google"
                    ↓         - ssoId: Google ID
                    │         - lastLogin: now
                    │
                    ↓
            ┌───────────────────┐
            │ User can now use  │
            │ either method:    │
            │ - Email/password  │
            │ - Google SSO      │
            └───────────────────┘
```

---

## 8. Session Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User authenticated (credentials or SSO)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ JWT Callback:                                              │
│ - Add user ID to token                                    │
│ - Add user role to token                                  │
│ - Add MFA status to token                                 │
│ - Add SSO provider to token                               │
│ - Add current provider to token                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Session Callback:                                          │
│ - Copy token data to session.user                         │
│ - Add ssoProvider to session                              │
│ - Add provider to session                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Session stored in:                                         │
│ - Secure HTTP-only cookie (production)                    │
│ - Memory (development)                                    │
│ - Expires after 24 hours                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Client can access via:                                     │
│ - useSession() hook                                       │
│ - getSession() server function                            │
│ - session.user.id                                         │
│ - session.user.role                                       │
│ - session.user.mfaEnabled                                 │
│ - session.user.ssoProvider                                │
│ - session.user.provider                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Logout Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Logout"                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ signOut()                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NextAuth:                                                  │
│ - Clear JWT token                                         │
│ - Clear session cookie                                    │
│ - Invalidate session                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Redirect to /login                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Decision Tree: Which Auth Method?

```
                    ┌─────────────────┐
                    │ User at login   │
                    └────────┬────────┘
                             ↓
                    ┌─────────────────┐
                    │ Has email/pass? │
                    └────────┬────────┘
                             ↓
                    ┌────────┴────────┐
                    ↓                 ↓
                   YES               NO
                    ↓                 ↓
            ┌──────────────┐   ┌──────────────┐
            │ Use          │   │ Use SSO      │
            │ Credentials  │   │ (Google/GH/  │
            │ Auth         │   │  Microsoft)  │
            └──────┬───────┘   └──────┬───────┘
                   ↓                  ↓
            ┌──────────────┐   ┌──────────────┐
            │ MFA enabled? │   │ MFA enabled? │
            └──────┬───────┘   └──────┬───────┘
                   ↓                  ↓
            ┌──────┴──────┐    ┌──────┴──────┐
            ↓             ↓    ↓             ↓
           YES           NO   YES           NO
            ↓             ↓    ↓             ↓
        Verify TOTP  Dashboard Verify TOTP Dashboard
            ↓             ↓    ↓             ↓
        Dashboard    ✅ Done Dashboard  ✅ Done
            ↓
        ✅ Done
```

---

## Data Flow: User Creation via SSO

```
Google/GitHub/Microsoft
        ↓
    OAuth Provider
        ↓
    NextAuth Callback
        ↓
    ┌───────────────────────────────────┐
    │ Check if user exists by email     │
    └───────────────────────────────────┘
        ↓
    ┌───────┴────────┐
    ↓                ↓
Exists          Doesn't exist
    ↓                ↓
Update SSO       Create new User:
info if not      - email
set              - name
    ↓            - role: "user"
    │            - ssoProvider
    │            - ssoId
    │            - emailVerified: true
    │            - password: ""
    │            - isActive: true
    │            - createdAt: now
    │                 ↓
    └─────────┬──────┘
              ↓
        Save to MongoDB
              ↓
        Create JWT token
              ↓
        Create session
              ↓
        Redirect to dashboard
```

---

## Summary

- **Credentials**: Email/password → Optional MFA → Dashboard
- **SSO**: Provider auth → Auto-create user → Optional MFA → Dashboard
- **MFA**: TOTP code verification with backup codes
- **Session**: JWT token with user info, expires after 24 hours
- **Account Linking**: Same email = same account across auth methods
