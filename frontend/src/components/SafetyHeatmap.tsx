import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Info } from 'lucide-react';

// MedDRA Preferred Term → System Organ Class mapping (common terms)
const TERM_TO_SOC: Record<string, string> = {
  // Gastrointestinal
  'nausea': 'Gastrointestinal', 'vomiting': 'Gastrointestinal', 'diarrhoea': 'Gastrointestinal',
  'diarrhea': 'Gastrointestinal', 'abdominal pain': 'Gastrointestinal', 'constipation': 'Gastrointestinal',
  'abdominal pain upper': 'Gastrointestinal', 'dyspepsia': 'Gastrointestinal', 'flatulence': 'Gastrointestinal',
  'gastroesophageal reflux disease': 'Gastrointestinal', 'dry mouth': 'Gastrointestinal',
  'abdominal discomfort': 'Gastrointestinal', 'gastrointestinal disorder': 'Gastrointestinal',
  // Nervous system
  'headache': 'Nervous System', 'dizziness': 'Nervous System', 'somnolence': 'Nervous System',
  'tremor': 'Nervous System', 'paraesthesia': 'Nervous System', 'seizure': 'Nervous System',
  'hypoaesthesia': 'Nervous System', 'neuropathy peripheral': 'Nervous System',
  'dysgeusia': 'Nervous System', 'syncope': 'Nervous System', 'amnesia': 'Nervous System',
  'convulsion': 'Nervous System', 'balance disorder': 'Nervous System',
  // General / Body
  'fatigue': 'General', 'asthenia': 'General', 'malaise': 'General', 'pain': 'General',
  'pyrexia': 'General', 'oedema peripheral': 'General', 'chest pain': 'General',
  'chills': 'General', 'feeling abnormal': 'General', 'death': 'General',
  'drug ineffective': 'General', 'condition aggravated': 'General',
  'peripheral swelling': 'General', 'edema peripheral': 'General',
  // Skin
  'rash': 'Skin', 'pruritus': 'Skin', 'urticaria': 'Skin', 'alopecia': 'Skin',
  'hyperhidrosis': 'Skin', 'erythema': 'Skin', 'dermatitis': 'Skin',
  'skin disorder': 'Skin', 'dry skin': 'Skin', 'photosensitivity reaction': 'Skin',
  // Musculoskeletal
  'myalgia': 'Musculoskeletal', 'arthralgia': 'Musculoskeletal', 'back pain': 'Musculoskeletal',
  'pain in extremity': 'Musculoskeletal', 'muscle spasms': 'Musculoskeletal',
  'musculoskeletal pain': 'Musculoskeletal', 'muscle weakness': 'Musculoskeletal',
  'rhabdomyolysis': 'Musculoskeletal', 'joint swelling': 'Musculoskeletal',
  // Respiratory
  'dyspnoea': 'Respiratory', 'cough': 'Respiratory', 'pneumonia': 'Respiratory',
  'upper respiratory tract infection': 'Respiratory', 'nasopharyngitis': 'Respiratory',
  'pulmonary embolism': 'Respiratory', 'respiratory failure': 'Respiratory',
  'bronchitis': 'Respiratory', 'nasal congestion': 'Respiratory',
  // Cardiac
  'palpitations': 'Cardiac', 'tachycardia': 'Cardiac', 'bradycardia': 'Cardiac',
  'cardiac failure': 'Cardiac', 'myocardial infarction': 'Cardiac',
  'atrial fibrillation': 'Cardiac', 'cardiac arrest': 'Cardiac',
  'cardiac disorder': 'Cardiac', 'angina pectoris': 'Cardiac',
  // Psychiatric
  'insomnia': 'Psychiatric', 'anxiety': 'Psychiatric', 'depression': 'Psychiatric',
  'confusional state': 'Psychiatric', 'hallucination': 'Psychiatric',
  'agitation': 'Psychiatric', 'suicidal ideation': 'Psychiatric',
  'nervousness': 'Psychiatric', 'sleep disorder': 'Psychiatric', 'nightmare': 'Psychiatric',
  // Metabolism & Nutrition
  'decreased appetite': 'Metabolic', 'weight decreased': 'Metabolic', 'weight increased': 'Metabolic',
  'hypoglycaemia': 'Metabolic', 'hyperglycaemia': 'Metabolic', 'dehydration': 'Metabolic',
  'hypokalaemia': 'Metabolic', 'lactic acidosis': 'Metabolic', 'diabetes mellitus': 'Metabolic',
  'hyponatraemia': 'Metabolic', 'acidosis': 'Metabolic',
  // Vascular
  'hypertension': 'Vascular', 'hypotension': 'Vascular', 'deep vein thrombosis': 'Vascular',
  'haemorrhage': 'Vascular', 'flushing': 'Vascular', 'hot flush': 'Vascular',
  // Renal
  'renal failure': 'Renal', 'renal failure acute': 'Renal', 'renal impairment': 'Renal',
  'proteinuria': 'Renal', 'urinary tract infection': 'Renal',
  // Hepatic
  'hepatotoxicity': 'Hepatic', 'hepatic failure': 'Hepatic', 'jaundice': 'Hepatic',
  'hepatitis': 'Hepatic', 'liver disorder': 'Hepatic', 'hepatic function abnormal': 'Hepatic',
  // Blood
  'anaemia': 'Blood', 'thrombocytopenia': 'Blood', 'neutropenia': 'Blood',
  'leukopenia': 'Blood', 'pancytopenia': 'Blood', 'lymphopenia': 'Blood',
  // Eye
  'vision blurred': 'Eye', 'visual impairment': 'Eye', 'eye pain': 'Eye',
  // Immune
  'anaphylactic reaction': 'Immune', 'hypersensitivity': 'Immune',
  'angioedema': 'Immune', 'drug hypersensitivity': 'Immune',
  // Investigations
  'blood pressure increased': 'Investigations', 'weight gain': 'Investigations',
  'blood glucose increased': 'Investigations', 'liver function test abnormal': 'Investigations',
  'blood creatinine increased': 'Investigations',
};

