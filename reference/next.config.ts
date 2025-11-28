import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from any origin during development
  // This is needed when accessing the dev server from a remote machine
  allowedDevOrigins: ["*"],
  turbopack: {},
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
