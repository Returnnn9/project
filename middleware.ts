import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const token = req.auth;
  const is2faEnabled = token?.user?.twoFactorEnabled;
  const is2faVerified = req.cookies.has("admin_2fa_verified");
  


  const isAdminArea = pathname.startsWith("/admin");
  const isVerify2fa = pathname.startsWith("/admin/verify-2fa");
  const isLogin = pathname === "/admin/login";

  if (isAdminArea) {
    if (!token && !isLogin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    if (token) {
      if (token.user?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      if (isLogin) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      if (is2faEnabled && !is2faVerified && !isVerify2fa) {
        return NextResponse.redirect(new URL("/admin/verify-2fa", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
