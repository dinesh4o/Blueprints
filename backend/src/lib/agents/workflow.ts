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
  phoenix_score:     Annotation<number>({ reducer: (a, b) => b ?? a }),
  phoenix_breakdown: Annotation<any>({ reducer: (a, b) => b ?? a }),
  phoenix_explanation: Annotation<string>({ reducer: (a, b) => b ?? a }),
  total_pubmed_papers: Annotation<number>({ reducer: (a, b) => b ?? a }),
});

// ─── Agents ────────────────────────────────────────────────────────────────

// PubChem Agent: existence check + comprehensive molecular + pharmacological data
async function fetchPubChemData(state: typeof GraphState.State) {
  try {
    // 1. Try to resolve the name to a CID (handles synonyms and mixtures much better)
    const cidRes = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(state.molecule)}/cids/JSON`,
      { timeout: 5000 }
    );
    const cid = cidRes.data?.IdentifierList?.CID?.[0];
    if (!cid) return { pubchemData: { exists: false } };

    // 2. Fetch basic molecular properties using the resolved CID
    const propsRes = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,InChIKey,CanonicalSMILES,XLogP,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount,Complexity,DefinedAtomStereoCount/JSON`,
      { timeout: 10000 }
    ).catch(() => ({ data: null }));
    const prop = propsRes.data?.PropertyTable?.Properties?.[0] || {};


    // 3. Parallel PUG View section calls for rich annotation
    const [pharmaRes, drugInfoRes, diseasesRes, safetyRes] = await Promise.allSettled([
      // Section 8 — Pharmacology & Biochemistry (MOA, ADME, half-life, protein binding)
      axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Pharmacology+and+Biochemistry`, { timeout: 8000 }),
      // Section 7 — Drug & Medication Information (ATC codes, routes, drug class)
      axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Drug+and+Medication+Information`, { timeout: 8000 }),
      // Section 13 — Associated Disorders & Diseases (disease annotations from CTD, DisGeNET)
      axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Associated+Disorders+and+Diseases`, { timeout: 8000 }),
      // Section 11/12 — Safety, Hazards, Toxicity (GHS, LD50)
      axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Toxicity`, { timeout: 8000 }),
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
    const volume_of_dist      = pugText(pharmaData, 'volume of distribution', 'distribution');
    const clearance           = pugText(pharmaData, 'clearance');
    const excretion           = pugText(pharmaData, 'excretion');

    // ── Extract Drug & Medication Info
    const atc_codes       = pugList(drugInfoData, 'atc code', 'atc classification');
    const routes_of_admin = pugList(drugInfoData, 'route of administration');
    const drug_classes    = pugList(drugInfoData, 'drug class', 'pharmacological class');
    const approved_use    = pugText(drugInfoData, 'approved use', 'indication', 'therapeutic use');

    // ── Extract Associated Diseases (Section 13)
    const associated_diseases = pugList(diseasesData, 'associated disorders', 'associated diseases', 'disorders and diseases');

    // ── Extract Toxicity summary
    const ld50_text    = pugText(safetyData, 'ld50', 'lethal dose', 'non-human toxicity values', 'toxicity values');
    const tox_summary  = pugText(safetyData, 'acute effects', 'toxicity summary', 'health effects', 'human toxicity values');


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
        complexity:        prop.Complexity,
        defined_atom_stereocenter_count: prop.DefinedAtomStereoCount,
        // Pharmacology
        mechanism_of_action,
        pharmacology,
        absorption,
        half_life,
        protein_binding,
        metabolism,
        volume_of_dist,
        clearance,
        excretion,
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

  try {
    // Tanimoto similarity ≥ 90%, exclude self
    const simRes = await axios.get(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsimilarity_2d/cid/${cid}/cids/JSON?Threshold=90&MaxRecords=10`,
      { timeout: 8000 }
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

    return { similarMolecules };
  } catch (error: any) {
    console.error('[SimilarityAgent] API failed:', error.message);
    return { similarMolecules: null };
  }
}

// Clinical Agent (ClinicalTrials.gov)
async function fetchClinicalData(state: typeof GraphState.State) {
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
  } catch (err: any) { 
    console.error('[ClinicalTrials] API failed:', err.message);
    return { clinicalData: null }; 
  }
}

// Literature Agent (PubMed)
async function fetchLiteratureData(state: typeof GraphState.State) {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(state.molecule)}+AND+clinical+trial&retmode=json&retmax=5`;
    const searchRes = await axios.get(searchUrl);
    
    // Total total_pubmed_papers count for ALL literature (bias check)
    const countUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(state.molecule)}&rettype=count&retmode=json`;
    const countRes = await axios.get(countUrl);
    const total_pubmed_papers = parseInt(countRes.data?.esearchresult?.count ?? '0');

    if (searchRes.data.esearchresult?.errorlist?.phrasesnotfound?.some(
      (p: string) => p.toLowerCase() === state.molecule.toLowerCase()
    )) return { literatureData: [], total_pubmed_papers };

    const pmids = searchRes.data.esearchresult?.idlist?.join(',');
    if (!pmids || searchRes.data.esearchresult?.count === '0') return { literatureData: [], total_pubmed_papers };

    const summaryRes = await axios.get(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmids}&retmode=json`);
    return {
      total_pubmed_papers,
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
  } catch (err: any) { 
    console.error('[PubMed] API failed:', err.message);
    return { literatureData: null, total_pubmed_papers: 0 }; 
  }
}

