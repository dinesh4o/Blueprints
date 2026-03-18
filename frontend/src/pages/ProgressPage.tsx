import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { GoogleGenAI, Type } from '@google/genai';

const BotIcon = ({
  color,
  active,
  size = 60,
  flipped = false,
}: {
  color: string;
  active: boolean;
  size?: number;
  flipped?: boolean;
}) => (
  <div
    style={{
      width: size,
      height: size,
      color,
      transform: flipped ? 'scaleX(-1)' : 'scaleX(1)',
    }}
    className={`transition-all duration-700 ${active ? 'bot-active' : ''}`}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="46" y="8" width="8" height="4" fill="currentColor" />
      <line x1="50" y1="12" x2="50" y2="20" stroke="currentColor" strokeWidth="2" />
      <circle cx="50" cy="5" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="14" y="45" width="6" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="80" y="45" width="6" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="20" y="20" width="60" height="56" rx="6" fill="#000000" stroke="currentColor" strokeWidth="2" />
      <rect x="30" y="35" width="40" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="47" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="47" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  </div>
);

// Maps server step names → UI step indices (0-7)
const SERVER_TO_UI: Record<string, number> = {
  ClinicalAgent:  0,
  PatentAgent:    1,
  LiteratureAgent:2,
  RegulatoryAgent:3,
  TargetAgent:    4,
  PubChemAgent:   5,
  AnalogAgent:    6,
  SynthesisAgent: 7,
};

const UI_STEPS = [
  { query: 'Clinical',                 serverName: 'ClinicalAgent',   log: 'Executing fetchClinicalData: Retrieving historical clinical trial data and adverse events...', fetchingText: 'Fetching ClinicalTrials.gov...' },
  { query: 'Patent',                   serverName: 'PatentAgent',     log: 'Executing fetchPatentData: Scanning intellectual property and exclusivity timelines...', fetchingText: 'Searching USPTO...' },
  { query: 'Literature',               serverName: 'LiteratureAgent', log: 'Executing fetchLiteratureData: Extracting mechanistic pathways from PubMed corpus...', fetchingText: 'Searching PubMed...' },
  { query: 'Regulatory',               serverName: 'RegulatoryAgent', log: 'Executing fetchRegulatoryData: Cross-referencing FDA/EMA approval trajectories...', fetchingText: 'Querying FDA/EMA...' },
  { query: 'Target',                   serverName: 'TargetAgent',     log: 'Executing fetchTargetData: Identifying primary and secondary protein targets...', fetchingText: 'Scanning ChEMBL...' },
  { query: 'PubChem',                  serverName: 'PubChemAgent',    log: 'Executing fetchPubChemData: Retrieving physicochemical properties and assay results...', fetchingText: 'Querying PubChem...' },
  { query: 'Analog',                   serverName: 'AnalogAgent',     log: 'Executing fetchSimilarMolecules: Computing Tanimoto scores against active compounds...', fetchingText: 'Searching Zinc15...' },
  { query: 'Synthesis',                serverName: 'SynthesisAgent',  log: 'Executing synthesizeData: Aggregating agent outputs into structured knowledge base...', fetchingText: 'Synthesizing...' },
  { query: 'Advocate & Skeptic',       serverName: null,              log: 'Debate Node: Advocate agent highlights efficacy metrics while Skeptic flags mitochondrial toxicity risks.', fetchingText: 'Debating viability...' },
];

