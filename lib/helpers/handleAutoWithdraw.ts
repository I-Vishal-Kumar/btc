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

async function getAuthorization() {
    try {
        const formdata = new FormData();
        formdata.append("email", process.env?.AUTH_EMAIL as string);
        formdata.append("password", process.env?.AUTH_PASS as string);
        const res = await axios.postForm('https://erp.pay2all.in/api/token', formdata);

        if (!res.data?.token) {
            console.log(res.data);
            return null;
        }

        return res.data.token;
    } catch (error) {
        console.log('[getAuthorization]', error);
        return null;
    }
}
export async function handleAutoWithdraw(body: PayoutRequestBody): Promise<{ valid: boolean; msg: string }> {
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
        formdata.append("amount", Number(payout.Amount).toFixed(2));
        formdata.append("beneficiary_name", payout.BeneName);
        formdata.append("account_number", payout.AccountNo);
        formdata.append("ifsc", payout.IFSC);
        formdata.append("channel_id", "2");
        formdata.append("client_id", payout.APIRequestID);
        formdata.append("provider_id", "160");

        const token = await getAuthorization();
        if (!token) return { valid: false, msg: "Unable to get access token" };

        const response = await axios.postForm("https://erp.pay2all.in/api/v1/payout/bank_transfer", formdata, {
            headers: {
                Authorization: `Bearer ${ token }`,
            },
        });

        if (Number(response.data?.status_id || -1) !== 1) {
            console.log(`[Error while processing]`, response.data);
            return { valid: false, msg: "Payout API rejected the request" };
        }

        if (!editedData) {
            return { msg: "Success", valid: true };
        }

        if (response.data?.utr && typeof response.data.utr === "string") {
            const { msg, valid } = await ad_settleWithdrawal({
                ...editedData,
                TransactionID: response.data.utr,
                Status: TransactionStatusType.SUCCESS
            } as TransactionObjType);

            if (!valid) {
                console.error("Settlement update failed:", msg, editedData, response.data);
                return { valid: false, msg: "Amount debited but failed to update transaction." };
            }

            return { valid: true, msg: `Avail Bal: ${ response.data?.balance } | Withdrawal successful` };
        }

        console.log("[UNKNOWN RESPONSE PAYOUT]", response.data, body, token);
        return { valid: false, msg: "Unknown response state" };
    } catch (error: any) {
        console.error("[handleAutoWithdraw] Internal error:", error);
        return { valid: false, msg: "Internal error occurred while processing payout." };
    }
}
