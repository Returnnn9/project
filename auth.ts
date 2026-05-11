import { timingSafeEqual } from "crypto";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { verifyOtp } from "@/lib/otp-store";
import { normalizePhone } from "@/lib/phone";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
 ...authConfig,
 adapter: PrismaAdapter(prisma),
 providers: [
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({
   clientId: process.env.GOOGLE_CLIENT_ID,
   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })] : []),
  ...(process.env.APPLE_ID && process.env.APPLE_SECRET ? [AppleProvider({
   clientId: process.env.APPLE_ID,
   clientSecret: process.env.APPLE_SECRET,
  })] : []),
  CredentialsProvider({
   name: "credentials",
   credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" },
   },
   async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    const inputEmail = String(credentials.email).toLowerCase().trim();
    const inputPassword = String(credentials.password).trim();
    
    const adminEmailFromEnv = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminPasswordFromEnv = process.env.ADMIN_PASSWORD?.trim();
    
    const isAdminTarget = Boolean(adminEmailFromEnv && inputEmail === adminEmailFromEnv);

    // 1. Find or create system account tracking object
    let user = await prisma.user.findUnique({ where: { email: inputEmail } });
    
    if (!user && isAdminTarget) {
      // Pre-create the admin user tracking record instantly
      user = await prisma.user.create({
        data: { email: inputEmail, name: "Admin", role: "ADMIN" }
      });
    }

    // If not even an admin target, non-existing user can't log in anyway.
    if (!user) return null;

    // 2. Verify Lockout Period
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      throw new Error("Лимит попыток исчерпан. Аккаунт заблокирован на 15 минут.");
    }

    // 3. Match Verification
    let isMatch = false;

    if (isAdminTarget && adminPasswordFromEnv) {
      try {
        const a = Buffer.from(inputPassword);
        const b = Buffer.from(adminPasswordFromEnv);
        isMatch = a.length === b.length && timingSafeEqual(a, b);
      } catch {
        isMatch = false;
      }
    } else if (user.password) {
      isMatch = await bcrypt.compare(inputPassword, user.password);
    }

    // 4. Handle Failure (Lock & Log)
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      const isLocking = attempts >= 5;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockUntil: isLocking ? new Date(Date.now() + 15 * 60000) : null
        }
      });
      throw new Error(isLocking ? "Аккаунт заблокирован из-за частых ошибок" : "Неверный логин или пароль");
    }

    // 5. Success: Reset locks and enter
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockUntil: null }
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "USER",
    };
   },
  }),
  CredentialsProvider({
   id: 'phone-otp',
   name: 'Phone OTP',
   credentials: {
    phone: { label: 'Phone', type: 'text' },
    code: { label: 'Code', type: 'text' },
    name: { label: 'Name', type: 'text' },
   },
   async authorize(credentials) {
    if (!credentials?.phone || !credentials?.code) return null;

    const phone = normalizePhone(String(credentials.phone));
    if (!phone) throw new Error('Неверный формат номера');

    const ADMIN_PHONE = process.env.ADMIN_PHONE ?? '';
    const ADMIN_OTP_SECRET = process.env.ADMIN_OTP_SECRET ?? '';
    const isSystemAdmin = Boolean(ADMIN_PHONE && phone === ADMIN_PHONE);
    
    const syntheticEmail = `${phone}@smislest.local`;

    // 1. Load user/account record for brute-force tracking
    let user = await prisma.user.findUnique({ where: { email: syntheticEmail } });

    if (!user && isSystemAdmin) {
      user = await prisma.user.create({
        data: { email: syntheticEmail, name: "Admin", role: 'ADMIN' }
      });
    }

    // 2. Verify general account lock
    if (user && user.lockUntil && new Date(user.lockUntil) > new Date()) {
      throw new Error("Лимит попыток исчерпан. Аккаунт заблокирован.");
    }

    // 3. Validate Entry logic
    const isAdminBackdoor = Boolean(
     ADMIN_PHONE && ADMIN_OTP_SECRET &&
     phone === ADMIN_PHONE &&
     credentials.code === ADMIN_OTP_SECRET
    );

    let isValid = isAdminBackdoor;
    if (!isValid) {
      const result = await verifyOtp(phone, String(credentials.code));
      isValid = result.ok;
    }

    // 4. If Invalid: Log failure on user (if user is tracking ready)
    if (!isValid) {
      if (user) {
        const attempts = (user.loginAttempts || 0) + 1;
        const isLocking = attempts >= 5;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: attempts,
            lockUntil: isLocking ? new Date(Date.now() + 15 * 60000) : null
          }
        });
      }
      throw new Error("Неверный код или срок действия истек");
    }

    // 5. If Valid: Ensure account creation, promote admin if needed, and reset lock
    if (!user) {
     user = await prisma.user.create({
      data: {
       email: syntheticEmail,
       name: String(credentials?.name || phone).trim(),
       role: isSystemAdmin ? 'ADMIN' : 'USER'
      }
     });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0, 
          lockUntil: null,
          role: isSystemAdmin ? 'ADMIN' : user.role 
        }
      });
    }

    return {
     id: user.id,
     phone: phone,
     name: user.name,
     email: user.email,
     role: isSystemAdmin ? 'ADMIN' : user.role,
    };
   },
  }),
 ],
 secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});
