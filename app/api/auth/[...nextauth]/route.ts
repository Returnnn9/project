import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
 adapter: PrismaAdapter(prisma) as any,
 providers: [
  GoogleProvider({
   clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
  }),
  AppleProvider({
   clientId: process.env.APPLE_ID || "placeholder",
   clientSecret: process.env.APPLE_SECRET || "placeholder",
  }),
  CredentialsProvider({
   name: "credentials",
   credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" },
   },
   async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) {
     throw new Error("Missing email or password");
    }

    const adminEmailFromEnv = (process.env.ADMIN_EMAIL || "admin@smusl.ru").toLowerCase().trim();
    const adminPasswordFromEnv = (process.env.ADMIN_PASSWORD || "").trim();

    const inputEmail = credentials.email.toLowerCase().trim();
    const inputPassword = credentials.password.trim();

    // 1. Direct environment-based admin check (Resilient to DB failures)
    if (inputEmail === adminEmailFromEnv) {
     if (adminPasswordFromEnv && inputPassword === adminPasswordFromEnv) {
      console.log("Admin login via environment credentials bypass.");
      return {
       id: "admin-env-id",
       email: adminEmailFromEnv,
       name: "Admin",
       role: "ADMIN",
       twoFactorEnabled: false,
      };
     }
    }

    // 2. Standard Database check for other users
    let user;
    try {
     user = await prisma.user.findUnique({
      where: { email: inputEmail },
     }) as any;
    } catch (e) {
     console.error("Database unavailable in authorize, trying local JSON fallback:", e);
    }

    // 3. Local JSON Fallback (Resilient to DB failures)
    if (!user) {
     try {
      const { findUserByEmail } = await import("@/lib/user-store");
      const localUser = await findUserByEmail(inputEmail);

      if (localUser) {
       user = {
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        password: localUser.passwordHash,
        role: localUser.role,
       };
      }
     } catch (e) {
      console.error("Local JSON store error:", e);
     }
    }

    if (!user || !user.password) {
     throw new Error("Invalid credentials or user not found");
    }

    // Check brute-force lock
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
     throw new Error("Лимит попыток исчерпан. Попробуйте через 15 минут.");
    }

    const isCorrectPassword = await bcrypt.compare(
     credentials.password,
     user.password
    );

    if (!isCorrectPassword) {
     const attempts = (user.loginAttempts || 0) + 1;
     const isLocking = attempts >= 5;

     try {
      await prisma.user.update({
       where: { id: user.id },
       data: {
        loginAttempts: attempts,
        lockUntil: isLocking ? new Date(Date.now() + 15 * 60000) : null
       } as any
      });
     } catch (e) {
      console.error("Failed to update login attempts:", e);
     }

     if (isLocking) {
      throw new Error("Слишком много неудачных попыток. Аккаунт заблокирован на 15 минут.");
     }
     throw new Error("Неверный пароль");
    }

    try {
     await prisma.user.update({
      where: { id: user.id },
      data: {
       loginAttempts: 0,
       lockUntil: null
      } as any
     });
    } catch (e) {
     console.error("Failed to reset login attempts:", e);
    }

    return {
     ...user,
     role: user.role || (user.email === adminEmailFromEnv ? "ADMIN" : "USER"),
     twoFactorEnabled: user.twoFactorEnabled || false,
    };
   },
  }),
 ],
 session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60,
 },
 secret: process.env.NEXTAUTH_SECRET,
 pages: {
  signIn: "/admin/login",
 },
 callbacks: {
  async jwt({ token, user, trigger, session }) {
   if (user) {
    token.role = (user as any).role;
    token.twoFactorEnabled = (user as any).twoFactorEnabled;
   }

   // Support dynamic updates (e.g. after enabling 2FA)
   if (trigger === "update" && session) {
    token.role = session.role ?? token.role;
    token.twoFactorEnabled = session.twoFactorEnabled ?? token.twoFactorEnabled;
   }

   return token;
  },
  async session({ session, token }) {
   if (session.user) {
    (session.user as any).id = token.sub;
    (session.user as any).role = token.role;
    (session.user as any).twoFactorEnabled = token.twoFactorEnabled;
   }
   return session;
  },
 },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
