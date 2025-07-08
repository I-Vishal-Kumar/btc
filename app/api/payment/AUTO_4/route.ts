import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleDeposit } from "@/(backend)/services/admin.service.serve";
import { db_schema, TransactionStatusType } from "@/__types__/db.types";
import { CONNECT } from "@/lib/_db/db.config";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// parsed body {
//   status: 'credit',
//   amount: '100',
//   client_id: 'c73032e3cb853586e572bbc4782997f7',
//   order_id: '174',
//   utr: '555565020384'
// }

export async function GET(request: NextRequest) {
    
    const params = request.nextUrl.searchParams;
    // const params = new URLSearchParams(rawBody);
    const parsedBody = Object.fromEntries(params.entries()); // ✅ Correctly extract key-value pairs

    console.log('parsed body', parsedBody);
    
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        
        // Validate the request body
        if (parsedBody.status !== 'credit') throw new Error("Transaction Failed");

        // Connect to DB
        await CONNECT();
        const [userWithTransaction] = await TRANSACTION.aggregate([
            {
                $match : {
                    TransactionID : parsedBody.client_id,
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
            TransactionID : parsedBody.utr
        });

        if (!valid) {
            throw new Error(`Settlement failed: ${msg} data ${data}`);
        }

        return new NextResponse('success', { status: 200 });

    } catch (error: any) {
        console.error("RMS_1 Error:", error.message, error, parsedBody, params);
        
        return new NextResponse(`Error: ${error.message}`, { status: 400 });
    }
};
