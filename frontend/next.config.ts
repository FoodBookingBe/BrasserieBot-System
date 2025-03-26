import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Next.js outputs files in a way compatible with Netlify
  output: "export",
  // Required for Netlify, allows pre-rendering at build time
  trailingSlash: true,
  // Disable image optimization as Netlify has its own image processing
  images: {
    unoptimized: true,
    // If you're loading images from external domains, add them here
    domains: ['brasserie-bot-api.onrender.com'],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,
};

export default nextConfig;
