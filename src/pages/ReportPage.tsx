import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Database, ChevronRight, Search, Download, LayoutGrid, List, Activity, X, Play, Gavel, Bot, ShieldAlert, Scale,
  MessageCircle, ExternalLink, Atom, Box, CheckCircle, TrendingUp, Target, Pill, Zap, Clock, Droplets, GitCompare,
  User, Send, Loader2, BookOpen, ArrowLeft, FlaskConical, DollarSign
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

type Tab = 'overview' | 'indications' | 'science' | 'market';

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
    <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 flex flex-col items-center justify-between h-full min-h-[180px]">
      <h3 className="text-zinc-400 text-sm w-full text-left font-medium">{title}</h3>
      <div className="relative w-full flex-1 flex items-center justify-center mt-4">
        <svg viewBox="0 0 100 60" className="w-[120px] overflow-visible">
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="#27272a" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
          <path 
            d="M 10 50 A 40 40 0 0 1 90 50" 
            fill="none" 
            stroke="currentColor" 
            className={colorClass} 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeDasharray={dashArray} 
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
          <circle cx="50" cy="50" r="3" fill="#52525b" />
          <line 
            x1="50" y1="50" x2="16" y2="50" 
            stroke="#a1a1aa" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            style={{ 
              transform: `rotate(${percentage * 180}deg)`, 
              transformOrigin: '50px 50px',
              transition: 'transform 1s ease-in-out'
            }} 
          />
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
    const timer1 = setTimeout(() => setPhase(1), 1000);
    const timer2 = setTimeout(() => setPhase(2), 4000);
    const timer3 = setTimeout(() => setPhase(3), 7000);
    const timer4 = setTimeout(() => setPhase(4), 10000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] text-zinc-100 flex flex-col overflow-hidden font-sans">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes speak-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes strike {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(-30deg); }
          25% { transform: rotate(45deg); }
          30% { transform: rotate(35deg); }
          35% { transform: rotate(45deg); }
          100% { transform: rotate(45deg); }
        }
        @keyframes shockwave {
          0% { transform: scale(0.9); opacity: 0; box-shadow: 0 0 0 0 rgba(255,255,255,0); }
          25% { transform: scale(1); opacity: 1; box-shadow: 0 0 100px 20px rgba(16, 185, 129, 0.4); }
          100% { transform: scale(2); opacity: 0; box-shadow: 0 0 200px 50px rgba(16, 185, 129, 0); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-speak::after {
          content: '';
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 2px solid currentColor;
          animation: speak-ring 1.5s ease-out infinite;
        }
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
        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </header>

      <div className="flex-1 flex relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#09090b] to-[#09090b]"></div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 border-r border-zinc-800/50">
          <div className={`relative w-32 h-32 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 animate-float ${phase === 1 || phase === 3 ? 'animate-speak' : ''}`}>
            <Bot className="w-12 h-12" />
          </div>
          <h3 className="mt-8 text-lg font-medium text-blue-400">Proponent Agent</h3>
          <p className="text-zinc-500 text-sm uppercase tracking-wider mt-1">Optimization: Efficacy</p>
          
          <div className="mt-8 w-full max-w-sm bg-[#121214] border border-zinc-800 rounded-xl p-5 h-48 overflow-hidden relative">
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

          <div className="mt-8 w-full max-w-sm bg-[#121214] border border-zinc-800 rounded-xl p-5 h-48 overflow-hidden relative">
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

const OverviewTab = ({ report, onStartSimulation, structureMode, setStructureMode }: any) => {
  const synthesisTags = Array.from(new Set([
    report.molecule,
    ...(report.repurposing_candidates || []).slice(0, 4).map((c: any) => c.condition),
    ...(report.pubchem_data?.drug_classes || []).slice(0, 3)
  ]));

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-zinc-100">Overview</h2>
        <button 
          onClick={onStartSimulation}
          className="flex items-center gap-2 px-5 py-2 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-600 text-zinc-300 rounded-lg transition-all shadow-sm"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm font-medium">Debate Simulation</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="col-span-1 lg:col-span-8 bg-[#121214] border border-[#27272a] rounded-2xl p-8 lg:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 min-h-[460px]">
          <div className="relative z-10 w-full md:w-1/2 flex flex-col">
            <h1 className="text-4xl lg:text-5xl font-semibold text-zinc-100 mb-2 tracking-tight">{report.molecule}</h1>
            <p className="text-zinc-500 text-sm mb-12 uppercase tracking-wider font-medium">Compound Overview</p>
            
            <div className="space-y-8">
              <div>
                <p className="text-3xl font-light text-zinc-200">
                  {report.market_analysis?.length > 0 ? report.market_analysis.reduce((sum:number, item:any) => sum + item.market_size_usd_billion, 0).toFixed(1) : 'N/A'} <span className="text-lg text-zinc-600 font-normal">USD (Billions)</span>
                </p>
                <p className="text-sm text-zinc-500 font-medium">Total Addressable Market</p>
              </div>
              <div>
                <p className="text-3xl font-light text-zinc-200">{report.phoenix_score?.toFixed(1) || '0.0'}<span className="text-lg text-zinc-600 font-normal">/10</span></p>
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
            <div className="w-full aspect-square max-w-[340px] bg-[#18181b] border border-[#27272a] rounded-full flex items-center justify-center relative shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] rounded-full"></div>
              <div className="w-[80%] h-[80%] relative z-10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {structureMode === '2d' ? (
                    <motion.div key="2d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }} className="w-full h-full flex justify-center items-center invert invert-[.8]">
                      <AnimatedMolecule molecule={report.molecule} size={250} />
                    </motion.div>
                  ) : (
                    <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }} className="w-full h-full flex justify-center items-center p-4">
                      {report.pubchem_data?.cid ? (
                        <div className="w-[200px] h-[200px] rounded-full overflow-hidden flex items-center justify-center">
                          <AnimatedMolecule3D cid={report.pubchem_data?.cid} height={180} />
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
            <GaugeScore 
              title="AI Viability Score" 
              score={report.viability_score || 0} 
              max={10} 
              percentage={(report.viability_score || 0) / 10} 
              colorClass="text-zinc-300"
            />
            <GaugeScore 
              title="Phoenix Score" 
              score={report.phoenix_score || 0} 
              max={10} 
              percentage={(report.phoenix_score || 0) / 10} 
              colorClass="text-zinc-500"
            />
          </div>
          
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 flex-1">
            <h3 className="text-zinc-100 text-[15px] font-medium mb-3">Quick Synthesis</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              {report.ai_analysis?.reasoning ? (Array.isArray(report.ai_analysis.reasoning) ? report.ai_analysis.reasoning[0] : report.ai_analysis.reasoning).slice(0, 150) + "..." : "AI overview processing..."}
            </p>
            <div className="flex flex-wrap gap-2">
              {synthesisTags.map((tag: any, i: number) => (
                <span 
                  key={i} 
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    i === 0
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                      : 'bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {tag as string}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IndicationsTab = ({ report }: any) => (
  <div className="animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
    <h2 className="text-xl font-medium text-zinc-100 mb-6">Known Targets & Leads</h2>
    <div className="bg-[#121214] border border-[#27272a] rounded-2xl overflow-hidden p-2">
      <div className="bg-[#09090b] rounded-xl overflow-hidden border border-[#27272a]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/50 bg-[#121214]">
              <th className="p-5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Indication / Condition</th>
              <th className="p-5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Score</th>
              <th className="p-5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Phase</th>
              <th className="p-5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Trials</th>
              <th className="p-5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {report.repurposing_candidates?.length > 0 ? (
              report.repurposing_candidates.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-zinc-900/50 transition-colors group">
                  <td className="p-5">
                    <div className="font-medium text-zinc-200">{row.condition}</div>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-medium text-zinc-300">{row.repurposing_score?.toFixed(1) || '0.0'}/10</span>
                  </td>
                  <td className="p-5 text-sm text-zinc-400">{row.max_phase}</td>
                  <td className="p-5">
                    <span className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider rounded border border-zinc-700">
                      {row.trial_count} Trials
                    </span>
                  </td>
                  <td className="p-5">
                    <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">No active indications or repurposing candidates found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const ScienceTab = ({ report }: any) => {
  const pd = report.pubchem_data || {};
  return (
    <div className="animate-in fade-in duration-500 w-full max-w-7xl mx-auto space-y-8">
      <h2 className="text-xl font-medium text-zinc-100 mb-6">Physicochemical Descriptors</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          { label: 'LogP (Consensus)', value: pd.xlogp ?? '—', unit: '' },
          { label: 'H-Bond Donors', value: pd.hbd ?? '—', unit: '' },
          { label: 'H-Bond Acceptors', value: pd.hba ?? '—', unit: '' },
          { label: 'Molecular Weight', value: pd.molecular_weight ? parseFloat(pd.molecular_weight).toFixed(2) : '—', unit: 'g/mol' },
          { label: 'Rotatable Bonds', value: pd.rotatable_bonds ?? '—', unit: '' },
          { label: 'Stereocenters', value: pd.defined_atom_stereocenter_count ?? '—', unit: '' },
          { label: 'Complexity', value: pd.complexity ?? '—', unit: '' },
          { label: 'IUPAC', value: pd.iupac_name ? "Included" : '—', unit: '' }
        ].map((prop, i) => (
          <div key={i} className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 flex flex-col">
            <span className="text-zinc-500 text-sm mb-4 font-medium">{prop.label}</span>
            <div className="flex items-baseline gap-1 mt-auto">
              <span className="text-2xl font-semibold text-zinc-200">{prop.value}</span>
              {prop.unit && <span className="text-zinc-600 text-sm font-medium">{prop.unit}</span>}
            </div>
          </div>
        ))}
      </div>
      
      {(pd.mechanism_of_action || pd.pharmacology || pd.tox_summary) && (
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 space-y-6 mt-8">
           {pd.mechanism_of_action && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2"><Zap size={14}/> Mechanism of Action</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{pd.mechanism_of_action}</p>
              </div>
           )}
           {pd.pharmacology && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-2"><Activity size={14}/> Pharmacology</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{pd.pharmacology}</p>
              </div>
           )}
           {pd.tox_summary && (
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-2"><ShieldAlert size={14}/> Toxicity</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{pd.tox_summary}</p>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

const MarketTab = ({ report, currency, formatMarketSize }: any) => (
  <div className="animate-in fade-in duration-500 w-full max-w-7xl mx-auto space-y-8">
     <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-zinc-100">Market Intelligence</h2>
     </div>
     
     {report.market_analysis?.length > 0 ? (
       <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 space-y-8">
          {report.market_analysis.map((item: any, i: number) => {
            const maxSize = Math.max(...report.market_analysis.map((m: any) => m.market_size_usd_billion));
            const pct = (item.market_size_usd_billion / maxSize) * 100;
            return (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-medium text-zinc-100 truncate text-lg">{item.condition}</span>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0 py-0 border-zinc-700 text-zinc-400 bg-zinc-800/50">{item.max_phase}</Badge>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-3">
                    <span className="text-sm text-emerald-500 font-medium">+{item.growth_rate_pct}% CAGR</span>
                    <span className="font-semibold text-zinc-200 w-20 text-right text-lg">{formatMarketSize(item.market_size_usd_billion)}</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-800/50 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-1.5 rounded-full bg-zinc-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-xs text-zinc-500 mt-6 pt-4 border-t border-zinc-800/50">
            * Market size estimates are based on published therapeutic area reports and are indicative. Actual addressable market depends on indication specificity, competitive landscape, and clinical success rates.
          </p>
       </div>
     ) : (
       <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
          <Database className="w-10 h-10 text-zinc-700 mb-6" />
          <h3 className="text-lg text-zinc-300 font-medium mb-2">Market Data Locked</h3>
          <p className="text-zinc-500 max-w-sm text-sm">Detailed commercial and market volume intelligence is currently locked or requires an expanded licensing tier.</p>
       </div>
     )}
  </div>
);

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showSimulation, setShowSimulation] = useState(false);
  
  // UI States
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [structureMode, setStructureMode] = useState<'2d' | '3d'>('2d');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // RAG Chatbot State
  const [isRagOpen, setIsRagOpen] = useState(false);
  const [ragMessages, setRagMessages] = useState<{role: 'user'|'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am ready to answer any questions about this clinical report. Ask away!' }
  ]);
  const [ragInput, setRagInput] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragInit, setRagInit] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const INR_RATE = 83.5;
  const formatMarketSize = (usd_billion: number) => {
    if (currency === 'INR') {
      const inrBillion = usd_billion * INR_RATE;
      if (inrBillion >= 1000) return `₹${(inrBillion / 1000).toFixed(1)}T`;
      return `₹${inrBillion.toFixed(1)}B`;
    }
    return `$${usd_billion.toFixed(1)}B`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ragMessages]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/reports/${id}`)
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
        if (!data.error && !data.is_fake) {
          fetch(`/api/rag/init/${id}`, { method: 'POST' })
            .then(r => r.json())
            .then(() => setRagInit(true))
            .catch(console.error);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleRagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragInput.trim() || ragLoading || !id) return;

    const userMessage = ragInput.trim();
    setRagMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setRagInput('');
    setRagLoading(true);

    try {
      const response = await fetch(`/api/rag/chat/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      if (data.error || !data.answer) {
        setRagMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error || 'Unknown error'}` }]);
      } else {
        setRagMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
      }
    } catch (err) {
      setRagMessages(prev => [...prev, { role: 'assistant', content: "Error communicating with AI." }]);
    } finally {
      setRagLoading(false);
    }
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      window.print();
      setIsExportingPdf(false);
    }, 1000);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#09090b] text-zinc-300 flex items-center justify-center">
       <Loader2 size={32} className="animate-spin text-zinc-500" />
    </div>;
  }

  if (!report || report.error) {
    return <div className="min-h-screen bg-[#09090b] text-zinc-300 flex flex-col items-center justify-center">
      <h2 className="text-xl mb-4">Report not found.</h2>
      <Button onClick={() => navigate('/search')} variant="outline" className="border-zinc-700 text-zinc-300">Back to Search</Button>
    </div>;
  }

  if (report.is_fake) {
    return (
      <div className="flex-1 bg-[#09090b] text-zinc-200 flex flex-col min-h-screen">
        <header className="px-6 lg:px-12 py-8 flex items-center relative z-50">
          <Button variant="ghost" onClick={() => navigate('/search')} className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 -ml-4">
            <ArrowLeft size={16} className="mr-2" /> Back to Search
          </Button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
            className="max-w-lg"
          >
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
                  <div key={db} className="bg-[#121214] border border-[#27272a] rounded-lg p-3 text-center">
                    <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-1">
                      <X size={12} className="text-rose-500" />
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium">{db}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                This may be a fictitious name, a typographical error, or a proprietary early-stage compound with no public data. Analysis was aborted to prevent AI hallucinations.
              </p>
            </div>
            <Button size="lg" onClick={() => navigate('/search')} className="gap-2 bg-zinc-100 hover:bg-white text-zinc-900 border-none">
              <Search size={16} /> Try Another Molecule
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'indications', label: 'Indications' },
    { id: 'science', label: 'Science' },
    { id: 'market', label: 'Market Intelligence' },
  ] as const;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-zinc-800 flex flex-col relative overflow-x-hidden transition-all duration-300">
        
        {showSimulation && <DebateSimulation onClose={() => setShowSimulation(false)} />}
        
        <div className={clsx(
          "flex-1 flex flex-col transition-all duration-300 overflow-y-auto h-screen relative",
          isRagOpen ? "mr-96" : ""
        )}>

          <header className="px-6 lg:px-12 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-50">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/search')} className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 -ml-2 h-7 px-2 border-none">
                  <ArrowLeft size={16} className="mr-1" /> Back to Search
                </Button>
              </div>
              <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
                {report.molecule} Analysis Report
              </h1>
              <div className="flex items-center gap-2 mt-2 text-xs font-medium text-zinc-600 uppercase tracking-widest">
                <span onClick={() => navigate('/search')} className="hover:text-zinc-400 cursor-pointer transition-colors">Search</span>
                <span>/</span>
                <span className="text-zinc-400">{report.molecule}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsRagOpen(!isRagOpen)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border shadow-sm text-sm font-medium",
                  isRagOpen
                    ? "bg-indigo-500 text-white border-indigo-600"
                    : "bg-[#121214] hover:bg-[#18181b] border-[#27272a] text-zinc-300"
                )}
              >
                <Bot className="w-4 h-4" />
                <span>Ask AI</span>
              </button>

              <button onClick={handleExportPdf} disabled={isExportingPdf} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg transition-colors shadow-sm disabled:opacity-50 border-none">
                {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="text-sm font-medium">Export</span>
              </button>

              <div className="flex items-center bg-[#121214] border border-[#27272a] rounded-lg p-1 ml-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="w-full flex justify-center mb-10 relative z-50 px-6 shrink-0">
            <div className="flex items-center bg-[#121214] border border-[#27272a] p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === item.id ? 'bg-[#27272a] text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <main className="flex-1 w-full px-6 lg:px-12 pb-20 relative z-10 mx-auto max-w-7xl">
            {activeTab === 'overview' && <OverviewTab report={report} onStartSimulation={() => setShowSimulation(true)} structureMode={structureMode} setStructureMode={setStructureMode} />}
            {activeTab === 'indications' && <IndicationsTab report={report} />}
            {activeTab === 'science' && <ScienceTab report={report} />}
            {activeTab === 'market' && <MarketTab report={report} currency={currency} formatMarketSize={formatMarketSize} />}
          </main>
        </div>

        <div 
          className={clsx(
            "fixed top-0 right-0 h-full w-96 bg-[#09090b] border-l border-[#27272a] shadow-2xl transition-transform duration-300 transform flex flex-col z-40",
            isRagOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-4 border-b border-[#27272a] flex justify-between items-center bg-[#121214]">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-full">
                <Bot size={18} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="font-semibold text-sm text-zinc-100">Report Assistant</h2>
                <p className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                  <span className={clsx("w-1.5 h-1.5 rounded-full shadow-sm", ragInit ? "bg-emerald-500 shadow-emerald-500/50" : "bg-amber-500 shadow-amber-500/50 animate-pulse")}></span>
                  {ragInit ? "AI Ready to Analyze" : "Indexing Report..."}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsRagOpen(false)} className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-full h-8 w-8 border-none">
              <X size={16} />
            </Button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#09090b]">
            {ragMessages.map((msg, idx) => (
              <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border", 
                  msg.role === 'user' ? "bg-indigo-500 text-white border-indigo-600" : "bg-[#18181b] text-indigo-400 border-[#27272a]"
                )}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={clsx("px-4 py-2 rounded-2xl max-w-[80%] text-sm leading-relaxed", 
                  msg.role === 'user' ? "bg-indigo-500 text-white" : "bg-[#18181b] border border-[#27272a] text-zinc-300"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {ragLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#18181b] text-indigo-400 border border-[#27272a]">
                  <Loader2 size={14} className="animate-spin" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-[#18181b] border border-[#27272a] text-zinc-400 flex items-center gap-1.5 h-[38px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[#27272a] bg-[#121214]">
            <form className="flex gap-2" onSubmit={handleRagSubmit}>
              <Input 
                value={ragInput}
                onChange={e => setRagInput(e.target.value)}
                placeholder="Ask about this report..." 
                className="flex-1 bg-[#09090b] border-[#27272a] text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 focus-visible:border-indigo-500 rounded-xl"
                disabled={!ragInit || ragLoading}
              />
              <Button type="submit" size="icon" disabled={!ragInit || ragLoading || !ragInput.trim()} className="shrink-0 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-zinc-800 disabled:text-zinc-500 border-none">
                <Send size={16} />
              </Button>
            </form>
            <p className="text-[10px] text-center text-zinc-600 mt-3 font-medium tracking-wide flex justify-center items-center gap-1">
              <ShieldAlert size={10} /> AI-generated answers can be inaccurate.
            </p>
          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}
