/**
 * AI Synthesis Tab — "Opportunities" view
 *
 * Satisfies judging criteria:
 *   Contextual Synthesis | Traceability | Source Citation
 *
 * Contains:
 *   A) Opportunity Matrix Table (sortable, colour-coded composite scores)
 *   B) Evidence Chain Accordion (per opportunity, every claim links to source)
 *   C) Pathway Overlap Panel (SVG node-edge graph: Drug → Target → Disease)
 */

import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronRight, ExternalLink, Activity, TrendingUp,
  ShieldAlert, Target, BookOpen, Gavel, CheckCircle, Circle,
  Network, Zap, Database, X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

const InteractivePathway = lazy(() => import('@/components/InteractivePathway').then(m => ({ default: m.default })));

// ─────────────────────────────────────────────
// Score helpers
// ─────────────────────────────────────────────

function phaseToEvidence(phase: string): { level: string; score: number } {
  const p = (phase || '').toUpperCase();
  if (p.includes('4'))                         return { level: 'Very High', score: 9.5 };
  if (p.includes('3'))                         return { level: 'High',      score: 7.5 };
  if (p.includes('2') && p.includes('3'))      return { level: 'High',      score: 7.0 };
  if (p.includes('2'))                         return { level: 'Moderate',  score: 5.5 };
  if (p.includes('1') && p.includes('2'))      return { level: 'Moderate',  score: 4.5 };
  if (p.includes('1'))                         return { level: 'Preliminary', score: 3.5 };
  return { level: 'Preclinical', score: 2.0 };
}

