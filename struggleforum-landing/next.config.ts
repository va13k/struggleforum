import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const repoName = "struggleforum";
const githubUser = "va13k";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
};

export default nextConfig;
