import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, Activity, FileText, GitCompare, Loader2, Trash2, Users, Atom } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { clsx } from 'clsx';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/history', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data.filter((j: any) => j.status === 'completed'));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredReports = reports.filter(r =>
    r.molecule?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScore = (r: any) => r.reportData?.phoenix_score ?? r.reportData?.ai_analysis?.viability_score ?? null;
  const getIndications = (r: any): string[] => {
    const cands = r.reportData?.repurposing_candidates || [];
    return cands.slice(0, 3).map((c: any) => c.condition || 'Unknown');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col relative overflow-x-hidden">
        <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none [mask-image:radial-gradient(ellipse_90%_60%_at_50%_0%,#000_20%,transparent_100%)]" />

        <header className="px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" onClick={() => navigate('/search')}
                className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 -ml-2 h-7 px-2 border-none">
                <ArrowLeft size={16} className="mr-1 inline" /> Back to Search
              </Button>
            </div>
            <h1 className="text-lg font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Research Portfolio
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs font-medium text-zinc-500">
              <span onClick={() => navigate('/search')} className="hover:text-zinc-300 cursor-pointer transition-colors">Search</span>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-400">Portfolio</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/community")} className="flex items-center gap-2 px-3.5 py-2 hover:bg-white/20 text-white rounded-full transition-colors border border-zinc-700 text-sm font-medium">
              <Users className="w-4 h-4" /> Community
            </button>
            <button onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg transition-colors text-sm font-medium">
              <Search className="w-4 h-4" /> New Analysis
            </button>
          </div>
        </header>

        <main className="flex-1 w-full px-6 lg:px-12 pb-20 relative z-10 mx-auto max-w-[1600px]">
          {/* Search & Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input
                type="text"
                placeholder="Search molecules..."
                className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-xl pl-10 pr-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-lg px-4 py-2 text-center">
                <p className="text-xl font-bold text-zinc-100">{reports.length}</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">Analyses</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-lg px-4 py-2 text-center">
                <p className="text-xl font-bold text-cyan-400">
                  {reports.filter(r => (getScore(r) ?? 0) >= 7).length}
                </p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider">High Viability</p>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-4" />
              <p className="text-sm text-zinc-500">Loading your research portfolio...</p>
            </div>
          )}

          {/* Report Cards Grid */}
          {!loading && filteredReports.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredReports.map((report, i) => {
                const score = getScore(report);
                const indications = getIndications(report);
                const scoreColor = score === null ? 'text-zinc-500' : score >= 7.5 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-rose-400';
                const borderColor = score === null ? 'border-zinc-800/60' : score >= 7.5 ? 'border-emerald-500/20' : score >= 5 ? 'border-amber-500/20' : 'border-rose-500/20';

                return (
                  <motion.div
                    key={report._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/report/${report._id}`)}
                    className={clsx(
                      "bg-zinc-900/60 border rounded-xl p-5 cursor-pointer hover:bg-zinc-900/80 transition-all group relative overflow-hidden",
                      borderColor
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/40 border border-zinc-800/50 flex items-center justify-center">
                          <Atom size={18} className="text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-cyan-400 transition-colors">{report.molecule}</h3>
                          <p className="text-[10px] text-zinc-600 font-mono">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={clsx("text-2xl font-mono font-bold", scoreColor)}>
                          {score !== null ? score.toFixed(1) : '—'}
                        </span>
                        <p className="text-[9px] text-zinc-600 uppercase tracking-wider">Phoenix</p>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="h-1 bg-zinc-800/60 rounded-full mb-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((score ?? 0) / 10) * 100)}%` }}
                        transition={{ duration: 1, delay: i * 0.05 + 0.3 }}
                        className={clsx("h-full rounded-full",
                          score === null ? 'bg-zinc-700' : score >= 7.5 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-rose-500'
                        )}
                      />
                    </div>

                    {/* Indications */}
                    {indications.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {indications.map((ind, j) => (
                          <Badge key={j} variant="outline" className="text-[9px] border-zinc-800/60 text-zinc-400 bg-zinc-950/40 px-2 py-0.5">
                            {ind}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/40">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/report/${report._id}`); }}
                        className="text-[10px] text-zinc-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                      >
                        <FileText size={10} /> View Report
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/compare`); }}
                        className="text-[10px] text-zinc-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                      >
                        <GitCompare size={10} /> Compare
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredReports.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 rounded-full bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-zinc-700" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-300 mb-2 tracking-tight">
                {searchQuery ? 'No matching analyses' : 'No analyses yet'}
              </h2>
              <p className="text-sm text-zinc-600 max-w-md mx-auto text-center leading-relaxed mb-6">
                {searchQuery
                  ? 'Try a different search term.'
                  : 'Start by analyzing a molecule. Your research portfolio will build up here.'}
              </p>
              {!searchQuery && (
                <button onClick={() => navigate('/search')}
                  className="px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold rounded-xl transition-all flex items-center gap-2">
                  <Search size={16} /> Start First Analysis
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
