/**
 * React Bits — SplitText
 * Text that animates in letter by letter with staggered spring physics.
 */
import { motion } from 'framer-motion';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function SplitText({ text, className = '', delay = 0, stagger = 0.03 }: SplitTextProps) {
  const letters = text.split('');

  return (
    <span className={className} aria-label={text}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            delay: delay + i * stagger,
            type: 'spring',
            stiffness: 150,
            damping: 20,
          }}
          className="inline-block"
          style={{ whiteSpace: letter === ' ' ? 'pre' : undefined }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </span>
  );
}
