/**
 * ✦ STUNNING PROGRESS PAGE
 * Features: AnimatedBeam connections, OrbEffect central hub,
 * pulsing agent nodes, animated step transitions, glassmorphic status cards.
 */
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Bot, FlaskConical, Scroll, Scale, Target, Dna,
  Shield, TrendingUp, Brain, Gavel, MessageSquare,
  CheckCircle2, Loader2, Circle, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Aurora, OrbEffect, Particles, GradientText, BlurReveal, SpotlightCard,
} from '@/components/reactbits';

const AGENTS = [
  { name: 'Clinical Agent', icon: FlaskConical, color: '#60a5fa' },
  { name: 'Patent Agent', icon: Shield, color: '#06b6d4' },
  { name: 'Literature Agent', icon: Scroll, color: '#a78bfa' },
  { name: 'Regulatory Agent', icon: Scale, color: '#f59e0b' },
  { name: 'Target Agent', icon: Target, color: '#f43f5e' },
  { name: 'PubChem Agent', icon: Dna, color: '#34d399' },
  { name: 'Similarity Agent', icon: Bot, color: '#818cf8' },
  { name: 'Synthesis Agent', icon: Brain, color: '#fb923c' },
];

const DEBATE_STEP = { name: 'AI Debate', icon: Gavel, color: '#e879f9' };

