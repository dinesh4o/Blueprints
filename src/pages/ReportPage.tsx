import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, ShieldAlert, CheckCircle, Activity, BookOpen, Scale, FileText, X, Download, Loader2, Link2, TrendingUp, DollarSign, Target, Search, FlaskConical, Atom, Box, AlertTriangle, Pill, Zap, Clock, Droplets, GitCompare } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import IndicationMatrix from '@/components/IndicationMatrix';
import TopInvestigators from '@/components/TopInvestigators';
import AnimatedMolecule from '@/components/AnimatedMolecule';
import AnimatedMolecule3D from '@/components/AnimatedMolecule3D';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [structureMode, setStructureMode] = useState<'2d' | '3d'>('2d');

  const INR_RATE = 83.5;
  const formatMarketSize = (usd_billion: number) => {
    if (currency === 'INR') {
      const inrBillion = usd_billion * INR_RATE;
      if (inrBillion >= 1000) return `₹${(inrBillion / 1000).toFixed(1)}T`;
      return `₹${inrBillion.toFixed(0)}B`;
    }
    return `$${usd_billion.toFixed(0)}B`;
  };

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

  // Fake molecule: show dedicated error page, no scores or structure
  if (report.is_fake) {
    return (
      <div className="flex-1 bg-background flex flex-col">
        <header className="w-full bg-card border-b border-border sticky top-0 z-50 shadow-sm flex justify-center">
          <div className="w-full max-w-6xl px-4 sm:px-6 h-16 flex items-center">
            <Button variant="ghost" onClick={() => navigate('/search')} className="text-muted-foreground hover:text-foreground -ml-4">
              <ArrowLeft size={16} className="mr-2" /> Back to Search
            </Button>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
            className="max-w-lg"
          >
            <div className="w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-6">
              <FlaskConical size={40} className="text-destructive" />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-3">Molecule Not Found</h1>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              <span className="font-semibold text-foreground">"{report.molecule}"</span> could not be verified in any pharmacological database.
            </p>
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 text-left space-y-3 mb-8">
              <p className="text-sm font-semibold text-destructive uppercase tracking-wider">Databases Searched</p>
              <div className="grid grid-cols-2 gap-3">
                {['PubChem (100M+ compounds)', 'ClinicalTrials.gov', 'PubMed / NCBI', 'FDA Registry'].map(db => (
                  <div key={db} className="bg-background border border-border rounded-lg p-3 text-center">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-1">
                      <X size={12} className="text-destructive" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">{db}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This may be a fictitious name, a typographical error, or a proprietary early-stage compound with no public data. Analysis was aborted to prevent AI hallucinations.
              </p>
            </div>
            <Button size="lg" onClick={() => navigate('/search')} className="gap-2">
              <Search size={16} /> Try Another Molecule
            </Button>
          </motion.div>
        </div>
      </div>
    );
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

  // Added explicit tracking to open side panel for specific categories if needed.
  return (
    <ErrorBoundary>
    <div className="flex-1 bg-background pb-12 pt-0 w-full flex flex-col items-center">

      {/* Header Bar */}
      <header className="w-full bg-card border-b border-border sticky top-0 z-50 shadow-sm flex justify-center">
        <div className="w-full max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate('/search')} className="text-muted-foreground hover:text-foreground -ml-4">
              <ArrowLeft size={16} className="mr-2" /> Back to Search
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {report.molecule} <span className="font-normal text-muted-foreground ml-2 hidden sm:inline">Analysis Report</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsDrawerOpen(true)}>
              <BookOpen size={14} className="mr-2" />
              <span className="hidden sm:inline">View References</span>
            </Button>
            <Button variant="default" size="sm" onClick={handleExportPdf} disabled={isExportingPdf}>
              {isExportingPdf ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Download size={14} className="mr-2" />}
              <span className="hidden sm:inline">Export Report</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl px-4 sm:px-6 py-8 space-y-8">

        {/* Top Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="col-span-1 lg:col-span-2 shadow-sm border-border flex flex-col p-6 bg-card">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Molecule Structure</h2>
              <div className="flex items-center gap-2">
                {report.pubchem_data?.cid && (
                  <a href={report.pubchem_data.pubchem_url} target="_blank" rel="noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium mr-2">
                    PubChem CID {report.pubchem_data.cid} <ExternalLink size={10} />
                  </a>
                )}
                {/* 2D / 3D Toggle */}
                <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
                  <Button size="sm" variant={structureMode === '2d' ? 'default' : 'ghost'}
                    className="h-6 px-2.5 text-xs gap-1" onClick={() => setStructureMode('2d')}>
                    <Atom size={11} /> 2D
                  </Button>
                  <Button size="sm" variant={structureMode === '3d' ? 'default' : 'ghost'}
                    className="h-6 px-2.5 text-xs gap-1" onClick={() => setStructureMode('3d')}>
                    <Box size={11} /> 3D
                  </Button>
                </div>
              </div>
            </div>

            <div className="w-full bg-muted/20 border border-border/50 rounded-xl flex items-center justify-center p-4" style={{ minHeight: '260px' }}>
              <AnimatePresence mode="wait">
                {structureMode === '2d' ? (
                  <motion.div key="2d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }} className="w-full h-full">
                    <AnimatedMolecule molecule={report.molecule} size={300} />
                  </motion.div>
                ) : (
                  <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }} className="w-full h-full">
                    <AnimatedMolecule3D cid={report.pubchem_data?.cid ?? null} height={250} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {report.pubchem_data?.exists && (
              <div className="mt-4 space-y-3">
                {/* Formula + MW */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Formula</p>
                    <p className="font-mono font-bold text-sm text-foreground">{report.pubchem_data.molecular_formula}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Mol. Weight</p>
                    <p className="font-bold text-sm text-foreground">{parseFloat(report.pubchem_data.molecular_weight).toFixed(2)} <span className="font-normal text-xs text-muted-foreground">g/mol</span></p>
                  </div>
                </div>

                {/* IUPAC Name */}
                {report.pubchem_data.iupac_name && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">IUPAC Name</p>
                    <p className="text-xs text-foreground font-mono leading-relaxed line-clamp-2" title={report.pubchem_data.iupac_name}>
                      {report.pubchem_data.iupac_name}
                    </p>
                  </div>
                )}

                {/* Drug-likeness chips */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'XLogP', value: report.pubchem_data.xlogp ?? '—', tip: 'Lipophilicity (ideally 0–5)' },
                    { label: 'HBD', value: report.pubchem_data.hbd ?? '—', tip: 'H-Bond Donors (ideally ≤5)' },
                    { label: 'HBA', value: report.pubchem_data.hba ?? '—', tip: 'H-Bond Acceptors (ideally ≤10)' },
                    { label: 'RB', value: report.pubchem_data.rotatable_bonds ?? '—', tip: 'Rotatable Bonds (ideally ≤10)' },
                  ].map(({ label, value, tip }) => (
                    <div key={label} className="bg-primary/5 border border-primary/10 rounded-lg p-2 text-center" title={tip}>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="font-bold text-sm text-primary mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* InChI Key */}
                {report.pubchem_data.inchi_key && (
                  <p className="text-[10px] font-mono text-muted-foreground truncate" title={report.pubchem_data.inchi_key}>
                    {report.pubchem_data.inchi_key}
                  </p>
                )}
              </div>
            )}
          </Card>

          <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <Card className={clsx("flex flex-col justify-center shadow-sm border", getScoreColor(report.viability_score))}>
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">AI Viability Score</h2>
                  <div className="text-xs font-medium opacity-70 flex items-center gap-1 uppercase tracking-wide">
                    <CheckCircle size={12} /> Confidence: {report.ai_analysis?.confidence ?? '—'}
                  </div>
                </div>
                <div className="text-7xl font-black tracking-tighter">
                  {(report.viability_score ?? 0).toFixed(1)}<span className="text-3xl font-medium opacity-50">/10</span>
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
                  {(report.phoenix_score ?? 0).toFixed(1)}<span className="text-3xl font-medium text-muted-foreground">/10</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Repurposing Candidates Section */}
        {report.repurposing_candidates?.length > 0 && (
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Target size={18} className="text-primary" /> Drug Repurposing Candidates
                </CardTitle>
                <Badge variant="secondary" className="text-sm">{report.repurposing_candidates.length} Indications Found</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Conditions where <span className="font-semibold text-foreground">{report.molecule}</span> has active or completed clinical evidence, ranked by repurposing potential.</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {report.repurposing_candidates.map((candidate: any, i: number) => {
                  const score = candidate.repurposing_score;
                  const scoreColor = score >= 7.5 ? 'text-emerald-600 dark:text-emerald-400' : score >= 5.5 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400';
                  const bgColor = score >= 7.5 ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' : score >= 5.5 ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={clsx("rounded-xl border p-4 flex flex-col gap-3", bgColor)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-foreground text-sm leading-tight">{candidate.condition}</p>
                        <span className={clsx("text-xl font-black tracking-tight shrink-0", scoreColor)}>
                          {score.toFixed(1)}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Phase</span>
                          <Badge variant="outline" className="text-[10px] font-mono py-0">{candidate.max_phase}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Trials</span>
                          <span className="font-semibold text-foreground">{candidate.trial_count}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Market Est.</span>
                          <span className="font-semibold text-foreground">{formatMarketSize(candidate.market_size_usd_billion)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-1.5">
                        <div className={clsx("h-1.5 rounded-full", score >= 7.5 ? 'bg-emerald-500' : score >= 5.5 ? 'bg-amber-500' : 'bg-blue-500')} style={{ width: `${(score / 10) * 100}%` }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Pharmacological Profile ── */}
        {report.pubchem_data?.exists && (report.pubchem_data.mechanism_of_action || report.pubchem_data.pharmacology || report.pubchem_data.atc_codes?.length > 0 || report.pubchem_data.associated_diseases?.length > 0) && (
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Pill size={18} className="text-primary" /> Pharmacological Profile
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Sourced from PubChem PUG View — Sections 7, 8 &amp; 13.</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">

              {/* MOA + Pharmacology */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.pubchem_data.mechanism_of_action && (
                  <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"><Zap size={12} /> Mechanism of Action</h4>
                    <p className="text-sm text-foreground leading-relaxed">{report.pubchem_data.mechanism_of_action}</p>
                  </div>
                )}
                {report.pubchem_data.pharmacology && (
                  <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Activity size={12} /> Pharmacology</h4>
                    <p className="text-sm text-foreground leading-relaxed">{report.pubchem_data.pharmacology}</p>
                  </div>
                )}
              </div>

              {/* ADME row */}
              {(report.pubchem_data.half_life || report.pubchem_data.protein_binding || report.pubchem_data.metabolism || report.pubchem_data.absorption) && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5"><Clock size={12} /> ADME (Absorption · Distribution · Metabolism · Excretion)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Absorption', value: report.pubchem_data.absorption, icon: <Droplets size={12} /> },
                      { label: 'Protein Binding', value: report.pubchem_data.protein_binding, icon: <Atom size={12} /> },
                      { label: 'Metabolism', value: report.pubchem_data.metabolism, icon: <Zap size={12} /> },
                      { label: 'Half-Life', value: report.pubchem_data.half_life, icon: <Clock size={12} /> },
                    ].filter(i => i.value).map(item => (
                      <div key={item.label} className="bg-muted/20 rounded-lg p-3 border border-border/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">{item.icon}{item.label}</p>
                        <p className="text-xs text-foreground leading-relaxed line-clamp-3">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ATC Classification + Drug Classes */}
              {(report.pubchem_data.atc_codes?.length > 0 || report.pubchem_data.drug_classes?.length > 0) && (
                <div className="flex flex-wrap gap-4">
                  {report.pubchem_data.atc_codes?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">ATC Classification</p>
                      <div className="flex flex-wrap gap-1.5">
                        {report.pubchem_data.atc_codes.map((code: string, i: number) => (
                          <Badge key={i} variant="secondary" className="font-mono text-xs">{code}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {report.pubchem_data.routes_of_admin?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Routes of Administration</p>
                      <div className="flex flex-wrap gap-1.5">
                        {report.pubchem_data.routes_of_admin.map((r: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Toxicity */}
              {(report.pubchem_data.ld50_text || report.pubchem_data.tox_summary) && (
                <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5"><AlertTriangle size={12} /> Toxicity (PubChem Section 12)</h4>
                  {report.pubchem_data.ld50_text && <p className="text-xs text-foreground"><span className="font-semibold">LD₅₀:</span> {report.pubchem_data.ld50_text}</p>}
                  {report.pubchem_data.tox_summary && <p className="text-xs text-muted-foreground leading-relaxed">{report.pubchem_data.tox_summary}</p>}
                </div>
              )}

              {/* Associated Diseases (Section 13) */}
              {report.pubchem_data.associated_diseases?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5"><Target size={12} /> Associated Disorders &amp; Diseases (PubChem Section 13)</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.pubchem_data.associated_diseases.map((disease: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">{disease}</Badge>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        )}

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
            <div className="bg-muted/20 p-5 rounded-lg border border-border/50 shadow-inner">
              <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                {renderReasoningWithCitations(
                  Array.isArray(report.ai_analysis.reasoning)
                    ? report.ai_analysis.reasoning.join('\n\n')
                    : (report.ai_analysis.reasoning || '')
                )}
              </p>
            </div>
            
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

        {/* ── Structural Analogs & Repurposing Leads ── */}
        {report.similar_molecules?.length > 0 && (
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <GitCompare size={18} className="text-primary" /> Structural Analogs &amp; Repurposing Leads
                </CardTitle>
                <Badge variant="secondary">{report.similar_molecules.length} analogs · Tanimoto ≥ 90%</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Structurally similar compounds found via PubChem fastsimilarity search. Their clinical histories reveal barriers — and opportunities — for repurposing <span className="font-semibold text-foreground">{report.molecule}</span>.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {report.similar_molecules.map((analog: any, i: number) => {
                const potentialColor =
                  analog.repurposing_potential === 'High'        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400' :
                  analog.repurposing_potential === 'Moderate'    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amberee-900/40 text-amber-700 dark:text-amber-400' :
                  analog.repurposing_potential === 'Active'      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400' :
                                                                   'bg-muted/30 border-border text-muted-foreground';
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className={clsx('rounded-xl border p-4 space-y-3', potentialColor)}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground">{analog.name}</h4>
                          <span className="font-mono text-xs text-muted-foreground">{analog.formula}</span>
                          <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${analog.cid}`} target="_blank" rel="noreferrer"
                            className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                            CID {analog.cid} <ExternalLink size={8} />
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>MW: {parseFloat(analog.molecular_weight || 0).toFixed(1)} g/mol</span>
                          {analog.xlogp != null && <span>XLogP: {analog.xlogp}</span>}
                          {analog.total_trials > 0 && <span>{analog.total_trials} trial{analog.total_trials > 1 ? 's' : ''}</span>}
                          {analog.failed_trials > 0 && <span className="text-destructive font-medium">{analog.failed_trials} terminated</span>}
                        </div>
                      </div>
                      <Badge className={clsx('text-xs shrink-0', analog.repurposing_potential === 'High' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : analog.repurposing_potential === 'Moderate' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : analog.repurposing_potential === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : '')}>
                        {analog.repurposing_potential}
                      </Badge>
                    </div>

                    {/* Conditions */}
                    {(analog.conditions?.length > 0 || analog.failed_conditions?.length > 0) && (
                      <div className="flex gap-4 flex-wrap text-xs">
                        {analog.conditions?.length > 0 && (
                          <div><span className="font-semibold text-muted-foreground">Trialed for: </span>
                            {analog.conditions.map((c: string, ci: number) => <Badge key={ci} variant="outline" className="mr-1 text-[10px] py-0">{c}</Badge>)}
                          </div>
                        )}
                        {analog.failed_conditions?.length > 0 && (
                          <div><span className="font-semibold text-destructive">Failed in: </span>
                            {analog.failed_conditions.map((c: string, ci: number) => <Badge key={ci} className="mr-1 text-[10px] py-0 bg-destructive/10 text-destructive border-destructive/20">{c}</Badge>)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Repurposing insight */}
                    <div className="bg-background/60 rounded-lg p-3 border border-border/40">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Repurposing Insight: </span>
                        {analog.repurposing_insight}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Market Analysis Section */}
        {report.market_analysis?.length > 0 && (
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border py-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" /> Market Opportunity Analysis
                </CardTitle>
                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={currency === 'USD' ? 'default' : 'ghost'}
                    className="h-7 px-3 text-xs gap-1"
                    onClick={() => setCurrency('USD')}
                  >
                    <DollarSign size={12} /> USD
                  </Button>
                  <Button
                    size="sm"
                    variant={currency === 'INR' ? 'default' : 'ghost'}
                    className="h-7 px-3 text-xs"
                    onClick={() => setCurrency('INR')}
                  >
                    ₹ INR
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Estimated global market sizes for each repurposing indication. {currency === 'INR' ? `Converted at ₹${(83.5).toFixed(1)}/USD.` : 'Values in USD billions.'}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {report.market_analysis.map((item: any, i: number) => {
                  const maxSize = Math.max(...report.market_analysis.map((m: any) => m.market_size_usd_billion));
                  const pct = (item.market_size_usd_billion / maxSize) * 100;
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-foreground truncate">{item.condition}</span>
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0 py-0">{item.max_phase}</Badge>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+{item.growth_rate_pct}% CAGR</span>
                          <span className="font-bold text-foreground w-16 text-right">{formatMarketSize(item.market_size_usd_billion)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2.5">
                        <motion.div
                          className="h-2.5 rounded-full bg-gradient-to-r from-primary/70 to-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
                * Market size estimates are based on published therapeutic area reports and are indicative. Actual addressable market depends on indication specificity, competitive landscape, and clinical success rates.
              </p>
            </CardContent>
          </Card>
        )}

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
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Activity size={16} /> Clinical Trials Data
                  </h3>
                  {report.clinical_data?.map((t: any, i: number) => (
                    <div key={i} className="text-sm p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                          Trial {i+1}
                        </span>
                        <a href={`https://clinicaltrials.gov/study/${t.nctId || t.id}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                          {t.nctId || t.id} <ExternalLink size={10} />
                        </a>
                      </div>
                      <p className="font-medium text-foreground">{t.title || t.condition || 'Clinical Trial Record'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px]">{t.phase || 'Unknown Phase'}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{t.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {(!report.clinical_data || report.clinical_data.length === 0) && (
                    <p className="text-sm text-muted-foreground">No clinical trial references found.</p>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <BookOpen size={16} /> Literature & Publications
                  </h3>
                  {report.literature_data?.map((l: any, i: number) => (
                    <div key={i} className="text-sm p-4 bg-muted/30 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                          Paper {i+1}
                        </span>
                        {l.id && (
                          <a href={`https://pubmed.ncbi.nlm.nih.gov/${l.id}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                            PubMed <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <p className="font-medium text-foreground">{l.title}</p>
                      <p className="text-muted-foreground mt-2 text-xs">
                        {l.journal} • {l.year} {l.authors?.length > 0 && `• ${(l.authors || [])[0]} et al.`}
                      </p>
                    </div>
                  ))}
                  {(!report.literature_data || report.literature_data.length === 0) && (
                    <p className="text-sm text-muted-foreground">No publication references found.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}
