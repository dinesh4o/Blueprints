import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, Lock, Eye, EyeOff, CheckCircle2, Shield, Activity, Database, Sparkles, Zap, Crown, Check, X, HelpCircle, ChevronDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useRazorpay } from 'react-razorpay';

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, updateProfile, updatePassword, checkAuth } = useAuth();
  const activeTab = searchParams.get('tab') === 'settings' ? 'settings' : 'profile';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { Razorpay } = useRazorpay();

  // Dynamic stats
  const [analysisRuns, setAnalysisRuns] = useState(0);
  const [reportsGenerated, setReportsGenerated] = useState(0);

  const fetchStats = useCallback(() => {
    fetch('/api/auth/stats', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAnalysisRuns(data.analysisRuns);
          setReportsGenerated(data.reportsGenerated);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, activeTab, location.key]);

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

      <div className="w-full max-w-7xl mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-6 relative z-10">
        
        {/* Left column: Overview & Stats + (Comparison & FAQ when on settings tab) */}
        <div className="w-full lg:w-[260px] lg:shrink-0 flex flex-col gap-5">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 shadow-2xl relative overflow-hidden"
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-4" onClick={handleAvatarClick}>
                <div className="w-22 h-22 rounded-full bg-zinc-900 border-2 border-zinc-800 overflow-hidden relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar shadow" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                      <Camera className="w-7 h-7 mb-1" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                    <Camera className="w-5 h-5 text-white mb-1" />
                    <span className="text-[9px] font-bold text-white tracking-widest uppercase">Change</span>
                  </div>
                </div>
                {user?.authProvider !== 'local' && (
                  <div className="absolute bottom-0 right-0 w-7 h-7 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
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
              <h2 className="text-lg font-bold text-white mb-1">{user?.name || 'Researcher'}</h2>
              {user?.plan && user.plan !== 'free' ? (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-1 border ${
                  user.plan === 'organization'
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                }`}>
                  <Crown className="w-3 h-3" />
                  {user.plan} Plan
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-semibold uppercase tracking-wider mb-1">
                  Free Plan
                </span>
              )}
              <p className="text-xs text-zinc-500">{(user as any)?.role || 'Verified User'}</p>
            </div>
            
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-300">Analysis Runs</span>
                </div>
                <span className="font-semibold text-white text-sm">{analysisRuns}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-300">Reports Generated</span>
                </div>
                <span className="font-semibold text-white text-sm">{reportsGenerated}</span>
              </div>
            </div>
          </motion.div>

          {/* Comparison & FAQ - show on settings tab */}
          {activeTab === 'settings' && (
          <>
            {/* Comparison Table */}
            <div className="p-4 rounded-2xl border border-zinc-800/80 bg-[#0a0a0a] shadow-2xl">
              <h4 className="font-bold text-white flex items-center gap-2 mb-3 text-sm">
                <Activity className="w-4 h-4 text-amber-400" />
                Plan Comparison
              </h4>
              <div className="overflow-hidden rounded-lg border border-zinc-800/40">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800/60 bg-zinc-900/60">
                      <th className="text-left text-zinc-500 font-medium py-2 px-2">Feature</th>
                      <th className="text-center text-zinc-400 font-medium py-2 px-1">Free</th>
                      <th className="text-center text-amber-400 font-medium py-2 px-1">Pro</th>
                      <th className="text-center text-purple-400 font-medium py-2 px-1">Org</th>
                    </tr>
                  </thead>
                  <tbody className="text-zinc-400">
                    {[
                      ['Reports', '3', '∞', '∞'],
                      ['AI agents', '2', '8', '8'],
                      ['Sources', '5', 'All', 'All+'],
                      ['Patent', false, true, true],
                      ['PDF export', false, true, true],
                      ['Heatmaps', false, true, true],
                      ['Seats', '1', '1', '10'],
                      ['API', false, false, true],
                      ['Support', false, false, true],
                    ].map(([feature, free, researcher, org], i) => (
                      <tr key={i} className={`border-b border-zinc-800/30 ${i % 2 === 0 ? 'bg-zinc-900/20' : ''}`}>
                        <td className="py-2 px-2 text-zinc-300">{feature as string}</td>
                        {[free, researcher, org].map((val, j) => (
                          <td key={j} className="py-2 px-1 text-center">
                            {val === true ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> :
                             val === false ? <X className="w-3.5 h-3.5 text-zinc-600 mx-auto" /> :
                             <span className="text-zinc-300">{val as string}</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
          )}

        </div>

        {/* Right column: Forms / Plans */}
        <div className="w-full lg:flex-1 flex flex-col gap-5">
          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800/60 w-fit">
            <button
              onClick={() => setSearchParams({})}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'settings' })}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Settings
            </button>
          </div>

          {activeTab === 'profile' && (
          <>
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

          </>
          )}

          {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 xl:grid-cols-[1fr_240px] gap-5 items-start"
          >
            {/* Plans Section */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 shadow-2xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-amber-400" />
                Explore Plans
              </h3>
              <p className="text-sm text-zinc-500 mb-5">
                Upgrade your plan to unlock advanced features.
              </p>

              {/* Plan Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Free Plan */}
                <div className={`p-5 rounded-xl border flex flex-col ${(!user?.plan || user.plan === 'free') ? 'border-zinc-700 bg-zinc-900/50' : 'border-zinc-800/60 bg-zinc-900/30'}`}>
                  <div className="flex items-center justify-between mb-3 gap-2 min-w-0">
                    <h4 className="font-bold text-white truncate">Explorer</h4>
                    {(!user?.plan || user.plan === 'free') && (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full uppercase shrink-0 leading-none">Current</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">Free</p>
                  <p className="text-xs text-zinc-500 mb-4">Basic access forever</p>
                  <ul className="space-y-2.5 text-sm text-zinc-400 flex-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> 3 reports/month</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Standard scoring</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Top 5 data sources</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Basic clinical insights</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Community access</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Email support</li>
                  </ul>
                  <div className={`mt-4 w-full h-10 rounded-lg border flex items-center justify-center text-sm font-semibold ${(!user?.plan || user.plan === 'free') ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-zinc-700/50 bg-zinc-800/30 text-zinc-500'}`}>
                    {(!user?.plan || user.plan === 'free') ? '✓ Active Plan' : 'Free Tier'}
                  </div>
                </div>

                {/* Researcher Plan */}
                <div className={`p-5 rounded-xl border flex flex-col ${user?.plan === 'researcher' ? 'border-amber-500/30 bg-zinc-900/50' : 'border-zinc-800/60 bg-zinc-900/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" /> Researcher
                    </h4>
                    {user?.plan === 'researcher' && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full uppercase shrink-0 leading-none">Current</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <p className="text-2xl font-bold text-white">₹999</p>
                    <span className="text-sm text-zinc-500">/month</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">Full research power</p>
                  <ul className="space-y-2.5 text-sm text-zinc-400 flex-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500 shrink-0" /> Unlimited reports</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500 shrink-0" /> Full 8-agent execution</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500 shrink-0" /> Patent & IP analysis</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500 shrink-0" /> PDF journal export</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-500 shrink-0" /> Safety heatmaps</li>
                  </ul>
                  {user?.plan === 'researcher' ? (
                    <div className="mt-4 w-full h-10 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-sm font-semibold text-amber-400">
                      ✓ Active Plan
                    </div>
                  ) : user?.plan === 'organization' ? (
                    <div className="mt-4 w-full h-10 rounded-lg border border-zinc-700/50 bg-zinc-800/30 flex items-center justify-center text-sm text-zinc-500">
                      Included
                    </div>
                  ) : (
                    <Button
                      onClick={async () => {
                        try {
                          const orderRes = await fetch('/api/auth/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ plan: 'researcher' }),
                          });
                          const orderData = await orderRes.json();
                          if (!orderData.success) { alert('Failed to create order'); return; }
                          const rzp = new Razorpay({
                            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SHFkFDv4q8dkSo',
                            amount: orderData.order.amount.toString(),
                            currency: orderData.order.currency,
                            name: 'Phoenix Blueprint',
                            description: 'Researcher Subscription',
                            order_id: orderData.order.id,
                            handler: async (response: any) => {
                              const verifyRes = await fetch('/api/auth/verify-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                  razorpay_order_id: response.razorpay_order_id,
                                  razorpay_payment_id: response.razorpay_payment_id,
                                  razorpay_signature: response.razorpay_signature,
                                  plan: 'researcher',
                                }),
                              });
                              const verifyData = await verifyRes.json();
                              if (verifyData.success) { await checkAuth(); } else { alert('Payment verification failed'); }
                            },
                            prefill: { name: user?.name || '', email: user?.email || '' },
                            theme: { color: '#f59e0b' },
                          } as any);
                          rzp.open();
                        } catch { alert('Something went wrong'); }
                      }}
                      className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold h-10 rounded-lg"
                    >
                      Upgrade Now
                    </Button>
                  )}
                </div>

                {/* Organization Plan */}
                <div className={`p-5 rounded-xl border flex flex-col ${user?.plan === 'organization' ? 'border-purple-500/30 bg-zinc-900/50' : 'border-zinc-800/60 bg-zinc-900/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-purple-400" /> Organization
                    </h4>
                    {user?.plan === 'organization' && (
                      <span className="text-[9px] font-bold text-purple-400 bg-purple-500/15 px-1.5 py-0.5 rounded-full uppercase shrink-0 leading-none">Current</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <p className="text-2xl font-bold text-white">₹2,499</p>
                    <span className="text-sm text-zinc-500">/month</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">For teams & organizations</p>
                  <ul className="space-y-2.5 text-sm text-zinc-400 flex-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Everything in Researcher</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Private data orchestration</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Team collaboration</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0" /> Priority support</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0" /> API access</li>
                  </ul>
                  {user?.plan === 'organization' ? (
                    <div className="mt-4 w-full h-10 rounded-lg border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-sm font-semibold text-purple-400">
                      ✓ Active Plan
                    </div>
                  ) : (
                    <Button
                      onClick={async () => {
                        try {
                          const orderRes = await fetch('/api/auth/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ plan: 'organization' }),
                          });
                          const orderData = await orderRes.json();
                          if (!orderData.success) { alert('Failed to create order'); return; }
                          const rzp = new Razorpay({
                            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SHFkFDv4q8dkSo',
                            amount: orderData.order.amount.toString(),
                            currency: orderData.order.currency,
                            name: 'Phoenix Blueprint',
                            description: 'Organization Subscription',
                            order_id: orderData.order.id,
                            handler: async (response: any) => {
                              const verifyRes = await fetch('/api/auth/verify-payment', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                  razorpay_order_id: response.razorpay_order_id,
                                  razorpay_payment_id: response.razorpay_payment_id,
                                  razorpay_signature: response.razorpay_signature,
                                  plan: 'organization',
                                }),
                              });
                              const verifyData = await verifyRes.json();
                              if (verifyData.success) { await checkAuth(); } else { alert('Payment verification failed'); }
                            },
                            prefill: { name: user?.name || '', email: user?.email || '' },
                            theme: { color: '#a855f7' },
                          } as any);
                          rzp.open();
                        } catch { alert('Something went wrong'); }
                      }}
                      className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold h-10 rounded-lg"
                    >
                      Upgrade Now
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-5 p-5 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
                <h4 className="text-sm font-semibold text-white mb-4">Platform Highlights</h4>
                <div className="grid grid-cols-3 gap-4 text-center mb-5">
                  <div className="p-3 rounded-lg bg-zinc-800/40">
                    <p className="text-2xl font-bold text-amber-400">50K+</p>
                    <p className="text-xs text-zinc-400 mt-1">Analyses Run</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/40">
                    <p className="text-2xl font-bold text-green-400">98%</p>
                    <p className="text-xs text-zinc-400 mt-1">Accuracy Rate</p>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-800/40">
                    <p className="text-2xl font-bold text-purple-400">2K+</p>
                    <p className="text-xs text-zinc-400 mt-1">Researchers</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-800/30">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">8 AI Agents</p>
                      <p className="text-[10px] text-zinc-500">Running in parallel</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-800/30">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">Trusted by Top Labs</p>
                      <p className="text-[10px] text-zinc-500">Global research teams</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Questions - Separate module on the right */}
            <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#0a0a0a] shadow-2xl h-fit sticky top-24">
              <h4 className="font-bold text-white flex items-center gap-2 mb-4 text-sm">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Common Questions
              </h4>
              <div className="space-y-2">
                {[
                  { q: 'Can I switch plans?', a: 'Yes! Upgrade or downgrade anytime. Changes take effect immediately.' },
                  { q: 'Payment methods?', a: 'UPI, cards, net banking, and wallets via Razorpay.' },
                  { q: 'Free trial available?', a: 'Explorer is free forever. Paid plans activate instantly.' },
                  { q: 'What is 8-agent execution?', a: 'All 8 AI agents run simultaneously for comprehensive analysis.' },
                  { q: 'Refund policy?', a: '7-day full refund. Contact support within 7 days of purchase.' },
                ].map((faq, i) => (
                  <details key={i} className="group rounded-lg border border-zinc-800/40 bg-zinc-900/20 overflow-hidden">
                    <summary className="flex items-center justify-between cursor-pointer px-3 py-2.5 text-xs text-zinc-300 hover:text-white transition-colors">
                      <span>{faq.q}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-open:rotate-180 transition-transform shrink-0 ml-2" />
                    </summary>
                    <p className="px-3 pb-2.5 text-[11px] text-zinc-500 leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>

          </motion.div>
          )}

        </div>
      </div>
    </main>
  );
}
