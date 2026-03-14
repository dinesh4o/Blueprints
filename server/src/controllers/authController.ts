import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import passport from 'passport';

// Register with email and password
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      provider: 'local'
    });

    await user.save();

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error logging in after registration' });
      }
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          provider: user.provider
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login with email and password
export const login = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({ error: 'Server error during login' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error logging in' });
      }
      res.json({
        message: 'Logged in successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          provider: user.provider,
          avatar: user.avatar
        }
      });
    });
  })(req, res, next);
};

// Logout
export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

// Get current user
export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const user = req.user as any;
  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      provider: user.provider,
      avatar: user.avatar,
      bio: user.bio || '',
    },
  });
};

// Update profile (name, bio, avatar)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { name, bio, avatar } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updateFields: any = { name: name.trim(), bio: bio?.trim() || '' };
    if (avatar !== undefined) updateFields.avatar = avatar;

    const updated = await User.findByIdAndUpdate(
      user._id,
      updateFields,
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updated?._id,
        email: updated?.email,
        name: updated?.name,
        provider: updated?.provider,
        avatar: updated?.avatar,
        bio: (updated as any)?.bio,
      },
    });
  } catch {
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

// Set password for OAuth users
export const setPassword = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const dbUser = await User.findById(user._id);
    if (!dbUser) return res.status(404).json({ error: 'User not found' });

    dbUser.password = password;
    // Allow local login too now
    if (dbUser.provider === 'google') {
      (dbUser as any).provider = 'google'; // keep google but password is now set
    }
    await dbUser.save();

    res.json({ message: 'Password set successfully' });
  } catch {
    res.status(500).json({ error: 'Server error setting password' });
  }
};
