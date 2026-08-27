import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  height?: 'sm' | 'md' | 'lg';
  variant?: 'red' | 'purple' | 'cyan' | 'gold' | 'rainbow' | 'emerald';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  height = 'md',
  variant = 'red',
  showLabel = false,
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantGradients = {
    red: 'bg-gradient-to-r from-red-600 via-rose-500 to-red-500 shadow-glow-red',
    purple: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-glow-red',
    cyan: 'bg-gradient-to-r from-red-500 to-amber-500 shadow-glow-red',
    gold: 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-glow-gold',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50',
    rainbow: 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
          <span>Progress</span>
          <span className="font-semibold text-slate-200">{percentage}%</span>
        </div>
      )}
      <div className={cn('w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-slate-800', heightClasses[height])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden',
            variantGradients[variant]
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-shimmer w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
