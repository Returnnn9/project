import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      twoFactorEnabled: boolean
      phone?: string
    } & DefaultSession["user"]
    role?: string
    twoFactorEnabled?: boolean
    phone?: string
    name?: string | null
  }

  interface User extends DefaultUser {
    id: string
    role?: string
    twoFactorEnabled?: boolean
    phone?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string
    role?: string
    twoFactorEnabled?: boolean
    phone?: string
  }
}
