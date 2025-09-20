import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionType, TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import axios from "axios";
import crypto from "crypto";

const KEY = 'rspay_token_1755057556340';

// Generate MD5 hash for signing
export const sign = (params: Record<string, any>, key: string = KEY) => {
    // 1. Filter out empty/null/undefined and the "sign" field
    const entries = Object.entries(params)
        .filter(
            ([k, v]) =>
                k !== "sign" && v !== null && v !== undefined && v !== ""
        )
        .sort(([a], [b]) => (a > b ? 1 : -1)); // 2. ASCII sort by key

    // 2. Concatenate into query string
    const signSource = entries.map(([k, v]) => `${k}=${v}`).join("&");

    // 3. Append key
    const finalString = `${signSource}&key=${key}`;
        console.log({finalString});
    // 4. SHA256
    return crypto.createHash("sha256").update(finalString).digest("hex");
};

// Validate a signature
export const validateSignByKey = (
    signSource: string,
    key: string = KEY,
    providedSign: string
) => {
    if (key) {
        signSource += `&key=${key}`;
    }
    const generatedSign = crypto
        .createHash("SHA256")
        .update(signSource)
        .digest("hex");
    return generatedSign === providedSign;
};

export type PayoutRequestBody = {
    payout: {
        AccountNo: string;
        Amount: number;
        IFSC: string;
        BeneName: string;
        BeneMobile: string;
        APIRequestID: string;
        BankName: string;
    };
    editedData?: {
        PhoneNumber: string;
        TransactionID: string;
        [key: string]: any;
    };
};

//   rms withdrawal
export async function handleAutoWithdraw4(
    body: PayoutRequestBody
): Promise<{ valid: boolean; msg: string }> {
    try {
        if (!body || !body.payout) {
            return { valid: false, msg: "Invalid request data" };
        }

        const { payout, editedData } = body;

        if (editedData) {
            const { PhoneNumber, TransactionID } = editedData;

            if (!PhoneNumber || !TransactionID) {
                return {
                    valid: false,
                    msg: "Missing required transaction details",
                };
            }

            const transaction = await TRANSACTION.findOne({
                PhoneNumber,
                Type: TransactionType.WITHDRAWAL,
                TransactionID,
                Status: TransactionStatusType.PENDING,
            });

            if (!transaction) {
                return {
                    valid: false,
                    msg: "Transaction not found or already processed",
                };
            }
        }

        const payload = {
            merchantId: "INR222814",
            merchantOrderId: payout.APIRequestID,
            amount: payout.Amount.toFixed(2), // ensure string with 2 decimals
            type: 1,
            paymentCurrency: "INR",
            notifyUrl: "http://btcindia.bond/api/payment/PENDING_WITHDRAWAL",
            accountName: payout.BeneName,
            accountNumber: payout.AccountNo,
            ifscCode: payout.IFSC,
            ext: payout.BeneMobile, // optional passthrough
        };
        const finalPayload = { ...payload, sign: sign(payload) };

        const response = await axios.post(
            "https://api.rs-pay.cc/apii/out/createOrder",
            finalPayload,
            { headers: { "Content-Type": "application/json; charset=utf-8" } }
        );

        console.log(response?.data);
        if (response.data?.status !== "200") {
            return { valid: false, msg: "Payout API request failed" };
        }
        const state = response.data?.data?.state;
        if (state === 2) return { valid: false, msg: "Processing" };
        if (state === 3) return { valid: false, msg: "Failed" };

        if (!editedData) {
            return { msg: "Success", valid: true };
        }

        if (
            response.data?.transaction_id &&
            typeof response.data.transaction_id === "string"
        ) {
            const { msg, valid } = await ad_settleWithdrawal({
                ...editedData,
                TransactionID:
                    response.data?.transaction_id || payout.APIRequestID,
            } as TransactionObjType);

            if (!valid) {
                console.error(
                    "Settlement update failed:",
                    msg,
                    editedData,
                    response.data
                );
                return {
                    valid: false,
                    msg: "Amount debited but failed to update transaction.",
                };
            }

            return { valid: true, msg: `Withdrawal successful` };
        }

        console.log("[UNKNOWN RESPONSE PAYOUT]", response.data, body);
        return { valid: false, msg: "Unknown response state" };
    } catch (error: any) {
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 3));
        return {
            valid: false,
            msg: "Internal error occurred while processing payout.",
        };
    }
}
