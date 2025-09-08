import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {},
  // Add this line
  transpilePackages: ["framer-motion"],
};

export default nextConfig;
