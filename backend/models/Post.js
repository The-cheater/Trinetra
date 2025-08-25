import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Traffic', 'Accident', 'Road Work', 'Flood', 'Public Event', 'Hazard', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  locationName: String, // Human readable location
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  photo_url: String,
  confidence_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['verified', 'unverified', 'rejected'],
    default: 'unverified'
  },
  verification_reason: String,
  evidence: [{
    source: String,
    score: Number,
    details: String
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
postSchema.index({ location: '2dsphere' });

export default mongoose.model('Post', postSchema);
