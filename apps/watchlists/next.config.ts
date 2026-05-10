import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pk-task/ui", "@pk-task/api", "@pk-task/db"],
};

export default nextConfig;
