/**
 * React Bits — ShinyText
 * Text with a traveling shine/shimmer highlight effect.
 */
import { cn } from '@/lib/utils';

interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

export function ShinyText({ children, className, speed = 3 }: ShinyTextProps) {
  return (
    <span
      className={cn('relative inline-block', className)}
      style={{
        background: `linear-gradient(
          120deg,
          oklch(0.6 0 0) 0%,
          oklch(0.6 0 0) 40%,
          oklch(0.95 0 0) 50%,
          oklch(0.6 0 0) 60%,
          oklch(0.6 0 0) 100%
        )`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: `shiny-slide ${speed}s ease-in-out infinite`,
      }}
    >
      <style>{`
        @keyframes shiny-slide {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      {children}
    </span>
  );
}
