# Security Gaps Implementation Guide

This document provides step-by-step instructions to implement the critical security gaps identified in the security analysis.

---

## 1. EMAIL NOTIFICATION SERVICE

### Current Status
- ✅ Dependencies installed (nodemailer, nodemailer-sendgrid-transport)
- ✅ Environment variables configured
- ❌ No email service implementation
- ❌ No email templates
- ❌ No email triggers

### Implementation Steps

#### Step 1: Create Email Service Module

Create `lib/services/emailService.ts`:

```typescript
import nodemailer from 'nodemailer';
import { EmailTemplate, EmailOptions } from '@/types/email';

class EmailService {
  private transporter: any;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const provider = process.env.EMAIL_PROVIDER || 'smtp';

    if (provider === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    } else if (provider === 'sendgrid') {
      const sgTransport = require('nodemailer-sendgrid-transport');
      this.transporter = nodemailer.createTransport(
        sgTransport({
          auth: {
            api_key: process.env.SENDGRID_API_KEY
          }
        })
      );
    } else if (provider === 'ses') {
      // AWS SES implementation
      const AWS = require('aws-sdk');
      this.transporter = nodemailer.createTransport({
        SES: new AWS.SES({
          apiVersion: '2010-12-01',
          region: process.env.AWS_REGION
        })
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendNewAssessmentNotification(
    userEmail: string,
    assessmentTitle: string,
    companyName: string
  ): Promise<boolean> {
    const html = `
      <h2>New Assessment: ${assessmentTitle}</h2>
      <p>A new risk assessment has been created for <strong>${companyName}</strong>.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/assessments">View Assessment</a></p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `New Assessment: ${assessmentTitle}`,
      html,
      text: `New Assessment: ${assessmentTitle} for ${companyName}`
    });
  }

  async sendCriticalRiskAlert(
    userEmail: string,
    riskTitle: string,
    riskLevel: string,
    companyName: string
  ): Promise<boolean> {
    const html = `
      <h2 style="color: red;">⚠️ Critical Risk Alert</h2>
      <p><strong>Risk:</strong> ${riskTitle}</p>
      <p><strong>Level:</strong> ${riskLevel}</p>
      <p><strong>Company:</strong> ${companyName}</p>
      <p>Immediate action may be required.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/risks">View Risk Details</a></p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `🚨 CRITICAL RISK ALERT: ${riskTitle}`,
      html,
      text: `Critical Risk Alert: ${riskTitle} - ${riskLevel}`
    });
  }

  async sendAssessmentUpdateNotification(
    userEmail: string,
    assessmentTitle: string,
    updateType: string
  ): Promise<boolean> {
    const html = `
      <h2>Assessment Update: ${assessmentTitle}</h2>
      <p>The assessment has been updated: <strong>${updateType}</strong></p>
      <p><a href="${process.env.NEXTAUTH_URL}/assessments">View Assessment</a></p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Assessment Updated: ${assessmentTitle}`,
      html,
      text: `Assessment Updated: ${assessmentTitle} - ${updateType}`
    });
  }

  async sendReportGeneratedNotification(
    userEmail: string,
    reportTitle: string,
    companyName: string
  ): Promise<boolean> {
    const html = `
      <h2>Report Generated: ${reportTitle}</h2>
      <p>Your risk assessment report for <strong>${companyName}</strong> is ready.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/reports">Download Report</a></p>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Report Ready: ${reportTitle}`,
      html,
      text: `Report Generated: ${reportTitle} for ${companyName}`
    });
  }
}

export const emailService = new EmailService();
```

#### Step 2: Create Email Types

Create `types/email.ts`:

```typescript
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  html: string;
}
```

#### Step 3: Add Email Triggers

Update `app/api/questionnaires/submit/route.ts` to send email:

```typescript
import { emailService } from '@/lib/services/emailService';

