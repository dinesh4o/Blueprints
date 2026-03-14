import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldAlert, CheckCircle, Activity, BookOpen, Scale, FileText, X, Download, Loader2, Link2 } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import IndicationMatrix from '@/components/IndicationMatrix';
import TopInvestigators from '@/components/TopInvestigators';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/reports/${id}`)
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-background text-foreground">Loading report...</div>;
  }

  if (!report || report.error) {
    return <div className="flex-1 flex items-center justify-center bg-background text-destructive">Report not found.</div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50';
    if (score >= 4) return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  const handleExportPdf = () => {
    setIsExportingPdf(true);
    setTimeout(() => {
      window.print();
      setIsExportingPdf(false);
    }, 1000);
  };

  const handleExportPptx = () => {
    setIsExportingPptx(true);
    setTimeout(() => {
      setIsExportingPptx(false);
      alert('PPTX export complete. (Mocked for hackathon demo)');
    }, 2000);
  };

  const renderReasoningWithCitations = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      if (part.match(/\[\d+\]/)) {
        return (
          <button 
            key={i} 
            className="inline-flex items-center justify-center px-1.5 py-0.5 ml-1 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded hover:bg-primary/20 transition-colors"
            onClick={() => setIsDrawerOpen(true)}
          >
            {part.replace(/[\[\]]/g, '')}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex-1 bg-background pb-12 pt-0 w-full">

      {/* Header Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate('/search')} className="text-muted-foreground hover:text-foreground -ml-4">
              <ArrowLeft size={16} className="mr-2" /> Back to Search
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {report.molecule} <span className="font-normal text-muted-foreground ml-2">Analysis Report</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={isExportingPdf}>
              {isExportingPdf ? <Loader2 size={14} className="mr-2 animate-spin" /> : <FileText size={14} className="mr-2" />}
              Export PDF
            </Button>
            <Button variant="default" size="sm" onClick={handleExportPptx} disabled={isExportingPptx}>
              {isExportingPptx ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Download size={14} className="mr-2" />}
              Export PPTX
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Top Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="col-span-1 lg:col-span-1 shadow-sm border-border flex flex-col items-center justify-center p-6 text-center bg-card">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b w-full pb-2">Molecule Structure</h2>
            <div className="w-full aspect-square bg-muted/20 border border-border/50 rounded-xl relative flex items-center justify-center p-4">
              <img 
                src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(report.molecule)}/PNG?record_type=2d&image_size=large`}
                alt={`2D Structure of ${report.molecule}`}
                className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-screen opacity-90"
                referrerPolicy="no-referrer"
              />
            </div>
          </Card>

          <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <Card className={clsx("flex flex-col justify-center shadow-sm border", getScoreColor(report.viability_score))}>
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">AI Viability Score</h2>
                  <div className="text-xs font-medium opacity-70 flex items-center gap-1 uppercase tracking-wide">
                    <CheckCircle size={12} /> Confidence: {report.ai_analysis.confidence}
                  </div>
                </div>
                <div className="text-7xl font-black tracking-tighter">
                  {report.viability_score.toFixed(1)}<span className="text-3xl font-medium opacity-50">/10</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="flex flex-col justify-center shadow-sm border-border bg-card">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                   <h2 className="text-sm font-bold uppercase tracking-wider mb-2 text-muted-foreground">Phoenix Score</h2>
                   <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wide">
                     <Activity size={12} /> Deterministic Model
                   </div>
                </div>
                <div className="text-7xl font-black tracking-tighter text-foreground">
                  {report.phoenix_score.toFixed(1)}<span className="text-3xl font-medium text-muted-foreground">/10</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Executive Summary */}
        <Card className="border-border shadow-sm">
          <CardHeader className="bg-muted/30 border-b border-border py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity size={18} className="text-primary"/> Executive Synthesis
              </CardTitle>
              <Button variant="secondary" size="sm" onClick={() => setIsDrawerOpen(true)}>
                <Link2 size={14} className="mr-2" /> View Source Citations
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-8">
            <p className="text-lg text-foreground leading-relaxed">
              {renderReasoningWithCitations(report.ai_analysis.reasoning)}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border">
              <div className="space-y-4">
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 uppercase text-sm tracking-wider">
                  <CheckCircle size={16} /> Favorable Signals (Opportunities)
                </h3>
                <ul className="space-y-3">
                  {report.ai_analysis?.top_opportunities?.map((opp: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200 text-sm">
                      <span className="shrink-0 mt-0.5">•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-destructive flex items-center gap-2 uppercase text-sm tracking-wider">
                  <ShieldAlert size={16} /> Major Flags (Risks)
                </h3>
                <ul className="space-y-3">
                  {report.ai_analysis?.top_risks?.map((risk: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 bg-destructive/5 p-3 rounded-lg border border-destructive/10 text-destructive text-sm">
                      <span className="shrink-0 mt-0.5">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Data Tabs */}
        <div className="pt-4">
          <Tabs defaultValue="clinical" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted p-1 rounded-xl max-w-2xl mx-auto md:mx-0">
              <TabsTrigger value="clinical" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><Activity size={16} className="mr-2"/> Clinical Data</TabsTrigger>
              <TabsTrigger value="literature" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><BookOpen size={16} className="mr-2"/> Literature</TabsTrigger>
              <TabsTrigger value="regulatory" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"><Scale size={16} className="mr-2"/> Regulatory/Patents</TabsTrigger>
            </TabsList>
            
            <div className="mt-4">
              <TabsContent value="clinical" className="m-0 space-y-6">
                {report.clinical_data?.length > 0 && (
                  <>
                    <Card className="border-border shadow-sm overflow-hidden">
                      <CardHeader className="bg-muted/30 border-b border-border py-4">
                         <CardTitle className="text-sm font-semibold uppercase tracking-wider">Clinical Trials Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <IndicationMatrix clinicalData={report.clinical_data} />
                      </CardContent>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {report.clinical_data?.map((trial: any, i: number) => (
                        <Card key={i} className="border-border hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="font-mono bg-muted/50">{trial.id}</Badge>
                              <Badge className={
                                trial.status.toLowerCase().includes('completed') ? "bg-emerald-500 hover:bg-emerald-600" :
                                trial.status.toLowerCase().includes('terminated') ? "bg-destructive hover:bg-destructive/90" :
                                "bg-blue-500 hover:bg-blue-600"
                              }>{trial.status}</Badge>
                            </div>
                            <CardTitle className="text-base leading-tight mt-2">{trial.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm mt-2 p-4 bg-muted/20 rounded-lg">
                              <div>
                                <p className="text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-wider">Phase</p>
                                <p className="font-semibold">{trial.phase}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground font-medium mb-1 uppercase text-[10px] tracking-wider">Condition</p>
                                <p className="font-semibold truncate" title={trial.condition}>{trial.condition}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="literature" className="m-0 space-y-6">
                <TopInvestigators literatureData={report.literature_data} />
                
                <h3 className="text-lg font-bold mt-8 mb-4">Selected Publications</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {report.literature_data?.map((lit: any, i: number) => (
                    <Card key={i} className="border-border hover:border-primary/30 transition-colors">
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-lg mb-2">{lit.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" className="bg-muted">{lit.year}</Badge>
                          <span className="text-sm text-muted-foreground">Authors: {(lit.authors || []).slice(0,3).join(', ')}{(lit.authors?.length > 3 ? ' et al.' : '')}</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{lit.abstract}</p>
                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${lit.id}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium">
                          View on PubMed <ExternalLink size={14} />
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="regulatory" className="m-0 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.patent_data?.map((patent: any, i: number) => (
                    <Card key={i} className="flex flex-col border-border hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 border-b border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="font-mono text-xs">{patent.id}</Badge>
                          <Badge variant="secondary">{patent.year}</Badge>
                        </div>
                        <CardTitle className="text-base leading-snug">{patent.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4 flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground flex-1">Assignee: {patent.assignee || 'Unknown'}</p>
                        <a href={patent.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-4 font-medium">
                          <ExternalLink size={14} /> View Patent Source
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      {/* Sources Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-card border-l border-border shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="text-lg font-bold flex items-center gap-2"><BookOpen size={18}/> Citation References</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(false)} className="rounded-full">
                  <X size={18} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Clinical Trials</h3>
                  {report.clinical_data?.slice(0, 3).map((t: any, i: number) => (
                    <div key={i} className="text-sm p-4 bg-muted/30 rounded-lg border border-border">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-primary/10 text-primary text-[10px] font-bold rounded mr-2">C{i+1}</span>
                      <span className="font-medium">{t.id}</span>
                      <p className="text-muted-foreground mt-1 truncate" title={t.title}>{t.title}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Literature</h3>
                  {report.literature_data?.slice(0, 3).map((l: any, i: number) => (
                    <div key={i} className="text-sm p-4 bg-muted/30 rounded-lg border border-border">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-primary/10 text-primary text-[10px] font-bold rounded mr-2">L{i+1}</span>
                      <span className="font-medium">{l.title}</span>
                      <p className="text-muted-foreground mt-1">{l.year} • {(l.authors || [])[0]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
