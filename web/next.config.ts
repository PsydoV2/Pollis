import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  serverExternalPackages: ["@coinbase/cdp-sdk"],
};

export default nextConfig;
