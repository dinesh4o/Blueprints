/**
 * React Bits — AnimatedBeam
 * Animated gradient beam connecting two elements (for pipeline visualization).
 */
import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBeamProps {
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
  color?: string;
  width?: number;
  curvature?: number;
  duration?: number;
}

export function AnimatedBeam({
  fromRef,
  toRef,
  containerRef,
  color = 'oklch(0.7 0.2 260)',
  width = 2,
  curvature = 0,
  duration = 3,
}: AnimatedBeamProps) {
  const [path, setPath] = React.useState('');
  const id = React.useId();

  React.useEffect(() => {
    const update = () => {
      if (!fromRef.current || !toRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - containerRect.top;
      const x2 = toRect.left + toRect.width / 2 - containerRect.left;
      const y2 = toRect.top + toRect.height / 2 - containerRect.top;

      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 + curvature;

      setPath(`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [fromRef, toRef, containerRef, curvature]);

  if (!path) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id={`beam-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="oklch(1 0 0 / 0.05)" strokeWidth={width} />
      <motion.path
        d={path}
        fill="none"
        stroke={`url(#beam-grad-${id})`}
        strokeWidth={width}
        strokeDasharray="40 120"
        animate={{ strokeDashoffset: [160, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      />
    </svg>
  );
}
