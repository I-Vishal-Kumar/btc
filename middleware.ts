import { NextRequest, NextResponse } from "next/server";
import { VerifyToken } from "@/lib/auth/verifyToken";

export async function middleware(req: NextRequest) {
    const { pathname, href } = req.nextUrl;
    console.log(pathname, href);

    // Allow public paths or a test phoneNumber ID bypass
    const isPublic =
        pathname === "/maintainance" ||
        pathname.startsWith("/nimda__") ||
        pathname === "/terms-condition" ||
        href.includes("111111111");
    if (isPublic) return NextResponse.next();

    const token = req.cookies.get("token")?.value || "";

    // Allow /maintainance page even without token
    if (!token) {
        if (pathname.startsWith("/maintainance")) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/maintainance", req.nextUrl));
    }

    try {
        const isValidToken = await VerifyToken(token);

        if (
            !isValidToken.success ||
            !isValidToken.decoded ||
            isValidToken.decoded.PhoneNumber !== "1111111111"
        ) {
            return NextResponse.redirect(new URL("/maintainance", req.nextUrl));
        }

        return NextResponse.next(); // Allow only if token is valid and phone number matches
    } catch (err) {
        console.log(err);
        return NextResponse.redirect(new URL("/maintainance", req.nextUrl));
    }
}
export const config = {
    matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
