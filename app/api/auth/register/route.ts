import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: Request) {
 try {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
   return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (password.length < 8) {
   return NextResponse.json({ error: "Пароль должен быть не менее 8 символов" }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
   where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
   return NextResponse.json({ error: "Пользователь с таким email уже зарегистрирован" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
   data: {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
   },
  });

  return NextResponse.json({ success: true, user: { name: user.name, email: user.email } });

 } catch (err) {
  console.error("Registration error details:", err);
  return NextResponse.json({ error: "Внутренняя ошибка сервера при регистрации" }, { status: 500 });
 }
}
