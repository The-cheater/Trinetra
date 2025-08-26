/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove custom env - use .env.local instead
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-backend-url.com/api/:path*'  // ← Update this before deploying
          : 'http://localhost:8080/api/:path*'
      }
    ]
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ]
  },

  // Image optimization - add production domains when ready
  images: {
    domains: ['localhost'],
    // When deploying, add: ['localhost', 'your-production-domain.com', 'your-cdn-domain.com']
  },

  // Simplified webpack config
  webpack: (config) => {
    return config
  },
}

module.exports = nextConfig
