/**
 * POST /api/auth/mfa/setup
 * Initiates MFA enrollment: generates a TOTP secret, stores it as pending,
 * and returns the otpauth URI + QR code data URL.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateTOTPSecret, buildTOTPUri } from "@/lib/mfa";
import { encrypt } from "@/lib/encryption";
import QRCode from "qrcode";

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const user = await User.findById((session.user as any).id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.mfaEnabled) {
        return NextResponse.json({ error: "MFA is already enabled" }, { status: 400 });
    }

    const secret = generateTOTPSecret();
    const uri = buildTOTPUri(secret, user.email);
    const qr = await QRCode.toDataURL(uri);

    // Store secret encrypted at rest — not active until verified
    user.mfaSecret = encrypt(secret);
    user.mfaPending = true;
    await user.save();

    return NextResponse.json({ success: true, secret, qr });
}
