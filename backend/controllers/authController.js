import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// Store refresh tokens in memory (use Redis/Database in production)
const refreshTokens = new Set();

// Generate Access Token (short-lived - 15 minutes)
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      userId: user.userId,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate Refresh Token (long-lived - 7 days)
const generateRefreshToken = (userId) => {
  const refreshToken = jwt.sign(
    { 
      userId: userId,
      tokenId: uuidv4(),
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  refreshTokens.add(refreshToken);
  return refreshToken;
};

// Registration Controller
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Validate input types
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input format'
      });
    }

    if (password.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 3 characters long'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Normalize email to lowercase for consistency
    const emailLower = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Hash password with salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with all required fields
    const newUser = new User({
      userId: uuidv4(),
      name: name.trim(),
      email: emailLower,
      password: hashedPassword,
      reports_submitted: 0,
      credibility_score: 75,
      total_vision_analyses: 0,
      high_credibility_posts: 0,
      avg_confidence_score: 0,
      vision_api_stats: {
        total_images_analyzed: 0,
        avg_vision_score: 0,
        categories_detected: [],
        safety_violations: 0
      },
      city: 'Unknown',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      joinDate: new Date(),
      last_active: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save user to database
    await newUser.save();

    // Validate JWT secrets
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error('❌ JWT secrets not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser.userId);

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Log successful registration
    console.log(`✅ User registered successfully: ${emailLower}`);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        accessToken,
        user: {
          userId: newUser.userId,
          name: newUser.name,
          email: newUser.email,
          credibility_score: newUser.credibility_score,
          reports_submitted: newUser.reports_submitted
        }
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate key error (in case of race condition)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// Enhanced Login Controller with Refresh Tokens
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 Login request received:', { 
      email: email || 'MISSING', 
      password: password ? 'PROVIDED' : 'MISSING' 
    });

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Validate input types to prevent startsWith error
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid input format'
      });
    }

    const emailLower = email.toLowerCase().trim();
    console.log(`🔍 Login attempt for: ${emailLower}`);

    // Find user in database
    const user = await User.findOne({ email: emailLower });
    
    if (!user) {
      console.log(`❌ User not found: ${emailLower}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log(`✅ User found: ${emailLower}`);

    // Validate stored password exists and is a string
    if (!user.password || typeof user.password !== 'string') {
      console.log(`❌ Invalid password hash stored for user: ${emailLower}`);
      return res.status(500).json({
        success: false,
        message: 'Account authentication error. Please contact support.'
      });
    }

    // Check if password is plaintext or hashed
    let isPasswordValid = false;

    try {
      // Check if password is bcrypt hashed (starts with $2a$ or $2b$)
      if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        console.log('🔒 Using bcrypt comparison (secure)');
        isPasswordValid = await bcrypt.compare(password, user.password);
      } else {
        // Password is plaintext - direct comparison (legacy support)
        console.log('⚠️ Using plaintext comparison - upgrading to hash');
        isPasswordValid = (user.password === password);
        
        // If password is correct, upgrade to hash for future logins
        if (isPasswordValid) {
          const hashedPassword = await bcrypt.hash(password, 12);
          await User.updateOne(
            { userId: user.userId },
            { 
              password: hashedPassword,
              updatedAt: new Date()
            }
          );
          console.log(`✅ Password upgraded to hash for user: ${emailLower}`);
        }
      }
    } catch (bcryptError) {
      console.error('❌ Password comparison error:', bcryptError);
      return res.status(500).json({
        success: false,
        message: 'Authentication error. Please try again.'
      });
    }
    
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${emailLower}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Validate JWT secrets exist
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.error('❌ JWT secrets not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.userId);

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Update last active timestamp
    await User.updateOne(
      { userId: user.userId },
      { 
        last_active: new Date(),
        updatedAt: new Date()
      }
    );

    console.log(`✅ Login successful for: ${emailLower}`);

    // Return success response with tokens
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || '',
          city: user.city || 'Unknown',
          credibility_score: user.credibility_score || 75,
          reports_submitted: user.reports_submitted || 0,
          high_credibility_posts: user.high_credibility_posts || 0,
          total_vision_analyses: user.total_vision_analyses || 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Login error:', {
      message: error.message,
      stack: error.stack,
      email: req.body?.email || 'UNKNOWN'
    });
    
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        location: 'authController.js:login'
      })
    });
  }
};

// Refresh Token endpoint
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    console.log('🔄 Refresh token request received');

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      if (!decoded.userId || decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token format'
        });
      }

      const user = await User.findOne({ userId: decoded.userId });
      if (!user) {
        refreshTokens.delete(refreshToken); // Clean up invalid token
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(user);
      
      // Rotate refresh token for security
      refreshTokens.delete(refreshToken);
      const newRefreshToken = generateRefreshToken(user.userId);

      // Set new refresh token cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      console.log(`✅ Token refreshed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          user: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture || '',
            city: user.city || 'Unknown',
            credibility_score: user.credibility_score || 75,
            reports_submitted: user.reports_submitted || 0,
            high_credibility_posts: user.high_credibility_posts || 0,
            total_vision_analyses: user.total_vision_analyses || 0
          }
        }
      });

    } catch (jwtError) {
      console.error('❌ Refresh token verification failed:', jwtError.message);
      refreshTokens.delete(refreshToken); // Clean up invalid token
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// Verify Token endpoint (for checking if access token is still valid)
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ userId: decoded.userId }).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture || '',
            city: user.city || 'Unknown',
            credibility_score: user.credibility_score || 75,
            reports_submitted: user.reports_submitted || 0,
            high_credibility_posts: user.high_credibility_posts || 0,
            total_vision_analyses: user.total_vision_analyses || 0
          }
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired access token'
      });
    }

  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture || '',
          bio: user.bio || '',
          city: user.city || 'Unknown',
          joinDate: user.joinDate,
          credibility_score: user.credibility_score || 75,
          reports_submitted: user.reports_submitted || 0,
          high_credibility_posts: user.high_credibility_posts || 0,
          total_vision_analyses: user.total_vision_analyses || 0,
          vision_api_stats: user.vision_api_stats || {
            total_images_analyzed: 0,
            avg_vision_score: 0,
            categories_detected: [],
            safety_violations: 0
          },
          last_active: user.last_active
        }
      }
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Enhanced Logout with token cleanup
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    // Remove refresh token from memory store
    if (refreshToken && refreshTokens.has(refreshToken)) {
      refreshTokens.delete(refreshToken);
      console.log('✅ Refresh token removed from store');
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Update user's last active time
    if (req.user?.userId) {
      await User.updateOne(
        { userId: req.user.userId },
        { 
          last_active: new Date(),
          updatedAt: new Date()
        }
      );
    }

    console.log('✅ User logged out successfully');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Logout from all devices
export const logoutAll = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (userId) {
      // Remove all refresh tokens for this user (in production, store tokens by userId)
      const tokensToDelete = [];
      for (const token of refreshTokens) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
          if (decoded.userId === userId) {
            tokensToDelete.push(token);
          }
        } catch (error) {
          // Invalid token, remove it anyway
          tokensToDelete.push(token);
        }
      }
      
      tokensToDelete.forEach(token => refreshTokens.delete(token));
      
      // Update user's last active time
      await User.updateOne(
        { userId },
        { 
          last_active: new Date(),
          updatedAt: new Date()
        }
      );
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    console.log(`✅ User logged out from all devices`);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    console.error('❌ Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout from all devices failed'
    });
  }
};

export default {
  register,
  login,
  refreshToken,
  verifyToken,
  getProfile,
  logout,
  logoutAll
};
