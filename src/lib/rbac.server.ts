/**
 * Server-side RBAC guards.
 * Only import this in Server Components, API route handlers, or server actions.
 * Never import this in client components or hooks.
 */
import "server-only";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/rbac";
import { UserRole } from "@/models/User";

/**
 * Server-side guard for API routes.
 * Returns the session if the user is authenticated and has the required permission.
 * Returns a NextResponse error otherwise.
 */
export async function requirePermission(permission: Permission) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return {
            session: null,
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    const role = (session.user as any).role as UserRole;
    if (!hasPermission(role, permission)) {
        return {
            session: null,
            error: NextResponse.json(
                { error: "Forbidden: insufficient permissions" },
                { status: 403 }
            ),
        };
    }

    return { session, error: null };
}

/**
 * Server-side guard that only checks authentication (no role restriction).
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return {
            session: null,
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }
    return { session, error: null };
}
