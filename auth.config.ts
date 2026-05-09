import type { NextAuthConfig } from "next-auth";

export const authConfig = {
 providers: [],
 pages: {
  signIn: "/admin/login",
 },
 session: { strategy: "jwt" },
 callbacks: {
  async jwt({ token, user, trigger, session }) {
   if (user) {
    token.role = user.role ?? "USER";
    token.twoFactorEnabled = user.twoFactorEnabled ?? false;
    if (user.phone) token.phone = user.phone;
   }
   if (trigger === "update" && session) {
     const allowed = ["name", "email", "phone"] as const;
     for (const key of allowed) {
      if (key in session) {
       (token as Record<string, unknown>)[key] = (session as Record<string, unknown>)[key];
      }
     }
    }
   return token;
  },
  async session({ session, token }) {
   if (session.user) {
    session.user.id = token.sub as string;
    session.user.role = (token.role as string) ?? "USER";
    session.user.twoFactorEnabled = (token.twoFactorEnabled as boolean) ?? false;
    if (token.phone) {
     session.user.phone = token.phone as string;
     if (!session.user.name || session.user.name === token.phone) {
      session.user.name = String(token.phone);
     }
    }
   }
   return session;
  },
 },
} satisfies NextAuthConfig;
