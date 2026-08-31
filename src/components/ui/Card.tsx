import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'purple' | 'cyan' | 'gold' | 'pink' | 'red';
  hoverEffect?: boolean;
}

export function Card({ className, glow = 'none', hoverEffect = true, children, ...props }: CardProps) {
  const glowClasses = {
    none: 'border-sky-500/20 bg-[#040814]/75 shadow-xl',
    purple: 'border-violet-500/35 bg-[#040814]/75 shadow-glow-violet',
    red: 'border-sky-500/35 bg-[#040814]/75 shadow-glow-cyan',
    cyan: 'border-cyan-500/35 bg-[#040814]/75 shadow-glow-cyan',
    gold: 'border-amber-500/35 bg-[#040814]/75 shadow-glow-gold',
    pink: 'border-teal-500/35 bg-[#040814]/75 shadow-glow-teal',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-2xl transition-all duration-300',
        glowClasses[glow],
        hoverEffect && 'hover:border-sky-400/50 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