// Regulatory Agent (openFDA)
async function fetchRegulatoryData(state: typeof GraphState.State) {
  try {
    const term = encodeURIComponent(state.molecule.toLowerCase());
    const termUpper = encodeURIComponent(state.molecule.toUpperCase());
    
    // Fetch generic, brand, and substance to cast a wide net (fixes Minoxidil/Thalomid misses)
    const urls = [
      `https://api.fda.gov/drug/label.json?search=openfda.substance_name:"${termUpper}"&limit=10`,
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${term}"&limit=10`,
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${termUpper}"&limit=10`
    ];

    let allResults: any[] = [];
    for (const u of urls) {
      try {
        const res = await axios.get(u, { timeout: 3000 });
        if (res.data?.results) allResults = allResults.concat(res.data.results);
      } catch (e) {}
    }

    let beneficial_faers_hit = false;
    let faers_reactions: { term: string; count: number }[] = [];
    try {
        // Serendipity signal check
        const faersUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.medicinalproduct:"${termUpper}"+AND+(patient.reaction.reactionmeddrapt:"hair+growth"+patient.reaction.reactionmeddrapt:"erection")&limit=1`;
        const faersRes = await axios.get(faersUrl, { timeout: 3000 });
        if (faersRes.data?.results?.length > 0) beneficial_faers_hit = true;
    } catch (e) {}

    // FAERS adverse event reaction counts (top 20 reactions by report count)
    try {
      const faersCountUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.generic_name:"${termUpper}"&count=patient.reaction.reactionmeddrapt.exact&limit=25`;
      const faersCountRes = await axios.get(faersCountUrl, { timeout: 5000 });
      faers_reactions = (faersCountRes.data?.results || []).map((r: any) => ({
        term: r.term,
        count: r.count,
      }));
    } catch (e) {
      // Try alternative search with substance_name
      try {
        const faersAltUrl = `https://api.fda.gov/drug/event.json?search=patient.drug.openfda.substance_name:"${termUpper}"&count=patient.reaction.reactionmeddrapt.exact&limit=25`;
        const faersAltRes = await axios.get(faersAltUrl, { timeout: 5000 });
        faers_reactions = (faersAltRes.data?.results || []).map((r: any) => ({
          term: r.term,
          count: r.count,
        }));
      } catch (e2) {}
    }

    // Extract unique indication paragraphs
    const uniqueInds = new Set<string>();
    for (const r of allResults) {
      if (r.indications_and_usage?.[0]) {
        // use first 50 chars as a uniqueness fingerprint
        const fingerprint = r.indications_and_usage[0].substring(0, 50).toLowerCase();
        let isUnique = true;
        for (const existing of uniqueInds) {
           if (existing.toLowerCase().includes(fingerprint) || fingerprint.includes(existing.substring(0,50).toLowerCase())) {
               isUnique = false; break;
           }
        }
        if (isUnique) uniqueInds.add(r.indications_and_usage[0]);
      }
    }
    
    const indicationsList = Array.from(uniqueInds);

    return {
      regulatoryData: {
        all_indications: indicationsList,
        beneficial_faers_hit,
        has_orphan_designation: allResults.some(r => JSON.stringify(r).toLowerCase().includes('orphan')),
        has_breakthrough_designation: allResults.some(r => JSON.stringify(r).toLowerCase().includes('breakthrough')),
        indications: indicationsList[0]?.substring(0, 200) || 'None found',
        warnings: allResults[0]?.boxed_warning?.[0]?.substring(0, 200) || 'None',
        faers_reactions,
      }
    };
  } catch (err: any) {
    console.error('[OpenFDA] API failed:', err.message);
    return { regulatoryData: null };
  }
}

