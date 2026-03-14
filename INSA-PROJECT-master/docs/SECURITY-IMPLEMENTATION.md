# Security Implementation Guide

## Overview
This document provides step-by-step instructions for implementing and configuring all security enhancements in the INSA Risk Assessment System.

## Phase 1: Core Security Implementation (Completed)

### 1. Encryption at Rest (AES-256)
**File:** `lib/security/encryption.ts`

**Features:**
- AES-256-GCM encryption for sensitive data
- Secure key management
- Field-level encryption/decryption

**Setup:**
```bash
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env.local
ENCRYPTION_KEY=<generated-key>
```

**Usage:**
```typescript
import { encryptField, decryptField } from '@/lib/security/encryption';

// Encrypt sensitive data
const encrypted = encryptField('sensitive-data');

// Decrypt when needed
const decrypted = decryptField(encrypted);
```

### 2. Data Validation Framework
**File:** `lib/security/validation.ts`

**Features:**
- Centralized validation for all inputs
- Email, password, role, name validation
- XSS prevention through sanitization
- JSON payload validation

**Usage:**
```typescript
import { validateEmail, validatePassword, combineValidations } from '@/lib/security/validation';

const emailValidation = validateEmail(email);
const passwordValidation = validatePassword(password);
const combined = combineValidations(emailValidation, passwordValidation);

if (!combined.valid) {
  return { errors: combined.errors };
}
```

### 3. Multi-Factor Authentication (MFA)
**File:** `lib/security/mfa.ts`

**Features:**
- TOTP (Time-based One-Time Password) support
- QR code generation for authenticator apps
- Backup codes for account recovery
- MFA challenge generation

**Setup:**
```typescript
import { generateMFASecret, verifyTOTPToken } from '@/lib/security/mfa';

// Generate MFA secret for user
const { secret, qrCode, backupCodes } = await generateMFASecret(userEmail);

// Verify TOTP token
const isValid = verifyTOTPToken(secret, userProvidedToken);
```

### 4. Audit Logging System
**File:** `lib/security/auditLogger.ts`

**Features:**
- Comprehensive security event logging
- User activity tracking
- Failed login attempt logging
- Data access and modification logging
- Security alert generation

**Usage:**
```typescript
import { logAuditEvent, logLoginAttempt, logDataAccess } from '@/lib/security/auditLogger';

// Log login attempt
await logLoginAttempt(email, success, request);

// Log data access
await logDataAccess(userId, 'questionnaire', resourceId, request);

// Log data modification
await logDataModification(userId, 'analysis', resourceId, changes, request);
```

### 5. Email Notification Service
**File:** `lib/services/emailService.ts`

**Features:**
- Multiple email provider support (SMTP, SendGrid, AWS SES)
- Pre-built email templates
- Assessment notifications
- Critical risk alerts
- Security alerts

**Setup:**
```bash
# For SMTP (Gmail example)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@insa-risk.com

# For SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-api-key

# For AWS SES
EMAIL_PROVIDER=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

**Usage:**
```typescript
import { sendNewAssessmentNotification, sendCriticalRiskAlert } from '@/lib/services/emailService';

// Send assessment notification
await sendNewAssessmentNotification(userEmail, assessmentName, assessmentId);

// Send critical risk alert
await sendCriticalRiskAlert(userEmail, riskName, severity, description, reportId);
```

### 6. In-App Notification Service
**File:** `lib/services/notificationService.ts`

**Features:**
- Real-time in-app notifications
- Priority-based notification system
- Notification read/unread tracking
- Auto-cleanup of old notifications

**Usage:**
```typescript
import { createNotification, notifyCriticalRisk, notifyAssessmentCompletion } from '@/lib/services/notificationService';

// Notify assessment completion
await notifyAssessmentCompletion(userId, assessmentName, assessmentId);

// Notify critical risk
await notifyCriticalRisk(userId, riskName, reportId);

