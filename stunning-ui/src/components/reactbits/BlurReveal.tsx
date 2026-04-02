/**
 * React Bits — BlurReveal
 * Text/content that blurs in from invisible to visible on scroll.
 */
import { motion, useInView } from 'framer-motion';
import React from 'react';
import { cn } from '@/lib/utils';

interface BlurRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function BlurReveal({ children, className, delay = 0, direction = 'up' }: BlurRevealProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const offsets = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, filter: 'blur(12px)', ...offsets[direction] }}
      animate={isInView ? { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
