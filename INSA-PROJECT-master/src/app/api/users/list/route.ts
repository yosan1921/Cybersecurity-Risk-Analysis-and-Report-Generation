/**
 * User List API (CSRARS §3.4.2 – RBAC management)
 * GET /api/users/list  – Director only
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (!['Director', 'Division Head'].includes(role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const users = await User.find({}).select('-password').sort({ role: 1, name: 1 }).lean();
    return NextResponse.json({ success: true, users });
}
