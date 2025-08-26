import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import contributeRoutes from './routes/contribute.js';
import threadsRoutes from './routes/threads.js';
import routesRoutes from './routes/routes.js';
import profileRoutes from './routes/profile.js';
import locationRoutes from './routes/location.js';
import commentRoutes from './routes/comments.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// MongoDB connection event listeners
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected');
});

const app = express();

// Security middleware
app.use(helmet());

// General rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Much higher for dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints - more lenient in development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes instead of 1 hour
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // Much higher for dev
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development for easier testing
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Stricter rate limiting for contribute endpoint
const contributeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 100 : 10,
  message: {
    success: false,
    message: 'Too many contribution attempts, please try again later.'
  }
});

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging for debugging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/contribute', contributeLimiter, contributeRoutes);
app.use('/api/threads', threadsRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/comments', commentRoutes);

// Serve uploaded files (for development)
app.use('/uploads', express.static('./uploads'));

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is running!',
    database: 'Connected to TRINETRA',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: TRINETRA`);
  console.log(`🔍 AI Engine: SerpAPI Multi-Source Verification`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`📝 Contribute endpoint: http://localhost:${PORT}/api/contribute`);
  console.log(`🧵 Threads endpoint: http://localhost:${PORT}/api/threads`);
  console.log(`🗺️ Routes endpoint: http://localhost:${PORT}/api/routes`);
  console.log(`👤 Profile endpoint: http://localhost:${PORT}/api/profile/*`);
  console.log(`📍 Location endpoint: http://localhost:${PORT}/api/location/*`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Graceful shutdown initiated...');
  await mongoose.connection.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('🔴 Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('🔴 Uncaught Exception thrown');
  console.log(err);
  process.exit(1);
});
