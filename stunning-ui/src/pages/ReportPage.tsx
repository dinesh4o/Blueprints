/**
 * ✦ STUNNING REPORT PAGE
 * Features: SpotlightCards for report sections, GradientText headers,
 * animated gauge scores, TiltCard data panels, BlurReveal scroll sections,
 * glassmorphic tabs, animated number tickers for metrics.
 */
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowLeft, Share2, Download, ChevronDown, ChevronUp,
  ExternalLink, FlaskConical, Shield, FileText, TrendingUp, Dna,
  AlertTriangle, CheckCircle2, XCircle, Activity, Brain,
  Beaker, Scale, Users, BarChart3, Pill, Target, Atom,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  GradientText, SpotlightCard, BlurReveal, NumberTicker,
  TiltCard, Aurora, Particles, ScrollProgress,
} from '@/components/reactbits';

/* ─── Mock Data ─── */
const MOCK_REPORT = {
  molecule: 'Metformin',
  phoenixScore: 8.2,
  viabilityScore: 7.8,
  executiveSummary: 'Metformin demonstrates exceptional drug repurposing potential across multiple therapeutic areas. The compound shows strong clinical evidence for oncology applications, with 47 active clinical trials investigating anti-cancer properties. Patent landscape is favorable with key formulation patents expiring in 2024.',
  opportunities: ['Anti-cancer properties (colorectal, breast)', 'Neuroprotection in Alzheimer\'s', 'Anti-aging via AMPK activation', 'Cardiovascular protection'],
  risks: ['GI side effects limit dose escalation', 'Lactic acidosis in renal impairment', 'Drug interactions with contrast agents'],
  repurposingCandidates: [
    { condition: 'Colorectal Cancer', phase: 'Phase III', confidence: 87, trials: 12 },
    { condition: 'Breast Cancer', phase: 'Phase II', confidence: 74, trials: 8 },
    { condition: 'Alzheimer\'s Disease', phase: 'Phase II', confidence: 68, trials: 5 },
    { condition: 'Polycystic Ovary', phase: 'Approved', confidence: 95, trials: 34 },
    { condition: 'Anti-Aging', phase: 'Phase I', confidence: 52, trials: 3 },
  ],
  clinicalTrials: { total: 234, active: 47, completed: 156, phases: { 'Phase I': 12, 'Phase II': 18, 'Phase III': 14, 'Phase IV': 3 } },
  publications: 4521,
  patents: 89,
  adme: {
    absorption: { value: 'High', detail: 'Oral bioavailability 50-60%, not significantly affected by food' },
    distribution: { value: 'Moderate', detail: 'Vd = 654L, minimal protein binding (<1%)' },
    metabolism: { value: 'Minimal', detail: 'Not metabolized by CYP450, excreted unchanged' },
    elimination: { value: 'Renal', detail: 'Half-life 4-8.7h, primarily renal elimination' },
  },
  molecularProperties: {
    weight: 129.16, logP: -1.43, hDonors: 3, hAcceptors: 5, tpsa: 91.49, rotBonds: 2,
  },
};

