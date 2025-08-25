import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    }
  },
  googleId: String,
  
  // NEW: User Location Fields
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: null
    }
  },
  city: String,
  state: String,
  country: {
    type: String,
    default: 'India'
  },
  locationUpdatedAt: Date,
  
  // Existing fields
  reports_submitted: {
    type: Number,
    default: 0
  },
  reports_verified: {
    type: Number,
    default: 0
  },
  reports_rejected: {
    type: Number,
    default: 0
  },
  avg_credibility_score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create geospatial index for user location
userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema);