// Get user notifications
const notifications = await getUserNotifications(userId, 50, false);
```

### 7. Security Headers & Middleware
**File:** `middleware.ts`

**Features:**
- HTTPS enforcement (HSTS)
- Content Security Policy (CSP)
- Clickjacking prevention (X-Frame-Options)
- MIME type sniffing prevention
- XSS protection headers
- Referrer Policy
- Permissions Policy
- Request ID tracking
- Protected route authentication

**Headers Applied:**
- `Strict-Transport-Security`: Forces HTTPS
- `Content-Security-Policy`: Prevents XSS attacks
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `X-XSS-Protection`: Browser XSS protection
- `Referrer-Policy`: Controls referrer information
- `Permissions-Policy`: Restricts browser features

### 8. Enhanced User Model
**File:** `models/User.ts`

**New Fields:**
- `mfaEnabled`: Boolean flag for MFA status
- `mfaSecret`: Encrypted MFA secret
- `lastLogin`: Timestamp of last login
- `loginAttempts`: Counter for failed login attempts
- `lockUntil`: Account lock timestamp
- `isActive`: Account status flag
- `department`: User's department
- `phone`: User's phone number

### 9. Enhanced Authentication
**File:** `lib/auth.ts`

**Features:**
- Account lockout after failed attempts
- Login attempt tracking
- Account status validation
- Session timeout (24 hours)
- MFA support in JWT token
- Audit logging for all login attempts

**Configuration:**
```typescript
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
```

### 10. Enhanced Signup with Validation
**File:** `app/api/auth/signup/route.ts`

**Features:**
- Comprehensive input validation
- Password strength requirements
- Audit logging
- Error tracking
- IP address and user agent logging

**Password Requirements:**
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## Phase 2: Advanced Features (To Implement)

### 1. SSO Integration
- OAuth2 providers (Google, Microsoft, GitHub)
- SAML 2.0 support
- OpenID Connect

### 2. Role-Based Access Control (RBAC) Enhancement
- Permission matrix implementation
- Resource-level access control
- Dynamic permission assignment

### 3. Data Encryption for Sensitive Fields
- Encrypt questionnaire responses
- Encrypt risk analysis results
- Encrypt user personal information

### 4. API Rate Limiting
- Per-user rate limiting
- Per-IP rate limiting
- Endpoint-specific limits

### 5. Security Monitoring
- Real-time security alerts
- Suspicious activity detection
- Automated response triggers

## Phase 3: Deployment & Compliance

### 1. Cloud Deployment Security
- AWS security best practices
- Azure security configuration
- GCP security setup

### 2. Compliance Documentation
- GDPR compliance checklist
- ISO 27001 alignment
- NIST Cybersecurity Framework mapping

### 3. Incident Response
- Security incident procedures
- Data breach notification
- Forensic logging

## Configuration Checklist

### Before Production Deployment

- [ ] Generate and secure ENCRYPTION_KEY
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Configure email service (SMTP/SendGrid/SES)
- [ ] Enable HTTPS/TLS 1.2+
- [ ] Set up database backups
- [ ] Configure audit log retention
- [ ] Enable MFA for admin accounts
- [ ] Set up security monitoring
- [ ] Configure rate limiting
- [ ] Test all security features
- [ ] Review and update security policies
- [ ] Conduct security audit
- [ ] Set up incident response procedures
- [ ] Configure log aggregation
- [ ] Enable database encryption
- [ ] Set up VPN/network security
- [ ] Configure WAF (Web Application Firewall)
- [ ] Enable DDoS protection

## Testing Security Features

### 1. Test Encryption
```bash
npm test -- encryption.test.ts
```

### 2. Test Validation
```bash
npm test -- validation.test.ts
```

### 3. Test MFA
```bash
npm test -- mfa.test.ts
```

### 4. Test Audit Logging
```bash
npm test -- auditLogger.test.ts
```

### 5. Test Authentication
```bash
npm test -- auth.test.ts
```

## Monitoring & Maintenance

### Daily Tasks
- Review security alerts
- Check failed login attempts
- Monitor system performance

### Weekly Tasks
- Review audit logs
- Check for suspicious activities
- Update security patches

### Monthly Tasks
- Security audit
- Permission review
- Compliance check

### Quarterly Tasks
- Penetration testing
- Security assessment
- Policy review

## Support & Documentation

For detailed information on each security component, refer to:
- `lib/security/encryption.ts` - Encryption documentation
- `lib/security/validation.ts` - Validation rules
- `lib/security/mfa.ts` - MFA setup
- `lib/security/auditLogger.ts` - Audit logging
- `lib/services/emailService.ts` - Email configuration
- `lib/services/notificationService.ts` - Notifications

## Emergency Procedures

### Account Lockout
1. Verify user identity
2. Reset login attempts: `User.updateOne({ _id: userId }, { loginAttempts: 0, lockUntil: null })`
3. Notify user
4. Log incident

### Security Breach
1. Isolate affected systems
2. Review audit logs
3. Notify affected users
4. Rotate credentials
5. Conduct forensic analysis

### Data Breach
1. Activate incident response plan
2. Notify authorities if required
3. Notify affected users
4. Review encryption status
5. Implement additional controls
