import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, UserPlus, Eye, EyeOff, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const glassStyle =
  'bg-background/40 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      setUser(data.user);
      navigate('/search');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full min-h-screen overflow-hidden">

      {/* Floating background chips — mirrors LandingPage style */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute top-[10%] left-[8%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
        >
          <div className="p-2 bg-primary/20 rounded-full"><UserPlus className="text-primary w-5 h-5" /></div>
          <span className="font-semibold text-sm text-foreground">Create Account</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 25, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className={`absolute top-[16%] right-[10%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
        >
          <div className="p-2 bg-primary/20 rounded-full"><BrainCircuit className="text-primary w-5 h-5" /></div>
          <span className="font-semibold text-sm text-foreground">AI Synthesis</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className={`absolute bottom-[16%] right-[8%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
        >
          <div className="p-2 bg-primary/20 rounded-full"><GoogleIcon /></div>
          <span className="font-semibold text-sm text-foreground">Google OAuth</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className={`absolute bottom-[20%] left-[10%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
        >
          <div className="p-2 bg-primary/20 rounded-full"><Sparkles className="text-primary w-5 h-5" /></div>
          <span className="font-semibold text-sm text-foreground">Instant Access</span>
        </motion.div>
      </div>

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative z-10 w-full max-w-md p-8 rounded-3xl ${glassStyle}`}
      >
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium">
            <Sparkles size={14} />
            Next Gen Discovery
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-2">
            Create{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              Account
            </span>
          </h1>
          <p className="text-muted-foreground">Join the autonomous research platform</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80" htmlFor="name">
              Full Name
            </label>
            <Input
              id="name" type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe" required
              className="w-full bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80" htmlFor="email">
              Email
            </label>
            <Input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required
              className="w-full bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Input
                id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11 pr-10"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground/80" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword" type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-white/5 border-white/10 focus:border-primary/50 rounded-xl h-11 pr-10"
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading}
            className="w-full h-11 text-base font-semibold rounded-xl shadow-[0_0_40px_-10px_rgba(102,16,242,0.8)] hover:scale-[1.02] transition-transform">
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-3 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button type="button" variant="outline"
          className="w-full h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 gap-3 font-medium"
          onClick={() => { window.location.href = 'http://localhost:5000/auth/google'; }}>
          <GoogleIcon />
          Sign up with Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline font-semibold">Sign in</a>
        </p>
      </motion.div>
    </div>
  );
}
