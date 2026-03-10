import { NextResponse } from "next/server";
import { getAdminData, verifyTOTP, createSession } from "@/lib/admin-auth";

export async function POST(req: Request) {
 try {
  const { username, code } = await req.json();
  const adminData = await getAdminData();

  if (!adminData || username !== adminData.username) {
   return NextResponse.json({ error: "Неверный логин" }, { status: 401 });
  }

  const isValid = await verifyTOTP(code, adminData.twoFactorSecret);
  if (!isValid) {
   return NextResponse.json({ error: "Неверный код" }, { status: 401 });
  }

  const session = await createSession(username);

  const response = NextResponse.json({ success: true, redirect: "/admin" });

  response.cookies.set("admin_session", session, {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "lax",
   maxAge: 60 * 60 * 2,
   path: "/",
  });

  return response;
 } catch (error) {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
}
