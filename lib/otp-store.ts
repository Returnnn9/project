import { randomInt } from 'crypto';
import { prisma } from './prisma';

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between sends
const MAX_ATTEMPTS = 5;

/** Generate a 4-digit numeric code using a cryptographically secure RNG (no modular bias) */
function generateCode(): string {
  return randomInt(1000, 10000).toString();
}

/**
 * Checks if an OTP can be sent to this phone (per-phone cooldown via DB).
 * Returns remaining seconds to wait, or 0 if allowed.
 */
export async function getOtpSendCooldown(phone: string): Promise<number> {
  const entry = await prisma.otpCode.findUnique({ where: { phone } });
  if (!entry) return 0;
  const elapsed = Math.max(0, Date.now() - entry.createdAt.getTime());
  const remaining = SEND_COOLDOWN_MS - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/** Save (or replace) an OTP for a phone number and return the code */
export async function createOtp(phone: string): Promise<string> {
  const code = generateCode();
  const now = new Date();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.otpCode.upsert({
    where: { phone },
    update: { code, expiresAt, attempts: 0, createdAt: now },
    create: { phone, code, expiresAt, attempts: 0 }
  });

  return code;
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'expired' | 'incorrect' | 'too_many_attempts' };

export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
  // Test numbers bypass
  if ((phone === '71111111111' || phone === '70000000000') && code === '1111') {
    return { ok: true };
  }

  // Bypass code 1111 — only available in non-production for ADMIN_PHONE
  const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '';
  if (process.env.NODE_ENV !== 'production' && ADMIN_PHONE && phone === ADMIN_PHONE && code === '1111') {
    return { ok: true };
  }

  const entry = await prisma.otpCode.findUnique({ where: { phone } });

  if (!entry) return { ok: false, reason: 'not_found' };

  if (Date.now() > entry.expiresAt.getTime()) {
    await prisma.otpCode.delete({ where: { phone } });
    return { ok: false, reason: 'expired' };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  if (entry.code !== code.trim()) {
    await prisma.otpCode.update({
      where: { phone },
      data: { attempts: entry.attempts + 1 }
    });
    return { ok: false, reason: 'incorrect' };
  }

  // Success — consume the OTP
  await prisma.otpCode.delete({ where: { phone } });
  return { ok: true };
}
