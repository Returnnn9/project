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

    const user = await prisma.user.findUnique({
     where: { email: credentials.email },
    });

    if (!user || !user.password) {
     throw new Error("Invalid credentials");
    }

    const isCorrectPassword = await bcrypt.compare(
     credentials.password,
     user.password
    );

    if (!isCorrectPassword) {
     throw new Error("Invalid credentials");
    }

    return user;
   },
  }),
 ],
 session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
 },
 secret: process.env.NEXTAUTH_SECRET,
 pages: {
  signIn: "/",
 },
 callbacks: {
  async session({ session, token }) {
   if (session.user) {
    (session.user as any).id = token.sub;
   }
   return session;
  },
 },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
