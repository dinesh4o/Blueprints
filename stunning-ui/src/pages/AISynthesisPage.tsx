/**
 * ✦ STUNNING AI SYNTHESIS PAGE
 * Features: SVG pathway visualization, SpotlightCard evidence chains,
 * animated accordion, opportunity matrix with scoring, GradientText.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Brain, ChevronDown, ChevronUp, ExternalLink,
  FileText, FlaskConical, Shield, Sparkles, Target, Dna,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  SpotlightCard, BlurReveal, Aurora, Particles, GradientText,
} from '@/components/reactbits';

const PATHWAY_DATA = {
  drug: { name: 'Metformin', x: 200, y: 50 },
  targets: [
    { name: 'AMPK', x: 100, y: 160 },
    { name: 'mTOR', x: 200, y: 160 },
    { name: 'Complex I', x: 300, y: 160 },
  ],
  diseases: [
    { name: 'Cancer', x: 60, y: 280 },
    { name: "Alzheimer's", x: 160, y: 280 },
    { name: 'Diabetes', x: 260, y: 280 },
    { name: 'Aging', x: 350, y: 280 },
  ],
};

const EVIDENCE_CHAINS = [
  {
    condition: 'Colorectal Cancer',
    score: 8.7,
    trials: [
      { nct: 'NCT04033107', phase: 'Phase III', status: 'Recruiting', title: 'Metformin + 5-FU in Stage III CRC' },
      { nct: 'NCT02437656', phase: 'Phase II', status: 'Completed', title: 'Metformin as adjuvant in CRC patients' },
    ],
    papers: [
      { title: 'Metformin inhibits colorectal cancer stem cells via AMPK', pmid: '35012345', year: 2024 },
      { title: 'Population-based study of metformin and CRC risk', pmid: '34567890', year: 2023 },
    ],
    patents: 12,
    fto: 'Favorable',
  },
  {
    condition: "Alzheimer's Disease",
    score: 6.8,
    trials: [
      { nct: 'NCT04098666', phase: 'Phase II', status: 'Active', title: 'Metformin for Alzheimer prevention (MET-AD)' },
    ],
    papers: [
      { title: 'Metformin crosses BBB and reduces tau phosphorylation', pmid: '36789012', year: 2025 },
    ],
    patents: 5,
    fto: 'Open',
  },
];

const MATRIX = [
  { condition: 'Colorectal Cancer', evidence: 9, phase: 8, literature: 9, ipRisk: 3, composite: 8.7 },
  { condition: 'Breast Cancer', evidence: 7, phase: 7, literature: 8, ipRisk: 4, composite: 7.4 },
  { condition: "Alzheimer's", evidence: 6, phase: 5, literature: 7, ipRisk: 2, composite: 6.8 },
  { condition: 'PCOS', evidence: 10, phase: 10, literature: 9, ipRisk: 1, composite: 9.5 },
  { condition: 'Anti-Aging', evidence: 4, phase: 3, literature: 6, ipRisk: 2, composite: 5.2 },
];

export default function AISynthesisPage() {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'composite' | 'evidence' | 'phase'>('composite');

  const sorted = [...MATRIX].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="relative min-h-screen bg-background">
      <Aurora colors={['oklch(0.7 0.2 260 / 0.04)']} />
      <Particles count={12} />

      <header className="sticky top-0 z-40 glass-strong">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/report/demo" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Evidence Synthesis
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-10">
        {/* Pathway Visualization */}
        <BlurReveal>
          <SpotlightCard className="p-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Dna className="h-5 w-5 text-primary" />
              <GradientText>Pathway Overlap Network</GradientText>
            </h2>

            <div className="flex justify-center">
              <svg width="420" height="320" className="overflow-visible">
                {/* Drug → Target links */}
                {PATHWAY_DATA.targets.map((t) => (
                  <line key={t.name} x1={PATHWAY_DATA.drug.x} y1={PATHWAY_DATA.drug.y + 20} x2={t.x} y2={t.y - 15}
                    stroke="oklch(0.7 0.2 260 / 0.4)" strokeWidth="2" />
                ))}
                {/* Target → Disease links */}
                {PATHWAY_DATA.targets.map((t, ti) =>
                  PATHWAY_DATA.diseases.filter((_, di) => (ti === 0 && di < 2) || (ti === 1 && di >= 1 && di <= 2) || (ti === 2 && di >= 2)).map((d) => (
                    <line key={`${t.name}-${d.name}`} x1={t.x} y1={t.y + 15} x2={d.x} y2={d.y - 15}
                      stroke="oklch(0.6 0 0 / 0.2)" strokeWidth="1" strokeDasharray="4 4" />
                  ))
                )}
                {/* Drug node */}
                <g>
                  <circle cx={PATHWAY_DATA.drug.x} cy={PATHWAY_DATA.drug.y} r="22" fill="oklch(0.7 0.2 260 / 0.15)" stroke="oklch(0.7 0.2 260)" strokeWidth="2" />
                  <text x={PATHWAY_DATA.drug.x} y={PATHWAY_DATA.drug.y + 4} textAnchor="middle" fill="oklch(0.7 0.2 260)" fontSize="10" fontWeight="bold">{PATHWAY_DATA.drug.name}</text>
                </g>
                {/* Target nodes */}
                {PATHWAY_DATA.targets.map((t) => (
                  <g key={t.name}>
                    <circle cx={t.x} cy={t.y} r="18" fill="oklch(0.65 0.15 300 / 0.15)" stroke="oklch(0.65 0.15 300 / 0.5)" strokeWidth="1.5" />
                    <text x={t.x} y={t.y + 4} textAnchor="middle" fill="oklch(0.75 0.15 300)" fontSize="9" fontWeight="600">{t.name}</text>
                  </g>
                ))}
                {/* Disease nodes */}
                {PATHWAY_DATA.diseases.map((d) => (
                  <g key={d.name}>
                    <rect x={d.x - 30} y={d.y - 12} width="60" height="24" rx="6" fill="oklch(0.2 0 0)" stroke="oklch(0.4 0 0)" strokeWidth="1" />
                    <text x={d.x} y={d.y + 4} textAnchor="middle" fill="oklch(0.7 0 0)" fontSize="8">{d.name}</text>
                  </g>
                ))}
              </svg>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" /> Drug</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full" style={{ background: 'oklch(0.65 0.15 300)' }} /> Target</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-muted-foreground/40" /> Disease</span>
            </div>
          </SpotlightCard>
        </BlurReveal>

        {/* Evidence Chains */}
        <BlurReveal delay={0.1}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Evidence Chain Traceability
          </h2>
          <div className="space-y-4">
            {EVIDENCE_CHAINS.map((chain) => (
              <SpotlightCard key={chain.condition} className="overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === chain.condition ? null : chain.condition)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="text-xl font-bold font-mono w-12 text-center"
                      style={{ color: chain.score >= 8 ? 'oklch(0.72 0.2 155)' : chain.score >= 6 ? 'oklch(0.7 0.2 260)' : 'oklch(0.78 0.15 80)' }}
                    >
                      {chain.score}
                    </div>
                    <div>
                      <h3 className="font-semibold">{chain.condition}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">{chain.trials.length} trials</Badge>
                        <Badge variant="secondary" className="text-[10px]">{chain.papers.length} papers</Badge>
                        <Badge variant="secondary" className="text-[10px]">{chain.patents} patents</Badge>
                      </div>
                    </div>
                  </div>
                  {expanded === chain.condition ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                <AnimatePresence>
                  {expanded === chain.condition && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-4">
                        <div className="border-t border-border/50 pt-4">
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-1">
                            <FlaskConical className="h-4 w-4 text-blue-400" /> Clinical Trials
                          </h4>
                          <div className="space-y-2">
                            {chain.trials.map((trial) => (
                              <div key={trial.nct} className="rounded-lg border border-border bg-muted/20 p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <code className="text-xs text-primary font-mono">{trial.nct}</code>
                                  <div className="flex items-center gap-1.5">
                                    <Badge variant="secondary" className="text-[10px]">{trial.phase}</Badge>
                                    <Badge variant={trial.status === 'Recruiting' ? 'success' : trial.status === 'Active' ? 'default' : 'secondary'} className="text-[10px]">
                                      {trial.status}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{trial.title}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-1">
                            <FileText className="h-4 w-4 text-violet-400" /> Key Literature
                          </h4>
                          <div className="space-y-2">
                            {chain.papers.map((paper) => (
                              <div key={paper.pmid} className="rounded-lg border border-border bg-muted/20 p-3">
                                <p className="text-xs font-medium mb-1">{paper.title}</p>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <code>PMID: {paper.pmid}</code>
                                  <span>({paper.year})</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">Patents: <strong className="text-foreground">{chain.patents}</strong></span>
                          <span className="text-muted-foreground">FTO: <Badge variant="success" className="text-[10px] ml-1">{chain.fto}</Badge></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </SpotlightCard>
            ))}
          </div>
        </BlurReveal>

        {/* Opportunity Matrix */}
        <BlurReveal delay={0.2}>
          <SpotlightCard className="p-8">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Target className="h-5 w-5 text-warning" />
              Opportunity Matrix
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-muted-foreground font-medium">Condition</th>
                    {['evidence', 'phase', 'composite'].map((col) => (
                      <th
                        key={col}
                        onClick={() => setSortBy(col as any)}
                        className={`pb-3 text-center font-medium cursor-pointer transition-colors ${
                          sortBy === col ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {col === 'evidence' ? 'Evidence' : col === 'phase' ? 'Phase' : 'Composite'}
                        {sortBy === col && ' ▼'}
                      </th>
                    ))}
                    <th className="pb-3 text-center text-muted-foreground font-medium">Literature</th>
                    <th className="pb-3 text-center text-muted-foreground font-medium">IP Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sorted.map((row) => (
                    <tr key={row.condition} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 font-medium">{row.condition}</td>
                      <td className="py-3 text-center"><ScoreBadge value={row.evidence} /></td>
                      <td className="py-3 text-center"><ScoreBadge value={row.phase} /></td>
                      <td className="py-3 text-center">
                        <span
                          className="font-bold font-mono"
                          style={{ color: row.composite >= 8 ? 'oklch(0.72 0.2 155)' : row.composite >= 6 ? 'oklch(0.7 0.2 260)' : 'oklch(0.78 0.15 80)' }}
                        >
                          {row.composite}
                        </span>
                      </td>
                      <td className="py-3 text-center"><ScoreBadge value={row.literature} /></td>
                      <td className="py-3 text-center">
                        <Badge variant={row.ipRisk <= 3 ? 'success' : 'warning'} className="text-[10px]">
                          {row.ipRisk <= 2 ? 'Low' : row.ipRisk <= 4 ? 'Medium' : 'High'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SpotlightCard>
        </BlurReveal>
      </main>
    </div>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const color = value >= 8 ? 'oklch(0.72 0.2 155)' : value >= 5 ? 'oklch(0.7 0.2 260)' : 'oklch(0.78 0.15 80)';
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold" style={{ color, background: `${color}15` }}>
      {value}
    </span>
  );
}
