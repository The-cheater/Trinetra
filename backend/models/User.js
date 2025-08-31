import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 300
  },
  city: {
    type: String
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  reports_submitted: {
    type: Number,
    default: 0
  },
  // Enhanced credibility tracking
  credibility_score: {
    type: Number,
    default: 75,
    min: 0,
    max: 100
  },
  total_vision_analyses: {
    type: Number,
    default: 0
  },
  high_credibility_posts: {
    type: Number,
    default: 0
  },
  avg_confidence_score: {
    type: Number,
    default: 0
  },
  vision_api_stats: {
    total_images_analyzed: { type: Number, default: 0 },
    avg_vision_score: { type: Number, default: 0 },
    last_analysis: { type: Date },
    categories_detected: [String],
    safety_violations: { type: Number, default: 0 }
  },
  // Activity tracking
  last_active: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
userSchema.index({ location: '2dsphere' });
userSchema.index({ credibility_score: -1 });
userSchema.index({ reports_submitted: -1 });

// Methods to update credibility - FIXED NaN ISSUES
userSchema.methods.updateCredibilityScore = function(newPostScore, visionAnalysis) {
  // Validate input scores
  const validPostScore = isNaN(newPostScore) || newPostScore === null ? 0 : newPostScore;
  const totalPosts = this.reports_submitted || 0;
  const currentAvg = this.avg_confidence_score || 0;
  
  // Update average confidence score with safe division
  if (totalPosts > 0) {
    this.avg_confidence_score = ((currentAvg * (totalPosts - 1)) + validPostScore) / totalPosts;
  } else {
    this.avg_confidence_score = validPostScore;
  }
  
  // Ensure no NaN values
  if (isNaN(this.avg_confidence_score)) {
    this.avg_confidence_score = validPostScore;
  }
  
  // Update vision stats if analysis provided
  if (visionAnalysis && typeof visionAnalysis === 'object') {
    const visionScore = visionAnalysis.credibility_score || visionAnalysis.credibilityScore || 0;
    
    // Validate vision score
    if (!isNaN(visionScore) && visionScore !== null) {
      this.total_vision_analyses += 1;
      this.vision_api_stats.total_images_analyzed += 1;
      
      const currentVisionAvg = this.vision_api_stats.avg_vision_score || 0;
      const totalAnalyses = this.total_vision_analyses;
      
      // Safe division for vision average
      if (totalAnalyses > 0) {
        this.vision_api_stats.avg_vision_score = 
          ((currentVisionAvg * (totalAnalyses - 1)) + visionScore) / totalAnalyses;
      } else {
        this.vision_api_stats.avg_vision_score = visionScore;
      }
      
      // Prevent NaN in vision score
      if (isNaN(this.vision_api_stats.avg_vision_score)) {
        this.vision_api_stats.avg_vision_score = visionScore;
      }
      
      this.vision_api_stats.last_analysis = new Date();
      
      // Track categories safely
      if (visionAnalysis.labels && Array.isArray(visionAnalysis.labels)) {
        const labelNames = visionAnalysis.labels.map(label => 
          typeof label === 'string' ? label : (label.name || label)
        ).filter(name => name && typeof name === 'string');
        
        const newCategories = labelNames.filter(label => 
          !this.vision_api_stats.categories_detected.includes(label)
        );
        this.vision_api_stats.categories_detected.push(...newCategories);
      }
      
      // Track safety violations safely
      const safetyViolations = visionAnalysis.safetyViolations || 0;
      if (!isNaN(safetyViolations) && safetyViolations > 0) {
        this.vision_api_stats.safety_violations += safetyViolations;
      }
    }
  }
  
  // Update credibility score with safe calculation
  const avgConfidence = this.avg_confidence_score || 0;
  const avgVision = this.vision_api_stats.avg_vision_score || 0;
  
  this.credibility_score = Math.min(
    Math.max(
      (avgConfidence * 0.7) + (avgVision * 0.3), 
      20
    ), 
    100
  );
  
  // Final safety check for credibility score
  if (isNaN(this.credibility_score)) {
    this.credibility_score = 75; // Default fallback
  }
  
  // Update high credibility posts count
  if (validPostScore >= 80) {
    this.high_credibility_posts += 1;
  }
  
  return this.save();
};

export default mongoose.model('User', userSchema);
