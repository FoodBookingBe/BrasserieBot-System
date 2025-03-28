import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Next.js outputs files to the "out" directory for Netlify only in production
  output: process.env.NODE_ENV === 'production' ? "export" : undefined,
  // Required for Netlify, allows pre-rendering at build time
  trailingSlash: process.env.NODE_ENV === 'production',
  // Define output directory explicitly for Netlify
  distDir: process.env.NODE_ENV === 'production' ? 'out' : '.next',
  // Disable image optimization as Netlify has its own image processing
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
    // If you're loading images from external domains, add them here
    domains: ['brasserie-bot-api.onrender.com'],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,
  // Configure basePath for Netlify
  basePath: '',
};

export default nextConfig;
