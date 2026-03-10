import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
 function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.nextauth.token;
  const is2faEnabled = token?.twoFactorEnabled;
  const is2faVerified = req.cookies.has("admin_2fa_verified");

  // If accessing admin area (but not the verify-2fa page)
  // Note: /admin/login is now handled by the authorized callback to allow access
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/verify-2fa")) {
   // Check role
   if (token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
   }

   // Check 2FA if enabled
   if (is2faEnabled && !is2faVerified) {
    return NextResponse.redirect(new URL("/admin/verify-2fa", req.url));
   }
  }

  return NextResponse.next();
 },
 {
  callbacks: {
   authorized: ({ token, req }) => {
    const { pathname } = req.nextUrl;
    // Always allow access to login page
    if (pathname === "/admin/login") return true;
    // Otherwise require a token
    return !!token;
   },
  },
 }
);

export const config = {
 matcher: ["/admin/:path*"],
};
