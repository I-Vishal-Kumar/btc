"use client"

import { deleteTransaction } from "@/(backend)/services/transaction.service.serve"
import { randomBytes } from "crypto"
import { useContext } from "react";
import { USER_CONTEXT } from "./user.context";
import { generate_url } from "@/sActions/generateAuto2.gateway";

export const useAuto_2 = () => {

    const { userInfo } = useContext(USER_CONTEXT)

    const _initiate = async (amount: number) => {

        const transactionId = randomBytes(16).toString('hex');

        const postData = {
            customer_mobile: userInfo.PhoneNumber,
            amount,
            order_id: transactionId,
            redirect_url: 'https://btcindia.bond/'
        }

        // transaction is created procede.
        const url = await generate_url(postData);
        console.log(url);
        if (url) {
            window.open(url);
        } else {
            deleteTransaction(transactionId);
        }

    }

    return { _initiate }
}