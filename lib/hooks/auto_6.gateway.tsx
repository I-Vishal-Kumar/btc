"use client";

import { randomBytes } from "crypto";
import { generate_url } from "@/sActions/generateAuto6.gateway"; // new RS Pay version
import { useContext } from "react";
import { USER_CONTEXT } from "./user.context";
import { CREATE_TRANSACTION, deleteTransaction } from "@/(backend)/services/transaction.service.serve";
import { enqueueSnackbar } from "notistack";
import { GatewayTypes } from "@/__types__/db.types";
import { generateRSPaySign } from "../helpers/handleAutoWithdraw5"; // reuse same SHA256 helper

export const useAuto_6 = () => {
    const { userInfo } = useContext(USER_CONTEXT);

    const _initiate = async (amount: number) => {
        try {
            // Generate unique order ID
            const transactionId = randomBytes(16).toString("hex");

            // Required fields from RS Pay “2.1 代收” (Deposit)
            const data = {
                merchantId: 'INR222814',
                merchantOrderId: transactionId,
                amount: amount.toFixed(2),
                type: 2, // fixed for deposit/pay-in
                paymentCurrency: "INR",
                notifyUrl: "https://btcindia.bond/api/payment/AUTO_6", // your async callback
                userName: userInfo.Name || userInfo.PhoneNumber,
                ext: userInfo.PhoneNumber,
                redirectUrl: "https://btcindia.bond/payment/success",
            };

            // Generate RS Pay sign (SHA256)
            const postData = { ...data, sign: generateRSPaySign(data) };

            // Create local transaction first
            const { valid } = await CREATE_TRANSACTION(amount, transactionId, GatewayTypes.AUTO_4);
            if (!valid) return enqueueSnackbar("Failed to process request", { variant: "error" });

            // Ask server to hit RS Pay API and get pay URL
            const payUrl = await generate_url(postData);

            if (payUrl) {
                window.open(payUrl, "_blank");
            } else {
                await deleteTransaction(transactionId);
                enqueueSnackbar("Failed to create RS Pay order", { variant: "error" });
            }
        } catch (error) {
            console.error("[RS PAY auto_6 error]", error);
            enqueueSnackbar("Internal error during RS Pay request", { variant: "error" });
        }
    };

    return { _initiate };
};
