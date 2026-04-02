/**
 * React Bits — TextReveal
 * Scroll-triggered text that reveals word by word.
 */
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TextRevealProps {
  text: string;
  className?: string;
}

export function TextReveal({ text, className }: TextRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.9', 'start 0.3'],
  });

  const words = text.split(' ');

  return (
    <div ref={ref} className={cn('relative', className)}>
      <p className="flex flex-wrap text-3xl font-bold leading-relaxed md:text-5xl lg:text-6xl">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return <Word key={i} progress={scrollYProgress} range={[start, end]}>{word}</Word>;
        })}
      </p>
    </div>
  );
}

function Word({ children, progress, range }: { children: string; progress: any; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const blur = useTransform(progress, range, [4, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <span className="relative mr-3 mt-2">
      <motion.span style={{ opacity, filter }} className="text-foreground">
        {children}
      </motion.span>
    </span>
  );
}
