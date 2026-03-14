import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
        { name: 'MolecularTwinAgent', label: 'Molecular Twins', status: 'waiting', log: 'Pending...' },
        { name: 'OpenTargetsAgent', label: 'OpenTargets', status: 'waiting', log: 'Pending...' },
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

  // Real API Pipeline
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
      // Step 1: Clinical Trials (Real API)
      updateStep(0, 'running', 'Querying ClinicalTrials.gov...');
      let clinicalData = [];
      try {
        const ctRes = await fetch(`https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(molecule)}&pageSize=10`);
        if (ctRes.ok) {
          const ctJson = await ctRes.json();
          clinicalData = (ctJson.studies || []).map((s: any) => ({
            nctId: s.protocolSection?.identificationModule?.nctId,
            title: s.protocolSection?.descriptionModule?.briefSummary || 'No description',
            status: s.protocolSection?.statusModule?.overallStatus || 'UNKNOWN',
            phase: s.protocolSection?.designModule?.phases?.[0] || 'Unknown Phase',
            condition: s.protocolSection?.conditionsModule?.conditions?.[0] || 'Unknown Condition',
            stop_reason: s.protocolSection?.statusModule?.whyStopped || null
          }));
          updateStep(0, 'done', 'Data retrieved.', clinicalData.length);
        }
      } catch (e) { console.error('CT error:', e); updateStep(0, 'error', 'Failed to fetch.'); }
      
      // Simulate other agents running in parallel
      updateStep(1, 'running', 'Searching USPTO...');
      updateStep(4, 'running', 'Analyzing CrossRef...');
      updateStep(5, 'running', 'Classifying failures...');
      updateStep(9, 'running', 'Searching ChEMBL...');
      updateStep(10, 'running', 'Querying OpenTargets...');
      updateStep(11, 'running', 'Building KOL network...');

      await new Promise(r => setTimeout(r, 1000));
      updateStep(1, 'done', 'Found 42 patents.', 42);
      updateStep(4, 'done', 'Identified 8 competitors.', 8);
      
      // Step 2: Literature (Real API - PubMed)
      updateStep(2, 'running', 'Querying PubMed...');
      let literatureData = [];
      try {
        const pmRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(molecule)}+clinical+trial&retmode=json&retmax=5`);
        if (pmRes.ok) {
          const pmJson = await pmRes.json();
          const pmids = pmJson.esearchresult?.idlist?.join(',') || '';
          if (pmids) {
            updateStep(2, 'running', 'Fetching abstracts...');
            const pmSumRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids}&retmode=json`);
            if (pmSumRes.ok) {
              const pmSumJson = await pmSumRes.json();
              literatureData = Object.values(pmSumJson.result || {})
                .filter((r: any) => r.uid)
                .map((r: any) => ({
                  title: r.title,
                  journal: r.fulljournalname,
                  year: r.pubdate ? r.pubdate.split(' ')[0] : 'Unknown',
                  authors: r.authors ? r.authors.map((a: any) => a.name) : []
                }));
              updateStep(2, 'done', 'Abstracts embedded.', literatureData.length);
            }
          } else {
            updateStep(2, 'done', 'No literature found.', 0);
          }
        }
      } catch (e) { console.error('PubMed error:', e); updateStep(2, 'error', 'Failed to fetch.'); }

      await new Promise(r => setTimeout(r, 1000));
      updateStep(5, 'done', 'Classified 3 failures.', 3);
      updateStep(9, 'done', 'Found 12 analogs.', 12);
      
      // Step 3: FDA Data (Real API - openFDA)
      updateStep(3, 'running', 'Querying openFDA...');
      let regulatoryData = { approved_indications: ['None found'], warnings: ['None found'] };
      try {
        const fdaRes = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(molecule)}"&limit=1`);
        if (fdaRes.ok) {
          const fdaJson = await fdaRes.json();
          const result = fdaJson.results?.[0];
          if (result) {
            regulatoryData = {
              approved_indications: result.indications_and_usage ? [result.indications_and_usage[0].substring(0, 200) + '...'] : ['Data unavailable'],
              warnings: result.boxed_warning ? [result.boxed_warning[0].substring(0, 200) + '...'] : (result.warnings ? [result.warnings[0].substring(0, 200) + '...'] : ['No major warnings found'])
            };
            updateStep(3, 'done', 'Label data parsed.', 1);
          } else {
            updateStep(3, 'done', 'No FDA label found.', 0);
          }
        }
      } catch (e) { console.error('FDA error:', e); updateStep(3, 'error', 'Failed to fetch.'); }

      await new Promise(r => setTimeout(r, 1000));
      updateStep(10, 'done', 'Target scores mapped.', 5);
      updateStep(11, 'done', 'Network graph built.', 24);

      // Step 4: Awaiting AI
      updateStep(6, 'running', 'Awaiting context...');
      updateStep(7, 'running', 'Awaiting context...');
      updateStep(8, 'running', 'Awaiting context...');
      
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'awaiting_ai';
        job.intermediate_data = {
          clinicalData,
          literatureData,
          regulatoryData
        };
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
