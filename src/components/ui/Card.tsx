import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass = true, hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-200 border',
          glass
            ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/80 dark:border-slate-800/80 shadow-glass dark:shadow-glass-dark'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm',
          hoverable && 'hover:border-emerald-500/40 hover:shadow-glow/20 dark:hover:border-emerald-500/30 hover:-translate-y-0.5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
