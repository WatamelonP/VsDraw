import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    allowedDevOrigins: ['192.168.1.6:3000', '192.168.1.6', 'localhost:3000'],
  },
};

export default nextConfig;
