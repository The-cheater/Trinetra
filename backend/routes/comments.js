import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { addComment, getComments } from '../controllers/commentsController.js';

const router = express.Router();

const commentValidation = [
  body('postId').isMongoId().withMessage('Valid post ID required'),
  body('body').trim().isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1-500 characters')
];

router.post('/', 
  authenticateToken,
  commentValidation,
  handleValidationErrors,
  addComment
);

router.get('/:postId', getComments);

export default router;
