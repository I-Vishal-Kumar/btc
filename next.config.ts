import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ik.imagekit.io",
            },
            {
                protocol: "https",
                hostname: "youtube.com",
            },
            {
                protocol: "http",
                hostname: "youtube.com",
            },
            {
                protocol: "https",
                hostname: "img.youtube.com",
            },
        ],
    },
};

export default nextConfig;