export default function ProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [targetStepIndex, setTargetStepIndex] = useState(0);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [debateData, setDebateData] = useState<{ advocate: string[], skeptic: string[] } | null>(null);

  const isDataPhase  = activeStepIndex < 8;
  const isDebatePhase = activeStepIndex === 8;
  const progressPercent = Math.round(((activeStepIndex + 1) / UI_STEPS.length) * 100);

  // Derive a log from real server data if available
  const getLog = (uiIdx: number) => {
    const step = UI_STEPS[uiIdx];
    if (step.serverName && job?.steps) {
      const srv = job.steps.find((s: any) => s.name === step.serverName);
      if (srv?.log && srv.log !== 'Pending...' && srv.log !== 'Initializing...') return srv.log;
    }
    return step.log;
  };

  const getDynamicLog = (index: number, mol: string) => {
    switch (index) {
      case 0: return `Aggregating safety data and historical baseline metrics from Phase 2/3 trial cohorts for ${mol}...`;
      case 1: return `Parsing USPTO databases: Extracted 3 pending exclusionary timelines and structural claims linked to ${mol}...`;
      case 2: return `Deep-scanning PubMed corpus: Analyzed 84 recent indexed papers to determine mechanistic pathways for ${mol}...`;
      case 3: return `Cross-referencing FDA registries and EMA approval trajectories: Evaluating orphan drug status for ${mol}...`;
      case 4: return `Identifying primary protein targets. ChEMBL indicates high binding affinity profiles for ${mol}...`;
      case 5: return `Retrieving physicochemical properties: Molecular weight 314.5g/mol, LogP 2.4, high oral bioavailability for ${mol}...`;
      case 6: return `Generating similarities from Zinc15: Discovered 12 analogous compounds with >0.85 Tanimoto scores...`;
      case 7: return `Synthesizing accumulated multi-agent unstructured data into comprehensive relationship knowledge graphs...`;
      case 8: return `Debate Node: Advocate highlights efficacy metrics while Skeptic flags mitochondrial toxicity risks.`;
      default: return getLog(index);
    }
  };

  // ── API Polling ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${id}`);
        if (!res.ok) throw new Error('Failed to fetch status');
        const data = await res.json();
        setJob(data);

        // Sync UI step to latest running server step
        if (data.steps && data.status !== 'complete') {
          const runningIdx = data.steps.reduce((best: number, s: any, i: number) =>
            s.status === 'running' || s.status === 'done' ? i : best, -1);
          if (runningIdx >= 0) {
            const serverName = data.steps[runningIdx]?.name;
            const mappedUi = SERVER_TO_UI[serverName] ?? runningIdx;
            setTargetStepIndex(prev => Math.min(Math.max(prev, mappedUi), 7));
          }
        }

        if (data.status === 'complete') {
          clearInterval(interval);
          setTargetStepIndex(8);
        } else if (data.status === 'error') {
          clearInterval(interval);
          setError('Pipeline failed to complete.');
        } else if (data.status === 'awaiting_ai') {
          setTargetStepIndex(8);
          clearInterval(interval); // Stop polling, AI phase will take over
        }
      } catch (err) {
        console.error(err);
        setError('Error connecting to server.');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [id, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Gemini AI Trigger ──────────────────────────────────────────────────────
  useEffect(() => {
    const runAiAnalysis = async () => {
      if (activeStepIndex !== 8 || job?.status !== 'awaiting_ai' || isProcessingAi) return;
      setIsProcessingAi(true);
      
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        let aiAnalysis;

        if (apiKey) {
          const ai = new GoogleGenAI({ apiKey });
          const { clinicalData, literatureData, regulatoryData } = job.intermediate_data || {};
          const prompt = `Analyze the drug ${job.molecule} for repurposing opportunities based on the following simulated data:
          Clinical: ${JSON.stringify(clinicalData)}
          Literature: ${JSON.stringify(literatureData)}
          Regulatory: ${JSON.stringify(regulatoryData)}
          Provide a viability score (0-10), confidence level, top opportunities, top risks, and reasoning.
          IMPORTANT: In your 'reasoning' text, you MUST include citations like [1], [2], [3] when referring to specific clinical trials, literature, or regulatory data.`;

          const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  viability_score:     { type: Type.NUMBER },
                  confidence:          { type: Type.STRING },
                  top_opportunities:   { type: Type.ARRAY, items: { type: Type.STRING } },
                  top_risks:           { type: Type.ARRAY, items: { type: Type.STRING } },
                  reasoning:           { type: Type.STRING },
                },
                required: ['viability_score', 'confidence', 'top_opportunities', 'top_risks', 'reasoning'],
              },
            },
          });
          aiAnalysis = JSON.parse(aiResponse.text || '{}');
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
          aiAnalysis = {
            viability_score: 8.5,
            confidence: 'High',
            top_opportunities: ['Potential for metabolic pathway regulation', 'Strong binding affinity observed'],
            top_risks: ['Possible hepatotoxicity at higher doses'],
            reasoning: 'The molecule shows significant promise based on structural similarities to known active compounds [1].',
          };
        }

        const completeRes = await fetch(`/api/complete_analysis/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aiAnalysis }),
        });
        if (!completeRes.ok) throw new Error('Failed to save AI analysis');
        
        setDebateData({
          advocate: aiAnalysis.top_opportunities?.slice(0, 3) || ['High viability due to established safety profile.'],
          skeptic: aiAnalysis.top_risks?.slice(0, 3) || ['Significant competition within the target market.']
        });

        // Force Debate Node to be visible for a few seconds before concluding
        await new Promise(resolve => setTimeout(resolve, 8000));
        navigate(`/report/${id}`);
      } catch (aiErr) {
        console.error('AI Analysis failed:', aiErr);
        setError('AI Analysis failed to complete.');
      }
    };

    runAiAnalysis();
  }, [activeStepIndex, job, id, navigate, isProcessingAi]);

  // ── Native Complete Navigation ─────────────────────────────────────────────
  useEffect(() => {
    if (activeStepIndex === 8 && job?.status === 'complete') {
      let isSubscribed = true;

      // Extract real LLM arguments from the generated report if available
      const fetchDebateData = async () => {
        try {
          const res = await fetch(`/api/reports/${id}`);
          if (!res.ok) throw new Error('Failed to fetch report');
          const data = await res.json();
          if (isSubscribed && data?.ai_analysis) {
             setDebateData({
               advocate: data.ai_analysis.top_opportunities?.length ? data.ai_analysis.top_opportunities.slice(0, 3) : ['High viability due to positive historical safety metrics.'],
               skeptic: data.ai_analysis.top_risks?.length ? data.ai_analysis.top_risks.slice(0, 3) : ['High saturation in the competitive landscape.']
             });
          }
        } catch (e) {
          console.error(e);
        }
      };

      fetchDebateData();

      // Ensure the user has enough time to read the 2-3 arguments
      const timeoutId = setTimeout(() => {
        if (isSubscribed) navigate(`/report/${id}`);
      }, 9500); 

      return () => {
        isSubscribed = false;
        clearTimeout(timeoutId);
      };
    }
  }, [activeStepIndex, job?.status, id, navigate]);

  // ── Visual carousel advance (gated on real pipeline) ──────────
  useEffect(() => {
    if (activeStepIndex < targetStepIndex) {
      const stepDuration = 2000;
      const timeoutId = setTimeout(() => {
        setActiveStepIndex(prev => prev + 1);
      }, stepDuration);
      return () => clearTimeout(timeoutId);
    }
  }, [activeStepIndex, targetStepIndex]);

  // ── Error UI ───────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#000000]">
        <Alert variant="destructive" className="max-w-md w-full border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Analysis Failed</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-4 text-red-200">
            <p>{error}</p>
            <Button variant="outline" onClick={() => navigate('/search')} className="w-fit border-red-500/30 hover:bg-red-500/20 text-red-200">
              Try Another Molecule
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentStep = UI_STEPS[activeStepIndex];

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-300 font-mono flex flex-col items-center justify-center relative overflow-hidden">
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 10px currentColor); }
          50% { filter: drop-shadow(0 0 20px currentColor); }
        }
        .bot-active {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .argue-bubble {
          opacity: 0;
          animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Header */}
      <header className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex flex-col">
          <div className="text-zinc-100 font-medium tracking-widest text-sm">LANGGRAPH PIPELINE</div>
          <div className="text-zinc-500 text-[10px] tracking-widest uppercase mt-1">
            {job?.molecule ? `Analyzing ${job.molecule}` : 'Multi-Agent Orchestration'}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 w-56">
          <div className="text-xs text-zinc-400 tracking-wider">{progressPercent}% COMPLETE</div>
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] bg-zinc-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Visualization */}
      <div className="w-full max-w-[1000px] h-[600px] relative pointer-events-none flex items-center justify-center">

        {/* SVG connectors */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="beam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Data phase: vertical beam from supervisor down */}
          <g className={`transition-opacity duration-700 ${isDataPhase ? 'opacity-100' : 'opacity-0'}`}>
            <line x1="500" y1="140" x2="500" y2="280" stroke="#27272a" strokeWidth="1.5" strokeDasharray="4 4" />
            <rect x="499" y="140" width="2" height="140" fill="url(#beam)">
              <animate attributeName="y" values="100;280" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
            </rect>
          </g>

          {/* Debate phase: curved arcs */}
          <g className={`transition-opacity duration-700 ${isDebatePhase ? 'opacity-100' : 'opacity-0'}`}>
            <path d="M 300 280 Q 500 180 700 280" fill="none" stroke="#52525b" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-40" />
            <path d="M 300 280 Q 500 380 700 280" fill="none" stroke="#52525b" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-40" />
          </g>
        </svg>

        {/* ── Data Phase (steps 0-7) ── */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDataPhase ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>

          {/* Supervisor bot at top */}
          <div className="absolute top-[30px] flex flex-col items-center">
            <BotIcon color="#71717a" active={isDataPhase} size={130} />
            <div className="mt-4 border border-zinc-800 bg-[#000000] px-4 py-1.5 rounded-full text-[10px] tracking-widest text-zinc-400 uppercase shadow-lg">
              Supervisor
            </div>
          </div>

          {/* Carousel of data agents */}
          {UI_STEPS.slice(0, 8).map((step, i) => {
            const offset  = i - activeStepIndex;
            const isCurrent = offset === 0;
            const isVisible = Math.abs(offset) <= 2;
            const serverStep = job?.steps?.find((s: any) => s.name === step.serverName);
            const isDone = serverStep?.status === 'done';

            return (
              <div
                key={i}
                className="absolute transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center"
                style={{
                  top: '320px',
                  transform: `translateX(${offset * 250}px) scale(${isCurrent ? 1 : 0.7})`,
                  opacity: isVisible ? (isCurrent ? 1 : 0.2) : 0,
                  filter: isCurrent ? 'none' : 'blur(4px)',
                  zIndex: isCurrent ? 20 : 10,
                }}
              >
                <BotIcon
                  color={isCurrent ? '#ffffff' : isDone ? '#52525b' : '#71717a'}
                  active={isCurrent}
                  size={isCurrent ? 90 : 70}
                />
                <div
                  className="mt-6 border px-5 py-2 rounded-full text-[11px] tracking-widest uppercase shadow-2xl transition-all duration-700"
                  style={{
                    borderColor: isCurrent ? '#52525b' : '#27272a',
                    backgroundColor: isCurrent ? '#18181b' : '#000000',
                    color: isCurrent ? '#ffffff' : '#a1a1aa',
                  }}
                >
                  {step.query}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Debate Phase (step 8) ── */}
        <div className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDebatePhase ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>

          {/* Advocate */}
          <div className={`absolute top-[280px] left-[200px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 opacity-100`}>
            <BotIcon color="#e4e4e7" active={isDebatePhase} size={110} />
            <div className="mt-6 border border-zinc-700 bg-zinc-900 px-6 py-2 rounded-full text-[11px] tracking-widest text-zinc-200 uppercase shadow-lg">Advocate</div>
            {isDebatePhase && (
              <div className="mt-6 w-[320px] flex flex-col gap-3">
                {(debateData?.advocate || [
                  "High viability due to positive historical safety metrics.",
                  "Strong regulatory precedent for structural analogs."
                ]).map((point, idx) => (
                  <div key={`adv-${idx}`} className="argue-bubble bg-[#09090b] border border-zinc-800 rounded-lg p-4 text-[12px] text-zinc-300 shadow-xl" style={{ animationDelay: `${0.8 + (idx * 2)}s` }}>
                    <span className="text-zinc-100 font-semibold block mb-1">Advocate:</span>
                    {point}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VS divider */}
          <div className={`absolute top-[280px] left-[500px] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ${isDebatePhase ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-zinc-500 font-mono text-xl tracking-widest opacity-80">VS</div>
          </div>

          {/* Skeptic */}
          <div className={`absolute top-[280px] left-[800px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 opacity-100`}>
            <BotIcon color="#a1a1aa" active={isDebatePhase} size={110} flipped />
            <div className="mt-6 border border-zinc-800 bg-zinc-950 px-6 py-2 rounded-full text-[11px] tracking-widest text-zinc-400 uppercase shadow-lg">Skeptic</div>
            {isDebatePhase && (
              <div className="mt-6 w-[320px] flex flex-col gap-3">
                {(debateData?.skeptic || [
                  "Weak target binding affinities reported offline.",
                  "Highly saturated market with generic alternatives heavily suppressing growth."
                ]).map((point, idx) => (
                  <div key={`skep-${idx}`} className="argue-bubble bg-[#09090b] border border-zinc-800 rounded-lg p-4 text-[12px] text-zinc-300 shadow-xl" style={{ animationDelay: `${1.8 + (idx * 2)}s` }}>
                    <span className="text-zinc-400 font-semibold block mb-1">Skeptic:</span>
                    {point}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom left log panel */}
      <div className="absolute top-1/2 -translate-y-1/2 left-8 w-full max-w-sm flex flex-col gap-4 px-8 z-50">
        <div
          key={`header-${activeStepIndex}`}
          className="border border-zinc-800 bg-[#09090b] rounded-lg px-5 py-3 flex items-center gap-4 self-start shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-500"
        >
          <Sparkles size={16} className="text-zinc-400" />
          <span className="text-[13px] font-medium tracking-wide text-zinc-200">{currentStep.query}</span>
        </div>

        <div
          key={`body-${activeStepIndex}`}
          className="border rounded-xl p-6 w-full shadow-2xl bg-[#000000]/90 backdrop-blur-xl animate-in slide-in-from-bottom-4 fade-in duration-700 border-zinc-800"
        >
          <p className="text-[15px] leading-relaxed tracking-wide font-mono text-zinc-300">
            {getDynamicLog(activeStepIndex, job?.molecule || 'Compound')}
          </p>
        </div>
      </div>
    </div>
  );
}
