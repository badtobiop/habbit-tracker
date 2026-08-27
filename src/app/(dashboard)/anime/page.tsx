'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AVATAR_OPTIONS } from '@/components/ui/AvatarBadge';
import { useToast } from '@/components/common/ToastContext';
import { Sparkles, Trophy, Shield, Zap, Lock, CheckCircle2, ArrowRight, Star, Flame } from 'lucide-react';
import { HunterRank, Companion } from '@/types';
import { calculateLevelFromXP } from '@/lib/anime-constants';

export default function AnimePage() {
  const { user, updateUserLocally } = useDashboard();
  const { showToast } = useToast();

  const [currentRank, setCurrentRank] = useState<HunterRank | null>(null);
  const [ranks, setRanks] = useState<(HunterRank & { isReached: boolean; isCurrent: boolean })[]>([]);
  const [companions, setCompanions] = useState<(Companion & { isUnlocked: boolean; isSelected: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnimeData = useCallback(async () => {
    try {
      const res = await fetch('/api/anime');
      const data = await res.json();
      if (data.success) {
        setCurrentRank(data.currentRank);
        setRanks(data.ranks);
        setCompanions(data.companions);
      }
    } catch (err) {
      console.error('Failed to load anime info:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnimeData();
  }, [fetchAnimeData]);

  const handleSelectCompanion = async (companionId: string) => {
    try {
      const res = await fetch('/api/anime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companionId }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUserLocally({ companion: companionId });
        showToast({
          type: 'success',
          title: 'Companion Spirit Bonded',
          message: 'Active familiar buffs updated!',
        });
        fetchAnimeData();
      } else {
        showToast({ type: 'error', title: 'Unlock Required', message: data.error });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update companion' });
    }
  };

  const handleSelectAvatar = async (avatarId: string) => {
    try {
      const res = await fetch('/api/anime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarId }),
      });
      if (res.ok) {
        updateUserLocally({ avatar: avatarId });
        showToast({ type: 'success', title: 'Hunter Persona Updated', message: 'Avatar applied.' });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to set avatar' });
    }
  };

  if (!user) return null;
  const levelInfo = calculateLevelFromXP(user.xp);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hunter Association Database</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
          Anime Hunter Domain & Ranks
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Ascend your Hunter level, bond with mythical spirit companions, and rule over discipline.
        </p>
      </div>

      {/* Hero Hunter Status Banner */}
      <Card glow="purple" className="p-6 sm:p-8 bg-cyber-900/90 border-purple-500/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="px-3.5 py-1.5 rounded-xl font-black text-white text-sm"
                style={{
                  backgroundColor: currentRank?.color || '#a855f7',
                  boxShadow: `0 0 20px ${currentRank?.glowColor}`,
                }}
              >
                Rank {currentRank?.rankLetter || 'E'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                {currentRank?.title || 'E-Rank Initiate'}
              </h2>
            </div>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {currentRank?.description}
            </p>

            <div className="p-4 rounded-2xl bg-cyber-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span className="font-bold text-purple-300">Hunter Level {user.level} Progress</span>
                <span className="font-bold">{levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP</span>
              </div>
              <ProgressBar value={levelInfo.progressPercent} variant="purple" height="md" />
              <div className="text-[11px] text-slate-400 font-mono flex justify-between">
                <span>Total XP Earned: {user.xp} XP</span>
                <span className="text-emerald-400 font-semibold">{levelInfo.xpNeededForNext} XP to Level {user.level + 1}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-cyber-950/90 border border-purple-500/25 text-center space-y-3">
            <div className="text-4xl animate-bounce">⚔️</div>
            <div className="text-xs text-slate-400 font-mono">Disciplined Hunter Record</div>
            <div className="text-2xl font-black text-amber-300 font-heading flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              {user.current_streak} Day Streak
            </div>
            <div className="text-[11px] text-purple-300 font-mono">
              Total Slays: {user.total_completions} Habits
            </div>
          </div>
        </div>
      </Card>

      {/* 1. Hunter Rank Progression Tree */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span>Hunter Rank Awakening Hierarchy</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranks.map((rank) => (
            <Card
              key={rank.rankLetter}
              glow={rank.isCurrent ? 'purple' : 'none'}
              className={`p-5 space-y-3 relative overflow-hidden transition-all ${
                rank.isReached
                  ? 'bg-cyber-900/90 border-purple-500/30'
                  : 'bg-cyber-950/50 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
                    style={{ backgroundColor: rank.color }}
                  >
                    {rank.rankLetter}
                  </span>
                  <div>
                    <h3 className="font-bold text-white text-sm font-heading">{rank.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Lvl {rank.minLevel}+ Required</span>
                  </div>
                </div>

                {rank.isCurrent ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-600 text-white shadow-glow-purple">
                    CURRENT
                  </span>
                ) : rank.isReached ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{rank.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Companion Spirit Familiars Roster */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span>Spirit Beast Companions & Passive Buffs</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companions.map((comp) => (
            <Card
              key={comp.id}
              glow={comp.isSelected ? 'cyan' : 'none'}
              className={`p-5 space-y-4 relative ${
                comp.isSelected
                  ? 'border-cyan-500/60 bg-cyber-900/90 shadow-glow-cyan'
                  : comp.isUnlocked
                  ? 'border-slate-800 bg-cyber-900/70 hover:border-slate-700'
                  : 'border-slate-800/60 bg-cyber-950/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyber-950 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                    {comp.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-heading">{comp.name}</h3>
                    <span className="text-[10px] font-mono text-cyan-300">{comp.title} • {comp.element}</span>
                  </div>
                </div>

                {!comp.isUnlocked && (
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Lvl {comp.requiredLevel}
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-cyber-950/90 border border-slate-800/80 text-xs text-purple-300 font-mono leading-relaxed">
                ✨ {comp.buffDescription}
              </div>

              <p className="text-[11px] text-slate-400 italic leading-snug">
                "{comp.story}"
              </p>

              <Button
                variant={comp.isSelected ? 'glow-cyan' : comp.isUnlocked ? 'secondary' : 'ghost'}
                size="sm"
                disabled={!comp.isUnlocked || comp.isSelected}
                onClick={() => handleSelectCompanion(comp.id)}
                className="w-full text-xs font-bold"
              >
                {comp.isSelected ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Familiar
                  </span>
                ) : comp.isUnlocked ? (
                  'Bond with Spirit'
                ) : (
                  `Unlocks at Level ${comp.requiredLevel}`
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Anime Persona Avatar Selector */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Hunter Persona Avatars</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {AVATAR_OPTIONS.map((av) => {
            const isSelected = user.avatar === av.id;
            return (
              <button
                key={av.id}
                onClick={() => handleSelectAvatar(av.id)}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/60 shadow-glow-purple scale-105'
                    : 'border-slate-800 bg-cyber-900/60 hover:border-slate-700'
                }`}
              >
                <span className="text-3xl">{av.icon}</span>
                <span className="text-xs font-bold text-white font-heading">{av.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 font-mono truncate w-full">{av.name}</span>
                {isSelected && (
                  <span className="text-[10px] font-mono text-purple-300 font-bold">Active</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
