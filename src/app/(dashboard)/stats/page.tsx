'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  BarChart3,
  TrendingUp,
  Award,
  Flame,
  Target,
  Zap,
  Activity,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { UserStats, HunterRank } from '@/types';

export default function StatsPage() {
  const { user } = useDashboard();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [hunterRank, setHunterRank] = useState<HunterRank | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setHunterRank(data.hunterRank);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-20 text-center text-xs font-mono text-slate-400">
        Calculating habit analytics and RPG attributes...
      </div>
    );
  }

  const maxWeekly = Math.max(...stats.weeklyHistory.map((w) => w.total), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold">
          <Activity className="w-3.5 h-3.5" />
          <span>Real-Time Discipline Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
          Hunter Analytics & Statistics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Empirical data generated from your verified database habit completion logs.
        </p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. 7-Day Completion Rate */}
        <Card glow="purple" className="p-5 space-y-2 bg-cyber-900/90 border-purple-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>7-DAY CONSISTENCY</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white font-heading">
            {stats.completionRate7d}%
          </div>
          <ProgressBar value={stats.completionRate7d} variant="purple" height="sm" />
          <div className="text-[11px] text-slate-400 font-mono">Past 7 days performance</div>
        </Card>

        {/* 2. 30-Day Completion Rate */}
        <Card glow="cyan" className="p-5 space-y-2 bg-cyber-900/90 border-cyan-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>30-DAY SUCCESS</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-300 font-heading">
            {stats.completionRate30d}%
          </div>
          <ProgressBar value={stats.completionRate30d} variant="cyan" height="sm" />
          <div className="text-[11px] text-slate-400 font-mono">Monthly execution rate</div>
        </Card>

        {/* 3. Current & Peak Streak */}
        <Card glow="gold" className="p-5 space-y-2 bg-cyber-900/90 border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTIVE STREAK</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300 font-heading">
            {stats.currentStreak} Days
          </div>
          <div className="text-[11px] text-amber-200/80 font-mono bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-500/20">
            🏆 Peak Record: {stats.bestStreak} Days
          </div>
        </Card>

        {/* 4. Most Consistent Habit */}
        <Card glow="none" className="p-5 space-y-2 bg-cyber-900/90 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>MOST CONSISTENT QUEST</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-heading truncate">
            {stats.mostConsistentHabit ? stats.mostConsistentHabit.name : 'No habits yet'}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono">
            {stats.mostConsistentHabit ? `${stats.mostConsistentHabit.completions} total slays recorded` : 'Complete habits to rank'}
          </div>
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Completion Bar Chart */}
        <Card glow="purple" className="lg:col-span-7 p-6 bg-cyber-900/90 border-purple-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                <span>Weekly Slay History (Last 7 Days)</span>
              </h2>
              <p className="text-xs text-slate-400">Habits slayed per day</p>
            </div>
            <div className="text-xs font-mono text-purple-300 bg-purple-950 px-2.5 py-1 rounded-lg border border-purple-500/30">
              Live DB Sync
            </div>
          </div>

          {/* Bar Chart Visual */}
          <div className="pt-4 flex items-end justify-between gap-2 sm:gap-4 h-48 border-b border-slate-800 pb-2">
            {stats.weeklyHistory.map((item, idx) => {
              const heightPercent = maxWeekly > 0 ? Math.max(8, Math.round((item.completed / maxWeekly) * 100)) : 8;
              const isToday = idx === stats.weeklyHistory.length - 1;

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.completed}
                  </span>
                  <div className="w-full max-w-[36px] bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-purple-600 to-cyan-400 shadow-glow-purple'
                          : item.completed > 0
                          ? 'bg-gradient-to-t from-indigo-700 to-purple-500'
                          : 'bg-slate-700/40'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono font-bold ${isToday ? 'text-purple-300' : 'text-slate-400'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Hunter RPG Attributes Radar */}
        <Card glow="cyan" className="lg:col-span-5 p-6 bg-cyber-900/90 border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Hunter Attributes Radar</span>
            </h2>
            <span className="text-xs font-mono text-cyan-300">Level {user?.level}</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {/* Discipline */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">⚔️ Discipline (Streak Momentum)</span>
                <span className="font-bold text-purple-300">{stats.attributes.discipline}/100</span>
              </div>
              <ProgressBar value={stats.attributes.discipline} variant="purple" height="sm" />
            </div>

            {/* Consistency */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">🛡️ Consistency (Completion Rate)</span>
                <span className="font-bold text-cyan-300">{stats.attributes.consistency}/100</span>
              </div>
              <ProgressBar value={stats.attributes.consistency} variant="cyan" height="sm" />
            </div>

            {/* Focus */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">🧠 Focus (Coding & Study)</span>
                <span className="font-bold text-amber-300">{stats.attributes.focus}/100</span>
              </div>
              <ProgressBar value={stats.attributes.focus} variant="gold" height="sm" />
            </div>

            {/* Vitality */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">❤️ Vitality (Fitness & Health)</span>
                <span className="font-bold text-emerald-300">{stats.attributes.vitality}/100</span>
              </div>
              <ProgressBar value={stats.attributes.vitality} variant="emerald" height="sm" />
            </div>

            {/* Intellect */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">🔮 Intellect (Mindset Mastery)</span>
                <span className="font-bold text-pink-300">{stats.attributes.intellect}/100</span>
              </div>
              <ProgressBar value={stats.attributes.intellect} variant="purple" height="sm" />
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card glow="none" className="p-6 bg-cyber-900/90 border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white font-heading">
          Habit Category Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.categoryDistribution.map((cat) => (
            <div key={cat.category} className="p-4 rounded-2xl bg-cyber-950/80 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white font-heading">{cat.category}</span>
                <span className="font-mono text-purple-300">{cat.percentage}%</span>
              </div>
              <ProgressBar value={cat.percentage} variant="purple" height="sm" />
              <div className="text-[11px] text-slate-400 font-mono">
                {cat.count} total completions
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
