import React from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Flame, CheckCircle2, Trophy, Target, Award, Sparkles, Moon } from 'lucide-react';
import { User, Habit } from '@/types';

export interface QuickStatsCardsProps {
  user: User | null;
  habits: Habit[];
}

export function QuickStatsCards({ user, habits }: QuickStatsCardsProps) {
  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.is_completed_today).length;
  const remainingHabits = Math.max(0, totalHabits - completedHabits);
  const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Today's Progress Bar Card */}
      <Card glow="cyan" className="p-5 space-y-3 bg-[#040814]/75 border-sky-500/35 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs text-sky-300 font-mono font-medium flex items-center gap-1">
            <Moon className="w-3.5 h-3.5 text-sky-400" /> TODAY'S PROGRESS
          </span>
          <span className="text-xs font-black text-sky-200 font-mono bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/40">
            {percentage}%
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white font-heading">{completedHabits}</span>
          <span className="text-slate-400 text-sm font-mono">/ {totalHabits} Completed</span>
        </div>
        <ProgressBar value={percentage} variant="cyan" height="sm" />
        <div className="text-[11px] text-slate-400 font-mono">
          {remainingHabits === 0 && totalHabits > 0 ? (
            <span className="text-teal-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" /> Perfect Day Achieved! +50 XP Bonus
            </span>
          ) : (
            <span>{remainingHabits} quest{remainingHabits === 1 ? '' : 's'} remaining today</span>
          )}
        </div>
      </Card>

      {/* 2. Current Streak Flame */}
      <Card glow="gold" className="p-5 space-y-3 bg-[#040814]/75 border-amber-500/35 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs text-amber-300 font-mono font-medium">CURRENT STREAK</span>
          <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-amber-300 font-heading">
            {user?.current_streak || 0}
          </span>
          <span className="text-slate-400 text-sm font-mono">Days Active</span>
        </div>
        <div className="text-[11px] text-amber-200/80 font-mono bg-amber-950/40 px-2.5 py-1.5 rounded-xl border border-amber-500/20">
          🏆 All-Time Peak: <strong className="text-amber-300">{user?.best_streak || 0} Days</strong>
        </div>
      </Card>

      {/* 3. Total Quests Completed */}
      <Card glow="cyan" className="p-5 space-y-3 bg-[#040814]/75 border-cyan-500/35 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs text-cyan-300 font-mono font-medium">TOTAL HABIT SLAYS</span>
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white font-heading">
            {user?.total_completions || 0}
          </span>
          <span className="text-slate-400 text-sm font-mono">Habits Finished</span>
        </div>
        <div className="text-[11px] text-cyan-300/80 font-mono bg-cyan-950/40 px-2.5 py-1.5 rounded-xl border border-cyan-500/20">
          ⚡ Unstoppable Momentum
        </div>
      </Card>

      {/* 4. Shinobi Level & XP */}
      <Card glow="none" className="p-5 space-y-3 bg-[#040814]/75 border-sky-500/25 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs text-sky-300 font-mono font-medium">LUNAR RANK LEVEL</span>
          <Award className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-white font-heading">
            LVL {user?.level || 1}
          </span>
          <span className="text-sky-400 text-sm font-mono font-bold">({user?.xp || 0} XP)</span>
        </div>
        <div className="text-[11px] text-sky-300/90 font-mono bg-sky-950/40 px-2.5 py-1.5 rounded-xl border border-sky-500/20 truncate">
          🌊 Ocean Sovereignty Domain
        </div>
      </Card>
    </div>
  );
}

