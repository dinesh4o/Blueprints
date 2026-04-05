import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User, IUser } from '../models/User';

// Google OAuth Strategy — only register if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === 'development'
        ? `http://localhost:${process.env.PORT || 3000}/api/auth/google/callback`
        : `${(process.env.CLIENT_URL || 'https://luvara.vercel.app').replace(/\/$/, '')}/api/auth/google/callback`,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Check if email already exists with different provider
        user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.authProvider = 'google';
          user.avatar = profile.photos?.[0]?.value;
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          authProvider: 'google',
          lastLogin: new Date(),
        });

        done(null, user);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);
} else {
  console.warn('[Auth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled.');
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    if (user) {
      // Auto-lift expired temporary bans
      if (!user.isActive && user.bannedUntil && new Date() > user.bannedUntil) {
        user.isActive = true;
        user.bannedUntil = undefined;
        await user.save();
      }
      // Block permanently banned users (no bannedUntil means permanent)
      if (!user.isActive && !user.bannedUntil) {
        return done(null, false as any);
      }
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
