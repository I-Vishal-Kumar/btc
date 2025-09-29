"use client"

import { randomBytes } from "crypto"
import { generate_url } from "@/sActions/generateAuto5.gateway";
// import { sign } from "../helpers/handleAutoWithdraw4";
import { useContext } from "react";
import { USER_CONTEXT } from "./user.context";
import { CREATE_TRANSACTION } from "@/(backend)/services/transaction.service.serve";
import { enqueueSnackbar } from "notistack";
import { GatewayTypes } from "@/__types__/db.types";
import { generateLGPaySign } from "../helpers/handleAutoWithdraw4";

export const useAuto_5 = () => {

    const { userInfo } = useContext(USER_CONTEXT)

    const _initiate = async (amount: number) => {
        console.log(amount);
        try {

            const transactionId = randomBytes(16).toString('hex');

            const data = {
                app_id: "YD4489",
                trade_type: `INRUPI`,
                order_sn: `${ transactionId }`,
                money: Number(200) * 100,
                notify_url: "https://btcindia.bond/api/payment/AUTO_5",
                ip: '0.0.0.0',
                remark: `${ userInfo.PhoneNumber }`,
            }
            console.log(data)
            const postData = { ...data, sign: generateLGPaySign(data) };

            const { valid } = await CREATE_TRANSACTION(amount, transactionId, GatewayTypes.RMS_2)
            if (!valid) return enqueueSnackbar('Failed to process request', { variant: "error" });

            // transaction is created procede.
            const slug = await generate_url(postData);

            console.log(slug);

        } catch (error) {
            console.log('error in auto 3', error);
        }

    }

    return { _initiate }
}