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

export async function handleAutoWithdraw2(body: PayoutRequestBody): Promise<{ valid: boolean; msg: string }> {
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

    const formdata = new FormData();
    formdata.append("mobile_number", payout.BeneMobile);
    formdata.append("email", 'btccompanyind@gmail.com');
    formdata.append("beneficiary_name", payout.BeneName);
    formdata.append("ifsc_code", payout.IFSC);
    formdata.append("account_number", payout.AccountNo);
    formdata.append("amount", Number(payout.Amount).toFixed(2));
    formdata.append("channel_id", "2");
    formdata.append("client_id", payout.APIRequestID);

    const response = await axios.postForm("https://sprezapay.com/api/payout/v2/transfer-now", formdata, {
        headers: {
            Authorization: `Bearer ${'oxH6cdNkp0ecXYrjRlRqPdkDdR0oHDRZq72rUPfD3zkSByV5ykHRr6sSFbJa'}`,
        },
    });

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
