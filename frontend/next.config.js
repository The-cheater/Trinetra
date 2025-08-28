/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
          : 'http://localhost:8080/api/:path*'
      }
    ];
  },

  // CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_FRONTEND_URL || '*' : 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },

  // Image optimization domains
  images: {
    domains: ['localhost'],
    // Add production domains when deploying:
    // domains: ['localhost', 'your-backend-domain.com', 'your-cdn-domain.com']
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false, // Keep linting during builds
    dirs: ['app', 'components', 'contexts', 'lib'] // Specify directories to lint
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false // Keep TypeScript checking during builds
  },

  // Production optimizations
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Add any custom webpack configuration here if needed
    return config;
  },
};

module.exports = nextConfig;
