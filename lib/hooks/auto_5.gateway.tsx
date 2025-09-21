"use client"

import { randomBytes } from "crypto"
import { generate_url } from "@/sActions/generateAuto5.gateway";
import { sign } from "../helpers/handleAutoWithdraw4";
import { useContext } from "react";
import { USER_CONTEXT } from "./user.context";
// import { CREATE_TRANSACTION } from "@/(backend)/services/transaction.service.serve";
// import { enqueueSnackbar } from "notistack";
// import { GatewayTypes } from "@/__types__/db.types";

export const useAuto_5 = () => {

    const { userInfo } = useContext(USER_CONTEXT)

    const _initiate = async (amount: number) => {
        console.log(amount);
        try {

            const transactionId = randomBytes(16).toString('hex');

            const data = {
                merchantId: "INR222814",
                merchantOrderId: `${ transactionId }`,
                amount: Number(100).toFixed(2),
                type: '2',
                paymentCurrency: "INR",
                notifyUrl: "https://btcindia.bond/api/payment/AUTO_5",
                userName: userInfo.Name,
                ext: `${ userInfo.PhoneNumber }`,
                redirectUrl: "https://btcindia.bond/",
            }

            const postData = { ...data, sign: sign(data) };

            // const { valid } = await CREATE_TRANSACTION(amount, transactionId, GatewayTypes.RMS_2)
            // if (!valid) return enqueueSnackbar('Failed to process request', { variant: "error" });

            // transaction is created procede.
            const slug = await generate_url(postData);

            console.log(slug);

        } catch (error) {
            console.log('error in auto 3', error);
        }

    }

    return { _initiate }
}