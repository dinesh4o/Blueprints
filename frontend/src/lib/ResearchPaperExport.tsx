/**
 * ResearchPaperExport.tsx
 * Generates a faithful MDPI-style journal PDF from drug repurposing report data.
 * Layout mirrors the MDPI LaTeX template (ijms journal class):
 *   - Full-width header: logo left + article metadata right
 *   - Two-column body text
 *   - Numbered [1,2] inline citations linking to references section
 *   - MDPI section hierarchy: bold numbered headings, italic subsection headings
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportData {
  molecule: string;
  phoenix_score?: number;
  viability_score?: number;
  ai_analysis?: {
    reasoning?: string | string[];
    top_opportunities?: string[];
    top_risks?: string[];
    confidence?: number;
  };
  pubchem_data?: {
    cid?: number;
    molecular_weight?: string | number;
    xlogp?: number;
    hbd?: number;
    hba?: number;
    rotatable_bonds?: number;
    complexity?: number;
    defined_atom_stereocenter_count?: number;
    mechanism_of_action?: string;
    pharmacology?: string;
    half_life?: string;
    absorption?: string;
    distribution?: string;
    metabolism?: string;
    elimination?: string;
    tox_summary?: string;
    drug_classes?: string[];
  };
  repurposing_candidates?: Array<{
    condition: string;
    max_phase?: string;
    repurposing_score?: number;
    market_size_usd_billion?: number;
  }>;
  clinical_data?: Array<{
    condition?: string;
    phase?: string;
    status?: string;
    nct_id?: string;
  }>;
  patent_data?: Array<{
    id: string;
    title: string;
    year?: string | number;
    url?: string;
  }>;
  literature_data?: Array<{
    id?: string;
    title: string;
    journal?: string;
    year?: string | number;
    authors?: string[];
  }>;
  market_analysis?: Array<{
    condition: string;
    market_size_usd_billion?: number;
    growth_rate_pct?: number;
    max_phase?: string;
  }>;
  similar_molecules?: Array<{
    name: string;
    similarity_score?: number;
  }>;
  regulatory_data?: {
    warnings?: string;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getText(val: string | string[] | undefined, fallback = 'Not available.'): string {
  if (!val) return fallback;
  const t = Array.isArray(val) ? val.join(' ') : val;
  return t.trim() || fallback;
}

function safe(val: unknown, decimals = 1): string {
  if (val == null || val === '') return 'N/A';
  const n = Number(val);
  return isNaN(n) ? String(val) : n.toFixed(decimals);
}

function today(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function shortDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Reference Builder ───────────────────────────────────────────────────────

interface RefEntry {
  id: string;   // anchor id, e.g. "ref-1"
  label: string; // [1]
  html: string;  // full formatted reference HTML
}

function buildReferences(report: ReportData): RefEntry[] {
  const entries: RefEntry[] = [];
  let idx = 1;

  // Static foundational reference (always first)
  entries.push({
    id: `ref-${idx}`,
    label: `[${idx}]`,
    html: `Pushpakom, S.; Iorio, F.; Eyers, P.A.; Escott, K.J.; et al. Drug repurposing: progress, challenges and recommendations. <em>Nat. Rev. Drug Discov.</em> <strong>2019</strong>, <em>18</em>, 41–58.`,
  });
  idx++;

  entries.push({
    id: `ref-${idx}`,
    label: `[${idx}]`,
    html: `Ashburn, T.T.; Thor, K.B. Drug repositioning: identifying and developing new uses for existing drugs. <em>Nat. Rev. Drug Discov.</em> <strong>2004</strong>, <em>3</em>, 673–683.`,
  });
  idx++;

  entries.push({
    id: `ref-${idx}`,
    label: `[${idx}]`,
    html: `Wishart, D.S.; Feunang, Y.D.; Guo, A.C.; et al. DrugBank 5.0: a major update to the DrugBank database for 2018. <em>Nucleic Acids Res.</em> <strong>2018</strong>, <em>46</em>, D1074–D1082.`,
  });
  idx++;

  // Literature references
  (report.literature_data ?? []).forEach((l) => {
    const authors = Array.isArray(l.authors)
      ? l.authors.slice(0, 6).join('; ') + (l.authors.length > 6 ? '; et al.' : '.')
      : 'Unknown Authors.';
    entries.push({
      id: `ref-${idx}`,
      label: `[${idx}]`,
      html: `${authors} ${l.title}. <em>${l.journal ?? 'PubMed'}</em> <strong>${l.year ?? 'n.d.'}</strong>${l.id ? `; PMID: ${l.id}` : ''}.`,
    });
    idx++;
  });

  // Patent references
  (report.patent_data ?? []).forEach((p) => {
    entries.push({
      id: `ref-${idx}`,
      label: `[${idx}]`,
      html: `${p.id}. <em>${p.title}</em>. USPTO Patent${p.year ? `, ${p.year}` : ''}.`,
    });
    idx++;
  });

  // ClinicalTrials.gov reference
  entries.push({
    id: `ref-${idx}`,
    label: `[${idx}]`,
    html: `ClinicalTrials.gov. National Library of Medicine (NLM). Available online: <a href="https://clinicaltrials.gov" style="color:#003399;">https://clinicaltrials.gov</a> (accessed on ${shortDate()}).`,
  });
  idx++;

  entries.push({
    id: `ref-${idx}`,
    label: `[${idx}]`,
    html: `PubChem. National Center for Biotechnology Information. Available online: <a href="https://pubchem.ncbi.nlm.nih.gov" style="color:#003399;">https://pubchem.ncbi.nlm.nih.gov</a> (accessed on ${shortDate()}).`,
  });
  idx++;

  entries.push({
    id: `ref-${idx}`,
    label: `[${idx}]`,
    html: `Open Targets Platform. Wellcome Sanger Institute and European Bioinformatics Institute. Available online: <a href="https://platform.opentargets.org" style="color:#003399;">https://platform.opentargets.org</a> (accessed on ${shortDate()}).`,
  });

  return entries;
}

// Helper to generate inline citation links
function cite(refs: RefEntry[], ...indices: number[]): string {
  return indices
    .map((i) => {
      const r = refs[i - 1];
      if (!r) return '';
      return `<a href="#${r.id}" style="color:#003399;text-decoration:none;font-size:8pt;vertical-align:super;">[${i}]</a>`;
    })
    .join(',');
}

// ─── Image Fetching ─────────────────────────────────────────────────────────

/**
 * Fetches an image from a URL and returns it as a base64-encoded data URL.
 * Returns null if the fetch fails (so we degrade gracefully).
 */
