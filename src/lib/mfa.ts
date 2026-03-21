/**
 * MFA utilities — TOTP (RFC 6238) via the `otpauth` package.
 * Backup codes are bcrypt-hashed before storage.
 */
import * as OTPAuth from "otpauth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const ISSUER = "CSRARS";
const DIGITS = 6;
const PERIOD = 30;
const WINDOW = Number(process.env.MFA_WINDOW ?? 1); // ±1 period tolerance

// ── TOTP ─────────────────────────────────────────────────────────────────────

/** Generate a new random base32 TOTP secret. */
export function generateTOTPSecret(): string {
    return new OTPAuth.Secret({ size: 20 }).base32;
}

/** Build an otpauth:// URI for QR code display. */
export function buildTOTPUri(secret: string, email: string): string {
    const totp = new OTPAuth.TOTP({
        issuer: ISSUER,
        label: email,
        algorithm: "SHA1",
        digits: DIGITS,
        period: PERIOD,
        secret: OTPAuth.Secret.fromBase32(secret),
    });
    return totp.toString();
}

/** Verify a 6-digit TOTP token against a stored base32 secret. */
export function verifyTOTP(secret: string, token: string): boolean {
    try {
        const totp = new OTPAuth.TOTP({
            issuer: ISSUER,
            algorithm: "SHA1",
            digits: DIGITS,
            period: PERIOD,
            secret: OTPAuth.Secret.fromBase32(secret),
        });
        const delta = totp.validate({ token: token.replace(/\s/g, ""), window: WINDOW });
        return delta !== null;
    } catch {
        return false;
    }
}

// ── Backup codes ──────────────────────────────────────────────────────────────

const BACKUP_CODE_COUNT = Number(process.env.MFA_BACKUP_CODES ?? 10);

/** Generate plain-text backup codes and return both plain and hashed versions. */
export async function generateBackupCodes(): Promise<{ plain: string[]; hashed: string[] }> {
    const plain: string[] = [];
    const hashed: string[] = [];

    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
        const code = crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g. "A3F2B1C9"
        plain.push(code);
        hashed.push(await bcrypt.hash(code, 10));
    }
    return { plain, hashed };
}

/** Check a plain backup code against the stored hashed list. Returns true if valid. */
export async function verifyBackupCode(plain: string, hashed: string[]): Promise<boolean> {
    for (const h of hashed) {
        if (await bcrypt.compare(plain.toUpperCase(), h)) return true;
    }
    return false;
}

/** Remove a used backup code from the hashed list (call after successful verification). */
export async function consumeBackupCode(plain: string, hashed: string[]): Promise<string[]> {
    const remaining: string[] = [];
    let consumed = false;
    for (const h of hashed) {
        if (!consumed && (await bcrypt.compare(plain.toUpperCase(), h))) {
            consumed = true; // skip (consume) this one
        } else {
            remaining.push(h);
        }
    }
    return remaining;
}
