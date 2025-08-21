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
}

module.exports = nextConfig