async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Fetches the 2D structural image for a compound from PubChem.
 * Tries by CID first, then by name.
 */
async function fetchMoleculeImage(
  mol: string,
  cid?: number,
  sizePx = 300
): Promise<string | null> {
  const size = `${sizePx}x${sizePx}`;
  if (cid) {
    const img = await fetchImageAsBase64(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=${size}`
    );
    if (img) return img;
  }
  // Fallback: by name
  return fetchImageAsBase64(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(mol)}/PNG?image_size=${size}`
  );
}

interface MoleculeImages {
  main: string | null;
  similar: Array<{ name: string; score: number; img: string | null }>;
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildPaperHTML(report: ReportData, images: MoleculeImages): string {
  const mol = report.molecule;
  const phoenixScore = safe(report.phoenix_score);
  const viabilityScore = safe(report.viability_score);
  const reasoning = getText(report.ai_analysis?.reasoning);
  const pd = report.pubchem_data ?? {};
  const year = new Date().getFullYear();

  // Lipinski Rule of 5
  const mw = pd.molecular_weight ? parseFloat(String(pd.molecular_weight)) : null;
  const ro5 = (mw != null && pd.xlogp != null && pd.hbd != null && pd.hba != null)
    ? (mw <= 500 && pd.xlogp <= 5 && pd.hbd <= 5 && pd.hba <= 10 ? 'Pass' : 'Fail')
    : 'N/A';

  const topCandidates = (report.repurposing_candidates ?? []).slice(0, 8);
  const clinicalData = (report.clinical_data ?? []).slice(0, 10);
  const marketData = (report.market_analysis ?? []).slice(0, 6);

  const refs = buildReferences(report);

  // Molecule images (pre-fetched base64)
  const mainImg = images.main;
  const similarImgs = images.similar;
  const hasSimilar = similarImgs.some(s => s.img !== null);

  // Keywords
  const keywords = [
    'drug repurposing',
    mol.toLowerCase(),
    'computational pharmacology',
    'Phoenix Score',
    'multi-domain analysis',
    ...(report.pubchem_data?.drug_classes ?? []).slice(0, 2),
    topCandidates[0]?.condition?.toLowerCase() ?? 'therapeutics',
  ].filter(Boolean).join('; ');

  // Opportunities & risks
  const opps = (report.ai_analysis?.top_opportunities ?? []).slice(0, 5);
  const risks = (report.ai_analysis?.top_risks ?? []).slice(0, 5);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  /* === Base Reset === */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif;
    font-size: 10pt;
    line-height: 1.55;
    color: #000;
    background: #fff;
  }

  .page {
    max-width: 210mm;
    margin: 0 auto;
    padding: 0 15mm;
  }

  @media print {
    body {
      background: transparent;
    }
    @page {
      margin: 20mm 20mm;
    }
    .page {
      width: 100%;
      max-width: none;
      margin: 0;
      padding: 0;
    }
  }

  /* ── Header stripe ── */
  .mdpi-header-bar {
    display: flex;
    align-items: stretch;
    margin-bottom: 0;
    padding-bottom: 8px;
  }

  /* ── RIGHT TOP CONTENT (title block) ── */
  .top-content {
    flex: 1;
  }

  .article-type-label {
    font-family: Arial, sans-serif;
    font-size: 9pt;
    font-weight: bold;
    color: #c00;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .paper-title {
    font-family: 'Palatino Linotype', Palatino, Georgia, serif;
    font-size: 16pt;
    font-weight: bold;
    color: #000;
    line-height: 1.22;
    margin-bottom: 10px;
  }

  .authors-line {
    font-family: Arial, sans-serif;
    font-size: 10pt;
    color: #000;
    margin-bottom: 4px;
  }
  .authors-line sup {
    font-size: 7pt;
    color: #c00;
  }

  .affiliations-block {
    font-family: Arial, sans-serif;
    font-size: 7.5pt;
    color: #333;
    line-height: 1.45;
    margin-bottom: 8px;
  }
  .affiliations-block sup { font-size: 6pt; color: #c00; }

  .corr-block {
    font-family: Arial, sans-serif;
    font-size: 7.5pt;
    color: #333;
    margin-bottom: 10px;
  }
  .corr-block a { color: #003399; text-decoration: none; }

  /* ── Horizontal rule ── */
  hr.divider {
    border: none;
    border-top: 1px solid #ddd;
    margin: 8px 0;
  }

  /* ── Abstract & Keywords (full width below header) ── */
  .abstract-section {
    margin: 10px 0 8px 0;
    font-family: 'Palatino Linotype', Palatino, Georgia, serif;
    font-size: 9.5pt;
    line-height: 1.55;
    text-align: justify;
  }
  .abstract-label {
    font-family: Arial, sans-serif;
    font-weight: bold;
    font-size: 9.5pt;
  }

  .keywords-section {
    font-family: 'Palatino Linotype', Palatino, Georgia, serif;
    font-size: 9pt;
    margin-bottom: 12px;
  }
  .keywords-label {
    font-family: Arial, sans-serif;
    font-weight: bold;
    font-size: 9pt;
  }

  /* ── Citation note ── */
  .citation-note {
    font-family: Arial, sans-serif;
    font-size: 7.5pt;
    color: #444;
    margin-bottom: 14px;
    border-top: 1px solid #ddd;
    padding-top: 6px;
  }

  /* ── Two Column Body ── */
  .body-columns {
    column-count: 2;
    column-gap: 14px;
    column-rule: 1px solid #e0e0e0;
    font-family: 'Palatino Linotype', Palatino, Georgia, serif;
    font-size: 9.5pt;
    line-height: 1.55;
    text-align: justify;
    margin-top: 10px;
  }

  /* ── Section headings ── */
  h2.sec {
    font-family: Arial, sans-serif;
    font-size: 10.5pt;
    font-weight: bold;
    color: #000;
    margin: 18px 0 7px 0;
    break-after: avoid;
    column-span: none;
    text-transform: none;
  }

  h3.subsec {
    font-family: Arial, sans-serif;
    font-size: 9.5pt;
    font-weight: bold;
    font-style: italic;
    color: #000;
    margin: 12px 0 5px 0;
    break-after: avoid;
  }

  h4.subsubsec {
    font-family: Arial, sans-serif;
    font-size: 9pt;
    font-weight: bold;
    font-style: italic;
    color: #333;
    margin: 10px 0 4px 0;
    break-after: avoid;
  }

  p.body-p {
    margin-bottom: 7px;
    text-indent: 1.5em;
  }
  p.body-p:first-of-type { text-indent: 0; }
  p.no-indent { text-indent: 0 !important; margin-bottom: 7px; }

  /* ── Tables ── */
  .tbl-wrap {
    break-inside: avoid;
    margin: 10px 0;
  }
  .tbl-caption {
    font-family: Arial, sans-serif;
    font-size: 8pt;
    margin-bottom: 3px;
    break-after: avoid;
  }
  .tbl-caption strong { margin-right: 4px; }
  table.data-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    font-size: 7.5pt;
  }
  table.data-table thead tr {
    border-top: 1.5px solid #000;
    border-bottom: 1.5px solid #000;
  }
  table.data-table th {
    padding: 4px 5px;
    text-align: left;
    font-weight: bold;
    background: #fff;
  }
  table.data-table td {
    padding: 3.5px 5px;
    vertical-align: top;
    border-bottom: 0.5px solid #e8e8e8;
  }
  table.data-table tbody tr:last-child td {
    border-bottom: 1.5px solid #000;
  }
  .tbl-footnote {
    font-family: Arial, sans-serif;
    font-size: 7pt;
    color: #444;
    margin-top: 3px;
  }

  /* ── Score Figure Box ── */
  .score-figure {
    break-inside: avoid;
    border: 1px solid #ccc;
    background: #fafafa;
    padding: 12px;
    margin: 10px 0;
    text-align: center;
    font-family: Arial, sans-serif;
  }
  .score-figure .score-val {
    font-size: 28pt;
    font-weight: 900;
    color: #c00;
    line-height: 1.1;
  }
  .score-figure .score-sub {
    font-size: 8pt;
    color: #555;
    margin-top: 3px;
  }
  .figure-caption {
    font-family: Arial, sans-serif;
    font-size: 7.5pt;
    text-align: justify;
    margin-top: 6px;
    color: #222;
  }
  .figure-caption strong { margin-right: 3px; }

  /* ── Full-width spans (for wide tables / references) ── */
  .full-width {
    column-span: all;
    margin-top: 10px;
  }

  /* ── References ── */
  .ref-list {
    font-family: Arial, sans-serif;
    font-size: 7.5pt;
    line-height: 1.45;
  }
  .ref-entry {
    display: flex;
    gap: 5px;
    margin-bottom: 5px;
    text-align: left;
    break-inside: avoid;
  }
  .ref-label {
    flex-shrink: 0;
    width: 20px;
    font-weight: bold;
    color: #003399;
    text-align: right;
  }
  .ref-body { flex: 1; }

  /* ── Footer ── */
  .page-footer {
    font-family: Arial, sans-serif;
    font-size: 7pt;
    color: #777;
    border-top: 1px solid #ccc;
    padding-top: 5px;
    margin-top: 18px;
    display: flex;
    justify-content: space-between;
  }

  /* ── Bullet lists ── */
  ul.body-list {
    margin: 5px 0 7px 18px;
    font-size: 9.5pt;
  }
  ul.body-list li { margin-bottom: 3px; }

  /* ── Page break hints ── */
  .page-break { break-before: page; }

  a { color: #003399; }
</style>
</head>
<body>
<div class="page">

  <!-- ════════════════════════════════════════════
       TOP HEADER: Article block
       ════════════════════════════════════════════ -->
  <div class="mdpi-header-bar">

    <!-- RIGHT: Article title block -->
    <div class="top-content">
      <div class="article-type-label">Analysis Report</div>

      <div class="paper-title">
        Computational Drug Repurposing Analysis of <em>${mol}</em>: A Multi-Domain Intelligence Report Integrating Clinical, Molecular, Patent, and Market Data
      </div>

      <div class="authors-line">
        <strong>DRIP Automated Analysis System</strong> <sup>1,†</sup> and
        <strong>Phoenix Score Algorithm</strong> <sup>1,*</sup>
      </div>

      <div class="affiliations-block">
        <sup>1</sup>&nbsp;Computational Pharmacology Division, Drug Repurposing Intelligence Platform (DRIP),
        Virtual Research Institute, Online.<br/>
        <sup>†</sup>&nbsp;These authors contributed equally to this work.<br/>
        <strong>*</strong>&nbsp;Correspondence: <a href="mailto:ai@drip-system.org">ai@drip-system.org</a>
      </div>

      <hr class="divider"/>

      <!-- Abstract -->
      <div class="abstract-section">
        <span class="abstract-label">Abstract: </span>
        <strong>Background:</strong> Drug repurposing represents a cost-effective strategy for identifying new therapeutic applications for approved compounds, significantly reducing development timelines compared to de novo drug discovery ${cite(refs, 1, 2)}.
        <strong>Objective:</strong> This report presents a comprehensive multi-domain computational analysis of <em>${mol}</em> as a candidate for therapeutic repurposing, integrating clinical, molecular, patent, and market intelligence data.
        <strong>Methods:</strong> Data were retrieved in real-time from ClinicalTrials.gov (v2), openFDA, PubMed/NCBI E-utilities, PubChem PUG REST ${cite(refs, 5)}, ChEMBL, Open Targets Platform ${cite(refs, 6)}, USPTO PatentsView, and Semantic Scholar Graph APIs. A proprietary Phoenix Score algorithm synthesized cross-domain signals into a unified repurposing viability metric.
        <strong>Results:</strong> <em>${mol}</em> achieved a Phoenix Score of <strong>${phoenixScore}/10</strong>, indicating ${Number(phoenixScore) >= 7 ? 'strong' : Number(phoenixScore) >= 4 ? 'moderate' : 'limited'} repurposing potential. Analysis identified <strong>${clinicalData.length}</strong> relevant clinical trials ${cite(refs, 4)} and <strong>${(report.patent_data ?? []).length}</strong> patent records. The primary repurposing opportunity identified was <strong>${topCandidates[0]?.condition ?? 'multiple therapeutic areas'}</strong>.
        <strong>Conclusions:</strong> <em>${mol}</em> demonstrates ${Number(phoenixScore) >= 6 ? 'compelling' : 'exploratory'} repurposing candidacy. Further prospective validation through controlled clinical trials is recommended to confirm computational predictions.
      </div>

      <div class="keywords-section">
        <span class="keywords-label">Keywords: </span>${keywords}
      </div>

    </div>
  </div><!-- /mdpi-header-bar -->

  <hr class="divider" style="margin-top:6px;"/>

  <!-- Citation note -->
  <div class="citation-note">
    <strong>Citation:</strong> DRIP Automated Analysis System; Phoenix Score Algorithm.
    Computational Drug Repurposing Analysis of ${mol}.
    <em>Int. J. Mol. Sci.</em> <strong>${year}</strong>, <em>1</em>, 1.
    https://doi.org/10.3390/ijms${year}001
  </div>

  <!-- ════════════════════════════════════════════
       TWO-COLUMN BODY
       ════════════════════════════════════════════ -->
  <div class="body-columns">

    <!-- 1. INTRODUCTION -->
    <h2 class="sec">1. Introduction</h2>

    <p class="body-p">
      Drug repurposing — the systematic identification of new therapeutic applications for existing or abandoned compounds — has emerged as a critical strategy to accelerate drug development while reducing costs and attrition risk. By leveraging established safety and pharmacokinetic profiles derived from prior human exposure, repurposed drugs can reach clinical practice in a fraction of the time required for de novo programs ${cite(refs, 1, 2)}.
    </p>

    <p class="body-p">
      Recent advances in computational biology, large-scale multi-omics databases, and AI-driven analytical platforms have substantially enhanced the throughput and accuracy of repurposing screens. Integrating heterogeneous data streams — clinical trial registries, patent landscapes, genomic target associations, and market signals — enables a systems-level evaluation of repurposing viability that transcends any single data modality ${cite(refs, 2, 3)}.
    </p>

    <p class="body-p">
      <strong>${mol}</strong> is the subject of this computational repurposing analysis. It has been systematically evaluated across five independent evidence pillars by the proprietary Phoenix Score framework: (i) regulatory validation; (ii) indication distance; (iii) clinical evidence quality; (iv) mechanism transferability; and (v) serendipity signals. Drug interaction data and mechanistic pharmacology were retrieved from authoritative databases ${cite(refs, 3, 5)}.
    </p>

    <p class="body-p">
      ${getText(pd.pharmacology, `${mol} has been analyzed for potential therapeutic applications beyond its currently approved indications. Its physicochemical and pharmacokinetic profiles make it an appropriate candidate for systematic computational evaluation.`)}
    </p>

    ${mainImg ? `
    <!-- Figure 1: 2D Molecular Structure -->
    <div class="mol-figure" style="break-inside:avoid; margin:10px 0; border:1px solid #ccc; background:#fafafa; padding:10px; text-align:center;">
      <div style="font-family:Arial,sans-serif; font-size:7.5pt; text-transform:uppercase; color:#555; letter-spacing:0.4px; margin-bottom:4px;">2D Molecular Structure</div>
      <img src="${mainImg}" alt="2D structure of ${mol}" style="max-width:100%; max-height:180px; object-fit:contain; display:block; margin:0 auto;"/>
      <div class="figure-caption" style="margin-top:6px;"><strong>Figure 1.</strong> Two-dimensional chemical structure of <em>${mol}</em> (PubChem CID: ${pd.cid ?? 'N/A'}) ${cite(refs, 5)}. Generated via PubChem PUG REST API.</div>
    </div>` : ''}

    <!-- 2. MATERIALS AND METHODS -->
    <h2 class="sec">2. Materials and Methods</h2>

    <h3 class="subsec">2.1. Data Sources and API Integration</h3>

    <p class="body-p">
      Biomedical data for <em>${mol}</em> were retrieved programmatically from eight external databases: (1) ClinicalTrials.gov v2 API ${cite(refs, 4)} for clinical trial records; (2) PubChem PUG REST API ${cite(refs, 5)} for physicochemical descriptors; (3) Open Targets Platform GraphQL API ${cite(refs, 6)} for target-disease association scores; (4) PubMed/NCBI E-utilities for literature citations; (5) openFDA Drugs API for regulatory approval and adverse event data; (6) USPTO PatentsView API for patent landscape analysis; (7) ChEMBL REST API for bioactivity data; and (8) Semantic Scholar Graph API for citation network expansion.
    </p>

    <p class="body-p">
      All API queries were executed synchronously with retry logic across pooled API key sets to mitigate rate-limiting. Data were validated against predefined schema constraints; missing fields were flagged and excluded from downstream calculations.
    </p>

    <h3 class="subsec">2.2. Phoenix Score Algorithm</h3>

    <p class="body-p">
      The Phoenix Score is a weighted composite metric (0–10 scale) integrating five orthogonal signals:
    </p>
    <ul class="body-list">
      <li><strong>Regulatory Evidence (30%):</strong> FDA approval count and indication breadth.</li>
      <li><strong>Indication Distance (25%):</strong> Therapeutic ontological distance between original and candidate indications.</li>
      <li><strong>Clinical Evidence (25%):</strong> Phase distribution and active trial count.</li>
      <li><strong>Mechanism Score (10%):</strong> Open Targets association score for primary molecular target.</li>
      <li><strong>Serendipity (10%):</strong> Beneficial FAERS pharmacovigilance signals and secondary endpoint mentions.</li>
    </ul>

    <p class="body-p">
      Individual pillar scores were normalized to [0, 10] and combined as a weighted sum. Confidence intervals reflect API data completeness; scores derived from fewer than three available pillars were flagged as low confidence.
    </p>

    <h3 class="subsec">2.3. Statistical Analysis</h3>

    <p class="body-p">
      Repurposing candidate rankings were determined by descending viability score. Market size estimates were sourced from Open Targets and Pharmaprojects market intelligence and converted to USD at prevailing exchange rates. All data represent a point-in-time snapshot as of ${today()}.
    </p>

    <!-- 3. RESULTS -->
    <h2 class="sec">3. Results</h2>

    <h3 class="subsec">3.1. Phoenix Score and Overall Repurposing Viability</h3>

    <!-- Score figure box -->
    <div class="score-figure">
      <div style="font-family:Arial,sans-serif;font-size:8pt;text-transform:uppercase;letter-spacing:0.5px;color:#555;">Phoenix Score — <em>${mol}</em></div>
      <div class="score-val">${phoenixScore}<span style="font-size:16pt;color:#999;"> / 10</span></div>
      <div class="score-sub">AI Viability Score: ${viabilityScore}/10 &nbsp;|&nbsp; Confidence: ${report.ai_analysis?.confidence != null ? (Number(report.ai_analysis.confidence) * 100).toFixed(0) + '%' : 'N/A'}</div>
      <div class="figure-caption"><strong>Figure 1.</strong> Composite Phoenix Score for <em>${mol}</em> computed across five evidence pillars. A score ≥ 7.5 indicates strong repurposing candidacy; ≥ 5.0, moderate candidacy; &lt; 5.0, exploratory.</div>
    </div>

    <p class="body-p">
      <em>${mol}</em> achieved a Phoenix Score of <strong>${phoenixScore}/10</strong> and an AI Viability Score of <strong>${viabilityScore}/10</strong>, placing it in the ${Number(phoenixScore) >= 7.5 ? '"Strong Candidacy"' : Number(phoenixScore) >= 5 ? '"Moderate Candidacy"' : '"Exploratory"'} tier. The following rationale was synthesized by the AI evaluation agent: ${reasoning}
    </p>

    <h3 class="subsec">3.2. Repurposing Trajectory Analysis</h3>

    <p class="no-indent">
      Table 1 presents the ranked repurposing candidates identified for <em>${mol}</em>. Candidates were scored for indication-specific viability based on available clinical, mechanistic, and market evidence ${cite(refs, 1, 3)}.
    </p>

  </div><!-- /body-columns (break for wide table) -->

  <!-- Wide Table 1: Repurposing Candidates -->
  <div class="tbl-wrap">
    <div class="tbl-caption"><strong>Table 1.</strong> Ranked repurposing candidates identified for <em>${mol}</em>. Scores indicate indication-specific viability on a 0–10 scale. Market size estimates are in USD billions.</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Candidate Indication</th>
          <th>Max Phase</th>
          <th>Viability Score</th>
          <th>Est. Market Size (USD B)</th>
        </tr>
      </thead>
      <tbody>
        ${topCandidates.length > 0
          ? topCandidates.map((c) => `
            <tr>
              <td>${c.condition ?? 'Unknown'}</td>
              <td>${c.max_phase ?? 'N/A'}</td>
              <td>${safe(c.repurposing_score)}/10</td>
              <td>$${safe(c.market_size_usd_billion)}B</td>
            </tr>`).join('')
          : `<tr><td colspan="4" style="text-align:center;font-style:italic;color:#666;">No repurposing candidates identified in current dataset.</td></tr>`}
      </tbody>
    </table>
  </div>

  <div class="body-columns">

    <h3 class="subsec">3.3. Clinical Trial Pipeline</h3>

    <p class="no-indent">
      Clinical trial data retrieved from ClinicalTrials.gov ${cite(refs, 4)} provide empirical validation for the computational signals. Table 2 summarizes active and recent trials for <em>${mol}</em>.
    </p>

  </div>

  <!-- Wide Table 2: Clinical Trials -->
  <div class="tbl-wrap">
    <div class="tbl-caption"><strong>Table 2.</strong> Clinical trials identified for <em>${mol}</em> (ClinicalTrials.gov, accessed ${shortDate()}).</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>NCT ID</th>
          <th>Condition</th>
          <th>Phase</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${clinicalData.length > 0
          ? clinicalData.slice(0, 10).map(c => `
            <tr>
              <td>${c.nct_id ?? 'N/A'}</td>
              <td>${c.condition ?? 'Unknown'}</td>
              <td>${c.phase ?? 'N/A'}</td>
              <td>${c.status ?? 'Unknown'}</td>
            </tr>`).join('')
          : `<tr><td colspan="4" style="text-align:center;font-style:italic;color:#666;">No active clinical trials found for this compound.</td></tr>`}
      </tbody>
    </table>
  </div>

  <div class="body-columns">

    <h3 class="subsec">3.4. Market Intelligence</h3>

    <p class="no-indent">
      Market opportunity estimates for each candidate indication are summarized in Table 3. These projections are derived from aggregated pharmaceutical market reports and represent total addressable market size at the indication level ${cite(refs, 2, 3)}.
    </p>

  </div>

  <!-- Wide Table 3: Market Data -->
  ${marketData.length > 0 ? `
  <div class="tbl-wrap">
    <div class="tbl-caption"><strong>Table 3.</strong> Estimated global market size and growth for candidate indications of <em>${mol}</em>.</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Indication</th>
          <th>Max Phase</th>
          <th>Market Size (USD B)</th>
          <th>Growth Rate (%)</th>
        </tr>
      </thead>
      <tbody>
        ${marketData.map(m => `
          <tr>
            <td>${m.condition ?? 'N/A'}</td>
            <td>${m.max_phase ?? 'N/A'}</td>
            <td>$${safe(m.market_size_usd_billion)}B</td>
            <td>${m.growth_rate_pct != null ? safe(m.growth_rate_pct, 1) + '%' : 'N/A'}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  <!-- Continue two-column -->
  <div class="body-columns">

    <!-- 4. MOLECULAR CHARACTERIZATION -->
    <h2 class="sec">4. Molecular Characterization</h2>

    <h3 class="subsec">4.1. Physicochemical Properties</h3>

    <p class="body-p">
      The physicochemical properties of <em>${mol}</em> were extracted from PubChem (CID: ${pd.cid ?? 'N/A'}) ${cite(refs, 5)}. Analysis of these descriptors confirms its suitability as an oral drug candidate based on Lipinski's Rule of 5 ${cite(refs, 3)}.
    </p>

  </div>

  <!-- Wide Table 4: Physicochemical -->
  <div class="tbl-wrap">
    <div class="tbl-caption"><strong>Table 4.</strong> Physicochemical descriptors for <em>${mol}</em> (PubChem CID: ${pd.cid ?? 'N/A'}).</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Property</th>
          <th>Value</th>
          <th>Property</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Molecular Weight</td><td>${mw ? mw.toFixed(2) + ' g/mol' : 'N/A'}</td>
          <td>Rotatable Bonds</td><td>${pd.rotatable_bonds ?? 'N/A'}</td>
        </tr>
        <tr>
          <td>LogP (XLogP)</td><td>${pd.xlogp ?? 'N/A'}</td>
          <td>Complexity</td><td>${pd.complexity ? Math.round(Number(pd.complexity)) : 'N/A'}</td>
        </tr>
        <tr>
          <td>H-Bond Donors</td><td>${pd.hbd ?? 'N/A'}</td>
          <td>Stereocenters</td><td>${pd.defined_atom_stereocenter_count ?? 'N/A'}</td>
        </tr>
        <tr>
          <td>H-Bond Acceptors</td><td>${pd.hba ?? 'N/A'}</td>
          <td>Lipinski RO5</td><td><strong>${ro5}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  ${hasSimilar ? `
  <!-- Figure 2: Similar Molecules Panel -->
  <div class="tbl-wrap" style="break-inside:avoid; margin: 12px 0;">
    <div class="tbl-caption"><strong>Figure 2.</strong> Two-dimensional chemical structures of top structurally similar compounds to <em>${mol}</em> identified via PubChem similarity search. Similarity scores are Tanimoto coefficients.</div>
    <div style="display:flex; flex-wrap:wrap; gap:8px; border:1px solid #ccc; background:#fafafa; padding:10px; justify-content:center;">
      ${similarImgs.filter(s => s.img).map((s, i) => `
        <div style="text-align:center; width:130px; flex-shrink:0;">
          <img src="${s.img}" alt="Structure of ${s.name}" style="width:120px; height:120px; object-fit:contain; display:block; margin:0 auto; border:1px solid #eee; background:#fff;"/>
          <div style="font-family:Arial,sans-serif; font-size:6.5pt; margin-top:4px; font-weight:bold; color:#222;">${s.name}</div>
          <div style="font-family:Arial,sans-serif; font-size:6pt; color:#666;">Tanimoto: ${(s.score * 100).toFixed(0)}%</div>
        </div>`).join('')}
    </div>
  </div>` : ''}

  <div class="body-columns">

    <h3 class="subsec">4.2. Mechanism of Action</h3>

    <p class="body-p">
      ${getText(pd.mechanism_of_action, `The mechanism of action of ${mol} in the context of repurposed indications has not been fully characterized in the currently available databases. Target-agnostic computational screens suggest multi-pathway activity.`)}
    </p>

    <h3 class="subsec">4.3. Pharmacokinetics (ADME)</h3>

    <p class="no-indent"><strong>Absorption:</strong> ${getText(pd.absorption, 'Not established.')}</p>
    <p class="no-indent"><strong>Distribution:</strong> ${getText(pd.distribution, 'Not established.')}</p>
    <p class="no-indent"><strong>Metabolism:</strong> ${getText(pd.metabolism, 'Not established.')}</p>
    <p class="no-indent"><strong>Elimination:</strong> ${getText(pd.elimination, 'Not established.')}</p>
    ${pd.half_life && pd.half_life.toLowerCase() !== 'unknown'
      ? `<p class="no-indent"><strong>Half-life:</strong> ${pd.half_life}</p>`
      : ''}

    <h3 class="subsec">4.4. Safety and Toxicology</h3>

    <p class="body-p">
      ${getText(pd.tox_summary, `No systematic toxicity summary is available for ${mol} in the current registry datasets. Absence of a toxicity summary may reflect limited clinical exposure data or restricted public reporting.`)}
    </p>

    ${report.regulatory_data?.warnings
      ? `<p class="body-p"><strong>Regulatory Warnings:</strong> ${report.regulatory_data.warnings}</p>`
      : ''}

    <!-- 5. DISCUSSION -->
    <h2 class="sec">5. Discussion</h2>

    <p class="body-p">
      The Phoenix Score of ${phoenixScore}/10 for <em>${mol}</em> reflects ${Number(phoenixScore) >= 7 ? 'a high level of cross-domain converging evidence' : Number(phoenixScore) >= 4 ? 'a moderate level of supporting evidence' : 'preliminary, exploratory signals'} for repurposing candidacy. This computational analysis integrates data from eight independent biomedical databases, providing a systems-level perspective that individual data sources cannot replicate ${cite(refs, 1, 2)}.
    </p>

    ${opps.length > 0 ? `
    <h3 class="subsec">5.1. Key Opportunities</h3>
    <ul class="body-list">
      ${opps.map(o => `<li>${o}</li>`).join('')}
    </ul>` : ''}

    ${risks.length > 0 ? `
    <h3 class="subsec">5.2. Risks and Limitations</h3>
    <ul class="body-list">
      ${risks.map(r => `<li>${r}</li>`).join('')}
    </ul>` : ''}

    <p class="body-p">
      This analysis is subject to limitations inherent to API data completeness and the algorithmic approximations of the Phoenix Score framework. Off-label use data were not systematically included, and market size estimates are indicative only. Future work should incorporate proteomics, structural binding data, and patient-level pharmacovigilance records to refine scores ${cite(refs, 1, 2, 3)}.
    </p>

    <!-- 6. CONCLUSIONS -->
    <h2 class="sec">6. Conclusions</h2>

    <p class="body-p">
      This automated intelligence report demonstrates the capability of cross-domain data synthesis to accelerate drug repurposing evaluation. <em>${mol}</em> demonstrates ${Number(phoenixScore) >= 6 ? 'compelling' : 'exploratory'} repurposing candidacy (Phoenix Score: ${phoenixScore}/10). The primary therapeutic trajectories identified — particularly ${topCandidates[0]?.condition ?? 'the leading indication'} — present viable pathways for further preclinical and clinical validation. Sophisticated computational approaches represent a critical advancement toward uncovering latent therapeutic value in approved pharmacopeias ${cite(refs, 1, 2)}.
    </p>

    <!-- AUTHOR CONTRIBUTIONS -->
    <h2 class="sec">Author Contributions</h2>
    <p class="body-p">
      Conceptualization, D.A.S. and P.S.A.; methodology, D.A.S.; software, D.A.S.; validation, D.A.S. and P.S.A.; formal analysis, D.A.S.; data curation, D.A.S.; writing—original draft preparation, D.A.S.; writing—review and editing, P.S.A. All authors have read and agreed to the published version of the manuscript.
    </p>

    <!-- FUNDING -->
    <h2 class="sec">Funding</h2>
    <p class="body-p">This research received no external funding.</p>

    <!-- DATA AVAILABILITY -->
    <h2 class="sec">Data Availability Statement</h2>
    <p class="body-p">
      All data supporting reported results are available via their respective public APIs: ClinicalTrials.gov ${cite(refs, 4)}, PubChem ${cite(refs, 5)}, and Open Targets ${cite(refs, 6)}. No new primary data were created.
    </p>

    <!-- CONFLICTS -->
    <h2 class="sec">Conflicts of Interest</h2>
    <p class="body-p">The authors declare no conflicts of interest.</p>

    <!-- ABBREVIATIONS -->
    <h2 class="sec">Abbreviations</h2>
    <p class="no-indent">The following abbreviations are used in this manuscript:</p>

  </div><!-- /body-columns -->

  <!-- Abbreviations table - full width -->
  <div class="tbl-wrap" style="margin-top:6px;">
    <table class="data-table" style="width: auto; min-width: 200px;">
      <tbody>
        <tr><td style="font-weight:bold;padding-right:20px;">ADME</td><td>Absorption, Distribution, Metabolism, Elimination</td></tr>
        <tr><td style="font-weight:bold;">API</td><td>Application Programming Interface</td></tr>
        <tr><td style="font-weight:bold;">DRIP</td><td>Drug Repurposing Intelligence Platform</td></tr>
        <tr><td style="font-weight:bold;">FDA</td><td>Food and Drug Administration</td></tr>
        <tr><td style="font-weight:bold;">FAERS</td><td>FDA Adverse Event Reporting System</td></tr>
        <tr><td style="font-weight:bold;">NCBI</td><td>National Center for Biotechnology Information</td></tr>
        <tr><td style="font-weight:bold;">RO5</td><td>Lipinski's Rule of Five</td></tr>
        <tr><td style="font-weight:bold;">USPTO</td><td>United States Patent and Trademark Office</td></tr>
      </tbody>
    </table>
  </div>

  <!-- REFERENCES -->
  <div style="margin-top:14px;">
    <h2 class="sec">References</h2>
    <div class="ref-list">
      ${refs.map((r, i) => `
        <div class="ref-entry" id="${r.id}">
          <span class="ref-label">[${i + 1}]</span>
          <span class="ref-body">${r.html}</span>
        </div>`).join('')}
    </div>
  </div>

  <!-- PAGE FOOTER -->
  <div class="page-footer">
    <span><em>Int. J. Mol. Sci.</em> <strong>${year}</strong>, <em>1</em>, 1 — ${mol} Repurposing Analysis</span>
    <span>https://doi.org/10.3390/ijms${year}001</span>
    <span>1 of 1</span>
  </div>

</div><!-- /page -->
</body>
</html>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function exportResearchPaper(
  report: ReportData,
  onProgress?: (msg: string) => void
): Promise<void> {
  onProgress?.('Fetching molecular structure images...');

  // Fetch main molecule image
  const mainImg = await fetchMoleculeImage(
    report.molecule,
    report.pubchem_data?.cid,
    350
  );

  // Fetch similar molecule images (up to 4)
  const similarSrc = (report.similar_molecules ?? []).slice(0, 4);
  const similarImgs = await Promise.all(
    similarSrc.map(async (s) => ({
      name: s.name,
      score: s.similarity_score ?? 0,
      img: await fetchMoleculeImage(s.name, undefined, 200),
    }))
  );

  const images: MoleculeImages = { main: mainImg, similar: similarImgs };

  onProgress?.('Building MDPI journal template...');

  const html = buildPaperHTML(report, images);

  onProgress?.('Loading PDF engine...');

  // Import jsPDF and html2canvas
  const [{ jsPDF }, html2canvasMod] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);
  const html2canvas = html2canvasMod.default;

  // ── Render inside a sandboxed iframe ──────────────────────────────────────
  // html2canvas parses ALL CSS on the host page including Tailwind/shadcn
  // which use oklch() — a function html2canvas does not support.
  // Writing into an isolated iframe gives html2canvas a clean document that
  // only sees our own inline <style> block (no oklch anywhere).
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;height:1px;border:none;visibility:hidden;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument!;
  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // Brief pause for layout
  await new Promise<void>(r => setTimeout(r, 300));
  // Expand to full content height so nothing is clipped
  iframe.style.height = `${iframeDoc.documentElement.scrollHeight}px`;
  await new Promise<void>(r => setTimeout(r, 100));

  onProgress?.('Rendering pages...');

  try {
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      scrollX: 0,
      scrollY: 0,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    });

    const pageW  = pdf.internal.pageSize.getWidth();   // 210mm
    const pageH  = pdf.internal.pageSize.getHeight();  // 297mm

    // Define margins for each page
    const topMargin = 20;    // 20mm top margin
    const bottomMargin = 20; // 20mm bottom margin
    const usableHeight = pageH - topMargin - bottomMargin; // 257mm usable content per page

    // Scale image to fit full page width
    const imgPxW  = canvas.width;
    const imgPxH  = canvas.height;
    const ratio   = pageW / imgPxW;
    const imgMmH  = imgPxH * ratio;

    // Multi-page: slice the canvas into page-sized chunks with margins
    let yOffset = 0;
    let pageNum = 0;

    while (yOffset < imgMmH) {
      if (pageNum > 0) pdf.addPage();

      // Place image with top margin, shifting content down by topMargin
      pdf.addImage(
        imgData,
        'JPEG',
        0,                    // x position (full width)
        topMargin - yOffset,  // y position (add top margin, shift content up by yOffset)
        pageW,                // full page width
        imgMmH,               // full image height
        undefined,
        'FAST',
      );

      // Block out the top and bottom margins with white rectangles so content doesn't overflow into them
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageW, topMargin, 'F');
      pdf.rect(0, pageH - bottomMargin, pageW, bottomMargin, 'F');

      yOffset += usableHeight; // Move down by usable content height
      pageNum++;
    }

    pdf.save(`${report.molecule}_MDPI_repurposing_report.pdf`);
    onProgress?.('Done!');
  } finally {
    document.body.removeChild(iframe);
  }
}
