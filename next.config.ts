import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.carrelais.com",
      },
      {
        protocol: "https",
        hostname: "1459a5bfb6b9dfdb19628a6ada12cbd2.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
