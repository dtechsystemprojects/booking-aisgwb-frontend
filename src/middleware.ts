import { NextRequest, NextResponse } from "next/server";

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for HTTP-only or client-side token cookie
  const token = req.cookies.get("token")?.value;

  let isAuthenticated = false;

  if (token && token !== "undefined" && token !== "null") {
    try {
      const decoded: any = decodeJwtPayload(token);
      if (decoded && typeof decoded === "object") {
        const now = Math.floor(Date.now() / 1000);
        if (!decoded.exp || decoded.exp > now) {
          isAuthenticated = true;
        }
      } else if (token.length > 10) {
        isAuthenticated = true;
      }
    } catch {
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
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (isAuthenticated && isFrontendUser) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protected frontend routes: /profile
  if (pathname.startsWith("/profile")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Auth pages check: if already authenticated, redirect away from admin login pages
  if (isAuthenticated && (pathname.startsWith("/auth") || pathname === "/sign-in" || pathname === "/sign-up")) {
    if (isFrontendUser) {
      return NextResponse.redirect(new URL("/profile", req.url));
    } else {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  // Frontend login/register pages check: if authenticated, redirect to /profile
  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
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
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/profile/:path*",
    "/profile",
    "/sign-in",
    "/sign-up",
    "/login",
    "/register",
    "/",
  ],
};
