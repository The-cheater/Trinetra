import express from 'express';
import { body, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { 
  getUserProfile, 
  getMyProfile,
  updateProfile,
  getUserHistory,
  getLeaderboard
} from '../controllers/profileController.js';

const router = express.Router();

// Get current user's profile (protected)
router.get('/me', authenticateToken, getMyProfile);

// Get user profile by userId (public)
router.get('/:userId', getUserProfile);

// Update current user's profile (protected)
const updateValidation = [
  body('name').trim().isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters')
];

router.put('/me', 
  authenticateToken,
  updateValidation,
  handleValidationErrors,
  updateProfile
);

// Get current user's submission history (protected)
const historyValidation = [
  query('status').optional().isIn(['all', 'verified', 'unverified', 'rejected'])
    .withMessage('Invalid status filter'),
  query('category').optional().isIn(['all', 'Traffic', 'Accident', 'Road Work', 'Flood', 'Public Event', 'Hazard', 'Other'])
    .withMessage('Invalid category filter'),
  query('page').optional().isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1-50')
];

router.get('/me/history',
  authenticateToken,
  historyValidation,
  handleValidationErrors,
  getUserHistory
);

// Get leaderboard (public)
const leaderboardValidation = [
  query('period').optional().isIn(['all', 'month', 'week'])
    .withMessage('Invalid period filter'),
  query('limit').optional().isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1-50')
];

router.get('/leaderboard',
  leaderboardValidation,
  handleValidationErrors,
  getLeaderboard
);

export default router;
