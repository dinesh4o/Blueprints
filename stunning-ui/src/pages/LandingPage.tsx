/**
 * ✦ STUNNING LANDING PAGE — Blueprints
 * Features: Aurora background, SplitText hero, TiltCards, Marquee,
 * NumberTickers, SpotlightCards, GradientText, BlurReveal sections.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Zap, Brain, Shield, FileText, ChevronRight, Search,
  Bot, FlaskConical, Scale, Target, Dna, Scroll, TrendingUp, Users,
  Database, ArrowRight, Check, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  SplitText, GradientText, Aurora, SpotlightCard, TiltCard,
  NumberTicker, Marquee, BlurReveal, OrbEffect, MagneticButton,
  Particles, ScrollProgress, ShinyText,
} from '@/components/reactbits';

/* ─── Data ─── */
const FEATURES = [
  { icon: Search, title: 'Instant Search', desc: 'Search across 500K+ molecules with real-time autocomplete and voice support.' },
  { icon: Brain, title: 'AI Synthesis', desc: '8 specialized agents analyze clinical, patent, market and molecular data simultaneously.' },
  { icon: Zap, title: 'Real-time Data', desc: 'Live feeds from ClinicalTrials.gov, PubChem, Semantic Scholar, USPTO and more.' },
  { icon: FileText, title: 'Deep Reports', desc: '360° intelligence reports with molecular twins, risk radar and pathway analysis.' },
];

const AGENTS = [
  { icon: FlaskConical, name: 'Clinical Agent', color: 'text-blue-400' },
  { icon: Scroll, name: 'Literature Agent', color: 'text-violet-400' },
  { icon: Scale, name: 'Regulatory Agent', color: 'text-amber-400' },
  { icon: Target, name: 'Target Agent', color: 'text-rose-400' },
  { icon: Dna, name: 'Molecular Agent', color: 'text-emerald-400' },
  { icon: Shield, name: 'Patent Agent', color: 'text-cyan-400' },
  { icon: TrendingUp, name: 'Market Agent', color: 'text-orange-400' },
  { icon: Bot, name: 'Synthesis Lead', color: 'text-indigo-400' },
];

const DATA_SOURCES = [
  'ClinicalTrials.gov', 'PubChem', 'Semantic Scholar', 'USPTO Patents',
  'FDA Orange Book', 'UniProt', 'ChEMBL',
];

