'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Trophy, Sparkles, Lock, CheckCircle2, Award, Flame, Shield, Target } from 'lucide-react';
import { Achievement } from '@/types';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedPercent, setUnlockedPercent] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await fetch('/api/achievements');
        const data = await res.json();
        if (data.success) {
          setAchievements(data.achievements);
          setUnlockedPercent(data.unlockedPercent);
          setUnlockedCount(data.unlockedCount);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        console.error('Failed to load achievements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAchievements();
  }, []);

  const getAchievementIcon = (code: string) => {
    switch (code) {
      case 'first_step':
        return '🌱';
      case 'streak_3':
        return '🔥';
      case 'streak_7':
        return '⚔️';
      case 'streak_14':
        return '🛡️';
      case 'streak_30':
        return '👑';
      case 'completions_25':
        return '🎯';
      case 'completions_100':
        return '⚡';
      case 'level_5':
        return '🗡️';
      case 'level_10':
        return '💀';
      case 'level_20':
        return '🌌';
      case 'level_30':
        return '✨';
      default:
        return '🏆';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          <span>Hall of Hunter Relics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
          Achievements & Medals
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Unlock prestigious badges and harvest bonus XP by smashing consistency milestones.
        </p>
      </div>

      {/* Progress Overview Banner */}
      <Card glow="gold" className="p-6 sm:p-8 bg-cyber-900/90 border-amber-500/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-amber-300 uppercase">Collection Progress</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-heading">
              {unlockedCount} / {totalCount} Medals Awakened ({unlockedPercent}%)
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono">Total Badge Bonus XP</span>
            <div className="text-xl font-bold text-amber-400 font-mono">
              +{achievements.filter((a) => a.is_unlocked).reduce((acc, a) => acc + a.xp_reward, 0)} XP
            </div>
          </div>
        </div>

        <ProgressBar value={unlockedPercent} variant="gold" height="md" />
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {achievements.map((ach) => (
          <Card
            key={ach.id}
            glow={ach.is_unlocked ? 'gold' : 'none'}
            className={`p-6 space-y-4 relative transition-all ${
              ach.is_unlocked
                ? 'bg-cyber-900/90 border-amber-500/40 shadow-glow-gold'
                : 'bg-cyber-950/60 border-slate-800 opacity-70'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                    ach.is_unlocked
                      ? 'bg-amber-950/80 border-amber-500/60 shadow-glow-gold'
                      : 'bg-cyber-950 border-slate-700 grayscale'
                  }`}
                >
                  {getAchievementIcon(ach.code)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-heading">{ach.title}</h3>
                  <span className="text-[10px] font-mono text-amber-400 font-semibold">
                    +{ach.xp_reward} Bonus XP
                  </span>
                </div>
              </div>

              {ach.is_unlocked ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-950 text-[10px] font-bold text-amber-300 border border-amber-500/50 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-amber-400" />
                  UNLOCKED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-mono text-slate-400 border border-slate-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  LOCKED
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
              {ach.description}
            </p>

            {/* Progress */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Requirement</span>
                <span className={ach.is_unlocked ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                  {ach.progress}%
                </span>
              </div>
              <ProgressBar
                value={ach.progress || 0}
                variant={ach.is_unlocked ? 'gold' : 'purple'}
                height="sm"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
