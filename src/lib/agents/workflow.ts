import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import axios from "axios";
import * as dotenv from 'dotenv';
dotenv.config();

// ─── PUG View helpers ──────────────────────────────────────────────────────

/** Recursively search PUG View sections and return the first matching text. */
function pugText(data: any, ...headings: string[]): string | null {
  const traverse = (sections: any[]): string | null => {
    for (const s of sections || []) {
      if (headings.some(h => s.TOCHeading?.toLowerCase().includes(h.toLowerCase()))) {
        const text = s.Information?.[0]?.Value?.StringWithMarkup?.[0]?.String;
        if (text) return text.substring(0, 600);
        if (s.Section) { const r = traverse(s.Section); if (r) return r; }
      }
      if (s.Section) { const r = traverse(s.Section); if (r) return r; }
    }
    return null;
  };
  return traverse(data?.Record?.Section || []);
}

/** Recursively extract a list of string values from a PUG View section. */
function pugList(data: any, ...headings: string[]): string[] {
  const traverse = (sections: any[]): string[] => {
    for (const s of sections || []) {
      if (headings.some(h => s.TOCHeading?.toLowerCase().includes(h.toLowerCase()))) {
        const items = (s.Information || [])
          .map((inf: any) => inf.Value?.StringWithMarkup?.[0]?.String)
          .filter(Boolean);
        if (items.length) return items.slice(0, 10);
      }
      if (s.Section) { const r = traverse(s.Section); if (r.length) return r; }
    }
    return [];
  };
  return traverse(data?.Record?.Section || []);
}

// ─── State ─────────────────────────────────────────────────────────────────

export const GraphState = Annotation.Root({
  molecule:        Annotation<string>(),
  clinicalData:    Annotation<any[]>({ reducer: (a, b) => b ?? a }),
  literatureData:  Annotation<any[]>({ reducer: (a, b) => b ?? a }),
  regulatoryData:  Annotation<any>({ reducer: (a, b) => b ?? a }),
  targetData:      Annotation<any>({ reducer: (a, b) => b ?? a }),
  patentData:      Annotation<any>({ reducer: (a, b) => b ?? a }),
  pubchemData:     Annotation<any>({ reducer: (a, b) => b ?? a }),
  similarMolecules:Annotation<any[]>({ reducer: (a, b) => b ?? a }),
  analysisReport:  Annotation<string>({ reducer: (a, b) => b ?? a }),
  viabilityScore:  Annotation<number>({ reducer: (a, b) => b ?? a }),
  top_opportunities: Annotation<string[]>({ reducer: (a, b) => b ?? a }),
  top_risks:         Annotation<string[]>({ reducer: (a, b) => b ?? a }),
});

// ─── Agents ────────────────────────────────────────────────────────────────