// Target Agent — Real Open Targets Platform GraphQL API (free, no key required)
async function fetchTargetData(state: typeof GraphState.State) {
  try {
    const molecule = state.molecule;

    // Step 1: Search for the drug entity in Open Targets
    const searchQuery = `
      query {
        search(queryString: "${molecule.replace(/"/g, '\\"')}", entityNames: ["drug"], page: { size: 1, index: 0 }) {
          hits {
            id
            entity
            name
            description
          }
        }
      }
    `;

    const searchRes = await axios.post(
      'https://api.platform.opentargets.org/api/v4/graphql',
      { query: searchQuery },
      { timeout: 10000, headers: { 'Content-Type': 'application/json' } }
    );

    const drugHit = searchRes.data?.data?.search?.hits?.[0];
    if (!drugHit) {
      console.log('[TargetAgent] No drug found in Open Targets for:', molecule);
      return { targetData: { score: null, targetsFound: 0, source: 'Open Targets', targets: [], diseases: [], mechanisms: [] } };
    }

    const chemblId = drugHit.id;

    // Step 2: Get drug details — mechanisms, linked targets, linked diseases, withdrawal info
    const drugQuery = `
      query {
        drug(chemblId: "${chemblId}") {
          id
          name
          drugType
          maximumClinicalTrialPhase
          hasBeenWithdrawn
          withdrawnNotice { year reasons { reason } countries }
          mechanismsOfAction {
            rows {
              mechanismOfAction
              targets { id approvedName approvedSymbol }
              actionType
            }
          }
          linkedDiseases { count rows { id name } }
          linkedTargets { count rows { id approvedName approvedSymbol } }
        }
      }
    `;

    const drugRes = await axios.post(
      'https://api.platform.opentargets.org/api/v4/graphql',
      { query: drugQuery },
      { timeout: 12000, headers: { 'Content-Type': 'application/json' } }
    );

    const drug = drugRes.data?.data?.drug;
    if (!drug) {
      return { targetData: { score: null, targetsFound: 0, source: 'Open Targets', targets: [], diseases: [], mechanisms: [] } };
    }

    const targets = (drug.linkedTargets?.rows || []).slice(0, 10).map((t: any) => ({
      id: t.id,
      name: t.approvedName,
      symbol: t.approvedSymbol,
    }));

    const diseases = (drug.linkedDiseases?.rows || []).slice(0, 15).map((d: any) => ({
      id: d.id,
      name: d.name,
    }));

    const mechanisms = (drug.mechanismsOfAction?.rows || []).map((m: any) => ({
      description: m.mechanismOfAction,
      actionType: m.actionType,
      targetName: m.targets?.[0]?.approvedName || 'Unknown',
      targetSymbol: m.targets?.[0]?.approvedSymbol || '',
    }));

    const targetsFound = drug.linkedTargets?.count || targets.length;
    const diseasesFound = drug.linkedDiseases?.count || diseases.length;

    // Compute a real association score based on target and disease coverage
    const score = Math.min(
      ((targetsFound > 0 ? 0.4 : 0) + (diseasesFound > 3 ? 0.3 : diseasesFound > 0 ? 0.15 : 0) + (mechanisms.length > 0 ? 0.3 : 0)),
      1.0
    );

    console.log(`[TargetAgent] Open Targets: ${chemblId} → ${targetsFound} targets, ${diseasesFound} diseases, ${mechanisms.length} mechanisms`);

    return {
      targetData: {
        chemblId,
        drugName: drug.name,
        drugType: drug.drugType,
        maxPhase: drug.maximumClinicalTrialPhase,
        hasBeenWithdrawn: drug.hasBeenWithdrawn || false,
        withdrawnNotice: drug.withdrawnNotice || null,
        score,
        targetsFound,
        diseasesFound,
        targets,
        diseases,
        mechanisms,
        source: 'Open Targets Platform',
      }
    };
  } catch (err: any) {
    console.error('[TargetAgent] Open Targets API failed:', err.message);
    return { targetData: { score: null, targetsFound: 0, source: 'Open Targets', targets: [], diseases: [], mechanisms: [] } };
  }
}



