import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Post from '../models/Post.js';
import User from '../models/User.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// AI-powered credibility scoring
const calculateAICredibilityScore = async (reportData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
    Analyze this incident report and provide credibility score (0-100):
    
    Category: ${reportData.category}
    Description: ${reportData.description}
    Location: ${reportData.locationName || 'Coordinates provided'}
    Severity: ${reportData.severity}
    Has Photo: ${reportData.hasPhoto ? 'Yes' : 'No'}
    
    Consider:
    - Description detail and realism
    - Location relevance to incident type
    - Consistency between category and description
    - Overall plausibility
    - Language quality and specificity
    
    Respond with only a number between 0-100.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const scoreText = response.text().trim();
    
    const score = parseInt(scoreText);
    return isNaN(score) ? 50 : Math.min(Math.max(score, 0), 100);
    
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    return 50; // Fallback score
  }
};

// Enhanced contribute controller
export const contributeReport = async (req, res) => {
  try {
    const { category, severity, description, location, locationName } = req.body;

    console.log('📝 Received contribute request:', {
      category,
      severity,
      description: description ? `${description.substring(0, 50)}...` : 'No description',
      location: location ? 'Location provided' : 'No location',
      file: req.file ? req.file.filename : 'No file',
      userId: req.user?.userId
    });

    // Validate required fields
    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category and description are required'
      });
    }

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required'
      });
    }

    // Parse location
    let parsedLocation;
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location format'
      });
    }

    // Validate coordinates
    if (!parsedLocation.lat || !parsedLocation.lng) {
      return res.status(400).json({
        success: false,
        message: 'Location must include lat and lng coordinates'
      });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Get AI credibility score
    const aiScore = await calculateAICredibilityScore({
      category,
      description,
      locationName: locationName || `${parsedLocation.lat.toFixed(4)}, ${parsedLocation.lng.toFixed(4)}`,
      severity,
      hasPhoto: !!req.file
    });

    // Calculate final confidence score
    let confidenceScore = Math.floor((aiScore * 0.7) + (50 * 0.3)); // 70% AI + 30% base

    // Enhancement factors
    if (photoUrl) confidenceScore = Math.min(confidenceScore + 10, 100);
    if (locationName && locationName.trim() !== '') confidenceScore = Math.min(confidenceScore + 5, 100);
    if (description && description.length > 50) confidenceScore = Math.min(confidenceScore + 5, 100);

    // Create new post
    const newPost = new Post({
      userId: req.user.userId,
      category: category,
      description: description,
      location: {
        type: 'Point',
        coordinates: [parsedLocation.lng, parsedLocation.lat] // [longitude, latitude]
      },
      locationName: locationName || `${parsedLocation.lat.toFixed(4)}, ${parsedLocation.lng.toFixed(4)}`,
      severity: severity || 'Medium',
      photo_url: photoUrl,
      confidence_score: confidenceScore,
      status: confidenceScore >= 70 ? 'verified' : 'unverified',
      evidence: [
        {
          source: 'user_report',
          score: confidenceScore,
          details: 'Manual user submission with AI verification',
          timestamp: new Date()
        },
        {
          source: 'gemini_ai',
          score: aiScore,
          details: 'Gemini AI credibility analysis',
          timestamp: new Date()
        }
      ],
      author: req.user.name,
      upvotes: 0,
      downvotes: 0,
      comments_count: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const savedPost = await newPost.save();

    // Update user statistics
    await User.updateOne(
      { userId: req.user.userId },
      { 
        $inc: { reports_submitted: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    console.log(`✅ Report submitted by ${req.user.name}: ${category} - ${confidenceScore}% confidence (AI: ${aiScore}%)`);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        postId: savedPost._id,
        confidence_score: confidenceScore,
        ai_score: aiScore,
        status: savedPost.status,
        photo_url: photoUrl
      }
    });

  } catch (error) {
    console.error('❌ Contribute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

export default {
  contributeReport,
  upload
};
