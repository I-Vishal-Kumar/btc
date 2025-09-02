import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionType, TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import axios from "axios";

export type PayoutRequestBody = {
    payout: {
      AccountNo: string;
      Amount: number;
      IFSC: string;
      BeneName: string;
      BeneMobile: string;
      APIRequestID: string;
    };
    editedData?: {
      PhoneNumber: string;
      TransactionID: string;
      [key: string]: any;
    };
  };

//   rms withdrawal
export async function handleAutoWithdraw3(body: PayoutRequestBody): Promise<{ valid: boolean; msg: string }> {
    try {
    if (!body || !body.payout) {
        return { valid: false, msg: "Invalid request data" };
    }

    const { payout, editedData } = body;

    if (editedData) {
        const { PhoneNumber, TransactionID } = editedData;

        if (!PhoneNumber || !TransactionID) {
        return { valid: false, msg: "Missing required transaction details" };
        }

        const transaction = await TRANSACTION.findOne({
            PhoneNumber,
            Type: TransactionType.WITHDRAWAL,
            TransactionID,
            Status: TransactionStatusType.PENDING,
        });

        if (!transaction) {
        return { valid: false, msg: "Transaction not found or already processed" };
        }
    }

    console.log( "api request rms payout", {
        mobile_number: payout.BeneMobile,
        email : 'btccompanyind@gmail.com',
        beneficiary_name: payout.BeneName,
        ifsc_code : payout.IFSC,
        account_number: payout.AccountNo,
        amount:  Math.floor(Number(payout.Amount)),
        channel_id: '2',
        client_id: payout.APIRequestID
    });

    const response = await axios.post("https://rmstrade.online/api/payout/v2/transfer-now", {
        api_token : 'fuiGDOMSaxdiRo1QlkrVHiemEiapsh6ywJo1oYYPc4pmbeOlsJVT1B8nlUWB',
        mobile_number: payout.BeneMobile,
        email : 'btccompanyind@gmail.com',
        beneficiary_name: payout.BeneName,
        ifsc_code : payout.IFSC,
        account_number: payout.AccountNo,
        amount:  Math.floor(Number(payout.Amount)),
        channel_id: '2',
        client_id: payout.APIRequestID
    });
    console.log(response);
    if (response.data?.status === 'pending'){
        console.log('[withdraw request in pending]', response.data);
        return { valid: false, msg: "PENDING Do not send withdrawal from your side." };
    }
    
    if (response.data?.status !== 'success') {
        console.log(`[Error while processing]`, response.data);
        return { valid: false, msg: "Payout API rejected the request" };
    }

    if (!editedData) {
        return { msg: "Success", valid: true };
    }

    if (response.data?.utr && typeof response.data.utr === "string") {
        const { msg, valid } = await ad_settleWithdrawal({
        ...editedData,
        TransactionID: payout.APIRequestID,
        } as TransactionObjType);

        if (!valid) {
        console.error("Settlement update failed:", msg, editedData, response.data);
        return { valid: false, msg: "Amount debited but failed to update transaction." };
        }

        return { valid: true, msg: `Withdrawal successful` };
    }

        console.log("[UNKNOWN RESPONSE PAYOUT]", response.data, body);
        return { valid: false, msg: "Unknown response state" };
    } catch (error: any) {
        console.error("[handleAutoWithdraw] Internal error:", error);
        return { valid: false, msg: "Internal error occurred while processing payout." };
    }
}

