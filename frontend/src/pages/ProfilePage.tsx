import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, updatePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const glassStyle =
    'bg-background/40 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]';

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const hasPassword = user?.hasPassword ?? (user?.authProvider === 'local');

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Image must be under 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setProfileError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      setAvatarData(result);
      setProfileError('');
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected
    e.target.value = '';
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      const updates: { name?: string; email?: string; avatar?: string } = {};
      if (name !== (user?.name || '')) updates.name = name;
      if (email !== user?.email) updates.email = email;
      if (avatarData) updates.avatar = avatarData;

      await updateProfile(updates);
      setAvatarData(null);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(hasPassword ? currentPassword : undefined, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="flex-1 flex flex-col items-center p-6 relative w-full min-h-screen">

      {/* Back button */}
      <div className="w-full max-w-2xl mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl space-y-6"
      >
        {/* Page title */}
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground text-sm">Update your account details and preferences</p>
        </div>

        {/* Profile card */}
        <div className={`rounded-2xl p-8 ${glassStyle}`}>
          <h2 className="text-base font-semibold text-foreground mb-6">Profile Information</h2>

          {profileError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm"
            >
              {profileError}
            </motion.div>
          )}
          {profileSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Profile updated successfully
            </motion.div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <div className="h-24 w-24 rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-bold text-3xl">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Upload new photo
                </button>
                <p className="text-xs text-muted-foreground">JPG, PNG, GIF up to 2MB</p>
                {user?.authProvider === 'google' && (
                  <p className="text-xs text-muted-foreground">Signed in with Google</p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-foreground/80 text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="bg-background/50 border-border/50 focus:border-primary h-11"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground/80 text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-background/50 border-border/50 focus:border-primary h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={profileLoading}
              className="gap-2 rounded-full shadow-[0_0_20px_-8px_rgba(102,16,242,0.6)] hover:scale-[1.02] transition-transform"
            >
              <Save className="h-4 w-4" />
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </div>

        {/* Password card */}
        <div className={`rounded-2xl p-8 ${glassStyle}`}>
          <div className="flex items-center gap-2 mb-1">
            <Lock className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {hasPassword ? 'Change Password' : 'Create Password'}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-6">
            {hasPassword
              ? 'Update your existing password'
              : 'Add a password so you can also sign in with email'}
          </p>

          {passwordError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm"
            >
              {passwordError}
            </motion.div>
          )}
          {passwordSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-green-500/10 border border-green-500/30 text-green-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Password updated successfully
            </motion.div>
          )}

          <form onSubmit={handlePasswordSave} className="space-y-4">
            {/* Current password — only if user already has one */}
            {hasPassword && (
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-foreground/80 text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-background/50 border-border/50 focus:border-primary h-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-foreground/80 text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-background/50 border-border/50 focus:border-primary h-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-foreground/80 text-sm font-medium">
                  Confirm
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-background/50 border-border/50 focus:border-primary h-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={passwordLoading}
              className="gap-2 rounded-full shadow-[0_0_20px_-8px_rgba(102,16,242,0.6)] hover:scale-[1.02] transition-transform"
            >
              <Lock className="h-4 w-4" />
              {passwordLoading
                ? 'Updating...'
                : hasPassword
                ? 'Update Password'
                : 'Create Password'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
