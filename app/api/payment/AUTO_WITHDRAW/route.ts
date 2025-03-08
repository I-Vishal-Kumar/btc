import { TRANSACTION } from "@/(backend)/(modals)/schema/transaction.schema";
import { ad_settleWithdrawal } from "@/(backend)/services/admin.service.serve";
import { TransactionStatusType, TransactionType } from "@/__types__/db.types";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

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

        // Perform API request
        const response = await axios.post("https://airdexpay.com/API/Payout", body.payout);
        const responseJson = response.data;

        // Handle API response
        if (responseJson.statuscode !== 1) {
            return NextResponse.json({ valid: false, msg: responseJson });
        }

        // Handle success scenario without editedData
        if (!body.editedData) {
            return NextResponse.json({ msg: "Success", valid: true });
        }

        // Handle success with settlement update
        if (responseJson.opening > responseJson.closing) {
            const { msg, valid } = await ad_settleWithdrawal(body.editedData);

            if (!valid) {
                console.error("Settlement update failed:", msg, body.editedData);
                return NextResponse.json({ valid: false, msg: "Amount debited but failed to update transaction." });
            }

            return NextResponse.json({ valid: true, msg: "Withdrawal successful" });
        }

        return NextResponse.json({ valid: false, msg: "Unknown response state" });

    } catch (error) {
        console.error("Error processing payout:", error);
        return NextResponse.json({ valid: false, msg: "Internal server error" });
    }
}

