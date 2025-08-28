import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionType, TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import axios from "axios";
import crypto from "crypto";

const KEY = "rspay_token_1755057556340";

// Generate MD5 hash for signing
export const sign = (params: Record<string, any>, key: string = KEY) => {
    // 1. Filter out empty/null/undefined and the "sign" field
    const entries = Object.entries(params)
        .filter(
            ([k, v]) =>
                k !== "sign" && v !== null && v !== undefined && v !== ""
        )
        .sort(([a], [b]) => a.localeCompare(b)); // 2. ASCII sort by key

    // 2. Concatenate into query string
    const signSource = entries.map(([k, v]) => `${k}=${v}`).join("&");

    // 3. Append key
    const finalString = `${signSource}&key=${key}`;

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

        console.log("api request rms payout", {
            mobile_number: payout.BeneMobile,
            email: "btccompanyind@gmail.com",
            beneficiary_name: payout.BeneName,
            ifsc_code: payout.IFSC,
            account_number: payout.AccountNo,
            amount: Math.floor(Number(payout.Amount)),
            channel_id: "2",
            client_id: payout.APIRequestID,
        });

        // const payload = {
        //     merchantId: "INR222814",
        //     accountName: payout.BeneName,
        //     ifscCode: payout.IFSC,
        //     type: 1,
        //     paymentCurrency: "INR",
        //     notifyUrl: "http://btcindia.bond/api/payment/PENDING_WITHDRAWAL",
        //     accountNumber: payout.AccountNo,
        //     amount: Math.floor(Number(payout.Amount)).toFixed(2),
        //     merchantOrderId: payout.APIRequestID,
        //     bankName: payout.BankName,
        // };

        const payload =   {
                merchantId: "INR222814",
                accountName: "Gaurav kumar Rajak",
                ifscCode: "PUNB0760700",
                type: 1,
                paymentCurrency: "INR",
                notifyUrl:
                    "http://btcindia.bond/api/payment/PENDING_WITHDRAWAL",
                accountNumber: "7607000100036657",
                amount: 100.00,
                merchantOrderId: payout.APIRequestID,
                bankName: "Punjab National",
            }

        const response = await axios.post(
            "https://api.rs-pay.cc/apii/out/createOrder",
            { ...payload, sign: sign(payload) }
        );
        console.log(response?.data);
        if (response.data?.status === "pending") {
            console.log("[withdraw request in pending]", response.data);
            return {
                valid: false,
                msg: "PENDING Do not send withdrawal from your side.",
            };
        }

        if (response.data?.status !== "success") {
            console.log(`[Error while processing]`, response.data);
            return { valid: false, msg: "Payout API rejected the request" };
        }

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
        console.error("[handleAutoWithdraw] Internal error:", error);
        return {
            valid: false,
            msg: "Internal error occurred while processing payout.",
        };
    }
}
