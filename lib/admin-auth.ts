import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { verify } from "otplib";
import fs from "fs/promises";
import path from "path";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "default-secret-change-me"
);
const ADMIN_DATA_PATH = path.join(process.cwd(), "data", "admin.json");

// ------- Brute-force protection -------
interface LoginAttempt { count: number; firstAt: number }
const loginAttempts = new Map<string, LoginAttempt>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Returns remaining lockout seconds, or 0 if not locked */
export function checkLoginRateLimit(ip: string): number {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.firstAt > LOGIN_WINDOW_MS) return 0;
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    const remaining = Math.ceil((LOGIN_WINDOW_MS - (now - entry.firstAt)) / 1000);
    return remaining > 0 ? remaining : 0;
  }
  return 0;
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.firstAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAt: now });
  } else {
    entry.count += 1;
  }
}

export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
// --------------------------------------

export async function getAdminData() {
 try {
  const data = await fs.readFile(ADMIN_DATA_PATH, "utf-8");
  return JSON.parse(data);
 } catch {
  return null;
 }
}

export async function createSession(username: string) {
 return await new SignJWT({ username })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("2h")
  .sign(SECRET);
}

export async function verifySession(token: string) {
 try {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
 } catch {
  return null;
 }
}

export async function verifyPassword(password: string, hash: string) {
 return await bcrypt.compare(password, hash);
}

export async function verifyTOTP(token: string, secret: string) {
 return await verify({ token, secret });
}
