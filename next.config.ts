import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images:{
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'ik.imagekit.io',
        },
        {
          protocol: 'https',
          hostname: 'www.youtube.com',
        }
      ]
    }
};

export default nextConfig;
