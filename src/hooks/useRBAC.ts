/**
 * Client-side RBAC hook.
 * Provides role-checking utilities for UI components.
 */
"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/models/User";
import { hasPermission, Permission } from "@/lib/rbac";

export function useRBAC() {
    const { data: session } = useSession();
    const role = (session?.user as any)?.role as UserRole | undefined;

    return {
        role,
        /** Returns true if the current user has the given permission. */
        can: (permission: Permission): boolean => {
            if (!role) return false;
            return hasPermission(role, permission);
        },
        /** Returns true if the current user's role is one of the provided roles. */
        isRole: (...roles: UserRole[]): boolean => {
            if (!role) return false;
            return roles.includes(role);
        },
    };
}
