import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Ignoring TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // !! WARN !!
    // Ignoring ESLint errors during build
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      "static.debank.com",
      "raw.githubusercontent.com",
      "assets.coingecko.com",
      "icons.llama.fi",
      "icons.llamao.fi",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.debank.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "icons.llama.fi",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "icons.llamao.fi",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
