/**
 * ✦ STUNNING SHARED REPORT PAGE
 * Features: Public read-only report view, SpotlightCard sections,
 * animated gauges, upsell CTA with GradientText.
 */
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, ExternalLink, ArrowRight, FlaskConical, FileText,
  Shield, CheckCircle2, AlertTriangle, Pill, Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  SpotlightCard, BlurReveal, Aurora, Particles, GradientText,
  NumberTicker, MagneticButton, OrbEffect,
} from '@/components/reactbits';

export default function SharedReportPage() {
  const { token } = useParams();

  return (
    <div className="relative min-h-screen bg-background">
      <Aurora colors={['oklch(0.7 0.2 260 / 0.04)']} />
      <Particles count={15} />

      {/* Banner */}
      <div className="bg-primary/10 border-b border-primary/20 py-3 text-center text-sm">
        <span className="text-muted-foreground">This is a shared report preview.</span>{' '}
        <Link to="/signup" className="text-primary hover:underline font-medium">Sign up for full access →</Link>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold">Blueprints</span>
            <Badge variant="secondary" className="text-xs">Shared Report</Badge>
          </div>
          <Link to="/signup"><Button size="sm">Sign Up</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Molecule Title */}
        <BlurReveal>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Metformin</h1>
              <p className="text-sm text-muted-foreground">Shared analysis report</p>
            </div>
          </div>
        </BlurReveal>

        {/* Score Cards */}
        <BlurReveal delay={0.1}>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <SpotlightCard className="p-5 text-center">
              <div className="text-3xl font-bold text-success">8.2</div>
              <div className="text-xs text-muted-foreground mt-1">Phoenix Score</div>
            </SpotlightCard>
            <SpotlightCard className="p-5 text-center">
              <div className="text-3xl font-bold text-primary">7.8</div>
              <div className="text-xs text-muted-foreground mt-1">AI Viability</div>
            </SpotlightCard>
            <SpotlightCard className="p-5 text-center">
              <div className="text-3xl font-bold"><NumberTicker value={234} /></div>
              <div className="text-xs text-muted-foreground mt-1">Clinical Trials</div>
            </SpotlightCard>
            <SpotlightCard className="p-5 text-center">
              <div className="text-3xl font-bold"><NumberTicker value={4521} /></div>
              <div className="text-xs text-muted-foreground mt-1">Publications</div>
            </SpotlightCard>
          </div>
        </BlurReveal>

        {/* Executive Summary */}
        <BlurReveal delay={0.2}>
          <SpotlightCard className="p-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Executive Summary
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Metformin demonstrates exceptional drug repurposing potential across multiple therapeutic areas.
              The compound shows strong clinical evidence for oncology applications, with 47 active clinical trials
              investigating anti-cancer properties. Patent landscape is favorable with key formulation patents expiring in 2024.
            </p>
          </SpotlightCard>
        </BlurReveal>

        {/* Opportunities & Risks */}
        <BlurReveal delay={0.3}>
          <div className="grid gap-6 md:grid-cols-2">
            <SpotlightCard className="p-6">
              <h3 className="text-sm font-semibold text-success flex items-center gap-1 mb-4">
                <CheckCircle2 className="h-4 w-4" /> Top Opportunities
              </h3>
              <div className="space-y-2">
                {['Anti-cancer properties (colorectal, breast)', 'Neuroprotection in Alzheimer\'s', 'Anti-aging via AMPK activation'].map((o) => (
                  <div key={o} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                    {o}
                  </div>
                ))}
              </div>
            </SpotlightCard>
            <SpotlightCard className="p-6">
              <h3 className="text-sm font-semibold text-destructive flex items-center gap-1 mb-4">
                <AlertTriangle className="h-4 w-4" /> Risk Factors
              </h3>
              <div className="space-y-2">
                {['GI side effects limit dose escalation', 'Lactic acidosis in renal impairment', 'Drug interactions with contrast agents'].map((r) => (
                  <div key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </div>
        </BlurReveal>

        {/* Repurposing Candidates */}
        <BlurReveal delay={0.4}>
          <SpotlightCard className="p-8">
            <h2 className="text-lg font-semibold mb-6">Repurposing Candidates</h2>
            <div className="space-y-4">
              {[
                { condition: 'Colorectal Cancer', phase: 'Phase III', score: 87 },
                { condition: 'Breast Cancer', phase: 'Phase II', score: 74 },
                { condition: 'Alzheimer\'s Disease', phase: 'Phase II', score: 68 },
              ].map((c) => (
                <div key={c.condition} className="flex items-center gap-4">
                  <span className="text-sm w-40 shrink-0">{c.condition}</span>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{c.phase}</Badge>
                  <div className="flex-1">
                    <Progress value={c.score} color={c.score >= 80 ? 'oklch(0.72 0.2 155)' : 'oklch(0.7 0.2 260)'} />
                  </div>
                  <span className="text-sm font-mono font-bold w-12 text-right">{c.score}%</span>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </BlurReveal>

        {/* Molecular Properties */}
        <BlurReveal delay={0.5}>
          <SpotlightCard className="p-8">
            <h2 className="text-lg font-semibold mb-6">Molecular Properties</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { label: 'MW', value: '129.16' },
                { label: 'LogP', value: '-1.43' },
                { label: 'HBD', value: '3' },
                { label: 'HBA', value: '5' },
                { label: 'TPSA', value: '91.49' },
                { label: 'RotB', value: '2' },
              ].map((prop) => (
                <div key={prop.label} className="text-center rounded-lg border border-border bg-muted/20 p-3">
                  <div className="text-lg font-bold font-mono">{prop.value}</div>
                  <div className="text-[10px] text-muted-foreground">{prop.label}</div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </BlurReveal>

        {/* CTA */}
        <BlurReveal delay={0.6}>
          <div className="relative text-center py-16">
            <OrbEffect className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size={400} />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-3">
                Want the <GradientText>full analysis</GradientText>?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Sign up to access full reports with molecular twins, evidence chains, AI debate, and more.
              </p>
              <Link to="/signup">
                <MagneticButton className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 font-semibold text-primary-foreground shadow-[0_0_30px_oklch(0.7_0.2_260/0.4)] hover:shadow-[0_0_50px_oklch(0.7_0.2_260/0.6)] transition-all">
                  Sign Up Free
                  <ArrowRight className="h-5 w-5" />
                </MagneticButton>
              </Link>
            </div>
          </div>
        </BlurReveal>
      </main>
    </div>
  );
}
