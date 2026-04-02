export type NeighborType = "similarity" | "substructure" | "superstructure" | "similarity3d";

export type NeighborRecord = {
  cid: number;
  relationType: NeighborType;
  score?: number | null;
  sourceCid: number;
};

export type MolecularTwin = {
  cid: number;
  relationTypes: NeighborType[];
  similarityScore2D?: number | null;
  similarityScore3D?: number | null;
  structuralEvidenceScore: number;
  twinLabel: "Strong Twin" | "Functional Twin" | "Core-Preserved Twin" | "Multi-Evidence Twin";
  explanationTags: string[];
  rationale: string;
} | null;

export type CombinedNeighbor = {
  cid: number;
  relationTypes: NeighborType[];
  similarityScore2D: number | null;
  similarityScore3D: number | null;
  substructure: boolean;
  superstructure: boolean;
  structuralEvidenceScore: number;
};

const BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

export async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      if (response.status === 404) return response; // Not found might be expected
      // PubChem rate-limits aggressively; use longer backoff
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

export async function getCompoundSdf2D(cid: number): Promise<string | null> {
  const url = `${BASE_URL}/compound/cid/${cid}/record/SDF`;
  const res = await fetchWithRetry(url);
  if (!res.ok) return null;
  return res.text();
}

export async function getCompoundSdf3D(cid: number): Promise<string | null> {
  const url = `${BASE_URL}/compound/cid/${cid}/record/SDF?record_type=3d`;
  const res = await fetchWithRetry(url);
  if (!res.ok) return null;
  return res.text();
}

export async function getSimilarityNeighbors(cid: number): Promise<NeighborRecord[]> {
  try {
    const url = `${BASE_URL}/compound/fastsimilarity_2d/cid/${cid}/cids/JSON`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text) return [];
    const data = JSON.parse(text);
    const cids: number[] = data?.IdentifierList?.CID || [];
    return cids.map(c => ({
      cid: c,
      relationType: "similarity",
      sourceCid: cid,
    }));
  } catch (err) {
    console.error("error fetching similarity", err);
    return [];
  }
}

export async function getSubstructureNeighbors(cid: number): Promise<NeighborRecord[]> {
  try {
    const url = `${BASE_URL}/compound/fastsubstructure/cid/${cid}/cids/JSON`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text) return [];
    const data = JSON.parse(text);
    const cids: number[] = data?.IdentifierList?.CID || [];
    return cids.map(c => ({
      cid: c,
      relationType: "substructure",
      sourceCid: cid,
    }));
  } catch (err) {
    console.error("error fetching substructure", err);
    return [];
  }
}

export async function getSuperstructureNeighbors(cid: number): Promise<NeighborRecord[]> {
  try {
    const url = `${BASE_URL}/compound/fastsuperstructure/cid/${cid}/cids/JSON`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text) return [];
    const data = JSON.parse(text);
    const cids: number[] = data?.IdentifierList?.CID || [];
    return cids.map(c => ({
      cid: c,
      relationType: "superstructure",
      sourceCid: cid,
    }));
  } catch (err) {
    console.error("error fetching superstructure", err);
    return [];
  }
}

export async function get3DSimilarityNeighbors(cid: number): Promise<NeighborRecord[]> {
  try {
    const url = `${BASE_URL}/compound/fastsimilarity_3d/cid/${cid}/cids/JSON`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text) return [];
    const data = JSON.parse(text);
    const cids: number[] = data?.IdentifierList?.CID || [];
    return cids.map(c => ({
      cid: c,
      relationType: "similarity3d",
      sourceCid: cid,
    }));
  } catch (err) {
    console.error("error fetching 3d similarity", err);
    return [];
  }
}

export function aggregateNeighbors(
  similarity: NeighborRecord[],
  substructure: NeighborRecord[],
  superstructure: NeighborRecord[],
  sim3d: NeighborRecord[]
): CombinedNeighbor[] {
  const map = new Map<number, CombinedNeighbor>();

  const ensureEntry = (cid: number) => {
    if (!map.has(cid)) {
      map.set(cid, {
        cid,
        relationTypes: [],
        similarityScore2D: null,
        similarityScore3D: null,
        substructure: false,
        superstructure: false,
        structuralEvidenceScore: 0,
      });
    }
    return map.get(cid)!;
  };

  similarity.forEach(n => {
    const entry = ensureEntry(n.cid);
    if (!entry.relationTypes.includes("similarity")) entry.relationTypes.push("similarity");
    if (n.score) entry.similarityScore2D = n.score;
  });

  substructure.forEach(n => {
    const entry = ensureEntry(n.cid);
    if (!entry.relationTypes.includes("substructure")) entry.relationTypes.push("substructure");
    entry.substructure = true;
  });

  superstructure.forEach(n => {
    const entry = ensureEntry(n.cid);
    if (!entry.relationTypes.includes("superstructure")) entry.relationTypes.push("superstructure");
    entry.superstructure = true;
  });

  sim3d.forEach(n => {
    const entry = ensureEntry(n.cid);
    if (!entry.relationTypes.includes("similarity3d")) entry.relationTypes.push("similarity3d");
    if (n.score) entry.similarityScore3D = n.score;
  });

  // Calculate score
  const results = Array.from(map.values());
  results.forEach(r => {
    let score = 0;
    if (r.relationTypes.includes("similarity3d")) score += 3;
    if (r.relationTypes.includes("similarity")) score += 2;
    if (r.relationTypes.includes("substructure")) score += 2;
    if (r.relationTypes.includes("superstructure")) score += 2;
    r.structuralEvidenceScore = score;
  });

  // exclude the self record if present
  return results;
}

