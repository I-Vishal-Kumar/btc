import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionType, TransactionStatusType } from "@/__types__/db.types";
import { TransactionObjType } from "@/__types__/transaction.types";
import axios from "axios";
import { createHash } from "crypto";

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


function generateLGPaySign(params: Record<string, any>, secretKey: string) {
    // 1. Remove empty values AND remove 'sign' if present
    const filtered = Object.fromEntries(
        Object.entries(params).filter(
            ([k, v]) => k !== "sign" && v !== null && v !== undefined && v !== ""
        )
    );

    // 2. Sort keys ASCII ascending
    const sortedKeys = Object.keys(filtered).sort();

    // 3. Build query string
    const queryString = sortedKeys.map(k => `${k}=${filtered[k]}`).join("&");

    // 4. Append secret key
    const stringToSign = `${queryString}&key=${secretKey}`;

    console.log("[LG PAY SIGN STRING]", stringToSign);

    // 5. MD5 uppercase
    return createHash("md5").update(stringToSign).digest("hex").toUpperCase();
}

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

        // ---- LG Pay required params ----
        const params: Record<string, any> = {
            app_id: "YD4489",
            order_sn: payout.APIRequestID,
            currency: 'INR', // e.g., "INR"
            money: Math.floor(payout.Amount * 100),
            name : payout.BeneName,
            bank_name : payout.BankName,
            addon1 : payout.IFSC,
            card_number : payout.AccountNo,
            notify_url: "https://btcindia.bond/payment/LG_PAY_WITHDRAWAL",
        };

        // Generate sign
        params.sign = generateLGPaySign(params, process.env.LGPAY_SECRET_KEY!);

        // Send request as form-urlencoded
        const response = await axios.post(
            "https://www.lg-pay.com/api/deposit/create",
            new URLSearchParams(params).toString(),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        console.log("[LG PAY RESPONSE]", response?.data);

        if (response.data?.status !== 1) {
            return {
                valid: false,
                msg: response.data?.msg || "Payout API request failed",
            };
        }

        // Accepted (status=1), final result will come via notify_url callback
        if (!editedData) {
            return { msg: "Payout request submitted", valid: true };
        }

        const { msg, valid } = await ad_settleWithdrawal({
            ...editedData,
            TransactionID: payout.APIRequestID,
        } as TransactionObjType);

        if (!valid) {
            console.error("Settlement update failed:", msg, editedData, response.data);
            return {
                valid: false,
                msg: "Payout request accepted but failed to update transaction.",
            };
        }

        return { valid: true, msg: "Payout request accepted" };
    } catch (error: any) {
        console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 3));
        return {
            valid: false,
            msg: "Internal error occurred while processing payout.",
        };
    }
}
