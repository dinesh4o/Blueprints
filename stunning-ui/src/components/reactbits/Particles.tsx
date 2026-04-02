/**
 * React Bits — Particles
 * Floating animated particle field background.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface ParticlesProps {
  className?: string;
  count?: number;
  color?: string;
  speed?: number;
}

export function Particles({ className, count = 50, color = 'oklch(0.7 0.2 260)', speed = 1 }: ParticlesProps) {
  const particles = React.useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: (15 + Math.random() * 25) / speed,
      delay: Math.random() * 10,
      opacity: 0.1 + Math.random() * 0.4,
    })),
    [count, speed]
  );

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: color,
            opacity: p.opacity,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes particle-float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(${20 / speed}px, -${30 / speed}px) scale(1.2); }
          66% { transform: translate(-${15 / speed}px, ${25 / speed}px) scale(0.8); }
          100% { transform: translate(${10 / speed}px, -${20 / speed}px) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
