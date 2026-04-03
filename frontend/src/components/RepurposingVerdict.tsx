import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Shield, FlaskConical, FileText, Database, Scale, Zap } from 'lucide-react';

interface VerdictProps {
  molecule: string;
  phoenixScore?: number;
  clinicalData?: any[];
  literatureData?: any[];
  regulatoryData?: any;
  pubchemData?: any;
  patentData?: any[];
  repurposingCandidates?: any[];
  useColor?: boolean;
}

interface Signal {
  label: string;
  icon: React.ReactNode;
  value: number; // 0-1
  detail: string;
  tag: 'strength' | 'risk';
}

export function RepurposingVerdict({
  molecule,
  phoenixScore,
  clinicalData = [],
  literatureData = [],
  regulatoryData,
  pubchemData,
  patentData = [],
  repurposingCandidates = [],
  useColor = true,
}: VerdictProps) {
  const { verdict, verdictColor, verdictIcon, verdictBg, signals, strengths, risks } = useMemo(() => {
    const score = phoenixScore ?? 0;

    // Determine verdict
    let verdict: string;
    let verdictColor: string;
    let verdictIcon: React.ReactNode;
    let verdictBg: string;
    if (score >= 7) {
      verdict = 'Strong Candidate';
      verdictColor = 'text-emerald-400';
      verdictBg = 'from-emerald-500/10 to-emerald-500/0';
      verdictIcon = <CheckCircle className="w-6 h-6 text-emerald-400" />;
    } else if (score >= 4) {
      verdict = 'Moderate Potential';
      verdictColor = 'text-amber-400';
      verdictBg = 'from-amber-500/10 to-amber-500/0';
      verdictIcon = <AlertTriangle className="w-6 h-6 text-amber-400" />;
    } else {
      verdict = 'Low Viability';
      verdictColor = 'text-rose-400';
      verdictBg = 'from-rose-500/10 to-rose-500/0';
      verdictIcon = <XCircle className="w-6 h-6 text-rose-400" />;
    }

    // Build dimension signals — scaled relative to Phoenix score so bars reflect true viability
    const signals: Signal[] = [];
    const viabilityFactor = Math.max(0.1, (score / 10)); // 0.1 – 1.0 scaling

    // Clinical evidence
    const phase34 = clinicalData.filter((t: any) => t.phase?.includes('3') || t.phase?.includes('4')).length;
    const recruiting = clinicalData.filter((t: any) => t.status?.toUpperCase().includes('RECRUIT')).length;
    const rawClinical = Math.min((clinicalData.length * 0.04) + (phase34 * 0.1) + (recruiting * 0.03), 1);
    const clinicalScore = rawClinical * viabilityFactor;
    signals.push({
      label: 'Clinical Evidence',
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      value: clinicalScore,
      detail: `${clinicalData.length} trials${phase34 ? `, ${phase34} Phase 3/4` : ''}`,
      tag: clinicalScore >= 0.5 ? 'strength' : 'risk',
    });

    // Literature density
    const rawLit = Math.min(literatureData.length * 0.04, 1);
    const litScore = rawLit * viabilityFactor;
    signals.push({
      label: 'Literature Support',
      icon: <FileText className="w-3.5 h-3.5" />,
      value: litScore,
      detail: `${literatureData.length} publications`,
      tag: litScore >= 0.4 ? 'strength' : 'risk',
    });

    // Drug-likeness (Lipinski) — capped by viability
    const lip = pubchemData ? [
      pubchemData.molecular_weight && Number(pubchemData.molecular_weight) <= 500,
      pubchemData.xlogp != null && Number(pubchemData.xlogp) <= 5,
      pubchemData.hbd != null && Number(pubchemData.hbd) <= 5,
      pubchemData.hba != null && Number(pubchemData.hba) <= 10,
    ].filter(Boolean).length : 0;
    const drugScore = (lip / 4) * viabilityFactor;
    signals.push({
      label: 'Drug Likeness',
      icon: <Database className="w-3.5 h-3.5" />,
      value: drugScore,
      detail: `Lipinski ${lip}/4`,
      tag: drugScore >= 0.5 ? 'strength' : 'risk',
    });

    // Regulatory safety
    const hasWarnings = regulatoryData?.boxed_warnings?.length > 0;
    const approvals = regulatoryData?.indications?.length || 0;
    const rawReg = approvals > 0 ? (hasWarnings ? 0.4 : 0.85) : 0.2;
    const regScore = rawReg * viabilityFactor;
    signals.push({
      label: 'Regulatory Profile',
      icon: <Shield className="w-3.5 h-3.5" />,
      value: regScore,
      detail: `${approvals} approval${approvals !== 1 ? 's' : ''}${hasWarnings ? ', boxed warning' : ''}`,
      tag: regScore >= 0.5 ? 'strength' : 'risk',
    });

    // IP freedom
    const rawIp = patentData.length === 0 ? 0.9 : Math.max(0.1, 0.6 - patentData.length * 0.15);
    const ipScore = rawIp * viabilityFactor;
    signals.push({
      label: 'IP Freedom',
      icon: <Scale className="w-3.5 h-3.5" />,
      value: ipScore,
      detail: patentData.length === 0 ? 'No active patents' : `${patentData.length} patent${patentData.length > 1 ? 's' : ''} found`,
      tag: ipScore >= 0.5 ? 'strength' : 'risk',
    });

    // Repurposing breadth
    const rawRep = Math.min(repurposingCandidates.length * 0.08, 1);
    const repScore = rawRep * viabilityFactor;
    signals.push({
      label: 'Repurposing Breadth',
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      value: repScore,
      detail: `${repurposingCandidates.length} candidate${repurposingCandidates.length !== 1 ? 's' : ''}`,
      tag: repScore >= 0.4 ? 'strength' : 'risk',
    });

    const strengths = signals.filter(s => s.tag === 'strength').map(s => s.detail ? `${s.label}: ${s.detail}` : s.label);
    const risks = signals.filter(s => s.tag === 'risk').map(s => s.detail ? `${s.label}: ${s.detail}` : s.label);

    return { verdict, verdictColor, verdictIcon, verdictBg, signals, strengths, risks };
  }, [molecule, phoenixScore, clinicalData, literatureData, regulatoryData, pubchemData, patentData, repurposingCandidates]);

  const score = phoenixScore ?? 0;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl overflow-hidden mt-8">
      {/* Top verdict banner */}
      <div className={`bg-gradient-to-r ${verdictBg} border-b border-zinc-800/60 px-6 py-5 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            {verdictIcon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">Repurposing Verdict</h3>
            <p className={`text-sm font-medium ${verdictColor} mt-0.5`}>{verdict}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold font-mono ${verdictColor} leading-none`}>
            {score.toFixed(1)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">Phoenix Score</div>
        </div>
      </div>

      <div className="p-6">
        {/* Signal bars */}
        <div className="grid gap-2.5">
          {signals.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3"
            >
              <div className="w-[140px] flex items-center gap-2 shrink-0">
                <span className="text-zinc-500">{s.icon}</span>
                <span className="text-xs text-zinc-400 font-medium truncate">{s.label}</span>
              </div>

              <div className="flex-1 h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    useColor
                      ? (s.value >= 0.7 ? 'bg-emerald-500' : s.value >= 0.4 ? 'bg-amber-500' : 'bg-rose-500')
                      : 'bg-zinc-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.06 }}
                />
              </div>

              <span className="w-[120px] text-[11px] text-zinc-500 shrink-0 text-right truncate">{s.detail}</span>
            </motion.div>
          ))}
        </div>

        {/* Strengths / risks */}
        {(strengths.length > 0 || risks.length > 0) && (
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-zinc-800/60">
            {strengths.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Strengths</span>
                </div>
                <ul className="space-y-1">
                  {strengths.map((s, i) => (
                    <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {risks.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Risks</span>
                </div>
                <ul className="space-y-1">
                  {risks.map((r, i) => (
                    <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
