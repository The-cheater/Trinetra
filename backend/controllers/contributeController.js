import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import vision from '@google-cloud/vision';
import Post from '../models/Post.js';
import User from '../models/User.js';

// Initialize AI services
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  projectId: process.env.GOOGLE_PROJECT_ID
});

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

// Google Vision API Analysis
const analyzeImageWithVision = async (imagePath) => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Starting Google Vision API analysis for:', imagePath);
    
    // Run multiple detection features
    const [labelResult] = await visionClient.labelDetection(imagePath);
    const [textResult] = await visionClient.textDetection(imagePath);
    const [safeSearchResult] = await visionClient.safeSearchDetection(imagePath);
    const [objectResult] = await visionClient.objectLocalization(imagePath);
    const [propertiesResult] = await visionClient.imageProperties(imagePath);

    // Process labels
    const labels = labelResult.labelAnnotations?.map(label => ({
      name: label.description,
      confidence: Math.round(label.score * 100),
      topicality: Math.round(label.topicalityScore * 100)
    })) || [];

    // Process text annotations
    const textAnnotations = textResult.textAnnotations?.slice(0, 5).map(text => ({
      description: text.description?.substring(0, 100),
      confidence: Math.round((text.confidence || 0.5) * 100)
    })) || [];

    // Process safe search
    const safeSearch = safeSearchResult.safeSearchAnnotation;
    const safetyLevels = {
      'VERY_UNLIKELY': 5, 'UNLIKELY': 4, 'POSSIBLE': 3, 'LIKELY': 2, 'VERY_LIKELY': 1
    };
    
    const safetyScore = Math.min(
      safetyLevels[safeSearch?.adult] || 5,
      safetyLevels[safeSearch?.violence] || 5,
      safetyLevels[safeSearch?.racy] || 5
    );

    // Process objects
    const objects = objectResult.localizedObjectAnnotations?.slice(0, 10).map(obj => ({
      name: obj.name,
      confidence: Math.round(obj.score * 100),
      bounding_box: {
        x1: obj.boundingPoly?.normalizedVertices?.[0]?.x || 0,
        y1: obj.boundingPoly?.normalizedVertices?.[0]?.y || 0,
        x2: obj.boundingPoly?.normalizedVertices?.[2]?.x || 1,
        y2: obj.boundingPoly?.normalizedVertices?.[2]?.y || 1
      }
    })) || [];

    // Process image properties
    const colors = propertiesResult.imagePropertiesAnnotation?.dominantColors?.colors?.slice(0, 5).map(color => ({
      red: color.color?.red || 0,
      green: color.color?.green || 0,
      blue: color.color?.blue || 0,
      pixelFraction: color.pixelFraction || 0
    })) || [];

    // Calculate credibility score based on Vision API results
    let credibilityScore = 50; // Base score

    // Factor 1: Label relevance and confidence
    const relevantLabels = labels.filter(label => 
      ['vehicle', 'car', 'road', 'street', 'traffic', 'accident', 'construction', 'warning', 'sign', 'building', 'infrastructure']
        .some(keyword => label.name.toLowerCase().includes(keyword))
    );
    
    if (relevantLabels.length > 0) {
      const avgLabelConfidence = relevantLabels.reduce((sum, label) => sum + label.confidence, 0) / relevantLabels.length;
      credibilityScore += Math.min(avgLabelConfidence * 0.3, 25);
    }

    // Factor 2: Safety assessment
    credibilityScore += safetyScore * 4; // Max 20 points

    // Factor 3: Object detection quality
    if (objects.length > 0) {
      const avgObjectConfidence = objects.reduce((sum, obj) => sum + obj.confidence, 0) / objects.length;
      credibilityScore += Math.min(avgObjectConfidence * 0.15, 10);
    }

    // Factor 4: Text content (road signs, etc.)
    if (textAnnotations.length > 0) {
      const hasRelevantText = textAnnotations.some(text => 
        ['stop', 'caution', 'warning', 'road', 'street', 'avenue', 'highway', 'km', 'speed']
          .some(keyword => text.description.toLowerCase().includes(keyword))
      );
      if (hasRelevantText) credibilityScore += 5;
    }

    // Factor 5: Image quality indicators
    if (colors.length >= 3) credibilityScore += 5; // Good color variety indicates real photo

    // Cap the score
    credibilityScore = Math.min(Math.max(credibilityScore, 10), 95);

    const processingTime = Date.now() - startTime;
    
    const analysis = {
      analyzed: true,
      credibility_score: Math.round(credibilityScore),
      labels: labels.slice(0, 10), // Top 10 labels
      text_annotations: textAnnotations,
      safe_search: {
        adult: safeSearch?.adult || 'UNKNOWN',
        medical: safeSearch?.medical || 'UNKNOWN',
        spoofed: safeSearch?.spoof || 'UNKNOWN',
        violence: safeSearch?.violence || 'UNKNOWN',
        racy: safeSearch?.racy || 'UNKNOWN',
        overall_safety: safetyScore >= 4 ? 'SAFE' : 'MODERATE'
      },
      object_detection: objects,
      image_properties: {
        colors: colors,
        brightness: Math.round(Math.random() * 100), // Simplified for demo
        contrast: Math.round(Math.random() * 100)
      },
      analysis_timestamp: new Date(),
      processing_time_ms: processingTime,
      safetyViolations: safetyScore < 3 ? 1 : 0
    };

    console.log('✅ Vision API analysis completed:', {
      credibilityScore: analysis.credibility_score,
      labelsCount: labels.length,
      objectsCount: objects.length,
      processingTime: `${processingTime}ms`
    });

    return analysis;

  } catch (error) {
    console.error('❌ Google Vision API error:', error);
    return {
      analyzed: false,
      credibility_score: 40, // Lower score for failed analysis
      labels: [],
      text_annotations: [],
      safe_search: { overall_safety: 'UNKNOWN' },
      object_detection: [],
      image_properties: { colors: [] },
      analysis_timestamp: new Date(),
      processing_time_ms: Date.now() - startTime,
      error: error.message
    };
  }
};

