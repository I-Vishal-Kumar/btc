import { NextRequest, NextResponse } from "next/server";
import { VerifyToken } from '@/lib/auth/verifyToken'


export async function middleware(req: NextRequest) {

    const { pathname } = req.nextUrl;

    // check for public path
    const isPublic = pathname.startsWith("/nimda__") || pathname === 'terms-condition';

    if (isPublic) return NextResponse.next();

    const token = req?.cookies?.get("token")?.value || "";

    if(!token){
      if(pathname.startsWith("/getting-started")){
        return NextResponse.next();
      }else{
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

    if(pathname.includes('getting-started')){
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }

    return NextResponse.next();

}

export const config = {
    matcher: [
    '/((?!api|_next|favicon.ico|.*\\..*).*)',
  ],
};
