'use server'

import axios from "axios";


export const generate_url = async (postData: Record<string, string | number>) => {

    const reqUrl = process.env.REQUEST_URL_RMS!;
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
            return res.data?.data?.payment_link
        }

        return false;

    } catch (error) {
        console.log('generating auto 2 url', error);
        return false;
    }

}