function AnimatedGauge({ value, max = 10, label, size = 120 }: { value: number; max?: number; label: string; size?: number }) {
  const percentage = (value / max) * 100;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference * 0.75; // 270deg arc
  const color = value >= 7.5 ? 'oklch(0.72 0.2 155)' : value >= 5 ? 'oklch(0.78 0.15 80)' : 'oklch(0.65 0.22 25)';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-[135deg]">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="oklch(0.2 0.005 270)" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={circumference * 0.25} strokeLinecap="round" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-[10px] text-muted-foreground">/ {max}</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ReportPage() {
  const { id } = useParams();
  const report = MOCK_REPORT;

  return (
    <div className="relative min-h-screen bg-background">
      <ScrollProgress />
      <Aurora colors={['oklch(0.7 0.2 260 / 0.06)', 'oklch(0.75 0.18 180 / 0.04)']} />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              <h1 className="font-bold text-lg">{report.molecule}</h1>
              <Badge variant="glow" className="text-xs">Report #{id || 'demo'}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm"><Share2 className="h-4 w-4 mr-1" /> Share</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> PDF</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="science">Science</TabsTrigger>
            <TabsTrigger value="clinical">Clinical &amp; IP</TabsTrigger>
            <TabsTrigger value="market">Market Intelligence</TabsTrigger>
            <TabsTrigger value="molecular">Molecular Twin</TabsTrigger>
          </TabsList>

          {/* ━━━ OVERVIEW TAB ━━━ */}
          <TabsContent value="overview">
            <div className="space-y-8">
              {/* Score Cards */}
              <BlurReveal>
                <div className="grid gap-6 md:grid-cols-4">
                  <SpotlightCard className="p-6 flex justify-center">
                    <AnimatedGauge value={report.phoenixScore} label="Phoenix Score" />
                  </SpotlightCard>
                  <SpotlightCard className="p-6 flex justify-center">
                    <AnimatedGauge value={report.viabilityScore} label="AI Viability" />
                  </SpotlightCard>
                  <SpotlightCard className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-bold text-primary">
                      <NumberTicker value={report.clinicalTrials.total} />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Clinical Trials</span>
                    <span className="text-[10px] text-success mt-0.5">{report.clinicalTrials.active} active</span>
                  </SpotlightCard>
                  <SpotlightCard className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-bold text-accent">
                      <NumberTicker value={report.publications} />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">Publications</span>
                  </SpotlightCard>
                </div>
              </BlurReveal>

              {/* Executive Summary */}
              <BlurReveal delay={0.1}>
                <SpotlightCard className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Executive Synthesis</h2>
                    <Badge variant="success" className="ml-auto">High Potential</Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{report.executiveSummary}</p>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-semibold text-success flex items-center gap-1 mb-3">
                        <CheckCircle2 className="h-4 w-4" /> Opportunities
                      </h3>
                      <ul className="space-y-2">
                        {report.opportunities.map((o) => (
                          <li key={o} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-destructive flex items-center gap-1 mb-3">
                        <AlertTriangle className="h-4 w-4" /> Risk Factors
                      </h3>
                      <ul className="space-y-2">
                        {report.risks.map((r) => (
                          <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </SpotlightCard>
              </BlurReveal>

              {/* Repurposing Candidates */}
              <BlurReveal delay={0.2}>
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Drug Repurposing Candidates
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {report.repurposingCandidates.map((c, i) => (
                      <TiltCard key={c.condition} className="p-5" tiltAmount={6}>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm">{c.condition}</h3>
                          <Badge variant={c.phase === 'Approved' ? 'success' : c.phase.includes('III') ? 'default' : 'secondary'}>
                            {c.phase}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Confidence</span>
                            <span className="font-mono font-medium text-foreground">{c.confidence}%</span>
                          </div>
                          <Progress
                            value={c.confidence}
                            color={c.confidence >= 80 ? 'oklch(0.72 0.2 155)' : c.confidence >= 60 ? 'oklch(0.7 0.2 260)' : 'oklch(0.78 0.15 80)'}
                          />
                          <div className="text-xs text-muted-foreground">{c.trials} clinical trials</div>
                        </div>
                      </TiltCard>
                    ))}
                  </div>
                </div>
              </BlurReveal>
            </div>
          </TabsContent>

          {/* ━━━ SCIENCE TAB ━━━ */}
          <TabsContent value="science">
            <div className="space-y-8">
              {/* ADME */}
              <BlurReveal>
                <SpotlightCard className="p-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-primary" />
                    Pharmacokinetics (ADME)
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(report.adme).map(([key, data]) => (
                      <div key={key} className="rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <Badge variant={data.value === 'High' ? 'success' : data.value === 'Moderate' ? 'warning' : 'secondary'}>
                            {data.value}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{data.detail}</p>
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </BlurReveal>

              {/* Molecular Properties */}
              <BlurReveal delay={0.1}>
                <SpotlightCard className="p-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Atom className="h-5 w-5 text-accent" />
                    Molecular Properties
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: 'Molecular Weight', value: `${report.molecularProperties.weight} g/mol` },
                      { label: 'LogP', value: report.molecularProperties.logP.toString() },
                      { label: 'H-Bond Donors', value: report.molecularProperties.hDonors.toString() },
                      { label: 'H-Bond Acceptors', value: report.molecularProperties.hAcceptors.toString() },
                      { label: 'TPSA', value: `${report.molecularProperties.tpsa} Å²` },
                      { label: 'Rotatable Bonds', value: report.molecularProperties.rotBonds.toString() },
                    ].map((prop) => (
                      <div key={prop.label} className="rounded-xl border border-border bg-muted/20 p-4 text-center">
                        <div className="text-xl font-bold font-mono">{prop.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{prop.label}</div>
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </BlurReveal>

              {/* Safety & Toxicity */}
              <BlurReveal delay={0.2}>
                <SpotlightCard className="p-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-warning" />
                    Safety &amp; Toxicity Profile
                  </h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Hepatotoxicity', risk: 'Low', color: 'success' as const },
                      { label: 'Cardiotoxicity', risk: 'Very Low', color: 'success' as const },
                      { label: 'GI Toxicity', risk: 'Moderate', color: 'warning' as const },
                      { label: 'Renal Risk', risk: 'Moderate (dose dependent)', color: 'warning' as const },
                      { label: 'Lactic Acidosis', risk: 'Rare but serious', color: 'destructive' as const },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <span className="text-sm">{item.label}</span>
                        <Badge variant={item.color}>{item.risk}</Badge>
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </BlurReveal>
            </div>
          </TabsContent>

          {/* ━━━ CLINICAL & IP TAB ━━━ */}
          <TabsContent value="clinical">
            <div className="space-y-8">
              {/* Trial Phases */}
              <BlurReveal>
                <SpotlightCard className="p-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Clinical Trial Distribution
                  </h2>
                  <div className="grid grid-cols-4 gap-4">
                    {Object.entries(report.clinicalTrials.phases).map(([phase, count]) => (
                      <div key={phase} className="text-center">
                        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <span className="text-xl font-bold">{count}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{phase}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Total: <strong className="text-foreground">{report.clinicalTrials.total}</strong></span>
                    <span>Active: <strong className="text-success">{report.clinicalTrials.active}</strong></span>
                    <span>Completed: <strong className="text-foreground">{report.clinicalTrials.completed}</strong></span>
                  </div>
                </SpotlightCard>
              </BlurReveal>

              {/* Patent Summary */}
              <BlurReveal delay={0.1}>
                <SpotlightCard className="p-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-amber-400" />
                    Intellectual Property
                  </h2>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-muted/20 p-5 text-center">
                      <div className="text-3xl font-bold"><NumberTicker value={report.patents} /></div>
                      <div className="text-xs text-muted-foreground mt-1">Total Patents</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-5 text-center">
                      <div className="text-3xl font-bold text-success">2024</div>
                      <div className="text-xs text-muted-foreground mt-1">Key Patent Expiry</div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-5 text-center">
                      <Badge variant="success" className="text-base px-4 py-1">Favorable</Badge>
                      <div className="text-xs text-muted-foreground mt-2">Freedom to Operate</div>
                    </div>
                  </div>
                </SpotlightCard>
              </BlurReveal>

              {/* Regulatory */}
              <BlurReveal delay={0.2}>
                <SpotlightCard className="p-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-400" />
                    Regulatory Pathway
                  </h2>
                  <div className="flex items-center gap-2 overflow-x-auto pb-4">
                    {['IND Filing', 'Phase I', 'Phase II', 'Phase III', 'NDA Submission', 'FDA Approval'].map((step, i) => (
                      <React.Fragment key={step}>
                        <div className={`shrink-0 rounded-lg border px-4 py-3 text-xs font-medium transition-all ${
                          i < 4
                            ? 'border-success/30 bg-success/10 text-success'
                            : 'border-border bg-muted/20 text-muted-foreground'
                        }`}>
                          {step}
                        </div>
                        {i < 5 && <div className={`h-px w-8 shrink-0 ${i < 3 ? 'bg-success/40' : 'bg-border'}`} />}
                      </React.Fragment>
                    ))}
                  </div>
                </SpotlightCard>
              </BlurReveal>
            </div>
          </TabsContent>

          {/* ━━━ MARKET TAB ━━━ */}
          <TabsContent value="market">
            <div className="space-y-8">
              <BlurReveal>
                <div className="grid gap-6 md:grid-cols-3">
                  <SpotlightCard className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold">$12.4B</div>
                    <div className="text-xs text-muted-foreground mt-1">Total Addressable Market</div>
                  </SpotlightCard>
                  <SpotlightCard className="p-6 text-center">
                    <BarChart3 className="h-8 w-8 text-accent mx-auto mb-3" />
                    <div className="text-3xl font-bold">8.2%</div>
                    <div className="text-xs text-muted-foreground mt-1">Projected CAGR</div>
                  </SpotlightCard>
                  <SpotlightCard className="p-6 text-center">
                    <Users className="h-8 w-8 text-warning mx-auto mb-3" />
                    <div className="text-3xl font-bold">47</div>
                    <div className="text-xs text-muted-foreground mt-1">Active Competitors</div>
                  </SpotlightCard>
                </div>
              </BlurReveal>

              <BlurReveal delay={0.1}>
                <SpotlightCard className="p-8">
                  <h2 className="text-lg font-semibold mb-6">CAGR by Indication</h2>
                  <div className="space-y-4">
                    {[
                      { indication: 'Oncology (Colorectal)', cagr: 12.4 },
                      { indication: 'Oncology (Breast)', cagr: 9.8 },
                      { indication: 'Neurology (Alzheimer\'s)', cagr: 15.2 },
                      { indication: 'Metabolic (PCOS)', cagr: 6.3 },
                      { indication: 'Anti-Aging', cagr: 22.1 },
                    ].map((item) => (
                      <div key={item.indication} className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-48 shrink-0">{item.indication}</span>
                        <div className="flex-1">
                          <Progress value={item.cagr} max={25} color="oklch(0.7 0.2 260)" />
                        </div>
                        <span className="text-sm font-mono font-bold w-16 text-right">{item.cagr}%</span>
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </BlurReveal>

              <BlurReveal delay={0.2}>
                <SpotlightCard className="p-8">
                  <h2 className="text-lg font-semibold mb-6">Competitive Landscape</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-3 text-left text-muted-foreground font-medium">Competitor</th>
                          <th className="pb-3 text-left text-muted-foreground font-medium">Indication</th>
                          <th className="pb-3 text-left text-muted-foreground font-medium">Phase</th>
                          <th className="pb-3 text-right text-muted-foreground font-medium">Market Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {[
                          { name: 'Merck & Co', indication: 'Oncology', phase: 'Phase III', share: '23%' },
                          { name: 'Novartis', indication: 'Neurology', phase: 'Phase II', share: '18%' },
                          { name: 'Roche', indication: 'Oncology', phase: 'Phase II', share: '15%' },
                          { name: 'Johnson & Johnson', indication: 'Metabolic', phase: 'Phase III', share: '12%' },
                        ].map((c) => (
                          <tr key={c.name} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 font-medium">{c.name}</td>
                            <td className="py-3 text-muted-foreground">{c.indication}</td>
                            <td className="py-3"><Badge variant="secondary">{c.phase}</Badge></td>
                            <td className="py-3 text-right font-mono">{c.share}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SpotlightCard>
              </BlurReveal>
            </div>
          </TabsContent>

          {/* ━━━ MOLECULAR TWIN TAB ━━━ */}
          <TabsContent value="molecular">
            <div className="space-y-8">
              <BlurReveal>
                <SpotlightCard className="p-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Dna className="h-5 w-5 text-primary" />
                    <GradientText>Molecular Twin Analysis</GradientText>
                  </h2>

                  {/* 3D molecule placeholder */}
                  <div className="relative mx-auto mb-8 flex h-64 w-full max-w-md items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <motion.div
                      className="h-32 w-32 rounded-full border-2 border-primary/30"
                      animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                      transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 3, repeat: Infinity } }}
                    >
                      <div className="absolute inset-2 rounded-full border border-primary/20 flex items-center justify-center">
                        <Atom className="h-12 w-12 text-primary glow-primary" />
                      </div>
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[0, 60, 120, 180, 240, 300].map((angle) => (
                        <motion.div
                          key={angle}
                          className="absolute h-3 w-3 rounded-full bg-accent/60"
                          animate={{ rotate: [angle, angle + 360] }}
                          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                          style={{ transformOrigin: '80px center', left: 'calc(50% - 6px)', top: 'calc(50% - 6px)' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Similarity Neighbors */}
                  <h3 className="font-semibold mb-4">Structural Neighbors (PubChem)</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      { name: 'Phenformin', cid: 8249, similarity: 0.92 },
                      { name: 'Buformin', cid: 2467, similarity: 0.87 },
                      { name: 'Galegine', cid: 10983, similarity: 0.78 },
                      { name: 'Biguanide', cid: 3037, similarity: 0.95 },
                    ].map((neighbor) => (
                      <div key={neighbor.name} className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/20 transition-colors">
                        <div>
                          <div className="font-medium text-sm">{neighbor.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">CID: {neighbor.cid}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold" style={{ color: neighbor.similarity >= 0.9 ? 'oklch(0.72 0.2 155)' : 'oklch(0.7 0.2 260)' }}>
                            {(neighbor.similarity * 100).toFixed(0)}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">similarity</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </BlurReveal>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
