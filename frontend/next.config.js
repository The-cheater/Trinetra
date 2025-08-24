/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.pexels.com'],
  },
  experimental: {
    appDir: true,
  },
  // Remove directory overrides since we're in the frontend directory
  distDir: '.next',
  basePath: ''
}

module.exports = nextConfig