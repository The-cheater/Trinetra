import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { 
  getThreads, 
  getThread, 
  getThreadComments, 
  addComment,
  getCityStats  // Add this
} from '../controllers/threadsController.js';

const router = express.Router();

// Get all threads (public) - now with city filtering
router.get('/', getThreads);

// Get city-specific statistics
router.get('/city/:city/stats', getCityStats);

// Get single thread (public)
router.get('/:id', getThread);

// Get thread comments (public)
router.get('/:id/comments', getThreadComments);

// Add comment (protected)
const commentValidation = [
  body('body').trim().isLength({ min: 1, max: 300 })
    .withMessage('Comment must be between 1-300 characters')
];

router.post('/:id/comments',
  authenticateToken,
  commentValidation,
  handleValidationErrors,
  addComment
);

export default router;
