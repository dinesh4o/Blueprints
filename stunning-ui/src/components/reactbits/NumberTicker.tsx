/**
 * React Bits — NumberTicker
 * Animated number counter that ticks up from 0 to target value.
 */
import React from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface NumberTickerProps {
  value: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimalPlaces?: number;
}

export function NumberTicker({
  value,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  suffix = '',
  prefix = '',
  decimalPlaces = 0,
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const motionValue = useSpring(direction === 'up' ? 0 : value, {
    duration: duration * 1000,
    bounce: 0,
  });
  const display = useTransform(motionValue, (v) =>
    `${prefix}${Intl.NumberFormat('en-US', { minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces }).format(Number(v.toFixed(decimalPlaces)))}${suffix}`
  );

  React.useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        motionValue.set(direction === 'up' ? value : 0);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    }
  }, [isInView, value, direction, delay, motionValue]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
