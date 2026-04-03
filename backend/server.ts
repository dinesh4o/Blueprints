import './env';
// Load environment variables first
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Root .env or specific fallback
dotenv.config(); // fallback to local just in case

import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './src/config/database';
import passportConfig from './src/config/passport';
import authRoutes from './src/routes/auth';
import communityRoutes from './src/routes/community';
import dashboardRoutes from './src/routes/dashboard';
import { Job } from './src/models/Job';

import { generateReportLaTeX } from './src/lib/pdfGenerator';

// --- Fallback Key Helper ---
function getGroqKeys(usage: 'chat' | 'market' = 'chat'): string[] {
  let envVar = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
  if (usage === 'chat') envVar = process.env.GROQ_API_KEYS_CHAT || envVar;
  if (usage === 'market') envVar = process.env.GROQ_API_KEYS_MARKET || envVar;

  let keys = envVar.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  // Randomize the order of keys to distribute load and avoid immediate rate limits on a single key
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  
  return keys;
}

// --- Market Size Estimates via LLM ---
// Calls Groq with the EXACT condition names from clinical data so matching is perfect.
async function fetchMarketEstimates(conditions: string[]): Promise<Record<string, { market_size_usd_billion: number; growth_pct: number }>> {
  if (!conditions.length) return {};
  const keys = getGroqKeys('market');
  if (keys.length === 0) {
    console.error('[MarketEstimates] GROQ_API_KEYS not set — returning empty market data.');
    return {};
  }
  
  let lastError = null;
  for (const key of keys) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(12000),
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Respond only with valid JSON. No text outside the JSON object.' },
            { role: 'user', content: `You are a pharmaceutical market analyst. For each disease condition below, provide your best estimate of the current global pharmaceutical market size (USD billions) and annual CAGR growth rate (%). Return a JSON object where each key is EXACTLY the condition string provided and the value is {"market_size_usd_billion": <number>, "growth_pct": <number>}.\n\nConditions:\n${conditions.map(c => `- "${c}"`).join('\n')}` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        })
      });
      if (res.status === 429 || res.status === 401) {
         console.warn(`[MarketEstimates] Groq key failed with status ${res.status}, trying next...`);
         continue;
      }
      if (!res.ok) throw new Error(`Groq API Error: ${res.status}`);
      const data = await res.json() as any;
      return JSON.parse(data.choices[0].message.content) as Record<string, { market_size_usd_billion: number; growth_pct: number }>;
    } catch (e) {
      lastError = e;
      console.warn(`[MarketEstimates] Fetch failed: ${(e as Error).message}. Trying next key...`);
      continue; // Try next key — Groq cloud supports multi-key retry
    }
  }
  console.error('[MarketEstimates] All keys failed:', lastError);
  return {};
}

// --- Non-disease term filter --- (removes clinical outcome descriptors that leak in)
const NON_DISEASE_TERMS = new Set([
  'efficacy', 'safety', 'tolerability', 'pharmacokinetics', 'pharmacodynamics',
  'bioavailability', 'dose', 'dosing', 'bioequivalence', 'outcomes', 'quality of life',
  'adherence', 'compliance', 'prevention', 'treatment', 'therapy', 'intervention',
  'management', 'response', 'remission', 'endpoint', 'primary endpoint', 'secondary endpoint',
  'mortality', 'morbidity', 'adverse events', 'side effects', 'toxicity', 'mechanism',
]);

function isRealDiseaseCondition(name: string): boolean {
  const lower = name.trim().toLowerCase().replace(/\s+/g, ' ');
  // Reject very short terms (likely acronyms or descriptors)
  if (lower.length < 4) return false;
  // Reject known non-disease terms
  if (NON_DISEASE_TERMS.has(lower)) return false;
  // Reject purely numeric or single-word non-medical terms
  if (/^\d+$/.test(lower)) return false;
  return true;
}

// --- Disease name normalization (fixes identical market data for synonymous conditions) ---
const DISEASE_SYNONYMS: Record<string, string> = {
  // Type 2 Diabetes variants (including comma-order: "Diabetes Mellitus, Type 2")
  'type 2 diabetes': 'type 2 diabetes mellitus',
  'diabetes mellitus type 2': 'type 2 diabetes mellitus',
  'diabetes mellitus, type 2': 'type 2 diabetes mellitus',
  'diabetes mellitus type ii': 'type 2 diabetes mellitus',
  'diabetes mellitus, type ii': 'type 2 diabetes mellitus',
  'type ii diabetes': 'type 2 diabetes mellitus',
  'type2 diabetes': 'type 2 diabetes mellitus',
  'type2 diabetes mellitus': 'type 2 diabetes mellitus',
  't2dm': 'type 2 diabetes mellitus',
  'non-insulin-dependent diabetes mellitus': 'type 2 diabetes mellitus',
  'niddm': 'type 2 diabetes mellitus',
  // Type 1 Diabetes variants
  'type 1 diabetes': 'type 1 diabetes mellitus',
  'diabetes mellitus type 1': 'type 1 diabetes mellitus',
  'diabetes mellitus, type 1': 'type 1 diabetes mellitus',
  'diabetes mellitus type i': 'type 1 diabetes mellitus',
  'diabetes mellitus, type i': 'type 1 diabetes mellitus',
  'type i diabetes': 'type 1 diabetes mellitus',
  't1dm': 'type 1 diabetes mellitus',
  'insulin-dependent diabetes mellitus': 'type 1 diabetes mellitus',
  'iddm': 'type 1 diabetes mellitus',
  // General Diabetes (catch-all)
  'diabetes mellitus': 'diabetes mellitus',
  'diabetes': 'diabetes mellitus',
  // Hypertension
  'high blood pressure': 'hypertension',
  'arterial hypertension': 'hypertension',
  'essential hypertension': 'hypertension',
  'hypertension, essential': 'hypertension',
  // Heart failure
  'congestive heart failure': 'heart failure',
  'chf': 'heart failure',
  'cardiac failure': 'heart failure',
  'heart failure, congestive': 'heart failure',
  // Alzheimer
  "alzheimer's disease": 'alzheimer disease',
  "alzheimer's": 'alzheimer disease',
  'alzheimers disease': 'alzheimer disease',
  'alzheimer disease': 'alzheimer disease',
  'dementia of the alzheimer type': 'alzheimer disease',
  'dementia of alzheimer type': 'alzheimer disease',
  // Liver disease
  'nafld': 'non-alcoholic fatty liver disease',
  'nash': 'non-alcoholic steatohepatitis',
  // Depression
  'major depression': 'major depressive disorder',
  'mdd': 'major depressive disorder',
  'clinical depression': 'major depressive disorder',
  // Cancer variants (generic)
  'cancer': 'cancer',
  'carcinoma': 'cancer',
  'malignancy': 'cancer',
  'neoplasm': 'cancer',
  // Obesity
  'obesity': 'obesity',
  'overweight': 'obesity',
  'overweight and obesity': 'obesity',
  // Aging
  'aging': 'aging',
  'ageing': 'aging',
  'age-related disorders': 'aging',
};

function normalizeDiseaseName(name: string): string {
  const lower = name.trim().toLowerCase().replace(/\s+/g, ' ');
  // Direct synonym lookup first
  if (DISEASE_SYNONYMS[lower]) return DISEASE_SYNONYMS[lower];
  // Canonicalize comma-inverted forms: "Diabetes Mellitus, Type 2" → "Type 2 Diabetes Mellitus"
  // Pattern: "Word Word..., Qualifier" → "Qualifier Word Word..."
  const commaInvert = lower.match(/^(.+?),\s+(.+)$/);
  if (commaInvert) {
    const reordered = `${commaInvert[2]} ${commaInvert[1]}`;
    if (DISEASE_SYNONYMS[reordered]) return DISEASE_SYNONYMS[reordered];
    // Also try the reordered form directly ("Type 2 Diabetes Mellitus")
    return reordered;
  }
  return lower;
}

// --- Weighted viability score per BIO/Informa methodology ---
function computeRepurposingScore(
  phaseIdx: number,
  trialCount: number,
  activeCount: number,
  marketBillion: number | null,
): number {
  // Clinical evidence (0-10): phase progress + trial volume + active signals
  const phaseBase  = (phaseIdx / 6) * 7.5;
  const trialBonus = Math.min(trialCount * 0.25, 1.5);
  const actBonus   = activeCount > 0 ? 0.5 : 0;
  const clinical_evidence = Math.min(phaseBase + trialBonus + actBonus, 10);

  // If market size is available from LLM estimate, use it. Otherwise compute based entirely on clinical evidence.
  if (marketBillion != null) {
    const market_size = Math.min((marketBillion / 30) * 10, 10);
    // 70% clinical evidence, 30% market size
    const raw = (clinical_evidence * 0.70) + (market_size * 0.30);
    return parseFloat(raw.toFixed(1));
  } else {
    // 100% clinical evidence
    return parseFloat(clinical_evidence.toFixed(1));
  }
}

