import { handleAutoWithdraw } from "@/lib/helpers/handleAutoWithdraw";
import { NextRequest, NextResponse } from "next/server";




export async function POST(request: NextRequest) {
    
    const body = await request.json();
    try {
        const result = await handleAutoWithdraw(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error [processing payout]:", error, body);
        return NextResponse.json({ valid: false, msg: "Internal server error" });
    }
}

