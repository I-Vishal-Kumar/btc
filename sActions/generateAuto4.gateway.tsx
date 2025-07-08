'use server'

import axios from "axios";


export const generate_url = async (postData: Record<string, string | number>) => {

    const reqUrl = 'https://rmstrade.online/api/add-money/v2/create-order';
    const api_token = process.env.RMS_REQUEST_TOKEN;

    
    if (!api_token) return false;

    postData = {
        ...postData,
        api_token
    }

    try {
        const res = await axios.post(reqUrl, postData);
        console.log(res);
        if (res.data?.status === 'success') {
            return res.data?.data?.order_slug
        }

        return false;

    } catch (error) {
        console.log('generating auto 2 url', error);
        return false;
    }

}