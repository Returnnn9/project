import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authenticator } from "otplib";
import QRCode from "qrcode";

export const runtime = "nodejs";

export async function GET() {
 try {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(
   session.user.email || "Admin",
   "Smusl Premium",
   secret
  );

  const qrCodeUrl = await QRCode.toDataURL(otpauth);

  await prisma.user.update({
   where: { id: session.user.id },
   data: { twoFactorSecret: secret, twoFactorEnabled: false }
  });

  return NextResponse.json({ qrCodeUrl, secret });
 } catch {
  return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 });
 }
}

export async function POST(req: Request) {
 try {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await req.json();
  const user = await prisma.user.findUnique({
   where: { id: session.user.id },
   select: { twoFactorSecret: true }
  });

  if (!user?.twoFactorSecret) {
   return NextResponse.json({ error: "No secret found" }, { status: 400 });
  }

  const isValid = authenticator.verify({ token: code, secret: user.twoFactorSecret });

  if (!isValid) {
   return NextResponse.json({ error: "Неверный код подтверждения" }, { status: 400 });
  }

  await prisma.user.update({
   where: { id: session.user.id },
   data: { twoFactorEnabled: true }
  });

  return NextResponse.json({ success: true });
 } catch {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
}