// PubChem Agent: existence check + comprehensive molecular + pharmacological data
async function fetchPubChemData(state: typeof GraphState.State) {
  console.log(`[PubChemAgent] Verifying "${state.molecule}" in PubChem...`);
  try {
    // 1. Basic molecular properties (existence check + Lipinski-like descriptors)
    const propsRes = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(state.molecule)}/property/MolecularFormula,MolecularWeight,IUPACName,InChIKey,CanonicalSMILES,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount/JSON`,
      { timeout: 10000 }
    );
    const prop = propsRes.data?.PropertyTable?.Properties?.[0];
    if (!prop) return { pubchemData: { exists: false } };

    // 2. CID
    const cidRes = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(state.molecule)}/cids/JSON`,
      { timeout: 5000 }
    );
    const cid = cidRes.data?.IdentifierList?.CID?.[0];
    if (!cid) return { pubchemData: { exists: true, ...prop } };

    console.log(`[PubChemAgent] CID ${cid} | Formula ${prop.MolecularFormula}. Fetching PUG View...`);

    // 3. Parallel PUG View section calls for rich annotation
    const [pharmaRes, drugInfoRes, diseasesRes, safetyRes] = await Promise.allSettled([
      // Section 8 — Pharmacology & Biochemistry (MOA, ADME, half-life, protein binding)
      axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Pharmacology+and+Biochemistry`, { timeout: 14000 }),
      // Section 7 — Drug & Medication Information (ATC codes, routes, drug class)
      axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Drug+and+Medication+Information`, { timeout: 14000 }),
      // Section 13 — Associated Disorders & Diseases (disease annotations from CTD, DisGeNET)
      axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Associated+Disorders+and+Diseases`, { timeout: 14000 }),
      // Section 11/12 — Safety, Hazards, Toxicity (GHS, LD50)
      axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Toxicity`, { timeout: 12000 }),
    ]);

    const pharmaData   = pharmaRes.status   === 'fulfilled' ? pharmaRes.value.data   : null;
    const drugInfoData = drugInfoRes.status === 'fulfilled' ? drugInfoRes.value.data : null;
    const diseasesData = diseasesRes.status === 'fulfilled' ? diseasesRes.value.data : null;
    const safetyData   = safetyRes.status   === 'fulfilled' ? safetyRes.value.data   : null;

    // ── Extract Pharmacology & Biochemistry
    const mechanism_of_action = pugText(pharmaData, 'mechanism of action');
    const pharmacology        = pugText(pharmaData, 'pharmacology');
    const absorption          = pugText(pharmaData, 'absorption');
    const half_life           = pugText(pharmaData, 'half-life', 'half life');
    const protein_binding     = pugText(pharmaData, 'protein binding');
    const metabolism          = pugText(pharmaData, 'metabolism', 'biotransformation');
    const volume_of_dist      = pugText(pharmaData, 'volume of distribution');
    const clearance           = pugText(pharmaData, 'clearance');

    // ── Extract Drug & Medication Info
    const atc_codes       = pugList(drugInfoData, 'atc code', 'atc classification');
    const routes_of_admin = pugList(drugInfoData, 'route of administration');
    const drug_classes    = pugList(drugInfoData, 'drug class', 'pharmacological class');
    const approved_use    = pugText(drugInfoData, 'approved use', 'indication', 'therapeutic use');

    // ── Extract Associated Diseases (Section 13)
    const associated_diseases = pugList(diseasesData, 'associated disorders', 'associated diseases', 'disorders and diseases');

    // ── Extract Toxicity summary
    const ld50_text    = pugText(safetyData, 'ld50', 'lethal dose');
    const tox_summary  = pugText(safetyData, 'acute effects', 'toxicity summary', 'health effects');

    console.log(`[PubChemAgent] MOA: ${mechanism_of_action?.substring(0, 60)}... | Diseases: ${associated_diseases.length}`);

    return {
      pubchemData: {
        exists: true,
        cid,
        pubchem_url:       `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`,
        // Basic properties
        molecular_formula: prop.MolecularFormula,
        molecular_weight:  prop.MolecularWeight,
        iupac_name:        prop.IUPACName,
        inchi_key:         prop.InChIKey,
        canonical_smiles:  prop.CanonicalSMILES,
        xlogp:             prop.XLogP,
        hbd:               prop.HBondDonorCount,
        hba:               prop.HBondAcceptorCount,
        rotatable_bonds:   prop.RotatableBondCount,
        heavy_atom_count:  prop.HeavyAtomCount,
        // Pharmacology
        mechanism_of_action,
        pharmacology,
        absorption,
        half_life,
        protein_binding,
        metabolism,
        volume_of_dist,
        clearance,
        // Drug info
        atc_codes,
        routes_of_admin,
        drug_classes,
        approved_use,
        // Disease associations
        associated_diseases,
        // Toxicity
        ld50_text,
        tox_summary,
      }
    };
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.log(`[PubChemAgent] "${state.molecule}" not found in PubChem`);
      return { pubchemData: { exists: false } };
    }
    console.error('[PubChemAgent]', error?.message);
    return { pubchemData: { exists: null } };
  }
}

