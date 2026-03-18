import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Activity, FileText, Sparkles, BrainCircuit, Send,
  ChevronRight, ArrowRight, CheckCircle, Database, FlaskConical,
  TrendingUp, Shield, Microscope,
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Search className="w-5 h-5" />,
    title: 'Instant Search',
    description: 'Query millions of data points instantly across global databases and private registries with deep semantic understanding.',
    floatY: -10,
    floatD: 5.5,
  },
  {
    icon: <BrainCircuit className="w-5 h-5" />,
    title: 'AI Synthesis',
    description: 'Multi-agent systems synthesize complex pharmacological papers and disparate data into actionable insights.',
    floatY: 12,
    floatD: 6.5,
  },
  {
    icon: <Activity className="w-5 h-5" />,
    title: 'Real-time Data',
    description: 'Live tracking and dynamic monitoring of competitive clinical trials and shifting regulatory pathways.',
    floatY: -8,
    floatD: 5.0,
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'Structured Reports',
    description: 'Automated generation of submission-ready evaluation reports, detailed target profiles, and viability scores.',
    floatY: 10,
    floatD: 7.0,
  },
];

// Absolute positions for each hero card (anchored to hero viewport edges)
// Cards are intentionally half-offscreen to create the "peeking" look.

const STEPS = [
  { step: '01', title: 'Enter Compound',         description: 'Input any drug name or molecule identifier to begin autonomous research.' },
  { step: '02', title: 'Multi-Agent Collection', description: '7+ specialized agents query ClinicalTrials.gov, PubChem, USPTO, Semantic Scholar, and more simultaneously.' },
  { step: '03', title: 'AI Synthesis',           description: 'LangGraph orchestrates analysis across trial phases, market data, patent landscape, and molecular properties.' },
  { step: '04', title: 'Scoring & Ranking',      description: 'Repurposing candidates are ranked by evidence strength, phase progression, and market opportunity.' },
  { step: '05', title: 'Report Generated',       description: 'A comprehensive structured report is ready with all insights, scores, and source citations.' },
];

const DATA_SOURCES = [
  { name: 'ClinicalTrials.gov', desc: 'Clinical trial phases & status',    color: 'text-blue-500 dark:text-blue-400'   },
  { name: 'PubChem',            desc: 'Molecular properties & chemistry',  color: 'text-emerald-500 dark:text-emerald-400' },
  { name: 'Semantic Scholar',   desc: 'Scientific literature & citations', color: 'text-purple-500 dark:text-purple-400' },
  { name: 'USPTO PatentsView',  desc: 'Patent filings & IP landscape',     color: 'text-amber-500 dark:text-amber-400'  },
  { name: 'Open Targets',       desc: 'Disease–target associations',       color: 'text-rose-500 dark:text-rose-400'    },
  { name: 'openFDA',            desc: 'Drug approvals & adverse events',   color: 'text-cyan-500 dark:text-cyan-400'    },
  { name: 'NCBI / PubMed',      desc: 'Biomedical research database',      color: 'text-indigo-500 dark:text-indigo-400'},
];

const REPORT_TABS = [
  { icon: <Sparkles className="w-4 h-4" />,     title: 'Overview',             desc: 'Executive summary, confidence scoring, and top repurposing candidates ranked by evidence strength.' },
  { icon: <FlaskConical className="w-4 h-4" />, title: 'Science',              desc: 'ADMET properties, Lipinski Rule of 5, target binding analysis, and full pharmacokinetics profile.' },
  { icon: <Shield className="w-4 h-4" />,       title: 'Clinical & IP',        desc: 'Trial phase distribution, competitive landscape, patent expiry, and freedom-to-operate insights.' },
  { icon: <TrendingUp className="w-4 h-4" />,   title: 'Market Intelligence',  desc: 'Total addressable market, CAGR projections, and opportunity scoring per indication.' },
  { icon: <Microscope className="w-4 h-4" />,   title: 'Molecular Twin',       desc: '3D structure visualization with similar compound analysis and structural comparison matrix.' },
];

const STATS = [
  { value: '7+',       label: 'Data Sources' },
  { value: '5',        label: 'AI Agents'    },
  { value: 'Real-time',label: 'Analysis'     },
  { value: '360°',     label: 'Coverage'     },
];

