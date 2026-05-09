import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      twoFactorEnabled: boolean
      phone?: string
    } & DefaultSession["user"]
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
