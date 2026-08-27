import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'purple' | 'cyan' | 'gold' | 'pink' | 'red';
  hoverEffect?: boolean;
}

export function Card({ className, glow = 'none', hoverEffect = true, children, ...props }: CardProps) {
  const glowClasses = {
    none: 'border-slate-800/80 bg-black/65 shadow-xl',
    purple: 'border-red-500/35 bg-black/65 shadow-glow-red',
    red: 'border-red-500/40 bg-black/65 shadow-glow-red',
    cyan: 'border-cyan-500/30 bg-black/65 shadow-glow-cyan',
    gold: 'border-amber-500/35 bg-black/65 shadow-glow-gold',
    pink: 'border-rose-500/35 bg-black/65 shadow-glow-rose',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-2xl transition-all duration-300',
        glowClasses[glow],
        hoverEffect && 'hover:border-red-500/50 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
