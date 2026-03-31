import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare, Search, ArrowLeft, Sparkles, TrendingUp, Shield,
  Activity, Loader2, Target, Beaker, Atom, FileText,
  CheckCircle, AlertTriangle, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clsx } from 'clsx';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ComparisonData {
  molecule: string;
  phoenix_score?: number;
  viability_score?: number;
  phoenix_breakdown?: { clinical: number; market: number; safety: number };
  ai_analysis?: { viability_score: number; top_opportunities: string[]; top_risks: string[]; reasoning?: string };
  clinical_data?: any[];
  literature_data?: any[];
  patent_data?: any[];
  pubchem_data?: any;
  regulatory_data?: any;
  repurposing_candidates?: any[];
  market_analysis?: any[];
  intermediate_data?: {
    clinicalData?: any[];
    pubchemData?: any;
    regulatoryData?: any;
  };
}

// ─── Gauge (matches ReportPage) ───────────────────────────────────────────────
const GaugeScore = ({ score, max, title }: { score: number | null; max: number; title: string }) => {
  const pct = score != null ? Math.max(0, Math.min(score / max, 1)) : 0;
  const dashArray = 125.6;
  const dashOffset = dashArray - (dashArray * pct);
  const arcColor = score === null ? '#3f3f46' : score >= 7.5 ? '#10b981' : score >= 5.0 ? '#f59e0b' : '#f43f5e';
  const textColor = score === null ? 'text-zinc-500' : score >= 7.5 ? 'text-emerald-400' : score >= 5.0 ? 'text-amber-400' : 'text-rose-400';

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

export default function ComparePage() {
  const navigate = useNavigate();
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [dataA, setDataA] = useState<ComparisonData | null>(null);
  const [dataB, setDataB] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestionsA, setSuggestionsA] = useState<string[]>([]);
  const [suggestionsB, setSuggestionsB] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const unique: any[] = [];
          const seen = new Set();
          for (const job of data) {
            const mol = job.molecule.toLowerCase();
            if (!seen.has(mol) && job.status === 'complete') {
              seen.add(mol);
              unique.push(job);
            }
          }
          setHistory(unique);
        }
      })
      .catch(console.error);
  }, []);

  const fetchSuggestions = async (query: string, setter: (s: string[]) => void) => {
    if (query.length < 2) { setter([]); return; }
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.dictionary_terms?.compound) {
        setter(data.dictionary_terms.compound.slice(0, 5));
      }
    } catch { setter([]); }
  };

  const loadDrugData = async (molecule: string): Promise<ComparisonData | null> => {
    // First check if we have it in history
    const existing = history.find(h => h.molecule.toLowerCase() === molecule.toLowerCase());
    if (existing) {
      try {
        const res = await fetch(`/api/reports/${existing._id}`);
        if (res.ok) return await res.json();
      } catch { /* fall through */ }
    }
    // Otherwise do a fresh analysis
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ molecule }),
      });
      const data = await res.json();
      if (data.job_id) {
        // Wait for completion
        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const statusRes = await fetch(`/api/status/${data.job_id}`);
          const status = await statusRes.json();
          if (status.status === 'complete' || status.status === 'awaiting_ai') {
            const reportRes = await fetch(`/api/reports/${data.job_id}`);
            if (reportRes.ok) return await reportRes.json();
          }
          if (status.status === 'error') break;
        }
      }
    } catch { /* fail gracefully */ }
    return null;
  };

  const handleCompare = async () => {
    if (!drugA.trim() || !drugB.trim()) return;
    setLoading(true);
    const [a, b] = await Promise.all([loadDrugData(drugA), loadDrugData(drugB)]);
    setDataA(a);
    setDataB(b);
    setLoading(false);
  };

  const getPhoenixScore = (data: ComparisonData | null) => data?.phoenix_score ?? data?.viability_score ?? data?.ai_analysis?.viability_score ?? 0;
  const getClinicalCount = (data: ComparisonData | null) => Array.isArray(data?.clinical_data) ? data!.clinical_data!.length : 0;
  const getLitCount = (data: ComparisonData | null) => Array.isArray(data?.literature_data) ? data!.literature_data!.length : 0;
  const getPatentCount = (data: ComparisonData | null) => Array.isArray(data?.patent_data) ? data!.patent_data!.length : 0;
  const getMarket = (data: ComparisonData | null) => (data?.market_analysis || []).reduce((s: number, m: any) => s + (Number(m.market_size_usd_billion) || 0), 0);

  const ComparisonBar = ({ label, valueA, valueB, max }: { label: string; valueA: number; valueB: number; max: number }) => {
    const winA = valueA > valueB;
    const winB = valueB > valueA;
    return (
      <div className="py-3 border-b border-zinc-800/40 last:border-0">
        <div className="flex justify-between text-[11px] text-zinc-500 mb-2 uppercase tracking-wider font-medium">
          <span className={winA ? 'text-cyan-400' : ''}>{valueA.toFixed(1)}</span>
          <span className="text-zinc-600">{label}</span>
          <span className={winB ? 'text-cyan-400' : ''}>{valueB.toFixed(1)}</span>
        </div>
        <div className="flex gap-[3px] h-[6px]">
          <div className="flex-1 bg-zinc-800/50 rounded-l-full overflow-hidden flex justify-end">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, max > 0 ? (valueA / max) * 100 : 0)}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-l-full ${winA ? 'bg-gradient-to-l from-cyan-400 to-cyan-500' : 'bg-zinc-700'}`}
            />
          </div>
          <div className="flex-1 bg-zinc-800/50 rounded-r-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, max > 0 ? (valueB / max) * 100 : 0)}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className={`h-full rounded-r-full ${winB ? 'bg-gradient-to-r from-cyan-400 to-cyan-500' : 'bg-zinc-700'}`}
            />
          </div>
        </div>
      </div>
    );
  };

  const [focusedInput, setFocusedInput] = useState<'a' | 'b' | null>(null);

  const SuggestionDropdown = ({ items, onSelect }: { items: string[]; onSelect: (s: string) => void }) => (
    items.length > 0 ? (
      <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden z-30 shadow-2xl shadow-black/60">
        {items.map((s, i) => (
          <button key={i} onClick={() => onSelect(s)}
            className="w-full text-left px-5 py-3 hover:bg-zinc-900 text-zinc-300 border-b border-zinc-800/60 last:border-0 flex items-center gap-3 transition-colors text-sm">
            <Search size={13} className="text-zinc-600" /> {s}
          </button>
        ))}
      </div>
    ) : null
  );

  const scoreA = getPhoenixScore(dataA);
  const scoreB = getPhoenixScore(dataB);
  const winner = scoreA > scoreB ? 'a' : scoreB > scoreA ? 'b' : 'tie';
  const hasResults = dataA && dataB && !loading;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col relative overflow-x-hidden">
        {/* Grid BG — same as ReportPage */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_90%_60%_at_50%_0%,#000_20%,transparent_100%)]" />

        {/* Header — matches ReportPage */}
        <header className="px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" onClick={() => navigate('/search')}
                className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 -ml-2 h-7 px-2 border-none">
                <ArrowLeft size={16} className="mr-1 inline" /> Back to Search
              </Button>
            </div>
            <h1 className="text-lg font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-cyan-400" />
              Head-to-Head Drug Comparison
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs font-medium text-zinc-500">
              <span onClick={() => navigate('/search')} className="hover:text-zinc-300 cursor-pointer transition-colors">Search</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-400">Compare</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/community")} className="flex items-center gap-2 px-3.5 py-2 hover:bg-white/20 text-white rounded-full transition-colors border border-zinc-700 text-sm font-medium">
              <Users className="w-4 h-4" /> Community
            </button>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 w-full px-6 lg:px-12 pb-20 relative z-10 mx-auto max-w-[1600px]">

          {/* Search Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 w-full relative">
                <label className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold mb-2 block flex items-center gap-1.5">
                  <Atom size={10} /> Compound A
                </label>
                <input type="text" value={drugA}
                  onChange={(e) => { setDrugA(e.target.value); fetchSuggestions(e.target.value, setSuggestionsA); }}
                  onFocus={() => setFocusedInput('a')}
                  onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
                  onKeyDown={(e) => e.key === 'Enter' && drugB.trim() && handleCompare()}
                  placeholder="e.g., Metformin"
                  className="w-full bg-black/40 backdrop-blur-md border border-zinc-800/50 hover:border-zinc-700 focus:border-cyan-500/50 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all text-sm"
                />
                {focusedInput === 'a' && <SuggestionDropdown items={suggestionsA} onSelect={(s) => { setDrugA(s); setSuggestionsA([]); }} />}
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800/80 border border-zinc-700/50 shrink-0 self-end mb-0.5 shadow-lg">
                <span className="text-xs font-bold text-zinc-400 tracking-widest">VS</span>
              </div>
              <div className="flex-1 w-full relative">
                <label className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold mb-2 block flex items-center gap-1.5">
                  <Atom size={10} /> Compound B
                </label>
                <input type="text" value={drugB}
                  onChange={(e) => { setDrugB(e.target.value); fetchSuggestions(e.target.value, setSuggestionsB); }}
                  onFocus={() => setFocusedInput('b')}
                  onBlur={() => setTimeout(() => setFocusedInput(null), 200)}
                  onKeyDown={(e) => e.key === 'Enter' && drugA.trim() && handleCompare()}
                  placeholder="e.g., Aspirin"
                  className="w-full bg-black/40 backdrop-blur-md border border-zinc-800/50 hover:border-zinc-700 focus:border-cyan-500/50 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all text-sm"
                />
                {focusedInput === 'b' && <SuggestionDropdown items={suggestionsB} onSelect={(s) => { setDrugB(s); setSuggestionsB([]); }} />}
              </div>
              <button onClick={handleCompare} disabled={loading || !drugA.trim() || !drugB.trim()}
                className="h-[50px] px-8 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-900 text-sm font-semibold rounded-xl transition-all shrink-0 flex items-center gap-2 active:scale-95">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <GitCompare size={16} />}
                {loading ? 'Analyzing...' : 'Compare'}
              </button>
            </div>
            {history.length > 0 && !hasResults && (
              <div className="relative z-10 mt-4 pt-4 border-t border-zinc-800/40 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Previously analyzed:</span>
                {history.slice(0, 8).map((h, i) => (
                  <button key={i} onClick={() => !drugA.trim() ? setDrugA(h.molecule) : !drugB.trim() ? setDrugB(h.molecule) : null}
                    className="text-xs px-3 py-1.5 rounded-lg bg-black/40 border border-zinc-800/50 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                    {h.molecule}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Loading */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24">
                <div className="relative w-28 h-28 mb-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-cyan-400/40 border-b-transparent border-l-transparent" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-3 rounded-full border border-t-transparent border-r-transparent border-b-zinc-700 border-l-zinc-700" />
                  <div className="absolute inset-4 rounded-full bg-zinc-950/80 flex items-center justify-center">
                    <GitCompare className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-1">Analyzing both compounds</p>
                <p className="text-xs text-zinc-600">This may take a moment if reports aren't cached</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          {hasResults && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

              {/* Score Face-off — 12-col grid like ReportPage */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8">
                {/* Drug A Card */}
                <div className={clsx(
                  "col-span-1 lg:col-span-5 bg-zinc-900/60 border rounded-xl p-6 relative overflow-hidden",
                  winner === 'a' ? 'border-cyan-500/30' : 'border-zinc-800/60'
                )}>
                  {winner === 'a' && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent pointer-events-none" />}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-black/40 border border-zinc-800/50 flex items-center justify-center">
                        <Atom size={18} className="text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{dataA!.molecule}</h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Compound A</p>
                      </div>
                      {winner === 'a' && <Badge className="ml-auto bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">WINNER</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <GaugeScore title="Phoenix Score" score={dataA!.phoenix_score ?? null} max={10} />
                      <GaugeScore title="AI Viability" score={dataA!.ai_analysis?.viability_score ?? dataA!.viability_score ?? null} max={10} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-zinc-100">{getClinicalCount(dataA)}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Trials</p>
                      </div>
                      <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-zinc-100">{getLitCount(dataA)}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Papers</p>
                      </div>
                      <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-zinc-100">{getPatentCount(dataA)}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Patents</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center VS */}
                <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center gap-4">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring', bounce: 0.5 }}
                    className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center border",
                      winner === 'tie' ? "bg-zinc-800/60 border-zinc-700 text-zinc-400" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    )}>
                    <GitCompare size={28} />
                  </motion.div>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">versus</span>
                </div>

                {/* Drug B Card */}
                <div className={clsx(
                  "col-span-1 lg:col-span-5 bg-zinc-900/60 border rounded-xl p-6 relative overflow-hidden",
                  winner === 'b' ? 'border-cyan-500/30' : 'border-zinc-800/60'
                )}>
                  {winner === 'b' && <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent pointer-events-none" />}
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-black/40 border border-zinc-800/50 flex items-center justify-center">
                        <Atom size={18} className="text-cyan-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">{dataB!.molecule}</h2>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Compound B</p>
                      </div>
                      {winner === 'b' && <Badge className="ml-auto bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">WINNER</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <GaugeScore title="Phoenix Score" score={dataB!.phoenix_score ?? null} max={10} />
                      <GaugeScore title="AI Viability" score={dataB!.ai_analysis?.viability_score ?? dataB!.viability_score ?? null} max={10} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-zinc-100">{getClinicalCount(dataB)}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Trials</p>
                      </div>
                      <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-zinc-100">{getLitCount(dataB)}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Papers</p>
                      </div>
                      <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2.5 text-center">
                        <p className="text-lg font-bold text-zinc-100">{getPatentCount(dataB)}</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Patents</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimension Comparison Bars */}
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 mb-8">
                <h3 className="text-sm font-medium text-zinc-300 mb-1 flex items-center gap-2">
                  <Activity size={16} className="text-cyan-400" /> Dimension Comparison
                </h3>
                <p className="text-[10px] text-zinc-600 mb-5">Cyan highlights the leader in each dimension.</p>
                <div className="flex justify-between text-[10px] text-zinc-600 mb-3 uppercase tracking-wider font-medium">
                  <span className="flex items-center gap-1.5"><div className="w-3 h-1 bg-zinc-600 rounded-full" /> {dataA!.molecule}</span>
                  <span className="flex items-center gap-1.5"><div className="w-3 h-1 bg-zinc-600 rounded-full" /> {dataB!.molecule}</span>
                </div>
                <ComparisonBar label="Phoenix Score" valueA={scoreA} valueB={scoreB} max={10} />
                <ComparisonBar label="Clinical Trials" valueA={getClinicalCount(dataA)} valueB={getClinicalCount(dataB)} max={Math.max(getClinicalCount(dataA), getClinicalCount(dataB), 1)} />
                <ComparisonBar label="Publications" valueA={getLitCount(dataA)} valueB={getLitCount(dataB)} max={Math.max(getLitCount(dataA), getLitCount(dataB), 1)} />
                <ComparisonBar label="Market ($B)" valueA={getMarket(dataA)} valueB={getMarket(dataB)} max={Math.max(getMarket(dataA), getMarket(dataB), 1)} />
                <ComparisonBar
                  label="Clinical Evidence"
                  valueA={dataA!.phoenix_breakdown?.clinical ?? scoreA * 0.7}
                  valueB={dataB!.phoenix_breakdown?.clinical ?? scoreB * 0.7}
                  max={10}
                />
                <ComparisonBar
                  label="Market Opportunity"
                  valueA={dataA!.phoenix_breakdown?.market ?? scoreA * 0.3}
                  valueB={dataB!.phoenix_breakdown?.market ?? scoreB * 0.3}
                  max={10}
                />
              </div>

              {/* Opportunities & Risks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {[{ data: dataA!, side: 'A' }, { data: dataB!, side: 'B' }].map(({ data, side }) => (
                  <div key={side} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">{data.molecule}</h3>
                      <h4 className="text-sm font-medium text-emerald-400 mb-4 flex items-center gap-2">
                        <TrendingUp size={14} /> Opportunities
                      </h4>
                      <div className="space-y-2">
                        {(data.ai_analysis?.top_opportunities || ['Data pending']).map((o: string, i: number) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            className="text-xs text-zinc-300 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 flex items-start gap-2">
                            <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" /> {o}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-rose-400 mb-4 flex items-center gap-2">
                        <Shield size={14} /> Risk Factors
                      </h4>
                      <div className="space-y-2">
                        {(data.ai_analysis?.top_risks || ['No major risks identified']).map((r: string, i: number) => (
                          <div key={i} className="text-xs text-zinc-400 bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 flex items-start gap-2">
                            <AlertTriangle size={12} className="text-rose-500 mt-0.5 shrink-0" /> {r}
                          </div>
                        ))}
                      </div>
                    </div>
                    {(data.repurposing_candidates || []).length > 0 && (
                      <div className="bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 border border-cyan-800/40 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-3.5 h-3.5 text-cyan-400" />
                          <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">Top Repurposing Candidate</p>
                        </div>
                        <p className="text-sm font-semibold text-zinc-100">{data.repurposing_candidates![0].condition}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] border-cyan-700/50 text-cyan-300 bg-cyan-950/30">
                            {data.repurposing_candidates![0].max_phase || 'N/A'}
                          </Badge>
                          <span className="text-[10px] text-zinc-500">
                            Score: {Number(data.repurposing_candidates![0].repurposing_score || 0).toFixed(1)}/10
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Molecular Properties Table */}
              {(dataA!.pubchem_data || dataB!.pubchem_data) && (
                <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 mb-8">
                  <h3 className="text-sm font-medium text-zinc-300 mb-5 flex items-center gap-2">
                    <Beaker size={16} className="text-cyan-400" /> Molecular Properties
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800/60">
                          <th className="text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium py-2 pr-4">Property</th>
                          <th className="text-center text-[10px] text-cyan-400 uppercase tracking-wider font-medium py-2 px-4">{dataA!.molecule}</th>
                          <th className="text-center text-[10px] text-cyan-400 uppercase tracking-wider font-medium py-2 pl-4">{dataB!.molecule}</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {[
                          { label: 'Molecular Weight', a: dataA!.pubchem_data?.molecular_weight, b: dataB!.pubchem_data?.molecular_weight, unit: 'g/mol', dec: 2 },
                          { label: 'LogP', a: dataA!.pubchem_data?.xlogp, b: dataB!.pubchem_data?.xlogp, unit: '', dec: 1 },
                          { label: 'H-Bond Donors', a: dataA!.pubchem_data?.hbd, b: dataB!.pubchem_data?.hbd, unit: '', dec: 0 },
                          { label: 'H-Bond Acceptors', a: dataA!.pubchem_data?.hba, b: dataB!.pubchem_data?.hba, unit: '', dec: 0 },
                          { label: 'Complexity', a: dataA!.pubchem_data?.complexity, b: dataB!.pubchem_data?.complexity, unit: '', dec: 0 },
                          { label: 'Rotatable Bonds', a: dataA!.pubchem_data?.rotatable_bonds, b: dataB!.pubchem_data?.rotatable_bonds, unit: '', dec: 0 },
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-zinc-800/30">
                            <td className="py-2.5 pr-4 text-zinc-400 font-medium">{row.label}</td>
                            <td className="py-2.5 px-4 text-center text-zinc-200 font-mono">
                              {row.a != null ? `${Number(row.a).toFixed(row.dec)}${row.unit ? ` ${row.unit}` : ''}` : <span className="text-zinc-600">—</span>}
                            </td>
                            <td className="py-2.5 pl-4 text-center text-zinc-200 font-mono">
                              {row.b != null ? `${Number(row.b).toFixed(row.dec)}${row.unit ? ` ${row.unit}` : ''}` : <span className="text-zinc-600">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View Full Reports */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{ data: dataA, label: dataA!.molecule }, { data: dataB, label: dataB!.molecule }].map(({ label }, i) => {
                  const existing = history.find(h => h.molecule.toLowerCase() === label.toLowerCase());
                  return (
                    <button key={i} onClick={() => existing && navigate(`/report/${existing._id}`)} disabled={!existing}
                      className="bg-zinc-900/60 border border-zinc-800/60 hover:border-cyan-500/30 rounded-xl p-5 text-left transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">{label}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">View full analysis report</p>
                        </div>
                        <FileText size={18} className="text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!dataA && !dataB && !loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 rounded-full bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center mb-6">
                <GitCompare className="w-10 h-10 text-zinc-700" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-300 mb-2 tracking-tight">Compare Two Molecules</h2>
              <p className="text-sm text-zinc-600 max-w-md mx-auto text-center leading-relaxed">
                Enter two compound names above to generate a head-to-head comparison of Phoenix Scores, clinical evidence, market opportunity, and risk profiles.
              </p>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
