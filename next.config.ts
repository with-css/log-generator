import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/log-generator",
  reactStrictMode: true,
  trailingSlash: true,
};

export default nextConfig;
