import { NextRequest, NextResponse } from "next/server";
import { VerifyToken } from '@/lib/auth/verifyToken'
import { LRUCache } from 'lru-cache'

const rateLimitCache = new LRUCache<string, number>({
  max: 500, // Maximum number of IPs to track
  ttl: 60 * 1000, // 1 minute window
})

export async function middleware(req: NextRequest) {

  const { pathname } = req.nextUrl;

  // Rate Limiting Logic
  const ip = (req as any).ip || req.headers.get('x-forwarded-for') || 'unknown';
  const limit = 100; // Requests per minute

  // Simplest usage for lru-cache v7+:
  const currentUsage = rateLimitCache.get(ip) || 0;

  if (currentUsage >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  if (ip !== 'unknown') {
    rateLimitCache.set(ip, currentUsage + 1);
  }

  // check for public path
  const isPublic = pathname.startsWith("/nimda__") || pathname === 'terms-condition';

  if (isPublic) return NextResponse.next();

  const token = req?.cookies?.get("token")?.value || "";

  if (!token) {
    if (pathname.startsWith("/getting-started")) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/getting-started", req.nextUrl));
    }
  }

  try {

    const isValidToken = await VerifyToken(token);

    if (!isValidToken.success) {
      return NextResponse.redirect(new URL("/getting-started", req.nextUrl));
    }

  } catch {
    return NextResponse.redirect(new URL("/getting-started", req.nextUrl));
  }

  return NextResponse.next();

}

export const config = {
  matcher: [
    '/',
  ],
};
