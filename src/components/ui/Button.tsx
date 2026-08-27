import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glow-purple' | 'glow-cyan' | 'glow-gold';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 border border-red-500/40 active:translate-y-0.5',
      secondary: 'bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 active:translate-y-0.5',
      outline: 'bg-transparent border border-red-500/40 hover:bg-red-950/40 text-red-300 hover:text-white active:translate-y-0.5',
      danger: 'bg-red-700 hover:bg-red-600 text-white shadow-md shadow-red-700/25 active:translate-y-0.5',
      ghost: 'bg-transparent hover:bg-slate-850/60 text-slate-300 hover:text-white',
      'glow-purple': 'bg-red-600 hover:bg-red-500 text-white shadow-glow-red border border-red-400/40 active:translate-y-0.5',
      'glow-cyan': 'bg-red-600 hover:bg-red-500 text-white shadow-glow-red border border-red-400/40 active:translate-y-0.5',
      'glow-gold': 'bg-red-600 hover:bg-red-500 text-white shadow-glow-red border border-red-400/40 active:translate-y-0.5',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-sm sm:text-base px-6 py-3 gap-2 font-semibold',
      icon: 'p-2 w-9 h-9',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
