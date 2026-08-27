'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Flame, MoreVertical, Edit2, Trash2, Zap, Sparkles } from 'lucide-react';
import { Habit, HabitDifficulty } from '@/types';
import { DifficultyBadge } from '@/components/ui/Badge';
import { playAnimeSound, cn, format12HourTime } from '@/lib/utils';

export interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => Promise<void>;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);

    if (!habit.is_completed_today) {
      playAnimeSound('quest_complete');
    }

    try {
      await onToggle(habit.id);
    } finally {
      setIsToggling(false);
    }
  };

  const categoryIcons: Record<string, string> = {
    Coding: '💻',
    Fitness: '🏋️',
    Study: '📚',
    Health: '💧',
    Mindset: '🧘',
    Discipline: '⚔️',
    Creativity: '🎨',
  };

  return (
    <div
      className={cn(
        'group relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 backdrop-blur-xl',
        habit.is_completed_today
          ? 'bg-red-950/40 border-red-500/60 shadow-glow-red'
          : 'bg-black/65 border-slate-800 hover:border-red-500/40 hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Interactive Checkmark & Habit Details */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Completion Checkmark Trigger */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={cn(
              'mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 select-none btn-cyber',
              habit.is_completed_today
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow-purple scale-105'
                : 'border-2 border-slate-700 hover:border-purple-400 bg-cyber-950 text-transparent hover:text-purple-400/40'
            )}
            title={habit.is_completed_today ? 'Mark Incomplete' : 'Complete Quest'}
          >
            <CheckCircle2 className={cn('w-4 h-4 transition-transform', habit.is_completed_today ? 'scale-100' : 'scale-75')} />
          </button>

          {/* Habit Info */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base">{categoryIcons[habit.category] || '⚡'}</span>
              <h3
                className={cn(
                  'text-base font-bold font-heading transition-colors truncate',
                  habit.is_completed_today ? 'text-slate-400 line-through' : 'text-white group-hover:text-purple-200'
                )}
              >
                {habit.name}
              </h3>
            </div>

            {habit.description && (
              <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                {habit.description}
              </p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <DifficultyBadge difficulty={habit.difficulty} />

              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-300 px-2 py-0.5 rounded-md bg-black/60 border border-slate-800">
                <Clock className="w-3 h-3 text-amber-400" />
                {format12HourTime(habit.reminder_time || '08:00 AM')}
              </span>

              {habit.completion_count !== undefined && habit.completion_count > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-300 px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/30">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  {habit.completion_count} slays
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions Menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 z-30 w-36 rounded-xl bg-cyber-950 border border-slate-700 shadow-xl py-1.5 text-xs animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(habit);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-purple-950/50 flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  Edit Quest
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(habit.id);
                  }}
                  className="w-full px-3 py-2 text-left text-rose-300 hover:text-rose-200 hover:bg-rose-950/50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Delete Quest
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
