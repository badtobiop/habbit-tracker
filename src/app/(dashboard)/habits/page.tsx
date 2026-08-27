'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { HabitCard } from '@/components/dashboard/HabitCard';
import { HabitModal } from '@/components/dashboard/HabitModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Habit } from '@/types';
import { useToast } from '@/components/common/ToastContext';
import { Plus, Search, Filter, CheckSquare, Sparkles, Flame } from 'lucide-react';
import { getLocalDateString } from '@/lib/utils';

export default function HabitsPage() {
  const { updateUserLocally, triggerLevelUp } = useDashboard();
  const { showToast, showXP } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleToggleHabit = async (habitId: string) => {
    const target = habits.find((h) => h.id === habitId);
    if (!target) return;
    const today = getLocalDateString();

    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, completed_date: today }),
      });

      const data = await res.json();
      if (res.ok) {
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

        updateUserLocally({
          xp: data.xp,
          level: data.level,
          current_streak: data.current_streak,
          best_streak: data.best_streak,
          total_completions: data.total_completions,
        });

        if (data.is_completed) {
          showXP(data.xp_earned, `${target.name} Completed!`);
          if (data.leveled_up) triggerLevelUp(data.level);
        }
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update habit' });
    }
  };

  const handleSave = async (habitData: Partial<Habit>) => {
    try {
      if (editingHabit) {
        const res = await fetch(`/api/habits/${editingHabit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData),
        });
        if (res.ok) {
          showToast({ type: 'success', title: 'Quest Updated', message: 'Habit directives saved.' });
          fetchHabits();
        }
      } else {
        const res = await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData),
        });
        if (res.ok) {
          showToast({ type: 'success', title: 'New Quest Awakened', message: 'Added to your daily list.' });
          fetchHabits();
        }
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to save habit' });
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit quest?')) return;
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast({ type: 'info', title: 'Quest Removed', message: 'Habit deleted.' });
        fetchHabits();
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete' });
    }
  };

  const baseCategories = ['All', 'Coding', 'Fitness', 'Study', 'Health', 'Mindset', 'Discipline'];
  const customCats = Array.from(new Set(habits.map((h) => h.category))).filter((c) => Boolean(c) && !baseCategories.includes(c));
  const categories = [...baseCategories, ...customCats];

  const filtered = habits.filter((h) => {
    const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-purple-400" />
            <span>Habit Quest Codex</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your complete arsenal of daily discipline habits and reward tiers.
          </p>
        </div>

        <Button
          variant="glow-purple"
          onClick={() => {
            setEditingHabit(null);
            setModalOpen(true);
          }}
          className="font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Awaken New Quest
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search habits by keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-cyber-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
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
      </div>

      {/* Habits Grid */}
      {filtered.length === 0 ? (
        <Card glow="none" className="p-16 text-center space-y-4 border-dashed border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-3xl">
            📜
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-heading">No Habits Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery ? 'No habits match your search query.' : 'You haven’t created any quests in this category yet.'}
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
            Create Quest
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggleHabit}
              onEdit={(h) => {
                setEditingHabit(h);
                setModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <HabitModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSave}
        initialHabit={editingHabit}
      />
    </div>
  );
}
