import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const glassStyle =
    'bg-background/40 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/search');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative w-full min-h-screen overflow-hidden">

      {/* Same floating background elements as LandingPage */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute top-[12%] left-[8%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
        >
          <div className="p-2 bg-primary/20 rounded-full">
            <LogIn className="text-primary w-5 h-5" />
          </div>
          <span className="font-semibold text-sm text-foreground">Secure Access</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, 25, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className={`absolute top-[20%] right-[8%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
        >
          <div className="p-2 bg-primary/20 rounded-full">
            <Sparkles className="text-primary w-5 h-5" />
          </div>
          <span className="font-semibold text-sm text-foreground">AI Synthesis</span>
        </motion.div>

        <motion.div
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className={`absolute bottom-[18%] left-[10%] p-4 rounded-2xl flex flex-col gap-2 w-48 ${glassStyle}`}
        >
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-full">
              <Sparkles className="text-primary w-4 h-4" />
            </div>
            <span className="font-semibold text-xs text-foreground">Research Platform</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className={`absolute bottom-[22%] right-[8%] p-4 rounded-2xl flex items-center gap-3 ${glassStyle}`}
        >
          <div className="p-2 bg-primary/20 rounded-full">
            <LogIn className="text-primary w-5 h-5" />
          </div>
          <span className="font-semibold text-sm text-foreground">Drug Discovery</span>
        </motion.div>
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-medium">
            <Sparkles size={16} />
            Next Gen Discovery
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Welcome Back
          </h1>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 text-xl font-semibold">
            Research Platform
          </p>
          <p className="text-muted-foreground text-sm">Sign in to continue your research</p>
        </div>

        {/* Glass Card */}
        <div className={`rounded-2xl p-8 space-y-5 ${glassStyle}`}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-xl text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground/80 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="scientist@research.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-background/50 border-border/50 focus:border-primary h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground/80 text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-background/50 border-border/50 focus:border-primary h-11"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full h-12 text-base font-semibold shadow-[0_0_30px_-8px_rgba(102,16,242,0.8)] rounded-full hover:scale-[1.02] transition-transform"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-transparent text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-background/50 border-border/50 hover:bg-background/80 rounded-full font-medium"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
