import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Traffic', 'Road Work', 'Accident', 'Flood', 'Public Event', 'Hazard', 'Other'],
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 &&
            coords[0] >= -180 && coords[0] <= 180 &&
            coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  locationName: {
    type: String,
    maxlength: 200
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
    index: true
  },
  photo_url: {
    type: String,
    validate: {
      validator: function(url) {
        return !url || /^\/uploads\//.test(url);
      },
      message: 'Invalid photo URL format'
    }
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true
  },
  status: {
    type: String,
    enum: ['verified', 'unverified', 'rejected'],
    default: 'unverified',
    index: true
  },
  // Enhanced Google Vision API Analysis
  vision_analysis: {
    analyzed: { type: Boolean, default: false },
    credibility_score: { type: Number, min: 0, max: 100 },
    labels: [{ 
      name: String, 
      confidence: Number,
      topicality: Number 
    }],
    text_annotations: [{
      description: String,
      confidence: Number
    }],
    safe_search: {
      adult: String,
      medical: String,
      spoofed: String,
      violence: String,
      racy: String,
      overall_safety: String
    },
    object_detection: [{
      name: String,
      confidence: Number,
      bounding_box: {
        x1: Number, y1: Number,
        x2: Number, y2: Number
      }
    }],
    image_properties: {
      colors: [{ red: Number, green: Number, blue: Number, pixelFraction: Number }],
      brightness: Number,
      contrast: Number
    },
    analysis_timestamp: { type: Date, default: Date.now },
    processing_time_ms: Number
  },
  evidence: [{
    source: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    details: {
      type: String,
      maxlength: 300
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  author: {
    type: String,
    required: true
  },
  author_city: {
    type: String
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  downvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  comments_count: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes
postSchema.index({ location: '2dsphere' });
postSchema.index({ createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ 'vision_analysis.analyzed': 1 });
postSchema.index({ 'vision_analysis.credibility_score': -1 });

// Transform output
postSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    
    if (ret.location && ret.location.coordinates) {
      ret.coordinates = {
        lat: ret.location.coordinates[1],
        lng: ret.location.coordinates[0]
      };
    }
    
    if (ret.createdAt) {
      ret.created_at = ret.createdAt;
    }
    
    return ret;
  }
});

export default mongoose.model('Post', postSchema);
