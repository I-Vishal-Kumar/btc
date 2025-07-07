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

    // const params = new URLSearchParams();
    // Object.entries(postData).forEach(([key, value]) => {
    //     params.append(key, String(value));
    // });
    try {
        const data = await axios.post(reqUrl, postData);
        console.log(data);
        if (data.data?.status === 'success') {
            return data.data?.payment_link
        }

        return false;

    } catch (error) {
        console.log('generating auto 2 url', error);
        return false;
    }

}