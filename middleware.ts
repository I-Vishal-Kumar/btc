import { NextRequest, NextResponse } from "next/server";
import { VerifyToken } from "@/lib/auth/verifyToken";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("token")?.value || "";

  // 1. If token exists, verify it
  let isAuthenticated = false;
  if (token) {
    try {
      const result = await VerifyToken(token);
      if (result?.success) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 2. Handle /getting-started logic
  if (pathname.startsWith("/getting-started")) {
    // If user is logged in, redirect them to home
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    // Otherwise, let unauthenticated users see the page
    return NextResponse.next();
  }

  // 3. Define other public routes
  const isPublic =
    pathname.startsWith("/nimda__") || pathname === "/terms-condition" || pathname.startsWith("/super_admin");

  if (isPublic) {
    return NextResponse.next();
  }

  // 4. All other routes require auth
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/getting-started", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|.*\\..*).*)",
  ],
};
