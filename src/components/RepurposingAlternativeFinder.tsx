import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import AnimatedMolecule3D from "@/components/AnimatedMolecule3D";
import {
  getCompoundSdf2D,
  getCompoundSdf3D,
  getSimilarityNeighbors,
  getSubstructureNeighbors,
  getSuperstructureNeighbors,
  get3DSimilarityNeighbors,
  aggregateNeighbors,
  selectMolecularTwin,
  getCompoundNames,
  MolecularTwin,
  CombinedNeighbor
} from "@/lib/pubchem";

export function RepurposingAlternativeFinder({ initialCid, hideSearch }: { initialCid?: number, hideSearch?: boolean } = {}) {
  const [cid, setCid] = useState(initialCid ? initialCid.toString() : "");
  const [loading, setLoading] = useState(false);
  const [twin, setTwin] = useState<MolecularTwin | null>(null);
  const [alternatives, setAlternatives] = useState<CombinedNeighbor[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialCid) {
      handleSearch(initialCid.toString());
    }
  }, [initialCid]);

  const handleSearch = async (overrideCid?: string) => {
    const searchCid = overrideCid || cid;
    if (!searchCid || isNaN(Number(searchCid))) {
      setError("Please enter a valid numeric CID.");
      return;
    }

    setLoading(true);
    setError("");
    setTwin(null);
    setAlternatives([]);
    setSearched(true);

    try {
      const sourceCid = Number(searchCid);
      
      const [sim2d, sub, superstruct, sim3d] = await Promise.all([
        getSimilarityNeighbors(sourceCid),
        getSubstructureNeighbors(sourceCid),
        getSuperstructureNeighbors(sourceCid),
        get3DSimilarityNeighbors(sourceCid)
      ]);

      const combined = aggregateNeighbors(sim2d, sub, superstruct, sim3d);
      setAlternatives(combined);

      const bestTwin = selectMolecularTwin(combined, sourceCid);
      setTwin(bestTwin);

      // Fetch names for top ~8 candidates to render headers
      const topCids = combined
        .filter(a => a.cid !== sourceCid)
        .sort((a, b) => b.structuralEvidenceScore - a.structuralEvidenceScore)
        .slice(0, 8)
        .map(a => a.cid);
      
      if (bestTwin && !topCids.includes(bestTwin.cid)) {
         topCids.push(bestTwin.cid);
      }
      
      if (topCids.length > 0) {
        getCompoundNames(topCids).then(fetchedNames => {
           setNames(fetchedNames);
        }).catch(err => console.error("Could not fetch names", err));
      }

    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch data from PubChem. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!hideSearch && (
        <Card className="border-[#27272a] bg-[#121214]">
          <CardHeader>
            <CardTitle className="text-zinc-100">Repurposing Alternative Finder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="cid" className="text-zinc-400">Input Compound CID</Label>
                <Input 
                  id="cid" 
                  type="text" 
                  placeholder="e.g. 4091" 
                  value={cid} 
                  onChange={e => setCid(e.target.value)} 
                  className="bg-[#09090b] border-[#27272a] text-zinc-100"
                />
              </div>
              <Button onClick={() => handleSearch()} disabled={loading} className="bg-zinc-100 text-zinc-900 hover:bg-white">
                {loading ? "Searching..." : "Analyze"}
              </Button>
            </div>
            {error && <p className="text-rose-500 mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Molecular Twin Header Panel */}
      {searched && (
        <div className="bg-zinc-800/10 border border-zinc-800 rounded-lg p-5 mb-8">
          <h3 className="text-zinc-200 font-medium mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Why utilize Molecular Twins for Repurposing?
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            High-scoring molecular twins possess significantly overlapping pharmacophores (matching 3D conformation and 2D substructure signatures) with the target drug. This established structural synergy drastically reduces toxicity risk profiles and suggests shared receptor binding affinities. Leveraging these alternative compounds can bypass crowded patent landscapes or overcome saturated market competition while preserving therapeutic efficacy.
          </p>
        </div>
      )}

      {twin ? (
        <Card className="border-[#27272a] bg-[#121214] relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-zinc-100">
              Molecular Twin
              <Badge variant="default" className="ml-2 uppercase text-[10px] tracking-wide bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700">
                {twin.twinLabel}
              </Badge>
            </CardTitle>
            <p className="text-zinc-500 text-sm">Top 3D-similar structural alternative for repurposing review</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-lg font-semibold text-zinc-100 flex flex-col">
                <span className="text-2xl">{names[twin.cid] || `Compound ${twin.cid}`}</span>
                <span className="text-xs text-zinc-500 font-normal mt-1">CID: {twin.cid}</span>
              </div>
              <div className="flex gap-2">
                {twin.relationTypes.includes("similarity3d") && (
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400">3D Similar</Badge>
                )}
                {twin.relationTypes.includes("similarity") && (
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400">2D Similar</Badge>
                )}
                {twin.relationTypes.includes("substructure") && (
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400">Shared Core</Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm border-l-2 pl-4 italic opacity-90 border-zinc-700 text-zinc-400">
              {twin.rationale}
            </p>

            <div className="flex gap-3 pt-2">
              <Button size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-white" onClick={() => window.open(`https://pubchem.ncbi.nlm.nih.gov/compound/${twin.cid}`, "_blank")}>
                View on PubChem
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        searched && !loading && alternatives.length > 0 && (
          <Card className="border-[#27272a] bg-[#121214]">
            <CardContent className="pt-6">
              <p className="text-center text-zinc-500 italic">No 3D molecular twin found for this CID.</p>
            </CardContent>
          </Card>
        )
      )}

      {/* Ranked Alternatives Cards */}
      {alternatives.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-zinc-100 mb-4 px-2">Ranked Alternatives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {alternatives
              .filter(a => a.cid !== Number(cid || initialCid))
              .sort((a, b) => b.structuralEvidenceScore - a.structuralEvidenceScore)
              .slice(0, 8) // Showing 8 exactly as requested
              .map(alt => {
                const isTwin = twin?.cid === alt.cid;
                const moleculeName = names[alt.cid] || `Compound ${alt.cid}`;
                return (
                  <Card key={alt.cid} className={`border bg-[#121214] flex flex-col ${isTwin ? 'border-zinc-500' : 'border-[#27272a]'}`}>
                    <CardHeader className="pb-3 px-4 pt-4 border-b border-[#27272a] bg-[#09090b]">
                      <div className="flex justify-between items-start mb-1">
                        <a
                          href={`https://pubchem.ncbi.nlm.nih.gov/compound/${alt.cid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-100 hover:text-white hover:underline font-semibold leading-tight line-clamp-2 pr-2"
                        >
                          {moleculeName}
                        </a>
                        <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-300 flex-shrink-0">
                          Score: {alt.structuralEvidenceScore}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        CID: {alt.cid}
                      </div>
                      {isTwin && (
                        <div className="mt-1">
                          <Badge variant="default" className="bg-zinc-800 text-zinc-200 border-zinc-700 text-[10px] uppercase tracking-wider">Molecular Twin</Badge>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                      <div className="h-[200px] w-full bg-zinc-950/50 relative border-b border-[#27272a]">
                        <AnimatedMolecule3D cid={alt.cid} height={200} />
                      </div>
                      <div className="p-4 flex gap-2 flex-wrap bg-[#121214]">
                        {alt.relationTypes.includes("similarity3d") && (
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">3D Match</Badge>
                        )}
                        {alt.relationTypes.includes("similarity") && (
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">2D Match</Badge>
                        )}
                        {alt.relationTypes.includes("substructure") && (
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">Substructure</Badge>
                        )}
                        {alt.relationTypes.includes("superstructure") && (
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-[10px]">Superstructure</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
            })}
          </div>
        </div>
      )}

      {searched && !loading && alternatives.length === 0 && (
         <Card className="border-[#27272a] bg-[#121214]">
            <CardContent className="pt-6">
              <p className="text-center text-zinc-500 italic">No structural neighbors found for this CID.</p>
            </CardContent>
          </Card>
      )}

      {loading && (
        <Card className="border-[#27272a] bg-[#121214] flex min-h-[200px] items-center justify-center">
          <div className="flex items-center gap-2 text-zinc-500">
            <div className="animate-spin h-5 w-5 border-2 border-zinc-500 border-t-transparent rounded-full" />
            <span>Analyzing molecular structure and searching PubChem...</span>
          </div>
        </Card>
      )}

    </div>
  );
}
