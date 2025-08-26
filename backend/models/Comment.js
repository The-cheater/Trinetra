import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true // For faster lookup
  },
  userId: {
    type: String, // Match your User schema
    required: true,
    index: true
  },
  author: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true,
    maxlength: 500
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days TTL
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Indexes for better performance
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);
