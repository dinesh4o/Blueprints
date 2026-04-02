/**
 * React Bits — ScrollProgress
 * A thin progress bar at the top of the page showing scroll progress.
 */
import { motion, useScroll } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  className?: string;
  color?: string;
}

export function ScrollProgress({ className, color }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className={cn('fixed top-0 left-0 right-0 h-[2px] z-50 origin-left', className)}
      style={{
        scaleX: scrollYProgress,
        background: color ?? 'linear-gradient(90deg, oklch(0.7 0.2 260), oklch(0.75 0.18 180))',
      }}
    />
  );
}
