import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Database, ChevronRight, Search, Download, LayoutGrid, List, Activity, X, Play, Gavel, Bot, ShieldAlert, Scale,
  MessageCircle, ExternalLink, Atom, Box, CheckCircle, TrendingUp, Target, Pill, Zap, Clock, Droplets, GitCompare,
  User, Users, Send, Loader2, BookOpen, ArrowLeft, FlaskConical, DollarSign, FileText, Beaker, Fingerprint, Network,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, ChevronDown, Sparkles, AlertTriangle, Share2, Check
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsLineTooltip, LineChart, Line } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { getSimilarityNeighbors, getSubstructureNeighbors, getSuperstructureNeighbors, get3DSimilarityNeighbors, aggregateNeighbors, selectMolecularTwin } from "@/lib/pubchem";
import AnimatedMolecule from '@/components/AnimatedMolecule';
import AnimatedMolecule3D from '@/components/AnimatedMolecule3D';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MolecularTwinReportCard } from '@/components/MolecularTwinReportCard';
import { RepurposingAlternativeFinder } from '@/components/RepurposingAlternativeFinder';
import { SourceBadge } from '@/components/SourceBadge';
import SafetyHeatmap from '@/components/SafetyHeatmap';
import IndicationMatrix from '@/components/IndicationMatrix';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { RiskRadar } from '@/components/RiskRadar';
import { RepurposingVerdict } from '@/components/RepurposingVerdict';
import RegulatoryPathway from '@/components/RegulatoryPathway';
import InvestorOverview from '@/components/InvestorOverview';
import TrialTimeline from '@/components/TrialTimeline';
import { AISynthesisTab } from './AISynthesisPage';
import ReactMarkdown from 'react-markdown';
import { exportResearchPaper } from '@/lib/ResearchPaperExport';
import { ShaderButton } from '@/components/ui/ShaderButton';

type Tab = 'overview' | 'science' | 'market' | 'twin' | 'synthesis';

interface GaugeScoreProps {
  title: string;
  score: number | null;
  max: number;
  subtitle?: string;
}

