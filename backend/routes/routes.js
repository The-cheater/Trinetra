import express from 'express';
import { body, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';
import { 
  getRoutes, 
  getRouteWithIncidents, 
  getNearbyPlaces,
  getRouteComparison 
} from '../controllers/routesController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation for route requests
const routeValidation = [
  body('origin')
    .notEmpty()
    .withMessage('Origin is required'),
  body('origin.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid origin latitude required (-90 to 90)'),
  body('origin.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid origin longitude required (-180 to 180)'),
  body('destination')
    .notEmpty()
    .withMessage('Destination is required'),
  body('destination.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid destination latitude required (-90 to 90)'),
  body('destination.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid destination longitude required (-180 to 180)'),
  body('mode')
    .optional()
    .isIn(['fastest', 'eco', 'safest'])
    .withMessage('Mode must be fastest, eco, or safest')
];

// Validation for nearby places
const placesValidation = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude required (-90 to 90)'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude required (-180 to 180)'),
  query('radius')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Radius must be between 1 and 50 km'),
  query('type')
    .optional()
    .isString()
    .withMessage('Type must be a string'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Get all route options (fastest, eco, safest)
router.post('/', 
  optionalAuth, // Optional authentication for better results
  routeValidation, 
  handleValidationErrors, 
  getRoutes
);

// Get route comparison with analysis
router.post('/compare', 
  optionalAuth,
  routeValidation, 
  handleValidationErrors, 
  getRouteComparison
);

// Get route with nearby incidents (requires auth for personalized results)
router.post('/with-incidents', 
  authenticateToken, // Requires authentication
  routeValidation, 
  handleValidationErrors, 
  getRouteWithIncidents
);

// Get nearby places (works with SerpAPI)
router.get('/nearby', 
  placesValidation, 
  handleValidationErrors, 
  getNearbyPlaces
);

// Health check for routes service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Routes service is healthy',
    timestamp: new Date().toISOString(),
    services: {
      serpapi: process.env.SERPAPI_KEY ? 'configured' : 'not configured',
      google_maps: process.env.GOOGLE_MAPS_API_KEY ? 'configured' : 'not configured'
    }
  });
});

export default router;
