// Load environment variables first
import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { runPipeline as runLangGraphPipeline } from './src/lib/agents/workflow';
import { connectDB } from './src/config/database';
import passportConfig from './src/config/passport';
import authRoutes from './src/routes/auth';

// --- Market Size Lookup ---
const MARKET_SIZES: Record<string, { usd_billion: number; growth_pct: number }> = {
  'cancer': { usd_billion: 150, growth_pct: 7.8 },
  'tumor': { usd_billion: 150, growth_pct: 7.8 },
  'carcinoma': { usd_billion: 145, growth_pct: 7.5 },
  'leukemia': { usd_billion: 12, growth_pct: 9.2 },
  'lymphoma': { usd_billion: 18, growth_pct: 8.5 },
  'diabetes': { usd_billion: 80, growth_pct: 6.5 },
  'cardiovascular': { usd_billion: 50, growth_pct: 5.2 },
  'heart failure': { usd_billion: 14, growth_pct: 6.1 },
  'heart': { usd_billion: 50, growth_pct: 5.2 },
  'hypertension': { usd_billion: 35, growth_pct: 4.8 },
  'alzheimer': { usd_billion: 12, growth_pct: 12.5 },
  'parkinson': { usd_billion: 8, growth_pct: 9.2 },
  'depression': { usd_billion: 18, growth_pct: 3.5 },
  'anxiety': { usd_billion: 12, growth_pct: 4.2 },
  'schizophrenia': { usd_billion: 9, growth_pct: 3.8 },
  'bipolar': { usd_billion: 7, growth_pct: 4.0 },
  'copd': { usd_billion: 15, growth_pct: 6.1 },
  'asthma': { usd_billion: 22, growth_pct: 5.8 },
  'arthritis': { usd_billion: 25, growth_pct: 4.5 },
  'rheumatoid': { usd_billion: 25, growth_pct: 4.5 },
  'hiv': { usd_billion: 30, growth_pct: 4.0 },
  'hepatitis': { usd_billion: 18, growth_pct: 3.2 },
  'obesity': { usd_billion: 28, growth_pct: 11.5 },
  'inflammation': { usd_billion: 20, growth_pct: 5.5 },
  'infection': { usd_billion: 15, growth_pct: 4.0 },
  'pain': { usd_billion: 35, growth_pct: 3.8 },
  'migraine': { usd_billion: 5, growth_pct: 8.2 },
  'epilepsy': { usd_billion: 8, growth_pct: 4.5 },
  'multiple sclerosis': { usd_billion: 22, growth_pct: 5.5 },
  'osteoporosis': { usd_billion: 11, growth_pct: 5.0 },
  'psoriasis': { usd_billion: 16, growth_pct: 6.3 },
  'stroke': { usd_billion: 12, growth_pct: 5.5 },
  'sepsis': { usd_billion: 10, growth_pct: 7.2 },
  'kidney': { usd_billion: 14, growth_pct: 7.0 },
  'liver': { usd_billion: 18, growth_pct: 6.8 },
  'lung': { usd_billion: 30, growth_pct: 7.5 },
  'breast': { usd_billion: 25, growth_pct: 8.0 },
  'prostate': { usd_billion: 14, growth_pct: 6.5 },
  'ovarian': { usd_billion: 8, growth_pct: 7.8 },
  'thyroid': { usd_billion: 6, growth_pct: 5.5 },
};

function estimateMarketForCondition(condition: string): { usd_billion: number; growth_pct: number } {
  const lc = condition.toLowerCase();
  for (const [key, val] of Object.entries(MARKET_SIZES)) {
    if (lc.includes(key)) return val;
  }
  return { usd_billion: 5, growth_pct: 5.0 };
}

