import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { verify } from "otplib";
import fs from "fs/promises";
import path from "path";

const SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || "default-secret-change-me");
const ADMIN_DATA_PATH = path.join(process.cwd(), "data", "admin.json");

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
