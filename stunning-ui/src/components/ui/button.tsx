import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.7_0.2_260/0.3)] hover:shadow-[0_0_30px_oklch(0.7_0.2_260/0.5)] hover:brightness-110',
        secondary:
          'bg-muted text-foreground hover:bg-muted/80 border border-border',
        outline:
          'border border-border bg-transparent hover:bg-muted/50 text-foreground',
        ghost:
          'hover:bg-muted/50 text-foreground',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90',
        accent:
          'bg-accent text-accent-foreground shadow-[0_0_20px_oklch(0.75_0.18_180/0.3)] hover:shadow-[0_0_30px_oklch(0.75_0.18_180/0.5)] hover:brightness-110',
        glow:
          'bg-transparent border border-primary/50 text-primary hover:bg-primary/10 shadow-[0_0_15px_oklch(0.7_0.2_260/0.2)] hover:shadow-[0_0_25px_oklch(0.7_0.2_260/0.4)]',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = 'Button';

export { Button, buttonVariants };
