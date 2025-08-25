import express from 'express';
import { body, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { updateUserLocation, getNearbyAreas } from '../controllers/locationController.js';

const router = express.Router();

// Update user's current location
const locationValidation = [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
];

router.put('/update', 
  authenticateToken,
  locationValidation,
  handleValidationErrors,
  updateUserLocation
);

// Get nearby areas
const nearbyValidation = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isInt({ min: 1000, max: 50000 })
    .withMessage('Radius must be between 1km-50km')
];

router.get('/nearby',
  nearbyValidation,
  handleValidationErrors,
  getNearbyAreas
);

export default router;
