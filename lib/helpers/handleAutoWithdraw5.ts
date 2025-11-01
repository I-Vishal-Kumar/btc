import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionType, TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import axios from "axios";
import { createHash } from "crypto";
import { CONNECT } from "../_db/db.config";

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

// your RS Pay secret key
const RS_SECRET = "rspay_token_1755057556340";
const RS_MERCHANT_ID = "INR222814";

/**
 * Generate RS Pay sign according to docs:
 * SHA256(stringA&key=密钥)
 */
export function generateRSPaySign(params: Record<string, any>) {
    const filtered = Object.fromEntries(
        Object.entries(params).filter(
            ([k, v]) => k !== "sign" && k !== "key" && v !== null && v !== undefined && v !== ""
        )
    );

    const sortedKeys = Object.keys(filtered).sort();

    const stringA = sortedKeys.map(k => `${ k }=${ filtered[k] }`).join("&");
    const signStr = `${ stringA }&key=${ RS_SECRET }`;

    console.log("[RS PAY SIGN STRING]", signStr, RS_SECRET);

    const hash = createHash("sha256").update(signStr, "utf8").digest("hex").toLowerCase();
    console.log("[RS PAY SIGN HASH]", hash);

    return hash;
}

/**
 * Handle auto withdrawal for RS Pay
 */
export async function handleAutoWithdraw5(
    body: PayoutRequestBody
): Promise<{ valid: boolean; msg: string }> {
    try {
        if (!body || !body.payout) {
            return { valid: false, msg: "Invalid request data" };
        }

        const { payout, editedData } = body;
        await CONNECT();

        // Optional DB validation like handleAutoWithdraw4
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

        // ---- RS PAY required fields ----
        const params: Record<string, any> = {
            merchantId: RS_MERCHANT_ID,
            merchantOrderId: payout.APIRequestID.trim(),
            amount: payout.Amount.toFixed(2),
            type: 1, // 1 = BankCard
            paymentCurrency: "INR",
            notifyUrl: "https://btcindia.bond/api/payment/RS_PAY_WITHDRAWAL",
            ext: "payment",
            accountName: payout.BeneName.trim(),
            accountNumber: payout.AccountNo.trim(),
            ifscCode: payout.IFSC.trim(),
            bankName: payout.BankName?.trim() || "",
        };

        // Generate SHA256 sign
        params.sign = generateRSPaySign(params);

        console.log("[RS PAY PAYLOAD]", params);

        // Send POST request (JSON)
        const response = await axios.post(
            "https://api.rs-pay.cc/apii/out/createOrder",
            params,
            { headers: { "Content-Type": "application/json; charset=utf-8" } }
        );

        console.log("[RS PAY RESPONSE]", response?.data);

        if (response.data?.status !== "200" && response.data?.status !== 200) {
            return {
                valid: false,
                msg: response.data?.message || "RS Pay payout request failed",
            };
        }

        // Success — update transaction
        if (!editedData) {
            return { msg: "Payout request submitted", valid: true };
        }

        const { msg, valid } = await ad_settleWithdrawal({
            ...editedData,
            TransactionID: payout.APIRequestID,
            Status: TransactionStatusType.SUCCESS,
        } as TransactionObjType);

        if (!valid) {
            console.error("Settlement update failed:", msg, editedData, response.data);
            return {
                valid: false,
                msg: "Payout accepted but failed to update transaction record.",
            };
        }

        return { valid: true, msg: "Payout request accepted" };
    } catch (error: any) {
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 3));
        return {
            valid: false,
            msg: "Internal error occurred while processing RS Pay payout.",
        };
    }
}
