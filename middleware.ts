import { NextRequest, NextResponse } from "next/server";
import { VerifyToken } from '@/lib/auth/verifyToken'

const RATE_LIMIT = 50; // MAX  request per time frame;
const TIME_FRAME = 60 * 1000; // time frame in seconds ( 1 MINUTE )

const ipRequests = new Map<string, { count: number; timestamp: number }>();


export async function middleware(req: NextRequest) {

    const { pathname } = req.nextUrl;

    // check for public path
    const isPublic = pathname.startsWith("/getting-started") || pathname.startsWith("/nimda__");

    if (isPublic) return NextResponse.next();

    // =============== add rate limiter.

      // clear the table if more than 400 records are present.
      if(ipRequests.size > 400) ipRequests.clear();

      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]|| "unknown";
      console.log(ip);
      if(ip !== 'unknown'){
        
        const currTime = Date.now();
        const reqInfo = ipRequests.get(ip);
        
        if(!reqInfo){
          ipRequests.set(ip, { count: 1, timestamp: currTime });
        } else {
          if(currTime - reqInfo.timestamp < TIME_FRAME){
              if(reqInfo.count >= RATE_LIMIT){
                return new NextResponse("Too many requests", { status: 429});
              }
              reqInfo.count++;
          }else{
            ipRequests.set(ip, {count: 1, timestamp: currTime});
          }
        }
      }
    // =====================================

    // verify token for authenticated routes.
    const token = req?.cookies?.get("token")?.value || "";
    
    if (!token) return NextResponse.redirect(new URL("/getting-started", req.nextUrl));
    
    try {
      
      const isValidToken = await VerifyToken(token);
      
      if (!isValidToken.success) {
        return NextResponse.redirect(new URL("/getting-started", req.nextUrl));
      }
      
    } catch (error) {
        return NextResponse.redirect(new URL("/getting-started", req.nextUrl));  
    }
    return NextResponse.next();

}

export const config = {
  matcher: [
    "/"
  ],
};
