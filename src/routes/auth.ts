import { Router, Request, Response } from 'express';
import passport from 'passport';
import { User } from '../models/User';

const router = Router();

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      authProvider: 'local',
    });

    // Login user (create session)
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error creating session',
        });
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          hasPassword: !!user.password,
        },
      });
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Block OAuth-only users (no password set) from email/password login
    if (user.authProvider !== 'local' && !user.password) {
      return res.status(400).json({
        success: false,
        message: `Please login with ${user.authProvider}`,
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Login user (create session)
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error creating session',
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          hasPassword: !!user.password,
        },
      });
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  const user = req.user as any;
  res.json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      authProvider: user.authProvider,
      hasPassword: !!user.password,
    },
  });
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out',
      });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error destroying session',
        });
      }

      res.clearCookie('connect.sid');
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/?error=auth_failed',
    session: true,
  }),
  (req: Request, res: Response) => {
    // Successful authentication, redirect to search
    res.redirect('/search?login=success');
  }
);

// @route   PUT /api/auth/profile
// @desc    Update user profile (name, email, avatar)
// @access  Private
router.put('/profile', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const { _id } = req.user as any;
    const { name, email, avatar } = req.body;

    const dbUser = await User.findById(_id);
    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) dbUser.name = name;

    if (email && email !== dbUser.email) {
      const existing = await User.findOne({ email, _id: { $ne: _id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      dbUser.email = email;
    }

    if (avatar !== undefined) dbUser.avatar = avatar;

    await dbUser.save();

    res.json({
      success: true,
      user: {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        authProvider: dbUser.authProvider,
        hasPassword: !!dbUser.password,
      },
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// @route   PUT /api/auth/password
// @desc    Create or update password (supports OAuth users setting a password)
// @access  Private
router.put('/password', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const { _id } = req.user as any;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const dbUser = await User.findById(_id);
    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If user already has a password, require current password verification
    if (dbUser.password) {
      const isValid = await dbUser.comparePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    dbUser.password = newPassword;
    await dbUser.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Password update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

export default router;
