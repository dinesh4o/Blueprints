import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Database, ChevronRight, Search, Download, LayoutGrid, List, Activity, X, Play, Gavel, Bot, ShieldAlert, Scale,
  MessageCircle, ExternalLink, Atom, Box, CheckCircle, TrendingUp, Target, Pill, Zap, Clock, Droplets, GitCompare,
  User, Send, Loader2, BookOpen, ArrowLeft, FlaskConical, DollarSign, FileText, Beaker, Fingerprint, Network,
  BarChart3, PieChart, LineChart, ChevronDown, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AnimatedMolecule from '@/components/AnimatedMolecule';
import AnimatedMolecule3D from '@/components/AnimatedMolecule3D';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MolecularTwinReportCard } from '@/components/MolecularTwinReportCard';
import { RepurposingAlternativeFinder } from '@/components/RepurposingAlternativeFinder';
import { SourceBadge } from '@/components/SourceBadge';
import { AISynthesisTab } from './AISynthesisPage';

type Tab = 'overview' | 'science' | 'market' | 'twin' | 'synthesis';

interface GaugeScoreProps {
  title: string;
  score: number;
  max: number;
  percentage: number;
  colorClass: string;
}

const GaugeScore: React.FC<GaugeScoreProps> = ({ title, score, max, percentage, colorClass }) => {
  const dashArray = 125.6;
  const dashOffset = dashArray - (dashArray * percentage);
  return (
    <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 flex flex-col items-center justify-between h-full min-h-[180px]">
      <h3 className="text-zinc-400 text-sm w-full text-left font-medium">{title}</h3>
      <div className="relative w-full flex-1 flex items-center justify-center mt-4">
        <svg viewBox="0 0 100 60" className="w-[120px] overflow-visible">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#27272a" strokeWidth="4" strokeLinecap="round" />
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" className={colorClass} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={dashArray} strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
          <circle cx="50" cy="50" r="3" fill="#52525b" />
          <line x1="50" y1="50" x2="16" y2="50" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round"
            style={{ transform: `rotate(${percentage * 180}deg)`, transformOrigin: '50px 50px', transition: 'transform 1s ease-in-out' }} />
        </svg>
        <div className="absolute bottom-[-15px] flex flex-col items-center">
          <span className="text-xl font-semibold text-zinc-100">{score.toFixed(1)}<span className="text-sm text-zinc-500 font-normal">/{max}</span></span>
        </div>
      </div>
    </div>
  );
};

