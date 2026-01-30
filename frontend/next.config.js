/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Removed conflicting experimental settings
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;