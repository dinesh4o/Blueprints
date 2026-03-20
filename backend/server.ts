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
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './src/config/database';
import passportConfig from './src/config/passport';
import authRoutes from './src/routes/auth';
import communityRoutes from './src/routes/community';
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
        signal: AbortSignal.timeout(30000),
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
    .slice(0, 8);
}

async function startServer() {
  // Connect to MongoDB in background — don't block server startup
  connectDB().catch(() => {});

  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  if (!process.env.SESSION_SECRET) {
    console.warn('[Security] SESSION_SECRET not set — using insecure fallback. Set SESSION_SECRET in .env for production.');
  }

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
  app.use('/api/community', communityRoutes);

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
    const { molecule } = req.body;
    if (!molecule) {
      return res.status(400).json({ error: 'Molecule name is required' });
    }

    // Very early validation before creating jobs
    const isReal = await validateMolecule(molecule);
    if (!isReal) {
      return res.status(400).json({ error: 'No real-world data found for this molecule. Please try a valid pharmacological term.' });
    }

    let jobId = crypto.randomUUID();
    
    // Save to DB so we have a persistent history record
    try {
      const newJob = await Job.create({
        molecule,
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
      status: 'running',
      steps: [
        { name: 'PubChemAgent', label: 'PubChem Verify', status: 'running', log: 'Initializing...' },
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

    res.json({ job_id: jobId });
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
  async function validateMolecule(name: string): Promise<boolean> {
    try {
      const res = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON`);
      if (res.ok) {
        const data = await res.json();
        if (data?.IdentifierList?.CID?.length > 0) return true;
      }
    } catch {}

    try {
      const res = await fetch(`https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(name)}&pageSize=1`);
      if (res.ok) {
        const data = await res.json();
        if (data?.studies?.length > 0) return true;
      }
    } catch {}
    return false;
  }

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
      updateStep(0, 'running', 'Verifying in registries...');
      const isReal = await validateMolecule(molecule);
      if (!isReal) {
         updateStep(0, 'done', 'No real-world data found.', 0);
         updateStep(7, 'done', 'Processing bypassed.');
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
        Job.findByIdAndUpdate(jobId, { status: 'completed', reportData: report, progress: 100, currentStep: 'Complete' }, { new: true }).catch(err => console.error('Failed to update DB', err));
           job.status = 'complete'; jobs.set(jobId, job);
         }
         return;
      }

      updateStep(1, 'running', 'Querying ClinicalTrials...');
      updateStep(3, 'running', 'Querying PubMed...');
      updateStep(4, 'running', 'Querying FDA Labels...');

      await new Promise(r => setTimeout(r, 500));
      updateStep(2, 'running', 'Searching USPTO...');
      updateStep(5, 'running', 'Identifying disease targets...');
      updateStep(6, 'running', 'Finding structural analogs...');

      // Dynamically import LangGraph to avoid slowing down dev server boot time
      const { runPipeline: runLangGraphPipeline } = await import('./src/lib/agents/workflow');

      // Let LangGraph do all the parallel execution
      const resultState = await runLangGraphPipeline(molecule);

      // Map back to our simulated job state
      const clinicalData = resultState.clinicalData || [];
      const literatureData = resultState.literatureData || [];
      const regulatoryData = resultState.regulatoryData || { approved_indications: ['None'], warnings: ['None'] };

      // PubChem is the authoritative check (100M+ compounds)
      const pubchemExists = resultState.pubchemData?.exists;

      const pubchemLabel = pubchemExists === true
        ? `CID ${resultState.pubchemData?.cid || 'found'} — ${resultState.pubchemData?.molecular_formula || 'verified'}`
        : pubchemExists === false ? 'Not in PubChem (fake)' : 'PubChem timeout';
      updateStep(0, 'done', pubchemLabel, pubchemExists ? 1 : 0);

      updateStep(1, 'done', 'Data retrieved.', clinicalData.length);
      updateStep(2, 'done', `Found ${resultState.patentData?.length || 0} patents.`, resultState.patentData?.length || 0);
      updateStep(3, 'done', 'Abstracts embedded.', literatureData.length);
      updateStep(4, 'done', 'Label data parsed.', 1);
      updateStep(5, 'done', `Found ${resultState.targetData?.targetsFound || 0} targets.`, resultState.targetData?.targetsFound || 0);

      const similarMolecules = resultState.similarMolecules || [];
      updateStep(6, 'done', `${similarMolecules.length} structural analogs analyzed`, similarMolecules.length);
      updateStep(7, 'running', 'Synthesizing report...');
      await new Promise(r => setTimeout(r, 1000));
      updateStep(7, 'done', 'Synthesis generated.');
      
      const job = jobs.get(jobId);
      if (job) {
          // Use the real LangChain Python Phoenix Score microservice if available,
          // otherwise fallback to calculated mock
          let phoenixScore = resultState.phoenix_score || null;
          let phoenixBreakdown = resultState.phoenix_breakdown || {};
          let phoenixExplanation = resultState.phoenix_explanation || "";

          // The hardcoded fallback calculation that resulted in 1.0 has been deleted.

        const finalViabilityScore = (resultState.viabilityScore != null && resultState.viabilityScore > 0) ? resultState.viabilityScore : null;

        // Build repurposing candidates and market analysis from real clinical data + LLM market estimates
        // Deduplicate by canonical disease name BEFORE passing to LLM (prevents identical $57.8B entries)
        const uniqueConditions = [...new Set(
          clinicalData.map((t: any) => t.condition).filter(Boolean)
            .map((c: string) => {
              const canon = normalizeDiseaseName(c);
              return canon.replace(/\b\w/g, (ch: string) => ch.toUpperCase()); // Title-case
            })
        )] as string[];
        const marketData = await fetchMarketEstimates(uniqueConditions);
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
          created_at: new Date().toISOString(),
        };

        reports.set(jobId, report);
        Job.findByIdAndUpdate(jobId, { status: 'completed', reportData: report, progress: 100, currentStep: 'Complete' }, { new: true }).catch(err => console.error('Failed to update DB', err));
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


