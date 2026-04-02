/**
 * React Bits — Marquee
 * Infinite horizontal scrolling marquee.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  pauseOnHover?: boolean;
  reverse?: boolean;
}

export function Marquee({
  children,
  className,
  speed = 30,
  pauseOnHover = true,
  reverse = false,
}: MarqueeProps) {
  return (
    <div
      className={cn('group flex overflow-hidden [--gap:1rem] gap-[var(--gap)]', className)}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className={cn(
            'flex shrink-0 gap-[var(--gap)] min-w-full justify-around',
            pauseOnHover && 'group-hover:[animation-play-state:paused]'
          )}
          style={{
            animation: `marquee-scroll ${speed}s linear infinite ${reverse ? 'reverse' : ''}`,
          }}
        >
          {children}
        </div>
      ))}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% - var(--gap))); }
        }
      `}</style>
    </div>
  );
}
