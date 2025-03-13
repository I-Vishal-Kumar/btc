'use server'

import axios from "axios";


export const generate_url = async (postData: Record<string, string | number>) => {

    const reqUrl = process.env.REQUEST_URL_IMB;
    const user_token = process.env.USER_TOKEN;

    if (!user_token) return false;

    postData = {
        ...postData,
        user_token
    }

    const params = new URLSearchParams();
    Object.entries(postData).forEach(([key, value]) => {
        params.append(key, String(value));
    });
    try {
        const data = await axios.post(reqUrl as string, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (data.data?.status) {
            return data.data.result.payment_url
        }

        return false;

    } catch (error) {
        console.log('generating auto 2 url', error);
        return false;
    }

}