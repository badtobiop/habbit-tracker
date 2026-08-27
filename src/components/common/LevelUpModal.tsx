'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playAnimeSound } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Sparkles, Trophy, ArrowUpRight } from 'lucide-react';
import { HunterRank } from '@/types';
import { getHunterRank } from '@/lib/anime-constants';

export interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
}

export function LevelUpModal({ isOpen, onClose, newLevel }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      playAnimeSound('level_up');

      // Trigger multi-stage anime confetti
      try {
        const count = 200;
        const defaults = { origin: { y: 0.7 } };

        function fire(particleRatio: number, opts: confetti.Options) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
            colors: ['#a855f7', '#06b6d4', '#ec4899', '#fbbf24', '#ffffff'],
          });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } catch (e) {
        // Fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rank = getHunterRank(newLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-lg animate-in fade-in duration-300" onClick={onClose} />

      {/* Radiant Card */}
      <div className="relative w-full max-w-md bg-cyber-900 border-2 border-purple-500/50 rounded-3xl p-8 text-center shadow-2xl shadow-purple-600/50 z-10 animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Glow Aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-900/40 border border-purple-400/40 shadow-glow-purple mb-4">
            <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-bold tracking-widest uppercase mb-2">
            Awakening Ascended!
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight font-heading mb-1 text-glow-purple">
            LEVEL {newLevel} REACHED
          </h2>

          <p className="text-sm text-slate-300 mb-6">
            Your willpower surges with newfound power. You have ascended to:
          </p>

          <div className="p-4 rounded-2xl bg-cyber-950/90 border border-purple-500/30 mb-6 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs text-slate-400">Current Hunter Rank</div>
              <div className="text-lg font-bold text-white font-heading">{rank.title}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-400/50 text-purple-200 font-bold text-sm">
              Rank {rank.rankLetter}
            </div>
          </div>

          <div className="text-xs text-slate-400 mb-6 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Bonus stat points and companion power unlocked</span>
          </div>

          <Button variant="glow-purple" size="lg" className="w-full font-bold" onClick={onClose}>
            Claim Awakening Power
          </Button>
        </div>
      </div>
    </div>
  );
}
