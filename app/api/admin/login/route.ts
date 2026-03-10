import { NextResponse } from "next/server";
import { getAdminData, verifyPassword } from "@/lib/admin-auth";

export async function POST(req: Request) {
 try {
  const { username, password } = await req.json();
  const adminData = await getAdminData();

  if (!adminData) {
   return NextResponse.json({ error: "Admin account not configured" }, { status: 500 });
  }

  if (username !== adminData.username) {
   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await verifyPassword(password, adminData.passwordHash);
  if (!isValid) {
   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ success: true, nextStep: "2fa" });
 } catch (error) {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
}
