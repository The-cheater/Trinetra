import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: String, // Changed to String to match your auth system
    required: true,
    index: true // Add index for better query performance
  },
  category: {
    type: String,
    required: true,
    enum: ['Traffic', 'Road Work', 'Accident', 'Flood', 'Public Event', 'Hazard', 'Other'],
    index: true // Add index for filtering
  },
  description: {
    type: String,
    required: true,
    maxlength: 500 // Reasonable limit
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude] - GeoJSON standard
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  locationName: {
    type: String,
    maxlength: 200 // Reasonable limit for location names
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
    index: true // Add index for filtering
  },
  photo_url: {
    type: String,
    validate: {
      validator: function(url) {
        return !url || /^\/uploads\//.test(url); // Validate upload path format
      },
      message: 'Invalid photo URL format'
    }
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    index: true // Add index for sorting by confidence
  },
  status: {
    type: String,
    enum: ['verified', 'unverified', 'rejected'],
    default: 'unverified',
    index: true // Add index for filtering by status
  },
  verification_reason: {
    type: String,
    maxlength: 200
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
  // Add author information for better UX
  author: {
    type: String, // User's name
    required: true
  },
  author_city: {
    type: String // Optional city info
  },
  // Engagement metrics
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
  // Auto-expiry for cleanup
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    index: { expireAfterSeconds: 0 } // TTL index
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  versionKey: false // Disable __v field
});

// Indexes for better query performance
postSchema.index({ location: '2dsphere' }); // Geospatial queries
postSchema.index({ createdAt: -1 }); // Recent posts first
postSchema.index({ status: 1, createdAt: -1 }); // Filter by status and sort by date
postSchema.index({ category: 1, createdAt: -1 }); // Filter by category and sort by date
postSchema.index({ userId: 1, createdAt: -1 }); // User's posts
postSchema.index({ expiresAt: 1 }); // TTL index for cleanup

// Virtual for distance (will be populated during queries)
postSchema.virtual('distance_km').get(function() {
  return this._distance_km;
});

// Transform output to include virtuals and format data
postSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Format the response
    ret.id = ret._id;
    delete ret._id;
    
    // Format location for easier use
    if (ret.location && ret.location.coordinates) {
      ret.coordinates = {
        lat: ret.location.coordinates[1],
        lng: ret.location.coordinates[0]
      };
    }
    
    // Format dates
    if (ret.createdAt) {
      ret.created_at = ret.createdAt;
    }
    if (ret.updatedAt) {
      ret.updated_at = ret.updatedAt;
    }
    
    return ret;
  }
});

// Pre-save middleware to update related counts
postSchema.pre('save', function(next) {
  // Calculate confidence score if not set
  if (this.isNew && !this.confidence_score) {
    let score = 50; // Base score
    
    if (this.photo_url) score += 20; // Has photo evidence
    if (this.locationName && this.locationName.trim()) score += 10; // Named location
    if (this.description && this.description.length > 50) score += 10; // Detailed description
    if (this.evidence && this.evidence.length > 0) score += 10; // Additional evidence
    
    this.confidence_score = Math.min(score, 100);
    
    // Set status based on confidence
    if (this.confidence_score >= 80) {
      this.status = 'verified';
    } else if (this.confidence_score >= 60) {
      this.status = 'unverified';
    }
  }
  
  next();
});

// Static methods for common queries
postSchema.statics.findNearby = function(lat, lng, radiusKm = 10, filters = {}) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat] // [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    },
    ...filters
  };
  
  return this.find(query);
};

postSchema.statics.findByCategory = function(category, limit = 20) {
  return this.find({ category, status: { $ne: 'rejected' } })
             .sort({ createdAt: -1 })
             .limit(limit);
};

postSchema.statics.findRecent = function(hours = 24, limit = 50) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.find({ 
    createdAt: { $gte: since },
    status: { $ne: 'rejected' }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

export default mongoose.model('Post', postSchema);