// Gemini AI credibility scoring
const calculateAICredibilityScore = async (reportData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    return 50;
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

    if (!parsedLocation.lat || !parsedLocation.lng) {
      return res.status(400).json({
        success: false,
        message: 'Location must include lat and lng coordinates'
      });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    let visionAnalysis = null;

    // Analyze image with Google Vision API if photo is uploaded
    if (req.file) {
      const imagePath = path.join('./uploads', req.file.filename);
      visionAnalysis = await analyzeImageWithVision(imagePath);
    }

    // Get Gemini AI credibility score
    const aiScore = await calculateAICredibilityScore({
      category,
      description,
      locationName: locationName || `${parsedLocation.lat.toFixed(4)}, ${parsedLocation.lng.toFixed(4)}`,
      severity,
      hasPhoto: !!req.file
    });

    // Calculate final confidence score
    let confidenceScore = Math.floor((aiScore * 0.5) + (50 * 0.3)); // 50% AI + 30% base

    // Add Vision API score if available
    if (visionAnalysis && visionAnalysis.analyzed) {
      confidenceScore = Math.floor(
        (aiScore * 0.4) + 
        (visionAnalysis.credibility_score * 0.4) + 
        (50 * 0.2)
      );
    }

    // Enhancement factors
    if (photoUrl) confidenceScore = Math.min(confidenceScore + 10, 100);
    if (locationName && locationName.trim() !== '') confidenceScore = Math.min(confidenceScore + 5, 100);
    if (description && description.length > 50) confidenceScore = Math.min(confidenceScore + 5, 100);

    // Create evidence array
    const evidence = [
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
    ];

    if (visionAnalysis && visionAnalysis.analyzed) {
      evidence.push({
        source: 'google_vision',
        score: visionAnalysis.credibility_score,
        details: `Vision API analysis: ${visionAnalysis.labels.length} labels, ${visionAnalysis.object_detection.length} objects detected`,
        timestamp: new Date()
      });
    }

    // Create new post
    const newPost = new Post({
      userId: req.user.userId,
      category: category,
      description: description,
      location: {
        type: 'Point',
        coordinates: [parsedLocation.lng, parsedLocation.lat]
      },
      locationName: locationName || `${parsedLocation.lat.toFixed(4)}, ${parsedLocation.lng.toFixed(4)}`,
      severity: severity || 'Medium',
      photo_url: photoUrl,
      confidence_score: confidenceScore,
      status: confidenceScore >= 70 ? 'verified' : 'unverified',
      vision_analysis: visionAnalysis,
      evidence: evidence,
      author: req.user.name,
      upvotes: 0,
      downvotes: 0,
      comments_count: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const savedPost = await newPost.save();

    // Update user statistics and credibility
    const user = await User.findOne({ userId: req.user.userId });
    if (user) {
      user.reports_submitted += 1;
      await user.updateCredibilityScore(confidenceScore, visionAnalysis);
    }

    console.log(`✅ Report submitted by ${req.user.name}: ${category} - ${confidenceScore}% confidence (AI: ${aiScore}%, Vision: ${visionAnalysis?.credibility_score || 'N/A'}%)`);

    // Prepare response with detailed analysis
    const responseData = {
      postId: savedPost._id,
      confidence_score: confidenceScore,
      ai_score: aiScore,
      vision_score: visionAnalysis?.credibility_score || null,
      status: savedPost.status,
      photo_url: photoUrl,
      vision_analysis: visionAnalysis ? {
        labels: visionAnalysis.labels.slice(0, 5),
        objects_detected: visionAnalysis.object_detection.length,
        text_detected: visionAnalysis.text_annotations.length > 0,
        safety_rating: visionAnalysis.safe_search.overall_safety,
        processing_time: visionAnalysis.processing_time_ms
      } : null,
      user_credibility_updated: user ? user.credibility_score : null
    };

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully with AI analysis',
      data: responseData
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
