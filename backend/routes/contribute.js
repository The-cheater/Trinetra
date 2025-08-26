import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { contributeReport, upload } from '../controllers/contributeController.js'; // Fixed import name

const router = express.Router();

const contributeValidation = [
  body('category')
    .isIn(['Traffic', 'Accident', 'Road Work', 'Flood', 'Public Event', 'Hazard', 'Other'])
    .withMessage('Invalid category selected'),
    
  body('severity')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid severity level'),
    
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10-500 characters'),
    
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .custom((value) => {
      try {
        // Parse location if it's a string
        const loc = typeof value === 'string' ? JSON.parse(value) : value;
        
        // Validate lat and lng are numbers
        if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
          throw new Error('Invalid coordinates');
        }
        
        // Validate coordinate ranges
        if (loc.lat < -90 || loc.lat > 90 || loc.lng < -180 || loc.lng > 180) {
          throw new Error('Coordinates out of range');
        }
        
        return true;
      } catch (error) {
        throw new Error('Invalid location format. Must be valid coordinates.');
      }
    }),
    
  body('locationName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location name must be between 2-100 characters')
];

// POST /api/contribute - Submit incident report with optional photo
router.post('/', 
  authenticateToken,        // Authenticate user first
  upload.single('photo'),   // Handle photo upload (creates req.file)
  contributeValidation,     // Validate request body
  handleValidationErrors,   // Handle validation errors
  contributeReport          // Process the report (correct function name)
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Contribute service is healthy',
    timestamp: new Date().toISOString(),
    upload_limit: '5MB'
  });
});

export default router;