// Structural Analog Agent: runs after PubChem (needs CID), finds similar molecules
// and checks if any have instructive clinical trial histories for repurposing insights
async function fetchSimilarMolecules(state: typeof GraphState.State) {
  const cid = state.pubchemData?.cid;
  if (!cid || state.pubchemData?.exists !== true) return { similarMolecules: [] };

  console.log(`[SimilarityAgent] Finding structural analogs for CID ${cid}...`);
  try {
    // Tanimoto similarity ≥ 90%, exclude self
    const simRes = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsimilarity_2d/cid/${cid}/cids/JSON?Threshold=90&MaxRecords=10`,
      { timeout: 15000 }
    );
    const similarCIDs: number[] = (simRes.data?.IdentifierList?.CID || [])
      .filter((c: number) => c !== cid)
      .slice(0, 8);
    if (!similarCIDs.length) return { similarMolecules: [] };

    // Get properties + synonyms in parallel
    const [propsRes, synonymsRes] = await Promise.allSettled([
      axios.get(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${similarCIDs.join(',')}/property/IUPACName,MolecularFormula,MolecularWeight,XLogP/JSON`,
        { timeout: 10000 }
      ),
      axios.get(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${similarCIDs.slice(0, 6).join(',')}/synonyms/JSON`,
        { timeout: 10000 }
      ),
    ]);

    const props: any[]      = propsRes.status      === 'fulfilled' ? propsRes.value.data?.PropertyTable?.Properties || [] : [];
    const synonymsAll: any[] = synonymsRes.status  === 'fulfilled' ? synonymsRes.value.data?.InformationList?.Information || [] : [];

    // For each analog, resolve common name + check clinical history
    const analogResults = await Promise.allSettled(
      props.slice(0, 5).map(async (p: any) => {
        const synInfo = synonymsAll.find((s: any) => s.CID === p.CID);
        const syns: string[] = synInfo?.Synonym || [];

        // Pick best common name: Title-case, <40 chars, not starting with digit
        const commonName =
          syns.find(s => /^[A-Z][a-z]/.test(s) && s.length < 40) ||
          syns.find(s => s.length < 40) ||
          p.IUPACName?.substring(0, 40) ||
          `CID ${p.CID}`;

        // Query ClinicalTrials to understand this analog's history
        try {
          const trialsRes = await axios.get(
            `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(commonName)}&pageSize=5`,
            { timeout: 8000 }
          );
          const trials = trialsRes.data?.studies || [];
          const terminated = trials.filter((t: any) =>
            ['TERMINATED', 'WITHDRAWN'].includes(t.protocolSection?.statusModule?.overallStatus)
          );
          const conditions = [...new Set(
            trials.flatMap((t: any) => t.protocolSection?.conditionsModule?.conditions || [])
          )].slice(0, 3) as string[];
          const failedConditions = [...new Set(
            terminated.flatMap((t: any) => t.protocolSection?.conditionsModule?.conditions || [])
          )].slice(0, 3) as string[];
          const failedPhases = [...new Set(
            terminated.map((t: any) => t.protocolSection?.designModule?.phases?.[0]).filter(Boolean)
          )].join(', ');

          const repurposing_insight =
            terminated.length > 0
              ? `Failed in ${failedPhases || 'unknown phase'} for ${failedConditions.join(', ') || 'undisclosed conditions'}. Structural differences in ${state.molecule} may address these barriers.`
              : trials.length > 0
              ? `Active in trials for ${conditions.join(', ')} — validates ${state.molecule}'s scaffold in this therapeutic space.`
              : 'Research-stage analog with no public clinical history.';

          return {
            cid:    p.CID,
            name:   commonName,
            formula: p.MolecularFormula,
            molecular_weight: p.MolecularWeight,
            xlogp:  p.XLogP,
            total_trials:   trials.length,
            failed_trials:  terminated.length,
            conditions,
            failed_conditions: failedConditions,
            failed_phases:     failedPhases,
            repurposing_insight,
            repurposing_potential: terminated.length > 1 ? 'High' : terminated.length > 0 ? 'Moderate' : trials.length > 0 ? 'Active' : 'Exploratory',
          };
        } catch {
          return {
            cid: p.CID, name: commonName, formula: p.MolecularFormula,
            molecular_weight: p.MolecularWeight, xlogp: p.XLogP,
            total_trials: 0, failed_trials: 0, conditions: [], failed_conditions: [],
            failed_phases: '', repurposing_insight: 'No clinical history found.',
            repurposing_potential: 'Exploratory',
          };
        }
      })
    );

    const similarMolecules = analogResults
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => (r as PromiseFulfilledResult<any>).value);

    console.log(`[SimilarityAgent] ${similarMolecules.length} analogs resolved`);
    return { similarMolecules };
  } catch (error: any) {
    console.error('[SimilarityAgent]', error?.message);
    return { similarMolecules: [] };
  }
}

