/**
 * In-memory OTP store.
 * Maps phone number → { code, expiresAt, attempts }
 * 
 * NOTE: This is process-memory only. In production with multiple replicas,
 * use Redis or a DB table instead. For a single-process Next.js dev/prod server this is fine.
 */

interface OtpEntry {
  code: string;
  expiresAt: number;  // Unix timestamp ms
  attempts: number;   // failed verify attempts
}

// Module-level map (persists across hot reloads in dev via global)
const globalStore = global as typeof globalThis & { __otpStore?: Map<string, OtpEntry> };
if (!globalStore.__otpStore) {
  globalStore.__otpStore = new Map();
}
const store = globalStore.__otpStore;

const CODE_TTL_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_ATTEMPTS = 5;

/** Generate a 4-digit numeric code */
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/** Save (or replace) an OTP for a phone number and return the code */
export function createOtp(phone: string): string {
  const code = generateCode();
  store.set(phone, {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    attempts: 0,
  });
  return code;
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'expired' | 'incorrect' | 'too_many_attempts' };

/** Verify an OTP. Mutates internal state (attempt counter / deletion). */
export function verifyOtp(phone: string, code: string): VerifyResult {
  const entry = store.get(phone);

  if (!entry) return { ok: false, reason: 'not_found' };
  if (Date.now() > entry.expiresAt) {
    store.delete(phone);
    return { ok: false, reason: 'expired' };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  if (entry.code !== code.trim()) {
    entry.attempts += 1;
    return { ok: false, reason: 'incorrect' };
  }

  // Success — consume the OTP
  store.delete(phone);
  return { ok: true };
}
