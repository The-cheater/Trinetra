import User from '../models/User.js';
import Post from '../models/Post.js';

// Get user profile with statistics
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user data
    const user = await User.findOne({ userId }).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's posts with aggregation
    const postStats = await Post.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence_score' }
        }
      }
    ]);

    // Get recent posts
    const recentPosts = await Post.find({ userId: user._id })
      .select('category description status confidence_score createdAt locationName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate category breakdown
    const categoryStats = await Post.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence_score' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Calculate reputation level
    const reputationLevel = calculateReputationLevel(user.avg_credibility_score, user.reports_verified);

    res.json({
      success: true,
      data: {
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          joinDate: user.createdAt,
          stats: {
            reports_submitted: user.reports_submitted,
            reports_verified: user.reports_verified,
            reports_rejected: user.reports_rejected,
            avg_credibility_score: Math.round(user.avg_credibility_score || 0),
            reputation_level: reputationLevel
          }
        },
        recentPosts,
        analytics: {
          postsByStatus: postStats,
          postsByCategory: categoryStats,
          totalContributions: user.reports_submitted,
          successRate: user.reports_submitted > 0 
            ? Math.round((user.reports_verified / user.reports_submitted) * 100) 
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Get current user's own profile (authenticated)
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Reuse the getUserProfile logic but with authenticated user
    req.params = { userId };
    return getUserProfile(req, res);

  } catch (error) {
    console.error('My profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your profile',
      error: error.message
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long'
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true, select: '-password' }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          userId: updatedUser.userId,
          name: updatedUser.name,
          email: updatedUser.email
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get user's submission history with filters
export const getUserHistory = async (req, res) => {
  try {
    const { 
      status = 'all', 
      category = 'all',
      page = 1, 
      limit = 20 
    } = req.query;
    
    const userId = req.user._id;
    
    // Build query
    let query = { userId };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (category !== 'all') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      Post.find(query)
        .select('category description status confidence_score createdAt locationName photo_url')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: posts.length,
          totalPosts: total
        },
        filters: { status, category }
      }
    });

  } catch (error) {
    console.error('User history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission history',
      error: error.message
    });
  }
};

// Calculate reputation level based on credibility and verified reports
const calculateReputationLevel = (avgCredibility, verifiedReports) => {
  const score = avgCredibility || 0;
  const reports = verifiedReports || 0;
  
  if (score >= 85 && reports >= 20) return { level: 'Expert', badge: '🏆' };
  if (score >= 75 && reports >= 10) return { level: 'Trusted', badge: '⭐' };
  if (score >= 65 && reports >= 5) return { level: 'Contributor', badge: '📝' };
  if (reports >= 1) return { level: 'Reporter', badge: '👋' };
  return { level: 'Newcomer', badge: '🆕' };
};

// Get leaderboard (top contributors)
export const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all', limit = 10 } = req.query;
    
    // Base match query
    let matchQuery = {};
    
    // Filter by time period
    if (period === 'month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      matchQuery.createdAt = { $gte: lastMonth };
    } else if (period === 'week') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      matchQuery.createdAt = { $gte: lastWeek };
    }

    // Get top contributors
    const topUsers = await User.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
          pipeline: [
            { $match: matchQuery },
            { $match: { status: 'verified' } }
          ]
        }
      },
      {
        $project: {
          name: 1,
          userId: 1,
          reports_verified: 1,
          avg_credibility_score: 1,
          recentVerifiedPosts: { $size: '$posts' }
        }
      },
      {
        $match: {
          $or: [
            { reports_verified: { $gt: 0 } },
            { recentVerifiedPosts: { $gt: 0 } }
          ]
        }
      },
      {
        $sort: {
          avg_credibility_score: -1,
          reports_verified: -1
        }
      },
      { $limit: parseInt(limit) }
    ]);

    // Add reputation levels
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      userId: user.userId,
      verified_reports: user.reports_verified,
      avg_credibility: Math.round(user.avg_credibility_score || 0),
      reputation: calculateReputationLevel(user.avg_credibility_score, user.reports_verified),
      recent_contributions: user.recentVerifiedPosts
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
        period,
        total_users: leaderboard.length
      }
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};
