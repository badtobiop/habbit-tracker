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
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md shadow-sky-600/25 border border-sky-400/40 active:translate-y-0.5',
      secondary: 'bg-ocean-800 hover:bg-ocean-750 text-slate-200 border border-ocean-700 active:translate-y-0.5',
      outline: 'bg-transparent border border-sky-500/40 hover:bg-sky-950/40 text-sky-300 hover:text-white active:translate-y-0.5',
      danger: 'bg-rose-700 hover:bg-rose-600 text-white shadow-md shadow-rose-700/25 active:translate-y-0.5',
      ghost: 'bg-transparent hover:bg-sky-950/40 text-slate-300 hover:text-white',
      'glow-purple': 'bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white shadow-glow-cyan border border-sky-400/40 active:translate-y-0.5',
      'glow-cyan': 'bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white shadow-glow-cyan border border-sky-400/50 active:translate-y-0.5',
      'glow-gold': 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-glow-gold border border-amber-400/40 active:translate-y-0.5',
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

