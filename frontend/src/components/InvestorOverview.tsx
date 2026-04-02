import { motion } from 'framer-motion';
import {
  TrendingUp, Shield, CheckCircle, AlertTriangle,
  Activity, Scale, Sparkles, DollarSign, Briefcase, Lock, Unlock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InvestorOverviewProps {
  report: any;
  formatMarketSize: (usd_billion: number) => string;
}

function PhoenixGauge({ score }: { score: number | null }) {
  const pct = score != null ? Math.max(0, Math.min(score / 10, 1)) : 0;
  const dashArray = 251.2; // 2πr = 2π×40
  const dashOffset = dashArray - dashArray * pct;
  const color = score == null ? '#3f3f46'
    : score >= 7.5 ? '#10b981'
    : score >= 5 ? '#f59e0b'
    : '#f43f5e';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="6" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={dashArray} strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black font-mono" style={{ color }}>
            {score != null ? score.toFixed(1) : '—'}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Phoenix Score</span>
        </div>
      </div>
    </div>
  );
}

export default function InvestorOverview({ report, formatMarketSize }: InvestorOverviewProps) {
  const candidates = (report.repurposing_candidates || [])
    .sort((a: any, b: any) => (b.repurposing_score || 0) - (a.repurposing_score || 0))
    .slice(0, 4);

  const marketAnalysis = report.market_analysis || [];
  const topOpps = report.top_opportunities || [];
  const topRisks = report.top_risks || [];
  const patents = report.patent_data || [];
  const trials = report.clinical_data || [];

  const highestPhase = trials.reduce((best: string, t: any) => {
    const p = (t.phase || '').toUpperCase();
    if (p.includes('4')) return 'Phase 4';
    if (p.includes('3') && !best.includes('4')) return 'Phase 3';
    if (p.includes('2') && !best.includes('3') && !best.includes('4')) return 'Phase 2';
    if (p.includes('1') && best === 'N/A') return 'Phase 1';
    return best;
  }, 'N/A');

  const activeTrials = trials.filter((t: any) =>
    (t.status || '').toUpperCase().includes('RECRUIT') || (t.status || '').toUpperCase().includes('ACTIVE')
  ).length;

  const verdict = report.analysisReport
    ? report.analysisReport.split(/[.!?]/)[0] + '.'
    : 'AI analysis pending.';

  const totalMarket = candidates.reduce((sum: number, c: any) => sum + (Number(c.market_size_usd_billion) || 0), 0);

  return (
    <div className="animate-in fade-in duration-500 w-full mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-zinc-900/80 via-[#0c0c10] to-zinc-900/80 border border-zinc-800/60 rounded-3xl p-8 md:p-10"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <PhoenixGauge score={report.phoenix_score ?? null} />
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-xs">
                Investor Brief
              </Badge>
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">
                {report.molecule}
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-3 tracking-tight">
              {report.molecule} — Repurposing Assessment
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{verdict}</p>
            {totalMarket > 0 && (
              <div className="mt-4 flex items-center gap-2 justify-center md:justify-start">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-lg font-semibold text-emerald-400">
                  {formatMarketSize(totalMarket)}
                </span>
                <span className="text-xs text-zinc-500">Combined TAM across top indications</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Opportunity Cards */}
      {candidates.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Top Repurposing Opportunities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {candidates.map((c: any, i: number) => {
              const score = c.repurposing_score || 0;
              const ringColor = score >= 7.5 ? '#10b981' : score >= 5 ? '#f59e0b' : '#f43f5e';
              const market = marketAnalysis.find((m: any) =>
                (m.condition || '').toLowerCase().includes((c.condition || '').toLowerCase().split(' ').pop())
              );
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 hover:border-zinc-700/60 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-[10px] font-mono border-zinc-700 text-zinc-400 bg-zinc-800/50 py-0">
                      {c.max_phase || 'Preclinical'}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-mono font-black" style={{ color: ringColor }}>
                        {score.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-zinc-600">/10</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-zinc-200 mb-2 leading-snug">{c.condition}</p>
                  {market && (
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-xs text-zinc-500">TAM:</span>
                      <span className="text-sm font-semibold text-emerald-400">
                        {formatMarketSize(Number(market.market_size_usd_billion) || 0)}
                      </span>
                      {market.growth_rate_pct && (
                        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          +{Number(market.growth_rate_pct).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  )}
                  {c.trial_count > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-500">
                      <Activity className="w-3 h-3" />
                      {c.trial_count} trial{c.trial_count > 1 ? 's' : ''}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Risk / Benefit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opportunities */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Key Opportunities
          </h4>
          <ul className="space-y-3">
            {topOpps.length > 0 ? topOpps.map((opp: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-300 leading-relaxed">{opp}</span>
              </li>
            )) : (
              <li className="text-sm text-zinc-500 italic">No opportunities identified</li>
            )}
          </ul>
        </motion.div>

        {/* Risks */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Key Risk Factors
          </h4>
          <ul className="space-y-3">
            {topRisks.length > 0 ? topRisks.map((risk: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <span className="text-sm text-zinc-300 leading-relaxed">{risk}</span>
              </li>
            )) : (
              <li className="text-sm text-zinc-500 italic">No risks identified</li>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Bottom Row: IP + Clinical Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IP Landscape */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" /> IP Landscape
          </h4>
          <div className="flex items-center gap-4">
            {patents.length === 0 ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Unlock className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-emerald-400">Open IP Landscape</p>
                  <p className="text-xs text-zinc-500 mt-0.5">No active patents detected — strong freedom-to-operate</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-amber-400">{patents.length} Active Patent{patents.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">IP constraints may affect repurposing freedom — due diligence recommended</p>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Clinical Readiness */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" /> Clinical Readiness
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-black font-mono text-cyan-400">{trials.length}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Total Trials</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black font-mono text-indigo-400">{highestPhase}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Highest Phase</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black font-mono text-emerald-400">{activeTrials}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Active Trials</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Phoenix Score Breakdown */}
      {report.phoenix_breakdown && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6">
          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" /> Phoenix Score Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { key: 'regulatory', label: 'Regulatory (30%)', icon: Shield },
              { key: 'indication_distance', label: 'Indication Dist. (25%)', icon: TrendingUp },
              { key: 'clinical', label: 'Clinical (25%)', icon: Activity },
              { key: 'mechanism', label: 'Mechanism (10%)', icon: Sparkles },
              { key: 'serendipity', label: 'Serendipity (10%)', icon: Sparkles },
            ].map(({ key, label, icon: Icon }) => {
              const val = report.phoenix_breakdown[key];
              const color = val >= 7.5 ? 'text-emerald-400' : val >= 5 ? 'text-amber-400' : 'text-rose-400';
              return (
                <div key={key} className="bg-black/30 border border-zinc-800/40 rounded-xl p-4 text-center">
                  <Icon className="w-4 h-4 text-zinc-500 mx-auto mb-2" />
                  <p className={`text-2xl font-mono font-black ${color}`}>{val?.toFixed(1) ?? '—'}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
