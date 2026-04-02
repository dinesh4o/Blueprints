/**
 * ✦ STUNNING PRICING PAGE
 * Features: GlowingBorder for popular plan, SpotlightCards,
 * GradientText, BlurReveal stagger, NumberTicker social proof.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Check, ArrowRight, Star, Zap, Building2, Rocket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GradientText, GlowingBorder, SpotlightCard, BlurReveal,
  NumberTicker, Aurora, Particles, MagneticButton, ScrollProgress,
} from '@/components/reactbits';

const PLANS = [
  {
    name: 'Explorer',
    price: 'Free',
    period: '',
    description: 'For individual researchers getting started',
    icon: Sparkles,
    features: [
      '3 reports per month',
      'Standard scoring engine',
      'Top 5 data sources',
      'Community forum access',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Researcher',
    price: '₹999',
    period: '/month',
    description: 'For serious researchers & small teams',
    icon: Zap,
    features: [
      'Unlimited reports',
      'All 8 AI agents',
      'Patent analysis & FTO',
      'PDF export & sharing',
      'Safety heatmaps',
      'Risk radar visualization',
      'Priority processing queue',
      'Debate simulation',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Organization',
    price: '₹2,499',
    period: '/month',
    description: 'For pharma teams & research organizations',
    icon: Building2,
    features: [
      'Everything in Researcher',
      'Team roles & permissions',
      'SSO integration',
      'API access',
      'Custom data sources',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <ScrollProgress />
      <Aurora />
      <Particles count={20} />

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold">Blueprints</span>
          </Link>
          <Link to="/search"><Button size="sm">Dashboard</Button></Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6">
        {/* Hero */}
        <BlurReveal>
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge variant="glow" className="mb-4">
              <Rocket className="mr-1 h-3 w-3" /> Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Computational power for{' '}
              <GradientText colors={['#818cf8', '#06b6d4', '#34d399', '#818cf8']}>
                modern labs
              </GradientText>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Choose the plan that fits your research needs. Upgrade or downgrade anytime.
            </p>
          </div>
        </BlurReveal>

        {/* Plan Cards */}
        <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-3 items-start">
          {PLANS.map((plan, i) => (
            <BlurReveal key={plan.name} delay={i * 0.1}>
              {plan.popular ? (
                <GlowingBorder colors={['#6366f1', '#06b6d4', '#10b981', '#6366f1']} speed={4}>
                  <PlanCard plan={plan} />
                </GlowingBorder>
              ) : (
                <SpotlightCard className="h-full">
                  <PlanCard plan={plan} />
                </SpotlightCard>
              )}
            </BlurReveal>
          ))}
        </div>

        {/* Social proof */}
        <BlurReveal delay={0.4}>
          <div className="mx-auto max-w-3xl mt-20 grid grid-cols-3 gap-6 text-center">
            {[
              { value: 50000, suffix: '+', label: 'Analyses run' },
              { value: 98, suffix: '%', label: 'Accuracy rate' },
              { value: 200, suffix: '+', label: 'Top-tier labs' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold md:text-3xl">
                  <NumberTicker value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </BlurReveal>
      </main>
    </div>
  );
}

function PlanCard({ plan }: { plan: typeof PLANS[0] }) {
  return (
    <div className="p-8 flex flex-col h-full">
      {plan.popular && (
        <Badge className="w-fit mb-4 bg-primary text-primary-foreground">
          <Star className="mr-1 h-3 w-3" /> Most Popular
        </Badge>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <plan.icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{plan.name}</h2>
          <p className="text-xs text-muted-foreground">{plan.description}</p>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-bold">{plan.price}</span>
        {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
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
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
