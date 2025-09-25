import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionType, TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import axios from "axios";
import crypto from "crypto";

const KEY = 'rspay_token_1755057556340';
const accessKey = 'Soa+5HVbQE2gtZ3eQbgSXg';
const accessSecret = 'C9Z3RPDmfE6YX3WM4xcFSw';
// Generate MD5 hash for signing
function generateRandomString(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function sign({
    method = "POST",
    requestPath = "/api/v2/pay/create",
    key = accessKey,
    secret = accessSecret,
    timestamp = Math.floor(Date.now() / 1000).toString(),
    nonce = generateRandomString()
} : Record<string, string>) {
    // Build the raw string
    const raw = `${method}&${requestPath}&${key}&${timestamp}&${nonce}&${secret}`;

    // Hash with MD5
    const md5 = crypto.createHash("md5").update(raw, "utf8").digest("hex");

    return {
        sign: md5,
        raw,       // same as your C# return tuple
        timestamp,
        nuncio: nonce
    };
}

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

        // Cola Pay required params
        const timestamp = Math.floor(Date.now() / 1000).toString(); // 10 digit
        const nonce = Math.floor(Math.random() * 100000000).toString(); // random string

        const payload = {
            McorderNo: `${timestamp}`, // merchant order number
            Amount: payout.Amount.toFixed(2), // ensure max 2 decimals
            Type: "inr",
            ChannelCode: "71001", // must be bound channel code
            name: payout.BeneName,
            BankName: payout.BankName,
            BankAccount: payout.AccountNo,
            ifsc: payout.IFSC,
            NotifyUrl: "http://btcindia.bond/api/payment/COLA_PAY_WITHDRAWAL", // replace with live notify
        };

        // sign generation based on Cola Pay docs
        const headers = {
            accessKey: accessKey,
            timestamp,
            nonce,
        };
        const {sign: signValue} = sign({
            nonce,
            timestamp
        }); // assumes you have same `sign` util adapted for ColaPay
        const finalHeaders = {
            ...headers,
            sign: signValue,
            "Content-Type": "application/json",
        };

        const response = await axios.post(
            "https://mcapi.colapayppp.com/api/v2/pay/create", // replace with actual Cola Pay URL
            payload,
            { headers: finalHeaders }
        );

        console.log(response?.data);

        if (Number(response.data?.code) !== 200) {
            return { valid: false, msg: "Payout API request failed" };
        }

        const status = response.data?.result?.status;
        if (status === "created") {
            // mark processing state
            return { valid: true, msg: "Withdrawal created successfully" };
        }

        if (!editedData) {
            return { msg: "Success", valid: true };
        }

        if (response.data?.result?.orderNo) {
            const { msg, valid } = await ad_settleWithdrawal({
                ...editedData,
                TransactionID:
                    response.data?.result?.orderNo || payout.APIRequestID,
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

            return { valid: true, msg: "Withdrawal successful" };
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

