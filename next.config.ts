import type { NextConfig } from "next";

// GitHub Pages serves this repo from https://kanizmadix.github.io/portfolio-site/,
// so every asset and link needs that prefix in CI. Local dev and builds stay at
// the root, so `npm run dev` is unaffected.
const basePath = process.env.GITHUB_PAGES === "true" ? "/portfolio-site" : "";

const nextConfig: NextConfig = {
  // Emit a plain static site into out/ — Pages has no Node server.
  output: "export",
  basePath,
  assetPrefix: basePath,
  // The Image optimizer needs a server at runtime; static export can't use it.
  // Note: unoptimized images bypass Next's automatic basePath rewriting, so any
  // /public src must be prefixed manually with NEXT_PUBLIC_BASE_PATH below.
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Emit out/index.html-style directories so Pages resolves routes without a rewrite layer.
  trailingSlash: true,
};

export default nextConfig;
