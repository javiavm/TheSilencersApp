import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-500/15 text-brand-300 border border-brand-500/30',
        secondary: 'bg-surface-muted text-foreground border border-surface-border',
        outline: 'border border-surface-border text-muted-foreground',
        success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