// ─── Shared card shell ────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative group bg-white/5 dark:bg-[#0c0c0e]/40 backdrop-blur-[24px] border border-slate-300/50 dark:border-slate-400/50 p-7 rounded-3xl flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:border-slate-300/70 dark:hover:border-slate-300/80 hover:shadow-[0_16px_48px_rgba(0,50,200,0.1),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:hover:shadow-[0_16px_48px_rgba(100,150,255,0.15),inset_0_1px_1px_rgba(255,255,255,0.15),0_0_20px_rgba(100,150,255,0.1)] transition-all duration-500 select-none h-full overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5 opacity-50 dark:opacity-20 pointer-events-none" />
      <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-2xl rounded-3xl" />
      
      <div className="relative z-10 p-3 bg-white/60 dark:bg-white/5 border border-slate-300/50 dark:border-slate-400/50 backdrop-blur-md rounded-xl w-fit mb-5 group-hover:scale-110 group-hover:bg-white/80 dark:group-hover:bg-white/10 transition-all duration-500 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <span className="text-blue-600 dark:text-zinc-300">{icon}</span>
      </div>
      <h3 className="relative z-10 text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2.5 tracking-tight drop-shadow-sm">
        {title}
      </h3>
      <p className="relative z-10 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-300 leading-relaxed text-sm font-light">
        {description}
      </p>
    </motion.div>
  );
}

const HERO_OFFSETS = [
  // 0: Left Top → tilt RIGHT
  { x: "-25.8vw", y: "-110vh", rotate: 10 },

  // 1: Right Top → tilt LEFT
  { x: "25vw", y: "-113vh", rotate: -10 },

  // 2: Left Bottom → tilt RIGHT
  { x: "-20vw", y: "-90vh", rotate: -6 },

  // 3: Right Bottom → tilt LEFT
  { x: "25vw", y: "-90vh", rotate: 8 },
];

