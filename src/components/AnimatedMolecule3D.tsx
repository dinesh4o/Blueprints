import { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window { $3Dmol: any; }
}

interface Props {
  cid: number | null;
  height?: number;
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
          <p className="text-xs text-muted-foreground text-center px-4">
            No 3D conformer available in PubChem for this compound.
          </p>
          <Button size="sm" variant="outline" onClick={initViewer} className="gap-1 text-xs h-7">
            <RotateCcw size={11} /> Retry
          </Button>
        </div>
      )}

      <div
        ref={viewerRef}
        style={{
          width: '100%',
          height: '100%',
          visibility: status === 'ready' ? 'visible' : 'hidden',
          borderRadius: '0.75rem',
          overflow: 'hidden',
        }}
      />

      {status === 'ready' && (
        <div className="absolute bottom-2 right-2 z-10">
          <span className="text-[10px] bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded text-muted-foreground border border-border/50">
            Drag to rotate · Scroll to zoom
          </span>
        </div>
      )}
    </div>
  );
}
