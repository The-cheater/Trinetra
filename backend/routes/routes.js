import express from 'express';
import { body, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';
import { 
  getRoutes, 
  getRouteWithIncidents, 
  getNearbyPlaces,
  getRouteComparison 
} from '../controllers/routesController.js';

const router = express.Router();

// Validation for route requests
const routeValidation = [
  body('origin.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid origin latitude required'),
  body('origin.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid origin longitude required'),
  body('destination.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid destination latitude required'),
  body('destination.lng').isFloat({ min: -180, max: 180 }).withMessage('Valid destination longitude required')
];

// Validation for nearby places
const placesValidation = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
];

// Get all route options (fastest, eco, safest)
router.post('/', routeValidation, handleValidationErrors, getRoutes);

// Get route comparison with analysis
router.post('/compare', routeValidation, handleValidationErrors, getRouteComparison);

// Get route with nearby incidents
router.post('/with-incidents', routeValidation, handleValidationErrors, getRouteWithIncidents);

// Get nearby places (works with SerpAPI)
router.get('/nearby', placesValidation, handleValidationErrors, getNearbyPlaces);

export default router;
