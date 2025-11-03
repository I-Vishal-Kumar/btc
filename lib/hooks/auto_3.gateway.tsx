"use client"

import { CREATE_TRANSACTION, deleteTransaction } from "@/(backend)/services/transaction.service.serve"
import { randomBytes } from "crypto"
import { useContext } from "react";
import { USER_CONTEXT } from "./user.context";
import { generate_url } from "@/sActions/generateAuto3.gateway";
import { GatewayTypes } from "@/__types__/db.types";
import { enqueueSnackbar } from "notistack";

export const useAuto_3 = () => {

    const { userInfo } = useContext(USER_CONTEXT)

    const _initiate = async (amount: number) => {
        try {

            const transactionId = randomBytes(16).toString('hex');

            const postData = {
                mobile_number: userInfo.PhoneNumber,
                amount,
                client_id: transactionId,
                redirect_url: 'https://btcindia.bond/',
                callback_url: 'https://btcindia.bond/api/payment/AUTO_3',
                customer_name: userInfo.Name,
                email: 'btccompanyind@gmail.com'
            }

            const { valid } = await CREATE_TRANSACTION(amount, transactionId, GatewayTypes.RMS_1)
            if (!valid) return enqueueSnackbar('Failed to process request', { variant: "error" });

            // transaction is created procede.
            const url = await generate_url(postData);

            if (url) {
                console.log({url});
                // window.open(url);
            } else {
                deleteTransaction(transactionId);
            }

        } catch (error) {
            console.log('error in auto 3', error);
        }

    }

    return { _initiate }
}