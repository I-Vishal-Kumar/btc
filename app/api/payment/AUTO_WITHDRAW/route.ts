// import { handleAutoWithdraw2 } from "@/lib/helpers/handleAuthWithdraw2";
import { handleAutoWithdraw3 } from "@/lib/helpers/handleAutoWithdraw3";
// import { handleAutoWithdraw4 } from "@/lib/helpers/handleAutoWithdraw4";
// import { handleAutoWithdraw4 } from "@/lib/helpers/handleAutoWithdraw4";
// import { handleAutoWithdraw } from "@/lib/helpers/handleAutoWithdraw";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    try {
        const result = await handleAutoWithdraw3(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error [processing payout]:", error, body);
        return NextResponse.json({
            valid: false,
            msg: "Internal server error",
        });
    }
}
