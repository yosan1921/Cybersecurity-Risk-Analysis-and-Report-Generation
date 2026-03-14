/**
 * Next.js Middleware
 * Enforces security headers and request validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Security Headers
    // Enforce HTTPS
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    );

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    response.headers.set(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
    );

    // Remove server information
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');

    // Add request ID for tracking
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    response.headers.set('X-Request-ID', requestId);

    // Protect API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
        // Check authentication for protected routes
        const protectedRoutes = [
            '/api/analysis',
            '/api/reports',
            '/api/questionnaires',
            '/api/companies',
            '/api/incidents',
            '/api/backup',
            '/api/excelreport',
            '/api/risk-evaluation'
        ];

        const isProtectedRoute = protectedRoutes.some(route =>
            request.nextUrl.pathname.startsWith(route)
        );

        if (isProtectedRoute) {
            const token = await getToken({ req: request });

            if (!token) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
