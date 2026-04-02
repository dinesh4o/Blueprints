/**
 * ✦ STUNNING PROFILE PAGE
 * Features: GlowingBorder lanyard card, SpotlightCard sections,
 * animated stats with NumberTicker, glassmorphic form panels.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowLeft, Camera, Shield, User, Settings, Check,
  Crown, QrCode, KeyRound, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  GlowingBorder, SpotlightCard, BlurReveal, NumberTicker,
  Aurora, GradientText, Particles,
} from '@/components/reactbits';

const PLAN_FEATURES = [
  { feature: 'Monthly Reports', free: '3', pro: 'Unlimited', org: 'Unlimited' },
  { feature: 'AI Agents', free: '3', pro: '8', org: '8 + Custom' },
  { feature: 'Data Sources', free: '5', pro: 'All', org: 'All + Custom' },
  { feature: 'Patent Analysis', free: '—', pro: '✓', org: '✓' },
  { feature: 'PDF Export', free: '—', pro: '✓', org: '✓' },
  { feature: 'API Access', free: '—', pro: '—', org: '✓' },
  { feature: 'Team Roles', free: '—', pro: '—', org: '✓' },
];

export default function ProfilePage() {
  const [name, setName] = React.useState('Dr. Sarah Chen');
  const [email] = React.useState('sarah@pharmatech.com');
  const [showPassword, setShowPassword] = React.useState(false);
  const currentPlan = 'researcher';

  return (
    <div className="relative min-h-screen bg-background">
      <Aurora colors={['oklch(0.7 0.2 260 / 0.04)', 'oklch(0.75 0.18 180 / 0.03)']} />
      <Particles count={15} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold">Profile</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left — Lanyard Card */}
          <BlurReveal direction="left">
            <div className="sticky top-24">
              <GlowingBorder
                colors={currentPlan === 'researcher' ? ['#6366f1', '#06b6d4', '#6366f1'] : ['#555', '#777', '#555']}
                speed={5}
              >
                <div className="p-6 text-center">
                  {/* Avatar */}
                  <div className="relative mx-auto mb-4">
                    <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border-2 border-border">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <button className="absolute bottom-0 right-1/2 translate-x-8 translate-y-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:brightness-110 transition-all">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <h2 className="font-bold text-lg">{name}</h2>
                  <p className="text-xs text-muted-foreground">{email}</p>

                  {/* Plan badge */}
                  <div className="mt-3">
                    <Badge variant="glow" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Researcher Plan
                    </Badge>
                  </div>

                  {/* Badge ID */}
                  <div className="mt-4 rounded-lg bg-muted/30 p-3">
                    <div className="text-[10px] text-muted-foreground mb-1">BADGE ID</div>
                    <div className="font-mono text-xs tracking-wider">BP-2026-0042</div>
                  </div>

                  {/* QR Pattern */}
                  <div className="mt-4 flex justify-center">
                    <div className="grid grid-cols-8 gap-[2px]">
                      {Array.from({ length: 64 }, (_, i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-[1px]"
                          style={{ background: Math.random() > 0.45 ? 'oklch(0.7 0.2 260 / 0.4)' : 'oklch(0.2 0 0)' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/20 p-3">
                      <div className="text-xl font-bold"><NumberTicker value={127} /></div>
                      <div className="text-[10px] text-muted-foreground">Analyses</div>
                    </div>
                    <div className="rounded-lg bg-muted/20 p-3">
                      <div className="text-xl font-bold"><NumberTicker value={84} /></div>
                      <div className="text-[10px] text-muted-foreground">Reports</div>
                    </div>
                  </div>

                  <div className="mt-4 text-[10px] text-muted-foreground">
                    Issued: March 15, 2026 • Google SSO
                  </div>
                </div>
              </GlowingBorder>
            </div>
          </BlurReveal>

          {/* Right — Settings */}
          <div>
            <Tabs defaultValue="profile">
              <TabsList className="mb-6">
                <TabsTrigger value="profile">
                  <User className="h-4 w-4 mr-1" /> Edit Profile
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-1" /> Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <BlurReveal>
                  <SpotlightCard className="p-8">
                    <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={email} disabled className="opacity-60" />
                        <p className="text-xs text-muted-foreground">Managed by Google SSO</p>
                      </div>
                      <Button>
                        <Check className="h-4 w-4 mr-1" /> Save Changes
                      </Button>
                    </div>
                  </SpotlightCard>
                </BlurReveal>
              </TabsContent>

              <TabsContent value="settings">
                <div className="space-y-8">
                  {/* Plan Comparison */}
                  <BlurReveal>
                    <SpotlightCard className="p-8">
                      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        Subscription Plans
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="pb-3 text-left text-muted-foreground font-medium">Feature</th>
                              <th className="pb-3 text-center text-muted-foreground font-medium">Free</th>
                              <th className="pb-3 text-center font-medium">
                                <GradientText>Researcher</GradientText>
                              </th>
                              <th className="pb-3 text-center text-muted-foreground font-medium">Organization</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {PLAN_FEATURES.map((row) => (
                              <tr key={row.feature}>
                                <td className="py-3 text-muted-foreground">{row.feature}</td>
                                <td className="py-3 text-center">{row.free}</td>
                                <td className="py-3 text-center font-medium text-primary">{row.pro}</td>
                                <td className="py-3 text-center">{row.org}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </SpotlightCard>
                  </BlurReveal>

                  {/* Security */}
                  <BlurReveal delay={0.1}>
                    <SpotlightCard className="p-8">
                      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-warning" />
                        Security
                      </h2>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>New Password</Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Confirm New Password</Label>
                          <Input type="password" placeholder="••••••••" />
                        </div>
                        <Button variant="outline">
                          <Shield className="h-4 w-4 mr-1" /> Update Password
                        </Button>
                      </div>
                    </SpotlightCard>
                  </BlurReveal>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