const GaugeScore = ({ score, max, title, subtitle }: any) => {
  const pct = score != null ? Math.max(0, Math.min(score / max, 1)) : 0;
  const dashArray = 125.6;
  const dashOffset = dashArray - (dashArray * pct);

  const arcColor =
    score === null     ? '#3f3f46'   // zinc-700 — unknown
    : score >= 7.5     ? '#10b981'   // emerald-500
    : score >= 5.0     ? '#f59e0b'   // amber-500
    : '#f43f5e';                     // rose-500

  const textColor =
    score === null     ? 'text-zinc-500'
    : score >= 7.5     ? 'text-emerald-400'
    : score >= 5.0     ? 'text-amber-400'
    : 'text-rose-400';

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 flex flex-col items-center justify-between h-full min-h-[180px]">
      <h3 className="text-zinc-400 text-xs w-full text-left font-medium uppercase tracking-wider">{title}</h3>
      <div className="relative w-full flex-1 flex items-center justify-center mt-3">
        <svg viewBox="0 0 100 60" className="w-[110px] overflow-visible">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={arcColor} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={dashArray} strokeDashoffset={score != null ? dashOffset : dashArray}
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
          <circle cx="50" cy="50" r="2.5" fill="#52525b" />
          {score != null && (
            <line x1="50" y1="50" x2="16" y2="50" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round"
              style={{ transform: `rotate(${pct * 180}deg)`, transformOrigin: '50px 50px', transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
          )}
        </svg>
        <div className="absolute bottom-[-24px] flex flex-col items-center">
          {score != null ? (
            <span className={`text-4xl font-mono font-black tracking-tight mt-2 ${textColor}`}>
              {score.toFixed(1)}<span className="text-lg text-zinc-600 font-medium ml-1">/{max}</span>
            </span>
          ) : (
            <span className="text-sm font-medium text-zinc-600 italic">N/A</span>
          )}
        </div>
      </div>
    </div>
  );
};

const DebateSimulation = ({ onClose, debateData }: { onClose: () => void; debateData?: any }) => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 4000);
    const t3 = setTimeout(() => setPhase(3), 7000);
    const t4 = setTimeout(() => setPhase(4), 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const advocateText = debateData?.advocate || '';
  const skepticText = debateData?.skeptic || '';
  const consensus = debateData?.consensus || { verdict: 'Caution', confidence: 0.5, reasoning: 'Awaiting analysis.', conditions: [] };
  const verdictColor = consensus.verdict === 'Proceed' ? 'text-emerald-400' : consensus.verdict === 'Reject' ? 'text-rose-400' : 'text-amber-400';
  const verdictGlow = consensus.verdict === 'Proceed' ? 'rgba(16, 185, 129, 0.4)' : consensus.verdict === 'Reject' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)';

  // Split advocate/skeptic text into lines for phased reveal
  const advocateLines = advocateText.split(/\n+/).filter((l: string) => l.trim());
  const skepticLines = skepticText.split(/\n+/).filter((l: string) => l.trim());

  return (
    <div className="fixed inset-0 z-[100] bg-[#000000] text-zinc-100 flex flex-col overflow-hidden font-sans">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes speak-ring { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.5); opacity: 0; } }
        @keyframes strike { 0% { transform: rotate(0deg); } 15% { transform: rotate(-30deg); } 25% { transform: rotate(45deg); } 30% { transform: rotate(35deg); } 35% { transform: rotate(45deg); } 100% { transform: rotate(45deg); } }
        @keyframes shockwave { 0% { transform: scale(0.9); opacity: 0; box-shadow: 0 0 0 0 rgba(255,255,255,0); } 25% { transform: scale(1); opacity: 1; box-shadow: 0 0 100px 20px ${verdictGlow}; } 100% { transform: scale(2); opacity: 0; box-shadow: 0 0 200px 50px ${verdictGlow.replace('0.4', '0')}; } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-speak::after { content: ''; position: absolute; inset: -20px; border-radius: 50%; border: 2px solid currentColor; animation: speak-ring 1.5s ease-out infinite; }
        .gavel-strike { transform-origin: 80% 80%; animation: strike 1s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .gavel-rest { transform: rotate(0deg); transform-origin: 80% 80%; }
        .impact-wave { animation: shockwave 2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards; }
      `}</style>
      <header className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-800 bg-[#09090b]">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-500" />
          <h2 className="text-base sm:text-lg font-medium tracking-wide">Multi-Agent Adversarial Debate</h2>
          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded uppercase tracking-widest ml-2 sm:ml-4">{debateData ? 'Real Analysis' : 'Live Debate'}</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><X className="w-5 h-5 text-zinc-400" /></button>
      </header>
      <div className="flex-1 flex flex-col md:flex-row relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#050505] to-[#000000]"></div>
        {/* Advocate */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 border-b md:border-b-0 md:border-r border-zinc-800/50">
          <div className={`relative w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 animate-float ${phase === 1 || phase === 3 ? 'animate-speak' : ''}`}>
            <Bot className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <h3 className="mt-4 sm:mt-8 text-lg font-medium text-blue-400">Advocate Agent</h3>
          <p className="text-zinc-500 text-xs sm:text-sm uppercase tracking-wider mt-1">Optimization: Efficacy</p>
          <div className="mt-4 sm:mt-8 w-full max-w-sm bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 sm:p-5 min-h-[120px] sm:h-56 overflow-y-auto relative">
            <div className="space-y-2.5 text-sm text-zinc-400">
              {phase < 1 && <p className="opacity-40">Initializing efficacy models...</p>}
              {phase >= 1 && advocateLines.length > 0 ? (
                advocateLines.map((line: string, i: number) => (
                  <p key={i} className="text-blue-200 leading-relaxed text-xs sm:text-sm">{line}</p>
                ))
              ) : phase >= 1 ? (
                <>
                  <p className="text-blue-200">Strong clinical evidence supports repurposing potential.</p>
                  <p className="text-blue-200">Multiple phase-active trials indicate regulatory interest.</p>
                </>
              ) : null}
            </div>
          </div>
        </div>
        {/* Consensus */}
        <div className="hidden md:flex w-[400px] flex-col items-center justify-end pb-24 relative z-10">
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
            <div className="w-40 h-12 bg-[#0a0a0a] border-t-2 border-zinc-700 rounded-t-xl absolute bottom-0 shadow-2xl flex items-center justify-center">
              <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(consensus.confidence || 0.5) * 100}%` }}></div>
              </div>
            </div>
          </div>
          {phase >= 4 && (
            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xs">
              <div className={`text-2xl font-medium ${verdictColor}`}>{consensus.verdict || 'Caution'}</div>
              <div className="text-zinc-400 text-sm mt-2">{consensus.reasoning || 'Viability analysis complete.'}</div>
              {consensus.conditions?.length > 0 && (
                <div className="mt-3 space-y-1">
                  {consensus.conditions.map((c: string, i: number) => (
                    <div key={i} className="text-xs text-zinc-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-zinc-600" /> {c}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 text-xs text-zinc-600">Confidence: {((consensus.confidence || 0.5) * 100).toFixed(0)}%</div>
            </div>
          )}
        </div>
        {/* Skeptic */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 border-t md:border-t-0 md:border-l border-zinc-800/50">
          <div className={`relative w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 animate-float ${phase === 2 ? 'animate-speak' : ''}`} style={{ animationDelay: '1s' }}>
            <ShieldAlert className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
          <h3 className="mt-4 sm:mt-8 text-lg font-medium text-rose-400">Skeptic Agent</h3>
          <p className="text-zinc-500 text-xs sm:text-sm uppercase tracking-wider mt-1">Optimization: Safety</p>
          <div className="mt-4 sm:mt-8 w-full max-w-sm bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 sm:p-5 min-h-[120px] sm:h-56 overflow-y-auto relative">
            <div className="space-y-2.5 text-sm text-zinc-400">
              {phase < 2 && <p className="opacity-40">Scanning for off-target effects...</p>}
              {phase >= 2 && skepticLines.length > 0 ? (
                skepticLines.map((line: string, i: number) => (
                  <p key={i} className="text-rose-200 leading-relaxed text-xs sm:text-sm">{line}</p>
                ))
              ) : phase >= 2 ? (
                <>
                  <p className="text-rose-200">Safety concerns require further investigation.</p>
                  <p className="text-rose-200">Patent landscape may limit freedom to operate.</p>
                </>
              ) : null}
            </div>
          </div>
        </div>
        {/* Mobile consensus */}
        {phase >= 4 && (
          <div className="md:hidden flex flex-col items-center py-6 relative z-10 border-t border-zinc-800/50">
            <div className={`text-xl font-medium ${verdictColor}`}>{consensus.verdict || 'Caution'}</div>
            <div className="text-zinc-400 text-xs mt-2 text-center px-6">{consensus.reasoning || 'Analysis complete.'}</div>
            <div className="mt-2 text-xs text-zinc-600">Confidence: {((consensus.confidence || 0.5) * 100).toFixed(0)}%</div>
          </div>
        )}
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
        <Target className="w-5 h-5 text-cyan-400" /> Repurposing Trajectories
      </h3>
    </div>
    {data && data.length > 0 ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data.map((candidate, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-black/40 backdrop-blur-md border border-zinc-800/50 hover:border-zinc-700 transition-all rounded-2xl p-6 group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-lg font-medium text-zinc-100 mb-1 group-hover:text-cyan-400 transition-colors">{candidate.drugName}</h4>
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
                    return <div key={step} className={clsx("flex-1 rounded-full", step <= phaseNum ? "bg-cyan-500" : "bg-zinc-800")} />;
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

const ADMERow = ({ label, value, icon: Icon }: any) => {
  const cleanVal = (value || '').trim();
  const isUnknown = !cleanVal || cleanVal.toLowerCase() === 'unknown' || cleanVal.toLowerCase() === 'none';
  const displayValue = isUnknown ? 'Data not established in current registries.' : cleanVal;
  
  return (
    <div className="flex flex-col md:flex-row gap-5 p-5 bg-zinc-950/40 border border-zinc-800/60 rounded-xl hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-3 md:w-48 shrink-0">
        <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
           <Icon className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="text-sm font-medium text-zinc-200 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm text-zinc-400 leading-relaxed md:border-l border-zinc-800/60 md:pl-6 flex items-center">
        <span className={clsx("line-clamp-3", isUnknown && "italic text-zinc-500")}>{displayValue}</span>
      </div>
    </div>
  );
};

const PharmacologicalProfileSection = ({ data }: { data: PharmacologicalProfileData }) => {
  const hl = (data.halfLife || '').trim();
  const isUnknownHL = !hl || hl.toLowerCase() === 'unknown';

  return (
    <div className="mb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xl font-medium text-zinc-100">Pharmacokinetics (ADME)</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-wide mt-0.5">Metabolic Profile & Half-life</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 space-y-3">
          {data.overview && data.overview.toLowerCase() !== 'unknown' && (
            <p className="text-sm text-zinc-400 leading-relaxed mb-6 px-4 py-3 bg-zinc-900/30 rounded-lg border-l-2 border-cyan-500/50">{data.overview}</p>
          )}
          <ADMERow label="Absorption" value={data.absorption} icon={Droplets} />
          <ADMERow label="Distribution" value={data.distribution} icon={Network} />
          <ADMERow label="Metabolism" value={data.metabolism} icon={Zap} />
          <ADMERow label="Elimination" value={data.elimination} icon={Activity} />
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[220px]">
            <div className="absolute top-0 rotate-180 w-full h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1)_0%,transparent_70%)]"></div>
            <div className="w-12 h-12 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 relative z-10 shadow-lg">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3 relative z-10">Estimated Half-Life</span>
            <span className={clsx("font-light relative z-10", isUnknownHL ? "text-zinc-600 italic text-lg" : "text-zinc-100 text-2xl")}>
              {isUnknownHL ? 'Not established' : data.halfLife}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SafetyToxicityData {
  toxicitySummary: string;
  riskIndicators: string[];
  alerts: string[];
}

const SafetyToxicitySection = ({ data }: { data: SafetyToxicityData }) => {
  const isUnknownStr = (str: string) => !str || str.toLowerCase() === 'unknown' || str.toLowerCase() === 'none' || str.toLowerCase() === 'ld50 unknown' || str === '-';
  const validRisks = (data.riskIndicators || []).filter(r => !isUnknownStr(r));
  const validAlerts = (data.alerts || []).filter(a => !isUnknownStr(a));
  
  const summary = isUnknownStr(data.toxicitySummary) 
    ? "Detailed toxicity and safety profiles for this compound have not been conclusively established or are unavailable in the current datasets." 
    : data.toxicitySummary;

  return (
    <div className="mb-10 animate-in fade-in duration-500">
      <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-rose-500" /> Safety & Toxicity Profile
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50"></div>
          <span className="text-xs text-zinc-500 block mb-3 uppercase tracking-wider font-medium">Risk Summary</span>
          <p className={clsx("text-sm leading-relaxed line-clamp-6", summary.includes('not been conclusively') ? "text-zinc-500 italic" : "text-zinc-400")}>{summary}</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 hover:border-amber-500/30 transition-colors">
            <h4 className="text-sm font-medium text-amber-400 mb-4 flex items-center gap-2"><Activity size={16} /> Risk Indicators</h4>
            {validRisks.length > 0 ? (
              <ul className="space-y-3">
                {validRisks.map((risk, idx) => (
                  <li key={idx} className="text-sm text-zinc-300 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" /><span>{risk}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 italic">No specific risk indicators parsed.</p>
            )}
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 hover:border-rose-500/30 transition-colors">
            <h4 className="text-sm font-medium text-rose-400 mb-4 flex items-center gap-2"><ShieldAlert size={16} /> Critical Alerts</h4>
            {validAlerts.length > 0 ? (
              <ul className="space-y-3">
                {validAlerts.map((alert, idx) => (
                  <li key={idx} className="text-sm text-zinc-300 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-1.5 shrink-0" /><span>{alert}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 italic">No critical alerts found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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
          <Bot className="w-5 h-5 text-cyan-400" /> Executive Synthesis
        </h3>
        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium px-3 py-1 rounded-full">{data.systemStatus}</Badge>
      </div>
      <p className="text-zinc-400 text-sm leading-relaxed mb-2">{displayText}</p>
      {isLong && (
        <button onClick={() => setExpanded(e => !e)}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors mb-4 flex items-center gap-1">
          {expanded ? 'Show less' : 'Read full analysis'}
          <ChevronDown size={12} className={clsx('transition-transform', expanded && 'rotate-180')} />
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-5">
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
      <GitCompare className="w-5 h-5 text-cyan-400" /> Structural Analogs
    </h3>
    {data && data.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.map((item, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-base font-medium text-zinc-100">{item.moleculeName}</h4>
                <p className="text-xs text-zinc-500 mt-1">{item.mechanismMatch} Match</p>
              </div>
              <div className="bg-[#09090b] border border-[#27272a] px-2 py-1 rounded-md text-xs font-mono text-cyan-400">
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
      <Activity className="w-5 h-5 text-cyan-400" /> Clinical Pipeline
      <SourceBadge api="ClinicalTrials.gov v2" endpoint="/api/v2/studies?query.term={molecule}&pageSize=50" url="https://clinicaltrials.gov" confidence="High" note="Real-time data from US National Library of Medicine clinical trial registry" />
    </h3>
    <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6">
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-zinc-200 truncate">{item.drugName}</h4>
                <p className="text-xs text-zinc-400 uppercase tracking-wide mt-1">{item.phase}</p>
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
      <BookOpen className="w-5 h-5 text-cyan-400" /> Literature & Evidence
      <SourceBadge api="PubMed / NCBI E-utilities" endpoint="/entrez/eutils/esearch.fcgi?db=pubmed&term={molecule}" url="https://pubmed.ncbi.nlm.nih.gov" confidence="High" note="PubMed citations retrieved via NCBI E-utilities API" />
    </h3>
    {data && data.length > 0 ? (
      <div className="columns-1 md:columns-2 gap-6 space-y-6">
        {data.map((paper, idx) => (
          <div key={idx} className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700 transition-colors break-inside-avoid cursor-pointer"
            onClick={() => setActiveSidebar && setActiveSidebar('refs')}>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-medium text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">{paper.source}</span>
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

const HeroAlternativeMolecule = ({ cid }: { cid: number }) => {
  const [twin, setTwin] = useState<any>(null);

  useEffect(() => {
    async function fetchTwin() {
      try {
        const [sim2d, sub, superstruct, sim3d] = await Promise.all([
          getSimilarityNeighbors(cid),
          getSubstructureNeighbors(cid),
          getSuperstructureNeighbors(cid),
          get3DSimilarityNeighbors(cid)
        ]);
        const combined = aggregateNeighbors(sim2d, sub, superstruct, sim3d);
        const bestTwin = selectMolecularTwin(combined, cid);
        setTwin(bestTwin);
      } catch (e) {}
    }
    fetchTwin();
  }, [cid]);

  if (!twin) return <p className="text-sm text-zinc-600 italic">Locating structural twin...</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xl font-medium text-zinc-100">
          {twin.twinLabel}
        </p>
        <Badge variant="default" className="text-[10px] uppercase tracking-wide bg-emerald-800/40 text-emerald-200 border-emerald-700/50">
          Twin
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium">CID:</span>
        <span className="text-sm text-emerald-300 font-semibold">{twin.cid}</span>
      </div>

      <p className="text-sm text-zinc-400 leading-relaxed">
         {twin.rationale || 'Identified as top 3D-similar candidate with shared core.'}
      </p>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {twin.relationTypes.includes("similarity3d") && (
          <Badge variant="outline" className="text-[10px] border-emerald-800/60 text-emerald-400 bg-emerald-950/30">3D Similar</Badge>
        )}
        {twin.relationTypes.includes("similarity") && (
          <Badge variant="outline" className="text-[10px] border-emerald-800/60 text-emerald-400 bg-emerald-950/30">2D Similar</Badge>
        )}
        {twin.relationTypes.includes("substructure") && (
          <Badge variant="outline" className="text-[10px] border-emerald-800/60 text-emerald-400 bg-emerald-950/30">Shared Core</Badge>
        )}
      </div>
    </div>
  );
};

const OverviewTab = ({ report, onStartSimulation, structureMode, setStructureMode, setActiveSidebar, useColor }: any) => {
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

  const phoenixScore: number | null = report.phoenix_score != null ? Number(report.phoenix_score) : null;
  const viabilityScore: number | null = report.viability_score != null ? Number(report.viability_score) : null;

  return (
    <div className="animate-in fade-in duration-500 w-full mx-auto">
      {(report.ai_analysis?.confidence != null && Number(report.ai_analysis.confidence) < 0.6) && (
        <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          ⚠ Score based on partial data — some APIs unavailable
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="col-span-1 lg:col-span-8 bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

          {/* Header Section */}
          <div className="relative z-10 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2 tracking-tight">{report.molecule}</h1>
                <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Compound Overview
                </p>
              </div>
              {report.pubchem_data?.cid && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                  <span className="text-xs text-zinc-400 font-medium">CID:</span>
                  <span className="text-sm text-zinc-100 font-semibold">{report.pubchem_data.cid}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
            {/* Left Column - Key Metrics */}
            <div className="space-y-4">
              {/* Market Size Only */}
              <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Market Size</p>
                </div>
                <p className="text-xl font-bold text-zinc-100">
                  {totalMarket > 0 ? `₹${(totalMarket * 83.5).toFixed(1)}B` : <span className="text-zinc-600 text-sm">N/A</span>}
                </p>
              </div>

              {/* Compound Properties */}
              <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Beaker className="w-3.5 h-3.5 text-zinc-400" />
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Molecular Properties</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {report.pubchem_data?.molecular_weight && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Mol. Weight</p>
                      <p className="text-sm font-semibold text-zinc-200">{Number(report.pubchem_data.molecular_weight).toFixed(2)} g/mol</p>
                    </div>
                  )}
                  {report.pubchem_data?.xlogp != null && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">LogP</p>
                      <p className="text-sm font-semibold text-zinc-200">{report.pubchem_data.xlogp}</p>
                    </div>
                  )}
                  {report.pubchem_data?.hbd != null && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">H-Donors</p>
                      <p className="text-sm font-semibold text-zinc-200">{report.pubchem_data.hbd}</p>
                    </div>
                  )}
                  {report.pubchem_data?.hba != null && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">H-Acceptors</p>
                      <p className="text-sm font-semibold text-zinc-200">{report.pubchem_data.hba}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Opportunity */}
              {((report.repurposing_candidates || []).length > 0) && (
                <div className="bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 border border-cyan-800/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">Top Opportunity</p>
                  </div>
                  <p className="text-base font-semibold text-zinc-100 mb-2">
                    {(report.repurposing_candidates || [])[0].condition}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border border-cyan-500/30">
                      {(report.repurposing_candidates || [])[0].max_phase}
                    </span>
                    {((report.repurposing_candidates || [])[0].market_size_usd_billion || 0) > 0 && (
                      <span className="text-zinc-400 text-xs">${((report.repurposing_candidates || [])[0].market_size_usd_billion || 0).toFixed(1)}B Market</span>
                    )}
                  </div>
                </div>
              )}

              {/* Clinical Trials Summary */}
              {(report.clinical_data && report.clinical_data.length > 0) && (
                <div className="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 border border-emerald-800/40 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Clinical Evidence</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Total Trials</span>
                      <span className="text-lg font-bold text-zinc-100">{report.clinical_data.length}</span>
                    </div>
                    {report.clinical_data.slice(0, 2).map((trial: any, idx: number) => (
                      <div key={idx} className="pt-2 border-t border-emerald-800/30">
                        <p className="text-xs text-zinc-300 font-medium mb-1">{trial.condition || 'Unknown Condition'}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] border-emerald-700/50 text-emerald-300 bg-emerald-950/30">
                            {trial.phase || 'N/A'}
                          </Badge>
                          <span className="text-[10px] text-zinc-500">{trial.status || 'Status unknown'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Structure Visualization */}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">3D Structure</span>
                <div className="flex items-center bg-[#18181b] border border-[#27272a] rounded-lg p-0.5 gap-0.5">
                  <Button size="sm" variant={structureMode === '2d' ? 'secondary' : 'ghost'}
                    className={clsx("h-6 px-2.5 text-xs gap-1", structureMode === '2d' ? "bg-zinc-800 text-zinc-100" : "")} onClick={() => setStructureMode('2d')}>
                    <Atom size={11} /> 2D
                  </Button>
                  {report.pubchem_data?.cid && (
                    <Button size="sm" variant={structureMode === '3d' ? 'secondary' : 'ghost'}
                      className={clsx("h-6 px-2.5 text-xs gap-1", structureMode === '3d' ? "bg-zinc-800 text-zinc-100" : "")} onClick={() => setStructureMode('3d')}>
                      <Box size={11} /> 3D
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-black border border-[#27272a] rounded-xl flex items-center justify-center relative shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_70%)]"></div>
                <div className="w-full h-full relative z-10 flex items-center justify-center p-8">
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
                          <AnimatedMolecule3D cid={report.pubchem_data.cid} height={300} />
                        ) : (
                          <span className="text-zinc-600 text-sm">3D Not Available</span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Enhanced Quick Stats & Additional Info */}
              <div className="mt-3 space-y-3">
                {/* Stats Row */}
                {report.pubchem_data && (
                  <div className="grid grid-cols-3 gap-2">
                    {report.pubchem_data.rotatable_bonds != null && (
                      <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2 text-center hover:border-zinc-700 transition-colors">
                        <p className="text-lg font-bold text-zinc-100">{report.pubchem_data.rotatable_bonds}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Rotatable</p>
                      </div>
                    )}
                    {report.pubchem_data.complexity != null && (
                      <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2 text-center hover:border-zinc-700 transition-colors">
                        <p className="text-lg font-bold text-zinc-100">{Math.round(Number(report.pubchem_data.complexity))}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Complexity</p>
                      </div>
                    )}
                    <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2 text-center hover:border-emerald-700/50 transition-colors">
                      <p className="text-lg font-bold text-emerald-400">{(report.clinical_data || []).length}</p>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Trials</p>
                    </div>
                  </div>
                )}

                {/* Drug Classes or Formula */}
                {(report.pubchem_data?.drug_classes && report.pubchem_data.drug_classes.length > 0) ? (
                  <div className="bg-gradient-to-br from-cyan-950/30 to-cyan-900/10 border border-cyan-800/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-3 h-3 text-cyan-400" />
                      <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">Drug Classes</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {report.pubchem_data.drug_classes.slice(0, 3).map((drugClass: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded">
                          {drugClass}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : report.pubchem_data?.molecular_formula ? (
                  <div className="bg-gradient-to-br from-blue-950/30 to-blue-900/10 border border-blue-800/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Atom className="w-3 h-3 text-blue-400" />
                        <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">Formula</p>
                      </div>
                      <p className="text-sm font-mono text-zinc-200">{report.pubchem_data.molecular_formula}</p>
                    </div>
                  </div>
                ) : null}

                {/* Development Status if available */}
                {(report.regulatory_data?.status || (report.repurposing_candidates || []).length > 0) && (
                  <div className="bg-gradient-to-br from-amber-950/30 to-amber-900/10 border border-amber-800/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3 h-3 text-amber-400" />
                      <p className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Development Status</p>
                    </div>
                    <p className="text-xs text-zinc-300">
                      {report.regulatory_data?.status || `${(report.repurposing_candidates || []).length} repurposing opportunit${(report.repurposing_candidates || []).length === 1 ? 'y' : 'ies'} identified`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 flex-none">
            <GaugeScore title="Viability Score" score={viabilityScore} max={10} />
            <GaugeScore title="Phoenix Score" score={phoenixScore} max={10} />
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 flex-1">
            <h3 className="text-zinc-200 text-sm font-semibold mb-3">Quick Synthesis</h3>
            <p className="text-sm text-zinc-400 mb-2 leading-relaxed">
              {displayReasoning}
              <span onClick={() => setActiveSidebar('refs')}
                className="inline-flex items-center justify-center ml-1 px-1.5 h-4 text-[9px] font-bold bg-cyan-500/20 text-cyan-400 rounded cursor-pointer hover:bg-cyan-500/40 transition-colors">
                1, 2
              </span>
            </p>
            {isLong && (
              <button onClick={() => setSynthExpanded(e => !e)}
                className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors mb-3 flex items-center gap-1">
                {synthExpanded ? 'Show less' : 'Read full synthesis'}
                <ChevronDown size={12} className={clsx('transition-transform', synthExpanded && 'rotate-180')} />
              </button>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {synthesisTags.map((tag: any, i: number) => (
                <span key={i} className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                  i === 0 ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-transparent border-zinc-800/60 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700'
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

      {/* Agent Attribution Chain */}
      {report.agent_attributions?.length > 0 && (
        <div className="mt-8 border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Agent Attribution Chain
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.agent_attributions.map((attr: any, i: number) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-indigo-400">{attr.agent}</span>
                  <span className="text-xs text-zinc-500">{attr.evidence_count} evidence points</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{attr.insight}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={clsx("h-full rounded-full transition-all duration-500", useColor ? '' : 'bg-zinc-500')}
                      style={{
                        width: `${(attr.confidence || 0) * 100}%`,
                        ...(useColor ? { backgroundColor: (attr.confidence || 0) >= 0.7 ? '#4ade80' : (attr.confidence || 0) >= 0.4 ? '#fbbf24' : '#f87171' } : {}),
                      }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">{((attr.confidence || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Domain Reasoning */}
      {report.cross_domain_reasoning?.length > 0 && (
        <div className="mt-8 border border-zinc-800 rounded-xl bg-zinc-900/50 p-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Cross-Domain Reasoning
          </h3>
          <div className="space-y-4">
            {report.cross_domain_reasoning.map((reasoning: any, i: number) => (
              <div key={i} className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50">
                <div className="flex items-center gap-2 mb-2">
                  {reasoning.domains?.map((d: string, j: number) => (
                    <span key={j} className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {d}
                    </span>
                  ))}
                  <span className="ml-auto text-xs text-zinc-500">{((reasoning.confidence || 0) * 100).toFixed(0)}% confidence</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{reasoning.insight}</p>
                {reasoning.supporting_evidence?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {reasoning.supporting_evidence.map((e: string, k: number) => (
                      <span key={k} className="text-xs px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400">{e}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory Pathway Recommender */}
      <div className="mt-8">
        <RegulatoryPathway
          molecule={report.molecule}
          clinicalData={report.clinical_data}
          regulatoryData={report.regulatory_data}
          repurposingCandidates={report.repurposing_candidates}
          phoenixScore={phoenixScore}
          targetData={report.target_data}
          useColor={useColor}
        />
      </div>

      {/* Risk-Benefit Radar */}
      <div className="mt-8">
        <RiskRadar
          drugName={report.molecule}
          clinicalScore={report.phoenix_breakdown?.clinical ?? (phoenixScore ? phoenixScore * 0.7 : 4)}
          safetyScore={report.pubchem_data?.ld50 ? Math.min(10, 10 - (report.pubchem_data.ld50 > 500 ? 2 : 5)) : 6}
          marketScore={report.phoenix_breakdown?.market ?? (phoenixScore ? phoenixScore * 0.3 : 3)}
          ipScore={(report.patent_data || []).length === 0 ? 8 : Math.max(2, 10 - (report.patent_data || []).length)}
          evidenceScore={Math.min(10, (report.literature_data || []).length * 0.5 + (report.clinical_data || []).length * 0.3)}
          noveltyScore={report.pubchem_data?.mechanism_of_action ? 7 : 5}
          useColor={useColor}
        />
      </div>

      {/* Interactive Knowledge Graph */}
      <div className="mt-8">
        <KnowledgeGraph
          drugName={report.molecule}
          data={{
            targets: (Array.isArray(report.target_data?.targets) ? report.target_data.targets : Array.isArray(report.target_data) ? report.target_data : []).slice(0, 8).map((t: any) => ({
              name: t.target || t.name || t.disease || t.approvedSymbol || 'Unknown',
              score: t.score ?? t.associationScore ?? Math.random() * 0.8 + 0.2,
            })),
            diseases: (Array.isArray(report.target_data?.diseases) ? report.target_data.diseases : []).slice(0, 6).map((d: any) => ({
              name: d.name || d.disease || 'Unknown',
              score: d.score ?? 0.5,
            })).concat(
              (Array.isArray(report.repurposing_candidates) ? report.repurposing_candidates : []).slice(0, 10).map((c: any) => ({
                name: c.condition || 'Unknown',
                score: c.repurposing_score ? Number(c.repurposing_score) / 10 : 0.5,
                phase: c.max_phase,
              }))
            ),
            pathways: Array.isArray(report.target_data?.mechanisms)
              ? report.target_data.mechanisms.map((m: any) => m.description || m).filter(Boolean)
              : (report.pubchem_data?.pharmacological_classes
                || report.pubchem_data?.drug_classes
                || (report.pubchem_data?.mechanism_of_action ? [report.pubchem_data.mechanism_of_action] : [])),
            trials: (Array.isArray(report.clinical_data) ? report.clinical_data : []).slice(0, 6).map((t: any) => ({
              id: t.nct_id || t.nctId || `Trial-${Math.random().toString(36).slice(2, 7)}`,
              phase: t.phase,
            })),
          }}
        />
      </div>

      {/* Repurposing Verdict */}
      <div className="">
      <RepurposingVerdict
        molecule={report.molecule}
        clinicalData={Array.isArray(report.clinical_data) ? report.clinical_data : []}
        literatureData={Array.isArray(report.literature_data) ? report.literature_data : []}
        regulatoryData={report.regulatory_data}
        pubchemData={report.pubchem_data}
        patentData={Array.isArray(report.patent_data) ? report.patent_data : []}
        phoenixScore={phoenixScore ?? undefined}
        repurposingCandidates={Array.isArray(report.repurposing_candidates) ? report.repurposing_candidates : []}
        useColor={useColor}
      />
      </div>
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
        <FileText className="w-5 h-5 text-cyan-400" /> Patents & Source Literature
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Registered Patents</h4>
          <div className="space-y-3">
            {(report.patent_data || []).length > 0 ? (report.patent_data || []).map((p: any) => (
              <a key={p.id} href={p.url || '#'} target="_blank" rel="noreferrer"
                className="block p-4 border border-zinc-800/80 rounded-xl hover:border-zinc-600 bg-zinc-950 transition-all text-left">
                <div className="text-cyan-400 text-xs mb-1 font-mono">{p.id}</div>
                <div className="text-zinc-200 text-sm">{p.title}</div>
              </a>
            )) : (
              <div className="p-4 border border-zinc-800/80 rounded-xl bg-zinc-950 text-center">
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
              <div key={idx} className="block p-4 border border-zinc-800/80 rounded-xl bg-zinc-950 text-left">
                <div className="text-emerald-400 text-xs mb-1 font-medium">{l.journal || 'PubMed'} · {l.year}</div>
                <div className="text-zinc-200 text-sm leading-relaxed">{l.title}</div>
              </div>
            )) : (
              <div className="p-4 border border-zinc-800/80 rounded-xl bg-zinc-950 text-center">
                <p className="text-zinc-500 text-sm">No prominent literature found in PubMed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ScienceTab = ({ report, setActiveSidebar, useColor }: any) => {
  const pd = report.pubchem_data || {};
  const td = report.target_data || {};
  const faersReactions = report.regulatory_data?.faers_reactions || [];
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

      {/* Open Targets — Real Biological Targets & Disease Associations */}
      {(td.targets?.length > 0 || td.mechanisms?.length > 0) && (
        <div className="mb-10">
          <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" /> Biological Targets & Disease Associations
            <SourceBadge api="Open Targets" endpoint="api.platform.opentargets.org/api/v4/graphql" url="https://platform.opentargets.org" confidence="High" note={`Drug: ${td.chemblId || 'Unknown'} — ${td.targetsFound || 0} targets, ${td.diseasesFound || 0} diseases`} />
          </h3>

          {/* Mechanisms of Action */}
          {td.mechanisms?.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Mechanisms of Action</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {td.mechanisms.map((m: any, i: number) => (
                  <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:bg-zinc-900/60 transition-colors">
                    <div className="text-sm text-zinc-200 font-medium mb-1">{m.description}</div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      {m.targetSymbol && <Badge variant="outline" className="text-[10px] border-cyan-800/50 text-cyan-400 bg-cyan-500/5">{m.targetSymbol}</Badge>}
                      {m.actionType && <span>{m.actionType}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Linked Targets */}
            {td.targets?.length > 0 && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" /> Linked Targets ({td.targetsFound || td.targets.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {td.targets.slice(0, 10).map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/30 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">{t.symbol}</span>
                        <span className="text-sm text-zinc-300 truncate max-w-[200px]">{t.name}</span>
                      </div>
                      <a href={`https://platform.opentargets.org/target/${t.id}`} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-400 transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Diseases */}
            {td.diseases?.length > 0 && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-400" /> Linked Diseases ({td.diseasesFound || td.diseases.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {td.diseases.slice(0, 15).map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-zinc-800/30 last:border-0">
                      <span className="text-sm text-zinc-300 truncate max-w-[240px]">{d.name}</span>
                      <a href={`https://platform.opentargets.org/disease/${d.id}`} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-cyan-400 transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {td.hasBeenWithdrawn && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-rose-300">Withdrawn Drug</span>
                {td.withdrawnNotice && (
                  <p className="text-xs text-rose-400/70 mt-1">
                    Year: {td.withdrawnNotice.year} — {td.withdrawnNotice.reasons?.map((r: any) => r.reason).join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <SafetyToxicitySection data={{
        toxicitySummary: pd.tox_summary || report.regulatory_data?.warnings || 'No explicit toxicity data available.',
        riskIndicators: [pd.ld50_text || 'LD50 unknown'],
        alerts: report.regulatory_data?.warnings ? [report.regulatory_data.warnings] : ['No specific boxed warnings recorded']
      }} />

      {/* FAERS Safety Heatmap */}
      {faersReactions.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Real-World Safety Signal — FAERS
            <SourceBadge api="openFDA" endpoint="api.fda.gov/drug/event.json?count=patient.reaction" url="https://open.fda.gov" confidence="High" note="FDA Adverse Event Reporting System (FAERS) real-time data" />
          </h3>
          <SafetyHeatmap reactions={faersReactions} />
        </div>
      )}
      {/* Indication Matrix — Clinical Trial Landscape */}
      {(report.clinical_data || []).length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> Clinical Trial Landscape
            <SourceBadge api="ClinicalTrials.gov" endpoint="clinicaltrials.gov/api/v2/studies" url="https://clinicaltrials.gov" confidence="High" note="Bubble size = trial count, color = phase advancement" />
          </h3>
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 overflow-hidden">
            <IndicationMatrix clinicalData={report.clinical_data} useColor={useColor} />
          </div>
        </div>
      )}

      {/* Clinical Trial Timeline — Gantt-style visualization */}
      {(report.clinical_data || []).length > 0 && (
        <div className="mb-10">
          <TrialTimeline trials={report.clinical_data} drugName={report.molecule || 'Compound'} />
        </div>
      )}

      <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2 mt-10">
        <Atom className="w-5 h-5 text-cyan-400" /> Physicochemical Descriptors
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
          <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 flex flex-col justify-between hover:bg-zinc-900/60 transition-colors">
            <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">{prop.label}</span>
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
      <LineChart className="w-5 h-5 text-cyan-400" /> Commercial Opportunities
      <SourceBadge api="LLM Market Estimate" endpoint="api.groq.com/openai/v1/chat/completions" confidence="Estimated" note="Market size estimates generated from published therapeutic area reports. Not investment advice." />
    </h3>
    <MarketOpportunityList data={(report.market_analysis || []).map((item: any) => ({
      drugName: item.condition,
      marketScore: Number(item.market_size_usd_billion) || 0,
      growthIndicator: `+${Number(item.growth_rate_pct || 0).toFixed(1)}%`
    }))} />
    <div className="flex items-center justify-between mb-6 mt-10">
      <h3 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" /> Market Penetration
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
                <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-800/80">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400"
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

/* ─── Purpose-built comparison view ─── */
const CompareView = ({ reportA, reportB, formatMarketSize }: { reportA: any; reportB: any; formatMarketSize: (v: number) => string }) => {
  const scoreA = reportA.phoenix_score != null ? Number(reportA.phoenix_score) : null;
  const scoreB = reportB.phoenix_score != null ? Number(reportB.phoenix_score) : null;
  const viabA = reportA.viability_score != null ? Number(reportA.viability_score) : null;
  const viabB = reportB.viability_score != null ? Number(reportB.viability_score) : null;
  const pdA = reportA.pubchem_data || {};
  const pdB = reportB.pubchem_data || {};

  const winner = (a: number | null, b: number | null) =>
    a != null && b != null ? (a > b ? 'A' : b > a ? 'B' : 'tie') : null;

  const phoenixWinner = winner(scoreA, scoreB);
  const viabWinner = winner(viabA, viabB);

  const totalMarketA = (reportA.market_analysis || []).reduce((s: number, i: any) => s + (Number(i.market_size_usd_billion) || 0), 0);
  const totalMarketB = (reportB.market_analysis || []).reduce((s: number, i: any) => s + (Number(i.market_size_usd_billion) || 0), 0);

  const propRows = [
    { label: 'Mol. Weight', a: pdA.molecular_weight ? Number(pdA.molecular_weight).toFixed(2) : '—', b: pdB.molecular_weight ? Number(pdB.molecular_weight).toFixed(2) : '—', unit: 'g/mol' },
    { label: 'LogP', a: pdA.xlogp ?? '—', b: pdB.xlogp ?? '—', unit: '' },
    { label: 'H-Donors', a: pdA.hbd ?? '—', b: pdB.hbd ?? '—', unit: '' },
    { label: 'H-Acceptors', a: pdA.hba ?? '—', b: pdB.hba ?? '—', unit: '' },
    { label: 'Rotatable Bonds', a: pdA.rotatable_bonds ?? '—', b: pdB.rotatable_bonds ?? '—', unit: '' },
    { label: 'Complexity', a: pdA.complexity != null ? Math.round(Number(pdA.complexity)) : '—', b: pdB.complexity != null ? Math.round(Number(pdB.complexity)) : '—', unit: '' },
    { label: 'Formula', a: pdA.molecular_formula || '—', b: pdB.molecular_formula || '—', unit: '' },
  ];

  const ro5 = (pd: any) => {
    if (pd.molecular_weight == null || pd.xlogp == null || pd.hbd == null || pd.hba == null) return null;
    return parseFloat(pd.molecular_weight) <= 500 && parseFloat(String(pd.xlogp)) <= 5 && pd.hbd <= 5 && pd.hba <= 10;
  };
  const ro5A = ro5(pdA);
  const ro5B = ro5(pdB);

  // Merge all unique repurposing conditions
  const candsA = reportA.repurposing_candidates || [];
  const candsB = reportB.repurposing_candidates || [];
  const allConditions = Array.from(new Set([...candsA.map((c: any) => c.condition), ...candsB.map((c: any) => c.condition)]));

  // Merge clinical trial conditions
  const trialsA = reportA.clinical_data || [];
  const trialsB = reportB.clinical_data || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Hero comparison header ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        {/* Molecule A card */}
        <div className={clsx("bg-zinc-900/60 border rounded-2xl p-6 relative overflow-hidden", phoenixWinner === 'A' ? 'border-emerald-500/40' : 'border-zinc-800/60')}>
          {phoenixWinner === 'A' && <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30">Higher Score</div>}
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Molecule A</p>
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">{reportA.molecule}</h2>
          {pdA.cid && <p className="text-xs text-zinc-500 font-mono mb-4">CID: {pdA.cid}</p>}
          <div className="flex items-center gap-6 mt-2">
            <div className="flex-1"><GaugeScore title="Phoenix" score={scoreA} max={10} /></div>
            <div className="flex-1"><GaugeScore title="Viability" score={viabA} max={10} /></div>
          </div>
          {pdA.drug_classes?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {pdA.drug_classes.slice(0, 3).map((dc: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded">{dc}</span>
              ))}
            </div>
          )}
        </div>

        {/* VS divider */}
        <div className="flex items-center justify-center">
          <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-full w-14 h-14 flex items-center justify-center">
            <GitCompare className="w-6 h-6 text-cyan-400" />
          </div>
        </div>

        {/* Molecule B card */}
        <div className={clsx("bg-zinc-900/60 border rounded-2xl p-6 relative overflow-hidden", phoenixWinner === 'B' ? 'border-emerald-500/40' : 'border-zinc-800/60')}>
          {phoenixWinner === 'B' && <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/30">Higher Score</div>}
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-semibold">Molecule B</p>
          <h2 className="text-2xl font-bold text-zinc-100 mb-1">{reportB.molecule}</h2>
          {pdB.cid && <p className="text-xs text-zinc-500 font-mono mb-4">CID: {pdB.cid}</p>}
          <div className="flex items-center gap-6 mt-2">
            <div className="flex-1"><GaugeScore title="Phoenix" score={scoreB} max={10} /></div>
            <div className="flex-1"><GaugeScore title="Viability" score={viabB} max={10} /></div>
          </div>
          {pdB.drug_classes?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {pdB.drug_classes.slice(0, 3).map((dc: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded">{dc}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Structure comparison ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[reportA, reportB].map((r, idx) => (
          <div key={idx} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center justify-between">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">{r.molecule} — 2D Structure</span>
              {(r.pubchem_data?.cid) && <span className="text-[10px] text-zinc-600 font-mono">CID {r.pubchem_data.cid}</span>}
            </div>
            <div className="h-52 flex items-center justify-center bg-black/40 p-6">
              <div className="w-full h-full flex justify-center items-center invert invert-[.8]">
                <AnimatedMolecule molecule={r.molecule || "O=C(C)Oc1ccccc1C(=O)O"} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Molecular Properties Comparison Table ── */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center gap-2">
          <Beaker className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Physicochemical Properties</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">Property</th>
                <th className="text-center px-6 py-3 text-xs text-cyan-400 uppercase tracking-wider font-semibold">{reportA.molecule}</th>
                <th className="text-center px-6 py-3 text-xs text-cyan-400 uppercase tracking-wider font-semibold">{reportB.molecule}</th>
              </tr>
            </thead>
            <tbody>
              {propRows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-3 text-zinc-400 font-medium">{row.label}</td>
                  <td className="px-6 py-3 text-center text-zinc-200 font-mono">{row.a}{row.unit && row.a !== '—' ? <span className="text-zinc-600 text-xs ml-1">{row.unit}</span> : ''}</td>
                  <td className="px-6 py-3 text-center text-zinc-200 font-mono">{row.b}{row.unit && row.b !== '—' ? <span className="text-zinc-600 text-xs ml-1">{row.unit}</span> : ''}</td>
                </tr>
              ))}
              <tr className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                <td className="px-6 py-3 text-zinc-400 font-medium">Rule of 5</td>
                <td className="px-6 py-3 text-center">
                  {ro5A === null ? <span className="text-zinc-600">—</span> : ro5A ? <span className="text-emerald-400 font-semibold">Pass</span> : <span className="text-rose-400 font-semibold">Fail</span>}
                </td>
                <td className="px-6 py-3 text-center">
                  {ro5B === null ? <span className="text-zinc-600">—</span> : ro5B ? <span className="text-emerald-400 font-semibold">Pass</span> : <span className="text-rose-400 font-semibold">Fail</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Repurposing Opportunities Comparison ── */}
      {allConditions.length > 0 && (
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Repurposing Opportunities</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  <th className="text-left px-6 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium">Indication</th>
                  <th className="text-center px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium" colSpan={2}>{reportA.molecule}</th>
                  <th className="text-center px-4 py-3 text-xs text-zinc-500 uppercase tracking-wider font-medium" colSpan={2}>{reportB.molecule}</th>
                </tr>
                <tr className="border-b border-zinc-800/40">
                  <th></th>
                  <th className="text-center px-2 py-1.5 text-[10px] text-zinc-600 uppercase">Score</th>
                  <th className="text-center px-2 py-1.5 text-[10px] text-zinc-600 uppercase">Phase</th>
                  <th className="text-center px-2 py-1.5 text-[10px] text-zinc-600 uppercase">Score</th>
                  <th className="text-center px-2 py-1.5 text-[10px] text-zinc-600 uppercase">Phase</th>
                </tr>
              </thead>
              <tbody>
                {allConditions.map((cond, i) => {
                  const cA = candsA.find((c: any) => c.condition === cond);
                  const cB = candsB.find((c: any) => c.condition === cond);
                  return (
                    <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-3 text-zinc-300 font-medium max-w-[200px] truncate">{cond as string}</td>
                      <td className="px-2 py-3 text-center font-mono text-sm">{cA ? <span className="text-cyan-400">{Number(cA.repurposing_score).toFixed(1)}</span> : <span className="text-zinc-700">—</span>}</td>
                      <td className="px-2 py-3 text-center">{cA ? <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-300">{cA.max_phase}</Badge> : <span className="text-zinc-700">—</span>}</td>
                      <td className="px-2 py-3 text-center font-mono text-sm">{cB ? <span className="text-cyan-400">{Number(cB.repurposing_score).toFixed(1)}</span> : <span className="text-zinc-700">—</span>}</td>
                      <td className="px-2 py-3 text-center">{cB ? <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-300">{cB.max_phase}</Badge> : <span className="text-zinc-700">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── AI Analysis Comparison — Opportunities & Risks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunities */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Top Opportunities</h3>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {[reportA, reportB].map((r, idx) => (
              <div key={idx} className="p-5">
                <p className="text-xs text-cyan-400 uppercase tracking-wider font-semibold mb-3">{r.molecule}</p>
                <ul className="space-y-2">
                  {(r.ai_analysis?.top_opportunities || []).length > 0
                    ? (r.ai_analysis.top_opportunities || []).slice(0, 3).map((opp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{opp}</span>
                      </li>
                    ))
                    : <li className="text-sm text-zinc-600 italic">No opportunities listed.</li>
                  }
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Key Risks</h3>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {[reportA, reportB].map((r, idx) => (
              <div key={idx} className="p-5">
                <p className="text-xs text-cyan-400 uppercase tracking-wider font-semibold mb-3">{r.molecule}</p>
                <ul className="space-y-2">
                  {(r.ai_analysis?.top_risks || []).length > 0
                    ? (r.ai_analysis.top_risks || []).slice(0, 3).map((risk: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                        <span>{risk}</span>
                      </li>
                    ))
                    : <li className="text-sm text-zinc-600 italic">No risks listed.</li>
                  }
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Verdict ── */}
      {phoenixWinner && phoenixWinner !== 'tie' && (
        <div className="bg-gradient-to-br from-emerald-950/30 to-cyan-950/30 border border-emerald-800/40 rounded-2xl p-6 text-center">
          <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-zinc-100 mb-1">AI Recommendation</h3>
          <p className="text-sm text-zinc-400">
            Based on Phoenix Score analysis, <span className="text-emerald-400 font-semibold">{phoenixWinner === 'A' ? reportA.molecule : reportB.molecule}</span> shows
            stronger repurposing potential with a score of <span className="text-emerald-400 font-semibold">{(phoenixWinner === 'A' ? scoreA : scoreB)?.toFixed(1)}/10</span> vs{' '}
            <span className="text-zinc-300">{(phoenixWinner === 'A' ? scoreB : scoreA)?.toFixed(1)}/10</span>.
          </p>
        </div>
      )}
    </div>
  );
};

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compareId = searchParams.get('compare');
  const [report, setReport] = useState<any>(null);
  const [compareReport, setCompareReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileTabOpen, setMobileTabOpen] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'loading' | 'copied'>('idle');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('INR');
  const [structureMode, setStructureMode] = useState<'2d' | '3d'>('2d');
  const [compareMolecule, setCompareMolecule] = useState<'A' | 'B'>('A');
  const [twinVisited, setTwinVisited] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<'ai' | 'refs' | null>(null);
  const [viewMode, setViewMode] = useState<'scientist' | 'investor'>('scientist');
  const [useColor, setUseColor] = useState(true);

  // Ctrl+Shift+K toggles neutral/colored progress bars
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        setUseColor(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Track when twin tab is first visited so we can lazy-mount it
  useEffect(() => {
    if (activeTab === 'twin' && !twinVisited) {
      setTwinVisited(true);
    }
  }, [activeTab, twinVisited]);
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

  // Steer mode — only changes which backend endpoint is called
  const [chatMode, setChatMode] = useState<'ask' | 'steer'>('ask');
  const [activeConstraints, setActiveConstraints] = useState<Array<{ type: string; field: string; value: string }>>([]);

  useEffect(() => {
    if (!id) return;
    const fetches: Promise<void>[] = [
      fetch(`/api/reports/${id}`)
        .then(res => {
          if (!res.ok) throw new Error(`Server returned ${res.status}`);
          return res.json();
        })
        .then(data => { setReport(data); }),
    ];
    if (compareId) {
      fetches.push(
        fetch(`/api/reports/${compareId}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => { if (data) setCompareReport(data); })
      );
    }
    Promise.all(fetches)
      .then(() => setLoading(false))
      .catch(err => {
        setLoadError(err.message || 'Failed to load report');
        setLoading(false);
      });
  }, [id, compareId]);

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
    const el = messagesEndRef.current;
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'end' });
  }, [ragMessages, activeSidebar]);

  const handleRagSubmit = async (e: React.FormEvent, quickMsg?: string) => {
    e.preventDefault();
    const userMessage = (quickMsg || ragInput).trim();
    if (!userMessage || ragLoading || !id) return;
    setRagMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setRagInput('');
    setRagLoading(true);

    // ── STEER MODE: route to converse endpoint ──
    if (chatMode === 'steer') {
      setRagMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      try {
        const res = await fetch(`/api/converse/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ message: userMessage }),
        });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        let reply = data.response || '';
        // Append constraint/agent badges as text
        if (data.constraints?.length) {
          reply += '\n\n' + data.constraints.map((c: any) => `🔹 ${c.type}: ${c.value}`).join('\n');
        }
        if (data.agentActions?.length) {
          reply += '\n' + data.agentActions.map((a: any) => `↻ Re-running ${a.agent}`).join('\n');
        }
        if (data.needsRerun && data.rerunJobId) {
          reply += '\n\n⚡ Re-analysis triggered — redirecting to progress...';
          // Navigate to progress page after showing message briefly
          const agents = (data.rerunAgents || []).join(',');
          setTimeout(() => navigate(`/progress/${data.rerunJobId}?steer=1${agents ? `&agents=${agents}` : ''}`), 1200);
        }
        if (data.activeConstraints) setActiveConstraints(data.activeConstraints);
        setRagMessages(prev => { const m = [...prev]; m[m.length - 1] = { role: 'assistant', content: reply }; return m; });
      } catch {
        setRagMessages(prev => { const m = [...prev]; m[m.length - 1] = { role: 'assistant', content: 'Error connecting to orchestrator. Please try again.' }; return m; });
      }
      setRagLoading(false);
      return;
    }

    // ── ASK MODE: stream from Claude ──
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
      await exportResearchPaper(report, (msg) => {
        console.log('[PDF Export]', msg);
      });
    } catch (err) {
      console.error('[PDF Export Error]', err);
      alert('Failed to generate PDF. See console for details.');
    } finally {
      setIsExportingPdf(false);
    }
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
    <div className="min-h-screen bg-[#000000] text-zinc-300 flex flex-col items-center justify-center gap-3">
      <Loader2 size={28} className="animate-spin text-cyan-400" />
      <p className="text-sm text-zinc-500">Loading report...</p>
    </div>
  );

  if (loadError) return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 flex flex-col items-center justify-center gap-4">
      <ShieldAlert size={28} className="text-rose-500" />
      <h2 className="text-lg font-semibold text-zinc-100">Failed to load report</h2>
      <p className="text-sm text-zinc-400">{loadError}</p>
      <Button onClick={() => navigate('/search')} className="border border-zinc-800 text-zinc-300 hover:bg-zinc-900 px-4 py-2 rounded-lg">
        Back to Search
      </Button>
    </div>
  );

  if (!report || report.error) return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 flex flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-semibold text-zinc-100">Report not found.</h2>
      <Button onClick={() => navigate('/search')} className="border border-zinc-800 text-zinc-300 hover:bg-zinc-900 px-4 py-2 rounded-lg">Back to Search</Button>
    </div>
  );

  if (report.is_fake) return (
    <div className="flex-1 bg-[#000000] text-zinc-200 flex flex-col min-h-screen">
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
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_90%_60%_at_50%_0%,#000_20%,transparent_100%)]"></div>
        {showSimulation && <DebateSimulation onClose={() => setShowSimulation(false)} debateData={report?.debate_data} />}

        <div className="flex-1 flex flex-col transition-all duration-300 overflow-y-auto h-screen relative"
          style={{ marginRight: activeSidebar !== null ? sidebarWidth : 0 }}>

          <header className="px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Button variant="ghost" size="sm" onClick={() => navigate('/search')}
                  className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 -ml-2 h-7 px-2 border-none">
                  <ArrowLeft size={16} className="mr-1 inline" /> Back to Search
                </Button>
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">
                  {compareReport
                    ? <>{report.molecule} <span className="text-zinc-500 font-normal mx-1">vs</span> {compareReport.molecule}</>
                    : <>{report.molecule} Analysis Report</>
                  }
                </h1>
                <button
                  onClick={async () => {
                    if (!id || shareState !== 'idle') return;
                    setShareState('loading');
                    try {
                      const res = await fetch(`/api/reports/${id}/share`, { method: 'POST' });
                      const data = await res.json();
                      if (data.shareToken) {
                        const url = `${window.location.origin}/shared/${data.shareToken}`;
                        await navigator.clipboard.writeText(url);
                        setShareState('copied');
                        setTimeout(() => setShareState('idle'), 2500);
                      }
                    } catch { setShareState('idle'); }
                  }}
                  title={shareState === 'copied' ? 'Link copied!' : 'Share report'}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    shareState === 'copied' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
                  )}
                >
                  {shareState === 'loading' ? <Loader2 size={16} className="animate-spin" />
                    : shareState === 'copied' ? <Check size={16} />
                    : <Share2 size={16} />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs font-medium text-zinc-500">
                <span onClick={() => navigate('/search')} className="hover:text-zinc-300 cursor-pointer transition-colors">Search</span>
                <span className="text-zinc-700">/</span>
                <span className="text-zinc-400">{report.molecule}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/community")} className="flex items-center gap-2 px-3.5 py-2 hover:bg-white/20 text-white rounded-full transition-colors border border-zinc-700 text-sm font-medium"><Users className="w-5 h-5 flex items-center justify-center -ml-0.5" /><span>Community</span></button>
                <button 
                onClick={() => setActiveSidebar(activeSidebar === 'ai' ? null : 'ai')}
                className={clsx(
                  "flex items-center gap-2 h-9 px-4 rounded-full transition-all duration-200 text-sm font-medium",
                  activeSidebar === 'ai' 
                    ? "bg-white text-black ring-2 ring-white/20" 
                    : "bg-white/10 hover:bg-white/20 text-white active:scale-95"
                )}
              >
                <div className="w-5 h-5 flex items-center justify-center -ml-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 -960 960 960" fill="currentColor">
                    <path d="M480-80q0-83-31.5-156T363-363q-54-54-127-85.5T80-480q83 0 156-31.5T363-597q54-54 85.5-127T480-880q0 83 31.5 156T597-597q54 54 127 85.5T880-480q-83 0-156 31.5T597-363q-54 54-85.5 127T480-80Z" />
                  </svg>
                </div>
                <span>Ask</span>
              </button>

              {/* Scientist / Investor view mode toggle */}
              <div className="inline-flex items-center bg-zinc-900/80 border border-zinc-700 rounded-full p-0.5 gap-0.5">
                <button onClick={() => setViewMode('scientist')}
                  className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all', viewMode === 'scientist' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'text-zinc-500 hover:text-zinc-300 border border-transparent')}>
                  <Beaker size={14} /> Scientist
                </button>
                <button onClick={() => setViewMode('investor')}
                  className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all', viewMode === 'investor' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300 border border-transparent')}>
                  <DollarSign size={14} /> Investor
                </button>
              </div>
              <button onClick={handleExportPdf} disabled={isExportingPdf}
                className="flex items-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg transition-colors disabled:opacity-50 border-none text-sm font-medium">
                {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Export PDF</span>
              </button>
            </div>
          </header>

          {/* Tab navigation */}
          <div className="w-full flex justify-center mb-8 relative z-50 px-6 shrink-0">
            {/* Desktop tabs */}
            <div className="hidden md:flex items-center gap-1 w-full max-w-3xl bg-black/30 backdrop-blur-xl border border-zinc-800/60 rounded-2xl p-1.5 shadow-lg shadow-black/10">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`flex-1 px-5 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-xl ${
                    activeTab === item.id
                      ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-zinc-100 shadow-lg shadow-cyan-500/10 border border-cyan-500/30'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}>
                  {item.label}
                </button>
              ))}
            </div>
            {/* Mobile dropdown */}
            <div className="md:hidden w-full relative">
              <button onClick={() => setMobileTabOpen(o => !o)}
                className="w-full flex items-center justify-between bg-black/30 backdrop-blur-xl border border-zinc-800/60 px-4 py-3 rounded-2xl text-sm font-medium text-zinc-100 shadow-lg shadow-black/10">
                {activeNavLabel}
                <ChevronDown size={16} className={clsx('transition-transform text-zinc-500', mobileTabOpen && 'rotate-180')} />
              </button>
              {mobileTabOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black/30 backdrop-blur-xl border border-zinc-800/60 rounded-2xl overflow-hidden z-50 shadow-2xl">
                  {navItems.map((item) => (
                    <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileTabOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${activeTab === item.id ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-zinc-100 border-l-2 border-cyan-500' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <main className="flex-1 w-full px-6 lg:px-12 pb-20 relative z-10 mx-auto max-w-[1600px]">
            {/* Overview tab */}
            <div className={activeTab === 'overview' ? '' : 'hidden'}>
              {compareReport ? (
                <CompareView reportA={report} reportB={compareReport} formatMarketSize={formatMarketSize} />
              ) : viewMode === 'investor' ? (
                <InvestorOverview report={report} formatMarketSize={formatMarketSize} />
              ) : (
                <OverviewTab report={report} onStartSimulation={() => setShowSimulation(true)} structureMode={structureMode} setStructureMode={setStructureMode} setActiveSidebar={setActiveSidebar} useColor={useColor} />
              )}
            </div>

            {/* Molecule A/B toggle for compare mode (non-overview tabs) */}
            {compareReport && activeTab !== 'overview' && (
              <div className="flex items-center justify-center mb-6">
                <div className="inline-flex items-center bg-zinc-900/80 border border-zinc-800/60 rounded-full p-1 gap-0.5">
                  <button onClick={() => setCompareMolecule('A')}
                    className={clsx('px-5 py-2 rounded-full text-sm font-medium transition-all', compareMolecule === 'A' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'text-zinc-500 hover:text-zinc-300 border border-transparent')}>
                    {report.molecule}
                  </button>
                  <button onClick={() => setCompareMolecule('B')}
                    className={clsx('px-5 py-2 rounded-full text-sm font-medium transition-all', compareMolecule === 'B' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'text-zinc-500 hover:text-zinc-300 border border-transparent')}>
                    {compareReport.molecule}
                  </button>
                </div>
              </div>
            )}

            {/* Science tab */}
            <div className={activeTab === 'science' ? '' : 'hidden'}>
              <ScienceTab report={compareReport && compareMolecule === 'B' ? compareReport : report} setActiveSidebar={setActiveSidebar} useColor={useColor} />
            </div>

            {/* Market tab */}
            <div className={activeTab === 'market' ? '' : 'hidden'}>
              <MarketTab report={compareReport && compareMolecule === 'B' ? compareReport : report} currency={currency} formatMarketSize={formatMarketSize} />
            </div>

            {/* Twin tab — lazy mount to avoid PubChem rate limits on page load */}
            {(activeTab === 'twin' || twinVisited) && (
            <div className={activeTab === 'twin' ? 'animate-in fade-in duration-500 w-full mx-auto' : 'hidden'}>
              {(() => {
                const activeReport = compareReport && compareMolecule === 'B' ? compareReport : report;
                return (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-cyan-400" /> Molecular Twin Engine
                      </h2>
                    </div>
                    {activeReport?.pubchem_data?.cid ? (
                      <RepurposingAlternativeFinder key={activeReport.pubchem_data.cid} initialCid={activeReport.pubchem_data.cid} hideSearch={true} />
                    ) : (
                      <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-12 text-center text-zinc-500 flex flex-col items-center">
                        <Fingerprint className="w-10 h-10 mb-4 opacity-50 text-cyan-400" />
                        <p className="italic text-sm">No valid CID found to generate twin models for this compound.</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            )}

            {/* Synthesis tab */}
            <div className={activeTab === 'synthesis' ? '' : 'hidden'}>
              <AISynthesisTab report={compareReport && compareMolecule === 'B' ? compareReport : report} setActiveSidebar={setActiveSidebar} />
            </div>
          </main>
        </div>

        {/* Sidebar */}
        <div className={clsx(
          "fixed top-0 right-0 h-full bg-[#000000] border-l border-zinc-800/60 shadow-2xl transition-transform duration-300 transform flex flex-col z-40",
          activeSidebar !== null ? "translate-x-0" : "translate-x-full"
        )} style={{ width: sidebarWidth }}>
          <div onMouseDown={startResizing}
            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-cyan-500/50 transition-colors z-50 group">
            <div className="absolute top-1/2 -translate-y-1/2 left-0.5 h-8 w-0.5 bg-zinc-700 group-hover:bg-cyan-400 rounded-full" />
          </div>

          {activeSidebar === 'ai' && (
            <>
              <div className="p-4 flex justify-between items-center bg-zinc-950 border-b border-zinc-800/60">
                <h2 className="font-semibold text-base text-zinc-100">Ask about this molecule</h2>
                <Button variant="ghost" size="icon" onClick={() => setActiveSidebar(null)} className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full h-8 w-8 border-none flex items-center justify-center">
                  <X size={16} />
                </Button>
              </div>

              {/* ── Active Constraints Banner ── */}
              {activeConstraints.length > 0 && (
                <div className="px-4 py-2 border-b border-zinc-800/40 bg-zinc-950/50 flex flex-wrap gap-1.5">
                  {activeConstraints.map((c, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {c.type}: {c.value}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex-1 p-4 overflow-y-auto bg-[#000000]">
                {ragMessages.length <= 1 ? (
                  <div className="flex flex-col items-center justify-center text-center h-full pt-6">
                    <div className="bg-zinc-800/50 p-3 rounded-full mb-4">
                      <Sparkles size={24} className="text-zinc-200" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-100 leading-snug max-w-[260px] mb-2">
                      Hello! Curious about what you're analyzing? I'm here to help.
                    </h3>
                    <p className="text-sm text-zinc-400 mb-20">
                      Not sure what to ask? Try one of these:
                    </p>
                    <div className="absolute right-6 bottom-[140px] flex flex-col gap-3 items-end w-full">
                      <button onClick={(e) => handleRagSubmit(e as any, "What makes this a good repurposing candidate?")} disabled={ragLoading}
                              className="text-sm font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-800/50 rounded-full px-5 py-2 transition-all w-fit disabled:opacity-50">
                        What makes this a good repurposing candidate?
                      </button>
                      <button onClick={(e) => handleRagSubmit(e as any, "What are the main safety concerns?")} disabled={ragLoading}
                              className="text-sm font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-800/50 rounded-full px-5 py-2 transition-all w-fit disabled:opacity-50">
                        What are the main safety concerns?
                      </button>
                      <button onClick={(e) => handleRagSubmit(e as any, "Explain the Phoenix Score breakdown")} disabled={ragLoading}
                              className="text-sm font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-800/50 rounded-full px-5 py-2 transition-all w-fit disabled:opacity-50">
                        Explain the Phoenix Score breakdown
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
                          msg.role === 'user' ? "bg-zinc-800 text-zinc-100" : "bg-[#18181b] border border-[#27272a] text-zinc-300 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>h1]:text-xl [&>h1]:font-bold [&>h2]:text-lg [&>h2]:font-bold [&>h3]:text-base [&>h3]:font-bold [&>p:last-child]:mb-0 [&>strong]:text-zinc-200")}>
                          {msg.role === 'user' ? (
                            msg.content
                          ) : (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          )}
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
              <div className="p-4 border-t border-zinc-800/60 bg-zinc-950">
                <form className="flex gap-2 items-center" onSubmit={(e) => handleRagSubmit(e)}>
                  <button
                    type="button"
                    onClick={() => setChatMode(chatMode === 'ask' ? 'steer' : 'ask')}
                    title={chatMode === 'ask' ? 'Enable Steer mode — AI will translate your messages into pipeline constraints' : 'Disable Steer mode — back to normal Q&A'}
                    className={clsx(
                      'relative flex-none w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border',
                      chatMode === 'steer'
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    )}
                  >
                    <Zap size={15} />
                    {chatMode === 'steer' && (
                      <span className="absolute inset-0 rounded-xl animate-ping bg-indigo-500/20 pointer-events-none" style={{ animationDuration: '2s' }} />
                    )}
                  </button>
                  <div className="relative flex-1">
                    <Input value={ragInput} onChange={(e: any) => setRagInput(e.target.value)}
                      placeholder={chatMode === 'steer' ? 'Steer: add constraints, filter, re-run agents...' : 'Ask a question...'}
                      disabled={ragLoading}
                      className={clsx(
                        'w-full bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 px-4 py-6 pr-12 focus-visible:ring-1 focus-visible:ring-offset-0 rounded-xl outline-none border',
                        chatMode === 'steer' ? 'border-indigo-500/30 focus-visible:ring-indigo-500/50' : 'border-zinc-800/60 focus-visible:ring-cyan-500/50'
                      )} />
                    <Button type="submit" size="icon" disabled={ragLoading || !ragInput.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-zinc-700 text-white disabled:bg-transparent disabled:text-zinc-600 rounded-full h-8 w-8 flex items-center justify-center border-none">
                      <Send size={14} />
                    </Button>
                  </div>
                </form>
                <div className="flex justify-between items-center mt-3 px-1">
                  <p className="text-xs text-zinc-500">
                    {chatMode === 'steer' ? 'Steer mode — constraints will be applied' : 'AI can make mistakes.'}
                  </p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    {chatMode === 'steer'
                      ? <><Zap size={10} className="inline text-indigo-400" /> Orchestrator</>
                      : <><Sparkles size={10} className="inline text-cyan-400" /> Blueprints AI</>
                    }
                  </p>
                </div>
              </div>
            </>
          )}

          {activeSidebar === 'refs' && (
            <>
              <div className="p-4 border-b border-zinc-800/60 flex justify-between items-center bg-zinc-950">
                <div className="flex items-center gap-2">
                  <div className="bg-zinc-800/50 border border-zinc-700/50 p-2 rounded-full"><FileText size={18} className="text-zinc-300" /></div>
                  <div>
                    <h2 className="font-semibold text-sm text-zinc-100">Sources & Patents</h2>
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">{refsFromData.length} references</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setActiveSidebar(null)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full h-8 w-8 border-none flex items-center justify-center">
                  <X size={16} />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto bg-[#000000]">
                {refsFromData.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {refsFromData.map((ref) => (
                      <div key={ref.id} id={`ref-${ref.id}`} onClick={() => ref.url && window.open(ref.url, '_blank')}
                        className={clsx(
                          "bg-[#09090b]/80 backdrop-blur-md border border-zinc-800/50 rounded-xl p-4 hover:border-zinc-700 transition-all duration-300 cursor-pointer group flex flex-col",
                          highlightedRef === ref.id && "ring-2 ring-zinc-500/50 bg-zinc-900/50 shadow-[0_0_15px_rgba(255,255,255,0.05)] animate-pulse"
                        )}>
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-zinc-800/50 text-zinc-400 text-xs px-2 py-0.5 border border-zinc-800/80 font-medium uppercase tracking-wide">{ref.type}</Badge>
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
