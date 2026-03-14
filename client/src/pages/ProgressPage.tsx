import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Circle, Loader2, AlertCircle, Terminal, Database, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { GoogleGenAI, Type } from '@google/genai';

export default function ProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    let isProcessingAi = false;

    const interval = setInterval(async () => {
      if (isProcessingAi) return;

      try {
        const res = await fetch(`/api/status/${id}`);
        if (!res.ok) throw new Error('Failed to fetch status');
        const data = await res.json();
        setJob(data);

        if (data.status === 'complete') {
          clearInterval(interval);
          navigate(`/report/${id}`);
        } else if (data.status === 'error') {
          clearInterval(interval);
          setError('Pipeline failed to complete.');
        } else if (data.status === 'awaiting_ai') {
          isProcessingAi = true;
          
          try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            let aiAnalysis;

            if (apiKey) {
              const ai = new GoogleGenAI({ apiKey });
              const { clinicalData, literatureData, regulatoryData } = data.intermediate_data || {};
              
              const prompt = `Analyze the drug ${data.molecule} for repurposing opportunities based on the following simulated data:
              Clinical: ${JSON.stringify(clinicalData)}
              Literature: ${JSON.stringify(literatureData)}
              Regulatory: ${JSON.stringify(regulatoryData)}
              
              Provide a viability score (0-10), confidence level, top opportunities, top risks, and reasoning.
              IMPORTANT: In your 'reasoning' text, you MUST include citations like [1], [2], [3] when referring to specific clinical trials, literature, or regulatory data.`;

              const aiResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      viability_score: { type: Type.NUMBER },
                      confidence: { type: Type.STRING },
                      top_opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                      top_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                      reasoning: { type: Type.STRING },
                    },
                    required: ['viability_score', 'confidence', 'top_opportunities', 'top_risks', 'reasoning'],
                  }
                }
              });

              aiAnalysis = JSON.parse(aiResponse.text || '{}');
            } else {
              // Mock analysis for hackathon demo if no API key is provided
              await new Promise(resolve => setTimeout(resolve, 2000));
              aiAnalysis = {
                viability_score: 8.5,
                confidence: "High",
                top_opportunities: [
                  "Potential for metabolic pathway regulation",
                  "Strong binding affinity observed in preliminary assays",
                  "Well-tolerated in Phase 1 trials for other indications"
                ],
                top_risks: [
                  "Possible hepatotoxicity at higher doses",
                  "Competitive landscape includes established generics"
                ],
                reasoning: "The molecule shows significant promise based on structural similarities to known active compounds [1]. Clinical data indicates a favorable safety profile [2], though further Phase II studies are necessary to confirm efficacy for this new indication."
              };
            }

            const completeRes = await fetch(`/api/complete_analysis/${id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ aiAnalysis })
            });

            if (!completeRes.ok) throw new Error('Failed to save AI analysis');
            
            clearInterval(interval);
            navigate(`/report/${id}`);
          } catch (aiErr) {
            console.error('AI Analysis failed:', aiErr);
            clearInterval(interval);
            setError('AI Analysis failed to complete.');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Error connecting to server.');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [id, navigate]);

  useEffect(() => {
    // Auto-scroll logs to bottom
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [job]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col gap-4">
            <p>{error}</p>
            <Button variant="outline" onClick={() => navigate('/search')} className="w-fit">
              Try Another Molecule
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const steps = job?.steps || Array(8).fill({ label: 'Awaiting initialization...', status: 'waiting', log: 'Pending...' });
  const completedSteps = steps.filter((s: any) => s.status === 'done').length;
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  const activeStepIndex = steps.findIndex((s: any) => s.status === 'running') !== -1 
    ? steps.findIndex((s: any) => s.status === 'running') 
    : steps.map((s: any) => s.status === 'done').lastIndexOf(true) !== -1 
      ? steps.map((s: any) => s.status === 'done').lastIndexOf(true) 
      : 0;

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      
      {/* Structural Header */}
      <header className="w-full border-b border-border bg-card sticky top-0 z-50">
        <div className="w-full max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-semibold text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-muted-foreground" />
              <span>Data Pipeline Orchestration</span>
            </div>
            <div className="h-4 w-px bg-border mx-2"></div>
            <div className="text-sm font-mono text-muted-foreground">
              Target: <span className="text-foreground font-medium">{job?.molecule || 'Initializing...'}</span>
            </div>
            <div className="text-sm font-mono text-muted-foreground ml-2">
              ID: {id?.substring(0, 8)}
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-64">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-muted-foreground">Pipeline Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-in-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Linear Step List */}
        <div className="lg:col-span-4 flex flex-col max-h-[calc(100vh-6rem)]">
          <Card className="flex-1 overflow-hidden flex flex-col border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>Execution Steps</span>
                <span>{completedSteps} / {totalSteps}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              <div className="relative p-6">
                <div className="absolute left-[39px] top-6 bottom-6 w-px bg-border" />
                <div className="space-y-6 relative z-10">
                  {steps.map((step: any, i: number) => {
                    const isDone = step.status === 'done';
                    const isRunning = step.status === 'running';

                    return (
                      <div key={i} className={clsx("flex items-start gap-4 transition-colors", isRunning ? "opacity-100" : isDone ? "opacity-75" : "opacity-40")}>
                        <div className={clsx(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border bg-background mt-0.5",
                          isDone ? "border-primary text-primary" :
                          isRunning ? "border-primary ring-2 ring-primary/20 text-primary" :
                          "border-muted-foreground text-muted-foreground"
                        )}>
                          {isDone ? <Check size={12} strokeWidth={3} /> :
                           isRunning ? <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> :
                           <Circle size={8} className="fill-current" />}
                        </div>
                        
                        <div className="flex-1 pt-0.5">
                          <h4 className={clsx("text-sm font-semibold mb-1", isRunning && "text-primary")}>
                            {step.label || step.name}
                          </h4>
                          {isRunning && (
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Loader2 size={10} className="animate-spin" /> Gathering data...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: System Logs & Details */}
        <div className="lg:col-span-8 flex flex-col max-h-[calc(100vh-6rem)]">
          <Card className="flex-1 flex flex-col shadow-sm border-border overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Terminal size={16} />
                Execution Logs
              </CardTitle>
              {completedSteps === totalSteps && (
                <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Check size={16}/> Compilation Complete
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 overflow-hidden flex-1 bg-zinc-950 text-zinc-300 font-mono text-xs">
              <div className="p-4 h-full overflow-y-auto">
                <div className="mb-4 text-zinc-500">
                  Starting analysis pipeline for target {job?.molecule}...
                  <br/>Session ID: {id}
                  <br/>Initializing workers...
                </div>
                
                <div className="space-y-1">
                  {steps.filter((s:any) => s.status !== 'waiting').map((step:any, i:number) => (
                    <div key={i} className="flex gap-4 items-start">
                       <span className="text-zinc-500 shrink-0 w-24">[{new Date().toISOString().split('T')[1].substring(0,8)}]</span>
                       <span className={clsx(
                         "shrink-0 w-32 truncate",
                         step.status === 'running' ? "text-cyan-400" :
                         step.status === 'error' ? "text-red-400" : "text-emerald-400"
                       )}>
                         {step.name || step.label}
                       </span>
                       <span className={clsx("flex-1", step.status === 'running' ? "text-zinc-300" : "text-zinc-400")}>
                         {step.log || (step.status === 'running' ? 'Processing...' : 'Completed')}
                       </span>
                    </div>
                  ))}
                  
                  {job && job.status !== 'complete' && job.status !== 'error' && (
                    <div className="flex gap-4 items-center pl-32 mt-2">
                      <span className="w-1.5 h-3 bg-zinc-500 animate-pulse" />
                    </div>
                  )}
                </div>
                <div ref={logsEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
