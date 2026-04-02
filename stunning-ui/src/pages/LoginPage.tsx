/**
 * ✦ STUNNING LOGIN PAGE
 * Features: Aurora background, GlowingBorder card, SplitText, smooth form animations,
 * glassmorphic testimonial panel with NumberTicker stats.
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

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <Aurora />
      <Particles count={20} />

      {/* Left panel — Testimonial / Stats (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <BlurReveal>
            <div className="glass rounded-2xl p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Dr. Sarah Chen</div>
                  <div className="text-xs text-muted-foreground">Lead Researcher, PharmaTech</div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed italic">
                "Blueprints transformed our drug repurposing pipeline. What used to take weeks of manual
                research now happens in minutes with unprecedented depth and accuracy."
              </p>
              <div className="mt-6 flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="h-1.5 w-8 rounded-full bg-primary" />
                ))}
              </div>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.3}>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { value: 50000, suffix: '+', label: 'Users' },
                { value: 99.9, suffix: '%', label: 'Uptime', decimalPlaces: 1 },
                { value: 4.9, suffix: '/5', label: 'Rating', decimalPlaces: 1 },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <div className="text-xl font-bold">
                    <NumberTicker value={stat.value} suffix={stat.suffix} decimalPlaces={stat.decimalPlaces || 0} />
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
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">Blueprints</span>
            </Link>
            <h1 className="text-3xl font-bold mt-8">
              <SplitText text="Welcome back" />
            </h1>
            <p className="mt-2 text-muted-foreground">Sign in to continue your research</p>
          </div>

          <GlowingBorder colors={['#6366f1', '#06b6d4', '#10b981', '#6366f1']} speed={6}>
            <div className="p-8">
              {/* Google OAuth */}
              <Button variant="outline" className="w-full h-11 gap-2 mb-6">
                <Chrome className="h-4 w-4" />
                Continue with Google
              </Button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-xs text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>Sign In <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
              </p>
            </div>
          </GlowingBorder>
        </motion.div>
      </div>
    </div>
  );
}
