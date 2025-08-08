import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Prevent server-side bundling issues for pdfjs in Next.js build by aliasing canvas to false
    // Only affects server builds; client dynamically imports the module.
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
    }
    return config
  },
};

export default nextConfig;
