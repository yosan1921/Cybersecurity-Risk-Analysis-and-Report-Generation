import dbConnect from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { NextRequest } from 'next/server';

export interface AuditContext {
    userId: string;
    userEmail: string;
    userRole: string;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Write an audit log entry. Call this from any API route after a state-changing operation.
 */
export async function writeAuditLog(
    ctx: AuditContext,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>
): Promise<void> {
    try {
        await dbConnect();
        await AuditLog.create({
            userId: ctx.userId,
            userEmail: ctx.userEmail,
            userRole: ctx.userRole,
            action,
            resource,
            resourceId,
            details: details ?? {},
            ipAddress: ctx.ipAddress,
            userAgent: ctx.userAgent,
            timestamp: new Date(),
        });
    } catch (err) {
        // Audit logging must never break the main flow
        console.error('[AuditLog] Failed to write audit log:', err);
    }
}

/**
 * Build an AuditContext from an already-resolved session user + request.
 * The caller is responsible for obtaining the session — this avoids importing
 * authOptions here, which would create a circular module dependency in dev mode
 * and break NextAuth's CredentialsProvider.
 */
export function buildAuditContext(
    sessionUser: { id?: string; email?: string; role?: string } | null | undefined,
    req: NextRequest
): AuditContext | null {
    if (!sessionUser?.id) return null;
    return {
        userId: sessionUser.id,
        userEmail: sessionUser.email ?? '',
        userRole: (sessionUser as any).role ?? 'Staff',
        ipAddress: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
    };
}

/**
 * @deprecated Use buildAuditContext(session.user, req) instead.
 * Kept for backward compatibility — returns null without calling getServerSession.
 */
export async function getAuditContext(req: NextRequest): Promise<AuditContext | null> {
    // Intentionally does NOT import authOptions/getServerSession to avoid
    // breaking the NextAuth CredentialsProvider in dev mode.
    // Callers should use buildAuditContext(session.user, req) instead.
    return null;
}
