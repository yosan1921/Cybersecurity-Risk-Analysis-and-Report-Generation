/**
 * AES-256-GCM field-level encryption utility.
 *
 * Uses AES-256-GCM (authenticated encryption) which provides both
 * confidentiality and integrity — superior to AES-256-CBC for at-rest data.
 *
 * Format of encrypted output: <iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;       // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

function getKey(): Buffer {
    const raw = process.env.ENCRYPTION_KEY;
    if (!raw || raw.length !== 64) {
        throw new Error(
            "ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
            "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
        );
    }
    return Buffer.from(raw, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a colon-delimited string: iv:authTag:ciphertext (all hex-encoded).
 */
export function encrypt(plaintext: string): string {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
    });

    const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex"),
    ].join(":");
}

/**
 * Decrypt a value produced by encrypt().
 * Throws if the ciphertext has been tampered with (GCM auth tag mismatch).
 */
export function decrypt(encryptedValue: string): string {
    const key = getKey();
    const parts = encryptedValue.split(":");
    if (parts.length !== 3) {
        throw new Error("Invalid encrypted value format.");
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
        authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]).toString("utf8");
}

/**
 * Returns true if the value looks like an encrypted string (iv:tag:ciphertext).
 * Useful for migrating existing plaintext values.
 */
export function isEncrypted(value: string): boolean {
    const parts = value.split(":");
    return parts.length === 3 && parts.every(p => /^[0-9a-f]+$/i.test(p));
}
