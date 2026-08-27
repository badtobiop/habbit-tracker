import React, { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { HabitDifficulty } from '@/types';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate' | 'rank_e' | 'rank_d' | 'rank_c' | 'rank_b' | 'rank_a' | 'rank_s';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800/80 text-slate-300 border-slate-700',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-900/50',
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-900/50',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    slate: 'bg-slate-800/60 text-slate-400 border-slate-700',
    rank_e: 'bg-slate-900 text-slate-300 border-slate-600',
    rank_d: 'bg-emerald-950 text-emerald-300 border-emerald-500/50',
    rank_c: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
    rank_b: 'bg-blue-950 text-blue-300 border-blue-500/50',
    rank_a: 'bg-purple-950 text-purple-300 border-purple-500/50',
    rank_s: 'bg-amber-950 text-amber-300 border-amber-500/60 shadow-glow-gold',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border uppercase tracking-wider',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: HabitDifficulty }) {
  switch (difficulty) {
    case 'easy':
      return <Badge variant="emerald" size="sm">E-Rank (+10 XP)</Badge>;
    case 'medium':
      return <Badge variant="cyan" size="sm">C-Rank (+20 XP)</Badge>;
    case 'hard':
      return <Badge variant="purple" size="sm">A-Rank (+35 XP)</Badge>;
    case 'extreme':
      return <Badge variant="rank_s" size="sm">S-Rank (+50 XP)</Badge>;
    default:
      return <Badge variant="default" size="sm">{difficulty}</Badge>;
  }
}
