// Type for RS Pay notification body
type RSPayNotificationBody = {
    merchantId: string;
    merchantOrderId: string;
    orderId: string;
    state: 1 | 2 | 3 | 4;
    amount: number;
    factAmount: number;
    paymentCurrency: string;
    ext: string;
    utr?: string;
    failReason?: string | null;
    sign: string;
};

const RS_PAY_KEY = process.env.RS_PAY_REQUEST_TOKEN!; // Your secret key

import { TRANSACTION } from '@/(backend)/(modals)/schema/transaction.schema';
import { ad_settleDeposit } from '@/(backend)/services/admin.service.serve';
import { CREATE_TRANSACTION } from '@/(backend)/services/transaction.service.serve';
import { db_schema, GatewayTypes, TransactionStatusType } from '@/__types__/db.types';
import { CONNECT } from '@/lib/_db/db.config';
// Function to create SHA256 signature
import crypto from 'crypto';
import { NextResponse } from 'next/server';

function generateSignature(body: Omit<RSPayNotificationBody, "sign">, key: string) {
    // Get all keys except 'sign', sort ASCII ascending
    const sortedKeys = Object.keys(body).sort();
    const str = sortedKeys
        .filter(k => body[k as keyof typeof body] !== undefined && body[k as keyof typeof body] !== null && body[k as keyof typeof body] !== "")
        .map(k => `${k}=${body[k as keyof typeof body]}`)
        .join('&');
    // Append key
    const stringToSign = `${str}&key=${key}`;
    return crypto.createHash('sha256').update(stringToSign).digest('hex');
}

// Next.js POST route
export const POST = async (req: Request) => {
    try {
        const body: RSPayNotificationBody = await req.json();

        // Extract signature from body
        const { sign, ...dataWithoutSign } = body;
        console.log('[AUTO 5] ', dataWithoutSign)
        // Generate expected signature
        const expectedSign = generateSignature(dataWithoutSign, RS_PAY_KEY);

        if (sign.toLowerCase() !== expectedSign.toLowerCase()) {
            return new Response("Invalid signature", { status: 400 });
        }
        
        await CONNECT();
        await CREATE_TRANSACTION(Number(dataWithoutSign.amount), dataWithoutSign.merchantOrderId, GatewayTypes.RMS_2)
        
        // Handle payment based on state
        if (Number(body.state) !== 1) {
            console.log(
                `[${new Date().toISOString()}] Payment not successful. State: ${body.state}, Response:`,
                body
            );

            // Optionally, update the transaction status to FAILURE
            await TRANSACTION.updateOne(
                { TransactionID: dataWithoutSign.merchantOrderId },
                { $set: { Status: TransactionStatusType.FAILED } }
            );

            // Still return 'success' to RS Pay to stop retries
            return new NextResponse('success', { status: 200 });
        }

        // Payment is successful, process normally
        console.log(`[${new Date().toISOString()}] Payment successful:`, body);

   
        const [userWithTransaction] = await TRANSACTION.aggregate([
            {
                $match : {
                    TransactionID : dataWithoutSign.merchantOrderId,
                }
            },
            {
                $lookup : {
                    localField : 'PhoneNumber',
                    foreignField : 'PhoneNumber',
                    from : db_schema.USERS,
                    as : 'userInfo',
                }
            },
            {
                $unwind : {
                    path : '$userInfo'
                }
            }
        ]);
        
        const userInfo = userWithTransaction.userInfo;
        delete userWithTransaction.userInfo;

        const transaction = JSON.parse(JSON.stringify(userWithTransaction));

        if (!userInfo || !transaction) throw new Error("Tampered request body");

        const { valid, data, msg } = await ad_settleDeposit({
            ...transaction,
            Status : TransactionStatusType.SUCCESS,
        });

        if (!valid) {
            throw new Error(`Settlement failed: ${msg} data ${data}`);
        }

        return new NextResponse('success', { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
    }
};
