import { Router, Request, Response } from 'express';
import passport from 'passport';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { User } from '../models/User';
import { Job } from '../models/Job';

const router = Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

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
          plan: user.plan || 'free',
          planPaidAt: user.planPaidAt,
          createdAt: user.createdAt,
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
          plan: user.plan || 'free',
          planPaidAt: user.planPaidAt,
          createdAt: user.createdAt,
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
      plan: user.plan || 'free',
      planPaidAt: user.planPaidAt,
      createdAt: user.createdAt,
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
      failureRedirect: `${process.env.CLIENT_URL || 'https://luvara.vercel.app'}/?error=auth_failed`,
      session: true,
    }),
    (req: Request, res: Response) => {
      const clientUrl = (process.env.CLIENT_URL || 'https://luvara.vercel.app').replace(/\/$/, '');
      const dest = clientUrl + '/search?login=success';
      res.setHeader('Content-Type', 'text/html');
      res.send(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redirecting...</title>' +
        '<script>window.location.replace(' + JSON.stringify(dest) + ');</script></head>' +
        '<body><p>Redirecting... <a href="' + dest + '">click here</a></p></body></html>'
      );
    }
);

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
        plan: dbUser.plan || 'free',
        planPaidAt: dbUser.planPaidAt,
        createdAt: dbUser.createdAt,
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

    res.json({
      success: true,
      message: 'Password updated successfully',
      user: {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        authProvider: dbUser.authProvider,
        hasPassword: !!dbUser.password,
        plan: dbUser.plan || 'free',
        planPaidAt: dbUser.planPaidAt,
        createdAt: dbUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Password update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password' });
  }
});

// ─── Razorpay: Create Order ──────────────────────────────────────────────────
router.post('/create-order', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const { plan } = req.body;
    const PLAN_AMOUNTS: Record<string, number> = {
      researcher: 99900, // ₹999 in paise
      organization: 249900, // ₹2,499 in paise
    };
    const amount = PLAN_AMOUNTS[plan?.toLowerCase()];
    if (!amount) {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    const order = await razorpayInstance.orders.create({
      amount,
      currency: 'INR',
      receipt: `plan_${plan}_${Date.now()}`,
      notes: { plan, userId: (req.user as any)._id.toString() },
    });

    res.json({ success: true, order });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// ─── Razorpay: Verify Payment & Activate Plan ───────────────────────────────
router.post('/verify-payment', async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update user plan
    const { _id } = req.user as any;
    const dbUser = await User.findById(_id);
    if (!dbUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const validPlans = ['researcher', 'organization'];
    const selectedPlan = validPlans.includes(plan?.toLowerCase()) ? plan.toLowerCase() : 'researcher';
    dbUser.plan = selectedPlan as any;
    dbUser.planPaidAt = new Date();
    await dbUser.save();

    res.json({
      success: true,
      message: 'Payment verified and plan activated',
      user: {
        id: dbUser._id,
        email: dbUser.email,
        name: dbUser.name,
        avatar: dbUser.avatar,
        authProvider: dbUser.authProvider,
        hasPassword: !!dbUser.password,
        plan: dbUser.plan,
        planPaidAt: dbUser.planPaidAt,
        createdAt: dbUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

// @route   GET /api/auth/stats
// @desc    Get user analysis stats
// @access  Private
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const userId = (req.user as any)._id;
    const [analysisRuns, reportsGenerated] = await Promise.all([
      Job.countDocuments({ userId }),
      Job.countDocuments({
        userId,
        status: { $in: ['completed', 'complete'] },
        reportData: { $exists: true, $ne: null },
      }),
    ]);
    res.json({ success: true, analysisRuns, reportsGenerated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

export default router;
