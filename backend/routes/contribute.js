import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { contributeIncident, upload } from '../controllers/contributeController.js';

const router = express.Router();

const contributeValidation = [
  body('category').isIn(['Traffic', 'Accident', 'Road Work', 'Flood', 'Public Event', 'Hazard', 'Other'])
    .withMessage('Invalid category'),
  body('severity').isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid severity level'),
  body('description').trim().isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10-500 characters'),
  body('location').notEmpty()
    .withMessage('Location is required'),
  body('locationName').trim().isLength({ min: 2, max: 100 })
    .withMessage('Location name must be between 2-100 characters')
];

router.post('/', 
  authenticateToken,
  upload.single('photo'),
  contributeValidation,
  handleValidationErrors,
  contributeIncident
);

export default router;
