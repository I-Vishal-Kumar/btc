import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest) => {
    try {
        
        const bodyText = await req.text();

        const params = new URLSearchParams(bodyText);
        const body: Record<string, string> = {};
        for (const [key, value] of params.entries()) {
        body[key] = value;
        }

        console.log("[PAY2ALL CALLBACK RECEIVED]", body);

        // Find transaction by client_id
        const existingTransaction = await TRANSACTION.findOne({
            TransactionID: body.client_id,
        }).lean();

        if (!existingTransaction) {
            console.error("No transaction found for client_id:", body.client_id);
            return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
        }

        const status =
            Number(body.status_id) === 1
                ? TransactionStatusType.SUCCESS
                : TransactionStatusType.FAILED;

        const { valid, data, msg } = await ad_settleWithdrawal({
            ...existingTransaction,
            Status: status,
            UTR: body.utr,
            Amount: body.amount,
            ProviderID: body.provider_id,
            ReportID: body.report_id,
        } as unknown as TransactionObjType);

        if (!valid) {
        console.error("[Failed to settle Pay2All withdrawal]", data, msg, body);
        // Still respond OK so Pay2All doesn’t retry
        return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
        }

        return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });

    } catch (error) {
        console.error("Error in Pay2All callback handler:", error);
        return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });

    }
};
