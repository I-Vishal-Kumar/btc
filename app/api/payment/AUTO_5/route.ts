// Type for RS Pay notification body

import { TRANSACTION } from '@/(backend)/(modals)/schema/transaction.schema';
import { ad_settleDeposit } from '@/(backend)/services/admin.service.serve';
import { TransactionStatusType } from '@/__types__/db.types';
import { TransactionObjType } from '@/__types__/transaction.types';
import { generateLGPaySign } from '@/lib/helpers/handleAutoWithdraw4';
// Function to create SHA256 signature
import { NextRequest, NextResponse } from 'next/server';

// Next.js POST route
export const POST = async (req: NextRequest) => {
    try {
        console.log(req.body);
        // Parse form-urlencoded body
        const formData = await req.formData();
        const body: Record<string, string> = {};
        formData.forEach((value, key) => {
            body[key] = value.toString();
        });

        console.log("[LG PAY PAY-IN CALLBACK]", body);

        const { sign, ...dataWithoutSign } = body;
        const expectedSign = generateLGPaySign(dataWithoutSign);

        if (sign !== expectedSign) {
            console.error("Invalid signature in LG Pay notify", { received: sign, expected: expectedSign });
            return new NextResponse("Invalid signature", { status: 400 });
        }

        // Find the transaction
        const existingTransaction = await TRANSACTION.findOne({
            TransactionID: body.order_sn,
        }).lean();

        if (!existingTransaction) {
            console.error("No transaction found for order_sn:", body.order_sn);
            // still return 'ok' to stop retries
            return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
        }

        const status = Number(body.status) === 1
            ? TransactionStatusType.SUCCESS
            : TransactionStatusType.FAILED;

        const { valid, data, msg } = await ad_settleDeposit({
            ...existingTransaction,
            Status: status,
        } as unknown as TransactionObjType);

        if (!valid) {
            console.error("[Failed to settle deposit]", data, msg, body);
            // still return 'ok' to prevent retries
            return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
        }

        // Respond with plain text "ok"
        return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });

    } catch (err) {
        console.error("Error in LG Pay Pay-In callback:", err);
        return new NextResponse("ok", { status: 200, headers: { "Content-Type": "text/plain" } });
    }
};

