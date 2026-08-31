'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden" data-lenis-prevent="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#040814]/85 backdrop-blur-xl transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog with Fixed Max Height & Dedicated Internal Scroll Area */}
      <div
        data-lenis-prevent="true"
        className={cn(
          'relative w-full max-h-[88vh] flex flex-col bg-[#040814]/90 border-2 border-sky-500/35 rounded-3xl shadow-2xl shadow-sky-950/70 p-5 sm:p-6 z-10 animate-in zoom-in-95 duration-200 backdrop-blur-2xl',
          maxWidths[maxWidth]
        )}
      >
        {/* Top Lunar Cyan Accent Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 rounded-t-3xl" />

        {/* Modal Header (Fixed / Non-scrolling) */}
        <div className="flex items-start justify-between pb-3 mb-3 border-b border-sky-500/20 shrink-0">
          <div className="min-w-0 pr-3">
            {title && <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-sky-300/80 mt-0.5">{subtitle}</p>}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-[#040814]/70 border border-sky-500/25 hover:border-sky-400 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain pr-1.5 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}

