/**
 * React Bits — Dock
 * macOS-style icon dock with magnetic hover magnification.
 */
import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface DockProps {
  items: DockItem[];
  className?: string;
}

function DockIcon({ icon, label, mouseX, onClick }: DockItem & { mouseX: any }) {
  const ref = React.useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return 150;
    return val - rect.x - rect.width / 2;
  });

  const size = useSpring(
    useTransform(distance, [-150, 0, 150], [48, 72, 48]),
    { stiffness: 300, damping: 25 }
  );

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center rounded-xl bg-muted/60 backdrop-blur-sm border border-border/50',
        'cursor-pointer transition-colors hover:bg-muted/80 group'
      )}
    >
      <div className="text-foreground">{icon}</div>
      <div className="absolute -top-8 scale-0 group-hover:scale-100 transition-transform origin-bottom whitespace-nowrap rounded-md bg-foreground/90 px-2 py-1 text-xs text-background">
        {label}
      </div>
    </motion.div>
  );
}

export function Dock({ items, className }: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        'mx-auto flex items-end gap-2 rounded-2xl glass p-3',
        className
      )}
    >
      {items.map((item, i) => (
        <DockIcon key={i} {...item} mouseX={mouseX} />
      ))}
    </motion.div>
  );
}
