import { NextRequest, NextResponse } from "next/server";
import { getAdminData, verifyPassword, checkLoginRateLimit, recordFailedLogin, resetLoginAttempts } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
 try {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  const locked = checkLoginRateLimit(ip);
  if (locked > 0) {
   return NextResponse.json(
    { error: `Слишком много попыток. Повторите через ${locked} сек.` },
    { status: 429 }
   );
  }

  const { username, password } = await req.json();
  const adminData = await getAdminData();

  if (!adminData) {
   return NextResponse.json({ error: "Admin account not configured" }, { status: 500 });
  }

  if (username !== adminData.username) {
   recordFailedLogin(ip);
   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await verifyPassword(password, adminData.passwordHash);
  if (!isValid) {
   recordFailedLogin(ip);
   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  resetLoginAttempts(ip);
  return NextResponse.json({ success: true, nextStep: "2fa" });
 } catch (error) {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
}
