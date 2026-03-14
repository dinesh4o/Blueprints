import React, { useEffect, useState } from 'react';

const ELEMENT_SYMBOLS: Record<number, string> = {
  1: 'H', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 15: 'P', 16: 'S', 17: 'Cl',
  35: 'Br', 53: 'I', 11: 'Na', 19: 'K', 20: 'Ca', 26: 'Fe', 29: 'Cu', 30: 'Zn'
};

const ATOM_RADII: Record<string, number> = {
  'H': 8, 'C': 14, 'N': 12, 'O': 11, 'F': 10, 'P': 14, 'S': 14, 'Cl': 13, 'Br': 14, 'I': 15,
};

const DEFAULT_ATOMS = [
  { x:170, y:110, l:'C', r:14 },
  { x:230, y:80,  l:'N', r:12 },
  { x:260, y:130, l:'O', r:11 },
  { x:110, y:80,  l:'N', r:12 },
  { x:120, y:150, l:'C', r:10 },
  { x:210, y:165, l:'H', r:8  },
  { x:140, y:45,  l:'C', r:10 },
  { x:190, y:40,  l:'N', r:11 },
];
const DEFAULT_BONDS = [[0,1],[0,3],[0,4],[1,2],[1,7],[3,6],[4,5],[6,7]];

export default function AnimatedMolecule({ molecule, size = 220 }: { molecule?: string, size?: number }) {
  const sc = size / 220;
  
  const [atoms, setAtoms] = useState(DEFAULT_ATOMS);
  const [bonds, setBonds] = useState(DEFAULT_BONDS);

  useEffect(() => {
    if (!molecule) return;
    
    // Ignore obviously fake molecules to skip unneeded fetch
    if (molecule.length < 2) return;

    fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(molecule)}/JSON`)
      .then(res => res.json())
      .then(data => {
        const compound = data?.PC_Compounds?.[0];
        if (!compound) return;

        const pAtoms = compound.atoms?.element || [];
        // Only use the first conformer for coordinates
        const pCoords = compound.coords?.[0]?.conformers?.[0] || { x: [], y: [] };
        
        let pBondsX = compound.bonds?.aid1 || [];
        let pBondsY = compound.bonds?.aid2 || [];

        // Determine bounding box
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < pAtoms.length; i++) {
          const x = pCoords.x[i] || 0;
          const y = pCoords.y[i] || 0;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }

        // Avoid division by zero
        const spanX = Math.max(maxX - minX, 0.1);
        const spanY = Math.max(maxY - minY, 0.1);
        
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        // Fit within 260 x 140 area (to give padding inside the 340x220 viewbox)
        const scale = Math.min(260 / spanX, 140 / spanY);

        const newAtoms = pAtoms.map((elementNum: number, i: number) => {
          const symbol = ELEMENT_SYMBOLS[elementNum] || 'X';
          const r = ATOM_RADII[symbol] || 12;
          
          const ox = pCoords.x[i] || 0;
          const oy = pCoords.y[i] || 0;
          
          // SVG y-axis is inverted relative to standard cartesian
          const x = (ox - cx) * scale + 170;
          const y = -(oy - cy) * scale + 110;

          return { x, y, l: symbol, r };
        });

        // bonds use 1-based indexing in PubChem
        const newBonds: number[][] = [];
        for (let i = 0; i < pBondsX.length; i++) {
          newBonds.push([pBondsX[i] - 1, pBondsY[i] - 1]);
        }

        setAtoms(newAtoms);
        setBonds(newBonds);
      })
      .catch(err => {
        console.error("Failed to fetch molecule structure:", err);
        setAtoms([]);
        setBonds([]);
      });
  }, [molecule]);

  const getColor = (label: string) => {
    switch (label) {
      case 'C': return 'rgba(72,72,108, 0.85)';
      case 'N': return 'rgba(40,110,200, 0.85)';
      case 'O': return 'rgba(200,60,60, 0.85)';
      case 'H': return 'rgba(90,160,90, 0.60)';
      default: return 'rgba(100,100,100, 0.85)';
    }
  };

  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 340 220" 
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {atoms.map((a, i) => (
          <filter key={`glow-${i}`} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={a.r * 0.55} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        ))}
      </defs>

      {/* Group to hold all bonds and atoms so they share the same coordinate space */}
      <g>
        {bonds.map(([a1, a2], i) => {
          const atom1 = atoms[a1];
          const atom2 = atoms[a2];
          return (
            <line
              key={`bond-${i}`}
              x1={atom1.x}
              y1={atom1.y}
              x2={atom2.x}
              y2={atom2.y}
              stroke="rgba(0,212,170,0.22)"
              strokeWidth={3 * sc + 2}
            >
               {/* Note: We could animate the lines too, but usually just animating the atoms or relying on the overall visual is okay, to do full constraints we'd use SVG markers or JS. We'll leave the lines static as the user algorithm implies atom transforms */}
            </line>
          );
        })}

        {atoms.map((a, i) => {
          const color = getColor(a.l);
          const dx = Math.sin(i * 1.3) * 3 * sc * 2;
          const dy = Math.cos(i * 0.9) * 3 * sc * 2;
          const dur = `${2 + i * 0.28}s`;

          return (
            <g key={`atom-${i}`} transform={`translate(${a.x}, ${a.y})`}>
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`0,0; ${dx},${dy}; 0,0`}
                dur={dur}
                calcMode="spline"
                keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                repeatCount="indefinite"
                additive="sum"
              />
              
              {/* Glow circle */}
              <circle
                r={a.r * 1.6}
                fill={color}
                opacity={0.18}
                filter={`url(#glow-${i})`}
              />
              
              {/* Solid circle */}
              <circle
                r={a.r}
                fill={color}
                stroke={color.replace(/[\d.]+\)$/, '1)')}
                strokeWidth={1.5}
              />
              
              {/* Text label */}
              <text
                x="0"
                y={(a.r / 2) - 1}
                textAnchor="middle"
                fill="white"
                fontFamily="'DM Mono', ui-monospace, SFMono-Regular, monospace"
                fontSize={a.r * 1.1}
                fontWeight="500"
                style={{ pointerEvents: 'none' }}
              >
                {a.l}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