// After successful questionnaire submission
await emailService.sendNewAssessmentNotification(
  userEmail,
  questionnaire.title,
  questionnaire.company
);
```

Update `app/api/analysis/process/route.ts` to send email on critical risks:

```typescript
import { emailService } from '@/lib/services/emailService';

// After analysis identifies critical risks
if (analysis.riskLevel === 'critical') {
  await emailService.sendCriticalRiskAlert(
    userEmail,
    analysis.title,
    analysis.riskLevel,
    analysis.company
  );
}
```

---

## 2. SINGLE SIGN-ON (SSO) IMPLEMENTATION

### Current Status
- ✅ NextAuth.js installed (v4.24.0)
- ❌ Only Credentials provider configured
- ❌ No OAuth providers
- ❌ No SAML support

### Implementation Steps

#### Step 1: Add OAuth Providers

Update `lib/auth.ts`:

```typescript
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import MicrosoftProvider from "next-auth/providers/microsoft-entra-id";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // ... existing credentials provider
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    MicrosoftProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID || 'common',
    }),
  ],
  // ... rest of config
};
```

#### Step 2: Update Environment Variables

Add to `.env.local`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Microsoft Azure AD
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-tenant-id
```

#### Step 3: Add SAML Support (Optional)

Install SAML provider:

```bash
npm install next-auth-saml
```

Update `lib/auth.ts`:

```typescript
import SAMLProvider from "next-auth-saml";

export const authOptions: NextAuthOptions = {
  providers: [
    // ... existing providers
    SAMLProvider({
      id: "saml",
      name: "SAML",
      type: "oauth",
      version: "2.0",
      scope: [],
      params: {
        grant_type: "authorization_code",
      },
      accessTokenUrl: process.env.SAML_IDP_URL + "/oauth/token",
      requestTokenUrl: process.env.SAML_IDP_URL + "/oauth/authorize",
      authorizationUrl: process.env.SAML_IDP_URL + "/oauth/authorize",
      profileUrl: process.env.SAML_IDP_URL + "/oauth/userinfo",
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      clientId: process.env.SAML_CLIENT_ID || '',
      clientSecret: process.env.SAML_CLIENT_SECRET || '',
    }),
  ],
};
```

#### Step 4: Update User Creation for OAuth

Modify the JWT callback to handle OAuth users:

```typescript
callbacks: {
  async jwt({ token, user, account }) {
    if (user) {
      token.id = user.id;
      token.role = (user as any).role || 'Staff'; // Default role for OAuth users
      token.provider = account?.provider;
    }
    return token;
  },
  async signIn({ user, account, profile }) {
    // Create user if doesn't exist (for OAuth)
    if (account?.provider !== 'credentials') {
      await dbConnect();
      let dbUser = await User.findOne({ email: user.email });
      
      if (!dbUser) {
        dbUser = await User.create({
          email: user.email,
          name: user.name,
          password: 'oauth-' + Math.random().toString(36), // Dummy password
          role: 'Staff',
          isActive: true,
          mfaEnabled: false
        });
      }
      
      return true;
    }
    return true;
  }
}
```

---

## 3. SECURITY HEADERS INTEGRATION

### Current Status
- ✅ Helmet installed (v7.1.0)
- ❌ Not integrated into Next.js

### Implementation Steps

#### Step 1: Create Next.js Security Headers Config

Create `next.config.js` or update existing:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

---

## 4. DOCKER CONTAINERIZATION

### Implementation Steps

#### Step 1: Create Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
```

#### Step 2: Create Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - EMAIL_PROVIDER=${EMAIL_PROVIDER}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
    depends_on:
      - mongodb
    networks:
      - insa-network

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    volumes:
      - mongodb_data:/data/db
    networks:
      - insa-network

volumes:
  mongodb_data:

networks:
  insa-network:
    driver: bridge
```

---

## 5. KUBERNETES DEPLOYMENT

### Implementation Steps

