// import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
// import { USER } from "@/(backend)/(modals)/schema/user.schema";
// import { ad_settleDeposit } from "@/(backend)/services/admin.service.serve";
// import { TransactionStatusType, TransactionType } from "@/__types__/db.types";
// import { TransactionObjType } from "@/__types__/transaction.types";
// import { CONNECT } from "@/lib/_db/db.config";
// import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


// type body = {
//     txnStatus: 'success' | 'failure',
//     orderId: string,
//     utr: string,
// }

export async function POST(request: NextRequest) {
    // const session = await mongoose.startSession();
    // session.startTransaction();
    const rawBody = await request.text();
    console.log('rawbody', rawBody, typeof rawBody);
    const params = new URLSearchParams(rawBody);
    const parsedBody = Object.fromEntries(params.entries()); // ✅ Correctly extract key-value pairs
    console.log('parsed body', parsedBody);
    return new NextResponse('success', { status: 200 });
        
    // const body : body = {
    //     txnStatus: parsedBody['status'] as 'success' | 'failure',  
    //     orderId: parsedBody["client_id"],
    //     utr: parsedBody["payid"],
    // };

    // try {
        
    //     // Validate the request body
    //     if (body.txnStatus !== 'success') throw new Error("Transaction Failed");

    //     // Connect to DB
    //     await CONNECT();
    //     const user = await USER.findOne({ PhoneNumber: body.orderId });

    //     if (!user) throw new Error("Tampered request body");

    //     // Create the transaction entry
    //     const transaction : TransactionObjType[] = await TRANSACTION.create(
    //         [
    //             {
    //                 PhoneNumber: body.result.customer_mobile,
    //                 Parent : user.Parent,
    //                 InvitationCode: user.InvitationCode,
    //                 Amount: amount,
    //                 Method: 'AUTO_2',
    //                 Type: TransactionType.DEPOSIT,
    //                 Status: TransactionStatusType.SUCCESS,
    //                 OrderId: body.orderId,
    //                 TransactionID: body.utr,
    //             }
    //         ],
    //         { session }
    //     );

    //     if (!transaction || transaction.length === 0) {
    //         throw new Error("Transaction creation failed");
    //     }

    //     await session.commitTransaction();
    //     session.endSession();

    //     const { valid, data, msg } = await ad_settleDeposit(transaction[0]);

    //     if (!valid) {
    //         throw new Error(`Settlement failed: ${msg} data ${data}`);
    //     }

    //     return new NextResponse('success', { status: 200 });

    // } catch (error: any) {
    //     console.error("AUTO_2 Error:", error.message, error, body);
    //     if(session.inTransaction()){
    //         await session.abortTransaction();
    //         session.endSession();
    //     }
        
    //     return new NextResponse(`Error: ${error.message}`, { status: 400 });
    // }finally{
    //     await session.endSession();
    // }
};