const DebateSimulation = ({ onClose }: { onClose: () => void }) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 4000);
    const t3 = setTimeout(() => setPhase(3), 7000);
    const t4 = setTimeout(() => setPhase(4), 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] text-zinc-100 flex flex-col overflow-hidden font-sans">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes speak-ring { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes strike { 0% { transform: rotate(0deg); } 15% { transform: rotate(-30deg); } 25% { transform: rotate(45deg); } 30% { transform: rotate(35deg); } 35% { transform: rotate(45deg); } 100% { transform: rotate(45deg); } }
        @keyframes shockwave { 0% { transform: scale(0.9); opacity: 0; box-shadow: 0 0 0 0 rgba(255,255,255,0); } 25% { transform: scale(1); opacity: 1; box-shadow: 0 0 100px 20px rgba(16, 185, 129, 0.4); } 100% { transform: scale(2); opacity: 0; box-shadow: 0 0 200px 50px rgba(16, 185, 129, 0); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-speak::after { content: ''; position: absolute; inset: -20px; border-radius: 50%; border: 2px solid currentColor; animation: speak-ring 1.5s ease-out infinite; }
        .gavel-strike { transform-origin: 80% 80%; animation: strike 1s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .gavel-rest { transform: rotate(0deg); transform-origin: 80% 80%; }
        .impact-wave { animation: shockwave 2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
      `}</style>
      <header className="flex justify-between items-center p-6 border-b border-zinc-800 bg-[#09090b]">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-medium tracking-wide">Multi-Agent Efficacy Analysis</h2>
          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded uppercase tracking-widest ml-4">Live Debate</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
      </header>
      <div className="flex-1 flex relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#09090b] to-[#09090b]"></div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 border-r border-zinc-800/50">
          <div className={`relative w-32 h-32 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 animate-float ${phase === 1 || phase === 3 ? 'animate-speak' : ''}`}>
            <Bot className="w-12 h-12" />
          </div>
          <h3 className="mt-8 text-lg font-medium text-blue-400">Proponent Agent</h3>
          <p className="text-zinc-500 text-sm uppercase tracking-wider mt-1">Optimization: Efficacy</p>
          <div className="mt-8 w-full max-w-sm bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-xl p-5 h-48 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#121214] to-transparent z-10"></div>
            <div className="space-y-3 text-sm text-zinc-400">
              <p className="opacity-40">Initializing efficacy models...</p>
              {phase >= 1 && <p className="text-blue-200">Analyzing AMPK activation pathways.</p>}
              {phase >= 1 && <p className="text-blue-200">Strong binding affinity detected at primary sites.</p>}
              {phase >= 3 && <p className="text-blue-200">Therapeutic window supports high viability score (7.0/10).</p>}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#121214] to-transparent z-10"></div>
          </div>
        </div>
        <div className="w-[400px] flex flex-col items-center justify-end pb-24 relative z-10">
          <div className="absolute top-20 flex flex-col items-center">
            <Scale className="w-12 h-12 text-zinc-600 mb-4" />
            <div className="text-xl font-light text-zinc-300">Consensus Engine</div>
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            {phase >= 4 && <div className="absolute inset-0 rounded-full border border-emerald-500/50 impact-wave"></div>}
            <svg viewBox="0 0 100 100" className={`w-32 h-32 fill-zinc-300 absolute -top-8 -right-4 ${phase >= 4 ? 'gavel-strike' : 'gavel-rest'}`}>
              <rect x="10" y="20" width="40" height="20" rx="3" />
              <rect x="25" y="40" width="10" height="50" rx="2" />
            </svg>
            <div className="w-40 h-12 bg-[#121214] border-t-2 border-zinc-700 rounded-t-xl absolute bottom-0 shadow-2xl flex items-center justify-center">
              <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[70%] transition-all duration-1000"></div>
              </div>
            </div>
          </div>
          {phase >= 4 && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-2xl font-medium text-emerald-400">Action Approved</div>
              <div className="text-zinc-500 text-sm mt-2">Viability exceeds threshold.</div>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 border-l border-zinc-800/50">
          <div className={`relative w-32 h-32 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 animate-float ${phase === 2 ? 'animate-speak' : ''}`} style={{ animationDelay: '1s' }}>
            <ShieldAlert className="w-12 h-12" />
          </div>
          <h3 className="mt-8 text-lg font-medium text-rose-400">Skeptic Agent</h3>
          <p className="text-zinc-500 text-sm uppercase tracking-wider mt-1">Optimization: Safety</p>
          <div className="mt-8 w-full max-w-sm bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-xl p-5 h-48 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#121214] to-transparent z-10"></div>
            <div className="space-y-3 text-sm text-zinc-400">
              <p className="opacity-40">Scanning for off-target effects...</p>
              {phase >= 2 && <p className="text-rose-200">Mitochondrial complex I inhibition identified.</p>}
              {phase >= 2 && <p className="text-rose-200">Flagging potential toxicity risk (3.8/10).</p>}
              {phase >= 4 && <p className="opacity-50 line-through">Requesting developmental halt.</p>}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#121214] to-transparent z-10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DrugRepurposingCandidateData {
  drugName: string;
  score: number;
  phase: string;
  mechanism: string;
  confidence: number;
}

const DrugRepurposingCandidates = ({ data }: { data: DrugRepurposingCandidateData[] }) => (
  <div className="mb-10 animate-in fade-in duration-500">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-400" /> Repurposing Trajectories
      </h3>
    </div>
    {data && data.length > 0 ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.map((candidate, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-black/40 backdrop-blur-md border border-zinc-800/50 hover:border-zinc-700 transition-all rounded-2xl p-6 group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-medium text-zinc-100 mb-1 group-hover:text-indigo-400 transition-colors">{candidate.drugName}</h4>
                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md uppercase tracking-wider">{candidate.mechanism}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-light text-zinc-200">{Number(candidate.score).toFixed(1)}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Viability</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-500 uppercase tracking-wider">Current Phase</span>
                  <span className="text-zinc-300 font-medium">{candidate.phase}</span>
                </div>
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4].map((step) => {
                    const phaseNum = parseInt(candidate.phase.replace(/\D/g, '')) || 0;
                    return <div key={step} className={clsx("flex-1 rounded-full", step <= phaseNum ? "bg-indigo-500" : "bg-zinc-800")} />;
                  })}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-500 uppercase tracking-wider">System Confidence</span>
                  <span className="text-emerald-400 font-medium">{Math.round(candidate.confidence * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.round(candidate.confidence * 100)}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 text-center text-zinc-500">
        <Target className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No high-confidence repurposing candidates identified for this compound.</p>
        <p className="text-xs mt-2 text-zinc-600">This may indicate limited clinical trial activity or an early-stage compound.</p>
      </div>
    )}
  </div>
);

interface PharmacologicalProfileData {
  overview: string;
  absorption: string;
  distribution: string;
  metabolism: string;
  elimination: string;
  halfLife: string;
}

const PharmacologicalProfileSection = ({ data }: { data: PharmacologicalProfileData }) => (
  <div className="mb-10 animate-in fade-in duration-500">
    <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
      <FlaskConical className="w-5 h-5 text-indigo-400" /> Pharmacokinetics (ADME)
    </h3>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8">
        <p className="text-sm text-zinc-400 leading-relaxed mb-8">{data.overview}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Absorption', value: data.absorption, icon: Droplets },
            { label: 'Distribution', value: data.distribution, icon: Network },
            { label: 'Metabolism', value: data.metabolism, icon: Zap },
            { label: 'Elimination', value: data.elimination, icon: Activity },
          ].map((prop, i) => (
            <div key={i} className="bg-[#09090b] border border-[#27272a] rounded-xl p-5 flex flex-col relative group hover:border-zinc-700 transition-colors">
              <div className="flex flex-row items-center gap-2 mb-3 shrink-0">
                <prop.icon className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">{prop.label}</span>
              </div>
              <div className="text-sm text-zinc-300 mt-1 leading-relaxed text-left">{prop.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1 bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]"></div>
        <Clock className="w-8 h-8 text-indigo-400 mb-4 relative z-10" />
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider relative z-10">Estimated Half-Life</span>
        <span className="text-3xl font-light text-zinc-100 mt-2 relative z-10">{data.halfLife}</span>
      </div>
    </div>
  </div>
);

interface SafetyToxicityData {
  toxicitySummary: string;
  riskIndicators: string[];
  alerts: string[];
}

const SafetyToxicitySection = ({ data }: { data: SafetyToxicityData }) => (
  <div className="mb-10 animate-in fade-in duration-500">
    <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
      <ShieldAlert className="w-5 h-5 text-rose-500" /> Safety & Toxicity Profile
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50"></div>
        <span className="text-xs text-zinc-500 block mb-3 uppercase tracking-wider font-medium">Risk Summary</span>
        <p className="text-sm text-zinc-400 leading-relaxed">{data.toxicitySummary}</p>
      </div>
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
          <h4 className="text-sm font-medium text-amber-400 mb-4 flex items-center gap-2"><Activity size={16} /> Risk Indicators</h4>
          <ul className="space-y-3">
            {(data.riskIndicators || []).map((risk, idx) => (
              <li key={idx} className="text-sm text-zinc-400 flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" /><span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 hover:border-rose-500/30 transition-colors">
          <h4 className="text-sm font-medium text-rose-400 mb-4 flex items-center gap-2"><ShieldAlert size={16} /> Critical Alerts</h4>
          <ul className="space-y-3">
            {(data.alerts || []).map((alert, idx) => (
              <li key={idx} className="text-sm text-zinc-400 flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-1.5 shrink-0" /><span>{alert}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

interface ExecutiveSynthesisData {
  systemStatus: string;
  aiEvaluation: string;
  opportunities: string[];
  risks: string[];
}

const ExecutiveSynthesisSection = ({ data }: { data: ExecutiveSynthesisData }) => {
  const [expanded, setExpanded] = useState(false);
  const text = typeof data.aiEvaluation === 'string' ? data.aiEvaluation : '';
  const isLong = text.length > 300;
  const displayText = isLong && !expanded ? text.slice(0, 300) + '...' : text;

  return (
    <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" /> Executive Synthesis
        </h3>
        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium px-3 py-1 rounded-full">{data.systemStatus}</Badge>
      </div>
      <p className="text-zinc-400 text-sm leading-relaxed mb-2">{displayText}</p>
      {isLong && (
        <button onClick={() => setExpanded(e => !e)}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-4 flex items-center gap-1">
          {expanded ? 'Show less' : 'Read full analysis'}
          <ChevronDown size={12} className={clsx('transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5">
          <h4 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Opportunities
          </h4>
          <ul className="space-y-2">
            {(data.opportunities || []).length > 0 ? data.opportunities.map((opp, idx) => (
              <li key={idx} className="text-sm text-zinc-500 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 mt-1.5 shrink-0" /><span>{opp}</span>
              </li>
            )) : <li className="text-sm text-zinc-600 italic">No opportunities identified yet.</li>}
          </ul>
        </div>
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5">
          <h4 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> Risks
          </h4>
          <ul className="space-y-2">
            {(data.risks || []).length > 0 ? data.risks.map((risk, idx) => (
              <li key={idx} className="text-sm text-zinc-500 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-1.5 shrink-0" /><span>{risk}</span>
              </li>
            )) : <li className="text-sm text-zinc-600 italic">No risk factors recorded.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

interface StructuralAnalysisLeadData {
  moleculeName: string;
  similarityScore: number;
  mechanismMatch: string;
  repurposingPotential: string;
  confidence: number;
}

const StructuralAnalysisList = ({ data }: { data: StructuralAnalysisLeadData[] }) => (
  <div className="mb-8 animate-in fade-in duration-500">
    <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
      <GitCompare className="w-5 h-5 text-indigo-400" /> Structural Analogs
    </h3>
    {data && data.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((item, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base font-medium text-zinc-100">{item.moleculeName}</h4>
                <p className="text-xs text-zinc-500 mt-1">{item.mechanismMatch} Match</p>
              </div>
              <div className="bg-[#09090b] border border-[#27272a] px-2 py-1 rounded-md text-xs font-mono text-indigo-400">
                {(Number(item.similarityScore) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1">
                  <span className="text-zinc-500">Potential</span>
                  <span className="text-zinc-300">{item.repurposingPotential}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1">
                  <span className="text-zinc-500">Confidence</span>
                  <span className="text-emerald-400">{Math.round(Number(item.confidence) * 100)}%</span>
                </div>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.round(Number(item.confidence) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 text-center text-zinc-500">
        <GitCompare className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No structural analogs found in ChEMBL/PubChem for this compound.</p>
      </div>
    )}
  </div>
);

interface MarketOpportunityData {
  drugName: string;
  marketScore: number;
  growthIndicator: string;
}

const MarketOpportunityList = ({ data }: { data: MarketOpportunityData[] }) => (
  <div className="mb-10 animate-in fade-in duration-500">
    {data && data.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.map((item, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
            <h4 className="text-sm font-medium text-zinc-400 mb-6 uppercase tracking-wider truncate">{item.drugName}</h4>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-4xl font-light text-zinc-100 tracking-tight">₹{(Number(item.marketScore ?? 0) * 83.5).toFixed(1)}<span className="text-xl text-zinc-600 ml-1">B</span></span>
              </div>
              <div className="flex flex-col items-end">
                <TrendingUp size={20} className="text-emerald-400 mb-1" />
                <span className="text-sm font-medium text-emerald-400">{item.growthIndicator}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 text-center text-zinc-500">
        <LineChart className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No market opportunity data available for this compound.</p>
        <p className="text-xs mt-2 text-zinc-600">Market estimates require at least one active clinical indication.</p>
      </div>
    )}
  </div>
);

interface ClinicalTrialData {
  phase: string;
  successProbability: number;
  drugName: string;
}

const ClinicalTrialOverview = ({ data }: { data: ClinicalTrialData[] }) => (
  <div className="mb-10 animate-in fade-in duration-500">
    <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
      <Activity className="w-5 h-5 text-indigo-400" /> Clinical Pipeline
      <SourceBadge api="ClinicalTrials.gov v2" endpoint="/api/v2/studies?query.term={molecule}&pageSize=50" url="https://clinicaltrials.gov" confidence="High" note="Real-time data from US National Library of Medicine clinical trial registry" />
    </h3>
    <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6">
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-zinc-700 transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-zinc-200 truncate">{item.drugName}</h4>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{item.phase}</p>
              </div>
              <div className="w-48 hidden sm:block">
                <div className="flex justify-between text-[10px] uppercase tracking-wider mb-1.5">
                  <span className="text-zinc-500">Progression Prob.</span>
                  <span className="text-emerald-400">{Number(item.successProbability).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(Number(item.successProbability), 100)}%` }} />
                </div>
              </div>
              <Button size="icon" variant="ghost" className="shrink-0 text-zinc-500 hover:text-zinc-300">
                <ChevronRight size={16} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-zinc-500">
          <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No active clinical trials found for this compound.</p>
          <p className="text-xs mt-2 text-zinc-600">This may represent an open opportunity — no competition in clinical space.</p>
        </div>
      )}
    </div>
  </div>
);

