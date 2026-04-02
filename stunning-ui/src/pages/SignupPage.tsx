/**
 * ✦ STUNNING SIGNUP PAGE
 * Features: Aurora, GlowingBorder, SplitText, animated form,
 * glassmorphic testimonial panel with stats.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Aurora, GlowingBorder, SplitText, NumberTicker, BlurReveal, Particles,
} from '@/components/reactbits';

const PURPOSES = ['Personal Research', 'Education', 'Research Organization', 'Pharmaceutical Company', 'Other'];

export default function SignupPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName: '', lastName: '', email: '', purpose: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <Aurora />
      <Particles count={20} />

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <BlurReveal>
            <div className="glass rounded-2xl p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold">Join the Future</div>
                  <div className="text-xs text-muted-foreground">of Drug Intelligence</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Get instant access to AI-powered drug analysis, 8 specialized research agents,
                and comprehensive 360° intelligence reports.
              </p>
            </div>
          </BlurReveal>
          <BlurReveal delay={0.3}>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { value: 500000, suffix: '+', label: 'Molecules' },
                { value: 8, suffix: '', label: 'AI Agents' },
                { value: 360, suffix: '°', label: 'Coverage' },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <div className="text-xl font-bold">
                    <NumberTicker value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </BlurReveal>
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">Blueprints</span>
            </Link>
            <h1 className="text-3xl font-bold mt-6">
              <SplitText text="Create your account" />
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">Start discovering in minutes</p>
          </div>

          <GlowingBorder colors={['#06b6d4', '#10b981', '#6366f1', '#06b6d4']} speed={6}>
            <div className="p-8">
              <Button variant="outline" className="w-full h-11 gap-2 mb-6">
                <Chrome className="h-4 w-4" />
                Sign up with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">or continue with email</span>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input placeholder="John" value={form.firstName} onChange={set('firstName')} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" value={form.lastName} onChange={set('lastName')} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                </div>

                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <select
                    value={form.purpose}
                    onChange={set('purpose')}
                    className="flex h-11 w-full rounded-lg border border-border bg-input px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                  >
                    <option value="">Select purpose...</option>
                    {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={set('password')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    required
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>Create Account <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
            </div>
          </GlowingBorder>
        </motion.div>
      </div>
    </div>
  );
}
