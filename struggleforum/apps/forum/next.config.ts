import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  crossOrigin: "anonymous",
  output: "standalone",
  outputFileTracingRoot: `${process.cwd()}/../..`,
};

export default nextConfig;
