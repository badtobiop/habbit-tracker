'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { QuickStatsCards } from '@/components/dashboard/QuickStatsCards';
import { LevelProgressCard } from '@/components/dashboard/LevelProgressCard';
import { CharacterCompanionCard } from '@/components/dashboard/CharacterCompanionCard';
import { HabitCard } from '@/components/dashboard/HabitCard';
import { HabitModal } from '@/components/dashboard/HabitModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Habit, HabitCategory } from '@/types';
import { useToast } from '@/components/common/ToastContext';
import { Sparkles, Plus, CheckSquare, Filter, RefreshCw, Flame } from 'lucide-react';
import { getLocalDateString } from '@/lib/utils';

export default function DashboardPage() {
  const { user, updateUserLocally, triggerLevelUp } = useDashboard();
  const { showToast, showXP } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const fetchHabits = useCallback(async () => {
    try {
      const today = getLocalDateString();
      const res = await fetch(`/api/habits?date=${today}`);
      const data = await res.json();
      if (data.success && data.habits) {
        setHabits(data.habits);
      }
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleToggleHabit = async (habitId: string) => {
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    const today = getLocalDateString();

    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit_id: habitId,
          completed_date: today,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast({ type: 'error', title: 'Error', message: data.error || 'Failed to update quest' });
        return;
      }

      // Optimistically update local habit state
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? {
                ...h,
                is_completed_today: data.is_completed,
                completion_count: (h.completion_count || 0) + (data.is_completed ? 1 : -1),
              }
            : h
        )
      );

      // Update user stats
      updateUserLocally({
        xp: data.xp,
        level: data.level,
        current_streak: data.current_streak,
        best_streak: data.best_streak,
        total_completions: data.total_completions,
      });

      if (data.is_completed) {
        showXP(data.xp_earned, `${targetHabit.name} Slayed!`);

        if (data.is_perfect_day) {
          showToast({
            type: 'achievement',
            title: '⭐ PERFECT DAY BONUS!',
            message: 'All daily habits completed! +50 XP bonus awarded.',
          });
        }

        if (data.leveled_up) {
          triggerLevelUp(data.level);
        }

        if (data.new_achievements && data.new_achievements.length > 0) {
          data.new_achievements.forEach((ach: any) => {
            showToast({
              type: 'achievement',
              title: `🏆 Unlocked: ${ach.achievement.title}`,
              message: `${ach.achievement.description} (+${ach.xpBonus} XP)`,
            });
          });
        }
      } else {
        showToast({
          type: 'info',
          title: 'Quest Marked Incomplete',
          message: `${targetHabit.name} reverted.`,
        });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Network Error', message: 'Failed to record completion' });
    }
  };

  const handleSaveHabit = async (habitData: Partial<Habit>) => {
    try {
      if (editingHabit) {
        const res = await fetch(`/api/habits/${editingHabit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData),
        });
        const data = await res.json();
        if (data.success) {
          showToast({ type: 'success', title: 'Quest Updated', message: 'Changes applied.' });
          fetchHabits();
        }
      } else {
        const res = await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData),
        });
        const data = await res.json();
        if (data.success) {
          showToast({ type: 'success', title: 'New Quest Awakened', message: `${data.habit.name} added.` });
          fetchHabits();
        }
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to save quest' });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this quest?')) return;
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast({ type: 'info', title: 'Quest Deleted', message: 'Habit removed from your realm.' });
        fetchHabits();
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete habit' });
    }
  };

  const baseCategories = ['All', 'Coding', 'Fitness', 'Study', 'Health', 'Mindset', 'Discipline'];
  const customCats = Array.from(new Set(habits.map((h) => h.category))).filter((c) => Boolean(c) && !baseCategories.includes(c));
  const categories = [...baseCategories, ...customCats];

  const filteredHabits = selectedCategory === 'All'
    ? habits
    : habits.filter((h) => h.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* 1. Quick Stats Overview Cards */}
      <QuickStatsCards user={user} habits={habits} />

      {/* 2. Top Progress & Active Companion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <LevelProgressCard user={user} />
        </div>
        <div className="lg:col-span-5">
          <CharacterCompanionCard user={user} />
        </div>
      </div>

      {/* 3. Today's Quests Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-400" />
              <span>Today's Daily Quests</span>
            </h2>
            <p className="text-xs text-slate-400">
              Slay your daily habits to gain XP, protect streaks, and ascend ranks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchHabits()}
              title="Refresh Quests"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="glow-purple"
              size="sm"
              onClick={() => {
                setEditingHabit(null);
                setModalOpen(true);
              }}
              className="font-bold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Quest
            </Button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium border transition-all ${
                  isSelected
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-glow-purple'
                    : 'bg-cyber-900/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Quests List */}
        {filteredHabits.length === 0 ? (
          <Card glow="none" className="p-12 text-center space-y-4 border-dashed border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-2xl">
              ⚔️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">No Quests in this Category</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Awaken a new habit quest to start accumulating XP and level up your Hunter attributes.
              </p>
            </div>
            <Button
              variant="glow-purple"
              size="sm"
              onClick={() => {
                setEditingHabit(null);
                setModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create First Quest
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={handleToggleHabit}
                onEdit={(h) => {
                  setEditingHabit(h);
                  setModalOpen(true);
                }}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        initialHabit={editingHabit}
      />
    </div>
  );
}