const SOC_ORDER = [
  'Gastrointestinal', 'Nervous System', 'General', 'Skin', 'Musculoskeletal',
  'Respiratory', 'Cardiac', 'Psychiatric', 'Metabolic', 'Vascular',
  'Renal', 'Hepatic', 'Blood', 'Eye', 'Immune', 'Investigations', 'Other'
];

const SOC_COLORS: Record<string, string> = {
  'Gastrointestinal': 'from-amber-500', 'Nervous System': 'from-violet-500', 'General': 'from-zinc-400',
  'Skin': 'from-rose-500', 'Musculoskeletal': 'from-orange-500', 'Respiratory': 'from-sky-500',
  'Cardiac': 'from-red-600', 'Psychiatric': 'from-purple-500', 'Metabolic': 'from-yellow-500',
  'Vascular': 'from-pink-500', 'Renal': 'from-teal-500', 'Hepatic': 'from-lime-500',
  'Blood': 'from-red-400', 'Eye': 'from-blue-400', 'Immune': 'from-emerald-500',
  'Investigations': 'from-cyan-500', 'Other': 'from-zinc-500',
};

interface FaersReaction {
  term: string;
  count: number;
}

function classifyTerm(term: string): string {
  const lower = term.toLowerCase();
  return TERM_TO_SOC[lower] || 'Other';
}

export default function SafetyHeatmap({ reactions }: { reactions: FaersReaction[] }) {
  const [hoveredSOC, setHoveredSOC] = useState<string | null>(null);

  const { socData, maxCount } = useMemo(() => {
    const socMap: Record<string, { totalCount: number; terms: { term: string; count: number }[] }> = {};

    for (const r of reactions) {
      const soc = classifyTerm(r.term);
      if (!socMap[soc]) socMap[soc] = { totalCount: 0, terms: [] };
      socMap[soc].totalCount += r.count;
      socMap[soc].terms.push(r);
    }

    // Sort terms within each SOC by count descending
    for (const soc of Object.values(socMap)) {
      soc.terms.sort((a, b) => b.count - a.count);
    }

    const ordered = SOC_ORDER
      .filter(soc => socMap[soc])
      .map(soc => ({ soc, ...socMap[soc] }));

    // Also add any SOC not in the predefined order
    for (const [soc, data] of Object.entries(socMap)) {
      if (!SOC_ORDER.includes(soc)) {
        ordered.push({ soc, ...data });
      }
    }

    const max = Math.max(...ordered.map(d => d.totalCount), 1);
    return { socData: ordered, maxCount: max };
  }, [reactions]);

  if (!reactions || reactions.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 text-center text-zinc-500">
        <ShieldAlert className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No FAERS adverse event data available for this compound.</p>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <h4 className="text-sm font-semibold text-zinc-200">Adverse Event Distribution by Organ System</h4>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <Info size={10} />
          <span>FDA FAERS reports (real-time)</span>
        </div>
      </div>

      <div className="space-y-2">
        {socData.map((item, i) => {
          const pct = (item.totalCount / maxCount) * 100;
          const intensity = Math.min(pct / 100, 1);
          const fromColor = SOC_COLORS[item.soc] || 'from-zinc-500';
          const isHovered = hoveredSOC === item.soc;

          return (
            <motion.div
              key={item.soc}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="group relative"
              onMouseEnter={() => setHoveredSOC(item.soc)}
              onMouseLeave={() => setHoveredSOC(null)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-28 shrink-0 text-right font-medium truncate">{item.soc}</span>
                <div className="flex-1 relative h-7 bg-zinc-900/60 rounded-lg overflow-hidden border border-zinc-800/40">
                  <motion.div
                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${fromColor} to-transparent rounded-lg`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(pct, 3)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: 'easeOut' }}
                    style={{ opacity: 0.3 + intensity * 0.7 }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 justify-between">
                    <span className="text-[10px] font-medium text-zinc-300 truncate">
                      {item.terms.slice(0, 3).map(t => t.term).join(', ')}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-2">
                      {item.totalCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-32 right-0 top-full mt-1 z-20 bg-zinc-900 border border-zinc-700 rounded-xl p-3 shadow-xl"
                >
                  <div className="text-xs text-zinc-300 font-medium mb-2">{item.soc} — {item.totalCount.toLocaleString()} total reports</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {item.terms.slice(0, 8).map((t, j) => (
                      <div key={j} className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 truncate mr-2">{t.term}</span>
                        <span className="text-zinc-500 font-mono shrink-0">{t.count.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-zinc-700 to-zinc-600" />
            <span className="text-[10px] text-zinc-500">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-amber-600 to-amber-500" />
            <span className="text-[10px] text-zinc-500">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-2 rounded-sm bg-gradient-to-r from-rose-600 to-rose-500" />
            <span className="text-[10px] text-zinc-500">High</span>
          </div>
        </div>
        <span className="text-[10px] text-zinc-600">Source: openFDA FAERS</span>
      </div>
    </div>
  );
}
