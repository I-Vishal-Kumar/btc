"use server";

import axios from "axios";

/**
 * Calls RS Pay deposit API to create an order and return the payment URL
 */
export const generate_url = async (postData: Record<string, string | number>) => {
    const reqUrl = "https://api.rs-pay.cc/apii/in/createOrder";

    try {
        // Send JSON payload (RS Pay expects JSON)
        const res = await axios.post(reqUrl, postData, {
            headers: { "Content-Type": "application/json; charset=utf-8" },
        });

        console.log("[RS PAY CREATE ORDER RESPONSE]", res.data);

        if (res.data?.status === "200" || res.data?.status === 200) {
            return res.data?.data?.payUrl;
        }

        console.error("RS Pay order creation failed:", res.data?.message || res.data);
        return false;
    } catch (error) {
        console.error("Error generating RS Pay URL:", error);
        return false;
    }
};
