/**
 * React Bits — Aurora
 * Animated aurora borealis background effect.
 */
import { cn } from '@/lib/utils';

interface AuroraProps {
  className?: string;
  colors?: string[];
}

export function Aurora({
  className,
  colors = [
    'oklch(0.7 0.2 260 / 0.15)',
    'oklch(0.75 0.18 180 / 0.12)',
    'oklch(0.65 0.22 300 / 0.1)',
  ],
}: AuroraProps) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {colors.map((color, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-[120px]"
          style={{
            background: color,
            width: `${40 + i * 15}%`,
            height: `${40 + i * 15}%`,
            left: `${10 + i * 25}%`,
            top: `${-10 + i * 20}%`,
            animation: `aurora-drift-${i} ${12 + i * 4}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes aurora-drift-0 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          100% { transform: translate(80px, 40px) scale(1.2) rotate(15deg); }
        }
        @keyframes aurora-drift-1 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          100% { transform: translate(-60px, 60px) scale(1.15) rotate(-10deg); }
        }
        @keyframes aurora-drift-2 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          100% { transform: translate(40px, -50px) scale(1.25) rotate(20deg); }
        }
      `}</style>
    </div>
  );
}
