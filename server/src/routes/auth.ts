import express from 'express';
import passport from 'passport';
import { register, login, logout, getCurrentUser, updateProfile, setPassword } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

// Local authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/user', isAuthenticated, getCurrentUser);

// Profile routes
router.put('/profile', isAuthenticated, updateProfile);
router.post('/set-password', isAuthenticated, setPassword);

// Google OAuth routes
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ error: 'Google OAuth is not configured on this server' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/search`);
  }
);

export default router;
