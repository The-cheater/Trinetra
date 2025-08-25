import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

// Get location-based threads for user's city
export const getThreads = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 25000, // 25km default radius for city-level
      category,
      page = 1,
      limit = 20,
      user_city_only = 'false' // New parameter for city-specific filtering
    } = req.query;

    let query = { status: 'verified' };
    let userLocation = null;

    // Get user's saved location if authenticated and user_city_only is true
    if (req.user && user_city_only === 'true') {
      const user = await User.findById(req.user._id).select('location city');
      if (user && user.location && user.location.coordinates) {
        userLocation = {
          coordinates: user.location.coordinates,
          city: user.city
        };
      }
    }

    // Location-based filtering using $geoWithin (fixes the $near error)
    if (userLocation && userLocation.coordinates) {
      // Use user's saved city location
      query.location = {
        $geoWithin: {
          $centerSphere: [
            userLocation.coordinates, // [lng, lat]
            parseInt(radius) / 6378100 // Convert meters to radians
          ]
        }
      };
    } else if (lat && lng) {
      // Use provided coordinates
      query.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)], // [lng, lat]
            parseInt(radius) / 6378100 // Convert meters to radians
          ]
        }
      };
    }

    // Category filtering
    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('userId', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Post.countDocuments(query);

    // Add distance calculation for each post
    const postsWithDistance = posts.map(post => {
      let distance = null;
      if ((userLocation || (lat && lng)) && post.location) {
        const userCoords = userLocation ? userLocation.coordinates : [parseFloat(lng), parseFloat(lat)];
        distance = calculateDistance(
          userCoords[1], userCoords[0], // lat, lng
          post.location.coordinates[1], post.location.coordinates[0]
        );
      }

      return {
        _id: post._id,
        category: post.category,
        description: post.description,
        locationName: post.locationName,
        severity: post.severity,
        photo_url: post.photo_url,
        confidence_score: post.confidence_score,
        author: post.userId?.name || 'Anonymous',
        author_city: post.userId?.city,
        createdAt: post.createdAt,
        distance_km: distance ? Math.round(distance * 10) / 10 : null, // Rounded to 1 decimal
        location: post.location
      };
    });

    // Sort by distance if location-based query (optional)
    if (userLocation || (lat && lng)) {
      postsWithDistance.sort((a, b) => {
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
      });
    }

    res.json({
      success: true,
      data: {
        posts: postsWithDistance,
        user_location: userLocation ? {
          city: userLocation.city,
          coordinates: userLocation.coordinates
        } : null,
        filters_applied: {
          location_based: !!(userLocation || (lat && lng)),
          city: userLocation?.city || 'Manual location',
          category: category || 'All',
          radius_km: parseInt(radius) / 1000
        },
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: posts.length,
          totalPosts: total
        }
      }
    });

  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch threads',
      error: error.message
    });
  }
};

// Get single thread details
export const getThread = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('userId', 'name')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch thread',
      error: error.message
    });
  }
};

// Get comments for a thread
export const getThreadComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find({ postId: id })
      .populate('userId', 'name')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          current: parseInt(page),
          count: comments.length
        }
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

// Add comment to thread
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, parentCommentId } = req.body;
    const userId = req.user._id;

    // Check if post exists
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Thread not found'
      });
    }

    const comment = new Comment({
      postId: id,
      userId,
      body,
      parentCommentId: parentCommentId || null,
      expiresAt: post.expiresAt // Same TTL as the post
    });

    await comment.save();
    await comment.populate('userId', 'name');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Get city-specific statistics
export const getCityStats = async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'City parameter is required'
      });
    }

    // Get posts from users in this city
    const cityUsers = await User.find({ city: { $regex: city, $options: 'i' } }).select('_id');
    const cityUserIds = cityUsers.map(user => user._id);

    // Aggregate statistics for the city
    const stats = await Post.aggregate([
      {
        $match: {
          userId: { $in: cityUserIds },
          status: 'verified',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence_score' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalIncidents = await Post.countDocuments({
      userId: { $in: cityUserIds },
      status: 'verified'
    });

    res.json({
      success: true,
      data: {
        city,
        total_incidents: totalIncidents,
        last_30_days: stats,
        active_reporters: cityUsers.length
      }
    });

  } catch (error) {
    console.error('City stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get city statistics',
      error: error.message
    });
  }
};

// Helper function to calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};