// --- Jaccard word-set similarity for fuzzy duplicate detection ---
function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.split(' ').filter(w => w.length > 2));
  const setB = new Set(b.split(' ').filter(w => w.length > 2));
  const intersection = new Set([...setA].filter(w => setB.has(w)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// --- Repurposing Candidates Builder ---
// Deduplicates synonymous disease names, then scores each with weighted formula.
function buildRepurposingCandidates(clinicalData: any[], marketData: Record<string, { market_size_usd_billion: number; growth_pct: number }>) {
  const phaseOrder = ['N/A', 'PHASE1', 'PHASE1_PHASE2', 'PHASE2', 'PHASE2_PHASE3', 'PHASE3', 'PHASE4'];
  const condMap = new Map<string, { phases: string[]; statuses: string[]; count: number; canonical: string }>();

  for (const trial of clinicalData) {
    const raw   = trial.condition || 'Unknown';
    // Filter out non-disease terms before processing
    if (!isRealDiseaseCondition(raw)) continue;
    const canon = normalizeDiseaseName(raw);
    // Use canonical name as key to merge duplicates
    if (!condMap.has(canon)) condMap.set(canon, { phases: [], statuses: [], count: 0, canonical: canon });
    const entry = condMap.get(canon)!;
    entry.phases.push(trial.phase || 'N/A');
    entry.statuses.push(trial.status || 'UNKNOWN');
    entry.count++;
  }

  // Second-pass fuzzy dedup: merge entries with Jaccard similarity ≥ 0.75
  const canonicals = Array.from(condMap.keys());
  const merged = new Set<string>();
  for (let i = 0; i < canonicals.length; i++) {
    if (merged.has(canonicals[i])) continue;
    for (let j = i + 1; j < canonicals.length; j++) {
      if (merged.has(canonicals[j])) continue;
      if (jaccardSimilarity(canonicals[i], canonicals[j]) >= 0.75) {
        // Keep the entry with more trials; merge the other's data into it
        const a = condMap.get(canonicals[i])!;
        const b = condMap.get(canonicals[j])!;
        if (a.count >= b.count) {
          a.phases.push(...b.phases);
          a.statuses.push(...b.statuses);
          a.count += b.count;
          condMap.delete(canonicals[j]);
          merged.add(canonicals[j]);
        } else {
          b.phases.push(...a.phases);
          b.statuses.push(...a.statuses);
          b.count += a.count;
          condMap.delete(canonicals[i]);
          merged.add(canonicals[i]);
        }
      }
    }
  }

  return Array.from(condMap.entries())
    .map(([, data]) => {
      const condition = data.canonical.replace(/\b\w/g, c => c.toUpperCase()); // Title-case for display
      const maxPhase  = data.phases.reduce((best, p) =>
        (phaseOrder.indexOf(p) > phaseOrder.indexOf(best)) ? p : best, 'N/A');
      const phaseIdx  = phaseOrder.indexOf(maxPhase);

      // Market estimate: try canonical-cased key, then original lowercase key
      const normalLower = data.canonical;
      const normalTitle = condition;
      const mkt = marketData[normalTitle] || marketData[normalLower];
      
      const market_size_usd_billion = mkt?.market_size_usd_billion ?? null;
      const market_growth_pct       = mkt?.growth_pct ?? null;

      const activeCount = data.statuses.filter(s => ['RECRUITING', 'ACTIVE_NOT_RECRUITING', 'ENROLLING_BY_INVITATION'].includes(s)).length;
      const repurposing_score = computeRepurposingScore(phaseIdx, data.count, activeCount, market_size_usd_billion);

      return {
        condition,
        max_phase: maxPhase,
        trial_count: data.count,
        repurposing_score,
        market_size_usd_billion,
        market_growth_pct,
      };
    })
    .sort((a, b) => b.repurposing_score - a.repurposing_score)
    .slice(0, 12);
}

async function startServer() {
  // Connect to MongoDB in background — don't block server startup
  connectDB().catch(() => {});

  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Trust first proxy (Render, Railway, etc.) so secure cookies work behind reverse proxies
  app.set('trust proxy', 1);

  if (!process.env.SESSION_SECRET) {
    console.warn('[Security] SESSION_SECRET not set — using insecure fallback. Set SESSION_SECRET in .env for production.');
  }

  // CORS configuration
  app.use(cors({
    origin: process.env.CLIENT_URL || 'https://luvara.vercel.app',
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
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
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
  app.use('/api/community', communityRoutes);
  app.use('/api/dashboard', dashboardRoutes);

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

  app.post('/api/analyze', async (req, res) => {
    const { molecule: rawMolecule, prompt } = req.body;
    
    let molecule: string;
    let resolvedFrom: string | undefined;
    let promptText: string | undefined;
    let selectionMeta: any;

    if (prompt && typeof prompt === 'string' && prompt.trim()) {
      // Natural language prompt mode — resolve to a molecule via LLM
      promptText = prompt.trim();
      try {
        const resolution = await resolvePromptToMolecule(promptText);
        molecule = resolution.molecule;
        resolvedFrom = resolution.reasoning;
        selectionMeta = resolution.selectionMeta;
        console.log(`[Analyze] Prompt "${promptText}" → resolved to "${molecule}" (${resolvedFrom})`);
      } catch (err: any) {
        return res.status(400).json({ error: err.message || 'Failed to resolve your query to a molecule. Try entering a specific drug name.' });
      }
    } else if (rawMolecule && typeof rawMolecule === 'string' && rawMolecule.trim()) {
      // Direct molecule mode — validate as a pharmaceutical molecule
      molecule = rawMolecule.trim();
      const isReal = await validateMolecule(molecule);
      if (!isReal) {
        // If it looks like a multi-word query, try resolving as a prompt before rejecting
        const wordCount = molecule.split(/\s+/).length;
        if (wordCount >= 2) {
          try {
            const resolution = await resolvePromptToMolecule(molecule);
            molecule = resolution.molecule;
            resolvedFrom = resolution.reasoning;
            selectionMeta = resolution.selectionMeta;
            promptText = rawMolecule.trim();
            console.log(`[Analyze] Fallback prompt resolution: "${promptText}" → "${molecule}" (${resolvedFrom})`);
          } catch (err: any) {
            return res.status(400).json({ error: `"${rawMolecule.trim()}" isn't recognized as a valid pharmaceutical molecule and couldn't be resolved. Try a valid drug name like Aspirin, Metformin, or Ibuprofen.` });
          }
        } else {
          return res.status(400).json({ error: `"${molecule}" isn't recognized as a valid pharmaceutical molecule. Try a valid drug name like Aspirin, Metformin, or Ibuprofen.` });
        }
      }
    } else {
      return res.status(400).json({ error: 'Please enter a molecule name or describe what you\'re looking for.' });
    }

    let jobId: string = crypto.randomUUID();
    
    // Save to DB so we have a persistent history record
    try {
      const newJob = await Job.create({
        molecule,
        prompt: promptText,
        resolvedFrom,
        selectionMeta,
        userId: req.user ? (req.user as any)._id : undefined,
        status: 'processing',
        currentStep: 'Initializing...',
      });
      jobId = newJob._id.toString();
    } catch (err) {
      console.error('Failed to create Job in MongoDB:', err);
    }

    jobs.set(jobId, {
      id: jobId,
      molecule,
      prompt: promptText,
      resolvedFrom,
      selectionMeta,
      status: 'running',
      steps: [
        { name: 'PlannerAgent', label: 'Research Planning', status: 'running', log: 'Generating research plan...' },
        { name: 'PubChemAgent', label: 'PubChem Verify', status: 'waiting', log: 'Pending...' },
        { name: 'ClinicalAgent', label: 'Clinical Trials', status: 'waiting', log: 'Pending...' },
        { name: 'PatentAgent', label: 'Patent Search', status: 'waiting', log: 'Pending...' },
        { name: 'LiteratureAgent', label: 'Literature Search', status: 'waiting', log: 'Pending...' },
        { name: 'RegulatoryAgent', label: 'FDA Data', status: 'waiting', log: 'Pending...' },
        { name: 'TargetAgent', label: 'Disease Targets', status: 'waiting', log: 'Pending...' },
        { name: 'AnalogAgent', label: 'Structural Analogs', status: 'waiting', log: 'Pending...' },
        { name: 'SynthesisAgent', label: 'Report Synthesis', status: 'waiting', log: 'Pending...' },
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

    res.json({ job_id: jobId, molecule, resolvedFrom, selectionMeta });
  });

  app.get('/api/status/:id', (req, res) => {
    const job = jobs.get(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  });

  app.get('/api/history', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const userId = (req.user as any)._id;
      const history = await Job.find({ userId, status: 'completed' })
                               .select('_id molecule status createdAt reportData')
                               .sort({ createdAt: -1 });
      res.json(history);
    } catch (err) {
      console.error('History fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  app.get('/api/reports/:id', async (req, res) => {
    let report = reports.get(req.params.id);
    if (!report) {
      try {
        const job = await Job.findById(req.params.id);
        if (job && job.reportData) {
          report = job.reportData;
          reports.set(req.params.id, report);
        }
      } catch (err) {}
    }
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  });

  // ─── Share a report — generate a public share token ──────────────────────
  app.post('/api/reports/:id/share', async (req, res) => {
    try {
      const job = await Job.findById(req.params.id);
      if (!job || !job.reportData) {
        return res.status(404).json({ error: 'Report not found' });
      }
      if (!job.shareToken) {
        job.shareToken = crypto.randomBytes(16).toString('hex');
        await job.save();
      }
      res.json({ shareToken: job.shareToken });
    } catch (err) {
      console.error('Share token error:', err);
      res.status(500).json({ error: 'Failed to generate share link' });
    }
  });

  // ─── Public shared report access (no auth required) ─────────────────────
  app.get('/api/shared/:token', async (req, res) => {
    try {
      const job = await Job.findOne({ shareToken: req.params.token });
      if (!job || !job.reportData) {
        return res.status(404).json({ error: 'Shared report not found or link expired' });
      }
      res.json(job.reportData);
    } catch (err) {
      console.error('Shared report error:', err);
      res.status(500).json({ error: 'Failed to load shared report' });
    }
  });

  app.get('/api/reports/:id/pdf', async (req, res) => {
    try {
      let report = reports.get(req.params.id);
      if (!report) {
        const job = await Job.findById(req.params.id);
        if (job && job.reportData) {
          report = job.reportData;
          reports.set(req.params.id, report);
        }
      }
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      const pdfBuffer = await generateReportLaTeX(report);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.molecule || 'report'}-analysis.pdf"`);
      res.send(pdfBuffer);
    } catch (err: any) {
      console.error('PDF Generation failed:', err);
      res.status(500).json({ error: 'Failed to generate PDF.' });
    }
  });


  // ─── Groq Ask AI — SSE Streaming endpoint ──────────────────────────────
  app.post('/api/claude/chat/:id', async (req, res) => {
    const reportId = req.params.id;
    const { message } = req.body;
    const report = reports.get(reportId);
    const keys = getGroqKeys('chat');

    if (keys.length === 0) {
      return res.status(500).json({ error: 'GROQ_API_KEYS not configured on the server.' });
    }
// 
    const mol       = report?.molecule || 'Unknown compound';
    const topOpp    = (report?.repurposing_candidates || []).slice(0, 3)
      .map((c: any) => `${c.condition} (viability: ${c.repurposing_score}/10)`).join('; ');
    const topRisks  = (report?.ai_analysis?.top_risks || []).slice(0, 3).join('; ');
    const systemPrompt =
      `You are a strict expert medical informatics AI analyzing a drug repurposing research report. ` +
      `You must ONLY answer questions specifically related to this medical context. Reject any general knowledge, pop-culture, or programming/coding inputs explicitly.\n\n` +
      `COMPOUND: ${mol}\n` +
      `PHOENIX REPURPOSING SCORE: ${report?.phoenix_score ?? 'N/A'}/10\n` +
      `TOP REPURPOSING OPPORTUNITIES: ${topOpp || 'None identified'}\n` +
      `KEY RISK FACTORS: ${topRisks || 'None identified'}\n` +
      `CLINICAL TRIALS ANALYZED: ${(report?.clinical_data || []).length}\n` +
      `PATENTS FOUND: ${(report?.patent_data || []).length}\n` +
      `PUBLICATIONS ANALYZED: ${(report?.literature_data || []).length}\n` +
      `MARKET ANALYSIS: ${(report?.market_analysis || []).map((m: any) => `${m.condition} $${m.market_size_usd_billion?.toFixed(1)}B`).slice(0, 3).join(', ')}\n\n` +
      `Answer questions accurately based ONLY on this report data. Cite specific data points. ` +
      `If the user asks an unrelated question (such as code or facts), reply EXACTLY with "Not available in report data." ` +
      `Never hallucinate. If data is missing from the report, reply EXACTLY with "Not available in report data." Keep all clinical answers concise.`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let groqRes: any = null;
    let errText = '';

    for (const key of keys) {
      try {
        groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          signal: AbortSignal.timeout(45000),
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            stream: true
          }),
        });

        if (groqRes.status === 429 || groqRes.status === 401) {
          console.warn(`[ChatStream] Key failed with status ${groqRes.status}, trying next...`);
          errText = await groqRes.text();
          groqRes = null;
          continue;
        }

        if (!groqRes.ok) {
          errText = await groqRes.text();
          groqRes = null;
          console.warn(`[ChatStream] Error, trying next key...`);
          continue;
        }

        break;
      } catch (e: any) {
        errText = e?.message;
        groqRes = null;
        continue; // Try next key — Groq cloud supports multi-key retry
      }
    }

    if (!groqRes) {
      res.write(`data: ${JSON.stringify({ error: `API error streams exhausted: ${errText.slice(0, 200)}` })}\n\n`);
      res.end();
      return;
    }

    try {

      const reader = (groqRes.body as any)?.getReader?.();
      if (!reader) {
        res.write(`data: ${JSON.stringify({ error: 'Streaming not supported' })}\n\n`);
        res.end();
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
          } catch { /* ignore parse errors in stream chunks */ }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  });
  function normalizeDrugTerm(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function matchesDrugTerm(candidate: string, term: string): boolean {
    const c = normalizeDrugTerm(candidate);
    const t = normalizeDrugTerm(term);
    if (!c || !t) return false;
    return c === t || c.startsWith(`${t} `);
  }

  async function hasOpenFDADrugLabelMatch(name: string): Promise<boolean> {
    const term = name.trim();
    if (!term) return false;

    const queries = [
      `openfda.generic_name:"${term}"`,
      `openfda.brand_name:"${term}"`,
      `openfda.substance_name:"${term}"`,
    ];

    for (const query of queries) {
      try {
        const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=10`;
        const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
        if (!res.ok) continue;
        const data = await res.json() as any;
        const results = Array.isArray(data?.results) ? data.results : [];

        for (const row of results) {
          const openfda = row?.openfda || {};
          const candidates: string[] = [
            ...(Array.isArray(openfda.generic_name) ? openfda.generic_name : []),
            ...(Array.isArray(openfda.brand_name) ? openfda.brand_name : []),
            ...(Array.isArray(openfda.substance_name) ? openfda.substance_name : []),
          ];
          if (candidates.some((c) => matchesDrugTerm(c, term))) {
            return true;
          }
        }
      } catch {}
    }

    return false;
  }

  async function hasAgrochemicalSynonym(cid: number): Promise<boolean> {
    try {
      const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) return false;
      const data = await res.json() as any;
      const synonyms: string[] = data?.InformationList?.Information?.[0]?.Synonym || [];
      const agroPattern = /\b(herbicide|insecticide|fungicide|pesticide|rodenticide)\b/i;
      return synonyms.some((s) => agroPattern.test(s));
    } catch {
      return false;
    }
  }

  async function validateMolecule(name: string): Promise<boolean> {
    // Validation strategy:
    // 1) Always require a PubChem compound match.
    // 2) For simple single-word names (often ambiguous English words), require an
    //    exact OpenFDA drug label match to avoid false positives like "cycle".
    const raw = (name || '').trim();
    if (!raw) return false;

    let hasPubChemMatch = false;
    let primaryCID: number | null = null;
    try {
      const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(raw)}/cids/JSON`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (res.ok) {
        const data = await res.json();
        const cids = data?.IdentifierList?.CID || [];
        hasPubChemMatch = cids.length > 0;
        primaryCID = hasPubChemMatch ? Number(cids[0]) : null;
      }
    } catch {}

    if (!hasPubChemMatch) return false;

    if (primaryCID != null) {
      const agrochemical = await hasAgrochemicalSynonym(primaryCID);
      if (agrochemical) {
        console.warn(`[Validate] Rejected "${raw}" (CID ${primaryCID}) due to agrochemical synonym markers.`);
        return false;
      }
    }

    const isSimpleSingleWord = /^[A-Za-z]{3,20}$/.test(raw);
    if (!isSimpleSingleWord) return true;

    const hasDrugLabelMatch = await hasOpenFDADrugLabelMatch(raw);
    if (!hasDrugLabelMatch) {
      console.warn(`[Validate] Rejected ambiguous term "${raw}" (PubChem match but no OpenFDA drug label name match).`);
      return false;
    }

    return true;
  }

  interface PromptConstraints {
    requiresElderlySafety: boolean;
    requiresOral: boolean;
    requiresLowCost: boolean;
    requiresLowPatentBarrier: boolean;
  }

  interface CandidateSuggestion {
    molecule: string;
    rationale: string;
  }

  interface OpenFDALabelProfile {
    rows: any[];
    indications: string[];
    boxedWarnings: string[];
    contraindications: string[];
    routes: string[];
    elderlyWarning: boolean;
    hasGenericSignal: boolean;
  }

  interface CandidateEvaluation {
    molecule: string;
    rationale: string;
    validMolecule: boolean;
    approvedForTarget: boolean;
    approvalEvidence?: string;
    safetyScore: number;
    patentScore: number;
    clinicalScore: number;
    affordabilityScore: number;
    oralLikely: boolean | null;
    totalScore: number;
    eliminationRound?: number;
    eliminationReason?: string;
    evidence: {
      trialCount: number;
      latePhaseTrialCount: number;
      patentCount: number | null;
      boxedWarningCount: number;
      elderlyWarning: boolean;
      hasGenericSignal: boolean;
    };
  }

  interface BracketEntry {
    molecule: string;
    status: 'advance' | 'eliminated';
    reason?: string;
  }

  interface PromptResolutionMeta {
    strategy: string;
    targetDisease: string | null;
    constraints: PromptConstraints;
    winnerConfidence: number;
    winnerScores: {
      total: number;
      safety: number;
      patent: number;
      clinical: number;
      affordability: number;
    };
    runnerUps: Array<{ molecule: string; score: number; note: string }>;
    eliminationBracket: {
      round1: BracketEntry[];
      round2: BracketEntry[];
      round3: BracketEntry[];
    };
    killList: Array<{ molecule: string; reason: string }>;
    fallbackUsed: boolean;
    warning?: string;
  }

  interface PromptResolutionResult {
    molecule: string;
    reasoning: string;
    selectionMeta?: PromptResolutionMeta;
  }

  function normalizeFreeText(s: string): string {
    return (s || '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function canonicalizeDiseaseForApprovalMatch(raw: string): string {
    const cleaned = (raw || '')
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/\b(early[-\s]?stage|late[-\s]?stage|mild|moderate|severe|advanced|initial)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return normalizeDiseaseName(cleaned);
  }

  function extractPromptConstraints(prompt: string): PromptConstraints {
    const p = prompt.toLowerCase();
    return {
      requiresElderlySafety: /\b(elderly|older adults|geriatric|age\s*65|senior)\b/.test(p),
      requiresOral: /\b(oral|orally|tablet|capsule|pill)\b/.test(p),
      requiresLowCost: /\b(low cost|cheap|affordable|generic|cost effective|low[-\s]?cost)\b/.test(p),
      requiresLowPatentBarrier: /\b(low patent|patent barrier|ip barrier|freedom to operate|off[-\s]?patent|low ip)\b/.test(p),
    };
  }

  function extractTargetDiseaseFromPrompt(prompt: string): string | null {
    const compact = prompt.replace(/\s+/g, ' ').trim();
    if (!compact) return null;

    const patterns = [
      /(?:candidate|drug|treatment|therapy|option)\s+for\s+(.+)$/i,
      /(?:for|against)\s+(.+)$/i,
    ];

    let captured = '';
    for (const pattern of patterns) {
      const m = compact.match(pattern);
      if (m?.[1]) {
        captured = m[1];
        break;
      }
    }
    if (!captured) captured = compact;

    captured = captured.split(',')[0].trim();
    captured = captured
      .split(/\b(that|which|with|where|safe|oral|affordable|low patent|low cost|and has|and is)\b/i)[0]
      .replace(/\b(maybe|possibly|probably|perhaps)\b/gi, ' ')
      .replace(/[?.!,;:]+$/g, '')
      .trim();

    if (!captured) return null;

    const canonical = canonicalizeDiseaseForApprovalMatch(captured);
    if (!canonical || canonical.length < 4) return null;
    return canonical;
  }

  function buildDiseaseAliases(targetCanonical: string): string[] {
    const aliases = new Set<string>();
    aliases.add(targetCanonical);
    for (const [k, v] of Object.entries(DISEASE_SYNONYMS)) {
      if (v === targetCanonical) aliases.add(k);
    }

    return Array.from(aliases).map(normalizeFreeText).filter(Boolean);
  }

  function hasTargetDiseaseApproval(indications: string[], targetCanonical: string): { approved: boolean; evidence?: string } {
    if (!targetCanonical || indications.length === 0) return { approved: false };

    const aliases = buildDiseaseAliases(targetCanonical);
    const normalizedTarget = normalizeFreeText(targetCanonical);

    for (const indication of indications) {
      const normalized = normalizeFreeText(indication);
      if (!normalized) continue;

      if (aliases.some((alias) => normalized.includes(alias))) {
        return { approved: true, evidence: indication.slice(0, 220) };
      }

      const sections = normalized
        .split(/[.;\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 8)
        .slice(0, 16);

      for (const section of sections) {
        if (jaccardSimilarity(section, normalizedTarget) >= 0.86) {
          return { approved: true, evidence: indication.slice(0, 220) };
        }
      }
    }

    return { approved: false };
  }

  async function queryOpenFDALabelRows(name: string): Promise<any[]> {
    const term = name.trim();
    if (!term) return [];

    const termLower = term.toLowerCase();
    const termUpper = term.toUpperCase();
    const urls = [
      `https://api.fda.gov/drug/label.json?search=openfda.substance_name:"${encodeURIComponent(termUpper)}"&limit=20`,
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(termLower)}"&limit=20`,
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(termUpper)}"&limit=20`,
    ];

    const allRows: any[] = [];
    for (const url of urls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
        if (!res.ok) continue;
        const data = await res.json() as any;
        const rows = Array.isArray(data?.results) ? data.results : [];
        allRows.push(...rows);
      } catch {}
    }

    const exactRows = allRows.filter((row: any) => {
      const openfda = row?.openfda || {};
      const candidateNames: string[] = [
        ...(Array.isArray(openfda.generic_name) ? openfda.generic_name : []),
        ...(Array.isArray(openfda.brand_name) ? openfda.brand_name : []),
        ...(Array.isArray(openfda.substance_name) ? openfda.substance_name : []),
      ];
      return candidateNames.some((n) => matchesDrugTerm(n, term));
    });

    const rowsToUse = exactRows.length > 0 ? exactRows : allRows;
    const dedup = new Map<string, any>();
    for (const row of rowsToUse) {
      const key = String(row?.set_id || row?.id || row?.spl_id || `${row?.openfda?.application_number?.[0] || ''}-${row?.effective_time || ''}`);
      if (!dedup.has(key)) dedup.set(key, row);
    }
    return Array.from(dedup.values());
  }

  function extractLabelProfile(rows: any[]): OpenFDALabelProfile {
    const indications: string[] = [];
    const boxedWarnings: string[] = [];
    const contraindications: string[] = [];
    const routes = new Set<string>();
    let hasGenericSignal = false;

    for (const row of rows) {
      if (Array.isArray(row?.indications_and_usage)) indications.push(...row.indications_and_usage);
      if (Array.isArray(row?.boxed_warning)) boxedWarnings.push(...row.boxed_warning);
      if (Array.isArray(row?.contraindications)) contraindications.push(...row.contraindications);

      const openfda = row?.openfda || {};
      const genericNames: string[] = Array.isArray(openfda.generic_name) ? openfda.generic_name : [];
      if (genericNames.length > 0) hasGenericSignal = true;

      const rowRoutes: string[] = Array.isArray(openfda.route) ? openfda.route : [];
      rowRoutes.forEach((r) => routes.add(String(r).toLowerCase()));
    }

    const elderlyPattern = /\b(geriatr|elderly|older adults|age\s*65|older patients?)\b/i;
    const elderlyWarning = [...boxedWarnings, ...contraindications].some((t) => elderlyPattern.test(t));

    return {
      rows,
      indications,
      boxedWarnings,
      contraindications,
      routes: Array.from(routes),
      elderlyWarning,
      hasGenericSignal,
    };
  }

  async function fetchClinicalEvidenceForTarget(moleculeName: string, targetDisease: string): Promise<{ trialCount: number; latePhaseTrialCount: number }> {
    try {
      const url = `https://clinicaltrials.gov/api/v2/studies?query.intr=${encodeURIComponent(moleculeName)}&query.cond=${encodeURIComponent(targetDisease)}&pageSize=25`;
      const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
      if (!res.ok) return { trialCount: 0, latePhaseTrialCount: 0 };
      const data = await res.json() as any;
      const studies = Array.isArray(data?.studies) ? data.studies : [];
      const latePhaseTrialCount = studies.filter((s: any) => {
        const phasesRaw = s?.protocolSection?.designModule?.phases;
        const phaseText = Array.isArray(phasesRaw) ? phasesRaw.join(' ') : String(phasesRaw || '');
        const p = phaseText.toUpperCase();
        return p.includes('PHASE 3') || p.includes('PHASE3') || p.includes('PHASE 4') || p.includes('PHASE4');
      }).length;
      return { trialCount: studies.length, latePhaseTrialCount };
    } catch {
      return { trialCount: 0, latePhaseTrialCount: 0 };
    }
  }

  async function fetchPatentCountForMolecule(moleculeName: string): Promise<number | null> {
    try {
      const cidRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(moleculeName)}/cids/JSON`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!cidRes.ok) return null;
      const cidData = await cidRes.json() as any;
      const cids: number[] = cidData?.IdentifierList?.CID || [];
      if (!cids.length) return null;

      const patentsRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cids[0]}/JSON?heading=Patents`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (!patentsRes.ok) return null;

      const patentsData = await patentsRes.json() as any;
      const patentIds = new Set<string>();
      const patentPattern = /\b(US|EP|WO)\d+/i;

      const extract = (node: any) => {
        if (!node || typeof node !== 'object') return;
        const values = node?.Value?.StringWithMarkup;
        if (Array.isArray(values)) {
          for (const item of values) {
            const txt = item?.String;
            if (typeof txt === 'string' && patentPattern.test(txt)) {
              patentIds.add(txt.trim());
            }
          }
        }
        for (const section of node?.Section || []) extract(section);
        for (const info of node?.Information || []) extract(info);
      };

      extract(patentsData?.Record);
      return patentIds.size;
    } catch {
      return null;
    }
  }

  async function generateCandidatePanel(prompt: string, targetDisease: string, constraints: PromptConstraints): Promise<CandidateSuggestion[]> {
    const keys = getGroqKeys('chat');
    if (keys.length === 0) {
      throw new Error('AI service unavailable. Please enter a specific molecule name instead.');
    }

    const systemPrompt = `You are an AI drug repurposing scientist using a hypothesis-first approach.
Generate candidate drugs to repurpose for a target disease.

Hard requirements:
- Return 5-10 candidates
- FDA-approved drugs only
- Human safety data must exist
- Exclude drugs already approved for the target disease
- No made-up compounds
- If query is not medical, return {"candidates":[],"note":"NON_MEDICAL"}

Output strict JSON object:
{"candidates":[{"molecule":"<drug>","rationale":"<short reason>"}],"note":"<optional>"}`;

    const userPrompt = `Prompt: ${prompt}
Target disease family: ${targetDisease}
Constraints:
- elderly safety required: ${constraints.requiresElderlySafety}
- oral route required: ${constraints.requiresOral}
- low cost required: ${constraints.requiresLowCost}
- low patent barrier required: ${constraints.requiresLowPatentBarrier}`;

    let lastError: any = null;
    for (const key of keys) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (res.status === 429 || res.status === 401) {
          continue;
        }
        if (!res.ok) throw new Error(`Groq API Error: ${res.status}`);

        const data = await res.json() as any;
        const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '{}') as any;
        const note = String(parsed?.note || '').toUpperCase();
        if (note.includes('NON_MEDICAL')) {
          throw new Error('Your query does not appear related to medicine or drug repurposing.');
        }

        const rawCandidates = Array.isArray(parsed?.candidates) ? parsed.candidates : [];
        const cleaned: CandidateSuggestion[] = [];
        const seen = new Set<string>();

        for (const item of rawCandidates) {
          const rawMolecule = (typeof item === 'string' ? item : item?.molecule || '').trim();
          const molecule = rawMolecule.split(/[;,\n\r]/)[0].trim();
          const rationale = (typeof item === 'string' ? '' : item?.rationale || '').trim();
          if (!molecule) continue;
          const malformedPattern = /\b(excluded|considering|instead|already approved|not suitable|choose|avoid|reject|filter out)\b/i;
          if (malformedPattern.test(molecule)) continue;
          if (!/^[A-Za-z0-9][A-Za-z0-9\s\-()]{1,60}$/.test(molecule)) continue;
          if (molecule.split(/\s+/).length > 4) continue;
          const keyName = normalizeDrugTerm(molecule);
          if (seen.has(keyName)) continue;
          seen.add(keyName);
          cleaned.push({ molecule, rationale });
          if (cleaned.length >= 10) break;
        }

        return cleaned;
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    if (lastError) throw lastError;
    return [];
  }

  async function evaluateCandidateSuggestion(
    suggestion: CandidateSuggestion,
    targetDisease: string,
    constraints: PromptConstraints
  ): Promise<CandidateEvaluation> {
    const moleculeName = suggestion.molecule.trim();
    const validMolecule = await validateMolecule(moleculeName);

    if (!validMolecule) {
      return {
        molecule: moleculeName,
        rationale: suggestion.rationale,
        validMolecule: false,
        approvedForTarget: false,
        safetyScore: 0,
        patentScore: 0,
        clinicalScore: 0,
        affordabilityScore: 0,
        oralLikely: null,
        totalScore: 0,
        eliminationReason: 'Not validated as a pharmaceutical molecule',
        evidence: {
          trialCount: 0,
          latePhaseTrialCount: 0,
          patentCount: null,
          boxedWarningCount: 0,
          elderlyWarning: false,
          hasGenericSignal: false,
        },
      };
    }

    const [labelRows, clinicalEvidence, patentCount] = await Promise.all([
      queryOpenFDALabelRows(moleculeName),
      fetchClinicalEvidenceForTarget(moleculeName, targetDisease),
      fetchPatentCountForMolecule(moleculeName),
    ]);

    const profile = extractLabelProfile(labelRows);
    const approval = hasTargetDiseaseApproval(profile.indications, targetDisease);

    const oralLikely = profile.routes.length === 0 ? null : profile.routes.some((r) => /\boral\b/i.test(r));

    let safetyScore = 8;
    if (profile.boxedWarnings.length > 0) safetyScore -= 3;
    if (profile.elderlyWarning) safetyScore -= 2;
    if (profile.contraindications.length > 0) safetyScore -= Math.min(2, profile.contraindications.length * 0.25);
    safetyScore = Math.max(0, Math.min(10, safetyScore));

    let patentScore = 5;
    if (patentCount != null) {
      if (patentCount === 0) patentScore = 9;
      else if (patentCount <= 3) patentScore = 7;
      else if (patentCount <= 10) patentScore = 4;
      else patentScore = 2;
    }

    const clinicalScore = Math.max(
      0,
      Math.min(10, (clinicalEvidence.trialCount * 0.35) + (clinicalEvidence.latePhaseTrialCount * 1.5))
    );

    let affordabilityScore = profile.hasGenericSignal ? 8 : 4;
    if (profile.rows.length >= 8) affordabilityScore = Math.min(9, affordabilityScore + 1);
    if (constraints.requiresLowCost && !profile.hasGenericSignal) affordabilityScore = Math.max(2, affordabilityScore - 1);

    let totalScore = (clinicalScore * 0.35) + (safetyScore * 0.25) + (patentScore * 0.2) + (affordabilityScore * 0.2);
    if (constraints.requiresOral && oralLikely === false) totalScore -= 1.5;
    if (constraints.requiresElderlySafety && profile.elderlyWarning) totalScore -= 1.0;
    totalScore = Math.max(0, Math.min(10, totalScore));

    return {
      molecule: moleculeName,
      rationale: suggestion.rationale,
      validMolecule: true,
      approvedForTarget: approval.approved,
      approvalEvidence: approval.evidence,
      safetyScore,
      patentScore,
      clinicalScore,
      affordabilityScore,
      oralLikely,
      totalScore,
      evidence: {
        trialCount: clinicalEvidence.trialCount,
        latePhaseTrialCount: clinicalEvidence.latePhaseTrialCount,
        patentCount,
        boxedWarningCount: profile.boxedWarnings.length,
        elderlyWarning: profile.elderlyWarning,
        hasGenericSignal: profile.hasGenericSignal,
      },
    };
  }

  async function mapWithConcurrency<T, R>(
    items: T[],
    concurrency: number,
    worker: (item: T) => Promise<R>
  ): Promise<R[]> {
    if (items.length === 0) return [];
    const results = new Array<R>(items.length);
    let currentIndex = 0;

    const runners = new Array(Math.min(concurrency, items.length)).fill(null).map(async () => {
      while (true) {
        const idx = currentIndex;
        currentIndex += 1;
        if (idx >= items.length) break;
        results[idx] = await worker(items[idx]);
      }
    });

    await Promise.all(runners);
    return results;
  }

  function runEliminationTournament(
    evaluations: CandidateEvaluation[],
    constraints: PromptConstraints
  ): {
    winner: CandidateEvaluation | null;
    runnerUps: CandidateEvaluation[];
    killList: Array<{ molecule: string; reason: string }>;
    bracket: { round1: BracketEntry[]; round2: BracketEntry[]; round3: BracketEntry[] };
    fallbackUsed: boolean;
    warning?: string;
  } {
    const killList: Array<{ molecule: string; reason: string }> = [];
    const bracket = { round1: [] as BracketEntry[], round2: [] as BracketEntry[], round3: [] as BracketEntry[] };

    const eligible: CandidateEvaluation[] = [];
    for (const e of evaluations) {
      if (!e.validMolecule) {
        killList.push({ molecule: e.molecule, reason: e.eliminationReason || 'Failed molecule validation' });
        continue;
      }
      if (e.approvedForTarget) {
        const reason = `Already approved for target disease family${e.approvalEvidence ? `: ${e.approvalEvidence}` : ''}`;
        e.eliminationRound = 0;
        e.eliminationReason = reason;
        killList.push({ molecule: e.molecule, reason });
        continue;
      }
      eligible.push(e);
    }

    const round1: CandidateEvaluation[] = [];
    for (const e of eligible) {
      let reason: string | undefined;
      if (constraints.requiresOral && e.oralLikely === false) {
        reason = 'Failed oral availability requirement';
      } else if ((constraints.requiresElderlySafety && e.safetyScore < 6) || e.safetyScore < 4) {
        reason = 'Failed safety filter (elderly risk or warning burden too high)';
      }

      if (reason) {
        e.eliminationRound = 1;
        e.eliminationReason = reason;
        killList.push({ molecule: e.molecule, reason });
        bracket.round1.push({ molecule: e.molecule, status: 'eliminated', reason });
      } else {
        round1.push(e);
        bracket.round1.push({ molecule: e.molecule, status: 'advance' });
      }
    }

    const round2: CandidateEvaluation[] = [];
    for (const e of round1) {
      let reason: string | undefined;
      const patentThreshold = constraints.requiresLowPatentBarrier ? 5 : 3;
      if (e.patentScore < patentThreshold) {
        reason = 'Failed patent barrier filter';
      }

      if (reason) {
        e.eliminationRound = 2;
        e.eliminationReason = reason;
        killList.push({ molecule: e.molecule, reason });
        bracket.round2.push({ molecule: e.molecule, status: 'eliminated', reason });
      } else {
        round2.push(e);
        bracket.round2.push({ molecule: e.molecule, status: 'advance' });
      }
    }

    const round3: CandidateEvaluation[] = [];
    for (const e of round2) {
      let reason: string | undefined;
      if (e.clinicalScore < 2.5) {
        reason = 'Failed clinical strength filter for target disease';
      }

      if (reason) {
        e.eliminationRound = 3;
        e.eliminationReason = reason;
        killList.push({ molecule: e.molecule, reason });
        bracket.round3.push({ molecule: e.molecule, status: 'eliminated', reason });
      } else {
        round3.push(e);
        bracket.round3.push({ molecule: e.molecule, status: 'advance' });
      }
    }

    const sortByScore = (arr: CandidateEvaluation[]) => [...arr].sort((a, b) => b.totalScore - a.totalScore);
    const finalists = sortByScore(round3);

    if (finalists.length > 0) {
      return {
        winner: finalists[0],
        runnerUps: finalists.slice(1, 4),
        killList,
        bracket,
        fallbackUsed: false,
      };
    }

    const fallbackPool = sortByScore(eligible);
    if (fallbackPool.length === 0) {
      return {
        winner: null,
        runnerUps: [],
        killList,
        bracket,
        fallbackUsed: false,
      };
    }

    return {
      winner: fallbackPool[0],
      runnerUps: fallbackPool.slice(1, 4),
      killList,
      bracket,
      fallbackUsed: true,
      warning: 'No candidate passed all elimination rounds. Returned the best investigational/off-label non-approved option.',
    };
  }

  function computeWinnerConfidence(winner: CandidateEvaluation, fallbackUsed: boolean): number {
    const base = Math.round(winner.totalScore * 10);
    const adjusted = base - (fallbackUsed ? 12 : 0) + (winner.clinicalScore >= 5 ? 5 : 0);
    return Math.max(30, Math.min(95, adjusted));
  }

  // --- Prompt → Molecule Resolution via LLM (single-shot fallback mode) ---
  async function resolvePromptToSingleMolecule(prompt: string): Promise<{ molecule: string; reasoning: string }> {
    const keys = getGroqKeys('chat');
    if (keys.length === 0) {
      throw new Error('AI service unavailable. Please enter a specific molecule name instead.');
    }

    const systemPrompt = `You are a pharmaceutical expert specializing in drug repurposing. Given a user's natural language query about diseases, treatments, or drug repurposing, identify the single most relevant existing approved drug/molecule to analyze for repurposing potential.

Rules:
- Return ONLY a real, approved pharmaceutical compound name that exists in PubChem
- Do NOT return disease names, generic terms, or made-up molecules
- Pick the most promising repurposing candidate for the described condition
- If the query mentions a specific drug, return that drug
- If the query describes a disease/condition, pick the best-known drug being studied for repurposing to that condition
- If the query is clearly NOT about medicine, pharmaceuticals, diseases, health conditions, or drug repurposing, return {"molecule": "NONE", "reasoning": "Query is not related to medicine or drug repurposing"}. Examples of non-medical queries: "cycle walking", "best pizza recipe", "how to learn guitar", "panda", "weather forecast"

Return valid JSON: {"molecule": "<drug name>", "reasoning": "<1-2 sentence explanation>"}`;

    let lastError: any = null;
    for (const key of keys) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });
        if (res.status === 429 || res.status === 401) {
          console.warn(`[ResolvePrompt] Groq key failed with status ${res.status}, trying next...`);
          continue;
        }
        if (!res.ok) throw new Error(`Groq API Error: ${res.status}`);
        const data = await res.json() as any;
        const parsed = JSON.parse(data.choices[0].message.content);

        if (!parsed.molecule || typeof parsed.molecule !== 'string') {
          throw new Error('LLM returned invalid molecule field');
        }

        if (parsed.molecule.toUpperCase() === 'NONE') {
          throw new Error('Your query doesn\'t appear to be related to medicine or drug repurposing. Try entering a drug name like Aspirin or describing a medical condition.');
        }

        const isValid = await validateMolecule(parsed.molecule);
        if (!isValid) {
          console.warn(`[ResolvePrompt] LLM suggested "${parsed.molecule}" but it failed molecule validation. Retrying...`);
          const retryRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(15000),
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
                { role: 'assistant', content: JSON.stringify(parsed) },
                { role: 'user', content: `"${parsed.molecule}" failed pharmaceutical molecule validation. Suggest a different FDA-approved drug that is listed in PubChem. Return JSON: {"molecule": "<name>", "reasoning": "<explanation>"}` },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.2,
            }),
          });
          if (retryRes.ok) {
            const retryData = await retryRes.json() as any;
            const retryParsed = JSON.parse(retryData.choices[0].message.content);
            if (retryParsed.molecule) {
              const retryValid = await validateMolecule(retryParsed.molecule);
              if (retryValid) {
                return { molecule: retryParsed.molecule, reasoning: retryParsed.reasoning || '' };
              }
            }
          }
          throw new Error(`Could not find a valid molecule for your query. The AI suggested "${parsed.molecule}" but it failed pharmaceutical validation. Try rephrasing or entering a specific drug name.`);
        }

        return { molecule: parsed.molecule, reasoning: parsed.reasoning || '' };
      } catch (e) {
        lastError = e;
        if ((e as Error).message.includes('Could not find a valid molecule')) throw e;
        console.warn(`[ResolvePrompt] Attempt failed: ${(e as Error).message}. Trying next key...`);
        continue;
      }
    }
    throw new Error(lastError?.message || 'AI service unavailable. Please enter a specific molecule name instead.');
  }

  // --- Prompt → Molecule Resolution (hypothesis-first elimination mode) ---
  async function resolvePromptToMolecule(prompt: string): Promise<PromptResolutionResult> {
    const cleanedPrompt = prompt.trim();
    const constraints = extractPromptConstraints(cleanedPrompt);
    const targetDisease = extractTargetDiseaseFromPrompt(cleanedPrompt);

    // If we cannot confidently identify a disease target, use existing single-shot flow.
    if (!targetDisease) {
      const single = await resolvePromptToSingleMolecule(cleanedPrompt);
      return {
        molecule: single.molecule,
        reasoning: single.reasoning,
        selectionMeta: {
          strategy: 'single-shot-no-target',
          targetDisease: null,
          constraints,
          winnerConfidence: 55,
          winnerScores: { total: 5.5, safety: 5.5, patent: 5.5, clinical: 5.5, affordability: 5.5 },
          runnerUps: [],
          eliminationBracket: { round1: [], round2: [], round3: [] },
          killList: [],
          fallbackUsed: true,
          warning: 'Target disease could not be parsed; used single-candidate resolution.',
        },
      };
    }

    const suggestions = await generateCandidatePanel(cleanedPrompt, targetDisease, constraints);
    if (suggestions.length === 0) {
      throw new Error('Unable to generate repurposing hypotheses for this prompt. Try adding a clearer disease target and constraints.');
    }

    const evaluations = await mapWithConcurrency(suggestions.slice(0, 10), 4, (s) => evaluateCandidateSuggestion(s, targetDisease, constraints));
    const tournament = runEliminationTournament(evaluations, constraints);

    if (!tournament.winner) {
      throw new Error(`Could not find a non-approved repurposing candidate for "${targetDisease}" under current constraints. Try broadening the prompt.`);
    }

    const winner = tournament.winner;
    const confidence = computeWinnerConfidence(winner, tournament.fallbackUsed);
    const reasoningParts = [
      `Selected ${winner.molecule} via hypothesis-first elimination for ${targetDisease}.`,
      `Safety ${winner.safetyScore.toFixed(1)}/10, Patent ${winner.patentScore.toFixed(1)}/10, Clinical ${winner.clinicalScore.toFixed(1)}/10, Affordability ${winner.affordabilityScore.toFixed(1)}/10.`,
      tournament.warning || '',
    ].filter(Boolean);

    const selectionMeta: PromptResolutionMeta = {
      strategy: 'hypothesis-first-elimination',
      targetDisease,
      constraints,
      winnerConfidence: confidence,
      winnerScores: {
        total: Number(winner.totalScore.toFixed(2)),
        safety: Number(winner.safetyScore.toFixed(2)),
        patent: Number(winner.patentScore.toFixed(2)),
        clinical: Number(winner.clinicalScore.toFixed(2)),
        affordability: Number(winner.affordabilityScore.toFixed(2)),
      },
      runnerUps: tournament.runnerUps.map((r) => ({
        molecule: r.molecule,
        score: Number(r.totalScore.toFixed(2)),
        note: r.rationale || 'Survived initial filtering but ranked below winner.',
      })),
      eliminationBracket: tournament.bracket,
      killList: tournament.killList,
      fallbackUsed: tournament.fallbackUsed,
      warning: tournament.warning,
    };

    return {
      molecule: winner.molecule,
      reasoning: reasoningParts.join(' '),
      selectionMeta,
    };
  }

  async function runPipeline(jobId: string, molecule: string, constraints?: Array<{type: string; value: string}>) {
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
      updateStep(0, 'done', 'Research plan generated.');
      updateStep(1, 'running', 'Verifying in registries...');
      const isReal = await validateMolecule(molecule);
      if (!isReal) {
         updateStep(1, 'done', 'No real-world data found.', 0);
         updateStep(8, 'done', 'Processing bypassed.');
         const job = jobs.get(jobId);
         if (job) {
           const report = {
             _id: jobId, molecule: job.molecule, status: 'complete', is_fake: true,
             viability_score: 0.0, phoenix_score: 0.0, clinical_data: [], literature_data: [], patent_data: [], repurposing_candidates: [], market_analysis: [], similar_molecules: [],
             pubchem_data: { exists: false }, regulatory_data: { approved_indications: ['None'], warnings: ['None'] },
             ai_analysis: { viability_score: 0.0, confidence: "Absolute", top_opportunities: ["None"], top_risks: ["Molecule does not exist in any pharmacological or clinical registry."], reasoning: `The molecule name "${molecule}" could not be verified in ClinicalTrials.gov, PubMed, or the FDA registry. This indicates that it is either completely fictitious, a highly proprietary early-stage compound with zero literature, or a typo. \n\nNo viable scientific consensus or pipeline analysis can be generated. The analysis has been aborted to prevent AI hallucinations.` },
             created_at: new Date().toISOString(),
           };
           reports.set(jobId, report);
        Job.findByIdAndUpdate(jobId, { status: 'completed', reportData: report, progress: 100, currentStep: 'Complete' }, { new: true }).catch(err => console.error('Failed to update DB', err));
           job.status = 'complete'; jobs.set(jobId, job);
         }
         return;
      }

      updateStep(2, 'running', 'Querying ClinicalTrials...');
      updateStep(4, 'running', 'Querying PubMed...');
      updateStep(5, 'running', 'Querying FDA Labels...');

      await new Promise(r => setTimeout(r, 500));
      updateStep(3, 'running', 'Searching USPTO...');
      updateStep(6, 'running', 'Identifying disease targets...');
      updateStep(7, 'running', 'Finding structural analogs...');

      // Dynamically import LangGraph to avoid slowing down dev server boot time
      const { runPipeline: runLangGraphPipeline } = await import('./src/lib/agents/workflow');

      // Let LangGraph do all the parallel execution
      const resultState = await runLangGraphPipeline(molecule, constraints);

      // Map back to our simulated job state
      const clinicalData = resultState.clinicalData || [];
      const literatureData = resultState.literatureData || [];
      const regulatoryData = resultState.regulatoryData || { approved_indications: ['None'], warnings: ['None'] };

      // PubChem is the authoritative check (100M+ compounds)
      const pubchemExists = resultState.pubchemData?.exists;

      const pubchemLabel = pubchemExists === true
        ? `CID ${resultState.pubchemData?.cid || 'found'} — ${resultState.pubchemData?.molecular_formula || 'verified'}`
        : pubchemExists === false ? 'Not in PubChem (fake)' : 'PubChem timeout';
      updateStep(1, 'done', pubchemLabel, pubchemExists ? 1 : 0);

      updateStep(2, 'done', 'Data retrieved.', clinicalData.length);
      updateStep(3, 'done', `Found ${resultState.patentData?.length || 0} patents.`, resultState.patentData?.length || 0);
      updateStep(4, 'done', 'Abstracts embedded.', literatureData.length);
      updateStep(5, 'done', 'Label data parsed.', 1);
      updateStep(6, 'done', `Found ${resultState.targetData?.targetsFound || 0} targets via ${resultState.targetData?.source || 'Open Targets'}.`, resultState.targetData?.targetsFound || 0);

      const similarMolecules = resultState.similarMolecules || [];
      updateStep(7, 'done', `${similarMolecules.length} structural analogs analyzed`, similarMolecules.length);
      updateStep(8, 'running', 'Synthesizing report...');

      // ── Start market estimates early (parallel with debate) ──
      const uniqueConditions = [...new Set(
        clinicalData.map((t: any) => t.condition).filter(Boolean)
          .map((c: string) => {
            const canon = normalizeDiseaseName(c);
            return canon.replace(/\b\w/g, (ch: string) => ch.toUpperCase());
          })
      )] as string[];
      const marketDataPromise = fetchMarketEstimates(uniqueConditions);

      // ── Adversarial Debate: 3 separate LLM calls ──
      let debate_data: any = null;
      try {
        const debateContext = `Compound: ${molecule}
Phoenix Score: ${resultState.phoenix_score}/10
Clinical Trials: ${clinicalData.length} studies (Phases: ${[...new Set(clinicalData.map((t: any) => t.phase))].join(', ')})
Key Conditions: ${[...new Set(clinicalData.map((t: any) => t.condition))].slice(0, 5).join(', ')}
Regulatory: ${resultState.regulatoryData?.all_indications?.length || 0} FDA indications, Warnings: ${resultState.regulatoryData?.warnings || 'None'}
Targets: ${resultState.targetData?.targetsFound || 0} targets, ${resultState.targetData?.diseasesFound || 0} diseases (${resultState.targetData?.mechanisms?.slice(0, 2).map((m: any) => m.description).join('; ') || 'Unknown MOA'})
Patents: ${(resultState.patentData || []).length} patent filings
Literature: ${literatureData.length} papers (${resultState.total_pubmed_papers || 0} total PubMed)
Top Opportunities: ${(resultState.top_opportunities || []).join('; ')}
Top Risks: ${(resultState.top_risks || []).join('; ')}
AI Viability Score: ${resultState.viabilityScore}/10`;

        const debateKeys = getGroqKeys('chat');
        
        async function callGroqDebate(systemPrompt: string, userPrompt: string): Promise<string> {
          for (const key of debateKeys) {
            try {
              const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  model: 'llama-3.3-70b-versatile',
                  messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                  ],
                  temperature: 0.4,
                  max_tokens: 600,
                }),
                signal: AbortSignal.timeout(12000),
              });
              if (resp.status === 429 || resp.status === 401) continue;
              if (resp.status === 200) {
                const data = await resp.json() as any;
                return data.choices?.[0]?.message?.content || '';
              }
            } catch { continue; }
          }
          return '';
        }

        const [advocateArg, skepticArg] = await Promise.all([
          callGroqDebate(
            'You are a pharmaceutical investment ADVOCATE. Make the STRONGEST possible case for why this drug should be pursued for repurposing. Be specific with data points. Use exactly 3 numbered arguments. Be concise (max 200 words total).',
            debateContext
          ),
          callGroqDebate(
            'You are a pharmaceutical RISK ANALYST and SKEPTIC. Identify every reason this repurposing effort could FAIL. Focus on safety signals, IP barriers, competitive landscape, and weak evidence. Use exactly 3 numbered arguments. Be concise (max 200 words total).',
            debateContext
          ),
        ]);

        const consensusArg = await callGroqDebate(
          'You are an impartial clinical review board judge. Given an advocate\'s and skeptic\'s arguments about a drug repurposing case, produce a final ruling. Respond with EXACTLY this JSON format: {"verdict": "Proceed"|"Caution"|"Reject", "confidence": 0.0-1.0, "reasoning": "2-3 sentence summary", "conditions": ["condition1", "condition2"]}. Only output valid JSON.',
          `ADVOCATE ARGUMENTS:\n${advocateArg}\n\nSKEPTIC ARGUMENTS:\n${skepticArg}\n\nDATA:\n${debateContext}`
        );

        let consensus = { verdict: 'Caution', confidence: 0.5, reasoning: 'Analysis pending.', conditions: [] };
        try {
          const cleaned = consensusArg.replace(/```json/g, '').replace(/```/g, '').trim();
          consensus = JSON.parse(cleaned);
        } catch { /* use default */ }

        debate_data = {
          advocate: advocateArg,
          skeptic: skepticArg,
          consensus,
        };
        console.log(`[Debate] Verdict: ${consensus.verdict} (${consensus.confidence})`);
      } catch (debateErr: any) {
        console.error('[Debate] Failed:', debateErr.message);
      }

      await new Promise(r => setTimeout(r, 1000));
      updateStep(8, 'done', 'Synthesis generated.');
      
      const job = jobs.get(jobId);
      if (job) {
          // Use the real LangChain Python Phoenix Score microservice if available,
          // otherwise fallback to calculated mock
          let phoenixScore = resultState.phoenix_score || null;
          let phoenixBreakdown = resultState.phoenix_breakdown || {};
          let phoenixExplanation = resultState.phoenix_explanation || "";

          // The hardcoded fallback calculation that resulted in 1.0 has been deleted.

        const finalViabilityScore = (resultState.viabilityScore != null && resultState.viabilityScore > 0) ? resultState.viabilityScore : null;

        // Await market data (was started in parallel with debate)
        const marketData = await marketDataPromise;
        const repurposing_candidates = buildRepurposingCandidates(clinicalData, marketData);
        const market_analysis = repurposing_candidates.map(c => ({
          condition: c.condition,
          market_size_usd_billion: c.market_size_usd_billion,
          growth_rate_pct: c.market_growth_pct,
          max_phase: c.max_phase,
        }));

        // Use only real patent data fetched from PubChem — no fabricated fallbacks
        const patent_data = resultState.patentData || [];

        // Calculate true pipeline confidence based on healthy sub-agents
        let successfulApis = 0;
        if (resultState.pubchemData?.exists !== null) successfulApis++;
        if (resultState.clinicalData !== null) successfulApis++;
        if (resultState.literatureData !== null) successfulApis++;
        if (resultState.regulatoryData !== null) successfulApis++;
        if (resultState.patentData !== null) successfulApis++;
        const finalConfidence = successfulApis / 5.0;

        // Auto-Generate complete Report natively from the backend!
        const report = {
          _id: jobId,
          molecule: job.molecule,
          status: 'complete',
          is_fake: false,
          viability_score: finalViabilityScore,
          phoenix_score: phoenixScore,            
          phoenix_breakdown: phoenixBreakdown,
          phoenix_explanation: phoenixExplanation,          
          clinical_data: resultState.clinicalData || [],
          literature_data: resultState.literatureData || [],
          regulatory_data: resultState.regulatoryData || { approved_indications: ['None'], warnings: ['None'] },
          target_data: resultState.targetData || { targets: [], diseases: [], mechanisms: [], targetsFound: 0 },
          patent_data,
          repurposing_candidates,
          market_analysis,
          similar_molecules: similarMolecules,
          pubchem_data: resultState.pubchemData || { exists: null },
          ai_analysis: {
            viability_score: finalViabilityScore,
            confidence: finalConfidence,
            top_opportunities: resultState.top_opportunities || [],
            top_risks: resultState.top_risks || [],
            reasoning: resultState.analysisReport // Passed directly from Groq!
          },
          debate_data: debate_data || null,
          research_plan: resultState.researchPlan || null,
          agent_attributions: (resultState.agentAttributions || []).filter((attr: any, idx: number, arr: any[]) => arr.findIndex((a: any) => a.agent === attr.agent) === idx),
          cross_domain_reasoning: resultState.crossDomainReasoning || [],
          created_at: new Date().toISOString(),
        };

        reports.set(jobId, report);
        Job.findByIdAndUpdate(jobId, { status: 'completed', reportData: report, progress: 100, currentStep: 'Complete' }, { new: true }).catch(err => console.error('Failed to update DB', err));
        
        job.status = 'complete';
        jobs.set(jobId, job);
      }

    } catch (error) {
      console.error('Pipeline failed:', error);
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'error';
        // Mark any still-running steps as error so the UI doesn't spin indefinitely
        job.steps = (job.steps || []).map((s: any) =>
          s.status === 'running' ? { ...s, status: 'error', log: 'Pipeline failed unexpectedly.' } : s
        );
        jobs.set(jobId, job);
      }
    }
  }

  // ─── Conversational Orchestration Endpoint ────────────────────────────────
  app.post('/api/converse/:jobId', async (req, res) => {
    try {
    const { jobId } = req.params;
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get existing report
    let report = reports.get(jobId);
    if (!report) {
      try {
        const job = await Job.findById(jobId);
        if (job?.reportData) {
          report = job.reportData;
          reports.set(jobId, report);
        }
      } catch {}
    }
    if (!report) {
      return res.status(404).json({ error: 'Report not found. Run analysis first.' });
    }

    const { Conversation } = await import('./src/models/Conversation');
    const { translateUserMessage } = await import('./src/lib/agents/translator');

    // Find or create conversation
    let conversation = await Conversation.findOne({ jobId });
    if (!conversation) {
      conversation = new Conversation({
        jobId,
        userId: req.user ? (req.user as any)._id : undefined,
        molecule: report.molecule,
        messages: [{
          role: 'system',
          content: `Analysis conversation for ${report.molecule}. Phoenix Score: ${report.phoenix_score}/10.`,
          timestamp: new Date(),
        }],
        activeConstraints: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    });

    // Translate message to structured actions
    const keys = getGroqKeys('chat');
    const translation = await translateUserMessage(
      message.trim(),
      report.molecule,
      report,
      conversation.activeConstraints,
      keys,
    );

    // Merge new constraints
    if (translation.constraints.length > 0) {
      for (const c of translation.constraints) {
        const existing = conversation.activeConstraints.findIndex(
          (ac: any) => ac.type === c.type && ac.field === c.field
        );
        if (existing >= 0) {
          conversation.activeConstraints[existing] = c;
        } else {
          conversation.activeConstraints.push(c);
        }
      }
    }

    // Build assistant response with agent actions
    const agentActions = translation.rerunAgents.map(a => ({
      agent: a,
      action: 'rerun',
      status: 'pending' as const,
    }));

    conversation.messages.push({
      role: 'assistant',
      content: translation.responseText,
      constraints: translation.constraints,
      agentActions,
      timestamp: new Date(),
    });

    await conversation.save();

    // If a rerun is needed, kick it off
    let rerunJobId: string | null = null;
    if (translation.needsRerun && translation.rerunAgents.length > 0) {
      // Create a new job for the re-analysis
      const { runPipeline: runLangGraphPipeline } = await import('./src/lib/agents/workflow');

      const newJobId = new mongoose.Types.ObjectId().toString();
      try {
        const newJob = await Job.create({
          _id: newJobId,
          molecule: report.molecule,
          prompt: `Conversational re-analysis: ${message.trim()}`,
          userId: req.user ? (req.user as any)._id : undefined,
          status: 'processing',
          currentStep: 'Re-analyzing with constraints...',
        });
        rerunJobId = newJob._id.toString();
      } catch {
        rerunJobId = newJobId;
      }

      // Build steps dynamically — only the agents being re-run + Planner + Synthesis
      const allStepDefs: Record<string, { label: string }> = {
        PlannerAgent:   { label: 'Research Planning' },
        PubChemAgent:   { label: 'PubChem Verify' },
        ClinicalAgent:  { label: 'Clinical Trials' },
        PatentAgent:    { label: 'Patent Search' },
        LiteratureAgent:{ label: 'Literature Search' },
        RegulatoryAgent:{ label: 'FDA Data' },
        TargetAgent:    { label: 'Disease Targets' },
        AnalogAgent:    { label: 'Structural Analogs' },
        SynthesisAgent: { label: 'Report Synthesis' },
      };
      const rerunSet = new Set(translation.rerunAgents);
      // Always include PlannerAgent first and SynthesisAgent last
      rerunSet.add('PlannerAgent');
      rerunSet.add('SynthesisAgent');
      const orderedAgents = Object.keys(allStepDefs).filter(k => rerunSet.has(k));
      const rerunSteps = orderedAgents.map((name, i) => ({
        name,
        label: allStepDefs[name].label,
        status: i === 0 ? 'running' : 'waiting',
        log: i === 0 ? 'Re-planning with constraints...' : 'Pending...',
      }));

      jobs.set(rerunJobId!, {
        id: rerunJobId,
        molecule: report.molecule,
        prompt: message.trim(),
        status: 'running',
        isSteerRerun: true,
        rerunAgents: translation.rerunAgents,
        steps: rerunSteps,
        createdAt: new Date().toISOString(),
      });

      // Convert active constraints to pipeline format
      const pipelineConstraints = conversation.activeConstraints.map((c: any) => ({
        type: c.type,
        value: c.value,
        added_at: new Date().toISOString(),
      }));

      // Run in background
      runPipeline(rerunJobId!, report.molecule, pipelineConstraints).catch(err => {
        console.error(`Converse rerun error for ${rerunJobId}:`, err);
      });
    }

    res.json({
      conversationId: conversation._id,
      response: translation.responseText,
      constraints: translation.constraints,
      activeConstraints: conversation.activeConstraints,
      agentActions,
      needsRerun: translation.needsRerun,
      rerunJobId,
      rerunAgents: translation.rerunAgents || [],
    });
    } catch (err: any) {
      console.error('[Converse] Error:', err.message || err);
      res.status(500).json({ error: 'Conversation processing failed', detail: err.message });
    }
  });

  // Get conversation history for a job
  app.get('/api/converse/:jobId', async (req, res) => {
    const { jobId } = req.params;
    try {
      const { Conversation } = await import('./src/models/Conversation');
      const conversation = await Conversation.findOne({ jobId });
      if (!conversation) {
        return res.json({ messages: [], activeConstraints: [] });
      }
      res.json({
        conversationId: conversation._id,
        messages: conversation.messages,
        activeConstraints: conversation.activeConstraints,
      });
    } catch (err) {
      console.error('Conversation fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  });

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
        Job.findByIdAndUpdate(jobId, { status: 'completed', reportData: report, progress: 100, currentStep: 'Complete' }, { new: true }).catch(err => console.error('Failed to update DB', err));
      
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
  

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


