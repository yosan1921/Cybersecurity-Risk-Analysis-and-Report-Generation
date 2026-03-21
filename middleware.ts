/**
 * Next.js Middleware
 * Enforces security headers, request validation, and route protection.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Pages that require authentication
const PROTECTED_PAGES = [
    '/dashboard',
    '/profile',
    '/audit',
    '/awareness',
    '/chat',
    '/incidents',
    '/questionnaires',
    '/reports',
    '/risk-analysis',
    '/risk-evaluation',
    '/risk-matrix',
    '/risk-treatment',
    '/risks',
];

// Pages restricted to specific roles (in addition to auth)
const ROLE_RESTRICTED_PAGES: { path: string; roles: string[] }[] = [
    { path: '/audit', roles: ['Director', 'Division Head'] },
];

// API routes that require authentication
const PROTECTED_API_ROUTES = [
    '/api/analysis',
    '/api/reports',
    '/api/questionnaires',
    '/api/companies',
    '/api/incidents',
    '/api/backup',
    '/api/excelreport',
    '/api/risk-evaluation',
    '/api/users',
    '/api/audit',
    '/api/awareness',
    '/api/chat',
    '/api/assets',
    '/api/analytics',
];

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const { pathname } = request.nextUrl;

    // ── HTTPS enforcement (production only) ───────────────────────────────────
    if (
        process.env.NODE_ENV === 'production' &&
        request.headers.get('x-forwarded-proto') === 'http'
    ) {
        const httpsUrl = request.nextUrl.clone();
        httpsUrl.protocol = 'https:';
        return NextResponse.redirect(httpsUrl, { status: 301 });
    }

    // ── Security Headers ──────────────────────────────────────────────────────
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com https://github.com https://login.microsoftonline.com;"
    );
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');
    response.headers.set('X-Request-ID', `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

    // ── Page route protection ─────────────────────────────────────────────────
    const isProtectedPage = PROTECTED_PAGES.some(p => pathname.startsWith(p));
    if (isProtectedPage) {
        const token = await getToken({ req: request });
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Role-based page restrictions
        const roleRestriction = ROLE_RESTRICTED_PAGES.find(r => pathname.startsWith(r.path));
        if (roleRestriction && !roleRestriction.roles.includes(token.role as string)) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // ── API route protection ──────────────────────────────────────────────────
    if (pathname.startsWith('/api/')) {
        const isProtectedApi = PROTECTED_API_ROUTES.some(r => pathname.startsWith(r));
        if (isProtectedApi) {
            const token = await getToken({ req: request });
            if (!token) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
