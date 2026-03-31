import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: [
    'localhost:3000', 
    ...(process.env.LOCAL_DEV_IP ? [`${process.env.LOCAL_DEV_IP}:3000`, process.env.LOCAL_DEV_IP] : [])
  ],
};

export default nextConfig;
