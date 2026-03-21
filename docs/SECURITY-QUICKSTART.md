# Security Quick Start Guide

## Installation

```bash
# Install new security dependencies
npm install

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NextAuth secret
openssl rand -base64 32
```

## Configuration

### 1. Update .env.local

```bash
# Add encryption key (from generation above)
ENCRYPTION_KEY=<your-generated-key>

# Add NextAuth secret (from generation above)
NEXTAUTH_SECRET=<your-generated-secret>

# Configure email service
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@insa-risk.com
```

## Using Security Features

### Encrypt Sensitive Data

```typescript
import { encryptField, decryptField } from '@/lib/security/encryption';

// Encrypt
const encrypted = encryptField('sensitive-data');

// Decrypt
const decrypted = decryptField(encrypted);
```

### Validate User Input

```typescript
import { validateEmail, validatePassword, combineValidations } from '@/lib/security/validation';

const emailValidation = validateEmail(email);
const passwordValidation = validatePassword(password);
const combined = combineValidations(emailValidation, passwordValidation);

if (!combined.valid) {
  return { errors: combined.errors };
}
```

### Check User Permissions

```typescript
import { hasPermission, hasResourceAccess } from '@/lib/security/rbac';

if (hasPermission(userRole, 'create_assessment')) {
  // Allow action
}

if (hasResourceAccess(userPermissions, 'assessment', assessmentId, 'edit')) {
  // Allow edit
}
```

### Log Security Events

```typescript
import { logAuditEvent, logDataAccess, logDataModification } from '@/lib/security/auditLogger';

// Log data access
await logDataAccess(userId, 'questionnaire', resourceId, request);

// Log data modification
await logDataModification(userId, 'analysis', resourceId, changes, request);
```

### Send Notifications

```typescript
import { sendNewAssessmentNotification, sendCriticalRiskAlert } from '@/lib/services/emailService';
import { notifyAssessmentCompletion, notifyCriticalRisk } from '@/lib/services/notificationService';

// Email notification
await sendNewAssessmentNotification(userEmail, assessmentName, assessmentId);

// In-app notification
await notifyAssessmentCompletion(userId, assessmentName, assessmentId);
```

### Setup MFA

```typescript
import { generateMFASecret, verifyTOTPToken } from '@/lib/security/mfa';

// Generate MFA secret
const { secret, qrCode, backupCodes } = await generateMFASecret(userEmail);

// Verify TOTP token
const isValid = verifyTOTPToken(secret, userProvidedToken);
```

## API Endpoint Protection

Protected endpoints automatically require authentication via middleware:

```typescript
// These routes are protected by middleware
/api/analysis/*
/api/reports/*
/api/questionnaires/*
/api/companies/*
/api/incidents/*
/api/backup/*
/api/excelreport/*
/api/risk-evaluation/*
```

## Password Requirements

- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Example: `SecurePass123!`

## User Roles & Permissions

### Director
- Full system access
- User management
- Audit log access
- Approval authority

### Division Head
- Assessment management
- Team management
- Report generation
- Questionnaire management

### Risk Analyst
- Assessment creation/editing
- Report generation
- Questionnaire management

### Staff
- View assessments
- Submit assessments
- View reports

## Common Tasks

### Create User with Validation

```typescript
import { validateEmail, validatePassword, validateRole } from '@/lib/security/validation';

const emailValidation = validateEmail(email);
const passwordValidation = validatePassword(password);
const roleValidation = validateRole(role);

if (!emailValidation.valid || !passwordValidation.valid || !roleValidation.valid) {
  return { errors: [...emailValidation.errors, ...passwordValidation.errors, ...roleValidation.errors] };
}

// Create user...
```

### Grant Permission

```typescript
import { grantResourceAccess } from '@/lib/security/rbac';

const permissions = grantResourceAccess(
  userPermissions,
  'assessment',
  assessmentId,
  ['view', 'edit']
);
```

### Revoke Permission

```typescript
import { revokeResourceAccess } from '@/lib/security/rbac';

const permissions = revokeResourceAccess(
  userPermissions,
  'assessment',
  assessmentId,
  ['edit']
);
```

### Get User Notifications

```typescript
import { getUserNotifications, getUnreadCount } from '@/lib/services/notificationService';

const notifications = await getUserNotifications(userId, 50, false);
const unreadCount = await getUnreadCount(userId);
```

### Get Audit Logs

```typescript
import { getUserAuditLogs, getSecurityAlerts } from '@/lib/security/auditLogger';

const userLogs = await getUserAuditLogs(userId, 100);
const alerts = await getSecurityAlerts(24); // Last 24 hours
```

## Security Headers

Automatically applied by middleware:

- `Strict-Transport-Security`: HTTPS enforcement
- `Content-Security-Policy`: XSS prevention
- `X-Frame-Options`: Clickjacking prevention
- `X-Content-Type-Options`: MIME sniffing prevention
- `X-XSS-Protection`: Browser XSS protection
- `Referrer-Policy`: Referrer control
- `Permissions-Policy`: Feature restrictions

## Troubleshooting

### Encryption Key Error
```
Error: ENCRYPTION_KEY environment variable not set
```
Solution: Generate and add encryption key to `.env.local`

### Email Service Error
```
Error: Email service not configured
```
Solution: Configure email provider in `.env.local`

### MFA Setup Error
```
Error: Failed to generate MFA secret
```
Solution: Ensure `speakeasy` and `qrcode` packages are installed

### Validation Error
```
Error: Validation failed
```
Solution: Check validation rules in `lib/security/validation.ts`

## Performance Tips

1. Cache permission checks for frequently accessed resources
2. Use batch operations for audit logging
3. Implement notification queuing for high-volume scenarios
4. Use database indexes for audit log queries
5. Implement rate limiting to prevent abuse

## Security Best Practices

1. Always validate user input
2. Use encryption for sensitive data
3. Log all security events
4. Implement MFA for admin accounts
5. Review audit logs regularly
6. Keep dependencies updated
7. Use strong passwords
8. Implement rate limiting
9. Monitor for suspicious activities
10. Conduct regular security audits

## Next Steps

1. Review `SECURITY-IMPLEMENTATION.md` for detailed setup
2. Review `SECURITY-AUDIT.md` for security analysis
3. Test all security features
4. Configure email notifications
5. Set up MFA for admin accounts
6. Review and customize RBAC permissions
7. Implement SSO providers
8. Set up security monitoring

## Support

For detailed information:
- Security modules: `lib/security/`
- Services: `lib/services/`
- Models: `models/`
- Middleware: `middleware.ts`
- Configuration: `.env.local`

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Security](https://docs.mongodb.com/manual/security/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
