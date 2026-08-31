import React from 'react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Sparkles, Trophy, ArrowUp, Moon } from 'lucide-react';
import { calculateLevelFromXP, getHunterRank } from '@/lib/anime-constants';
import { User } from '@/types';

export interface LevelProgressCardProps {
  user: User | null;
}

export function LevelProgressCard({ user }: LevelProgressCardProps) {
  if (!user) return null;

  const { level, currentLevelXP, nextLevelXP, xpNeededForNext, progressPercent } = calculateLevelFromXP(user.xp);
  const currentRank = getHunterRank(level);
  const nextRank = getHunterRank(level + 1);

  return (
    <Card glow="cyan" className="p-6 bg-[#040814]/75 border-sky-500/35 backdrop-blur-xl space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] text-sky-400 uppercase font-mono font-bold flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-sky-300" />
            <span>Lunar Discipline Gauge</span>
          </div>
          <div className="text-2xl font-black text-white font-heading flex items-center gap-2">
            <span>LEVEL {level}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-200 font-mono">
              {currentRank.title}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-mono">Total Harvested</div>
          <div className="text-sm font-black text-sky-300 font-mono">{user.xp} XP</div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-slate-300">
          <span>Current Level Progress</span>
          <span className="font-bold text-sky-300">{currentLevelXP} / {nextLevelXP} XP ({progressPercent}%)</span>
        </div>
        <ProgressBar value={progressPercent} variant="cyan" height="md" />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
        <div className="flex items-center gap-1">
          <ArrowUp className="w-3.5 h-3.5 text-teal-400" />
          <span><strong className="text-slate-200">{xpNeededForNext} XP</strong> needed for Level {level + 1}</span>
        </div>
        {currentRank.rankLetter !== nextRank.rankLetter && (
          <span className="text-amber-400 font-bold">
            🌊 Next Rank: {nextRank.title}
          </span>
        )}
      </div>
    </Card>
  );
}

