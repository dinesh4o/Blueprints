/**
 * React Bits — GradientText
 * Text with an animated flowing gradient.
 */
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
}

export function GradientText({
  children,
  className,
  colors = ['#6366f1', '#06b6d4', '#10b981', '#6366f1'],
  animationSpeed = 4,
}: GradientTextProps) {
  const gradient = `linear-gradient(90deg, ${colors.join(', ')})`;

  return (
    <span
      className={cn('inline-block bg-clip-text text-transparent', className)}
      style={{
        backgroundImage: gradient,
        backgroundSize: '300% 100%',
        animation: `gradient-flow ${animationSpeed}s ease infinite`,
      }}
    >
      <style>{`
        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      {children}
    </span>
  );
}