const PLANS = [
  { name: 'Explorer', price: 'Free', period: '', features: ['3 reports/month', 'Basic scoring', 'Top 5 sources', 'Community access'], cta: 'Get Started', popular: false },
  { name: 'Researcher', price: '₹499', period: '/mo', features: ['Unlimited reports', '8 AI agents', 'Patent analysis', 'PDF export', 'Safety heatmaps', 'Priority queue'], cta: 'Start Trial', popular: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Researcher', 'Team roles & SSO', 'API access', 'Dedicated support', 'Custom integrations'], cta: 'Contact Sales', popular: false },
];

const STATS = [
  { value: 500000, suffix: '+', label: 'Molecules indexed' },
  { value: 8, suffix: '', label: 'AI agents' },
  { value: 2500000, suffix: '+', label: 'Clinical trials' },
  { value: 360, suffix: '°', label: 'Analysis coverage' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <ScrollProgress />
      <Aurora />
      <Particles count={40} />

      {/* ━━━ NAVBAR ━━━ */}
      <nav className="fixed top-0 inset-x-0 z-40 glass-strong">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Blueprints</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Agents</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/signup"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </nav>

      {/* ━━━ HERO ━━━ */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-16">
        <OrbEffect className="left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2" size={700} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="glow" className="mb-6">
              <Sparkles className="mr-1 h-3 w-3" />
              Next-Gen Drug Intelligence
            </Badge>
          </motion.div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl">
            <SplitText text="Discover the" className="block" delay={0.2} />
            <GradientText className="block mt-2" colors={['#818cf8', '#06b6d4', '#34d399', '#818cf8']}>
              <SplitText text="Future of Pharma" delay={0.6} />
            </GradientText>
          </h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            8 autonomous AI agents analyze clinical trials, patents, molecular structures &amp; market
            intelligence to generate 360° drug repurposing reports in minutes.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <Link to="/search">
              <MagneticButton className="inline-flex h-14 items-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_0_30px_oklch(0.7_0.2_260/0.4)] transition-all hover:shadow-[0_0_50px_oklch(0.7_0.2_260/0.6)] hover:brightness-110">
                Start Analysis
                <ArrowRight className="h-5 w-5" />
              </MagneticButton>
            </Link>
            <a href="#features">
              <Button variant="outline" size="xl">
                See How It Works
                <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </motion.div>

          {/* Floating source badges */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            <span className="text-xs text-muted-foreground mr-2">Powered by</span>
            {DATA_SOURCES.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                <Database className="mr-1 h-3 w-3" />
                {s}
              </Badge>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━ STATS BAR ━━━ */}
      <section className="relative z-10 border-y border-border/50 bg-muted/20 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4 divide-x divide-border/30">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-10 px-4">
              <span className="text-3xl font-bold md:text-4xl">
                <NumberTicker value={stat.value} suffix={stat.suffix} duration={2.5} />
              </span>
              <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━ FEATURES ━━━ */}
      <section id="features" className="relative py-32 px-6">
        <div className="mx-auto max-w-6xl">
          <BlurReveal>
            <div className="text-center mb-16">
              <Badge variant="glow" className="mb-4">Features</Badge>
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                Everything you need for <GradientText>drug discovery</GradientText>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                From molecular search to comprehensive intelligence reports, powered by cutting-edge AI.
              </p>
            </div>
          </BlurReveal>

          <div className="grid gap-6 md:grid-cols-2">
            {FEATURES.map((feat, i) => (
              <BlurReveal key={feat.title} delay={i * 0.1}>
                <SpotlightCard className="p-8 h-full">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{feat.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ AGENTS ━━━ */}
      <section id="agents" className="relative py-32 px-6">
        <OrbEffect className="right-0 top-0" color="oklch(0.75 0.18 180)" size={500} />
        <div className="mx-auto max-w-6xl relative z-10">
          <BlurReveal>
            <div className="text-center mb-16">
              <Badge variant="glow" className="mb-4">
                <Bot className="mr-1 h-3 w-3" />
                AI Agents
              </Badge>
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                <GradientText colors={['#a78bfa', '#06b6d4', '#34d399', '#a78bfa']}>8 Specialized Agents</GradientText>
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
                Each agent is an expert in its domain, working in parallel to deliver comprehensive intelligence.
              </p>
            </div>
          </BlurReveal>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {AGENTS.map((agent, i) => (
              <BlurReveal key={agent.name} delay={i * 0.08}>
                <TiltCard className="p-6 text-center" tiltAmount={8}>
                  <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 ${agent.color}`}>
                    <agent.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-sm">{agent.name}</h3>
                </TiltCard>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ DATA SOURCES MARQUEE ━━━ */}
      <section className="relative py-16 border-y border-border/30">
        <Marquee speed={40} className="py-4">
          {DATA_SOURCES.concat(DATA_SOURCES).map((src, i) => (
            <div key={i} className="mx-8 flex items-center gap-2 text-muted-foreground">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium whitespace-nowrap">{src}</span>
            </div>
          ))}
        </Marquee>
      </section>

      {/* ━━━ WORKFLOW STEPS ━━━ */}
      <section className="relative py-32 px-6">
        <div className="mx-auto max-w-4xl">
          <BlurReveal>
            <div className="text-center mb-16">
              <Badge variant="glow" className="mb-4">How It Works</Badge>
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                From molecule to <GradientText>intelligence</GradientText> in 5 steps
              </h2>
            </div>
          </BlurReveal>

          <div className="space-y-0">
            {[
              { step: '01', title: 'Enter a Compound', desc: 'Type a molecule name or structure. Our autocomplete draws from 500K+ indexed compounds.' },
              { step: '02', title: 'Agents Activate', desc: '8 AI agents simultaneously query clinical trials, patents, literature, targets and market data.' },
              { step: '03', title: 'AI Debate', desc: 'An Advocate and Skeptic debate the compound\'s viability, reaching a consensus verdict.' },
              { step: '04', title: 'Synthesis', desc: 'The Synthesis Lead compiles all findings into a structured 360° intelligence report.' },
              { step: '05', title: 'Your Report', desc: 'Explore interactive visualizations, evidence chains, risk radars and share with your team.' },
            ].map((item, i) => (
              <BlurReveal key={item.step} delay={i * 0.1}>
                <div className="relative flex gap-6 pb-10">
                  {/* Vertical line */}
                  {i < 4 && <div className="absolute left-[23px] top-12 bottom-0 w-px bg-gradient-to-b from-primary/40 to-transparent" />}

                  {/* Step number */}
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary font-mono text-sm font-bold">
                    {item.step}
                  </div>

                  <div className="pt-2">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ PRICING ━━━ */}
      <section id="pricing" className="relative py-32 px-6">
        <Aurora colors={['oklch(0.7 0.2 260 / 0.08)', 'oklch(0.75 0.18 180 / 0.06)']} />
        <div className="mx-auto max-w-5xl relative z-10">
          <BlurReveal>
            <div className="text-center mb-16">
              <Badge variant="glow" className="mb-4">Pricing</Badge>
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                Computational power for <GradientText>modern labs</GradientText>
              </h2>
            </div>
          </BlurReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan, i) => (
              <BlurReveal key={plan.name} delay={i * 0.1}>
                <SpotlightCard
                  className={`relative p-8 h-full flex flex-col ${
                    plan.popular ? 'ring-1 ring-primary/40 shadow-[0_0_40px_oklch(0.7_0.2_260/0.1)]' : ''
                  }`}
                  spotlightColor={plan.popular ? 'oklch(0.7 0.2 260 / 0.12)' : undefined}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-lg">
                        <Star className="mr-1 h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                  </div>
                  <ul className="flex-1 space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-success shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.popular ? 'default' : 'outline'} className="w-full">
                    {plan.cta}
                  </Button>
                </SpotlightCard>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className="relative py-32 px-6">
        <div className="mx-auto max-w-3xl text-center relative z-10">
          <OrbEffect className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" size={600} color="oklch(0.75 0.18 180)" />
          <BlurReveal>
            <h2 className="text-4xl font-bold md:text-5xl">
              Ready to <GradientText>accelerate</GradientText> your research?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of researchers already using Blueprints to discover drug repurposing opportunities.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link to="/signup">
                <MagneticButton className="inline-flex h-14 items-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_0_30px_oklch(0.7_0.2_260/0.4)] hover:shadow-[0_0_50px_oklch(0.7_0.2_260/0.6)] transition-all">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </MagneticButton>
              </Link>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="border-t border-border/30 py-10 px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Blueprints © 2026</span>
          </div>
          <div className="flex items-center gap-6">
            <ShinyText className="text-sm">Built with AI</ShinyText>
          </div>
        </div>
      </footer>
    </div>
  );
}
