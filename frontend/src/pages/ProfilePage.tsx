import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Lock, Eye, EyeOff, CheckCircle2, Shield, Activity, Database, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, updatePassword } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      await updatePassword(currentPassword, newPassword);
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

  return (
    <main className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-zinc-800 relative overflow-hidden">
      
      {/* Liquid Glass Background Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-900/10 rounded-full blur-[140px] mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[-10%] w-[30rem] h-[30rem] bg-zinc-600/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 px-6 py-4 flex items-center gap-4 bg-black/80 backdrop-blur-xl border-b border-zinc-900">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Account Settings</h1>
        </div>
      </header>

      <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Left column: Overview & Stats */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-5" onClick={handleAvatarClick}>
                <div className="w-28 h-28 rounded-full bg-zinc-900 border-2 border-zinc-800 overflow-hidden relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar shadow" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                      <Camera className="w-8 h-8 mb-1" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] font-bold text-white tracking-widest uppercase">Change</span>
                  </div>
                </div>
                {user?.authProvider !== 'local' && (
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/gif, image/webp"
                className="hidden"
              />
              <h2 className="text-xl font-bold text-white mb-1">{user?.name || 'Researcher'}</h2>
              <p className="text-sm text-zinc-500">{(user as any)?.role || 'Verified User'}</p>
            </div>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Analysis Runs</span>
                </div>
                <span className="font-semibold text-white">42</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">Saved Queries</span>
                </div>
                <span className="font-semibold text-white">12</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right column: Forms */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 shadow-2xl relative"
          >
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white">Personal Information</h3>
              <p className="text-sm text-zinc-500">Update your profile identity and contact details.</p>
            </div>

            {profileError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                 <span>{profileError}</span>
              </div>
            )}
            
            {profileSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated successfully</span>
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-zinc-950 border-zinc-800/80 focus:border-white focus:ring-1 focus:ring-white/20 h-11 text-sm rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Email Address</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    disabled={user?.authProvider !== 'local'}
                    className="bg-zinc-950 border-zinc-800/80 focus:border-white focus:ring-1 focus:ring-white/20 h-11 text-sm rounded-lg disabled:opacity-50"
                  />
                  {user?.authProvider !== 'local' && (
                    <p className="text-xs text-zinc-600 mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Managed by {user?.authProvider}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={profileLoading || (name === user?.name && email === user?.email && !avatarData)}
                  className="bg-white text-black hover:bg-zinc-200 h-10 px-6 font-semibold rounded-lg"
                >
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>

          {hasPassword && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 shadow-2xl relative"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Security</h3>
                <p className="text-sm text-zinc-500">Update your password to keep your account secure.</p>
              </div>

              {passwordError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-lg text-sm mb-6">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Password updated successfully</span>
                </div>
              )}

              <form onSubmit={handlePasswordSave} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="bg-zinc-950 border-zinc-800/80 focus:border-white focus:ring-1 focus:ring-white/20 h-11 text-sm rounded-lg pr-10"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-zinc-950 border-zinc-800/80 focus:border-white focus:ring-1 focus:ring-white/20 h-11 text-sm rounded-lg pr-10"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="bg-zinc-950 border-zinc-800/80 focus:border-white focus:ring-1 focus:ring-white/20 h-11 text-sm rounded-lg pr-10"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="bg-white text-black hover:bg-zinc-200 h-10 px-6 font-semibold rounded-lg"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}
