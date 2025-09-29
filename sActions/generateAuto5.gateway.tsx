'use server'

import axios from "axios";

export const generate_url = async (postData: Record<string, string | number>) => {
    const reqUrl = 'https://www.lg-pay.com/api/order/create';

    try {
        // Convert the payload to application/x-www-form-urlencoded
        const formBody = new URLSearchParams(
            Object.entries(postData).map(([k, v]) => [k, String(v)])
        ).toString();

        const res = await axios.post(reqUrl, formBody, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        console.log("[LG PAY CREATE ORDER RESPONSE]", res.data);

        if (res.data?.status === 1) {
            return res.data?.data?.pay_url; // correct field according to docs
        }

        console.error("LG Pay order creation failed:", res.data?.msg || res.data);
        return false;

    } catch (error) {
        console.error("Error generating LG Pay URL:", error);
        return false;
    }
}
