import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, Database, FlaskConical, FileText, Shield, TrendingUp, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface EvidenceStep {
  source: string;
  icon: React.ReactNode;
  finding: string;
  confidence: number;
  type: 'positive' | 'negative' | 'neutral';
}

interface EvidenceChainProps {
  molecule: string;
  clinicalData?: any[];
  literatureData?: any[];
  regulatoryData?: any;
  pubchemData?: any;
  patentData?: any[];
  phoenixScore?: number;
  repurposingCandidates?: any[];
}

export function AIEvidenceChain({
  molecule,
  clinicalData = [],
  literatureData = [],
  regulatoryData,
  pubchemData,
  patentData = [],
  phoenixScore,
  repurposingCandidates = [],
}: EvidenceChainProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: EvidenceStep[] = [];

  // Build evidence chain from real data
  if (clinicalData.length > 0) {
    const phaseTrials = clinicalData.filter((t: any) => t.phase?.includes('3') || t.phase?.includes('4'));
    steps.push({
      source: 'ClinicalTrials.gov',
      icon: <FlaskConical className="w-4 h-4" />,
      finding: `Found ${clinicalData.length} registered trials${phaseTrials.length > 0 ? `, including ${phaseTrials.length} Phase 3/4 trials` : ''}. ${clinicalData.filter((t: any) => t.status?.includes('RECRUIT')).length} actively recruiting.`,
      confidence: Math.min(0.3 + clinicalData.length * 0.05, 0.95),
      type: clinicalData.length >= 3 ? 'positive' : 'neutral',
    });
  }

  if (literatureData.length > 0) {
    steps.push({
      source: 'PubMed Literature',
      icon: <FileText className="w-4 h-4" />,
      finding: `${literatureData.length} peer-reviewed publications found. Strong literature density suggests active research interest and established mechanism understanding.`,
      confidence: Math.min(0.2 + literatureData.length * 0.03, 0.9),
      type: literatureData.length >= 5 ? 'positive' : 'neutral',
    });
  }

  if (pubchemData) {
    const lipinski = [
      pubchemData.molecular_weight && Number(pubchemData.molecular_weight) <= 500,
      pubchemData.xlogp != null && Number(pubchemData.xlogp) <= 5,
      pubchemData.hbd != null && Number(pubchemData.hbd) <= 5,
      pubchemData.hba != null && Number(pubchemData.hba) <= 10,
    ].filter(Boolean).length;

    steps.push({
      source: 'PubChem Molecular Profile',
      icon: <Database className="w-4 h-4" />,
      finding: `Lipinski Rule of 5: ${lipinski}/4 criteria met.${pubchemData.mechanism_of_action ? ` MOA: ${pubchemData.mechanism_of_action.substring(0, 100)}` : ''} Molecular complexity: ${pubchemData.complexity ? Math.round(Number(pubchemData.complexity)) : 'N/A'}.`,
      confidence: lipinski >= 3 ? 0.75 : 0.45,
      type: lipinski >= 3 ? 'positive' : 'negative',
    });
  }

  if (regulatoryData) {
    const hasWarnings = regulatoryData.boxed_warnings?.length > 0;
    steps.push({
      source: 'FDA Regulatory',
      icon: <Shield className="w-4 h-4" />,
      finding: `${regulatoryData.indications?.length || 0} approved indication(s).${hasWarnings ? ` ⚠ ${regulatoryData.boxed_warnings.length} boxed warning(s) detected.` : ' No boxed warnings.'} Contraindication count: ${regulatoryData.contraindications?.length || 0}.`,
      confidence: hasWarnings ? 0.4 : 0.8,
      type: hasWarnings ? 'negative' : 'positive',
    });
  }

  if (patentData.length >= 0) {
    steps.push({
      source: 'USPTO Patent Landscape',
      icon: <Shield className="w-4 h-4" />,
      finding: patentData.length === 0
        ? 'No active patents found. Open IP landscape suggests strong freedom-to-operate for repurposing.'
        : `${patentData.length} active patent(s) detected. IP constraints may limit repurposing freedom.`,
      confidence: patentData.length === 0 ? 0.85 : 0.4,
      type: patentData.length === 0 ? 'positive' : 'negative',
    });
  }

  if (repurposingCandidates.length > 0) {
    const top = repurposingCandidates[0];
    steps.push({
      source: 'AI Synthesis Engine',
      icon: <Brain className="w-4 h-4" />,
      finding: `Top repurposing candidate: ${top.condition} (Score: ${Number(top.repurposing_score || 0).toFixed(1)}/10, Phase: ${top.max_phase || 'N/A'}). ${repurposingCandidates.length} total opportunities identified.`,
      confidence: Math.min((Number(top.repurposing_score) || 0) / 10, 0.95),
      type: 'positive',
    });
  }

  // Final verdict
  if (phoenixScore != null) {
    steps.push({
      source: 'Phoenix Score Engine',
      icon: <Lightbulb className="w-4 h-4" />,
      finding: `Final Phoenix Score: ${phoenixScore.toFixed(1)}/10. ${phoenixScore >= 7 ? 'Strong repurposing candidate with high viability.' : phoenixScore >= 4 ? 'Moderate potential — further investigation recommended.' : 'Low viability score — significant barriers identified.'}`,
      confidence: phoenixScore / 10,
      type: phoenixScore >= 7 ? 'positive' : phoenixScore >= 4 ? 'neutral' : 'negative',
    });
  }

  const playSequence = () => {
    setIsPlaying(true);
    setActiveStep(-1);
    let current = 0;
    const interval = setInterval(() => {
      setActiveStep(current);
      current++;
      if (current >= steps.length) {
        clearInterval(interval);
        setTimeout(() => setIsPlaying(false), 500);
      }
    }, 1200);
  };

  const typeColors = {
    positive: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    negative: { border: 'border-rose-500/30', bg: 'bg-rose-500/5', text: 'text-rose-400', dot: 'bg-rose-500' },
    neutral: { border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', dot: 'bg-amber-500' },
  };

  if (steps.length === 0) return null;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            AI Evidence Chain
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Step-by-step reasoning for {molecule}</p>
        </div>
        <button
          onClick={playSequence}
          disabled={isPlaying}
          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 disabled:opacity-50 border border-purple-500/30 text-purple-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          {isPlaying ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Brain size={14} />
            </motion.div>
          ) : (
            <Brain size={14} />
          )}
          {isPlaying ? 'Reasoning...' : 'Replay Analysis'}
        </button>
      </div>

      {/* Chain visualization */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-zinc-800" />

        <div className="space-y-3">
          {steps.map((step, i) => {
            const isVisible = activeStep === -1 || i <= activeStep;
            const colors = typeColors[step.type];

            return (
              <motion.div
                key={i}
                initial={activeStep !== -1 ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0.2, x: -20 }}
                transition={{ duration: 0.4, delay: activeStep !== -1 ? 0 : i * 0.1 }}
                className={`relative pl-12 pr-4 py-3 rounded-xl ${colors.bg} ${colors.border} border transition-all duration-300 ${
                  i === activeStep ? 'ring-1 ring-purple-500/30 shadow-lg shadow-purple-500/5' : ''
                }`}
              >
                {/* Node dot */}
                <div className={`absolute left-[12px] top-[18px] w-[15px] h-[15px] rounded-full ${colors.dot} border-2 border-zinc-950 z-10 flex items-center justify-center`}>
                  {step.type === 'positive' ? (
                    <CheckCircle size={8} className="text-zinc-950" />
                  ) : step.type === 'negative' ? (
                    <AlertTriangle size={8} className="text-zinc-950" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                  )}
                </div>

                {/* Content */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${colors.text}`}>{step.icon}</span>
                      <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">{step.source}</span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{step.finding}</p>
                  </div>

                  {/* Confidence meter */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-xs font-mono font-bold ${colors.text}`}>
                      {(step.confidence * 100).toFixed(0)}%
                    </span>
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${colors.dot}`}
                        initial={{ width: 0 }}
                        animate={isVisible ? { width: `${step.confidence * 100}%` } : { width: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Aggregate confidence */}
      {steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between"
        >
          <span className="text-xs text-zinc-500">
            Aggregate Confidence ({steps.filter(s => s.type === 'positive').length} positive / {steps.filter(s => s.type === 'negative').length} negative signals)
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                style={{ width: `${(steps.reduce((s, step) => s + step.confidence, 0) / steps.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-mono font-bold text-purple-400">
              {((steps.reduce((s, step) => s + step.confidence, 0) / steps.length) * 100).toFixed(0)}%
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
