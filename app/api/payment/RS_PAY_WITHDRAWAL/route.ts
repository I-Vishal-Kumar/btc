import { NextRequest, NextResponse } from "next/server";
import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import { createHash } from "crypto";

// ─────────────────────────────────────────────
// Utility: generate SHA256 sign (RS Pay rule)
// ─────────────────────────────────────────────
function generateRSPaySign(params: Record<string, any>, secretKey: string) {
    const filtered = Object.entries(params)
        .filter(([k, v]) => k !== "sign" && k !== "key" && v !== null && v !== "")
        .sort(([a], [b]) => (a > b ? 1 : -1));

    const stringA = filtered.map(([k, v]) => `${ k }=${ v }`).join("&");
    const signStr = `${ stringA }&key=${ secretKey }`;
    return createHash("sha256").update(signStr, "utf8").digest("hex").toLowerCase();
}

// ─────────────────────────────────────────────
// RS Pay payout notification handler
// ─────────────────────────────────────────────
export const POST = async (req: NextRequest) => {
    try {
        const secret = process.env.NEXT_PUBLIC_RSPAY_SECRET_KEY!;
        const body = await req.json();

        console.log("[RS PAY WITHDRAW CALLBACK]", body);

        const { sign, ...dataWithoutSign } = body;
        const expectedSign = generateRSPaySign(dataWithoutSign, secret);

        if (sign !== expectedSign) {
            console.error("Invalid RS Pay sign", { received: sign, expected: expectedSign });
            return new NextResponse("Invalid signature", { status: 400 });
        }

        const transactionId = body.merchantOrderId;
        if (!transactionId) {
            console.error("Missing merchantOrderId in RS Pay callback");
            return new NextResponse("ok", { status: 200 });
        }

        const existingTransaction = await TRANSACTION.findOne({
            TransactionID: transactionId,
        }).lean();

        if (!existingTransaction) {
            console.error("Transaction not found for:", transactionId);
            return new NextResponse("ok", { status: 200 });
        }

        // Determine payout status
        let status: TransactionStatusType;
        if (String(body.state) === "1" || String(body.state) === "2") {
            // 2 = processing → treat as success acknowledged
            status = TransactionStatusType.SUCCESS;
        } else {
            status = TransactionStatusType.FAILED;
        }

        const { valid, msg } = await ad_settleWithdrawal({
            ...existingTransaction,
            Status: status,
        } as unknown as TransactionObjType);

        if (!valid) {
            console.error("[RS Pay Withdrawal Settlement Failed]", msg, body);
        }

        // Always respond "ok" so RS Pay doesn’t retry
        return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    } catch (err) {
        console.error("Error in RS Pay withdrawal callback:", err);
        return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }
};
