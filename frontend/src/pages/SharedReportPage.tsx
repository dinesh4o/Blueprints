import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Loader2, Activity, Target, Beaker, Atom, AlertTriangle,
  CheckCircle, TrendingUp, Shield, ExternalLink, ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { clsx } from 'clsx';

// ─── Gauge (same as ReportPage) ──────────────────────────────────────────
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

export default function SharedReportPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/shared/${token}`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Report not found'); return r.json(); })
      .then(data => { setReport(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-500">Loading shared report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-300 mb-2">Report Not Found</h2>
          <p className="text-sm text-zinc-600 mb-6">{error || 'This shared link may have expired.'}</p>
          <button onClick={() => navigate('/')}
            className="px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold rounded-xl transition-all">
            Go to Blueprints
          </button>
        </div>
      </div>
    );
  }

  const phoenixScore = report.phoenix_score ?? report.ai_analysis?.viability_score ?? null;
  const viabilityScore = report.ai_analysis?.viability_score ?? report.viability_score ?? null;
  const clinicalData = Array.isArray(report.clinical_data) ? report.clinical_data : [];
  const litData = Array.isArray(report.literature_data) ? report.literature_data : [];
  const candidates = Array.isArray(report.repurposing_candidates) ? report.repurposing_candidates : [];
  const pd = report.pubchem_data || {};

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_90%_60%_at_50%_0%,#000_20%,transparent_100%)]" />

        {/* Shared Banner */}
        <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-6 py-2.5 text-center relative z-50">
          <p className="text-xs text-cyan-300 font-medium">
            Shared Report — <button onClick={() => navigate('/')} className="underline hover:text-white transition-colors">Sign up for Blueprints</button> to run your own analyses
          </p>
        </div>

        <header className="px-6 lg:px-12 py-6 relative z-50">
          <h1 className="text-lg font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <Atom className="w-5 h-5 text-cyan-400" />
            {report.molecule} — Analysis Report
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Generated by Blueprints AI Drug Repurposing Platform</p>
        </header>

        <main className="flex-1 w-full px-6 lg:px-12 pb-20 relative z-10 mx-auto max-w-[1600px]">
          {/* Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <GaugeScore title="Phoenix Score" score={phoenixScore} max={10} />
            <GaugeScore title="AI Viability" score={viabilityScore} max={10} />
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 flex flex-col justify-between">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Clinical Trials</span>
              <span className="text-4xl font-mono font-bold text-zinc-100 mt-3">{clinicalData.length}</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 flex flex-col justify-between">
              <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Publications</span>
              <span className="text-4xl font-mono font-bold text-zinc-100 mt-3">{litData.length}</span>
            </div>
          </div>

          {/* AI Summary */}
          {report.ai_analysis?.reasoning && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
                <Activity size={16} className="text-cyan-400" /> AI Executive Summary
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{report.ai_analysis.reasoning}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {/* Opportunities */}
            {(report.ai_analysis?.top_opportunities || []).length > 0 && (
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6">
                <h3 className="text-sm font-medium text-emerald-400 mb-4 flex items-center gap-2">
                  <TrendingUp size={14} /> Top Opportunities
                </h3>
                <div className="space-y-2">
                  {report.ai_analysis.top_opportunities.map((o: string, i: number) => (
                    <div key={i} className="text-xs text-zinc-300 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" /> {o}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            {(report.ai_analysis?.top_risks || []).length > 0 && (
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6">
                <h3 className="text-sm font-medium text-rose-400 mb-4 flex items-center gap-2">
                  <Shield size={14} /> Risk Factors
                </h3>
                <div className="space-y-2">
                  {report.ai_analysis.top_risks.map((r: string, i: number) => (
                    <div key={i} className="text-xs text-zinc-400 bg-rose-500/5 border border-rose-500/10 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle size={12} className="text-rose-500 mt-0.5 shrink-0" /> {r}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Repurposing Candidates */}
          {candidates.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-medium text-zinc-300 mb-5 flex items-center gap-2">
                <Target size={16} className="text-cyan-400" /> Repurposing Candidates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {candidates.slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-4">
                    <p className="text-sm font-semibold text-zinc-100 mb-1">{c.condition}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[9px] border-cyan-700/50 text-cyan-300 bg-cyan-950/30">
                        {c.max_phase || 'N/A'}
                      </Badge>
                      <span className="text-[10px] text-zinc-500">
                        Score: {Number(c.repurposing_score || 0).toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Molecular Properties */}
          {pd.molecular_weight && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-medium text-zinc-300 mb-5 flex items-center gap-2">
                <Beaker size={16} className="text-cyan-400" /> Molecular Properties
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Mol Weight', value: pd.molecular_weight ? Number(pd.molecular_weight).toFixed(2) : null, unit: 'g/mol' },
                  { label: 'LogP', value: pd.xlogp ?? null, unit: '' },
                  { label: 'H-Donors', value: pd.hbd ?? null, unit: '' },
                  { label: 'H-Acceptors', value: pd.hba ?? null, unit: '' },
                  { label: 'Complexity', value: pd.complexity != null ? Math.round(Number(pd.complexity)) : null, unit: '' },
                  { label: 'Rotatable Bonds', value: pd.rotatable_bonds ?? null, unit: '' },
                ].map((p, i) => (
                  <div key={i} className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-3 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">{p.label}</p>
                    <p className="text-lg font-mono font-bold text-zinc-200">
                      {p.value != null ? `${p.value}${p.unit ? ` ${p.unit}` : ''}` : '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Trials */}
          {clinicalData.length > 0 && (
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-medium text-zinc-300 mb-5 flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" /> Clinical Trials ({clinicalData.length})
              </h3>
              <div className="space-y-2">
                {clinicalData.slice(0, 8).map((trial: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-800/30 last:border-0">
                    <div>
                      <p className="text-sm text-zinc-200">{trial.condition || 'Unknown Condition'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] border-emerald-700/50 text-emerald-300 bg-emerald-950/30">
                          {trial.phase || 'N/A'}
                        </Badge>
                        <span className="text-[10px] text-zinc-500">{trial.status || ''}</span>
                      </div>
                    </div>
                    {trial.nctId && (
                      <a href={`https://clinicaltrials.gov/study/${trial.nctId}`} target="_blank" rel="noopener noreferrer"
                        className="text-zinc-500 hover:text-cyan-400 transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 border border-cyan-800/40 rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Want the full analysis?</h2>
            <p className="text-sm text-zinc-400 mb-6 max-w-lg mx-auto">
              Sign up for Blueprints to access the complete 5-tab report with AI synthesis, knowledge graphs, safety heatmaps, market analysis, and molecular twin discovery.
            </p>
            <button onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold rounded-xl transition-all">
              Get Started Free
            </button>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
