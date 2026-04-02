/**
 * React Bits — OrbEffect
 * A large, luminous animated orb for hero sections.
 */
import { cn } from '@/lib/utils';

interface OrbEffectProps {
  className?: string;
  color?: string;
  size?: number;
}

export function OrbEffect({
  className,
  color = 'oklch(0.7 0.2 260)',
  size = 500,
}: OrbEffectProps) {
  return (
    <div className={cn('pointer-events-none absolute', className)}>
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity: 0.2,
          animation: 'orb-pulse 6s ease-in-out infinite alternate',
          filter: 'blur(60px)',
        }}
      />
      <style>{`
        @keyframes orb-pulse {
          0% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.25; }
          100% { transform: scale(1); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
