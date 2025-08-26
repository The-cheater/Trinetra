
# TRINETRA: AI Agent For Urban Community  

## 🌟 Overview

TRINETRA is a modern, full-stack civic technology platform that empowers citizens to report, verify, and engage with urban incidents in real-time. The platform combines a sleek Next.js frontend with a robust Node.js backend to create a seamless community-driven safety ecosystem.

***

## 🎯 Frontend - Next.js Application

### Description

A mobile-first, responsive web application built with Next.js 14 (App Router) providing an intuitive interface for community safety engagement. Features smooth animations, real-time updates, and comprehensive theme support.

### ✨ Key Features

- **Splash Screen**: Animated logo with video introduction
- **Authentication System**: Secure signup/login with JWT integration
- **Urban Thread Feed**: Real-time community incident reports with filtering and reactions
- **Interactive Maps**: Google Maps integration with smart routing (fastest/eco/safest routes)
- **Incident Reporting**: Photo upload, geolocation, and category-based incident submission
- **User Profiles**: Statistics, contribution history, reputation system, and settings
- **Theme System**: Light/Dark mode with smooth transitions and persistent storage
- **Responsive Design**: Optimized for mobile-first usage


### 🛠️ Frontend Technologies

- **Next.js 14** with App Router for optimal performance and SSR
- **React 18** with modern hooks and functional components
- **TypeScript** for type safety and better developer experience
- **Framer Motion** for smooth animations and micro-interactions
- **Lucide React** for consistent, beautiful iconography
- **CSS Custom Properties** for comprehensive theming system


### 📁 Frontend Structure

```
app/
├── components/     # Reusable UI components (buttons, forms, modals)
├── contexts/       # React Context providers (Theme, Auth)  
├── hooks/          # Custom React hooks (useAuth, useLocation)
├── lib/            # API service layer and utilities
├── pages/          # Application routes and page components
├── types/          # TypeScript interfaces and type definitions
├── globals.css     # Global styles and CSS variables
├── layout.tsx      # Root layout with providers
└── page.tsx        # Main entry point

Configuration Files:
├── next.config.js  # Next.js configuration and API proxy
├── .env.local      # Environment variables
├── tsconfig.json   # TypeScript configuration
└── package.json    # Dependencies and scripts
```


### 🚀 Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Access application
http://localhost:3000
```


***

## ⚡ Backend - Node.js API Server

### Description

A RESTful API server built with Node.js and Express, providing secure authentication, incident management, real-time data verification, and comprehensive user management. Features intelligent confidence scoring and external API integrations.

### ✨ Key Features

- **JWT Authentication**: Secure user registration, login, and session management
- **Incident Management**: CRUD operations with geospatial queries and location filtering
- **Confidence Scoring**: AI-powered verification using SerpAPI for real-time validation
- **Community Features**: Comments system, user profiles, and reputation tracking
- **Route Planning**: Multi-modal routing (fastest, eco-friendly, safest) with cost estimation
- **File Handling**: Secure photo/video upload and storage system
- **Rate Limiting**: Protection against abuse and spam
- **Data Validation**: Comprehensive request validation and sanitization


### 🛠️ Backend Technologies

- **Node.js** with Express.js for the API server
- **MongoDB** with Mongoose ODM for data persistence
- **JSON Web Tokens (JWT)** for secure authentication
- **Multer** for file upload handling
- **Express Rate Limit** for API protection
- **SerpAPI Integration** for real-time data verification
- **Geospatial Queries** for location-based features


### 📁 Backend Structure

```
backend/
├── controllers/    # Request handlers and business logic
│   ├── authController.js      # Authentication logic
│   ├── contributeController.js # Incident reporting
│   ├── threadsController.js   # Community feed
│   ├── profileController.js   # User management
│   └── routesController.js    # Route planning
├── models/         # MongoDB schemas
│   ├── User.js     # User model with location support
│   ├── Post.js     # Incident reports with TTL
│   └── Comment.js  # Community comments
├── routes/         # API endpoint definitions
├── middleware/     # Authentication and validation
├── utils/          # Helper functions and integrations
│   ├── confidence.js # AI-powered verification engine
│   └── storage.js    # File handling utilities
├── uploads/        # Temporary file storage
├── config/         # Database configuration
├── server.js       # Application entry point
└── .env           # Environment variables
```


### 🚀 Backend Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and API keys

# Start server
node server.js

# Access API
http://localhost:8080
```


***

## 🔧 Environment Configuration

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=UrbanThreads
NEXT_PUBLIC_APP_VERSION=1.0.0

# API Keys
NEXT_PUBLIC_SERPAPI_KEY=your_serpapi_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

# Feature Flags
NEXT_PUBLIC_ENABLE_LOCATION_SERVICES=true
NEXT_PUBLIC_ENABLE_PHOTO_UPLOAD=true
NEXT_PUBLIC_DEBUG_MODE=true
```


### Backend (.env)

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/TRINETRA

# Authentication
JWT_SECRET=your_secure_jwt_secret

# API Keys
SERPAPI_KEY=your_serpapi_key

# File Upload
MAX_FILE_SIZE=5000000
UPLOAD_PATH=./uploads
```

**⚠️ Security Note**: Never commit `.env` files with production secrets to version control!

***

## 🔄 API Integration

The frontend and backend communicate through a proxy configuration in `next.config.js`:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:8080/api/:path*'
    }
  ]
}
```


### Key API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/threads` - Get community incidents with location filtering
- `POST /api/contribute` - Submit incident reports
- `GET /api/profile/me` - Get user profile and statistics
- `POST /api/routes` - Calculate optimal routes

***

## 🚀 Deployment

### Frontend Deployment

**Recommended: Vercel**

```bash
# Connect your GitHub repository to Vercel
# Configure environment variables in Vercel dashboard
# Automatic deployments on push to main branch
```

**Alternative: Traditional Hosting**

```bash
npm run build
npm start
```


### Backend Deployment

**Options: Heroku, AWS, DigitalOcean, Railway**

```bash
# For Heroku
git push heroku main

# For Docker
docker build -t trinetra-backend .
docker run -p 8080:8080 trinetra-backend
```


### Production Checklist

- [ ] Update API URLs in environment variables
- [ ] Configure HTTPS for both frontend and backend
- [ ] Set up MongoDB Atlas for production database
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting for production load

***

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive request sanitization
- **File Upload Security**: Safe handling of user uploads
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Secure configuration management

***

## 🧪 Testing

### Frontend Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Test build
npm run build
```


### Backend Testing

```bash
# Test API endpoints
npm test

# Test with specific environment
NODE_ENV=test npm test
```


***

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Follow** existing code style and patterns
4. **Add** tests for new functionality
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Development Guidelines

- Write clear, descriptive commit messages
- Add comments for complex logic
- Follow TypeScript best practices
- Test thoroughly before submitting
- Update documentation as needed

***

## 🐛 Troubleshooting

### Common Issues

**Frontend not connecting to backend:**

- Verify backend is running on port 8080
- Check `next.config.js` proxy configuration
- Confirm API URL in `.env.local`

**Geolocation not working:**

- Ensure HTTPS in production
- Check browser permissions
- Verify location services are enabled

**Image uploads failing:**

- Check file size limits
- Verify upload directory permissions
- Confirm multer configuration

***

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

***

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB team for the database platform
- SerpAPI for real-time data verification
- Google Maps for location services
- The open-source community for inspiration

***

## 📞 Support

- 📧 **Email**: support@trinetra.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

***
