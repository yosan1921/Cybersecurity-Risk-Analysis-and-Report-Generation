# SSO and MFA Integration Guide

## Overview

This project now supports:
- **Single Sign-On (SSO)** via Google, GitHub, and Microsoft Azure AD
- **Multi-Factor Authentication (MFA)** via TOTP (Time-based One-Time Password)

Both features work seamlessly together without affecting existing functionality.

---

## Current Status

### ✅ MFA (Already Implemented)
- **Type**: TOTP-based authentication
- **Features**:
  - Authenticator app support (Google Authenticator, Authy, Microsoft Authenticator, etc.)
  - QR code generation for easy setup
  - 10 backup codes for account recovery
  - Backup codes are SHA-256 hashed for security
  - Per-user MFA enable/disable
  - Audit logging for MFA events

### ✅ SSO (Newly Integrated)
- **Providers**: Google, GitHub, Microsoft Azure AD
- **Features**:
  - Automatic user account creation on first SSO login
  - Email verification via provider
  - Seamless integration with existing credentials authentication
  - SSO provider tracking in user profile
  - Account linking support

---

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy the Client ID and Client Secret
8. Add to `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### 2. GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in application details:
   - Application name: CSRARS
   - Homepage URL: `http://localhost:3000` (or your domain)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to `.env.local`:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### 3. Microsoft Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. Click "New registration"
4. Set Redirect URI to: `http://localhost:3000/api/auth/callback/azure-ad`
5. Go to "Certificates & secrets" → "New client secret"
6. Copy the secret value (only visible once)
7. Go to "Overview" and copy Application (client) ID and Directory (tenant) ID
8. Add to `.env.local`:
   ```
   AZURE_AD_CLIENT_ID=your_client_id
   AZURE_AD_CLIENT_SECRET=your_client_secret
   AZURE_AD_TENANT_ID=your_tenant_id
   ```

---

## Environment Variables

Add these to your `.env.local` file:

```env
# SSO Configuration (Optional - leave empty to disable)

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Microsoft Azure AD
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=common
```

**Note**: SSO providers are optional. If credentials are not provided, those buttons won't appear on the login page.

---

## How It Works

### SSO Flow

1. User clicks SSO provider button (Google, GitHub, or Microsoft)
2. User is redirected to provider's login page
3. After authentication, user is redirected back to the app
4. If user doesn't exist, a new account is automatically created with:
   - Email from provider
   - Name from provider profile
   - Default role: "user"
   - Email verified: true
5. User is logged in and redirected to dashboard

### MFA Flow

1. User can enable MFA in their account settings
2. System generates a TOTP secret and displays QR code
3. User scans QR code with authenticator app
4. User enters verification code to confirm setup
5. System generates 10 backup codes for recovery
6. On future logins, user must enter TOTP code after password

### Combined SSO + MFA

- SSO users can optionally enable MFA for additional security
- MFA is independent of authentication method (credentials or SSO)
- Users can switch between authentication methods if email matches

---

## Database Schema Changes

The User model now includes:

```typescript
ssoProvider?: string;  // "google" | "github" | "azure-ad"
ssoId?: string;        // Provider's unique user ID
emailVerified?: boolean; // Email verification status
```

These fields are optional and only populated for SSO users.

---

## Security Considerations

1. **Email Linking**: SSO users are linked by email address. If a user has both credentials and SSO accounts with the same email, they can use either method.

2. **Password**: SSO users don't have passwords stored. If they want to use credentials authentication, they must reset their password.

3. **MFA**: Recommended for all users, especially administrators. Can be enforced per role if needed.

4. **Backup Codes**: Users should store backup codes securely. They're hashed in the database.

5. **Session Security**: JWT tokens expire after 24 hours. Users must re-authenticate.

---

## Testing

### Local Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Test credentials login (existing functionality)

4. Test SSO buttons (if credentials are configured)

### Testing Without SSO Credentials

If you haven't configured SSO credentials yet, the SSO buttons won't appear on the login page. This is intentional - the system gracefully handles missing credentials.

---

## Troubleshooting

### SSO buttons not appearing
- Check that at least one SSO provider has credentials in `.env.local`
- Restart the development server after adding credentials
- Check browser console for errors

### "Invalid redirect URI" error
- Verify the redirect URI matches exactly in provider settings
- Include protocol (http/https) and port number
- For production, use your actual domain

### User creation fails
- Check MongoDB connection
- Verify user email is unique
- Check server logs for detailed error messages

### MFA not working
- Ensure `speakeasy` and `qrcode` packages are installed
- Check that MFA endpoints are properly configured
- Verify TOTP secret is being stored correctly

---

## API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in with credentials
- `GET /api/auth/callback/[provider]` - OAuth callback
- `GET /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

### MFA (Existing)
- `POST /api/mfa/setup` - Initialize MFA setup
- `POST /api/mfa/verify` - Verify TOTP code
- `POST /api/mfa/disable` - Disable MFA
- `POST /api/mfa/backup-codes` - Generate new backup codes

---

## Migration Notes

- Existing users are unaffected
- Credentials authentication continues to work as before
- MFA remains optional for all users
- No database migration required (new fields are optional)

---

## Next Steps

1. Configure at least one SSO provider
2. Test the authentication flow
3. Consider enabling MFA for admin accounts
4. Update user documentation
5. Monitor authentication logs

For questions or issues, check the audit logs in MongoDB under the `AuditLog` collection.