export function selectMolecularTwin(candidates: CombinedNeighbor[], sourceCid: number): MolecularTwin {
  const filtered = candidates.filter(c => c.relationTypes.includes("similarity3d") && c.cid !== sourceCid);
  
  if (filtered.length === 0) return null;

  filtered.sort((a, b) => {
    if (a.structuralEvidenceScore !== b.structuralEvidenceScore) {
      return b.structuralEvidenceScore - a.structuralEvidenceScore;
    }
    // tie-breakers based on relation types
    const a2d = a.relationTypes.includes("similarity");
    const b2d = b.relationTypes.includes("similarity");
    if (a2d !== b2d) return a2d ? -1 : 1;
    
    const aSub = a.relationTypes.includes("substructure");
    const bSub = b.relationTypes.includes("substructure");
    if (aSub !== bSub) return aSub ? -1 : 1;

    return 0; // Or compare by raw scores if available
  });

  const best = filtered[0];

  let twinLabel: MolecularTwin["twinLabel"] = "Functional Twin";
  let rationale = "This candidate is supported by 3D similarity.";
  const has2D = best.relationTypes.includes("similarity");
  const hasSub = best.relationTypes.includes("substructure");

  if (has2D && hasSub) {
    twinLabel = "Multi-Evidence Twin";
    rationale = "This twin shares spatial similarity and structural core evidence, suggesting a potentially transferable pharmacophore supported by multiple structural metrics.";
  } else if (has2D) {
    twinLabel = "Strong Twin";
    rationale = "This candidate is supported by both 3D and 2D similarity, making it a strong alternative for repurposing review.";
  } else if (hasSub) {
    twinLabel = "Core-Preserved Twin";
    rationale = "This twin shares spatial similarity and structural core evidence, suggesting a potentially transferable pharmacophore.";
  } else {
    rationale = "This molecule is the strongest 3D structural twin and may preserve functionally relevant spatial features.";
  }

  return {
    cid: best.cid,
    relationTypes: best.relationTypes,
    similarityScore2D: best.similarityScore2D,
    similarityScore3D: best.similarityScore3D,
    structuralEvidenceScore: best.structuralEvidenceScore,
    twinLabel,
    explanationTags: best.relationTypes,
    rationale
  };
}

export async function getCompoundNames(cids: number[]): Promise<Record<number, string>> {
  if (!cids || cids.length === 0) return {};
  try {
    const subset = cids.slice(0, 100); // chunk limit roughly
    const url = `${BASE_URL}/compound/cid/${subset.join(',')}/property/Title/JSON`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return {};
    const text = await res.text();
    if (!text) return {};
    const data = JSON.parse(text);
    const properties = data?.PropertyTable?.Properties || [];
    const nameMap: Record<number, string> = {};
    properties.forEach((p: any) => {
      if (p.CID && p.Title) {
        nameMap[p.CID] = p.Title;
      }
    });
    return nameMap;
  } catch (err) {
    console.error('error fetching compound names', err);
    return {};
  }
}


export async function getCompoundSmiles(cids: number[]): Promise<Record<number, string>> {
  if (!cids || cids.length === 0) return {};
  try {
    const subset = cids.slice(0, 100);
    const url = `${BASE_URL}/compound/cid/${subset.join(',')}/property/CanonicalSMILES/JSON`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return {};
    const text = await res.text();
    if (!text) return {};
    const data = JSON.parse(text);
    const properties = data?.PropertyTable?.Properties || [];
    const smileMap: Record<number, string> = {};
    properties.forEach((p: any) => {
      if (p.CID && p.CanonicalSMILES) {
        smileMap[p.CID] = p.CanonicalSMILES;
      }
    });
    return smileMap;
  } catch (err) {
    console.error('error fetching compound smiles', err);
    return {};
  }
}