// Clinical Agent (ClinicalTrials.gov)
async function fetchClinicalData(state: typeof GraphState.State) {
  console.log(`[ClinicalAgent] Fetching trials for ${state.molecule}...`);
  try {
    const res = await axios.get(
      `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(state.molecule)}&pageSize=10`
    );
    return {
      clinicalData: (res.data.studies || []).map((s: any) => ({
        id:        s.protocolSection?.identificationModule?.nctId,
        nctId:     s.protocolSection?.identificationModule?.nctId,
        title:     s.protocolSection?.identificationModule?.briefTitle || 'Untitled Study',
        status:    s.protocolSection?.statusModule?.overallStatus || 'UNKNOWN',
        phase:     s.protocolSection?.designModule?.phases?.[0] || 'Unknown',
        condition: s.protocolSection?.conditionsModule?.conditions?.[0] || 'Unknown',
      }))
    };
  } catch { return { clinicalData: [] }; }
}

// Literature Agent (PubMed)
async function fetchLiteratureData(state: typeof GraphState.State) {
  console.log(`[LiteratureAgent] Fetching PubMed papers for ${state.molecule}...`);
  try {
    const searchRes = await axios.get(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(state.molecule)}+AND+clinical+trial&retmode=json&retmax=5`
    );
    if (searchRes.data.esearchresult?.errorlist?.phrasesnotfound?.some(
      (p: string) => p.toLowerCase() === state.molecule.toLowerCase()
    )) return { literatureData: [] };

    const pmids = searchRes.data.esearchresult?.idlist?.join(',');
    if (!pmids || searchRes.data.esearchresult?.count === '0') return { literatureData: [] };

    const summaryRes = await axios.get(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids}&retmode=json`
    );
    return {
      literatureData: Object.values(summaryRes.data.result || {})
        .filter((p: any) => p.uid)
        .map((p: any) => ({
          id:      p.uid,
          title:   p.title,
          journal: p.fulljournalname,
          year:    p.pubdate?.split(' ')[0] || 'Unknown',
          authors: p.authors?.map((a: any) => a.name) || [],
        }))
    };
  } catch { return { literatureData: [] }; }
}

// Regulatory Agent (openFDA)
async function fetchRegulatoryData(state: typeof GraphState.State) {
  console.log(`[RegulatoryAgent] Fetching FDA labels for ${state.molecule}...`);
  try {
    const res = await axios.get(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(state.molecule)}"&limit=1`
    );
    const label = res.data.results?.[0];
    return {
      regulatoryData: {
        indications: label?.indications_and_usage?.[0]?.substring(0, 200) || 'None',
        warnings:    label?.boxed_warning?.[0]?.substring(0, 200) || 'None',
      }
    };
  } catch {
    return { regulatoryData: { indications: 'Investigational', warnings: 'None found' } };
  }
}

// Target Agent (placeholder — Open Targets requires GraphQL)
async function fetchTargetData(state: typeof GraphState.State) {
  console.log(`[TargetAgent] Running target placeholder for ${state.molecule}...`);
  return { targetData: { score: Math.random() * 10, targetsFound: 5 } };
}

