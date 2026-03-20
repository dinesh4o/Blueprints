import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <main className="w-full min-h-screen flex bg-[#000000] text-zinc-100 font-sans selection:bg-zinc-800">
      
      {/* LEFT SIDE: Decorative & Liquid Glassmorphic Finish */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between relative overflow-hidden bg-[#050505] p-12">
        {/* Liquid background blur map */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden z-0">
          
          
          
        </div>

        {/* Content Top */}
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <div className="w-3 h-3 bg-black rounded-sm" />
            </div>
          </div>
        </div>

        {/* Testimonial Section Center-Left */}
        <div className="relative z-10 w-full max-w-lg my-auto pb-10 pr-8">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="mb-10 text-left"
          >
            <h3 className="text-3xl font-medium leading-tight mb-8 text-white">
              "This platform transformed how we manage our workflow. The security and ease of use are unmatched."
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center font-bold text-sm border border-zinc-700/50">
                SN
              </div>
              <div>
                <p className="font-semibold text-base text-zinc-200">Saranya Nair</p>
                <p className="text-sm text-zinc-500">Research Lead at TechCorp</p>
              </div>
            </div>
          </motion.div>

          <div className="border-t border-zinc-800/80 pt-8 flex items-center gap-12 mt-12">
            <div>
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-xs text-zinc-500 mt-2">Active users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-xs text-zinc-500 mt-2">Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">4.9/5</p>
              <p className="text-xs text-zinc-500 mt-2">User rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10 bg-black">
        
        {/* The Silver Shining Stroke Container */}
        <div className="w-full max-w-[500px] p-8 sm:p-10 rounded-2xl border border-zinc-200/30 shadow-[0_0_40px_-10px_rgba(212,212,216,0.2)] bg-black/80 backdrop-blur-xl relative">
          
          <h2 className="text-3xl font-bold mb-2 text-white">Welcome back</h2>
          <p className="text-zinc-400 text-sm mb-8">Enter your credentials to access your account</p>

          <div className="space-y-3 mb-8">
            <button 
              onClick={handleGoogleLogin}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-transparent hover:bg-zinc-900 transition-colors font-medium text-sm text-zinc-200"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink-0 px-4 text-[10px] font-bold text-zinc-600 tracking-wider">OR CONTINUE WITH EMAIL</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-300 text-xs font-semibold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ramesh@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-zinc-950 border-zinc-800 focus:border-white focus:ring-1 focus:ring-white/20 h-11 text-sm rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300 text-xs font-semibold">Password</Label>
                <Link to="#" className="text-xs text-zinc-400 hover:text-white transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-zinc-950 border-zinc-800 focus:border-white focus:ring-1 focus:ring-white/20 h-11 text-sm rounded-lg pr-10"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 checked:bg-white checked:border-white accent-black" />
              <Label htmlFor="remember" className="text-xs text-zinc-300 font-medium">Remember me for 30 days</Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-black bg-white hover:bg-zinc-200 mt-4 rounded-lg"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white hover:underline font-medium">Sign up</Link>
          </p>

        </div>
      </div>
    </main>
  );
}
