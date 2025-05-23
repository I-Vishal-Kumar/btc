import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType, TransactionType } from "@/__types__/db.types";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


async function getAuthorization () {
    try {
        const formdata = new FormData();
        formdata.append("email", process.env?.AUTH_EMAIL as string);
        formdata.append("password", process.env?.AUTH_PASS as string);
        const res = await axios.postForm('https://erp.pay2all.in/api/token', formdata);

        if(!res.data?.token){
            console.log(res.data);
            return null;
        }

        return res.data.token;
    } catch (error) {
        console.log('[getAuthorization]', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    
    const body = await request.json();

    try {

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
        formdata.append("amount", Number(body.payout.Amount).toFixed(2));
        formdata.append("beneficiary_name", body.payout.BeneName);
        formdata.append("account_number", body.payout.AccountNo);
        formdata.append("ifsc", body.payout.IFSC);
        formdata.append("channel_id", "2");
        formdata.append("client_id", body.payout.APIRequestID);
        formdata.append("provider_id", '160');
 
        // get access token;
        const token = await getAuthorization();
        if(!token) throw new Error('[AUTO WITHDRAWAL] Invalid access token')
        
        // Perform API request
        const response = await axios.postForm("https://erp.pay2all.in/api/v1/payout/bank_transfer", formdata, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if(Number(response.data?.status_id || -1) !== 1){
            console.log(`[Error while processing]`, response.data);
            throw new Error("Error while processing");
        }

        // Handle success scenario without editedData
        if (!body.editedData) {
            return NextResponse.json({ msg: "Success", valid: true });
        }

        // Handle success with settlement update
        if (response.data?.utr && typeof response.data.utr === 'string') {
            
            const { msg, valid } = await ad_settleWithdrawal({
                ...body.editedData,
                TransactionID : response.data.utr
            });

            if (!valid) {
                console.error("Settlement update failed:", msg, body.editedData, response.data);
                return NextResponse.json({ valid: false, msg: "Amount debited but failed to update transaction." });
            }

            return NextResponse.json({ valid: true, msg: `Avail Bal: ${response.data?.balance} | Withdrawal successful` });
        }

        console.log('[UNKNOWN RESPONSE PAYOUT]', response.data, body, token)
        return NextResponse.json({ valid: false, msg: "Unknown response state" });

    } catch (error) {
        console.error("Error [processing payout]:", error, body);
        return NextResponse.json({ valid: false, msg: "Internal server error" });
    }
}

