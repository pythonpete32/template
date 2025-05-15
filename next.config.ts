import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["static.debank.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.debank.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
