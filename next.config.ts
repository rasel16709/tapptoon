import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // External images are proxied through /api/img which sets long-cache
    // headers, so we don't need Next's image optimizer for them.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
};

export default nextConfig;
