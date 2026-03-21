/**
 * POST /api/auth/mfa/disable
 * Disables MFA for the authenticated user after verifying their password.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { writeAuditLog, buildAuditContext } from "@/services/auditLogService";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { password } = await req.json();
    if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });

    await dbConnect();
    const user = await User.findById((session.user as any).id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.mfaEnabled) {
        return NextResponse.json({ error: "MFA is not enabled" }, { status: 400 });
    }

    if (user.password) {
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 400 });
    }

    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.mfaBackupCodes = [];
    user.mfaPending = false;
    await user.save();

    const ctx = buildAuditContext(session.user as any, req);
    if (ctx) await writeAuditLog(ctx, "MFA_DISABLED", "User", String(user._id));

    return NextResponse.json({ success: true });
}
