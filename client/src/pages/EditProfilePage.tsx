import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, ArrowLeft, Eye, EyeOff, Save, KeyRound, Sparkles, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const glassStyle =
  'bg-background/40 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]';

function resizeImageToBase64(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EditProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const isGoogleUser = user?.provider === 'google';

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Please select an image file.');
      return;
    }
    try {
      const base64 = await resizeImageToBase64(file, 200);
      setAvatarPreview(base64);
      setAvatarChanged(true);
      setProfileError('');
    } catch {
      setProfileError('Failed to process image. Please try another file.');
    }
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarChanged(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      const body: any = { name, bio };
      if (avatarChanged) body.avatar = avatarPreview;
      const res = await fetch('http://localhost:5000/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      setUser(data.user);
      setAvatarChanged(false);
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);
    try {
      const res = await fetch('http://localhost:5000/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set password');
      setPasswordSuccess('Password set! You can now sign in with your email too.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full min-h-screen overflow-hidden">

      {/* Floating background chips */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute top-[10%] left-[8%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
        >
          <div className="p-2 bg-primary/20 rounded-full"><UserCircle className="text-primary w-5 h-5" /></div>
          <span className="font-semibold text-sm text-foreground">Edit Profile</span>
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className={`absolute bottom-[18%] right-[8%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
        >
          <div className="p-2 bg-primary/20 rounded-full"><Sparkles className="text-primary w-5 h-5" /></div>
          <span className="font-semibold text-sm text-foreground">Saved to DB</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative z-10 w-full max-w-lg rounded-3xl ${glassStyle}`}
      >
        {/* Header */}
        <div className="p-8 pb-0">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Back to Research
          </button>

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium">
              <Sparkles size={14} /> Next Gen Discovery
            </div>
          </div>

          {/* Avatar upload */}
          <div className="flex flex-col items-center mb-6">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="relative group mb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 hover:ring-primary/50 transition-all focus:outline-none"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                    <UserCircle className="w-12 h-12 text-primary" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  title="Remove photo"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center shadow-md hover:bg-destructive/80 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">Click to upload a photo</p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Edit{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Profile
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            {isGoogleUser && (
              <span className="mt-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Connected with Google
              </span>
            )}
          </div>
        </div>

        {/* Profile form */}
        <div className="px-8 pb-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Full Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Bio <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none transition-colors"
              />
            </div>

            {profileError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                {profileError}
              </motion.p>
            )}
            {profileSuccess && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                {profileSuccess}
              </motion.p>
            )}

            <Button type="submit" disabled={profileLoading} className="w-full h-11 font-semibold rounded-xl shadow-[0_0_30px_-8px_rgba(102,16,242,0.7)] hover:scale-[1.02] transition-transform gap-2">
              <Save size={16} />
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </div>

        {/* Set password section — only for Google OAuth users */}
        {isGoogleUser && (
          <>
            <div className="mx-8 border-t border-white/10" />
            <div className="px-8 py-6">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound size={16} className="text-primary" />
                <h2 className="text-base font-semibold">Create a Password</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Set a password so you can also sign in with your email and password — in addition to Google.
              </p>

              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11 pr-10"
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground/80">Confirm Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11 pr-10"
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                    {passwordError}
                  </motion.p>
                )}
                {passwordSuccess && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
                    {passwordSuccess}
                  </motion.p>
                )}

                <Button type="submit" disabled={passwordLoading} variant="outline"
                  className="w-full h-11 font-semibold rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-2">
                  <KeyRound size={16} />
                  {passwordLoading ? 'Setting password...' : 'Set Password'}
                </Button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