// Patent Agent
async function fetchPatentData(state: typeof GraphState.State) {
  const cid = state.pubchemData?.cid;
  if (!cid) return { patentData: [] };
  try {
    const res = await axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Patents`, { timeout: 10000 });
    const ids: string[] = [];
    const urls: string[] = [];
    
    function extract(node: any) {
      if (node?.Value?.StringWithMarkup) {
        for (const item of node.Value.StringWithMarkup) {
          if (item?.String && item?.Markup?.[0]?.URL) {
            ids.push(item.String);
            urls.push(item.Markup[0].URL);
          }
        }
      }
      for (const sec of node?.Section || []) extract(sec);
      for (const info of node?.Information || []) extract(info);
    }
    
    if (res.data?.Record) extract(res.data.Record);
    
    const patents = [];
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].startsWith('US') || ids[i].startsWith('EP') || ids[i].startsWith('WO')) {
            patents.push({ id: ids[i], title: `Patent ${ids[i]}`, url: urls[i], year: 2023, assignee: 'Unknown' });
        }
    }
    // De-duplicate array
    const dedupedInfoString = patents.filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);
    return { patentData: dedupedInfoString.slice(0, 5) };
  } catch (e: any) {
    console.error('[PatentAgent] API failed:', e.message);
    return { patentData: null };
  }
}

      // --- Fallback Key Helper ---
      function getGroqKeys(): string[] {
        const keysStr = process.env.GROQ_API_KEYS_SYNTHESIS || process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '';
        let keys = keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);

        for (let i = keys.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [keys[i], keys[j]] = [keys[j], keys[i]];
        }

        return keys;
      }

      // LLM Synthesis Agent (Groq — llama-3.3-70b)
      async function synthesizeAndEvaluate(state: typeof GraphState.State) {

        const keys = getGroqKeys();
        const pc = state.pubchemData;
        const sm = state.similarMolecules || [];
        const td = state.targetData || {};

        const pharmaContext = pc?.exists ? [
          `Formula: ${pc.molecular_formula}, MW: ${pc.molecular_weight} g/mol`,
          pc.mechanism_of_action ? `MOA: ${pc.mechanism_of_action?.substring(0, 300)}` : null,
          pc.associated_diseases?.length ? `Associated diseases: ${pc.associated_diseases.slice(0, 6).join(', ')}` : null,
        ].filter(Boolean).join('\n') : 'Not in PubChem';

        const targetContext = td.targets?.length
          ? `Open Targets: ${td.targetsFound} targets (${td.targets.slice(0, 5).map((t: any) => t.symbol || t.name).join(', ')}), ${td.diseasesFound} linked diseases (${td.diseases?.slice(0, 5).map((d: any) => d.name).join(', ')}), Mechanisms: ${td.mechanisms?.slice(0, 3).map((m: any) => m.description).join('; ')}`
          : 'No Open Targets data';

        const analogContext = sm.length
          ? sm.map(a => `• ${a.name} (${a.formula}): ${a.repurposing_insight}`).join('\n')
          : 'None found';

        // EXTRACT EMPIRICAL SIGNALS FOR THE MATH FORMULA
        const molLower = state.molecule.toLowerCase();
        const originalIndication = state.pubchemData?.approved_use || '';
        
        function isReformulationNotRepurposing(newIndication: string, origIndication: string): boolean {
          const routeKeywords = ['cream', 'lotion', 'ointment', 'topical', 'injection', 'oral', 'tablet', 'gel'];
          const newLower = newIndication.toLowerCase();
          const origLower = origIndication.toLowerCase();
          if (routeKeywords.some(kw => newLower.includes(kw) && !origLower.includes(kw))) return true;
          return false;
        }

        let rep_approvals = 0;
        const knownIndications = state.regulatoryData?.all_indications || [];
        
        for (const ind of knownIndications) {
          if (originalIndication && ind.toLowerCase().includes(originalIndication.toLowerCase())) continue;
          if (originalIndication && isReformulationNotRepurposing(ind, originalIndication)) continue;
          rep_approvals++;
        }
        
        // If we couldn't parse original indication well, and we have multiple, assume at least 1 is original
        if (!originalIndication && rep_approvals > 0) rep_approvals--;

        // Determine if clinical trials were primarily failed
        const terminatedCount = (state.clinicalData || []).filter((t: any) => t.status === 'TERMINATED' || t.status === 'WITHDRAWN' || t.status === 'SUSPENDED').length;
        const totalCount = state.clinicalData?.length || 1;
        const repurposing_trials_failed = (terminatedCount / totalCount) > 0.3; // If over 30% of trials are terminated

        const max_icd_distance = rep_approvals > 0 ? 8 : 2; 
        const original_trial_ratio = 0.5; // Default heuristic if we can't NLP classify all trials
        const max_repurposing_phase = rep_approvals > 0 ? 'PHASE4' : 'PHASE2';

        const signals = {
          repurposed_fda_approvals: rep_approvals,
          has_orphan_designation: state.regulatoryData?.has_orphan_designation || false,
          has_breakthrough_designation: state.regulatoryData?.has_breakthrough_designation || false,
          max_icd_distance,
          original_trial_ratio,
          max_repurposing_phase,
          repurposing_trials_failed,
          max_association_score: state.targetData?.score || 0.6,
          beneficial_faers_hit: state.regulatoryData?.beneficial_faers_hit || false,
          secondary_endpoint_hit: false,
          total_pubmed_papers: state.total_pubmed_papers || 0
        };

        const phoenixMath = computePhoenixScore(signals);

        console.log('[Phoenix Framework] Computed Math:', JSON.stringify({ molecule: state.molecule, papers: signals.total_pubmed_papers, approved_rep: signals.repurposed_fda_approvals, guard: phoenixMath.bias_guard_applied, mathScore: phoenixMath.phoenix_score }));

        const prompt = `You are an expert Clinical Scientist and Drug Repurposing Analyst.
Evaluate the DRUG REPURPOSING potential of "${state.molecule}".

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

Output a JSON object with exactly seven keys.

You are a pharmaceutical scoring engine. Compute the Phoenix Score strictly using this weighted formula. Never deviate from it.
PHOENIX SCORE = (R×0.30) + (D×0.25) + (C×0.25) + (M×0.10) + (S×0.10)

R — REGULATORY VALIDATION (0-10)
Count ONLY FDA/EMA approvals for DIFFERENT indications from the original approved use.
  ≥2 distinct repurposed FDA approvals     -> 10.0
  1 repurposed FDA approval                -> 8.5
  Orphan drug designation (new indication) -> 7.0
  Breakthrough therapy (new indication)    -> 7.5
  No repurposed regulatory approval        -> 1.0
CRITICAL: Do NOT count the original indication approval.

D — INDICATION DISTANCE (0-10)
Measure ICD-10 chapter distance between ORIGINAL indication and the REPURPOSED indication.
  Same ICD-10 chapter                      -> 2.0
  1-2 chapters apart                       -> 5.0
  3-5 chapters apart                       -> 7.5
  6+ chapters apart                        -> 10.0

C — CLINICAL EVIDENCE QUALITY (0-10)
Score ONLY trials for the REPURPOSED indication. Ignore all original indication trials.
  Phase 4 / post-market (repurposed use)   -> 10.0
  Phase 3 completed positive (repurposed)  -> 9.0
  Phase 3 ongoing (repurposed)             -> 7.5
  Phase 2 completed positive (repurposed)  -> 6.0
  Phase 1 only (repurposed)                -> 3.0
  Case reports / observational only        -> 1.5
  No repurposing trials at all             -> 0.0
PENALTY: If >90% of all trials are for original indication, subtract 2.0 from C.
PENALTY: Phase 3 failed (e.g. hydroxychloroquine COVID) -> C = 0.5. Multiple failures -> C = 0.0.

M — MECHANISM TRANSFERABILITY (0-10)
  Strong mechanistic explanation published -> 9.0
  Plausible mechanism, some evidence       -> 6.0
  Theoretical only, no experimental        -> 3.0
  No mechanistic link identified           -> 1.0

S — SERENDIPITY SIGNAL (0-10)
  Discovered as clinical side effect       -> 9.0
  Observed in secondary trial endpoint     -> 7.0
  Hypothesis-driven from the start         -> 3.0
  Unknown / no signal                      -> 1.0

ANTI-BIAS GUARD & ABSOLUTE RULES
1. If PubMed papers > 10,000 AND repurposed FDA approvals = 0 -> Cap total score at 4.0.
2. If FDA-approved for ≥2 distinct indications -> Never let total score fall below 6.0.
3. If repurposing trials are majority failed phase 3 -> Cap total score at 3.5.
4. If drug has 0 repurposed FDA approvals -> Never score above 6.5 total regardless of trial count.
=== Empirical Data ===
PubChem: ${pharmaContext}
Open Targets: ${targetContext}
Clinical Trials (${state.clinicalData?.length || 0} studies): ${JSON.stringify(state.clinicalData?.slice(0, 5))}
Literature: ${state.literatureData?.length || 0} papers (Total PubMed corpus: ${state.total_pubmed_papers})
Regulatory: ${state.regulatoryData?.all_indications?.length || 0} distinct labels found.
Analogs: ${analogContext}

IMPORTANT: Calculate the viabilityScore (0-10) objectively based solely on the scientific and clinical likelihood of success. Be rigorous! Do not default to 8.X. If trials are all phase 1/observational, score <= 4.0. If trials have high failure rates, score <= 3.0.

The deterministic Phoenix Score algorithm has already computed the historical repurposing footprint:
- Phoenix Score: ${phoenixMath.phoenix_score}/10
- Component Breakdown: ${JSON.stringify(phoenixMath.breakdown)}

Output a JSON object with exactly 4 keys explaining the data:
1. viabilityScore (0.0-10.0: Scientific viability, MUST NOT blindly copy Phoenix Score! Generate independently)
2. analysisReport (string: 3 paragraphs explaining potential, pharmacology, and risks)
3. top_opportunities (array of 2-3 strings: best repurposing opportunities)
4. top_risks (array of 2-3 strings: key barriers to repurposing)`;

  try {
    let resultData: any = null;
    let lastError = null;

    for (const key of keys) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You only respond with perfectly valid JSON. No text outside the JSON object.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          },
          { headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, validateStatus: () => true, timeout: 15000 }
        );

        if (response.status === 429 || response.status === 401) {
          console.warn(`[SynthesisAgent] Key failed with status ${response.status}, trying next...`);
          continue;
        }

        if (response.status !== 200) {
          console.warn(`[SynthesisAgent] Non-200 status ${response.status}, trying next key...`);
          continue;
        }

        const content = response.data.choices[0].message.content
          .replace(/```json/g, '').replace(/```/g, '').trim();
        resultData = JSON.parse(content);
        break;
      } catch (e) {
        lastError = e;
        console.warn(`[SynthesisAgent] Request error: ${(e as Error).message}. Trying next key...`);
        continue; // Try next key — Groq cloud supports multi-key retry
      }
    }

    if (!resultData) {
      console.error('[JudgeAgent] All Groq keys failed:', lastError);
      return {
        viabilityScore: 0.0,
        analysisReport: 'Error synthesizing data. All API keys failed.',
        top_opportunities: ['Error in AI generation'],
        top_risks:         ['Error in AI generation'],
        phoenix_score: phoenixMath.phoenix_score,
        phoenix_breakdown: phoenixMath.breakdown,
        phoenix_explanation: `R=${phoenixMath.breakdown.regulatory}, D=${phoenixMath.breakdown.indication_distance}, C=${phoenixMath.breakdown.clinical}, M=${phoenixMath.breakdown.mechanism}, S=${phoenixMath.breakdown.serendipity}`
      };
    }

    return {
      viabilityScore:    resultData.viabilityScore || 0.0,
      analysisReport:    resultData.analysisReport,
      top_opportunities: resultData.top_opportunities || ['No opportunities identified.'],
      top_risks:         resultData.top_risks         || ['No risks identified.'],
      phoenix_score:     phoenixMath.phoenix_score,
      phoenix_breakdown: phoenixMath.breakdown,
      phoenix_explanation: `Deterministic formula output: R=${phoenixMath.breakdown.regulatory}, D=${phoenixMath.breakdown.indication_distance}, C=${phoenixMath.breakdown.clinical}, M=${phoenixMath.breakdown.mechanism}, S=${phoenixMath.breakdown.serendipity}`
    };
  } catch (error) {
    console.error('[JudgeAgent] Error:', error);
    return {
      viabilityScore: 0.0,
      analysisReport: 'Error synthesizing data.',
      top_opportunities: [],
      top_risks:         [],
      phoenix_score: phoenixMath.phoenix_score,
      phoenix_breakdown: phoenixMath.breakdown,
      phoenix_explanation: 'Error'
    };
  }
}

function computePhoenixScore(signals: any) {
  let R = 1.0;
  if (signals.repurposed_fda_approvals >= 2) R = 10.0;
  else if (signals.repurposed_fda_approvals === 1) R = 8.5;
  else if (signals.has_orphan_designation) R = 7.0;
  else if (signals.has_breakthrough_designation) R = 7.5;

  const dist = signals.max_icd_distance; 
  const biasPenalty = signals.original_trial_ratio > 0.9 ? 0.75 : 1.0;
  const D = dist * biasPenalty;

  const phaseMap: Record<string, number> = { 'PHASE4': 10.0, 'PHASE3': 9.0, 'PHASE2': 6.0, 'PHASE1': 3.0, 'N/A': 0.0 };
  let C = phaseMap[signals.max_repurposing_phase] ?? 0.0;
  if (signals.repurposing_trials_failed) C = Math.min(C, 0.5);
  if (signals.original_trial_ratio > 0.9) C = Math.max(0, C - 2.0);

  const M = (signals.max_association_score ?? 0) * 10;

  let S = 1.0;
  if (signals.beneficial_faers_hit) S = 9.0;
  else if (signals.secondary_endpoint_hit) S = 7.0;

  let score = (R * 0.30) + (D * 0.25) + (C * 0.25) + (M * 0.10) + (S * 0.10);

  let bias_guard_applied = false;
  if (signals.total_pubmed_papers > 10000 && signals.repurposed_fda_approvals === 0) {
    score = Math.min(score, 4.0);
    bias_guard_applied = true;
  }
  
  if (signals.repurposed_fda_approvals >= 1) score = Math.max(score, 6.0);
  
  if (signals.repurposing_trials_failed && signals.repurposed_fda_approvals === 0) score = Math.min(score, 3.5);

  return {
    phoenix_score: Math.round(Math.min(score, 10.0) * 10) / 10,
    breakdown: { regulatory: R, indication_distance: D, clinical: C, mechanism: M, serendipity: S },
    bias_guard_applied
  };
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
  .addNode('fetchPatent',    fetchPatentData)
  .addNode('synthesize',     synthesizeAndEvaluate)

  // PubChem → SimilarMolecules (sequential: needs CID)
  .addEdge(START,          'fetchPubChem')
  .addEdge('fetchPubChem', 'fetchSimilar')
  .addEdge('fetchPubChem', 'fetchPatent')
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
  .addEdge('fetchPatent',    'synthesize')

  .addEdge('synthesize', END);

export const multiAgentPipeline = workflow.compile();

export async function runPipeline(molecule: string) {
  const result = await multiAgentPipeline.invoke({
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
    phoenix_score:    0,
    phoenix_breakdown:{},
    phoenix_explanation: ''
  });

  return result;
}
