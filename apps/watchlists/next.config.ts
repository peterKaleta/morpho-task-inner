import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pk-task/ui", "@pk-task/api", "@pk-task/db"],
  webpack(config, { webpack }) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    config.plugins ??= [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      }),
      new webpack.IgnorePlugin({
        resourceRegExp: /^pino-pretty$/,
      }),
    );

    return config;
  },
};

export default nextConfig;
