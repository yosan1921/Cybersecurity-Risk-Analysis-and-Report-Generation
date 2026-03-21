/**
 * User Profile Management API (CSRARS §3.4.3)
 * GET   /api/users/profile  – get own profile
 * PATCH /api/users/profile  – update own profile (name, password)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { writeAuditLog, buildAuditContext } from '@/services/auditLogService';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const user = await User.findById((session.user as any).id).select('-password').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true, user });
}

export async function PATCH(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    await dbConnect();
    const user = await User.findById((session.user as any).id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (name) user.name = name;

    if (newPassword) {
        if (!currentPassword) {
            return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
        }
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }
        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
        }
        user.password = await bcrypt.hash(newPassword, 12);
    }

    await user.save();

    const ctx = buildAuditContext(session.user as any, req);
    if (ctx) await writeAuditLog(ctx, 'UPDATE_PROFILE', 'User', String(user._id), { nameChanged: !!name, passwordChanged: !!newPassword });

    return NextResponse.json({ success: true, message: 'Profile updated' });
}
