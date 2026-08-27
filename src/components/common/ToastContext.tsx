'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastItem {
  id: string;
  type: 'success' | 'xp' | 'achievement' | 'error' | 'info';
  title: string;
  message?: string;
  xp?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  showXP: (xp: number, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(({ type, title, message, xp }: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message, xp }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const showXP = useCallback((xp: number, message = 'Quest Completed!') => {
    showToast({
      type: 'xp',
      title: `+${xp} XP`,
      message,
      xp,
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showXP }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200',
              t.type === 'xp' && 'bg-purple-950/90 border-purple-500/50 shadow-glow-purple text-purple-100',
              t.type === 'achievement' && 'bg-amber-950/90 border-amber-500/50 shadow-glow-gold text-amber-100',
              t.type === 'success' && 'bg-slate-900/90 border-emerald-500/50 text-slate-100',
              t.type === 'error' && 'bg-slate-900/90 border-rose-500/50 text-slate-100',
              t.type === 'info' && 'bg-slate-900/90 border-cyan-500/50 text-slate-100'
            )}
          >
            <div className="p-1 rounded-lg shrink-0">
              {t.type === 'xp' && <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />}
              {t.type === 'achievement' && <span className="text-xl">🏆</span>}
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold tracking-tight">{t.title}</div>
              {t.message && <div className="text-xs opacity-80 mt-0.5">{t.message}</div>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
