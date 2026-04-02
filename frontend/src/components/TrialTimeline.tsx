import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Trial {
  nctId?: string;
  title?: string;
  status?: string;
  phase?: string;
  condition?: string;
  startDate?: string | null;
  completionDate?: string | null;
  enrollmentCount?: number | null;
}

interface TrialTimelineProps {
  trials: Trial[];
  drugName: string;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  COMPLETED:              { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', text: 'text-emerald-400', fill: '#10b981' },
  RECRUITING:             { bg: 'bg-blue-500/15',    border: 'border-blue-500/40',    text: 'text-blue-400',    fill: '#3b82f6' },
  ACTIVE_NOT_RECRUITING:  { bg: 'bg-amber-500/15',   border: 'border-amber-500/40',   text: 'text-amber-400',   fill: '#f59e0b' },
  'ACTIVE, NOT RECRUITING': { bg: 'bg-amber-500/15', border: 'border-amber-500/40',   text: 'text-amber-400',   fill: '#f59e0b' },
  TERMINATED:             { bg: 'bg-rose-500/15',    border: 'border-rose-500/40',     text: 'text-rose-400',    fill: '#f43f5e' },
  WITHDRAWN:              { bg: 'bg-zinc-500/15',    border: 'border-zinc-500/40',     text: 'text-zinc-400',    fill: '#71717a' },
  SUSPENDED:              { bg: 'bg-orange-500/15',  border: 'border-orange-500/40',   text: 'text-orange-400',  fill: '#f97316' },
  NOT_YET_RECRUITING:     { bg: 'bg-violet-500/15',  border: 'border-violet-500/40',   text: 'text-violet-400',  fill: '#8b5cf6' },
  UNKNOWN:                { bg: 'bg-zinc-500/15',    border: 'border-zinc-500/40',     text: 'text-zinc-500',    fill: '#52525b' },
};

function getStatusStyle(status: string) {
  const key = (status || 'UNKNOWN').toUpperCase().replace(/_/g, ' ');
  // try exact, then partial match
  return STATUS_COLORS[key]
    || Object.entries(STATUS_COLORS).find(([k]) => key.includes(k))?.[1]
    || STATUS_COLORS.UNKNOWN;
}

const PHASE_ORDER: Record<string, number> = {
  'phase 4': 5, 'phase 3': 4, 'phase 2': 3, 'phase 1': 2,
  'early phase 1': 1, 'not applicable': 0, 'unknown': 0,
};

function phaseRank(phase: string): number {
  return PHASE_ORDER[(phase || '').toLowerCase()] ?? 0;
}

function parseDate(d: string | null | undefined): Date | null {
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function TrialTimeline({ trials, drugName }: TrialTimelineProps) {
  const [hoveredTrial, setHoveredTrial] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Determine if we have enough date data for a Gantt chart
  const trialsWithDates = useMemo(() =>
    trials.filter(t => parseDate(t.startDate) != null),
    [trials]
  );

  const hasGanttData = trialsWithDates.length >= 2;

  if (trials.length === 0) return null;

  // If we have enough dates, render the Gantt chart
  if (hasGanttData) return <GanttView trials={trials} drugName={drugName} />;

  // Fallback: Phase-ladder view
  return <PhaseLadderView trials={trials} drugName={drugName} />;
}

/* ─── Gantt Chart View ─── */
function GanttView({ trials, drugName }: TrialTimelineProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const now = new Date();

  // Sort by start date
  const sorted = useMemo(() =>
    [...trials]
      .filter(t => parseDate(t.startDate))
      .sort((a, b) => (parseDate(a.startDate)!.getTime()) - (parseDate(b.startDate)!.getTime())),
    [trials]
  );

  const visible = showAll ? sorted : sorted.slice(0, 8);

  // Compute time range
  const allDates = sorted.flatMap(t => [parseDate(t.startDate), parseDate(t.completionDate) || now]).filter(Boolean) as Date[];
  const minTime = Math.min(...allDates.map(d => d.getTime()));
  const maxTime = Math.max(...allDates.map(d => d.getTime()), now.getTime());
  const range = maxTime - minTime || 1;

  // Year markers
  const startYear = new Date(minTime).getFullYear();
  const endYear = new Date(maxTime).getFullYear();
  const yearMarkers: { year: number; pct: number }[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const t = new Date(y, 0, 1).getTime();
    if (t >= minTime && t <= maxTime) {
      yearMarkers.push({ year: y, pct: ((t - minTime) / range) * 100 });
    }
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Clinical Trial Timeline
        </h4>
        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 bg-zinc-800/50">
          {sorted.length} trial{sorted.length > 1 ? 's' : ''} with dates
        </Badge>
      </div>

      {/* Timeline header with year marks */}
      <div className="relative h-6 mb-2 ml-[180px]">
        {yearMarkers.map(({ year, pct }) => (
          <div key={year} className="absolute top-0 flex flex-col items-center" style={{ left: `${pct}%` }}>
            <div className="w-px h-3 bg-zinc-700" />
            <span className="text-[10px] text-zinc-500 mt-0.5">{year}</span>
          </div>
        ))}
      </div>

      {/* Trial rows */}
      <div className="space-y-2">
        {visible.map((trial, i) => {
          const start = parseDate(trial.startDate)!;
          const end = parseDate(trial.completionDate) || now;
          const leftPct = ((start.getTime() - minTime) / range) * 100;
          const widthPct = Math.max(1, ((end.getTime() - start.getTime()) / range) * 100);
          const style = getStatusStyle(trial.status || 'UNKNOWN');

          return (
            <motion.div
              key={trial.nctId || i}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-0 group"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Label */}
              <div className="w-[180px] shrink-0 pr-3 text-right">
                <p className="text-xs text-zinc-300 truncate font-medium">{trial.condition || 'Unknown'}</p>
                <p className="text-[10px] text-zinc-600 truncate">{trial.phase || ''}</p>
              </div>

              {/* Bar track */}
              <div className="flex-1 relative h-8 bg-zinc-900/60 rounded-lg overflow-hidden border border-zinc-800/40">
                {/* Year grid lines */}
                {yearMarkers.map(({ year, pct }) => (
                  <div key={year} className="absolute top-0 bottom-0 w-px bg-zinc-800/60" style={{ left: `${pct}%` }} />
                ))}

                {/* Trial bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ delay: i * 0.06 + 0.2, duration: 0.6, ease: 'easeOut' }}
                  className={`absolute top-1 bottom-1 rounded-md ${style.bg} ${style.border} border cursor-pointer transition-all group-hover:brightness-125`}
                  style={{ left: `${leftPct}%` }}
                />

                {/* Phase dot */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 z-10"
                  style={{ left: `calc(${leftPct}% - 5px)`, backgroundColor: style.fill, borderColor: '#0a0a0b' }}
                />

                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredIdx === i && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-xl p-3 shadow-2xl min-w-[240px] pointer-events-none"
                    >
                      <p className="text-xs font-medium text-zinc-100 mb-1.5 leading-snug">{trial.title || 'Untitled'}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`text-[10px] ${style.bg} ${style.text} ${style.border} border py-0`}>{trial.status}</Badge>
                        {trial.nctId && (
                          <a href={`https://clinicaltrials.gov/study/${trial.nctId}`} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5 pointer-events-auto">
                            {trial.nctId} <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-500 mt-1">
                        <span>{formatDate(start)} → {parseDate(trial.completionDate) ? formatDate(end) : 'Ongoing'}</span>
                        {trial.enrollmentCount && (
                          <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {trial.enrollmentCount}</span>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Show more / less */}
      {sorted.length > 8 && (
        <button onClick={() => setShowAll(s => !s)}
          className="mt-4 mx-auto flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          {showAll ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {sorted.length} trials</>}
        </button>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-zinc-800/50 justify-center">
        {['COMPLETED', 'RECRUITING', 'ACTIVE_NOT_RECRUITING', 'TERMINATED', 'WITHDRAWN'].map(s => {
          const st = getStatusStyle(s);
          return (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: st.fill }} />
              <span className="text-[10px] text-zinc-500 capitalize">{s.toLowerCase().replace(/_/g, ' ')}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Phase Ladder Fallback View ─── */
function PhaseLadderView({ trials, drugName }: TrialTimelineProps) {
  // Group trials by phase
  const groups = useMemo(() => {
    const map = new Map<string, Trial[]>();
    const order = ['Phase 4', 'Phase 3', 'Phase 2', 'Phase 1', 'Early Phase 1', 'Not Applicable', 'Unknown'];
    trials.forEach(t => {
      const p = t.phase || 'Unknown';
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(t);
    });
    return order
      .filter(p => map.has(p))
      .map(p => ({ phase: p, trials: map.get(p)! }))
      .concat(
        [...map.entries()]
          .filter(([p]) => !order.includes(p))
          .map(([phase, trials]) => ({ phase, trials }))
      );
  }, [trials]);

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Clinical Trial Phases
        </h4>
        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 bg-zinc-800/50">
          {trials.length} trial{trials.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="relative space-y-0">
        {groups.map((group, gi) => (
          <motion.div
            key={group.phase}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: gi * 0.1 }}
            className="flex items-start gap-4"
          >
            {/* Phase column */}
            <div className="w-28 shrink-0 pt-3 text-right">
              <Badge variant="outline" className="text-[10px] font-mono border-cyan-800/40 text-cyan-400 bg-cyan-500/5">
                {group.phase}
              </Badge>
            </div>

            {/* Connector line */}
            <div className="relative flex flex-col items-center pt-3">
              <div className="w-3 h-3 rounded-full border-2 border-cyan-500 bg-cyan-500/20 z-10" />
              {gi < groups.length - 1 && (
                <div className="w-px flex-1 bg-zinc-800 min-h-[40px]" />
              )}
            </div>

            {/* Trial cards */}
            <div className="flex-1 pb-4 pt-1">
              <div className="flex flex-wrap gap-2">
                {group.trials.map((trial, ti) => {
                  const style = getStatusStyle(trial.status || 'UNKNOWN');
                  return (
                    <div key={trial.nctId || ti}
                      className={`${style.bg} ${style.border} border rounded-lg px-3 py-2 text-xs max-w-[200px] hover:brightness-125 transition-all`}>
                      <p className="text-zinc-200 font-medium truncate">{trial.condition || 'Unknown'}</p>
                      <p className={`text-[10px] ${style.text} mt-0.5`}>{trial.status}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
