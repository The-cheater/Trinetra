import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { calculateConfidence } from '../utils/confidence.js';
// Remove this line: import { uploadToStorage } from '../utils/storage.js';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000, // 5MB default
  },
  fileFilter
});

export const contributeIncident = async (req, res) => {
  try {
    const { category, severity, description, location, locationName } = req.body;
    const userId = req.user._id;

    // Parse location coordinates
    let coordinates;
    try {
      const locationData = JSON.parse(location);
      coordinates = [locationData.lng, locationData.lat]; // MongoDB expects [lng, lat]
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location format'
      });
    }

    let photoUrl = null;
    let tempFilePath = null;

    // Handle file upload if present
    if (req.file) {
      tempFilePath = req.file.path;
      // For now, we'll use local storage
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Calculate confidence score using AI
    const confidenceResult = await calculateConfidence({
      description,
      category,
      location: coordinates,
      locationName,
      photoPath: tempFilePath,
      userId: req.user.userId
    });

    // Determine status based on confidence score
    let status = 'rejected';
    if (confidenceResult.score >= 70) {
      status = 'verified';
    } else if (confidenceResult.score >= 40) {
      status = 'unverified';
    }

    // Create post
    const post = new Post({
      userId,
      category,
      description,
      location: {
        type: 'Point',
        coordinates
      },
      locationName,
      severity,
      photo_url: photoUrl,
      confidence_score: confidenceResult.score,
      status,
      verification_reason: confidenceResult.reason,
      evidence: confidenceResult.evidence || []
    });

    await post.save();

    // Update user statistics
    await User.findByIdAndUpdate(userId, {
      $inc: {
        reports_submitted: 1,
        ...(status === 'verified' && { reports_verified: 1 }),
        ...(status === 'rejected' && { reports_rejected: 1 })
      }
    });

    // Recalculate user's average credibility score
    const userPosts = await Post.find({ userId }).select('confidence_score');
    const avgScore = userPosts.reduce((sum, post) => sum + post.confidence_score, 0) / userPosts.length;
    await User.findByIdAndUpdate(userId, { avg_credibility_score: avgScore });

    // Keep temp file for now (in production, you'd upload to cloud storage and clean up)
    // if (tempFilePath && fs.existsSync(tempFilePath)) {
    //   fs.unlinkSync(tempFilePath);
    // }

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully',
      data: {
        postId: post._id,
        confidence_score: confidenceResult.score,
        status,
        reason: confidenceResult.reason
      }
    });

  } catch (error) {
    console.error('Contribute error:', error);
    
    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit incident report',
      error: error.message
    });
  }
};
