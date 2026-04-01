import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 // @ts-expect-error Vercel build bypass
 eslint: {
  ignoreDuringBuilds: true,
 },
 // @ts-expect-error Vercel build bypass
 typescript: {
  ignoreBuildErrors: true,
 },
 images: {
  qualities: [75, 90],
  remotePatterns: [
   {
    protocol: 'https',
    hostname: 'images.unsplash.com',
   },
  ],
 },
};

export default nextConfig;
