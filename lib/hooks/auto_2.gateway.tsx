import { AUTO_1, deleteTransaction } from "@/(backend)/services/transaction.service.serve"
import axios from "axios";
import { randomBytes } from "crypto"
import { enqueueSnackbar } from "notistack";
import { useContext } from "react";
import { USER_CONTEXT } from "./user.context";

export const useAuto_2 = () => {

    const { userInfo } = useContext(USER_CONTEXT)

    const req_url = async (amount: number, orderNo: string) => {

        const reqUrl = process.env.NEXT_PUBLIC_REQUEST_URL_IMB;
        const user_token = process.env.NEXT_PUBLIC_USER_TOKEN;

        const postData = {
            customer_mobile: userInfo.PhoneNumber,
            user_token,
            amount,
            order_id: orderNo,
            redirect_url: 'https://btcindia.bond/'
        }

        const data = await axios.post(reqUrl as string, postData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (data.data?.status) {
            return data.data.result.payment_url
        } else {
            enqueueSnackbar('something went wrong please try other gateway for now.', { variant: 'error' })
        }
    }

    const _initiate = async (amount: number) => {

        const transactionId = randomBytes(16).toString('hex');

        const { valid } = await AUTO_1(amount, transactionId);

        if (!valid) return enqueueSnackbar("Something went wrong try again", { variant: 'error' });

        // transaction is created procede.
        const url = await req_url(amount, transactionId);

        if (url) {
            window.open(url);
        } else {
            deleteTransaction(transactionId);
        }

    }

    return { _initiate }
}