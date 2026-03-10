import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
 try {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
   return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (password.length < 4) {
   return NextResponse.json({ error: "Пароль должен быть не менее 4 символов" }, { status: 400 });
  }

  // 1. Attempt Check for existence in both DB and Local
  let existingUser = null;
  try {
   existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
   });
  } catch (e) {
   console.warn("DB check failed, checking local users fallback...");
  }

  if (!existingUser) {
   const { findUserByEmail } = await import("@/lib/user-store");
   existingUser = await findUserByEmail(email);
  }

  if (existingUser) {
   return NextResponse.json({ error: "Пользователь с таким email уже зарегистрирован" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // 2. Attempt Create in DB
  try {
   const user = await prisma.user.create({
    data: {
     name: name.trim(),
     email: email.toLowerCase().trim(),
     password: hashedPassword,
    },
   });

   console.log("User registered in PostgreSQL.");
   return NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
   console.error("PostgreSQL registration failed, falling back to local JSON:", error);

   // 3. Fallback to Local JSON
   const { createUser } = await import("@/lib/user-store");
   const user = await createUser({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: hashedPassword,
    role: "USER"
   });

   return NextResponse.json({
    success: true,
    message: "Registration successful (Local Fallback)",
    user: { name: user.name, email: user.email }
   });
  }
 } catch (err: any) {
  console.error("Registration error details:", err);
  return NextResponse.json({ error: "Внутренняя ошибка сервера при регистрации" }, { status: 500 });
 }
}