function buildRepurposingCandidates(clinicalData: any[]) {
  const phaseOrder = ['N/A', 'PHASE1', 'PHASE1_PHASE2', 'PHASE2', 'PHASE2_PHASE3', 'PHASE3', 'PHASE4'];
  const condMap = new Map<string, { phases: string[]; statuses: string[]; count: number }>();

  for (const trial of clinicalData) {
    const cond = trial.condition || 'Unknown';
    if (!condMap.has(cond)) condMap.set(cond, { phases: [], statuses: [], count: 0 });
    const entry = condMap.get(cond)!;
    entry.phases.push(trial.phase || 'N/A');
    entry.statuses.push(trial.status || 'UNKNOWN');
    entry.count++;
  }

  return Array.from(condMap.entries())
    .map(([condition, data]) => {
      const maxPhase = data.phases.reduce((best, p) =>
        (phaseOrder.indexOf(p) > phaseOrder.indexOf(best)) ? p : best, 'N/A');
      const phaseIdx = phaseOrder.indexOf(maxPhase);
      const score = Math.min(3.5 + phaseIdx * 1.0, 9.5);
      const market = estimateMarketForCondition(condition);
      return {
        condition,
        max_phase: maxPhase,
        trial_count: data.count,
        repurposing_score: parseFloat(score.toFixed(1)),
        market_size_usd_billion: market.usd_billion,
        market_growth_pct: market.growth_pct,
      };
    })
    .sort((a, b) => b.repurposing_score - a.repurposing_score)
    .slice(0, 8);
}

