"use server"

import { cookies } from "next/headers"

export async function verifySitePassword(password: string) {
 const masterPassword = process.env.SITE_PASSWORD?.trim()

 if (!masterPassword) {
  console.error("[site-access] SITE_PASSWORD env variable is not set")
  return { success: false, error: "Сервис временно недоступен" }
 }

 if (password.trim() !== masterPassword) {
  return { success: false, error: "Неверный пароль" }
 }

 const cookieStore = await cookies()

 cookieStore.set("smusl_site_access", "granted", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
 })

 return { success: true }
}
