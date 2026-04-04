import { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window { $3Dmol: any; }
}

interface Props {
  cid: number | null;
  height?: number | string;
}

export default function AnimatedMolecule3D({ cid, height = 260 }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const initViewer = async () => {
    if (!cid || !viewerRef.current) return;
    setStatus('loading');

    try {
      // Dynamically load 3Dmol.js from CDN (only once)
      await new Promise<void>((resolve, reject) => {
        if (window.$3Dmol) { resolve(); return; }
        const script = document.createElement('script');
        script.src = 'https://3dmol.org/build/3Dmol-min.js';
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('3Dmol CDN failed'));
        document.head.appendChild(script);
      });

      // Fetch 3D SDF conformer from PubChem
      const sdfRes = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`
      );
      if (!sdfRes.ok) throw new Error('No 3D conformer');
      const sdfData = await sdfRes.text();
      if (!viewerRef.current) return;

      // Destroy old viewer if exists
      if (viewerInstanceRef.current) {
        try { viewerInstanceRef.current.clear(); } catch {}
      }

      const viewer = window.$3Dmol.createViewer(viewerRef.current, {
        backgroundColor: 'transparent',
        antialias: true,
      });
      viewerInstanceRef.current = viewer;

      viewer.addModel(sdfData, 'sdf');
      viewer.setStyle({}, {
        stick: { colorscheme: 'Jmol', radius: 0.12 },
        sphere: { colorscheme: 'Jmol', radius: 0.28 },
      });
      viewer.zoomTo();
      viewer.spin('y', 0.6);
      viewer.render();
      setStatus('ready');
    } catch (e) {
      console.error('[3D Viewer]', e);
      setStatus('error');
    }
  };

  useEffect(() => {
    initViewer();
    return () => {
      if (viewerInstanceRef.current) {
        try { viewerInstanceRef.current.clear(); } catch {}
        viewerInstanceRef.current = null;
      }
    };
  }, [cid]);

  return (
    <div className="relative w-full" style={{ height }}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
          <Loader2 size={22} className="animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Fetching 3D conformer from PubChem...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
          {cid ? (
            <img
              src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=300x300`}
              alt="2D Structure"
              className="max-h-[70%] object-contain rounded-lg opacity-90"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <p className="text-xs text-muted-foreground text-center px-4">
              No 3D conformer available in PubChem for this compound.
            </p>
          )}
          <Button size="sm" variant="outline" onClick={initViewer} className="gap-1 text-xs h-7">
            <RotateCcw size={11} /> Retry 3D
          </Button>
        </div>
      )}

      <div
        ref={viewerRef}
        className="absolute inset-0"
        style={{
          opacity: status === 'ready' ? 1 : 0,
          pointerEvents: status === 'ready' ? 'auto' : 'none',
        }}
      />

      {status === 'ready' && (
        <div className="absolute bottom-6 w-full text-center z-10 pointer-events-none">
          <span className="text-[10px] bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-zinc-400 border border-zinc-800/50 whitespace-nowrap inline-block">
            Drag to rotate · Scroll to zoom
          </span>
        </div>
      )}
    </div>
  );
}
