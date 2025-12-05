import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable edge runtime for better performance
  experimental: {
    // MCP adapter works with both edge and node runtime
  },
};

export default nextConfig;
