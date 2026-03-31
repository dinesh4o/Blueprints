import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Scale, CheckCircle, AlertTriangle, Clock, FileText, Zap, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { clsx } from 'clsx';

interface PathwayData {
  clinicalData: any[];
  regulatoryData: any;
  repurposingCandidates: any[];
  phoenixScore: number | null;
  targetData: any;
  molecule: string;
}

interface Pathway {
  name: string;
  code: string;
  probability: number;
  timelineYears: string;
  description: string;
  advantages: string[];
  requirements: string[];
  icon: typeof Scale;
}

export default function RegulatoryPathway({ clinicalData, regulatoryData, repurposingCandidates, phoenixScore, targetData, molecule }: PathwayData) {
  const analysis = useMemo(() => {
    const trials = Array.isArray(clinicalData) ? clinicalData : [];
    const cands = Array.isArray(repurposingCandidates) ? repurposingCandidates : [];
    const reg = regulatoryData || {};
    const td = targetData || {};

    // Signals for pathway determination
    const hasPhase3 = trials.some(t => t.phase?.includes('3'));
    const hasPhase2 = trials.some(t => t.phase?.includes('2'));
    const trialCount = trials.length;
    const hasOrphanIndication = cands.some((c: any) =>
      /rare|orphan|ultra-rare/i.test(c.condition || '') || (c.prevalence && c.prevalence < 200000)
    );
    const isApproved = reg.approved_indications?.length > 0;
    const hasBoxWarnings = !!reg.warnings;
    const hasWithdrawn = td.hasBeenWithdrawn === true;
    const diseaseCount = td.diseases?.length || 0;
    const score = phoenixScore ?? 0;

    // Determine pathways with probability
    const pathways: Pathway[] = [];

    // 505(b)(2) — Most common for repurposing already-approved drugs
    if (isApproved) {
      pathways.push({
        name: '505(b)(2) New Drug Application',
        code: '505(b)(2)',
        probability: Math.min(95, 60 + (hasPhase2 ? 20 : 0) + (trialCount > 3 ? 10 : 0) + (score > 7 ? 5 : 0)),
        timelineYears: '2-4',
        description: `${molecule} is already FDA-approved, making 505(b)(2) the most efficient path. This allows reliance on existing safety/efficacy data from the original approval while supplementing with new indication-specific studies.`,
        advantages: [
          'Leverages existing safety data — shorter clinical program',
          'Can reference published literature and prior FDA findings',
          'Lower development costs vs. full NDA ($50-200M vs. $1-2B)',
          'Faster timeline — typically 2-4 years vs. 8-12 years'
        ],
        requirements: [
          'Phase 2 or Phase 3 trial for new indication',
          'Bridging bioequivalence studies if reformulation needed',
          'Updated labeling with new indication safety data'
        ],
        icon: FileText
      });
    }

    // Orphan Drug Designation
    if (hasOrphanIndication || diseaseCount > 5) {
      pathways.push({
        name: 'Orphan Drug Designation',
        code: 'ODD',
        probability: hasOrphanIndication ? 75 : 35,
        timelineYears: '3-5',
        description: `Potential orphan drug pathway if targeting a rare disease (< 200,000 US patients). Provides 7 years market exclusivity, tax credits for clinical trial costs, and FDA fee waivers.`,
        advantages: [
          '7 years market exclusivity upon approval',
          '25% tax credit on qualified clinical trial costs',
          'FDA fee waivers (saves ~$3M)',
          'Smaller trial populations accepted'
        ],
        requirements: [
          'Demonstrate disease affects < 200,000 US patients',
          'Evidence of plausible therapeutic benefit',
          'Orphan Drug Designation application to OOPD'
        ],
        icon: Shield
      });
    }

    // Breakthrough Therapy
    if (score >= 7 && hasPhase2) {
      pathways.push({
        name: 'Breakthrough Therapy Designation',
        code: 'BTD',
        probability: Math.min(80, 40 + (score >= 8 ? 20 : 0) + (hasPhase3 ? 15 : 0) + (trialCount > 5 ? 5 : 0)),
        timelineYears: '2-3',
        description: `Strong viability score (${score.toFixed(1)}/10) and existing clinical evidence suggest ${molecule} may demonstrate substantial improvement over existing therapies. Breakthrough designation enables intensive FDA guidance and rolling review.`,
        advantages: [
          'Intensive FDA guidance on drug development program',
          'Rolling review — submit sections as completed',
          'Organizational commitment from senior FDA managers',
          'Potential for accelerated approval'
        ],
        requirements: [
          'Preliminary clinical evidence of substantial improvement',
          'Must be for serious/life-threatening condition',
          'Comparison against available therapies required'
        ],
        icon: Zap
      });
    }

    // Accelerated Approval
    if (score >= 6 && (hasPhase2 || hasPhase3)) {
      pathways.push({
        name: 'Accelerated Approval',
        code: 'AA',
        probability: Math.min(70, 30 + (hasPhase3 ? 25 : 0) + (score >= 8 ? 10 : 0) + (hasOrphanIndication ? 5 : 0)),
        timelineYears: '1-3',
        description: `Based on surrogate endpoint data from existing trials. Grants approval with requirement for post-marketing confirmatory trials. Viable if ${molecule} shows effect on a surrogate endpoint reasonably likely to predict clinical benefit.`,
        advantages: [
          'Approval based on surrogate endpoints',
          'Earlier market access for serious conditions',
          'Can proceed with smaller, shorter trials'
        ],
        requirements: [
          'Surrogate endpoint reasonably likely to predict benefit',
          'Post-marketing confirmatory trial commitment',
          'Serious/life-threatening condition with unmet need'
        ],
        icon: Clock
      });
    }

    // Standard NDA fallback
    if (pathways.length === 0 || !isApproved) {
      pathways.push({
        name: 'Standard NDA (Full Development)',
        code: 'NDA',
        probability: Math.min(60, 20 + (trialCount * 3) + (score > 5 ? 15 : 0)),
        timelineYears: '6-12',
        description: `Full new drug application pathway requiring comprehensive preclinical and clinical development. ${isApproved ? 'Consider 505(b)(2) as a faster alternative.' : 'Required since this compound lacks prior FDA approval.'}`,
        advantages: [
          'No dependency on prior approvals',
          'Complete control over intellectual property',
          'Broadest label claims possible'
        ],
        requirements: [
          'Complete preclinical toxicology package',
          'Phase 1, 2, and 3 clinical trials',
          'Full CMC (Chemistry, Manufacturing, Controls) data'
        ],
        icon: Scale
      });
    }

    // Sort by probability
    pathways.sort((a, b) => b.probability - a.probability);

    return { pathways, isApproved, hasWithdrawn, hasBoxWarnings };
  }, [clinicalData, regulatoryData, repurposingCandidates, phoenixScore, targetData, molecule]);

  const { pathways, isApproved, hasWithdrawn, hasBoxWarnings } = analysis;
  const recommended = pathways[0];

  return (
    <div className="mb-10">
      <h3 className="text-xl font-medium text-zinc-100 mb-6 flex items-center gap-2">
        <Scale className="w-5 h-5 text-cyan-400" /> Regulatory Pathway Analysis
      </h3>

      {/* Warnings */}
      {hasWithdrawn && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">This compound has been withdrawn in at least one market. Regulatory pathway assessment should account for prior withdrawal reasons.</p>
        </div>
      )}

      {/* Recommended Pathway */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 border border-cyan-800/40 rounded-xl p-6 mb-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <recommended.icon size={20} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-zinc-100">{recommended.name}</h4>
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px]">RECOMMENDED</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Feasibility: <span className="text-cyan-400 font-semibold">{recommended.probability}%</span></span>
                <span className="text-[10px] text-zinc-500">•</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Timeline: <span className="text-zinc-300 font-semibold">{recommended.timelineYears} years</span></span>
              </div>
            </div>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed mb-4">{recommended.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mb-2">Key Advantages</p>
              <div className="space-y-1.5">
                {recommended.advantages.map((a, i) => (
                  <div key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                    <CheckCircle size={11} className="text-emerald-500 mt-0.5 shrink-0" /> {a}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold mb-2">Requirements</p>
              <div className="space-y-1.5">
                {recommended.requirements.map((r, i) => (
                  <div key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-1.5 shrink-0" /> {r}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feasibility bar */}
          <div className="mt-5 pt-4 border-t border-cyan-800/30">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-2">
              <span>Regulatory Feasibility</span>
              <span className="text-cyan-400 font-semibold">{recommended.probability}%</span>
            </div>
            <div className="h-2 bg-zinc-900/60 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${recommended.probability}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alternative Pathways */}
      {pathways.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pathways.slice(1).map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-900/80 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center">
                  <p.icon size={16} className="text-zinc-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">{p.name}</h4>
                  <span className="text-[10px] text-zinc-500">{p.timelineYears} years • {p.probability}% feasibility</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{p.description}</p>
              <div className="mt-3 h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.probability}%` }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                  className={clsx("h-full rounded-full",
                    p.probability >= 60 ? 'bg-emerald-500/70' : p.probability >= 40 ? 'bg-amber-500/70' : 'bg-zinc-600'
                  )}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
