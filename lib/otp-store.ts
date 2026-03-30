
interface OtpEntry {
 code: string;
 expiresAt: number;  // Unix timestamp ms
 attempts: number;   // failed verify attempts
}

import { prisma } from "./prisma";

const CODE_TTL_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_ATTEMPTS = 5;

/** Generate a 4-digit numeric code using a cryptographically secure RNG */
function generateCode(): string {
 const { randomInt } = require('node:crypto');
 return randomInt(1000, 10000).toString();
}

/** Save (or replace) an OTP for a phone number and return the code */
export async function createOtp(phone: string): Promise<string> {
 const code = generateCode();
 const expiresAt = new Date(Date.now() + CODE_TTL_MS);

 await prisma.otpCode.upsert({
  where: { phone },
  update: { code, expiresAt, attempts: 0 },
  create: { phone, code, expiresAt, attempts: 0 }
 });

 return code;
}

export type VerifyResult =
 | { ok: true }
 | { ok: false; reason: 'not_found' | 'expired' | 'incorrect' | 'too_many_attempts' };

export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
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