function AnimatedFeatureCard({ scrollYProgress, index, feature }: { scrollYProgress: MotionValue<number>; index: number; feature: typeof FEATURES[0] }) {
  const init = HERO_OFFSETS[index];
  
  // They start from 'init' when the section is at the bottom of the viewport
  // and converge to 0 when it reaches the middle
  const x = useTransform(scrollYProgress, [0, 0.8], [init.x, "0vw"]);
  const y = useTransform(scrollYProgress, [0, 0.8], [init.y, "0vh"]);
  const rotate = useTransform(scrollYProgress, [0, 0.8], [init.rotate, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [0.82, 1]);

  return (
    <motion.div style={{ x, y, rotate, scale }} className="h-full z-10 w-[420px] max-w-full mx-auto pointer-events-none md:pointer-events-auto">
      <motion.div
        animate={{ y: [0, feature.floatY, 0] }}
        transition={{ duration: feature.floatD, repeat: Infinity, ease: 'easeInOut', delay: index * 0.9 }}
        className="h-full"
      >
        <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
      </motion.div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const featuresRef = React.useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: featuresRef,
    offset: ["start end", "center center"]
  });

  const handleStartAnalysis = () => {
    if (!user) { navigate('/login'); return; }
    setIsNavigating(true);
    setTimeout(() => navigate('/search'), 1500);
  };

  return (
    <main className="bg-[#f8fafc] dark:bg-[#000000] text-zinc-900 dark:text-[#ededed] font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 relative overflow-x-hidden">

      {/* Fixed background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.025)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_90%_70%_at_50%_30%,#000_10%,transparent_100%)]" />

      {/* Navigation transition overlay */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 1.1 }} className="absolute inset-0 bg-white dark:bg-black z-40" />
            <motion.div initial={{ x: '-50vw', y: '50vh', scale: 0.5, opacity: 0 }} animate={{ x: 0, y: 0, scale: 1.5, opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="relative z-50 flex items-center justify-center">
              <motion.div initial={{ x: 0, y: 0, rotate: 0 }} animate={{ x: -300, y: -200, rotate: -45, opacity: 0 }} transition={{ duration: 0.6, delay: 0.8, ease: 'easeInOut' }} style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} className="absolute">
                <Send className="w-24 h-24 text-zinc-400 dark:text-zinc-300 drop-shadow-2xl" strokeWidth={1} fill="currentColor" />
              </motion.div>
              <motion.div initial={{ x: 0, y: 0, rotate: 0 }} animate={{ x: 300, y: 200, rotate: 45, opacity: 0 }} transition={{ duration: 0.6, delay: 0.8, ease: 'easeInOut' }} style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }} className="absolute">
                <Send className="w-24 h-24 text-zinc-400 dark:text-zinc-300 drop-shadow-2xl" strokeWidth={1} fill="currentColor" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          Full viewport. Hero text sits above everything.
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] overflow-hidden flex items-center justify-center z-10 pointer-events-none">

        {/* ── Hero text (z-20) ─────────────────────────────── */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center max-w-3xl pointer-events-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-medium tracking-wide mb-8 shadow-sm">
              <Sparkles size={13} className="text-blue-500 dark:text-zinc-400" />
              NEXT-GEN DISCOVERY ENGINE
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-[84px] font-bold tracking-tighter leading-[1.05] mb-7">
              <span className="text-zinc-900 dark:text-white">Autonomous</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-zinc-200 dark:to-zinc-600">
                Research Platform
              </span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-xl text-center mb-10 font-light leading-relaxed">
              Analyze clinical trials, literature, and regulatory data in seconds using advanced multi-agent orchestrations.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleStartAnalysis}
                className="px-9 py-4 text-sm tracking-wide font-medium bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer"
              >
                Start Analysis
              </button>
              <a
                href="#features"
                className="py-4 px-8 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white flex items-center gap-1.5 transition-colors"
              >
                See how it works <ChevronRight size={14} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-9 border border-zinc-300 dark:border-zinc-700 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full" />
          </motion.div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Scroll</span>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — FEATURES GRID
          A completely separate full viewport. Cards fly in from the hero's
          scattered positions and settle into a centered 2×2 grid.
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        ref={featuresRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 border-t border-zinc-100 dark:border-zinc-800/40 z-0"
      >
        {/* Section heading animates up from below */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Unified Intelligence
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-lg font-light max-w-xl mx-auto">
            Scattered data points converge into a structured, actionable pipeline.
          </p>
        </motion.div>

        {/* 2×2 Grid — each card flies in from its hero position on scroll */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
          {FEATURES.map((f, i) => (
            <AnimatedFeatureCard key={i} scrollYProgress={scrollYProgress} index={i} feature={f} />
          ))}
        </div>
      </section>

      {/* ─── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-10 border-y border-zinc-200 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">{s.value}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 uppercase tracking-widest font-medium">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-32 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto font-light">
              From molecule name to comprehensive repurposing report in minutes.
            </p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[calc(10%+32px)] right-[calc(10%+32px)] h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
              {STEPS.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-5 relative z-10 shadow-sm">
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">{s.step}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-2 leading-tight">{s.title}</h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── DATA SOURCES ─────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative z-10 border-t border-zinc-100 dark:border-zinc-800/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-6">
              <Database size={12} />
              REAL DATA ONLY
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Powered by Real Data
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-lg font-light max-w-xl mx-auto">
              Every insight is grounded in authoritative, real-time data from global scientific databases.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DATA_SOURCES.map((ds, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                viewport={{ once: true }}
                className="bg-white/70 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 cursor-default"
              >
                <div className={`text-xs font-semibold mb-1.5 ${ds.color}`}>{ds.name}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed">{ds.desc}</div>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.49 }}
              viewport={{ once: true }}
              className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 flex items-center justify-center"
            >
              <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">+ more <ArrowRight size={11} /></span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── REPORT SECTIONS ──────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative z-10 border-t border-zinc-100 dark:border-zinc-800/40">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Comprehensive Reports
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-lg font-light max-w-xl mx-auto">
              Every report covers five critical dimensions of drug repurposing analysis.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {REPORT_TABS.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/70 dark:bg-[#0a0a0b]/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 group cursor-default"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center mb-4 text-zinc-500 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300">
                  {r.icon}
                </div>
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-2 tracking-tight">{r.title}</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative z-10 border-t border-zinc-100 dark:border-zinc-800/40">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-8">
            <CheckCircle size={12} className="text-emerald-500" />
            No setup required
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6 leading-tight">
            Start your first<br />analysis today
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-light mb-10 max-w-lg mx-auto leading-relaxed">
            Enter any compound name and let our multi-agent system deliver a complete repurposing intelligence report.
          </p>
          <button
            onClick={handleStartAnalysis}
            className="h-14 px-12 text-sm tracking-wide font-medium bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-full transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer"
          >
            Start Analysis
          </button>
        </motion.div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/40 py-10 px-6 relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 tracking-tight">
            <Sparkles size={14} className="text-blue-500 dark:text-zinc-500" />
            Blueprints
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            Autonomous drug repurposing intelligence platform.
          </p>
        </div>
      </footer>

    </main>
  );
}
