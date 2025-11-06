import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import { NextRequest, NextResponse } from "next/server";
type Params = {
    payid: string;
    client_id: string;
    operator_ref: string;
    status: "success" | "failure";
};

export const GET = async (req: NextRequest) => {
    const params = {} as Params;

    try {
        const availableParams = req.nextUrl.searchParams.entries();
        for (const [key, value] of availableParams) {
            // @ts-expect-error dont know why but i did this.
            params[key as keyof Params] = value;
        }
    }catch(err){
        console.log(err);
    }
};

export const POST = async (req: NextRequest) => {
    try {
        const bodyText = await req.text();
        const params = new URLSearchParams(bodyText);

        console.log("[Processing pending request POST] ", params);
        console.log("\n Body [PAY2ALL POST] ");
        console.dir(req.body, {colors: true, depth: null})
        
        // convert params to an object
        const rawData: Record<string, any> = {};
        params.forEach((value, key) => {
            rawData[key] = value;
        });

        // so parse it properly
        const parsedData = {
            status: rawData.status,
            payouts: JSON.parse(rawData.payouts),
        };
        console.log("POST request", parsedData);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("[handle pending withdrawal]", error);
        return NextResponse.json({ success: false });
    }
};