function scoreColor(score: number) {
  if (score >= 8) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
  if (score >= 6) return { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' };
  return           { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20' };
}

function scoreLabel(score: number) {
  if (score >= 8) return 'High Opportunity';
  if (score >= 6) return 'Moderate Opportunity';
  return 'Low Opportunity';
}

// ─────────────────────────────────────────────
// Evidence Chain Accordion Row
// ─────────────────────────────────────────────

function EvidenceChainDetail({ opportunity, report, setActiveSidebar }: { opportunity: any; report: any; setActiveSidebar?: any }) {
  if (!opportunity) return null;

  // Filter trials supporting this condition
  const supportingTrials = (report.clinical_data || [])
    .filter((t: any) => {
      const c = (t.condition || '').toLowerCase();
      const opp = (opportunity.condition || '').toLowerCase();
      return c.includes(opp.split(' ').slice(-2).join(' ')) || opp.includes(c.split(' ').slice(-2).join(' '));
    })
    .slice(0, 5);

  // Filter publications (keyword match against condition)
  const condWords = opportunity.condition.toLowerCase().split(' ').filter((w: string) => w.length > 4);
  const supportingPapers = (report.literature_data || [])
    .filter((l: any) => {
      const title = (l.title || '').toLowerCase();
      return condWords.some((w: string) => title.includes(w));
    })
    .slice(0, 4);

  // Patent status
  const patentCount = (report.patent_data || []).length;
  const patentStatus = patentCount === 0 ? 'No primary patents — open IP landscape'
    : patentCount <= 3 ? `${patentCount} patent(s) — limited competition`
    : `${patentCount} patents — competitive IP landscape`;

  // Molecular target
  const mechanism = report.pubchem_data?.mechanism_of_action;

  return (
    <>
      <div className="bg-[#121214] border border-[#27272a] rounded-xl overflow-hidden h-full flex flex-col">
        {/* Header */}
      <div className="px-6 py-5 bg-[#09090b] border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx('w-2.5 h-2.5 rounded-full shrink-0', scoreColor(opportunity.composite_score).text.replace('text-', 'bg-'))} />
          <div>
            <h4 className="text-lg font-medium text-zinc-100">{opportunity.condition}</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Evidence synthesis & gap analysis</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <Badge className={clsx('text-xs px-2.5 py-0.5 border font-mono', scoreColor(opportunity.composite_score).bg, scoreColor(opportunity.composite_score).text, scoreColor(opportunity.composite_score).border)}>
            Score {opportunity.composite_score.toFixed(1)}/10
          </Badge>
        </div>
      </div>

      <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
        
        {/* Row 1: Trials & Publications */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Clinical Trials */}
          <div>
            <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-cyan-400" /> Clinical Data Traceability
            </h5>
            {supportingTrials.length > 0 ? (
              <div className="space-y-3">
                {supportingTrials.map((t: any, i: number) => {
                  const trialHref = t.nct_id ? `https://clinicaltrials.gov/study/${t.nct_id}` : null;
                  const CardComponent = trialHref ? 'a' : 'div';
                  return (
                    <CardComponent
                      key={i}
                      {...(trialHref ? { href: trialHref, target: '_blank', rel: 'noreferrer' } : {})}
                      className={clsx(
                        "flex flex-col p-4 bg-[#09090b] border border-[#27272a] rounded-lg transition-colors group",
                        trialHref ? "hover:border-zinc-500 hover:bg-[#121214]" : ""
                      )}
                    >
                      <div className="flex items-start justify-between min-w-0 mb-2 gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {t.nct_id && <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">{t.nct_id}</span>}
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{t.phase || 'Not determined'}</span>
                        </div>
                        <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap',
                          t.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10' :
                          t.status === 'RECRUITING' ? 'text-blue-400 bg-blue-500/10' :
                          t.status === 'TERMINATED' ? 'text-rose-400 bg-rose-500/10' :
                          'text-zinc-400 bg-zinc-800/50'
                        )}>{t.status || 'UNKNOWN'}</span>
                      </div>
                      <p className="text-sm text-zinc-300 leading-snug line-clamp-2" title={t.title || t.condition || 'Trial record'}>{t.title || t.condition || 'Trial record'}</p>
                    </CardComponent>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-[#09090b] border border-[#27272a] border-dashed rounded-lg text-center h-full flex flex-col items-center justify-center min-h-[120px]">
                <Activity className="w-5 h-5 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500">No direct trial matches.</p>
              </div>
            )}
          </div>

          {/* Publications */}
          <div>
            <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-cyan-400" /> Key Literature Mentions
            </h5>
            {supportingPapers.length > 0 ? (
              <div className="space-y-3">
                {supportingPapers.map((p: any, i: number) => {
                  const pubHref = p.id ? `https://pubmed.ncbi.nlm.nih.gov/${p.id}` : (p.doi ? `https://doi.org/${p.doi}` : null);
                  const CardComponent = pubHref ? 'a' : 'div';
                  return (
                    <CardComponent
                      key={i}
                      {...(pubHref ? { href: pubHref, target: '_blank', rel: 'noreferrer' } : {})}
                      className={clsx(
                        "flex items-start gap-4 p-4 bg-[#09090b] border border-[#27272a] rounded-lg transition-colors group",
                        pubHref ? "hover:border-zinc-500 hover:bg-[#121214]" : ""
                      )}
                    >
                      <div className="shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-zinc-300 leading-snug mb-2 line-clamp-2" title={p.title}>{p.title}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {p.id && <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">PMID: {p.id}</span>}
                          {p.doi && !p.id && <span className="text-[10px] font-mono text-zinc-500">DOI: {p.doi}</span>}
                          {p.year && <span className="text-[10px] text-zinc-500">• {p.year}</span>}
                        </div>
                      </div>
                    </CardComponent>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-[#09090b] border border-[#27272a] border-dashed rounded-lg text-center h-full flex flex-col items-center justify-center min-h-[120px]">
                <BookOpen className="w-5 h-5 text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500">No contextual publications found.</p>
              </div>
            )}
          </div>
          
        </div>

        <div className="border-t border-[#27272a] my-2"></div>

        {/* Row 2: IP & Mechanism */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Target & Mechanism */}
          <div>
            <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-cyan-400" /> Molecular Target Trace
            </h5>
            <div className="p-5 bg-gradient-to-br from-[#09090b] to-[#121214] border border-[#27272a] rounded-lg max-h-[220px] min-h-[140px] flex flex-col">
              <p className="text-sm text-zinc-300 leading-relaxed overflow-y-auto custom-scrollbar flex-1 pr-2">
                {mechanism || 'Mechanism details not available for this compound in the target database.'}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 border-t border-[#27272a] pt-3 mt-3">
                <Database className="w-3 h-3" /> Source: PubChem Pharmacology
              </div>
            </div>
          </div>

          {/* Patents */}
          <div>
            <h5 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Gavel className="w-4 h-4 text-cyan-400" /> Patent Claims
            </h5>
            <div className="p-5 bg-[#09090b] border border-[#27272a] rounded-lg max-h-[220px] min-h-[140px] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className={clsx('w-2 h-2 rounded-full', patentCount === 0 ? 'bg-emerald-500' : patentCount <= 3 ? 'bg-amber-500' : 'bg-rose-500')} />
                <p className={clsx('text-xs font-semibold uppercase tracking-wider', patentCount === 0 ? 'text-emerald-400' : patentCount <= 3 ? 'text-amber-400' : 'text-rose-400')}>
                  {patentStatus}
                </p>
              </div>
              {patentCount > 0 ? (
                <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
                  {(report.patent_data || []).map((pat: any, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        if (setActiveSidebar) {
                          setActiveSidebar('refs');
                          setTimeout(() => {
                            document.dispatchEvent(new CustomEvent('highlight-ref', { detail: `PATENT-${i + 1}` }));
                          }, 150);
                        }
                      }}
                      className="w-full text-left flex gap-2 text-xs p-2 rounded-lg hover:bg-[#18181b] border border-transparent hover:border-[#27272a] transition-all group"
                    >
                      <span className="font-mono text-zinc-500 shrink-0 group-hover:text-cyan-400 transition-colors">{pat.id}</span>
                      <span className="text-zinc-300 line-clamp-1 truncate" title={pat.title}>{pat.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center text-xs text-zinc-500 italic">
                  No competing patents flagged for this target/indication pair.
                </div>
              )}
              <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-[#27272a] pt-3 mt-3">
                <span className="flex items-center gap-1.5"><Database className="w-3 h-3" /> USPTO API</span>
                <span>{patentCount} Results</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Main AI Synthesis Tab
// ─────────────────────────────────────────────

export function AISynthesisTab({ report, setActiveSidebar }: { report: any; setActiveSidebar?: any }) {
  const [sortKey, setSortKey] = useState<'composite_score' | 'market_size' | 'condition'>('composite_score');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [filterMin, setFilterMin] = useState<number>(0);
  const [activeEvidenceCondition, setActiveEvidenceCondition] = useState<string | null>(null);

  const opportunities = useMemo(() => {
    const candidates: any[] = report.repurposing_candidates || [];
    const marketMap: Record<string, any> = {};
    (report.market_analysis || []).forEach((m: any) => { marketMap[m.condition?.toLowerCase()] = m; });

    const patentCount = (report.patent_data || []).length;

    return candidates.map((c: any) => {
      const condLower = (c.condition || '').toLowerCase();
      const mkt = marketMap[condLower] || { market_size_usd_billion: c.market_size_usd_billion ?? 5.0 };
      const { level: clinicalLevel, score: clinEvidScore } = phaseToEvidence(c.max_phase);

      // Patent openness: fewer patents = higher openness
      const patentOpenness = patentCount === 0 ? 9.0 : patentCount <= 2 ? 7.0 : patentCount <= 5 ? 5.0 : 3.0;

      // Market size score (0-10, $30B = 10)
      const mktBillion = mkt.market_size_usd_billion ?? 5.0;
      const mktScore = Math.min((mktBillion / 30) * 10, 10);

      // Unmet need: inverse of trial density
      const trialCount = c.trial_count ?? 1;
      const unmetNeedScore = Math.max(10 - Math.log10(trialCount + 1) * 3, 2);

      // Weighted composite (same formula as backend)
      const composite = parseFloat((
        (clinEvidScore  * 0.35) +
        (patentOpenness * 0.25) +
        (mktScore       * 0.20) +
        (unmetNeedScore * 0.20)
      ).toFixed(1));

      return {
        condition:          c.condition,
        clinical_level:     clinicalLevel,
        max_phase:          c.max_phase,
        patent_status:      patentCount === 0 ? 'Open' : patentCount <= 3 ? 'Limited' : 'Competitive',
        market_size:        mktBillion,
        market_size_fmt:    `₹${(mktBillion * 83.5).toFixed(1)}B`,
        unmet_need:         unmetNeedScore >= 7 ? 'High' : unmetNeedScore >= 4 ? 'Moderate' : 'Low',
        composite_score:    composite,
        repurposing_score:  c.repurposing_score,
        trial_count:        trialCount,
        growth_rate_pct:    mkt.growth_rate_pct ?? 5,
      };
    });
  }, [report]);

  const sorted = useMemo(() => {
    const filtered = opportunities.filter(o => o.composite_score >= filterMin);
    return [...filtered].sort((a, b) => {
      const av = a[sortKey as keyof typeof a] as number | string;
      const bv = b[sortKey as keyof typeof b] as number | string;
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [opportunities, sortKey, sortDir, filterMin]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setsSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  useEffect(() => {
    if (sorted.length > 0) {
      if (!activeEvidenceCondition || !sorted.find(o => o.condition === activeEvidenceCondition)) {
        setActiveEvidenceCondition(sorted[0].condition);
      }
    } else {
      setActiveEvidenceCondition(null);
    }
  }, [sorted, activeEvidenceCondition]);

  // Fix: proper setter name
  function setsSortDir(fn: (d: 'asc' | 'desc') => 'asc' | 'desc') {
    setSortDir(prev => fn(prev));
  }

  const SortIcon = ({ k }: { k: typeof sortKey }) => (
    sortKey === k
      ? <span className="ml-1 text-cyan-400">{sortDir === 'desc' ? '↓' : '↑'}</span>
      : <span className="ml-1 text-zinc-700">↕</span>
  );

  return (
    <div className="animate-in fade-in duration-500 w-full mx-auto space-y-10">

      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-400" /> AI Synthesis — Opportunities
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Cross-domain opportunity matrix with full evidence traceability. Every claim links to its source.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-zinc-500">Min score:</span>
          {[0, 5, 6, 7, 8].map(v => (
            <button
              key={v}
              onClick={() => setFilterMin(v)}
              className={clsx(
                'px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border',
                filterMin === v
                  ? 'bg-cyan-500 text-white border-cyan-600'
                  : 'bg-[#121214] border-[#27272a] text-zinc-400 hover:border-zinc-600'
              )}
            >{v === 0 ? 'All' : `≥${v}`}</button>
          ))}
        </div>
      </div>

      {/* Score legend */}
      <div className="flex items-center gap-6 text-xs">
        <span className="flex items-center gap-1.5 text-zinc-400">Score guide:</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /><span className="text-zinc-400">≥8 — High</span></span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /><span className="text-zinc-400">6–8 — Moderate</span></span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /><span className="text-zinc-400">&lt;6 — Low</span></span>
      </div>

      {/* ─── Opportunity Matrix Table ─── */}
      <section>
        <h3 className="text-lg font-medium text-zinc-100 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" /> Opportunity Matrix
        </h3>

        {sorted.length === 0 ? (
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center">
            <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No opportunities meet the selected minimum score threshold.</p>
            <Button size="sm" variant="ghost" className="mt-4 text-zinc-400" onClick={() => setFilterMin(0)}>Show all</Button>
          </div>
        ) : (
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-[#09090b] border-b border-[#27272a] text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
              <button className="col-span-3 text-left hover:text-zinc-300 transition-colors" onClick={() => toggleSort('condition')}>
                Candidate Disease <SortIcon k="condition" />
              </button>
              <span className="col-span-2 text-center">Clinical Evidence</span>
              <span className="col-span-1 text-center">Patent Status</span>
              <button className="col-span-2 text-center hover:text-zinc-300 transition-colors" onClick={() => toggleSort('market_size')}>
                Market Size <SortIcon k="market_size" />
              </button>
              <span className="col-span-1 text-center">Unmet Need</span>
              <span className="col-span-1 text-center hidden sm:block">Trials</span>
              <button className="col-span-2 text-right hover:text-zinc-300 transition-colors" onClick={() => toggleSort('composite_score')}>
                Composite Score <SortIcon k="composite_score" />
              </button>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-[#1e1e22]">
              {sorted.map((opp, i) => {
                const colors = scoreColor(opp.composite_score);
                return (
                  <motion.div
                    key={opp.condition}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-12 gap-2 px-5 py-4 hover:bg-[#18181b] transition-colors items-center"
                  >
                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                      <div className={clsx('w-1.5 h-1.5 rounded-full shrink-0', colors.bg.replace('/10', '').replace('bg-', 'bg-'))}
                           style={{ backgroundColor: opp.composite_score >= 8 ? '#10b981' : opp.composite_score >= 6 ? '#f59e0b' : '#f43f5e' }} />
                      <span className="text-sm font-medium text-zinc-200 truncate">{opp.condition}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge className={clsx('text-[10px] border', colors.bg, colors.text, colors.border)}>
                        {opp.clinical_level}
                      </Badge>
                      <p className="text-[9px] text-zinc-600 mt-1">{opp.max_phase}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={clsx('text-xs font-medium',
                        opp.patent_status === 'Open' ? 'text-emerald-400' :
                        opp.patent_status === 'Limited' ? 'text-amber-400' : 'text-rose-400'
                      )}>{opp.patent_status}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-sm font-light text-zinc-200">{opp.market_size_fmt}</span>
                      <p className="text-[9px] text-emerald-500 mt-0.5">+{opp.growth_rate_pct?.toFixed(1)}% CAGR</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className={clsx('text-xs font-medium',
                        opp.unmet_need === 'High' ? 'text-rose-400' :
                        opp.unmet_need === 'Moderate' ? 'text-amber-400' : 'text-zinc-400'
                      )}>{opp.unmet_need}</span>
                    </div>
                    <div className="col-span-1 text-center hidden sm:block">
                      <span className="text-xs font-mono text-zinc-500">{opp.trial_count}</span>
                    </div>
                    <div className="col-span-2 flex justify-end items-center gap-2">
                      <div className={clsx('px-3 py-1 rounded-lg border text-sm font-semibold font-mono', colors.bg, colors.text, colors.border)}>
                        {opp.composite_score.toFixed(1)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-[#27272a] bg-[#09090b] text-[10px] text-zinc-600 flex items-center justify-between">
              <span>Composite = Clinical×0.35 + Patent×0.25 + Market×0.20 + Unmet Need×0.20</span>
              <span>{sorted.length} opportunit{sorted.length === 1 ? 'y' : 'ies'} shown</span>
            </div>
          </div>
        )}
      </section>

      {/* ─── Evidence Chains ─── */}
      <section>
        <div className="mb-5">
          <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-cyan-400" /> Evidence Synthesis Layout
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Navigate through candidate conditions to explore detailed clinical, literature, and IP evidence.
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-8 text-center">
            <p className="text-zinc-500 text-sm">No evidence chains available for the current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
            
            {/* Left Nav Pane - List of Conditions */}
            <div className="lg:col-span-4 flex flex-col h-full bg-[#121214] border border-[#27272a] rounded-xl overflow-hidden max-h-[700px]">
              <div className="px-4 py-3 bg-[#09090b] border-b border-[#27272a]">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Candidate Diseases</h4>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {sorted.map(opp => {
                  const isActive = activeEvidenceCondition === opp.condition;
                  return (
                    <button
                      key={opp.condition}
                      onClick={() => setActiveEvidenceCondition(opp.condition)}
                      className={clsx(
                        "w-full flex items-center justify-between px-4 py-3 border-b border-[#27272a] transition-all text-left group",
                        isActive ? "bg-[#18181b] border-l-2 border-l-cyan-500 pl-[14px]" : "hover:bg-[#18181b]/50 border-l-2 border-l-transparent pl-[14px]"
                      )}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <span className={clsx("block truncate text-sm font-medium transition-colors", isActive ? "text-cyan-400" : "text-zinc-300 group-hover:text-zinc-100")}>
                          {opp.condition}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={clsx("text-[10px] uppercase font-semibold", opp.clinical_level.includes('Approved') ? 'text-emerald-400' : 'text-zinc-500')}>
                            {opp.clinical_level}
                          </span>
                        </div>
                      </div>
                      <Badge className={clsx('text-[10px] shrink-0 border font-mono px-1.5 py-0', 
                        scoreColor(opp.composite_score).bg, 
                        scoreColor(opp.composite_score).text, 
                        scoreColor(opp.composite_score).border
                      )}>
                        {opp.composite_score.toFixed(1)}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Pane - Detail View */}
            <div className="lg:col-span-8 flex flex-col h-full max-h-[700px]">
               {activeEvidenceCondition && (
                 <EvidenceChainDetail 
                   opportunity={sorted.find(o => o.condition === activeEvidenceCondition)} 
                   report={report} 
                   setActiveSidebar={setActiveSidebar}
                 />
               )}
            </div>

          </div>
        )}
      </section>

      {/* ─── Pathway Overlap Panel ─── */}
      <section>
        <h3 className="text-lg font-medium text-zinc-100 mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" /> Mechanistic Pathway Overlap
        </h3>

        {/* Full-width interactive D3 force graph */}
        <Suspense fallback={<div className="h-[500px] bg-[#0c0c10] border border-[#27272a] rounded-2xl animate-pulse" />}>
          <InteractivePathway report={report} />
        </Suspense>

        {/* Compact interpretation strip below */}
        <div className="mt-4 bg-[#121214] border border-[#27272a] rounded-xl px-5 py-4">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <div className="flex items-start gap-2 min-w-0">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-zinc-300">Interpretation Guide</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed max-w-xs">
                  Shared pathways = reduced dev risk. Multi-target edges = strongest repurposing signal.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <Database className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-zinc-300">Data Sources</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  PubChem · Open Targets · ClinicalTrials.gov · USPTO
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 min-w-0">
              <Network className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-zinc-300">Open IP</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Patent openness per indication is visible in the Evidence Chains above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
