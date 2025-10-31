import { ADMIN_CONFIG } from "@/(backend)/(modals)/schema/adminConfig.schema";
import { WithdrawalTypes } from "@/__types__/db.types";
import { handleAutoWithdraw3 } from "@/lib/helpers/handleAutoWithdraw3";
import { handleAutoWithdraw4 } from "@/lib/helpers/handleAutoWithdraw4";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    try {
        const { AutoWithdraw } = await ADMIN_CONFIG.findOne(
            {},
            { AutoWithdraw: 1, _id: 0 },
            );
        let res;
        switch (AutoWithdraw) {
            case WithdrawalTypes.RMS :
                res = await handleAutoWithdraw3({
                    ...body
                });
                break;
            case WithdrawalTypes.LG_PAY:
                res = await handleAutoWithdraw4(body);
                break;
            default:
            res = {valid: false}
            console.log('invalid withdrawal gateway ', AutoWithdraw);
        }
        return NextResponse.json(res);
    } catch (error) {
        console.error("Error [processing payout]:", error, body);
        return NextResponse.json({
            valid: false,
            msg: "Internal server error",
        });
    }
}
