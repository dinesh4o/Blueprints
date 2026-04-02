/**
 * React Bits — GlowingBorder
 * Animated rainbow/gradient border that rotates around a card.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface GlowingBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  borderWidth?: number;
  colors?: string[];
  speed?: number;
}

export function GlowingBorder({
  children,
  className,
  borderWidth = 1,
  colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#6366f1'],
  speed = 4,
  ...props
}: GlowingBorderProps) {
  const id = React.useId();

  return (
    <div
      className={cn('relative rounded-xl', className)}
      {...props}
    >
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          padding: borderWidth,
          background: `conic-gradient(from var(--glow-angle-${id.replace(/:/g, '')}, 0deg), ${colors.join(', ')})`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          animation: `glow-spin-${id.replace(/:/g, '')} ${speed}s linear infinite`,
        }}
      />
      <style>{`
        @property --glow-angle-${id.replace(/:/g, '')} {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
        @keyframes glow-spin-${id.replace(/:/g, '')} {
          to { --glow-angle-${id.replace(/:/g, '')}: 360deg; }
        }
      `}</style>
      <div className="relative rounded-xl bg-card">{children}</div>
    </div>
  );
}
