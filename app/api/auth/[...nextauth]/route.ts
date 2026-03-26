import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { verifyOtp } from "@/lib/otp-store";

// Normalize Russian phone to 7XXXXXXXXXX
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) return '7' + digits.slice(1);
  if (digits.length === 10 && digits.startsWith('9')) return '7' + digits;
  return digits;
}

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

  // ── Legacy credentials (admin only) ─────────────────────
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

  // ── Phone OTP Provider ──────────────────────────────────
  // Flow: user enters phone → receives SMS code → enters code here
  // Works for both new and returning users (phone = unique identifier)
  CredentialsProvider({
   id: 'phone-otp',
   name: 'Phone OTP',
   credentials: {
    phone: { label: 'Phone', type: 'text' },
    code:  { label: 'Code',  type: 'text' },
    name:  { label: 'Name',  type: 'text' },
   },
   async authorize(credentials) {
    if (!credentials?.phone || !credentials?.code) {
     throw new Error('Укажите номер и код');
    }

    const phone = normalizePhone(credentials.phone);
    const result = verifyOtp(phone, credentials.code);

    if (!result.ok) {
     const msgs: Record<string, string> = {
      not_found:       'Код не найден. Запросите новый.',
      expired:         'Код устарел. Запросите новый.',
      incorrect:       'Неверный код',
      too_many_attempts: 'Слишком много попыток. Запросите новый код.',
     };
     throw new Error(msgs[result.reason] || 'Ошибка подтверждения');
    }

    // OTP valid — find or create user in the database
    const syntheticEmail = `${phone}@sms.local`;
    let user;

    try {
     user = await prisma.user.findUnique({
      where: { email: syntheticEmail }
     });

     if (!user) {
      user = await prisma.user.create({
       data: {
        email: syntheticEmail,
        name: credentials?.name?.trim() || phone,
        role: 'USER'
       }
      });
     }
    } catch (e) {
     console.error("Database error creating OTP user:", e);
     // Fallback to in-memory pseudo-user if DB is completely down
     user = {
      id: `fallback:${phone}`,
      email: syntheticEmail,
      name: credentials?.name?.trim() || phone,
      role: 'USER'
     };
    }

    return {
     id: user.id,
     phone,
     name: user.name,
     email: user.email,
     role: user.role,
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
    token.role = (user as any).role ?? 'USER';
    token.twoFactorEnabled = (user as any).twoFactorEnabled ?? false;
    // ← forward phone for OTP-authenticated users
    if ((user as any).phone) {
     token.phone = (user as any).phone;
    }
   }

   // Support dynamic updates (e.g. profile edits, 2FA toggle)
   if (trigger === "update" && session) {
    if (session.role  !== undefined) token.role  = session.role;
    if (session.twoFactorEnabled !== undefined) token.twoFactorEnabled = session.twoFactorEnabled;
    if (session.phone !== undefined) token.phone = session.phone;
    if (session.name  !== undefined) token.name  = session.name;
   }

   return token;
  },
  async session({ session, token }) {
   if (session.user) {
    (session.user as any).id   = token.sub;
    (session.user as any).role = token.role ?? 'USER';
    (session.user as any).twoFactorEnabled = token.twoFactorEnabled ?? false;
    // ← expose phone in session for components that need it
    if (token.phone) {
     (session.user as any).phone = token.phone;
     // Use phone as display name if no real name is set
     if (!session.user.name || session.user.name === token.phone) {
      session.user.name = String(token.phone);
     }
    }
   }
   return session;
  },
 },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