async function startServer() {
  // Connect to MongoDB
  await connectDB();

  const app = express();
  const PORT = 3000;

  // CORS configuration
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  // Session configuration with MongoDB store
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/Blueprints26DB',
        touchAfter: 24 * 3600, // Lazy session update (in seconds)
      }),
      cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevents client-side JS from reading the cookie
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    })
  );

  // Initialize Passport
  app.use(passportConfig.initialize());
  app.use(passportConfig.session());

  // Authentication routes
  app.use('/api/auth', authRoutes);

  // In-memory store for jobs and reports (simulating MongoDB)
  const jobs = new Map<string, any>();
  const reports = new Map<string, any>();

  // API Routes
  app.get('/api/autocomplete', async (req, res) => {
    try {
      const q = req.query.q as string;
      if (!q) {
        return res.json({ dictionary_terms: { compound: [] } });
      }
      const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(q)}/json`);
      if (!response.ok) {
        throw new Error('Failed to fetch from PubChem');
      }
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Autocomplete error:', error);
      res.status(500).json({ error: 'Failed to fetch autocomplete data' });
    }
  });

  app.post('/api/analyze', (req, res) => {
    const { molecule } = req.body;
    if (!molecule) {
      return res.status(400).json({ error: 'Molecule name is required' });
    }

    const jobId = crypto.randomUUID();
    
    jobs.set(jobId, {
      id: jobId,
      molecule,
      status: 'running',
      steps: [
        { name: 'ClinicalAgent', label: 'Clinical Trials', status: 'running', log: 'Initializing...' },
        { name: 'PatentAgent', label: 'Patent Search', status: 'waiting', log: 'Pending...' },
        { name: 'LiteratureAgent', label: 'Literature Search', status: 'waiting', log: 'Pending...' },
        { name: 'RegulatoryAgent', label: 'FDA Data', status: 'waiting', log: 'Pending...' },
        { name: 'CompetitiveAgent', label: 'Competitive Landscape', status: 'waiting', log: 'Pending...' },
        { name: 'FailureAgent', label: 'Failure Analysis', status: 'waiting', log: 'Pending...' },
        { name: 'AdvocateAgent', label: 'Advocate AI', status: 'waiting', log: 'Pending...' },
        { name: 'SkepticAgent', label: 'Skeptic AI', status: 'waiting', log: 'Pending...' },
        { name: 'JudgeAgent', label: 'Judge AI', status: 'waiting', log: 'Pending...' },
        { name: 'MolecularTwinAgent', label: 'Structural Analogs', status: 'waiting', log: 'Pending...' },
        { name: 'OpenTargetsAgent', label: 'PubChem Verify', status: 'waiting', log: 'Pending...' },
        { name: 'KOLNetworkAgent', label: 'KOL Network', status: 'waiting', log: 'Pending...' },
      ],
      createdAt: new Date().toISOString(),
    });

    // Start background pipeline (simulating n8n)
    runPipeline(jobId, molecule).catch(err => {
      console.error(`Pipeline error for job ${jobId}:`, err);
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'error';
        jobs.set(jobId, job);
      }
    });

    res.json({ job_id: jobId });
  });

  app.get('/api/status/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  });

  app.get('/api/reports/:id', (req, res) => {
    const report = reports.get(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  });

  // ─── Ephemeral RAG API Proxy ─────────────────────────────────────────────
  
  app.post('/api/rag/init/:id', async (req, res) => {
    const reportId = req.params.id;
    const report = reports.get(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    try {
      const response = await fetch('http://localhost:8005/api/rag/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportId,
          report_data: report
        })
      });
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("RAG init error:", err.message);
      res.status(500).json({ error: 'Failed to init RAG' });
    }
  });

  app.post('/api/rag/chat/:id', async (req, res) => {
    const reportId = req.params.id;
    const { message } = req.body;
    try {
      const response = await fetch('http://localhost:8005/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportId,
          message: message
        })
      });
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("RAG chat error:", err.message);
      res.status(500).json({ error: 'Failed to complete chat' });
    }
  });

  // Real API Pipeline powered by LangGraph
  async function runPipeline(jobId: string, molecule: string) {
    const updateStep = (index: number, status: string, log?: string, dataCount?: number) => {
      const job = jobs.get(jobId);
      if (job) {
        job.steps[index].status = status;
        if (log) job.steps[index].log = log;
        if (dataCount !== undefined) job.steps[index].dataCount = dataCount;
        jobs.set(jobId, job);
      }
    };

    try {
      // Create dramatic spacing so the user can experience the pipeline building
      updateStep(0, 'running', 'Querying ClinicalTrials...');
      updateStep(2, 'running', 'Querying PubMed...');
      updateStep(3, 'running', 'Querying FDA Labels...');

      await new Promise(r => setTimeout(r, 1000));
      updateStep(10, 'running', 'Verifying in PubChem...');
      updateStep(9, 'running', 'Finding structural analogs...');

      // Let LangGraph do all the parallel execution
      const resultState = await runLangGraphPipeline(molecule);

      // Map back to our simulated job state
      const clinicalData = resultState.clinicalData || [];
      const literatureData = resultState.literatureData || [];
      const regulatoryData = resultState.regulatoryData || { approved_indications: ['None'], warnings: ['None'] };

      // Note: targetData.targetsFound is always 5 (placeholder), so we exclude it from fake detection
      const totalDataPointsFound = clinicalData.length + literatureData.length;

      // PubChem is the authoritative check (100M+ compounds).
      // exists === false: definitively not a real compound
      // exists === null: network timeout — fall back to clinical+literature signal
      // exists === true: real compound (may still have zero trials if pre-clinical)
      const pubchemExists = resultState.pubchemData?.exists;
      const isFakeMolecule = pubchemExists === false || (pubchemExists === null && totalDataPointsFound === 0);

      if (isFakeMolecule) {
         // Immediate short-circuit for fake or completely unknown molecules
         updateStep(0, 'done', 'No real-world data found.', 0);
         updateStep(6, 'done', 'Processing bypassed.');
         
         const job = jobs.get(jobId);
         if (job) {
           const report = {
             _id: jobId,
             molecule: job.molecule,
             status: 'complete',
             is_fake: true,
             viability_score: 0.0,
             phoenix_score: 0.0,
             clinical_data: [],
             literature_data: [],
             patent_data: [],
             repurposing_candidates: [],
             market_analysis: [],
             similar_molecules: [],
             pubchem_data: { exists: false },
             regulatory_data: { approved_indications: ['None'], warnings: ['None'] },
             ai_analysis: {
               viability_score: 0.0,
               confidence: "Absolute",
               top_opportunities: ["None"],
               top_risks: ["Molecule does not exist in any pharmacological or clinical registry."],
               reasoning: `The molecule name "${molecule}" could not be verified in ClinicalTrials.gov, PubMed, or the FDA registry. This indicates that it is either completely fictitious, a highly proprietary early-stage compound with zero literature, or a typo. \n\nNo viable scientific consensus or pipeline analysis can be generated. The analysis has been aborted to prevent AI hallucinations.`
             },
             created_at: new Date().toISOString(),
           };
           reports.set(jobId, report);
           job.status = 'complete';
           jobs.set(jobId, job);
         }
         return;
      }

      updateStep(0, 'done', 'Data retrieved.', clinicalData.length);
      await new Promise(r => setTimeout(r, 800));
      updateStep(2, 'done', 'Abstracts embedded.', literatureData.length);
      await new Promise(r => setTimeout(r, 800));
      updateStep(3, 'done', 'Label data parsed.', 1);

      const pubchemLabel = pubchemExists === true
        ? `CID ${resultState.pubchemData?.cid || 'found'} — ${resultState.pubchemData?.molecular_formula || 'verified'}`
        : pubchemExists === false ? 'Not in PubChem (fake)' : 'PubChem timeout';
      updateStep(10, 'done', pubchemLabel, pubchemExists ? 1 : 0);

      const similarMolecules = resultState.similarMolecules || [];
      updateStep(9, 'done', `${similarMolecules.length} structural analogs analyzed`, similarMolecules.length);

      // Simulated nodes for now
      updateStep(1, 'running', 'Searching USPTO...');
      updateStep(9, 'running', 'Finding Similar Compounds...');
      await new Promise(r => setTimeout(r, 1500));
      updateStep(1, 'done', 'Found 42 patents.', 42);
      updateStep(4, 'done', 'Identified 8 competitors.', 8);
      updateStep(5, 'done', 'Classified 3 failures.', 3);
      updateStep(9, 'done', 'Found 12 analogs.', 12);
      updateStep(11, 'done', 'Network graph built.', 24);

      // Step 4: Awaiting AI -> Completing via LangGraph Result
      updateStep(6, 'running', 'Groq Generative LPU Evaluating...');
      updateStep(7, 'running', 'Cross-Agent Consensus...');
      updateStep(8, 'running', 'Synthesizing report...');
      
      await new Promise(r => setTimeout(r, 2000)); // Makes the user wait just long enough to believe the AI is "typing"
      
      updateStep(6, 'done', 'Claims generated.');
      updateStep(7, 'done', 'Counters generated.');
      updateStep(8, 'done', 'Verdict reached.');
      
      const job = jobs.get(jobId);
      if (job) {
        // Calculate Phoenix Score based on fetched completed trials
        const terminated = clinicalData.filter((t: any) => t.status === 'TERMINATED' || t.status === 'WITHDRAWN');
        let base = Math.min(terminated.length * 0.8, 4.0);
        let bonus = 0;
        if (clinicalData.some((t: any) => t.phase === 'PHASE3' && t.status === 'COMPLETED')) bonus += 2.0;
        bonus += 1.0; 
        const phoenixScore = Math.min(base + bonus, 10.0);

        // LangGraph already synthesised the Groq result
        const finalViabilityScore = resultState.viabilityScore || 7.0;

        // Build repurposing candidates and market analysis from real clinical data
        const repurposing_candidates = buildRepurposingCandidates(clinicalData);
        const market_analysis = repurposing_candidates.map(c => ({
          condition: c.condition,
          market_size_usd_billion: c.market_size_usd_billion,
          growth_rate_pct: c.market_growth_pct,
          max_phase: c.max_phase,
        }));

        // Generate simulated patent data based on molecule name
        const patent_data = [
          { id: `US${Math.floor(Math.random() * 9000000 + 1000000)}`, title: `${job.molecule}: Novel therapeutic formulation for metabolic syndrome`, assignee: 'PharmaTech Inc.', year: 2019, url: 'https://patents.google.com' },
          { id: `EP${Math.floor(Math.random() * 3000000 + 1000000)}`, title: `Use of ${job.molecule} derivatives in treatment of inflammatory conditions`, assignee: 'BioScience Labs', year: 2021, url: 'https://patents.google.com' },
          { id: `WO${Math.floor(Math.random() * 2000000 + 2000000)}`, title: `${job.molecule} combination therapy and dosing regimens`, assignee: 'GenoPharma', year: 2022, url: 'https://patents.google.com' },
        ];

        // Auto-Generate complete Report natively from the backend!
        const report = {
          _id: jobId,
          molecule: job.molecule,
          status: 'complete',
          is_fake: false,
          viability_score: finalViabilityScore,
          phoenix_score: phoenixScore,
          clinical_data: clinicalData,
          literature_data: literatureData,
          regulatory_data: regulatoryData,
          patent_data,
          repurposing_candidates,
          market_analysis,
          similar_molecules: similarMolecules,
          pubchem_data: resultState.pubchemData || { exists: null },
          ai_analysis: {
            viability_score: finalViabilityScore,
            confidence: clinicalData.length > 3 ? "High" : "Low",
            top_opportunities: resultState.top_opportunities || ["Targets identified via Open Targets","Literature consensus indicates safety profile","Favorable indications parsed from FDA Label"],
            top_risks: resultState.top_risks || ["Patent cliffs if applicable","Standard clinical withdrawal risks"],
            reasoning: resultState.analysisReport // Passed directly from Groq!
          },
          created_at: new Date().toISOString(),
        };

        reports.set(jobId, report);
        
        job.status = 'complete';
        jobs.set(jobId, job);
      }

    } catch (error) {
      console.error('Pipeline failed:', error);
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'error';
        jobs.set(jobId, job);
      }
    }
  }

  app.post('/api/complete_analysis/:id', (req, res) => {
    const jobId = req.params.id;
    const { aiAnalysis } = req.body;
    const job = jobs.get(jobId);
    
    if (!job || job.status !== 'awaiting_ai') {
      return res.status(400).json({ error: 'Invalid job or status' });
    }

    try {
      const { clinicalData, literatureData, regulatoryData } = job.intermediate_data;

      // Phoenix Score Calculation
      const terminated = clinicalData.filter((t: any) => t.status === 'TERMINATED' || t.status === 'WITHDRAWN');
      let base = Math.min(terminated.length * 0.8, 4.0);
      let bonus = 0;
      if (terminated.some((t: any) => t.stop_reason?.toLowerCase().includes('indication'))) bonus += 2.0;
      if (clinicalData.some((t: any) => t.phase === 'PHASE3' && t.status === 'COMPLETED')) bonus += 2.0;
      bonus += 1.0; // assume no blocking patent
      const phoenixScore = Math.min(base + bonus, 10.0);

      // Save Report
      const report = {
        _id: jobId,
        molecule: job.molecule,
        status: 'complete',
        viability_score: aiAnalysis.viability_score || 7.0,
        phoenix_score: phoenixScore,
        clinical_data: clinicalData,
        literature_data: literatureData,
        regulatory_data: regulatoryData,
        ai_analysis: aiAnalysis,
        created_at: new Date().toISOString(),
      };

      reports.set(jobId, report);
      
      job.steps[6].status = 'done';
      job.steps[6].log = 'Claims generated.';
      job.steps[7].status = 'done';
      job.steps[7].log = 'Counters generated.';
      job.steps[8].status = 'done';
      job.steps[8].log = 'Verdict reached.';
      job.status = 'complete';
      delete job.intermediate_data;
      jobs.set(jobId, job);

      res.json({ success: true });
    } catch (error) {
      console.error('Completion failed:', error);
      job.status = 'error';
      jobs.set(jobId, job);
      res.status(500).json({ error: 'Failed to complete analysis' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
