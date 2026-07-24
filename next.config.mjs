/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable gzip/brotli compression for all responses
  compress: true,

  // 👇 Ye line add karo
  productionBrowserSourceMaps: false,

  // Remove unnecessary X-Powered-By header
  poweredByHeader: false,

  // Optimize images with modern formats + responsive breakpoints
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@google/generative-ai",
    ],
  },
};

export default nextConfig;