// LLM Synthesis Agent (Groq — llama-3.3-70b)
async function synthesizeAndEvaluate(state: typeof GraphState.State) {
  console.log(`[JudgeAgent] Synthesizing for ${state.molecule}...`);

  const GROQ_KEY = process.env.GROQ_API_KEY || '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';
  const pc = state.pubchemData;
  const sm = state.similarMolecules || [];

  const pharmaContext = pc?.exists ? [
    `Formula: ${pc.molecular_formula}, MW: ${pc.molecular_weight} g/mol`,
    `XLogP: ${pc.xlogp}, HBD: ${pc.hbd}, HBA: ${pc.hba}`,
    pc.mechanism_of_action ? `MOA: ${pc.mechanism_of_action?.substring(0, 300)}` : null,
    pc.pharmacology        ? `Pharmacology: ${pc.pharmacology?.substring(0, 300)}` : null,
    pc.atc_codes?.length   ? `ATC: ${pc.atc_codes.join(', ')}` : null,
    pc.half_life           ? `Half-life: ${pc.half_life?.substring(0, 100)}` : null,
    pc.protein_binding     ? `Protein binding: ${pc.protein_binding?.substring(0, 100)}` : null,
    pc.associated_diseases?.length ? `Associated diseases (PubChem): ${pc.associated_diseases.slice(0, 6).join(', ')}` : null,
  ].filter(Boolean).join('\n') : 'Not in PubChem';

  const analogContext = sm.length
    ? sm.map(a => `• ${a.name} (${a.formula}): ${a.repurposing_insight} [Potential: ${a.repurposing_potential}]`).join('\n')
    : 'None found';

  const prompt = `You are an expert Clinical Scientist, Pharmacologist, and Drug Repurposing Analyst.
Evaluate the DRUG REPURPOSING potential of "${state.molecule}".

=== PubChem Data ===
${pharmaContext}

=== Clinical Trials (${state.clinicalData?.length || 0} studies) ===
${JSON.stringify(state.clinicalData?.slice(0, 6))}

=== Literature (${state.literatureData?.length || 0} papers) ===
${JSON.stringify(state.literatureData?.slice(0, 3))}

=== Regulatory ===
${JSON.stringify(state.regulatoryData)}

=== Structural Analogs with Clinical Insights ===
${analogContext}

FOCUS: Which NEW diseases/conditions could this molecule be repurposed for, beyond its original indication?
Consider: mechanism of action, structural analog failures/successes, associated diseases, and drug-likeness.

Output a JSON object with exactly four keys:
1. viabilityScore (0.0–10.0: drug-likeness + trial evidence + repurposing evidence)
2. analysisReport (3 paragraphs: repurposing potential, pharmacological basis, risk/opportunity summary)
3. top_opportunities (2–3 short strings: best repurposing opportunities with scientific rationale)
4. top_risks (2–3 short strings: key risks or barriers to repurposing)`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You only respond with perfectly valid JSON. No text outside the JSON object.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      },
      { headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' } }
    );
    const content = response.data.choices[0].message.content
      .replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(content);
    return {
      viabilityScore:    result.viabilityScore,
      analysisReport:    result.analysisReport,
      top_opportunities: result.top_opportunities || ['No opportunities identified.'],
      top_risks:         result.top_risks         || ['No risks identified.'],
    };
  } catch (error) {
    console.error('[JudgeAgent] LLM error:', error);
    return {
      viabilityScore: 0.0,
      analysisReport: 'Error synthesizing data. Check LLM connection or API keys.',
      top_opportunities: ['Error in AI generation'],
      top_risks:         ['Error in AI generation'],
    };
  }
}

// ─── Graph ──────────────────────────────────────────────────────────────────
//
//  START ──→ fetchPubChem ──→ fetchSimilarMolecules ──→ synthesize ──→ END
//  START ──→ fetchClinical ────────────────────────────→ synthesize
//  START ──→ fetchLiterature ──────────────────────────→ synthesize
//  START ──→ fetchRegulatory ──────────────────────────→ synthesize
//  START ──→ fetchTarget ──────────────────────────────→ synthesize

const workflow = new StateGraph(GraphState)
  .addNode('fetchPubChem',   fetchPubChemData)
  .addNode('fetchSimilar',   fetchSimilarMolecules)
  .addNode('fetchClinical',  fetchClinicalData)
  .addNode('fetchLiterature',fetchLiteratureData)
  .addNode('fetchRegulatory',fetchRegulatoryData)
  .addNode('fetchTarget',    fetchTargetData)
  .addNode('synthesize',     synthesizeAndEvaluate)

  // PubChem → SimilarMolecules (sequential: needs CID)
  .addEdge(START,          'fetchPubChem')
  .addEdge('fetchPubChem', 'fetchSimilar')
  .addEdge('fetchSimilar', 'synthesize')

  // Independent parallel fetchers → synthesize
  .addEdge(START,           'fetchClinical')
  .addEdge(START,           'fetchLiterature')
  .addEdge(START,           'fetchRegulatory')
  .addEdge(START,           'fetchTarget')
  .addEdge('fetchClinical',  'synthesize')
  .addEdge('fetchLiterature','synthesize')
  .addEdge('fetchRegulatory','synthesize')
  .addEdge('fetchTarget',    'synthesize')

  .addEdge('synthesize', END);

export const multiAgentPipeline = workflow.compile();

export async function runPipeline(molecule: string) {
  return multiAgentPipeline.invoke({
    molecule,
    clinicalData:     [],
    literatureData:   [],
    regulatoryData:   null,
    targetData:       null,
    patentData:       null,
    pubchemData:      null,
    similarMolecules: [],
    analysisReport:   '',
    viabilityScore:   0,
    top_opportunities:[],
    top_risks:        [],
  });
}
