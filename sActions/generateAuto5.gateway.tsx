'use server'

import axios from "axios";


export const generate_url = async (postData: Record<string, string | number>) => {

    const reqUrl = process.env.REQUEST_URL_RS_PAY!;

    try {
        const res = await axios.post(reqUrl, postData);
        console.log(res);
        if (res.data?.status === 'success') {
            return res.data?.data?.paymentUrl
        }

        return false;

    } catch (error) {
        console.log('generating auto 2 url', error);
        return false;
    }

}