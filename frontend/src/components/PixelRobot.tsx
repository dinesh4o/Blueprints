import { useEffect, useState, useRef } from 'react';

export function PixelRobot() {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const robotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (robotRef.current) {
        const rect = robotRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate direction vector
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const angle = Math.atan2(dy, dx);
        
        // Limit the distance the eyes can move (e.g. 4 pixels max translation)
        const distance = Math.min(Math.hypot(dx, dy) / 40, 4);
        
        setEyeOffset({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={robotRef}
      className="relative flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800 border-4 border-zinc-700 shadow-[0_0_30px_rgba(34,211,238,0.15)] w-24 h-24 mb-6"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Antenna */}
      <div className="absolute -top-4 w-1.5 h-4 bg-zinc-600"></div>
      <div className="absolute -top-5 w-3 h-2 bg-rose-500 rounded-sm animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>

      {/* Ear nodes */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-6 bg-zinc-600 rounded-l-sm z-0"></div>
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-6 bg-zinc-600 rounded-r-sm z-0"></div>
      
      {/* Eyes Container */}
      <div className="flex gap-3 mt-1 relative z-10 w-full justify-center">
        {/* Left Eye Socket */}
        <div className="w-6 h-6 bg-zinc-950 rounded relative flex items-center justify-center overflow-hidden border-b border-zinc-700/50 shadow-inner">
          <div 
            className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] transition-transform duration-75 ease-out"
            style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
          />
        </div>
        {/* Right Eye Socket */}
        <div className="w-6 h-6 bg-zinc-950 rounded relative flex items-center justify-center overflow-hidden border-b border-zinc-700/50 shadow-inner">
          <div 
            className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] transition-transform duration-75 ease-out"
            style={{ transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }}
          />
        </div>
      </div>
      
      {/* Mouth */}
      <div className="mt-3 flex gap-1 h-2 px-1.5 bg-zinc-950 rounded-sm items-center w-14 border-b border-zinc-700/50">
         <div className="flex-1 h-full bg-cyan-400/20" />
         <div className="flex-1 h-full bg-cyan-400/40" />
         <div className="flex-1 h-full bg-cyan-400/60 animate-pulse" />
         <div className="flex-1 h-full bg-cyan-400/40" />
         <div className="flex-1 h-full bg-cyan-400/20" />
      </div>
    </div>
  );
}
