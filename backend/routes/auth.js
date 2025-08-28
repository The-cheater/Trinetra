import express from 'express';
import { 
  login, 
  register, 
  refreshToken, 
  verifyToken,
  getProfile, 
  logout, 
  logoutAll 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/verify-token', verifyToken);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);

export default router;