#### Step 1: Create Kubernetes Manifests

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: insa-app
  labels:
    app: insa-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: insa-app
  template:
    metadata:
      labels:
        app: insa-app
    spec:
      containers:
      - name: insa-app
        image: insa-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: insa-secrets
              key: mongodb-uri
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: insa-secrets
              key: nextauth-secret
        - name: ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: insa-secrets
              key: encryption-key
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

Create `k8s/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: insa-app-service
spec:
  selector:
    app: insa-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

Create `k8s/secrets.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: insa-secrets
type: Opaque
stringData:
  mongodb-uri: "mongodb+srv://user:password@cluster.mongodb.net/db"
  nextauth-secret: "your-secret-key"
  encryption-key: "your-encryption-key"
```

---

## 6. CI/CD PIPELINE

### Implementation Steps

#### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run lint
    - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - run: npm audit --audit-level=moderate

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - name: Build and push Docker image
      run: |
        docker build -t insa-app:${{ github.sha }} .
        docker tag insa-app:${{ github.sha }} insa-app:latest
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/insa-app insa-app=insa-app:${{ github.sha }}
```

---

## 7. CRITICAL RISK ALERTS

### Implementation Steps

#### Step 1: Create Alert Service

Create `lib/services/alertService.ts`:

```typescript
import { emailService } from './emailService';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { logAuditEvent } from '@/lib/security/auditLogger';

export async function sendCriticalRiskAlert(
  riskData: {
    title: string;
    level: string;
    company: string;
    description: string;
    recommendedAction: string;
  }
) {
  try {
    await dbConnect();

    // Get all Directors and Division Heads
    const recipients = await User.find({
      role: { $in: ['Director', 'Division Head'] },
      isActive: true
    });

    // Send email to each recipient
    for (const user of recipients) {
      await emailService.sendCriticalRiskAlert(
        user.email,
        riskData.title,
        riskData.level,
        riskData.company
      );
    }

    // Log alert event
    await logAuditEvent({
      eventType: 'SECURITY_ALERT',
      action: `Critical risk alert: ${riskData.title}`,
      resource: 'risk',
      status: 'success',
      details: riskData
    });

  } catch (error) {
    console.error('Failed to send critical risk alert:', error);
  }
}
```

#### Step 2: Integrate into Analysis Process

Update `app/api/analysis/process/route.ts`:

```typescript
import { sendCriticalRiskAlert } from '@/lib/services/alertService';

// After analysis
if (analysis.riskLevel === 'critical') {
  await sendCriticalRiskAlert({
    title: analysis.title,
    level: analysis.riskLevel,
    company: analysis.company,
    description: analysis.description,
    recommendedAction: analysis.recommendedAction
  });
}
```

---

## Implementation Timeline

| Phase | Tasks | Duration | Priority |
|-------|-------|----------|----------|
| Phase 1 | Email service, Security headers, Docker | 1-2 weeks | Critical |
| Phase 2 | OAuth/SSO, Kubernetes, CI/CD | 2-3 weeks | High |
| Phase 3 | Alert automation, Monitoring, Logging | 1-2 weeks | High |
| Phase 4 | SAML, LDAP, Advanced features | 2-3 weeks | Medium |

---

## Testing Checklist

- [ ] Email notifications sent successfully
- [ ] OAuth login works for all providers
- [ ] SAML authentication functional
- [ ] Security headers present in responses
- [ ] Docker image builds and runs
- [ ] Kubernetes deployment successful
- [ ] CI/CD pipeline executes correctly
- [ ] Critical alerts triggered appropriately
- [ ] All tests pass
- [ ] Security audit passes

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] Monitoring and logging set up
- [ ] SSL/TLS certificates installed
- [ ] Load balancer configured
- [ ] Auto-scaling policies defined
- [ ] Disaster recovery plan documented
- [ ] Security team approval obtained
- [ ] Penetration testing completed
- [ ] Go-live approval received

