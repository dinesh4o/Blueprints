import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from 'lucide-react';
import {
  getSimilarityNeighbors,
  getSubstructureNeighbors,
  getSuperstructureNeighbors,
  get3DSimilarityNeighbors,
  aggregateNeighbors,
  selectMolecularTwin,
  MolecularTwin,
  CombinedNeighbor
} from "@/lib/pubchem";

export function MolecularTwinReportCard({ cid }: { cid: number }) {
  const [twin, setTwin] = useState<MolecularTwin | null>(null);
  const [others, setOthers] = useState<CombinedNeighbor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTwin() {
      if (!cid) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [sim2d, sub, superstruct, sim3d] = await Promise.all([
          getSimilarityNeighbors(cid),
          getSubstructureNeighbors(cid),
          getSuperstructureNeighbors(cid),
          get3DSimilarityNeighbors(cid)
        ]);

        const combined = aggregateNeighbors(sim2d, sub, superstruct, sim3d);
        const bestTwin = selectMolecularTwin(combined, cid);
        setTwin(bestTwin);
        
        const other3d = combined.filter(c => 
          c.cid !== cid && 
          c.relationTypes.includes("similarity3d") && 
          (!bestTwin || c.cid !== bestTwin.cid)
        ).slice(0, 5);
        setOthers(other3d);
        
      } catch (err) {
        console.error("Failed to fetch Molecular Twin", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTwin();
  }, [cid]);

  if (loading) {
    return (
      <Card className="border-[#27272a] bg-[#121214] flex min-h-[160px] items-center justify-center">
        <Loader2 className="animate-spin text-zinc-500 w-6 h-6" />
      </Card>
    );
  }

  if (!twin) {
    return (
      <Card className="border-[#27272a] bg-[#121214]">
        <CardContent className="pt-6">
          <p className="text-center text-zinc-500 text-sm italic">No 3D molecular twin found for this CID.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#27272a] bg-[#121214] relative overflow-hidden flex flex-col h-full">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <CardHeader className="pb-2">
        <CardTitle className="text-[15px] flex items-center justify-between text-zinc-100">
          <div className="flex items-center gap-2">
            Molecular Twin
            <Badge variant="default" className="text-[10px] uppercase tracking-wide bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700">
              {twin.twinLabel}
            </Badge>
          </div>
        </CardTitle>
        <p className="text-zinc-500 text-xs">Top 3D-similar structural alternative</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-zinc-100">
            CID: <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${twin.cid}`} target="_blank" rel="noreferrer" className="hover:underline">{twin.cid}</a>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1.5 border-l-2 pl-3 border-zinc-700 italic opacity-90 text-sm text-zinc-400 leading-relaxed max-w-[95%]">
          {twin.rationale}
        </div>

        <div className="flex flex-wrap gap-2 mt-auto pt-2">
          {twin.relationTypes.includes("similarity3d") && (
            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-400">3D Similar</Badge>
          )}
          {twin.relationTypes.includes("similarity") && (
            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-400">2D Similar</Badge>
          )}
          {twin.relationTypes.includes("substructure") && (
            <Badge variant="outline" className="text-[10px] border-zinc-800 text-zinc-400">Shared Core</Badge>
          )}
        </div>
        
        {others.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">Other 3D-Similar Molecules</p>
            <div className="flex flex-wrap gap-2">
              {others.map(o => (
                <a 
                  key={o.cid} 
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${o.cid}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors"
                >
                  CID: {o.cid}
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
