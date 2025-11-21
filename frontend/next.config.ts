import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  experimental: {
    optimizeCss: false,
  },
  transpilePackages: ["framer-motion"],
};

export default nextConfig;
