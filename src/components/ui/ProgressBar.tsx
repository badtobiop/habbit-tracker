import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  height?: 'sm' | 'md' | 'lg';
  variant?: 'red' | 'purple' | 'cyan' | 'gold' | 'rainbow' | 'emerald' | 'sky' | 'teal';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  height = 'md',
  variant = 'cyan',
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
    cyan: 'bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 shadow-glow-cyan',
    sky: 'bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 shadow-glow-sky',
    teal: 'bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-300 shadow-glow-teal',
    purple: 'bg-gradient-to-r from-indigo-600 via-purple-500 to-violet-400 shadow-glow-violet',
    gold: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-glow-gold',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50',
    red: 'bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 shadow-glow-cyan',
    rainbow: 'bg-gradient-to-r from-sky-500 via-teal-400 to-amber-400',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
          <span>Progress</span>
          <span className="font-semibold text-sky-200">{percentage}%</span>
        </div>
      )}
      <div className={cn('w-full bg-[#040814]/80 rounded-full overflow-hidden p-0.5 border border-sky-500/20', heightClasses[height])}>
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

