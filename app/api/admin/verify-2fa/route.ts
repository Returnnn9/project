import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";

export const runtime = "nodejs";

export async function POST(req: Request) {
 try {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();

  const user = await prisma.user.findUnique({
   where: { id: session.user.id },
   select: { 
     twoFactorSecret: true, 
     twoFactorEnabled: true,
     twoFactorAttempts: true,
     twoFactorLockUntil: true 
   }
  });

  if (!user || !user.twoFactorSecret) {
   return NextResponse.json({ error: "2FA not configured" }, { status: 400 });
  }

  if (user.twoFactorLockUntil && new Date(user.twoFactorLockUntil) > new Date()) {
    return NextResponse.json({ error: "Слишком много попыток. Подождите 15 минут." }, { status: 429 });
  }

  const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });

  if (!isValid) {
   const newAttempts = (user.twoFactorAttempts || 0) + 1;
   const isLocking = newAttempts >= 5;
   
   await prisma.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorAttempts: newAttempts,
      twoFactorLockUntil: isLocking ? new Date(Date.now() + 15 * 60000) : null
    }
   });

   if (isLocking) {
     return NextResponse.json({ error: "Слишком много неудачных попыток. 2FA заблокирована на 15 минут." }, { status: 429 });
   }

   return NextResponse.json({ error: "Неверный код" }, { status: 400 });
  }

  if (user.twoFactorAttempts > 0) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorAttempts: 0, twoFactorLockUntil: null }
    });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_2fa_verified", "true", {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "strict",
   maxAge: 60 * 60 * 24,
   path: "/",
  });

  return response;
 } catch (error) {
  console.error("2FA Error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
}
