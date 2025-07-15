import { CREATE_TRANSACTION, deleteTransaction } from "@/(backend)/services/transaction.service.serve"
import { GatewayTypes } from "@/__types__/db.types";
import axios from "axios";
import crypto, { randomBytes } from "crypto"
import { enqueueSnackbar } from "notistack";


function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${ year }-${ month }-${ day } ${ hours }:${ minutes }:${ seconds }`;
}

export const sign = (signSource: string, key: string) => {
    if (key) {
        signSource += `&key=${ key }`;
    }
    return crypto.createHash('md5').update(signSource).digest('hex');
};



export const useAuto_1 = () => {

    const req_url = async (amount: number, orderNo: string) => {

        const merchant_key = process.env.NEXT_PUBLIC_MERCHANT_KEY; // Set in .env file
        const reqUrl = process.env.NEXT_PUBLIC_REQUEST_URL;
        const page_url = 'https://btcindia.bond/';
        const order_date = formatDate(new Date());
        const notify_url = `https://btcindia.bond/api/payment/AUTO_1`;
        const pay_type = 151;
        const trade_amount = amount;
        const goods_name = 'PAYMENT'
        const mch_order_no = `${ orderNo }`;
        const sign_type = 'MD5';
        const mch_id = process.env.NEXT_PUBLIC_MERCHANT_ID;
        const version = '1.0';

        // Construct the sign string
        const signStr = `goods_name=${ goods_name }&mch_id=${ mch_id }&mch_order_no=${ mch_order_no }&notify_url=${ notify_url }&order_date=${ order_date }&page_url=${ page_url }&pay_type=${ pay_type }&trade_amount=${ trade_amount }&version=${ version }`;

        const signature = sign(signStr, merchant_key as string);

        const postData = {
            goods_name,
            mch_id,
            mch_order_no,
            notify_url,
            order_date,
            page_url,
            pay_type,
            trade_amount,
            version,
            sign_type,
            sign: signature,
        };

        const data = await axios.post(reqUrl as string, postData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (data.data?.respCode === 'SUCCESS') {
            return data.data.payInfo
        } else {
            enqueueSnackbar('something went wrong please try other gateway for now.', { variant: 'error' })
        }
    }

    const _initiate = async (amount: number) => {

        const transactionId = randomBytes(16).toString('hex');

        const { valid } = await CREATE_TRANSACTION(amount, transactionId, GatewayTypes.AUTO_1);

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