export default function ProgressPage() {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [debatePhase, setDebatePhase] = React.useState<'advocate' | 'skeptic' | 'consensus' | null>(null);
  const totalSteps = AGENTS.length + 1; // +1 for debate

  // Simulate pipeline progression
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < AGENTS.length) return prev + 1;
        return prev;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Simulate debate phases
  React.useEffect(() => {
    if (currentStep === AGENTS.length) {
      setTimeout(() => setDebatePhase('advocate'), 500);
      setTimeout(() => setDebatePhase('skeptic'), 2500);
      setTimeout(() => setDebatePhase('consensus'), 4500);
    }
  }, [currentStep]);

  const progressPercent = Math.min(
    ((currentStep + (debatePhase === 'consensus' ? 1 : debatePhase ? 0.5 : 0)) / totalSteps) * 100,
    100
  );

  const isComplete = debatePhase === 'consensus';

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <Aurora colors={['oklch(0.7 0.2 260 / 0.05)', 'oklch(0.75 0.18 180 / 0.04)']} />
      <Particles count={25} />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Pipeline
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isComplete ? 'success' : 'glow'}>
              {isComplete ? 'Complete' : 'Processing...'}
            </Badge>
            {isComplete && (
              <Link to={`/report/${id || 'demo'}`}>
                <Button size="sm">View Report</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-6">
        <div className="mx-auto max-w-5xl">
          {/* Progress Bar */}
          <BlurReveal>
            <div className="mb-12">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Pipeline Progress</span>
                <span className="text-sm font-mono font-bold">{Math.round(progressPercent)}%</span>
              </div>
              <Progress
                value={progressPercent}
                color={isComplete ? 'oklch(0.72 0.2 155)' : 'oklch(0.7 0.2 260)'}
                className="h-2"
              />
            </div>
          </BlurReveal>

          {/* Central Pipeline Visualization */}
          <div className="relative">
            {/* Supervisor Node */}
            <motion.div
              className="mx-auto mb-10 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_oklch(0.7_0.2_260/0.2)]">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                {!isComplete && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-ping opacity-30" />
                )}
              </div>
              <span className="mt-2 text-sm font-semibold">Supervisor</span>
              <span className="text-xs text-muted-foreground">Orchestrating agents</span>
            </motion.div>

            {/* Agent Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {AGENTS.map((agent, i) => {
                const status = i < currentStep ? 'complete' : i === currentStep ? 'active' : 'pending';
                return (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <SpotlightCard
                      className={`p-4 text-center transition-all duration-500 ${
                        status === 'active'
                          ? 'border-primary/40 shadow-[0_0_20px_oklch(0.7_0.2_260/0.1)]'
                          : status === 'complete'
                          ? 'border-success/30'
                          : 'opacity-50'
                      }`}
                      spotlightColor={status === 'active' ? `${agent.color}22` : undefined}
                    >
                      <div className="relative mx-auto mb-2">
                        <div
                          className="h-12 w-12 mx-auto rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: status !== 'pending' ? `${agent.color}15` : undefined,
                            borderColor: status === 'active' ? agent.color : undefined,
                          }}
                        >
                          <agent.icon
                            className="h-6 w-6 transition-colors"
                            style={{ color: status !== 'pending' ? agent.color : 'oklch(0.4 0 0)' }}
                          />
                        </div>
                        {/* Status indicator */}
                        <div className="absolute -top-1 -right-1">
                          {status === 'complete' && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            </motion.div>
                          )}
                          {status === 'active' && (
                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                          )}
                          {status === 'pending' && (
                            <Circle className="h-4 w-4 text-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium">{agent.name}</span>
                      {status === 'active' && (
                        <motion.p
                          className="text-[10px] text-primary mt-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Fetching data...
                        </motion.p>
                      )}
                    </SpotlightCard>
                  </motion.div>
                );
              })}
            </div>

            {/* Debate Section */}
            <AnimatePresence>
              {currentStep >= AGENTS.length && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <SpotlightCard className="p-8">
                    <div className="text-center mb-6">
                      <GradientText className="text-xl font-bold" colors={['#a78bfa', '#e879f9', '#a78bfa']}>
                        AI Debate Phase
                      </GradientText>
                      <p className="text-xs text-muted-foreground mt-1">Advocate vs Skeptic → Consensus</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Advocate */}
                      <div className={`rounded-xl border p-5 text-center transition-all duration-500 ${
                        debatePhase === 'advocate' ? 'border-success/40 bg-success/5 shadow-[0_0_15px_oklch(0.72_0.2_155/0.1)]' :
                        debatePhase && debatePhase !== 'advocate' ? 'border-success/20' : 'border-border opacity-50'
                      }`}>
                        <div className="h-12 w-12 mx-auto rounded-xl bg-success/10 flex items-center justify-center mb-3">
                          <MessageSquare className="h-6 w-6 text-success" />
                        </div>
                        <h3 className="text-sm font-semibold">Advocate</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {debatePhase ? '"Strong repurposing potential with robust clinical evidence"' : 'Waiting...'}
                        </p>
                        {(debatePhase === 'advocate') && (
                          <Loader2 className="h-4 w-4 mx-auto mt-2 text-success animate-spin" />
                        )}
                        {debatePhase && debatePhase !== 'advocate' && (
                          <CheckCircle2 className="h-4 w-4 mx-auto mt-2 text-success" />
                        )}
                      </div>

                      {/* Consensus */}
                      <div className={`rounded-xl border p-5 text-center transition-all duration-500 ${
                        debatePhase === 'consensus' ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_oklch(0.7_0.2_260/0.15)]' : 'border-border opacity-50'
                      }`}>
                        <div className="h-12 w-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                          <Gavel className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold">Consensus</h3>
                        {debatePhase === 'consensus' ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-2"
                          >
                            <Badge variant="success" className="text-xs">Verdict: Viable</Badge>
                            <p className="text-[10px] text-muted-foreground mt-2">Confidence: 87%</p>
                          </motion.div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground mt-1">Awaiting debate...</p>
                        )}
                      </div>

                      {/* Skeptic */}
                      <div className={`rounded-xl border p-5 text-center transition-all duration-500 ${
                        debatePhase === 'skeptic' ? 'border-warning/40 bg-warning/5 shadow-[0_0_15px_oklch(0.78_0.15_80/0.1)]' :
                        debatePhase === 'consensus' ? 'border-warning/20' : 'border-border opacity-50'
                      }`}>
                        <div className="h-12 w-12 mx-auto rounded-xl bg-warning/10 flex items-center justify-center mb-3">
                          <MessageSquare className="h-6 w-6 text-warning" />
                        </div>
                        <h3 className="text-sm font-semibold">Skeptic</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {debatePhase === 'skeptic' || debatePhase === 'consensus' ? '"GI tolerability concerns may limit dose escalation"' : 'Waiting...'}
                        </p>
                        {debatePhase === 'skeptic' && (
                          <Loader2 className="h-4 w-4 mx-auto mt-2 text-warning animate-spin" />
                        )}
                        {debatePhase === 'consensus' && (
                          <CheckCircle2 className="h-4 w-4 mx-auto mt-2 text-warning" />
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Complete CTA */}
            <AnimatePresence>
              {isComplete && (
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <OrbEffect className="left-1/2 -translate-x-1/2 -translate-y-1/2" size={300} color="oklch(0.72 0.2 155)" />
                  <div className="relative z-10">
                    <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
                    <p className="text-muted-foreground mb-6">All 8 agents have finished processing. Your report is ready.</p>
                    <Link to={`/report/${id || 'demo'}`}>
                      <Button size="lg" className="shadow-[0_0_30px_oklch(0.7_0.2_260/0.3)]">
                        View Full Report
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
