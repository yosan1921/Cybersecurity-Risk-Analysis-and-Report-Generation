/**
 * Role-Based Access Control (RBAC) — pure permission logic.
 * This file has NO server-only imports and is safe to use in both
 * Server Components and Client Components (hooks, UI, etc.).
 */
import { UserRole } from "@/models/User";

// ── Role constants ────────────────────────────────────────────────────────────

export const ROLES: Record<string, UserRole> = {
    DIRECTOR: "Director",
    DIVISION_HEAD: "Division Head",
    RISK_ANALYST: "Risk Analyst",
    STAFF: "Staff",
};

// ── Permission definitions ────────────────────────────────────────────────────

export const PERMISSIONS = {
    // Analysis
    VIEW_ANALYSIS: ["Director", "Division Head", "Risk Analyst", "Staff"] as UserRole[],
    RUN_ANALYSIS: ["Director", "Division Head", "Risk Analyst"] as UserRole[],
    REANALYZE: ["Director", "Division Head", "Risk Analyst"] as UserRole[],
    EDIT_ANALYSIS: ["Director", "Division Head", "Risk Analyst"] as UserRole[],

    // Questionnaires
    VIEW_QUESTIONNAIRES: ["Director", "Division Head", "Risk Analyst", "Staff"] as UserRole[],
    IMPORT_QUESTIONNAIRE: ["Director", "Division Head", "Risk Analyst"] as UserRole[],

    // Risk Treatment
    VIEW_RISK_TREATMENT: ["Director", "Division Head", "Risk Analyst", "Staff"] as UserRole[],
    CREATE_RISK_TREATMENT: ["Director", "Division Head", "Risk Analyst"] as UserRole[],

    // Reports
    VIEW_REPORTS: ["Director", "Division Head", "Risk Analyst", "Staff"] as UserRole[],
    GENERATE_REPORT: ["Director", "Division Head", "Risk Analyst"] as UserRole[],

    // Incidents
    VIEW_INCIDENTS: ["Director", "Division Head", "Risk Analyst", "Staff"] as UserRole[],
    CREATE_INCIDENT: ["Director", "Division Head", "Risk Analyst"] as UserRole[],
    UPDATE_INCIDENT: ["Director", "Division Head", "Risk Analyst"] as UserRole[],

    // Awareness
    VIEW_AWARENESS: ["Director", "Division Head", "Risk Analyst", "Staff"] as UserRole[],
    CREATE_AWARENESS: ["Director", "Division Head", "Risk Analyst"] as UserRole[],

    // Assets
    VIEW_ASSETS: ["Director", "Division Head", "Risk Analyst", "Staff"] as UserRole[],
    CREATE_ASSET: ["Director", "Division Head", "Risk Analyst"] as UserRole[],

    // Audit Logs
    VIEW_AUDIT_LOGS: ["Director", "Division Head"] as UserRole[],

    // User Management
    VIEW_USERS: ["Director", "Division Head"] as UserRole[],
    MANAGE_USERS: ["Director"] as UserRole[],

    // Analytics
    VIEW_ANALYTICS: ["Director", "Division Head", "Risk Analyst"] as UserRole[],
} as const;

export type Permission = keyof typeof PERMISSIONS;

// ── Pure helper functions (no server deps) ────────────────────────────────────

/** Check if a role has a given permission. */
export function hasPermission(role: UserRole, permission: Permission): boolean {
    return (PERMISSIONS[permission] as UserRole[]).includes(role);
}

/** Check if a role is one of the allowed roles. */
export function isAllowedRole(role: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(role);
}
