import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET || "secret-key-change-in-production-2026";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for HTTP-only or client-side token cookie
  const token = req.cookies.get("token")?.value;

  let isAuthenticated = false;

  if (token && token !== "undefined" && token !== "null") {
    try {
      const decoded: any = jwt.decode(token);
      if (decoded && typeof decoded === "object") {
        const now = Math.floor(Date.now() / 1000);
        if (!decoded.exp || decoded.exp > now) {
          isAuthenticated = true;
        }
      } else if (token.length > 10) {
        isAuthenticated = true;
      }
    } catch (err) {
      if (token.length > 10) {
        isAuthenticated = true;
      }
    }
  }
  // Check for frontend user status
  const userStr = req.cookies.get("user")?.value;
  let isFrontendUser = false;
  if (userStr) {
    try {
      const decodedUser = JSON.parse(decodeURIComponent(userStr));
      if (decodedUser?.isFrontEnd === true) {
        isFrontendUser = true;
      }
    } catch (e) {}
  }

  // Protected routes: /admin/:path*
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (isAuthenticated && isFrontendUser) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Auth pages check: if already authenticated, redirect away from admin login pages
  if (isAuthenticated && pathname.startsWith("/auth")) {
    if (isFrontendUser) {
      return NextResponse.redirect(new URL("/profile", req.url));
    } else {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }
  
  // Home page check
  if (pathname === "/") {
    if (isAuthenticated && !isFrontendUser) {
      // Redirect admins to dashboard when they hit the root url
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    // Frontend users and guests stay on the root landing page
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:path*", "/"],
};
