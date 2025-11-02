import { NextRequest, NextResponse } from "next/server";
import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleDeposit } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import { createHash } from "crypto";

// ─────────────────────────────────────────────
// RS Pay SHA-256 signature generator
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
// Next.js POST Route
// ─────────────────────────────────────────────
export const POST = async (req: NextRequest) => {
    try {
        const secret = 'rspay_token_1755057556340';
        const body = await req.json();

        console.log("[RS PAY DEPOSIT NOTIFY]", body);

        const { sign, ...dataWithoutSign } = body;
        const expectedSign = generateRSPaySign(dataWithoutSign, secret);

        if (sign !== expectedSign) {
            console.error("Invalid RS Pay signature", { received: sign, expected: expectedSign });
            return new NextResponse("Invalid signature", { status: 400 });
        }

        // Find existing transaction
        const existingTransaction = await TRANSACTION.findOne({
            TransactionID: body.merchantOrderId,
        }).lean();

        if (!existingTransaction) {
            console.error("Transaction not found:", body.merchantOrderId);
            // still return OK to stop retries
            return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
        }

        const status =
            String(body.state) === "1"
                ? TransactionStatusType.SUCCESS
                : TransactionStatusType.FAILED;

        const { valid, msg } = await ad_settleDeposit({
            ...existingTransaction,
            Status: status,
        } as unknown as TransactionObjType);

        if (!valid) {
            console.error("[RS Pay Deposit Settlement Failed]", msg, body);
            return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
        }

        console.log("[RS Pay Deposit Processed] ✅", body.merchantOrderId);
        return new NextResponse("success", { status: 200, headers: { "Content-Type": "text/plain" } });
    } catch (err) {
        console.error("Error in RS Pay Deposit callback:", err);
        // Always reply “ok” so RS Pay doesn’t retry endlessly
        return new NextResponse("failure", { status: 200, headers: { "Content-Type": "text/plain" } });
    }
};
