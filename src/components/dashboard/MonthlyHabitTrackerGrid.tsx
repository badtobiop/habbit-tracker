'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Habit } from '@/types';
import { useDashboard } from '@/context/DashboardContext';
import { useToast } from '@/components/common/ToastContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HabitModal } from '@/components/dashboard/HabitModal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Check,
  Edit2,
  Trash2,
  RefreshCw,
  Trophy,
  Moon,
} from 'lucide-react';
import { getLocalDateString, playAnimeSound } from '@/lib/utils';

interface DayInfo {
  dayNumber: number;
  dateStr: string;
  dayOfWeek: string;
  shortDay: string;
  weekIndex: number;
  completedCount: number;
  incompleteCount: number;
}

interface WeekInfo {
  weekNumber: number;
  label: string;
  startDay: number;
  endDay: number;
  days: DayInfo[];
  totalPossible: number;
  totalCompleted: number;
  totalIncomplete: number;
  percentage: number;
  color: string;
}

interface HabitStat {
  habitId: string;
  completedCount: number;
  goal: number;
  progressPercentage: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEK_THEMES = [
  {
    weekLabel: 'Week 1',
    headerBg: 'bg-gradient-to-r from-amber-600/90 to-amber-700/90',
    headerBorder: 'border-amber-400/40',
    textMain: 'text-amber-400',
    boxChecked: 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 text-white shadow-sm shadow-amber-500/40',
    donutFill: '#f59e0b',
    donutTrack: '#451a03',
  },
  {
    weekLabel: 'Week 2',
    headerBg: 'bg-gradient-to-r from-sky-600/90 to-blue-700/90',
    headerBorder: 'border-sky-400/40',
    textMain: 'text-sky-400',
    boxChecked: 'bg-gradient-to-br from-sky-500 to-blue-600 border-sky-400 text-white shadow-sm shadow-sky-500/40',
    donutFill: '#38bdf8',
    donutTrack: '#082f49',
  },
  {
    weekLabel: 'Week 3',
    headerBg: 'bg-gradient-to-r from-cyan-600/90 to-teal-700/90',
    headerBorder: 'border-cyan-400/40',
    textMain: 'text-cyan-400',
    boxChecked: 'bg-gradient-to-br from-cyan-500 to-teal-600 border-cyan-400 text-white shadow-sm shadow-cyan-500/40',
    donutFill: '#06b6d4',
    donutTrack: '#164e63',
  },
  {
    weekLabel: 'Week 4',
    headerBg: 'bg-gradient-to-r from-emerald-600/90 to-teal-800/90',
    headerBorder: 'border-emerald-400/40',
    textMain: 'text-emerald-400',
    boxChecked: 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-sm shadow-emerald-500/40',
    donutFill: '#10b981',
    donutTrack: '#064e3b',
  },
  {
    weekLabel: 'Week 5',
    headerBg: 'bg-gradient-to-r from-violet-600/90 to-purple-800/90',
    headerBorder: 'border-violet-400/40',
    textMain: 'text-violet-400',
    boxChecked: 'bg-gradient-to-br from-violet-500 to-purple-600 border-violet-400 text-white shadow-sm shadow-violet-500/40',
    donutFill: '#8b5cf6',
    donutTrack: '#3b0764',
  },
];

// Circular Donut Chart SVG Component
function DonutChart({
  percentage,
  size = 72,
  strokeWidth = 8,
  fillColor = '#38bdf8',
  trackColor = '#0b1836',
  label = '',
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  fillColor?: string;
  trackColor?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validPercentage = Math.min(100, Math.max(0, isNaN(percentage) ? 0 : percentage));
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-70"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
          style={{ filter: `drop-shadow(0 0 5px ${fillColor}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
        <span className="text-[10px] sm:text-xs font-black font-mono tracking-tight text-white drop-shadow">
          {validPercentage.toFixed(0)}%
        </span>
        {label && (
          <span className="text-[8px] text-slate-400 font-mono -mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export function MonthlyHabitTrackerGrid() {
  const { user, updateUserLocally, triggerLevelUp } = useDashboard();
  const { showToast, showXP } = useToast();

  const now = useMemo(() => new Date(), []);
  const todayStr = getLocalDateString();

  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completionsMap, setCompletionsMap] = useState<Record<string, Record<string, boolean>>>({});
  const [days, setDays] = useState<DayInfo[]>([]);
  const [weeks, setWeeks] = useState<WeekInfo[]>([]);
  const [habitStats, setHabitStats] = useState<HabitStat[]>([]);
  const [summary, setSummary] = useState({
    totalHabitsCount: 0,
    totalMonthPossible: 0,
    totalMonthCompleted: 0,
    totalMonthIncomplete: 0,
    monthPercentage: 0,
  });

  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Selected Week Filter: 'all' or week index (0..4)
  const [activeWeekFilter, setActiveWeekFilter] = useState<'all' | number>('all');

  // Fetch matrix data from /api/matrix
  const fetchMatrix = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/matrix?year=${currentYear}&month=${currentMonth}`);
      const data = await res.json();
      if (data.success) {
        setHabits(data.habits || []);
        setCompletionsMap(data.completionsMap || {});
        setDays(data.days || []);
        setWeeks(data.weeks || []);
        setHabitStats(data.habitStats || []);
        setSummary(data.summary || {
          totalHabitsCount: 0,
          totalMonthPossible: 0,
          totalMonthCompleted: 0,
          totalMonthIncomplete: 0,
          monthPercentage: 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch habit matrix:', err);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setActiveWeekFilter('all');
  };

  // Toggle habit on a specific date
  const handleToggleCell = async (habitId: string, dateStr: string) => {
    const targetHabit = habits.find((h) => h.id === habitId);
    if (!targetHabit) return;

    const currentStatus = Boolean(completionsMap[habitId]?.[dateStr]);
    const nextStatus = !currentStatus;

    // Optimistic UI update
    setCompletionsMap((prev) => {
      const copy = { ...prev };
      if (!copy[habitId]) copy[habitId] = {};
      copy[habitId] = { ...copy[habitId], [dateStr]: nextStatus };
      return copy;
    });

    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit_id: habitId,
          completed_date: dateStr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCompletionsMap((prev) => {
          const copy = { ...prev };
          if (copy[habitId]) copy[habitId][dateStr] = currentStatus;
          return copy;
        });
        showToast({ type: 'error', title: 'Error', message: data.error || 'Failed to update habit' });
        return;
      }

      updateUserLocally({
        xp: data.xp,
        level: data.level,
        current_streak: data.current_streak,
        best_streak: data.best_streak,
        total_completions: data.total_completions,
      });

      if (data.is_completed) {
        playAnimeSound('amaterasu_flame');
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
      }

      fetchMatrix();
    } catch (err) {
      showToast({ type: 'error', title: 'Network Error', message: 'Failed to record completion' });
      fetchMatrix();
    }
  };

  // Habit modal create/edit
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
          showToast({ type: 'success', title: 'Quest Updated', message: 'Habit directives saved.' });
          fetchMatrix();
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
          fetchMatrix();
        }
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to save habit' });
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to remove this habit quest from your matrix?')) return;
    try {
      const res = await fetch(`/api/habits/${habitId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast({ type: 'info', title: 'Quest Removed', message: 'Habit deleted from tracker.' });
        fetchMatrix();
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to delete habit' });
    }
  };

  const categories = useMemo(() => {
    const base = ['All', 'Coding', 'Fitness', 'Study', 'Health', 'Mindset', 'Discipline'];
    const custom = Array.from(new Set(habits.map((h) => h.category))).filter((c) => Boolean(c) && !base.includes(c));
    return [...base, ...custom];
  }, [habits]);

  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'All') return habits;
    return habits.filter((h) => h.category === selectedCategory);
  }, [habits, selectedCategory]);

  const displayedDays = useMemo(() => {
    if (activeWeekFilter === 'all') return days;
    return days.filter((d) => d.weekIndex === activeWeekFilter);
  }, [days, activeWeekFilter]);

  const displayedWeeks = useMemo(() => {
    if (activeWeekFilter === 'all') return weeks;
    return weeks.filter((w, idx) => idx === activeWeekFilter);
  }, [weeks, activeWeekFilter]);

  return (
    <div className="space-y-4">
      {/* Top Banner: Title & Controls */}
      <div className="rounded-2xl bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-sky-500/30 p-4 sm:p-5 shadow-xl backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-400/40 text-[10px] sm:text-[11px] font-mono font-bold text-sky-300 uppercase tracking-widest flex items-center gap-1.5 shadow-glow-cyan">
                <Moon className="w-3 h-3 text-sky-300 animate-pulse" />
                Lunar Habit Tracker Grid
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                • {habits.length} Habits Active
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-heading tracking-tight flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-cyan-300">
                ({MONTH_NAMES[currentMonth - 1].toUpperCase()}) {currentYear} HABIT TRACKER
              </span>
            </h1>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* Month Switcher */}
            <div className="flex items-center gap-1 bg-ocean-950/90 border border-sky-500/30 p-1 rounded-xl shadow-lg backdrop-blur-md">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
                className="p-1.5 border-sky-500/30 text-sky-300 hover:text-white hover:bg-sky-950/60 rounded-lg"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>

              <div className="px-3 py-1 text-xs sm:text-sm font-black text-white font-mono min-w-[125px] text-center tracking-wide">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="p-1.5 border-sky-500/30 text-sky-300 hover:text-white hover:bg-sky-950/60 rounded-lg"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToCurrentMonth}
              className="border-sky-500/30 text-sky-200 hover:text-white bg-ocean-950/80 rounded-xl text-xs font-mono font-semibold"
            >
              Today
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMatrix()}
              className="p-2 border-sky-500/30 text-sky-300 hover:text-white bg-ocean-950/80 rounded-xl"
              title="Refresh Matrix"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="glow-cyan"
              size="sm"
              onClick={() => {
                setEditingHabit(null);
                setModalOpen(true);
              }}
              className="font-bold bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 border-sky-400/50 shadow-glow-cyan text-xs rounded-xl px-3.5 py-2"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              New Quest
            </Button>
          </div>
        </div>

        {/* Toolbar: Category Filter & View Segments */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 mt-3.5 border-t border-sky-500/15 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider mr-1 shrink-0">
              Filter:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl whitespace-nowrap font-medium border transition-all cursor-pointer text-[11px] ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-glow-cyan font-bold'
                      : 'bg-ocean-950/60 border-ocean-700/60 text-slate-400 hover:text-white hover:border-sky-500/40'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Week Segments (1-click focus on any week or full month) */}
          <div className="flex items-center gap-1 bg-ocean-950/90 p-1 rounded-xl border border-sky-500/25 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveWeekFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                activeWeekFilter === 'all'
                  ? 'bg-sky-600 text-white shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Month (31 Days)
            </button>
            {weeks.map((w, idx) => (
              <button
                key={w.weekNumber}
                onClick={() => setActiveWeekFilter(idx)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  activeWeekFilter === idx
                    ? 'bg-sky-600 text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                W{w.weekNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Habit Tracker Table - Right-Angled Checkboxes & 100% Widescreen Fit */}
      <Card glow="cyan" className="p-2 sm:p-3 bg-ocean-900/80 border-sky-500/30 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto" />
            <div className="text-xs font-mono text-sky-300 uppercase tracking-widest">
              Loading Habit Tracker...
            </div>
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="py-14 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-ocean-800/80 border border-sky-500/30 flex items-center justify-center mx-auto text-2xl shadow-glow-cyan">
              🌙
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">No Habit Quests in this Category</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Awaken a habit quest to start tracking daily checkmarks across the entire month.
              </p>
            </div>
            <Button
              variant="glow-cyan"
              size="sm"
              onClick={() => {
                setEditingHabit(null);
                setModalOpen(true);
              }}
              className="bg-sky-500 hover:bg-sky-400 font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create First Quest
            </Button>
          </div>
        ) : (
          <div className="w-full overflow-x-auto lg:overflow-visible">
            <table className="w-full table-fixed border-collapse text-left min-w-[780px] lg:min-w-0">
              {/* Column Width Proportion: Left Habit ~16%, Day Columns ~2.2% each, Goal ~4.5%, Progress ~11% */}
              <colgroup>
                <col className="w-[16%] min-w-[130px]" />
                {displayedDays.map((d) => (
                  <col key={`col-${d.dateStr}`} style={{ width: `${68.5 / displayedDays.length}%` }} />
                ))}
                <col className="w-[4.5%] min-w-[38px]" />
                <col className="w-[11%] min-w-[85px]" />
              </colgroup>

              {/* 1. Header Rows */}
              <thead>
                {/* Week Header Row */}
                <tr>
                  <th
                    rowSpan={3}
                    className="p-1.5 sm:p-2 bg-ocean-950/95 border-b-2 border-r-2 border-sky-500/40 text-[10px] sm:text-xs font-mono uppercase tracking-wider font-bold text-sky-300"
                  >
                    <div className="flex items-center justify-between">
                      <span>Habits</span>
                      <span className="text-[9px] text-slate-400 font-normal">({filteredHabits.length})</span>
                    </div>
                  </th>

                  {displayedWeeks.map((week, idx) => {
                    const theme = WEEK_THEMES[(activeWeekFilter === 'all' ? idx : (activeWeekFilter as number)) % WEEK_THEMES.length];
                    return (
                      <th
                        key={week.weekNumber}
                        colSpan={week.days.length}
                        className={`p-1 text-center text-[10px] sm:text-[11px] font-black font-heading uppercase tracking-wider text-white border-b border-r ${theme.headerBg} ${theme.headerBorder} shadow-sm`}
                      >
                        {week.label}
                      </th>
                    );
                  })}

                  <th
                    rowSpan={3}
                    className="p-1 text-center bg-ocean-950/95 border-b-2 border-l-2 border-sky-500/40 text-[10px] font-mono uppercase font-bold text-sky-300"
                  >
                    Goal
                  </th>
                  <th
                    rowSpan={3}
                    className="p-1 text-center bg-ocean-950/95 border-b-2 border-sky-500/40 text-[10px] font-mono uppercase font-bold text-sky-300"
                  >
                    Progress
                  </th>
                </tr>

                {/* Date Numbers Row */}
                <tr>
                  {displayedDays.map((day) => {
                    const isToday = day.dateStr === todayStr;

                    return (
                      <th
                        key={`date-${day.dateStr}`}
                        className={`p-0.5 sm:p-1 text-center text-[9px] sm:text-[11px] font-mono font-bold border-b border-r border-ocean-700/60 ${
                          isToday
                            ? 'bg-sky-400 text-ocean-950 font-black shadow-glow-cyan'
                            : 'bg-ocean-900/90 text-slate-200'
                        }`}
                      >
                        {day.dayNumber}
                      </th>
                    );
                  })}
                </tr>

                {/* Day Abbreviations Row (M, T, W...) */}
                <tr className="border-b-2 border-sky-500/40">
                  {displayedDays.map((day) => {
                    const isToday = day.dateStr === todayStr;
                    const isWeekend = day.dayOfWeek === 'Sun' || day.dayOfWeek === 'Sat';

                    return (
                      <th
                        key={`dayname-${day.dateStr}`}
                        className={`p-0.5 text-center text-[8px] sm:text-[9px] font-mono border-r border-ocean-700/60 ${
                          isToday
                            ? 'bg-sky-500/30 text-sky-200 font-bold'
                            : isWeekend
                            ? 'bg-ocean-950/90 text-sky-400 font-semibold'
                            : 'bg-ocean-950/80 text-slate-400'
                        }`}
                      >
                        {day.shortDay}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* 2. Habit Rows with Accurate Right-Angled Square Checkboxes */}
              <tbody className="divide-y divide-ocean-800/60">
                {filteredHabits.map((habit) => {
                  const stat = habitStats.find((s) => s.habitId === habit.id);
                  const completedCount = stat?.completedCount || 0;
                  const goal = stat?.goal || days.length;
                  const progressPct = stat?.progressPercentage || 0;

                  return (
                    <tr
                      key={habit.id}
                      className="hover:bg-sky-950/20 transition-colors group select-none"
                    >
                      {/* Left: Habit Name */}
                      <td className="p-1.5 sm:p-2 bg-ocean-950/95 border-r-2 border-sky-500/30">
                        <div className="flex items-center justify-between gap-1">
                          <div className="min-w-0 flex-1 truncate">
                            <span className="text-[11px] sm:text-xs font-bold text-white font-heading truncate block group-hover:text-sky-200">
                              {habit.name}
                            </span>
                            <span className="text-[8px] sm:text-[9px] text-sky-400/80 font-mono">
                              {habit.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingHabit(habit);
                                setModalOpen(true);
                              }}
                              className="p-0.5 rounded hover:bg-ocean-800 text-slate-400 hover:text-sky-300 cursor-pointer"
                              title="Edit Quest"
                            >
                              <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHabit(habit.id)}
                              className="p-0.5 rounded hover:bg-red-950/50 text-slate-400 hover:text-red-400 cursor-pointer"
                              title="Delete Quest"
                            >
                              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Day Checkboxes: Accurate Right-Angled Squares (rounded-[2px]) */}
                      {displayedDays.map((day) => {
                        const isChecked = Boolean(completionsMap[habit.id]?.[day.dateStr]);
                        const isToday = day.dateStr === todayStr;
                        const theme = WEEK_THEMES[day.weekIndex % WEEK_THEMES.length];

                        return (
                          <td
                            key={`${habit.id}-${day.dateStr}`}
                            onClick={() => handleToggleCell(habit.id, day.dateStr)}
                            className={`p-0.5 text-center border-r border-ocean-800/40 cursor-pointer transition-colors ${
                              isToday ? 'bg-sky-500/10' : ''
                            } hover:bg-sky-500/25`}
                          >
                            <div className="flex items-center justify-center p-0.5">
                              <div
                                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-[2px] border-[1.5px] flex items-center justify-center transition-all ${
                                  isChecked
                                    ? `${theme.boxChecked} scale-105`
                                    : 'border-ocean-600/80 bg-ocean-950/90 hover:border-sky-400'
                                }`}
                              >
                                {isChecked && (
                                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3.5] text-white" />
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}

                      {/* Right: Goal */}
                      <td className="p-1 text-center bg-ocean-950/80 border-l-2 border-ocean-700/60 font-mono text-[10px] sm:text-xs font-bold text-slate-300">
                        {goal}
                      </td>

                      {/* Right: Progress Bar & Fraction */}
                      <td className="p-1 sm:p-1.5 bg-ocean-950/80 border-r border-ocean-700/60">
                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono font-bold">
                            <span className="text-sky-300">
                              {completedCount} <span className="text-slate-500 font-normal">/{goal}</span>
                            </span>
                            <span className="text-slate-300">
                              {progressPct.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-1 sm:h-1.5 bg-ocean-950 rounded-full overflow-hidden border border-sky-500/20">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400"
                              style={{ width: `${Math.min(100, progressPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* 3. Summary Statistics Rows (Aligned under columns) */}
              <tfoot className="border-t-2 border-sky-500/40 bg-ocean-950/95 font-mono text-[10px] sm:text-xs">
                {/* Row 1: Habits Completed Daily */}
                <tr className="border-b border-ocean-800/80">
                  <td className="p-1.5 sm:p-2 bg-ocean-950 border-r-2 border-sky-500/30 font-bold text-white uppercase text-[9px] sm:text-[10px] tracking-wider truncate">
                    Completed
                  </td>
                  {displayedDays.map((day) => (
                    <td
                      key={`sum-comp-${day.dateStr}`}
                      className={`p-0.5 text-center font-bold border-r border-ocean-800/40 text-[9px] sm:text-[10px] ${
                        day.completedCount > 0 ? 'text-sky-300 bg-sky-950/30' : 'text-slate-500'
                      }`}
                    >
                      {day.completedCount}
                    </td>
                  ))}
                  <td className="p-1 text-center font-black text-sky-300 bg-ocean-900 border-l-2 border-ocean-700/60 text-[10px] sm:text-xs">
                    {summary.totalMonthCompleted}
                  </td>
                  <td className="p-1 text-center font-mono text-slate-400 bg-ocean-900 text-[9px] sm:text-[10px]">
                    Total Slayed
                  </td>
                </tr>

                {/* Row 2: Habits Incomplete Daily */}
                <tr className="border-b border-ocean-800/80">
                  <td className="p-1.5 sm:p-2 bg-ocean-950 border-r-2 border-sky-500/30 font-bold text-slate-400 uppercase text-[9px] sm:text-[10px] tracking-wider truncate">
                    Incomplete
                  </td>
                  {displayedDays.map((day) => (
                    <td
                      key={`sum-incomp-${day.dateStr}`}
                      className="p-0.5 text-center font-semibold text-slate-400 border-r border-ocean-800/40 text-[9px] sm:text-[10px]"
                    >
                      {day.incompleteCount}
                    </td>
                  ))}
                  <td className="p-1 text-center font-bold text-slate-400 bg-ocean-900 border-l-2 border-ocean-700/60 text-[10px] sm:text-xs">
                    {summary.totalMonthIncomplete}
                  </td>
                  <td className="p-1 text-center font-mono text-slate-400 bg-ocean-900 text-[9px] sm:text-[10px]">
                    Total Left
                  </td>
                </tr>

                {/* Row 3: Weekly Completed */}
                <tr className="border-b border-ocean-800/80 bg-ocean-900/60">
                  <td className="p-1.5 sm:p-2 bg-ocean-950 border-r-2 border-sky-500/30 font-bold text-sky-300 uppercase text-[9px] sm:text-[10px] tracking-wider truncate">
                    Weekly Done
                  </td>
                  {displayedWeeks.map((week, idx) => {
                    const theme = WEEK_THEMES[(activeWeekFilter === 'all' ? idx : (activeWeekFilter as number)) % WEEK_THEMES.length];
                    return (
                      <td
                        key={`wk-comp-${week.weekNumber}`}
                        colSpan={week.days.length}
                        className={`p-1 text-center font-black text-[10px] sm:text-xs border-r border-ocean-700/60 ${theme.textMain}`}
                      >
                        {week.totalCompleted}
                      </td>
                    );
                  })}
                  <td colSpan={2} className="p-1 text-center text-slate-400 font-mono bg-ocean-900 text-[9px] sm:text-[10px]">
                    Monthly Total
                  </td>
                </tr>

                {/* Row 4: Weekly Incomplete */}
                <tr className="border-b-2 border-sky-500/40 bg-ocean-900/60">
                  <td className="p-1.5 sm:p-2 bg-ocean-950 border-r-2 border-sky-500/30 font-bold text-slate-400 uppercase text-[9px] sm:text-[10px] tracking-wider truncate">
                    Weekly Left
                  </td>
                  {displayedWeeks.map((week) => (
                    <td
                      key={`wk-incomp-${week.weekNumber}`}
                      colSpan={week.days.length}
                      className="p-1 text-center font-bold text-slate-400 border-r border-ocean-700/60 text-[9px] sm:text-[10px]"
                    >
                      {week.totalIncomplete}
                    </td>
                  ))}
                  <td colSpan={2} className="p-1 text-center text-slate-400 font-mono bg-ocean-900 text-[9px] sm:text-[10px]">
                    Target: {summary.totalMonthPossible}
                  </td>
                </tr>

                {/* Row 5: Circular Donut Charts aligned directly below each week */}
                <tr className="bg-ocean-950/95">
                  <td className="p-2 bg-ocean-950 border-r-2 border-sky-500/30 align-middle">
                    <div className="space-y-0.5">
                      <div className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider font-heading flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-sky-400" />
                        <span>Weekly %</span>
                      </div>
                      <div className="text-[8px] sm:text-[9px] text-slate-400 font-sans">
                        Completion rings
                      </div>
                    </div>
                  </td>

                  {/* 5 Weekly Donut Rings */}
                  {displayedWeeks.map((week, idx) => {
                    const theme = WEEK_THEMES[(activeWeekFilter === 'all' ? idx : (activeWeekFilter as number)) % WEEK_THEMES.length];
                    return (
                      <td
                        key={`donut-${week.weekNumber}`}
                        colSpan={week.days.length}
                        className="p-1.5 sm:p-2 text-center border-r border-ocean-700/60 align-middle"
                      >
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <DonutChart
                            percentage={week.percentage}
                            size={activeWeekFilter === 'all' ? 56 : 76}
                            strokeWidth={activeWeekFilter === 'all' ? 6 : 8}
                            fillColor={theme.donutFill}
                            trackColor={theme.donutTrack}
                            label={week.label}
                          />
                          <div className="text-center">
                            <span className={`text-[9px] sm:text-[10px] font-black font-mono ${theme.textMain}`}>
                              {week.percentage.toFixed(1)}%
                            </span>
                            <div className="text-[7px] sm:text-[8px] text-slate-400 font-mono">
                              {week.totalCompleted}/{week.totalPossible}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}

                  {/* Monthly Total Donut Ring on Bottom Right */}
                  <td colSpan={2} className="p-1.5 sm:p-2 text-center bg-ocean-900/90 border-l-2 border-sky-500/30 align-middle">
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <span className="text-[9px] sm:text-[10px] font-black font-heading text-white uppercase tracking-wider flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-sky-300" />
                        Month Total
                      </span>
                      <DonutChart
                        percentage={summary.monthPercentage}
                        size={activeWeekFilter === 'all' ? 64 : 80}
                        strokeWidth={activeWeekFilter === 'all' ? 7 : 9}
                        fillColor="#38bdf8"
                        trackColor="#082f49"
                        label="Overall"
                      />
                      <div className="text-center">
                        <span className="text-[10px] sm:text-xs font-black font-mono text-sky-300 drop-shadow">
                          {summary.monthPercentage.toFixed(1)}%
                        </span>
                        <div className="text-[8px] text-slate-300 font-mono">
                          {summary.totalMonthCompleted}/{summary.totalMonthPossible}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

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
