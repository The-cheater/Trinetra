import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

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

    if (password.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 3 characters long'
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
      reports_verified: 0,
      reports_rejected: 0,
      avg_credibility_score: 0,
      city: 'Unknown',
      country: 'Unknown',
      state: 'Unknown',
      location: {
        type: 'Point',
        coordinates: [0, 0]
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.userId, 
        email: newUser.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log successful registration
    console.log(`✅ User registered successfully: ${emailLower}`);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          userId: newUser.userId,
          name: newUser.name,
          email: newUser.email
        },
        token
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

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const emailLower = email.toLowerCase().trim();
    console.log(`🔍 Login attempt for: ${emailLower}`);

    const user = await User.findOne({ email: emailLower });
    
    if (!user) {
      console.log(`❌ User not found: ${emailLower}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log(`✅ User found: ${emailLower}`);

    // Check if password is plaintext or hashed
    let isPasswordValid = false;

    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Password is hashed - use bcrypt compare
      console.log('🔒 Using bcrypt comparison (secure)');
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Password is plaintext - direct comparison
      console.log('⚠️ Using plaintext comparison');
      isPasswordValid = (user.password === password);
    }
    
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${emailLower}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.userId, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`✅ Login successful for: ${emailLower}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};
