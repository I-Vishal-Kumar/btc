"use client"

import { randomBytes } from "crypto"
import { useContext } from "react";
import { USER_CONTEXT } from "./user.context";
import { generate_url } from "@/sActions/generateAuto4.gateway";
import { CREATE_TRANSACTION, deleteTransaction } from "@/(backend)/services/transaction.service.serve";
import { enqueueSnackbar } from "notistack";
import { GatewayTypes } from "@/__types__/db.types";

export const useAuto_4 = () => {

    const { userInfo } = useContext(USER_CONTEXT)

    const _initiate = async (amount: number) => {
        try {
            
            const transactionId = randomBytes(16).toString('hex');
            
        const postData = {
            mobile_number: userInfo.PhoneNumber,
            amount,
            client_id: transactionId,
            redirect_url: 'https://btcindia.bond/',
            callback_url: 'https://btcindia.bond/api/payment/AUTO_4',
            customer_name: userInfo.Name,
            email : 'btccompanyind@gmail.com'
        }
        
        const {valid} = await CREATE_TRANSACTION(amount, transactionId, GatewayTypes.RMS_2)
        if(!valid) return  enqueueSnackbar('Failed to process request', {variant: "error"});
        
        // transaction is created procede.
        const slug = await generate_url(postData); 

        // @ts-expect-error samepay checkout exists due to script tag;
        if (slug && window?.smepayCheckout) {            
            // @ts-expect-error samepay checkout exists due to script tag;
            window.smepayCheckout({
                slug,
                onSuccess: () => {
                    alert('Success.');
                },
                onFailure: () => {
                    alert('❌ Payment failed or closed.');
                },
            })
        } else {
            deleteTransaction(transactionId);
        }

    } catch (error) {
        console.log('error in auto 3', error);
    }

    }

    return { _initiate }
}