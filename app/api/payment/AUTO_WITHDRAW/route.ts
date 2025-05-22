import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
// import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType, TransactionType } from "@/__types__/db.types";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


async function getAuthorization () {
    try {
        const formdata = new FormData();
        formdata.append("email", "dm894554@gmail.com");
        formdata.append("password", "YFYjUq");
        const res = await axios.postForm('https://erp.pay2all.in/api/token', formdata);
        if(!res.data?.token){
            return null;
        }
        if(res.data?.balance?.user_balance <= 0){
            console.log(`[getAuthorization] Low wallet ballance`, res.data);
        }
        return res.data.token;
    } catch (error) {
        console.log('[getAuthorization]', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body
        if (!body || !body.payout) {
            return NextResponse.json({ valid: false, msg: "Invalid request data" });
        }

        if (body.editedData) {
            const { PhoneNumber, TransactionID } = body.editedData;

            // Validate necessary fields in editedData
            if (!PhoneNumber || !TransactionID) {
                return NextResponse.json({ valid: false, msg: "Missing required transaction details" });
            }

            // Check if the transaction exists and is pending
            const transaction = await TRANSACTION.findOne({
                PhoneNumber,
                Type: TransactionType.WITHDRAWAL,
                TransactionID,
                Status: TransactionStatusType.PENDING,
            });

            if (!transaction) {
                return NextResponse.json({ valid: false, msg: "Transaction not found or already processed" });
            }
        }

       
        const formdata = new FormData();
        
        formdata.append("mobile_number", body.payout.BeneMobile);
        formdata.append("amount", body.payout.Amount);
        formdata.append("beneficiary_name", body.payout.BeneName);
        formdata.append("account_number", body.payout.AccountNo);
        formdata.append("ifsc", body.payout.IFSC);
        formdata.append("channel_id", "2");
        formdata.append("client_id", body.payout.APIRequestID);
        formdata.append("provider_id", '143');
 
        // get access token;
        const token = getAuthorization();

        if(!token) throw new Error('[AUTO WITHDRAWAL] Invalid access token')
        
        // Perform API request
        const response = await axios.postForm("https://erp.pay2all.in/v1/payout/transfer", formdata, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        console.log(response);

        // const responseJson = response.data;

        // Handle API response
        // if (responseJson.statuscode !== 1) {
        //     return NextResponse.json({ valid: false, msg: responseJson });
        // }

        // // Handle success scenario without editedData
        // if (!body.editedData) {
        //     return NextResponse.json({ msg: "Success", valid: true });
        // }

        // // Handle success with settlement update
        // if (responseJson.opening > responseJson.closing) {
        //     const { msg, valid } = await ad_settleWithdrawal(body.editedData);

        //     if (!valid) {
        //         console.error("Settlement update failed:", msg, body.editedData);
        //         return NextResponse.json({ valid: false, msg: "Amount debited but failed to update transaction." });
        //     }

        //     return NextResponse.json({ valid: true, msg: "Withdrawal successful" });
        // }

        return NextResponse.json({ valid: false, msg: "Unknown response state" });

    } catch (error) {
        console.error("Error processing payout:", error);
        return NextResponse.json({ valid: false, msg: "Internal server error" });
    }
}

