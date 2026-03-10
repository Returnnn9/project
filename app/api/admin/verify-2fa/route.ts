import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { verify } from "otplib";

export async function POST(req: Request) {
 try {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();

  const user = await prisma.user.findUnique({
   where: { id: (session.user as any).id },
   select: { twoFactorSecret: true, twoFactorEnabled: true } as any
  }) as any;

  if (!user || !user.twoFactorSecret) {
   return NextResponse.json({ error: "2FA not configured" }, { status: 400 });
  }

  const isValid = await verify({
   token: code,
   secret: user.twoFactorSecret
  });

  if (!isValid) {
   return NextResponse.json({ error: "Неверный код" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  // Set cookie to confirm 2FA verification for this session
  response.cookies.set("admin_2fa_verified", "true", {
   httpOnly: false, // Middleware just checks existence
   secure: process.env.NODE_ENV === "production",
   sameSite: "lax",
   maxAge: 60 * 60 * 24, // 1 day
   path: "/",
  });

  return response;
 } catch (error) {
  console.error("2FA Error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
}