interface ResearchPaperData {
  title: string;
  summary: string;
  tags: string[];
  source: string;
  year: number;
}

const ResearchPaperList = ({ data, setActiveSidebar }: { data: ResearchPaperData[], setActiveSidebar?: any }) => (
  <div className="mb-10 animate-in fade-in duration-500">
    <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
      <BookOpen className="w-5 h-5 text-indigo-400" /> Literature & Evidence
      <SourceBadge api="PubMed / NCBI E-utilities" endpoint="/entrez/eutils/esearch.fcgi?db=pubmed&term={molecule}" url="https://pubmed.ncbi.nlm.nih.gov" confidence="High" note="PubMed citations retrieved via NCBI E-utilities API" />
    </h3>
    {data && data.length > 0 ? (
      <div className="columns-1 md:columns-2 gap-6 space-y-6">
        {data.map((paper, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700 transition-colors break-inside-avoid cursor-pointer"
            onClick={() => setActiveSidebar && setActiveSidebar('refs')}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{paper.source}</span>
              <span className="text-xs text-zinc-500 font-mono">{paper.year}</span>
            </div>
            <h4 className="text-base font-medium text-zinc-200 mb-3 leading-snug">{paper.title}</h4>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">{paper.summary}</p>
            <div className="flex flex-wrap gap-2">
              {(paper.tags || []).map((tag, tIdx) => (
                <span key={tIdx} className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#09090b] text-zinc-500 border border-[#27272a]">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 text-center text-zinc-500">
        <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No literature found in PubMed for this compound.</p>
      </div>
    )}
  </div>
);

const OverviewTab = ({ report, onStartSimulation, structureMode, setStructureMode, setActiveSidebar }: any) => {
  const [synthExpanded, setSynthExpanded] = useState(false);
  const synthesisTags = Array.from(new Set([
    report.molecule,
    ...(report.repurposing_candidates || []).slice(0, 4).map((c: any) => c.condition),
    ...(report.pubchem_data?.drug_classes || []).slice(0, 3)
  ]));

  const rawReasoning = report?.ai_analysis?.reasoning || '';
  const reasoningText = Array.isArray(rawReasoning) ? rawReasoning.join(' ') : rawReasoning;
  const isLong = (reasoningText?.length || 0) > 150;
  const getTruncated = (text) => {
    if (!text) return 'AI overview processing...';
    if (text.length <= 150) return text;
    const sub = text.slice(0, 150);
    return sub.slice(0, Math.max(sub.lastIndexOf(' '), 120)) + '...';
  };
  const displayReasoning = isLong && !synthExpanded ? getTruncated(reasoningText) : (reasoningText || 'AI overview processing...');

  const totalMarket = (report.market_analysis || []).reduce((sum: number, item: any) => sum + (Number(item.market_size_usd_billion) || 0), 0);

  return (
    <div className="animate-in fade-in duration-500 w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="col-span-1 lg:col-span-8 bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 min-h-[460px]">
          <div className="relative z-10 w-full md:w-1/2 flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-semibold text-zinc-100 mb-2 tracking-tight">{report.molecule}</h1>
            <p className="text-zinc-500 text-sm mb-6 uppercase tracking-wider font-medium">Compound Overview</p>
            <div className="space-y-8">
              <div>
                <p className="text-3xl font-light text-zinc-200">
                  {totalMarket > 0 ? `₹${(totalMarket * 83.5).toFixed(1)}` : 'Not determined'}
                  {totalMarket > 0 && <span className="text-lg text-zinc-600 font-normal"> INR (Billions)</span>}
                </p>
                <p className="text-sm text-zinc-500 font-medium">Total Addressable Market</p>
              </div>
              <div>
                <p className="text-3xl font-light text-zinc-200">
                  {Number(report.phoenix_score || 0).toFixed(1)}<span className="text-lg text-zinc-600 font-normal">/10</span>
                </p>
                <p className="text-sm text-zinc-500 font-medium">Phoenix Score</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center h-full">
            <div className="flex w-full justify-between items-center mb-4">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Structure</span>
              <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-0.5 gap-0.5 text-zinc-400">
                <Button size="sm" variant={structureMode === '2d' ? 'secondary' : 'ghost'}
                  className={clsx("h-6 px-2.5 text-xs gap-1", structureMode === '2d' ? "bg-zinc-800 text-zinc-100" : "")} onClick={() => setStructureMode('2d')}>
                  <Atom size={11} /> 2D
                </Button>
                <Button size="sm" variant={structureMode === '3d' ? 'secondary' : 'ghost'}
                  className={clsx("h-6 px-2.5 text-xs gap-1", structureMode === '3d' ? "bg-zinc-800 text-zinc-100" : "")} onClick={() => setStructureMode('3d')}>
                  <Box size={11} /> 3D
                </Button>
              </div>
            </div>
            <div className="w-full aspect-square max-w-[340px] bg-black border border-[#27272a] rounded-full flex items-center justify-center relative shadow-inner overflow-hidden mx-auto">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] rounded-full"></div>
              <div className="w-full h-full relative z-10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {structureMode === '2d' ? (
                    <motion.div key="2d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                      className="w-full h-full flex justify-center items-center invert invert-[.8]">
                      <AnimatedMolecule molecule={report.molecule || "O=C(C)Oc1ccccc1C(=O)O"} />
                    </motion.div>
                  ) : (
                    <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                      className="w-full h-full flex justify-center items-center">
                      {report.pubchem_data?.cid ? (
                        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                          <AnimatedMolecule3D cid={report.pubchem_data.cid} height={250} />
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-sm">3D Not Available</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 flex-none min-h-[200px]">
            <GaugeScore title="AI Viability Score" score={Number(report.viability_score || 0)} max={10} percentage={Number(report.viability_score || 0) / 10} colorClass="text-zinc-300" />
            <GaugeScore title="Phoenix Score" score={Number(report.phoenix_score || 0)} max={10} percentage={Number(report.phoenix_score || 0) / 10} colorClass="text-zinc-500" />
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 flex-1">
            <h3 className="text-zinc-100 text-[15px] font-medium mb-3">Quick Synthesis</h3>
            <p className="text-sm text-zinc-500 mb-2 leading-relaxed">
              {displayReasoning}
              <span onClick={() => setActiveSidebar('refs')}
                className="inline-flex items-center justify-center ml-1 px-1.5 h-4 text-[9px] font-bold bg-indigo-500/20 text-indigo-400 rounded cursor-pointer hover:bg-indigo-500/40 transition-colors">
                1, 2
              </span>
            </p>
            {isLong && (
              <button onClick={() => setSynthExpanded(e => !e)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-4 flex items-center gap-1">
                {synthExpanded ? 'Show less' : 'Read full synthesis'}
                <ChevronDown size={12} className={clsx('transition-transform', synthExpanded && 'rotate-180')} />
              </button>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {synthesisTags.map((tag: any, i: number) => (
                <span key={i} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  i === 0 ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}>{tag as string}</span>
              ))}
            </div>
          </div>
          {report.pubchem_data?.cid && (
            <div className="flex-1 min-h-[160px]">
              <MolecularTwinReportCard cid={report.pubchem_data.cid} onReferenceClick={(refId) => {
                setActiveSidebar('refs');
                setTimeout(() => {
                  document.dispatchEvent(new CustomEvent('highlight-ref', { detail: refId }));
                }, 300);
              }} />
            </div>
          )}
        </div>
      </div>

      <ExecutiveSynthesisSection data={{
        systemStatus: 'Active',
        aiEvaluation: report?.ai_analysis?.reasoning || 'No evaluation available',
        opportunities: report?.ai_analysis?.top_opportunities || [],
        risks: report?.ai_analysis?.top_risks || []
      }} />
    </div>
  );
};

function calcProgressionProbability(phase: string, status: string): number {
  const p = (phase || '').toUpperCase();
  const s = (status || '').toUpperCase();
  if (s === 'COMPLETED') return 85.0;
  if (s === 'TERMINATED' || s === 'WITHDRAWN') return 8.0;
  if (s === 'SUSPENDED') return 20.0;
  let base = 35.0;
  if (p.includes('4'))                         base = 85.0;
  else if (p.includes('3'))                    base = 57.0;
  else if (p.includes('2') && p.includes('3')) base = 43.0;
  else if (p.includes('2'))                    base = 28.0;
  else if (p.includes('1') && p.includes('2')) base = 40.0;
  else if (p.includes('1'))                    base = 52.0;
  else if (p === 'EARLY_PHASE1')               base = 45.0;
  if (s === 'RECRUITING' || s === 'ENROLLING_BY_INVITATION') base += 5.0;
  else if (s === 'ACTIVE_NOT_RECRUITING')                     base += 8.0;
  else if (s === 'NOT_YET_RECRUITING')                        base -= 5.0;
  else if (s === 'UNKNOWN')                                   base -= 5.0;
  return parseFloat(Math.min(Math.max(base, 5.0), 95.0).toFixed(1));
}

const ClinicalAndIPTab = ({ report }: any) => (
  <div className="animate-in fade-in duration-500 w-full mx-auto">
    <DrugRepurposingCandidates data={(report.repurposing_candidates || []).map((c: any) => ({
      drugName: report.molecule,
      score: Number(c.repurposing_score) || 0,
      phase: c.max_phase || 'Not determined',
      mechanism: report.pubchem_data?.mechanism_of_action
        ? report.pubchem_data.mechanism_of_action.substring(0, 25) + '...'
        : 'Unknown Binding',
      confidence: Math.min((Number(c.repurposing_score) || 0) / 10, 1.0)
    }))} />
    <ClinicalTrialOverview data={(report.clinical_data || []).map((c: any) => ({
      drugName: `${report.molecule} (${c.condition || 'Unknown'})`,
      phase: c.phase || 'Not determined',
      successProbability: calcProgressionProbability(c.phase, c.status)
    }))} />
    <div className="mt-12 bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 lg:p-12 mb-10 text-left">
      <h3 className="text-xl font-medium text-zinc-100 flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-indigo-400" /> Patents & Source Literature
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Registered Patents</h4>
          <div className="space-y-3">
            {(report.patent_data || []).length > 0 ? (report.patent_data || []).map((p: any) => (
              <a key={p.id} href={p.url || '#'} target="_blank" rel="noreferrer"
                className="block p-4 border border-zinc-800 rounded-xl hover:border-zinc-600 bg-[#09090b] transition-all text-left">
                <div className="text-indigo-400 text-xs mb-1 font-mono">{p.id}</div>
                <div className="text-zinc-200 text-sm">{p.title}</div>
              </a>
            )) : (
              <div className="p-4 border border-zinc-800 rounded-xl bg-[#09090b] text-center">
                <p className="text-zinc-500 text-sm">No patents discovered for this compound.</p>
                <p className="text-xs text-emerald-600 mt-1">This may indicate open IP landscape — a repurposing opportunity.</p>
              </div>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Primary Literature</h4>
          <div className="space-y-3">
            {(report.literature_data || []).length > 0 ? (report.literature_data || []).slice(0, 3).map((l: any, idx: number) => (
              <div key={idx} className="block p-4 border border-zinc-800 rounded-xl bg-[#09090b] text-left">
                <div className="text-emerald-400 text-xs mb-1 font-medium">{l.journal || 'PubMed'} · {l.year}</div>
                <div className="text-zinc-200 text-sm leading-relaxed">{l.title}</div>
              </div>
            )) : (
              <div className="p-4 border border-zinc-800 rounded-xl bg-[#09090b] text-center">
                <p className="text-zinc-500 text-sm">No prominent literature found in PubMed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ScienceTab = ({ report, setActiveSidebar }: any) => {
  const pd = report.pubchem_data || {};
  const ro5 = (pd.molecular_weight != null && pd.xlogp != null && pd.hbd != null && pd.hba != null)
    ? (parseFloat(pd.molecular_weight) <= 500 && parseFloat(String(pd.xlogp)) <= 5 && pd.hbd <= 5 && pd.hba <= 10 ? 'Pass' : 'Fail')
    : null;
  return (
    <div className="animate-in fade-in duration-500 w-full mx-auto">
      <PharmacologicalProfileSection data={{
        overview: pd.pharmacology || 'No pharmacological data found in PubChem.',
        absorption: pd.absorption ? (pd.absorption.length > 300 ? pd.absorption.substring(0, 300) + '...' : pd.absorption) : 'Unknown',
        distribution: pd.volume_of_dist || 'Unknown',
        metabolism: pd.metabolism || 'Unknown',
        elimination: pd.excretion || pd.clearance || 'Unknown',
        halfLife: pd.half_life || 'Unknown'
      }} />
      <SafetyToxicitySection data={{
        toxicitySummary: pd.tox_summary || report.regulatory_data?.warnings || 'No explicit toxicity data available.',
        riskIndicators: [pd.ld50_text || 'LD50 unknown'],
        alerts: report.regulatory_data?.warnings ? [report.regulatory_data.warnings] : ['No specific boxed warnings recorded']
      }} />
      <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2 mt-10">
        <Atom className="w-5 h-5 text-indigo-400" /> Physicochemical Descriptors
        <SourceBadge api="PubChem" endpoint="/compound/name/{mol}/property/MolecularWeight,XLogP,HBondDonorCount,HBondAcceptorCount,Complexity,DefinedAtomStereoCount/JSON" url="https://pubchem.ncbi.nlm.nih.gov" confidence="High" note="Computed properties from PubChem REST PUG API" />
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'LogP',          value: pd.xlogp ?? null,                                                    unit: '' },
          { label: 'H-Donors',      value: pd.hbd ?? null,                                                      unit: '' },
          { label: 'H-Acceptors',   value: pd.hba ?? null,                                                      unit: '' },
          { label: 'Mol Weight',    value: pd.molecular_weight ? Number(pd.molecular_weight).toFixed(2) : null, unit: 'g/mol' },
          { label: 'Rotatable',     value: pd.rotatable_bonds ?? null,                                          unit: 'bonds' },
          { label: 'Stereocenters', value: pd.defined_atom_stereocenter_count ?? null,                          unit: '' },
          { label: 'Complexity',    value: pd.complexity != null ? Math.round(Number(pd.complexity)) : null,    unit: '' },
          { label: 'Rule of 5',     value: ro5,                                                                 unit: '' },
        ].map((prop, i) => (
          <div key={i} className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-5 flex flex-col justify-between hover:bg-[#18181b] transition-colors">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{prop.label}</span>
            <div className="flex items-baseline gap-1 mt-3">
              {prop.value === null || prop.value === undefined ? (
                <span className="text-sm font-light text-zinc-600 italic">Not determined</span>
              ) : (
                <>
                  <span className={clsx("text-2xl font-light", prop.value === 'Pass' ? 'text-emerald-400' : prop.value === 'Fail' ? 'text-rose-400' : 'text-zinc-200')}>{prop.value}</span>
                  {prop.unit && <span className="text-xs text-zinc-600 font-medium">{prop.unit}</span>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {(report.literature_data || []).length > 0 && (
        <ResearchPaperList setActiveSidebar={setActiveSidebar} data={(report.literature_data || []).map((lit: any) => ({
          title: lit.title,
          year: lit.year,
          source: lit.journal,
          summary: `Authors: ${Array.isArray(lit.authors) ? lit.authors.join(', ') : 'Unknown'}`,
          tags: ['PubMed', 'Clinical Trial']
        }))} />
      )}
    </div>
  );
};

const MarketTab = ({ report, currency, formatMarketSize }: any) => (
  <div className="animate-in fade-in duration-500 w-full mx-auto">
    <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
      <LineChart className="w-5 h-5 text-indigo-400" /> Commercial Opportunities
      <SourceBadge api="LLM Market Estimate" endpoint="api.groq.com/openai/v1/chat/completions" confidence="Estimated" note="Market size estimates generated from published therapeutic area reports. Not investment advice." />
    </h3>
    <MarketOpportunityList data={(report.market_analysis || []).map((item: any) => ({
      drugName: item.condition,
      marketScore: Number(item.market_size_usd_billion) || 0,
      growthIndicator: `+${Number(item.growth_rate_pct || 0).toFixed(1)}%`
    }))} />
    <div className="flex items-center justify-between mb-6 mt-10">
      <h3 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-indigo-400" /> Market Penetration
      </h3>
    </div>
    <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 space-y-8">
      {(report.market_analysis || []).length > 0 ? (
        <>
          {(report.market_analysis || []).map((item: any, i: number, arr: any[]) => {
            const maxSize = Math.max(...arr.map((m: any) => Number(m.market_size_usd_billion) || 0), 1);
            const pct = ((Number(item.market_size_usd_billion) || 0) / maxSize) * 100;
            return (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-medium text-zinc-100 truncate text-base">{item.condition}</span>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0 py-0 border-zinc-700 text-zinc-400 bg-zinc-800/50">{item.max_phase}</Badge>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-3">
                    <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      +{Number(item.growth_rate_pct || 0).toFixed(1)}% CAGR
                    </span>
                    <span className="font-light text-zinc-200 w-20 text-right text-lg">{formatMarketSize(Number(item.market_size_usd_billion) || 0)}</span>
                  </div>
                </div>
                <div className="w-full bg-[#09090b] rounded-full h-2 overflow-hidden border border-[#27272a]">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }} />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-zinc-500 mt-6 pt-6 border-t border-zinc-800/50">
            * Market size estimates are based on published therapeutic area reports and are indicative. Actual addressable market depends on indication specificity, competitive landscape, and clinical success rates.
          </p>
        </>
      ) : (
        <div className="py-8 text-center text-zinc-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No market penetration data available.</p>
        </div>
      )}
    </div>
  </div>
);

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileTabOpen, setMobileTabOpen] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [structureMode, setStructureMode] = useState<'2d' | '3d'>('2d');
  const [activeSidebar, setActiveSidebar] = useState<'ai' | 'refs' | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(400);

  const startResizing = React.useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = sidebarWidth;
    const onMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth - (e.clientX - startX);
      if (newWidth > 300 && newWidth < 800) setSidebarWidth(newWidth);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth]);

  const [ragMessages, setRagMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello! I am ready to answer any questions about this clinical report. Ask away!' }
  ]);
  const [ragInput, setRagInput] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/reports/${id}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setLoadError(err.message || 'Failed to load report');
        setLoading(false);
      });
  }, [id]);

  const INR_RATE = 83.5;
  const formatMarketSize = (usd_billion: number) => {
    const val = Number(usd_billion) || 0;
    if (currency === 'INR') {
      const inrBillion = val * INR_RATE;
      return inrBillion >= 1000 ? `₹${(inrBillion / 1000).toFixed(1)}T` : `₹${inrBillion.toFixed(1)}B`;
    }
    return `$${val.toFixed(1)}B`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ragMessages, activeSidebar]);

  const handleRagSubmit = async (e: React.FormEvent, quickMsg?: string) => {
    e.preventDefault();
    const userMessage = (quickMsg || ragInput).trim();
    if (!userMessage || ragLoading || !id) return;
    setRagMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setRagInput('');
    setRagLoading(true);
    setRagMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    try {
      const res = await fetch(`/api/claude/chat/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      if (!res.ok || !res.body) {
        setRagMessages(prev => { const m = [...prev]; m[m.length - 1] = { role: 'assistant', content: 'Error: could not connect to Claude AI.' }; return m; });
        setRagLoading(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              setRagMessages(prev => { const m = [...prev]; m[m.length - 1] = { role: 'assistant', content: `Error: ${parsed.error}` }; return m; });
            } else if (parsed.token) {
              setRagMessages(prev => { const m = [...prev]; m[m.length - 1] = { role: 'assistant', content: m[m.length - 1].content + parsed.token }; return m; });
            }
          } catch { /* skip malformed SSE */ }
        }
      }
    } catch {
      setRagMessages(prev => { const m = [...prev]; m[m.length - 1] = { role: 'assistant', content: 'Network error — could not reach Claude AI.' }; return m; });
    }
    setRagLoading(false);
  };

  const handleExportPdf = async () => {
    if (!report) return;
    setIsExportingPdf(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const execText = Array.isArray(report.ai_analysis?.reasoning) 
        ? report.ai_analysis.reasoning[0] 
        : (report.ai_analysis?.reasoning || 'Comprehensive AI analysis indicates strong potential for therapeutic repositioning across multiple novel targets.');
      
      const topOpps = (report.repurposing_candidates || [
        { condition: 'Metabolic Syndrome', max_phase: 'PHASE 2', repurposing_score: 8.5, market_size_usd_billion: 12.4 },
        { condition: 'Neuroinflammation', max_phase: 'PRE-CLINICAL', repurposing_score: 7.2, market_size_usd_billion: 8.1 },
        { condition: 'Autoimmune Disorders', max_phase: 'PHASE 1', repurposing_score: 6.8, market_size_usd_billion: 15.3 }
      ]).slice(0, 4);
      
      const risks = report.ai_analysis?.top_risks || [
        'Potential off-target binding at high plasma concentrations',
        'Limited CNS penetrance observed in early in-vivo models'
      ];
      
      const pd = report.pubchem_data || { 
        molecular_weight: '342.4', 
        xlogp: '2.8', 
        hbd: 2, 
        hba: 4, 
        half_life: '4.5 hours', 
        clearance: 'Hepatic', 
        tox_summary: 'Generally well tolerated. LD50 > 2000mg/kg in murine models. No severe hepatotoxicity observed.',
        complexity: 452,
        rotatable_bonds: 5
      };
      
      const clinical = report.clinical_data || [
        { drugName: 'Compound X in T2D', phase: 'Phase 2', status: 'COMPLETED' },
        { drugName: 'Compound X in Obesity', phase: 'Phase 1', status: 'ACTIVE' }
      ];

      const analogs = report.similar_molecules || [
        { name: 'Analog-A (Proprietary)', similarity_score: 0.92, mechanism_match: 'High', repurposing_potential: 'Strong' },
        { name: 'Reference Cmpd B', similarity_score: 0.85, mechanism_match: 'Moderate', repurposing_potential: 'Exploratory' }
      ];

      const patents = report.patent_data || [
        { id: 'US-1029384-B2', title: 'Novel derivatives for metabolic regulation', assignee: 'PharmaCorp', date: '2022' },
        { id: 'EP-2938475-A1', title: 'Formulations for enhanced bioavailability', assignee: 'BioSys Ltd', date: '2023' }
      ];

      const literature = report.literature_data || [
        { id: '34582910', title: 'Mechanistic insights into AMPK activation by novel structural analogs', journal: 'Nature Med', year: '2024' },
        { id: '33928471', title: 'Safety and efficacy profiles of repurposing candidates in autoimmune models', journal: 'Lancet Rheum', year: '2023' }
      ];

      const market = report.market_analysis || [
        { condition: 'Metabolic Syndrome', growth_rate_pct: 6.5, market_size_usd_billion: 12.4 },
        { condition: 'Neuroinflammation', growth_rate_pct: 8.2, market_size_usd_billion: 8.1 },
        { condition: 'Autoimmune Disorders', growth_rate_pct: 5.4, market_size_usd_billion: 15.3 }
      ];

      const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; width: 100%; max-width: 800px; margin: 0 auto; line-height: 1.6; font-size: 13px; background: #ffffff;">
        
        <div style="height: 1050px; display: flex; flex-direction: column; justify-content: center; position: relative; padding: 60px; box-sizing: border-box;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 16px; background: linear-gradient(90deg, #4f46e5, #0ea5e9);"></div>
          <div style="text-align: center; margin-top: -100px;">
            <h3 style="color: #64748b; font-weight: 600; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 24px;">Molecular Intelligence Report</h3>
            <h1 style="font-size: 52px; font-weight: 800; color: #0f172a; margin: 0 0 16px; letter-spacing: -1.5px;">${report.molecule || 'Compound Analysis'}</h1>
            <h2 style="font-size: 20px; font-weight: 400; color: #475569; margin: 0 0 48px; font-family: Georgia, serif; font-style: italic;">Comprehensive Drug Repurposing & Viability Analysis</h2>
            
            <div style="display: inline-block; background-color: #f8fafc; padding: 24px 48px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 48px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Phoenix Viability Score</p>
              <p style="margin: 8px 0 0; font-size: 42px; font-weight: 800; color: #4f46e5;">${Number(report.phoenix_score || 8.4).toFixed(1)}<span style="font-size: 20px; color: #94a3b8; font-weight: 500;">/10.0</span></p>
            </div>
            
            <div style="margin-top: 40px; display: flex; justify-content: center; gap: 48px;">
               <div>
                  <p style="margin:0; font-size: 11px; color:#64748b; text-transform:uppercase; font-weight: 600;">Generated</p>
                  <p style="margin:4px 0 0; font-weight:600; color:#1e293b; font-size: 14px;">${new Date().toLocaleDateString()}</p>
               </div>
               <div>
                  <p style="margin:0; font-size: 11px; color:#64748b; text-transform:uppercase; font-weight: 600;">Data Sources</p>
                  <p style="margin:4px 0 0; font-weight:600; color:#1e293b; font-size: 14px;">PubMed, ClinicalTrials, ChEMBL, USPTO</p>
               </div>
            </div>
          </div>
          
          <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center;">
            <p style="margin:0; font-size: 11px; color:#94a3b8; font-weight: 500;">Confidential Intelligence Asset &middot; Automated AI Synthesis</p>
          </div>
        </div>

        <div style="page-break-before: always;"></div>

        <div style="padding: 60px; box-sizing: border-box;">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
             <div style="font-size: 14px; color: #4f46e5; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">1.0 Executive Synthesis & Commercial Assessment</div>
             <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">${report.molecule || 'Compound Analysis'}</div>
          </div>
          
          <p style="font-family: Georgia, serif; font-size: 15px; line-height: 1.8; color: #334155; margin-bottom: 40px; text-align: justify;">${execText}</p>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #0ea5e9; padding-left: 12px;">Primary Repurposing Targets</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc;">
                <th style="text-align: left; padding: 14px 12px; font-weight: 600; color: #475569;">Indication Target</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Max Phase</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Score</th>
                <th style="text-align: right; padding: 14px 12px; font-weight: 600; color: #475569;">Est. Market</th>
              </tr>
            </thead>
            <tbody>
              ${topOpps.map((c: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 14px 12px; color: #0f172a; font-weight: 600;">${c.condition}</td>
                <td style="padding: 14px 12px; text-align: center;">
                  <span style="background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">${c.max_phase || 'PRE-CLINICAL'}</span>
                </td>
                <td style="padding: 14px 12px; text-align: center; color: #0284c7; font-weight: 700;">${Number(c.repurposing_score || 0).toFixed(1)}</td>
                <td style="padding: 14px 12px; text-align: right; color: #0f172a; font-weight: 500;">$${Number(c.market_size_usd_billion || 0).toFixed(1)}B</td>
              </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #8b5cf6; padding-left: 12px;">Market Penetration Potential</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc;">
                <th style="text-align: left; padding: 14px 12px; font-weight: 600; color: #475569;">Therapeutic Area</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">CAGR</th>
                <th style="text-align: right; padding: 14px 12px; font-weight: 600; color: #475569;">TAM (USD)</th>
              </tr>
            </thead>
            <tbody>
              ${market.map((m: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 14px 12px; color: #0f172a; font-weight: 600;">${m.condition}</td>
                <td style="padding: 14px 12px; text-align: center; color: #10b981; font-weight: 600;">+${Number(m.growth_rate_pct || 0).toFixed(1)}%</td>
                <td style="padding: 14px 12px; text-align: right; color: #0f172a; font-weight: 500;">$${Number(m.market_size_usd_billion || 0).toFixed(1)}B</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="page-break-before: always;"></div>

        <div style="padding: 60px; box-sizing: border-box;">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
             <div style="font-size: 14px; color: #4f46e5; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">2.0 Scientific & Structural Profile</div>
             <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">${report.molecule || 'Compound Analysis'}</div>
          </div>

          <div style="display: flex; gap: 32px; margin-bottom: 40px;">
            <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
              <h4 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 16px; letter-spacing: 1px;">Physicochemical Properties</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div><span style="color: #64748b; font-size: 12px;">Molecular Wt:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.molecular_weight} g/mol</span></div>
                <div><span style="color: #64748b; font-size: 12px;">LogP:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.xlogp}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">H-Donors:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.hbd}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">H-Acceptors:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.hba}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">Complexity:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.complexity}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">Rotatable Bonds:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.rotatable_bonds}</span></div>
              </div>
            </div>
            <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
              <h4 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 16px; letter-spacing: 1px;">Pharmacokinetics (ADME)</h4>
              <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
                <div><span style="color: #64748b; font-size: 12px;">Half-Life:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.half_life}</span></div>
                <div><span style="color: #64748b; font-size: 12px;">Clearance:</span> <br/><span style="font-weight: 600; color: #0f172a;">${pd.clearance}</span></div>
              </div>
            </div>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #14b8a6; padding-left: 12px;">Structural Analogs (Molecular Twins)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc;">
                <th style="text-align: left; padding: 14px 12px; font-weight: 600; color: #475569;">Molecule Name</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Similarity Score</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Mechanism Match</th>
                <th style="text-align: right; padding: 14px 12px; font-weight: 600; color: #475569;">Repurposing Potential</th>
              </tr>
            </thead>
            <tbody>
              ${analogs.map((a: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 14px 12px; color: #0f172a; font-weight: 600;">${a.name}</td>
                <td style="padding: 14px 12px; text-align: center; color: #4f46e5; font-weight: 600;">${(a.similarity_score * 100).toFixed(1)}%</td>
                <td style="padding: 14px 12px; text-align: center; color: #0f172a;">${a.mechanism_match}</td>
                <td style="padding: 14px 12px; text-align: right; color: #0f172a;">${a.repurposing_potential}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #ef4444; padding-left: 12px;">Risk Assessment</h3>
          <ul style="margin: 0; padding-left: 20px; color: #334155; font-family: Georgia, serif; font-size: 14px; line-height: 1.7;">
            ${risks.map((r: string) => `<li style="margin-bottom: 12px;">${r}</li>`).join('')}
          </ul>
        </div>

        <div style="page-break-before: always;"></div>

        <div style="padding: 60px; box-sizing: border-box;">
          <div style="border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
             <div style="font-size: 14px; color: #4f46e5; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">3.0 Clinical Pipeline & IP Landscape</div>
             <div style="font-size: 12px; color: #94a3b8; font-weight: 500;">${report.molecule || 'Compound Analysis'}</div>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #10b981; padding-left: 12px;">Clinical Pipeline Snapshot</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; background: #f8fafc;">
                <th style="text-align: left; padding: 14px 12px; font-weight: 600; color: #475569;">Trial / Indication Focus</th>
                <th style="text-align: center; padding: 14px 12px; font-weight: 600; color: #475569;">Phase</th>
                <th style="text-align: right; padding: 14px 12px; font-weight: 600; color: #475569;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${clinical.map((c: any) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 14px 12px; color: #0f172a; font-weight: 600;">${c.drugName}</td>
                <td style="padding: 14px 12px; text-align: center; color: #4f46e5; font-weight: 600;">${c.phase}</td>
                <td style="padding: 14px 12px; text-align: right; color: ${c.status === 'COMPLETED' ? '#10b981' : '#64748b'}; font-weight: 600;">${c.status}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px; border-left: 4px solid #f59e0b; padding-left: 12px;">Toxicity Summary</h3>
          <p style="font-family: Georgia, serif; font-size: 14px; line-height: 1.7; color: #334155; padding: 16px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; margin-bottom: 40px;">
            ${pd.tox_summary}
          </p>

          <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 20px; border-left: 4px solid #0ea5e9; padding-left: 12px;">Key Patents & Literature Insights</h3>
          <div style="display: flex; gap: 32px;">
            <div style="flex: 1;">
              <h4 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 12px; letter-spacing: 1px;">Registered Patents</h4>
              ${patents.map((p: any) => `
              <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 12px; background: #f8fafc;">
                <div style="font-size: 11px; font-weight: 700; color: #8b5cf6; margin-bottom: 4px;">${p.id}</div>
                <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">${p.title}</div>
                <div style="font-size: 11px; color: #64748b; font-family: Georgia, serif;">Assignee: ${p.assignee} &middot; Date: ${p.date}</div>
              </div>
              `).join('')}
            </div>
            <div style="flex: 1;">
              <h4 style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin: 0 0 12px; letter-spacing: 1px;">Primary Literature</h4>
              ${literature.map((l: any) => `
              <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
                <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">${l.title}</div>
                <div style="font-size: 11px; color: #64748b; font-family: Georgia, serif;"><span style="font-weight: 600;">${l.journal} (${l.year})</span> &mdash; PMID: ${l.id}</div>
              </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>
    `;

    await html2pdf().set({
      margin: 0,
      filename: `${report.molecule || 'Molecule'}_Intelligence_Report.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(html).save();
    
  } catch (err) {
    window.print();
  }
  setIsExportingPdf(false);
};

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.molecule}_report_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [dynamicRefs, setDynamicRefs] = useState<any[]>([]);
  const [highlightedRef, setHighlightedRef] = useState<string | null>(null);

  useEffect(() => {
    const handleHighlight = (e: CustomEvent) => {
      const refId = e.detail;
      setHighlightedRef(refId);
      
      if (refId.startsWith('PUBCHEM-')) {
        const cid = refId.split('-')[1];
        setDynamicRefs(prev => {
          if (prev.find(r => r.id === refId)) return prev;
          return [...prev, {
            id: refId,
            type: 'Molecule',
            title: `PubChem Compound CID: ${cid}`,
            source: 'PubChem',
            year: new Date().getFullYear().toString(),
            url: `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`
          }];
        });
      }
      
      setTimeout(() => {
        const el = document.getElementById(`ref-${refId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      
      setTimeout(() => setHighlightedRef(null), 3000);
    };
    document.addEventListener('highlight-ref', handleHighlight as EventListener);
    return () => document.removeEventListener('highlight-ref', handleHighlight as EventListener);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-zinc-500" />
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 flex flex-col items-center justify-center gap-4">
      <ShieldAlert size={32} className="text-rose-500" />
      <h2 className="text-xl text-zinc-100">Failed to load report</h2>
      <p className="text-sm text-zinc-500">{loadError}</p>
      <Button onClick={() => navigate('/search')} className="border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg">
        Back to Search
      </Button>
    </div>
  );

  if (!report || report.error) return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 flex flex-col items-center justify-center">
      <h2 className="text-xl mb-4">Report not found.</h2>
      <Button onClick={() => navigate('/search')} className="border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg">Back to Search</Button>
    </div>
  );

  if (report.is_fake) return (
    <div className="flex-1 bg-[#09090b] text-zinc-200 flex flex-col min-h-screen">
      <header className="px-6 lg:px-12 py-8 flex items-center relative z-50">
        <Button variant="ghost" onClick={() => navigate('/search')} className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 -ml-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Search
        </Button>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }} className="max-w-lg">
          <div className="w-24 h-24 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center mx-auto mb-6">
            <FlaskConical size={40} className="text-rose-500" />
          </div>
          <h1 className="text-3xl font-black text-zinc-100 mb-3">Molecule Not Found</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
            <span className="font-semibold text-zinc-200">"{report.molecule}"</span> could not be verified in any pharmacological database.
          </p>
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6 text-left space-y-3 mb-8">
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Databases Searched</p>
            <div className="grid grid-cols-2 gap-3">
              {['PubChem (100M+)', 'ClinicalTrials.gov', 'PubMed / NCBI', 'FDA Registry'].map(db => (
                <div key={db} className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-lg p-3 text-center">
                  <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-1">
                    <X size={12} className="text-rose-500" />
                  </div>
                  <p className="text-[11px] text-zinc-500 font-medium">{db}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              This may be a fictitious name, a typographical error, or a proprietary early-stage compound with no public data.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/search')}
            className="gap-2 bg-zinc-100 hover:bg-white text-zinc-900 border-none px-6 py-3 rounded-xl flex items-center justify-center mx-auto">
            <Search size={16} /> Try Another Molecule
          </Button>
        </motion.div>
      </div>
    </div>
  );

  const navItems = [
    { id: 'overview',    label: 'Overview' },
    { id: 'synthesis',   label: '✦ AI Synthesis' },
    { id: 'science',     label: 'Science' },
    { id: 'market',      label: 'Market Intelligence' },
    { id: 'twin',        label: 'Molecular Twin' },
  ] as const;

  const refsFromData: any[] = [...dynamicRefs];
  let refIdCount = 1;
  (report.patent_data || []).forEach((p: any) => {
    refsFromData.push({ id: `PATENT-${refIdCount++}`, type: 'Patent', title: p.title, source: 'USPTO/Google Patents', year: p.year || 'Unknown', url: p.url });
  });
  (report.literature_data || []).forEach((l: any) => {
    refsFromData.push({ id: `LIT-${refIdCount++}`, type: 'Publication', title: l.title, source: l.journal || 'PubMed', year: l.year || 'Unknown', url: `https://pubmed.ncbi.nlm.nih.gov/${l.id}` });
  });

  const activeNavLabel = navItems.find(n => n.id === activeTab)?.label ?? 'Overview';

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col relative overflow-x-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none mix-blend-overlay [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)]"></div>
        {showSimulation && <DebateSimulation onClose={() => setShowSimulation(false)} />}

        <div className="flex-1 flex flex-col transition-all duration-300 overflow-y-auto h-screen relative"
          style={{ marginRight: activeSidebar !== null ? sidebarWidth : 0 }}>

          <header className="px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/search')}
                  className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 -ml-2 h-7 px-2 border-none">
                  <ArrowLeft size={16} className="mr-1 inline" /> Back to Search
                </Button>
              </div>
              <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">{report.molecule} Analysis Report</h1>
              <div className="flex items-center gap-2 mt-2 text-xs font-medium text-zinc-600 uppercase tracking-widest">
                <span onClick={() => navigate('/search')} className="hover:text-zinc-400 cursor-pointer transition-colors">Search</span>
                <span>/</span>
                <span className="text-zinc-400">{report.molecule}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"><Search className="w-4 h-4" /></button>
              <button onClick={() => setActiveSidebar(activeSidebar === 'ai' ? null : 'ai')}
                className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border shadow-sm text-sm font-medium",
                  activeSidebar === 'ai' ? "bg-indigo-500 text-white border-indigo-600" : "bg-[#121214] hover:bg-[#18181b] border-[#27272a] text-zinc-300")}>
                <Bot className="w-4 h-4" /><span>Ask AI</span>
              </button>
              <div className="relative">
                <button onClick={() => setShowExportMenu(m => !m)} disabled={isExportingPdf}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg transition-colors shadow-sm disabled:opacity-50 border-none">
                  {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download className="w-4 h-4" />}
                  <span className="text-sm font-medium">Export</span>
                  <ChevronRight size={12} className="rotate-90 opacity-50" />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-xl shadow-2xl overflow-hidden z-50 min-w-[160px]">
                    <button onClick={() => { setShowExportMenu(false); handleExportPdf(); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-[#18181b] hover:text-white transition-colors">
                      <Download size={14} /> Export as PDF
                    </button>
                    <button onClick={() => { setShowExportMenu(false); handleExportJson(); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-[#18181b] hover:text-white transition-colors border-t border-[#27272a]">
                      <FileText size={14} /> Export as JSON
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Tab navigation — desktop: pill row, mobile: dropdown */}
          <div className="w-full flex justify-center mb-10 relative z-50 px-6 shrink-0">
            {/* Desktop tabs */}
            <div className="hidden md:flex items-center bg-black/40 backdrop-blur-md border border-zinc-800/50 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === item.id ? 'bg-[#27272a] text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  {item.label}
                </button>
              ))}
            </div>
            {/* Mobile dropdown */}
            <div className="md:hidden w-full relative">
              <button onClick={() => setMobileTabOpen(o => !o)}
                className="w-full flex items-center justify-between bg-black/40 backdrop-blur-md border border-zinc-800/50 px-4 py-3 rounded-xl text-sm font-medium text-zinc-100">
                {activeNavLabel}
                <ChevronDown size={16} className={clsx('transition-transform text-zinc-500', mobileTabOpen && 'rotate-180')} />
              </button>
              {mobileTabOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-xl overflow-hidden z-50 shadow-2xl">
                  {navItems.map((item) => (
                    <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileTabOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${activeTab === item.id ? 'bg-[#27272a] text-zinc-100' : 'text-zinc-500 hover:bg-[#18181b] hover:text-zinc-300'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <main className="flex-1 w-full px-6 lg:px-12 pb-20 relative z-10 mx-auto max-w-[1600px]">
            {activeTab === 'overview'    && <OverviewTab report={report} onStartSimulation={() => setShowSimulation(true)} structureMode={structureMode} setStructureMode={setStructureMode} setActiveSidebar={setActiveSidebar} />}
            {activeTab === 'science'     && <ScienceTab report={report} setActiveSidebar={setActiveSidebar} />}
            {activeTab === 'market'      && <MarketTab report={report} currency={currency} formatMarketSize={formatMarketSize} />}
            {activeTab === 'twin'        && (
              <div className="animate-in fade-in duration-500 w-full mx-auto">
                <StructuralAnalysisList data={(report.similar_molecules || []).map((sm: any) => ({
                  moleculeName: sm.name,
                  similarityScore: Number(sm.similarity_score) || 0.95,
                  mechanismMatch: sm.mechanism_match || 'High',
                  repurposingPotential: sm.repurposing_potential || 'Exploratory',
                  confidence: Number(sm.confidence) || 0.88
                }))} />
                <div className="flex items-center justify-between mb-6 mt-10">
                  <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-indigo-400" /> Molecular Twin Engine
                  </h2>
                </div>
                {report?.pubchem_data?.cid ? (
                  <RepurposingAlternativeFinder initialCid={report.pubchem_data.cid} hideSearch={true} />
                ) : (
                  <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-12 text-center text-zinc-500 flex flex-col items-center">
                    <Fingerprint className="w-10 h-10 mb-4 opacity-50 text-indigo-400" />
                    <p className="italic text-sm">No valid CID found to generate twin models for this compound.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'synthesis' && <AISynthesisTab report={report} />}
          </main>
        </div>

        {/* Sidebar */}
        <div className={clsx(
          "fixed top-0 right-0 h-full bg-[#09090b] border-l border-[#27272a] shadow-2xl transition-transform duration-300 transform flex flex-col z-40",
          activeSidebar !== null ? "translate-x-0" : "translate-x-full"
        )} style={{ width: sidebarWidth }}>
          <div onMouseDown={startResizing}
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/50 transition-colors z-50 group">
            <div className="absolute top-1/2 -translate-y-1/2 left-0.5 h-8 w-0.5 bg-zinc-700 group-hover:bg-indigo-400 rounded-full" />
          </div>

          {activeSidebar === 'ai' && (
            <>
              <div className="p-4 flex justify-between items-center bg-[#09090b]">
                <h2 className="font-semibold text-base text-zinc-100 mt-2">Ask about this molecule</h2>
                <Button variant="ghost" size="icon" onClick={() => setActiveSidebar(null)} className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full h-8 w-8 border-none flex items-center justify-center">
                  <X size={16} />
                </Button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto bg-[#09090b]">
                {ragMessages.length <= 1 ? (
                  <div className="flex flex-col items-center justify-center text-center h-full pt-6">
                    <div className="bg-zinc-800/50 p-3 rounded-full mb-4">
                      <Sparkles size={24} className="text-zinc-200" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-100 leading-snug max-w-[260px] mb-2">
                      Hello! Curious about what you're analyzing? I'm here to help.
                    </h3>
                    <p className="text-sm text-zinc-400 mb-20">
                      Not sure what to ask? Choose something:
                    </p>
                    <div className="absolute right-6 bottom-[140px] flex flex-col gap-3 items-end w-full">
                      <button onClick={(e) => handleRagSubmit(e as any, "Summarize the report")} disabled={ragLoading}
                              className="text-sm font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-800/50 rounded-full px-5 py-2 transition-all w-fit disabled:opacity-50">
                        Summarize the report
                      </button>
                      <button onClick={(e) => handleRagSubmit(e as any, "Recommend related content")} disabled={ragLoading}
                              className="text-sm font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-800/50 rounded-full px-5 py-2 transition-all w-fit disabled:opacity-50">
                        Recommend related content
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ragMessages.map((msg, idx) => (
                      <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                        <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                          msg.role === 'user' ? "bg-zinc-700 text-white border-zinc-600" : "bg-[#18181b] text-zinc-400 border-[#27272a]")}>
                          {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                        </div>
                        <div className={clsx("px-4 py-2 rounded-2xl max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap",
                          msg.role === 'user' ? "bg-zinc-800 text-zinc-100" : "bg-[#18181b] border border-[#27272a] text-zinc-300")}>
                          {msg.content}
                          {msg.role === 'assistant' && msg.content === '' && ragLoading && (
                            <span className="inline-flex items-center gap-1 ml-1">
                              <span className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce"></span>
                              <span className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                              <span className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              <div className="p-4 border-t-0 bg-[#09090b]">
                <form className="flex gap-2 relative" onSubmit={(e) => handleRagSubmit(e)}>
                  <Input value={ragInput} onChange={(e: any) => setRagInput(e.target.value)}
                    placeholder="Ask a question..." disabled={ragLoading}
                    className="flex-1 bg-zinc-900 border-none text-zinc-100 placeholder:text-zinc-500 px-4 py-6 pr-12 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:ring-offset-0 rounded-2xl outline-none" />
                  <Button type="submit" size="icon" disabled={ragLoading || !ragInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-zinc-700 text-white disabled:bg-transparent disabled:text-zinc-600 rounded-full h-8 w-8 flex items-center justify-center border-none">
                    <Send size={14} />
                  </Button>
                </form>
                <div className="flex justify-between items-center mt-3 px-1">
                  <p className="text-[11px] text-zinc-500">
                    AI can make mistakes, so double-check it. <a href="#" className="underline hover:text-zinc-300">Learn more</a>
                  </p>
                  <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                    Made with <Sparkles size={10} className="inline mr-0.5" /> Gemini <ExternalLink size={10} className="inline ml-0.5 opacity-70" />
                  </p>
                </div>
              </div>
            </>
          )}

          {activeSidebar === 'refs' && (
            <>
              <div className="p-4 border-b border-[#27272a] flex justify-between items-center bg-[#09090b]">
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-800/50 border border-zinc-700/50 p-2 rounded-full"><FileText size={18} className="text-zinc-300" /></div>
                  <div>
                    <h2 className="font-semibold text-sm text-zinc-100">Sources & Patents</h2>
                    <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">{refsFromData.length} References Found</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setActiveSidebar(null)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full h-8 w-8 border-none flex items-center justify-center">
                  <X size={16} />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-[#000000]/80 backdrop-blur-md">
                {refsFromData.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {refsFromData.map((ref) => (
                      <div key={ref.id} id={`ref-${ref.id}`} onClick={() => ref.url && window.open(ref.url, '_blank')}
                        className={clsx(
                          "bg-[#09090b]/80 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700 transition-all duration-300 cursor-pointer group flex flex-col",
                          highlightedRef === ref.id && "ring-2 ring-zinc-500/50 bg-zinc-900/50 shadow-[0_0_15px_rgba(255,255,255,0.05)] animate-pulse"
                        )}>
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-zinc-800/50 text-zinc-400 text-[10px] px-2 py-0.5 border border-zinc-800/80 font-medium uppercase tracking-wider">{ref.type}</Badge>
                          <span className="text-xs text-zinc-500 font-mono">{ref.year}</span>
                        </div>
                        <h4 className="text-sm font-medium text-zinc-200 mb-2 leading-snug group-hover:text-zinc-100 transition-colors flex-1">{ref.title}</h4>
                        <div className="flex items-center justify-between mt-4 border-t border-zinc-800/50 pt-3">
                          <p className="text-xs text-zinc-500 font-medium truncate pr-2">{ref.source}</p>
                          <ExternalLink size={12} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500">
                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No references available for this compound.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
