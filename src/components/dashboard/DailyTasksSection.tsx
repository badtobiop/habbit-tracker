'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DailyTask, TaskPriority } from '@/types';
import { useDashboard } from '@/context/DashboardContext';
import { useToast } from '@/components/common/ToastContext';
import { DailyTaskModal } from './DailyTaskModal';
import {
  getLocalDateString,
  format12HourTime,
  playAnimeSound,
  cn,
} from '@/lib/utils';
import {
  ListTodo,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  AlertTriangle,
  Edit2,
  Trash2,
  Sparkles,
  SunMedium,
  Check,
  CalendarClock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

function getTomorrowDateString(todayStr: string): string {
  const [y, m, d] = todayStr.split('-').map(Number);
  const tomorrow = new Date(y, m - 1, d);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type FilterType = 'all' | 'today' | 'tomorrow' | 'upcoming' | 'completed';

export function DailyTasksSection() {
  const { refreshUser } = useDashboard();
  const { showToast, showXP } = useToast();

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<DailyTask | null>(null);

  // Quick inline add state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTarget, setQuickTarget] = useState<'today' | 'tomorrow'>('tomorrow');
  const [quickTime, setQuickTime] = useState('09:00');
  const [quickLoading, setQuickLoading] = useState(false);

  const todayStr = useMemo(() => getLocalDateString(), []);
  const tomorrowStr = useMemo(() => getTomorrowDateString(todayStr), [todayStr]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to load daily tasks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Computed counts & groups
  const {
    todayTasks,
    tomorrowTasks,
    upcomingTasks,
    completedTasks,
    pendingTasks,
  } = useMemo(() => {
    const today: DailyTask[] = [];
    const tomorrow: DailyTask[] = [];
    const upcoming: DailyTask[] = [];
    const completed: DailyTask[] = [];
    const pending: DailyTask[] = [];

    for (const t of tasks) {
      if (t.is_completed) {
        completed.push(t);
      } else {
        pending.push(t);
        if (t.target_date === todayStr) {
          today.push(t);
        } else if (t.target_date === tomorrowStr) {
          tomorrow.push(t);
        } else if (t.target_date > tomorrowStr) {
          upcoming.push(t);
        }
      }
    }

    return {
      todayTasks: today,
      tomorrowTasks: tomorrow,
      upcomingTasks: upcoming,
      completedTasks: completed,
      pendingTasks: pending,
    };
  }, [tasks, todayStr, tomorrowStr]);

  // Filtered task display list
  const displayTasks = useMemo(() => {
    switch (activeFilter) {
      case 'today':
        return tasks.filter((t) => t.target_date === todayStr);
      case 'tomorrow':
        return tasks.filter((t) => t.target_date === tomorrowStr);
      case 'upcoming':
        return tasks.filter((t) => t.target_date > tomorrowStr && !t.is_completed);
      case 'completed':
        return tasks.filter((t) => t.is_completed);
      case 'all':
      default:
        return tasks;
    }
  }, [tasks, activeFilter, todayStr, tomorrowStr]);

  // Earliest tomorrow task for briefing banner
  const earliestTomorrowTask = useMemo(() => {
    if (tomorrowTasks.length === 0) return null;
    const sorted = [...tomorrowTasks].sort((a, b) => {
      const tA = a.target_time || '23:59';
      const tB = b.target_time || '23:59';
      return tA.localeCompare(tB);
    });
    return sorted[0];
  }, [tomorrowTasks]);

  // Handle task completion toggle
  const handleToggleTask = async (task: DailyTask) => {
    const nextCompleted = !task.is_completed;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              is_completed: nextCompleted,
              completed_at: nextCompleted ? new Date().toISOString() : null,
            }
          : t
      )
    );

    if (nextCompleted) {
      // Anime audio & celebration
      playAnimeSound('quest_complete');
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#38bdf8', '#818cf8', '#34d399', '#f59e0b'],
        });
      } catch (_) {}
      showXP(15, `Completed: ${task.title}`);
    }

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: nextCompleted }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? data.task : t)));
        refreshUser();
      } else {
        // Revert on failure
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        showToast({ type: 'error', title: 'Update failed', message: data.error });
      }
    } catch (err: any) {
      // Revert on network failure
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      showToast({ type: 'error', title: 'Network Error', message: err.message });
    }
  };

  // Quick inline add
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setQuickLoading(true);
    const targetDate = quickTarget === 'tomorrow' ? tomorrowStr : todayStr;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quickTitle.trim(),
          target_date: targetDate,
          target_time: quickTime,
          priority: 'medium',
          category: 'Personal',
        }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        playAnimeSound('quest_complete');
        showToast({
          type: 'success',
          title: 'Mission Scheduled',
          message: `Queued for ${quickTarget === 'tomorrow' ? 'Tomorrow' : 'Today'}!`,
        });
        setTasks((prev) => [...prev, data.task]);
        setQuickTitle('');
      } else {
        showToast({ type: 'error', title: 'Failed to create task', message: data.error });
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setQuickLoading(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Delete mission "${title}"?`)) return;

    // Optimistic removal
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast({ type: 'info', title: 'Task Removed', message: `Deleted "${title}"` });
      } else {
        fetchTasks();
        showToast({ type: 'error', title: 'Delete Failed', message: data.error });
      }
    } catch (err: any) {
      fetchTasks();
      showToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleOpenAddModal = (date?: string) => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: DailyTask) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleTaskSaved = (savedTask: DailyTask, isNew: boolean) => {
    if (isNew) {
      setTasks((prev) => [...prev, savedTask]);
    } else {
      setTasks((prev) => prev.map((t) => (t.id === savedTask.id ? savedTask : t)));
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            URGENT
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-950/80 text-sky-300 border border-sky-500/40">
            NORMAL
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-850 text-slate-300 border border-slate-700">
            LOW
          </span>
        );
    }
  };

  const getDateBadge = (targetDate: string, isCompleted: boolean) => {
    if (targetDate === tomorrowStr) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/40 shadow-glow-gold">
          <Flame className="w-3 h-3 text-amber-400 fill-amber-400" /> Tomorrow (Kal)
        </span>
      );
    }
    if (targetDate === todayStr) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-400/40 shadow-glow-cyan">
          <SunMedium className="w-3 h-3 text-sky-400" /> Today
        </span>
      );
    }
    if (targetDate < todayStr && !isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <AlertTriangle className="w-3 h-3 text-rose-400" /> Overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-ocean-800/80 text-slate-300 border border-sky-500/20">
        <Calendar className="w-3 h-3 text-slate-400" /> {targetDate}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Main Header Card */}
      <Card glow="cyan" className="p-5 sm:p-6 bg-[#040814]/85 border-sky-500/35 backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-500/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-teal-400 p-[1px] shadow-glow-cyan">
                <div className="w-full h-full bg-[#040814] rounded-[11px] flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-sky-300" />
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight flex items-center gap-2">
                  DAILY MISSIONS & SCHEDULED TASKS
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-sky-950/90 text-sky-300 border border-sky-500/30">
                    Solo Ops
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-sans">
                  Schedule one-off tasks for tomorrow or today with exact times so you never forget.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Counter Chips & Schedule Button */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="flex items-center gap-2 bg-[#040814]/90 px-3 py-1.5 rounded-xl border border-sky-500/25 text-xs font-mono">
              <span className="text-slate-400">Today:</span>
              <span className="text-sky-300 font-bold">{todayTasks.length} pending</span>
            </div>
            <div className="flex items-center gap-2 bg-[#040814]/90 px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs font-mono shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-slate-400">Tomorrow:</span>
              <span className="text-amber-300 font-bold">{tomorrowTasks.length} queued</span>
            </div>
            <Button
              variant="glow-cyan"
              size="sm"
              onClick={() => handleOpenAddModal()}
              className="gap-1.5 font-bold"
            >
              <Plus className="w-4 h-4" /> Schedule Mission
            </Button>
          </div>
        </div>

        {/* 2. Tomorrow's Operation Briefing Banner (Shows if there are tomorrow tasks) */}
        {tomorrowTasks.length > 0 && (
          <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-ocean-950/60 to-[#040814]/80 border border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-glow-gold">
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200 font-heading flex items-center gap-2">
                  Tomorrow's Operation Briefing (Kal Ki Taiyari)
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
                    {tomorrowTasks.length} Mission{tomorrowTasks.length > 1 ? 's' : ''} Ready
                  </span>
                </h4>
                <p className="text-xs text-slate-300">
                  First mission scheduled: <strong className="text-white font-medium">{earliestTomorrowTask?.title}</strong>
                  {earliestTomorrowTask?.target_time ? (
                    <span className="text-amber-300 font-mono"> at {format12HourTime(earliestTomorrowTask.target_time)}</span>
                  ) : ''}. Rest easy tonight, your schedule is prepared!
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveFilter('tomorrow')}
              className="border-amber-500/40 text-amber-300 hover:bg-amber-950/40 text-xs shrink-0"
            >
              View Tomorrow's Tasks <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}

        {/* 3. Quick Inline Add Bar */}
        <form onSubmit={handleQuickAdd} className="mt-4 flex flex-col sm:flex-row items-center gap-2 bg-[#040814]/90 p-2 sm:p-2.5 rounded-2xl border border-sky-500/30">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Quick add: e.g. Doctor checkup, Send project report, Call bank (press Enter)..."
            className="flex-1 w-full bg-transparent px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none"
          />

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
            {/* Quick target day toggle: Today vs Tomorrow */}
            <div className="flex rounded-lg bg-sky-950/40 border border-sky-500/25 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setQuickTarget('today')}
                className={`px-2.5 py-1 rounded-md transition ${
                  quickTarget === 'today'
                    ? 'bg-sky-500/30 text-sky-200 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickTarget('tomorrow')}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                  quickTarget === 'tomorrow'
                    ? 'bg-amber-500/30 text-amber-200 font-bold'
                    : 'text-slate-400 hover:text-amber-200'
                }`}
              >
                <Flame className="w-2.5 h-2.5 text-amber-400" /> Tomorrow (Kal)
              </button>
            </div>

            {/* Quick time picker */}
            <div className="flex items-center gap-1 bg-sky-950/40 border border-sky-500/25 px-2 py-1 rounded-lg text-xs font-mono text-sky-200">
              <Clock className="w-3 h-3 text-sky-400" />
              <input
                type="time"
                value={quickTime}
                onChange={(e) => setQuickTime(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={quickLoading}
              disabled={!quickTitle.trim()}
              className="shrink-0 font-bold"
            >
              Add Task
            </Button>
          </div>
        </form>

        {/* 4. Filter Tabs */}
        <div className="mt-5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 select-none border-b border-sky-500/15">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0',
              activeFilter === 'all'
                ? 'bg-sky-500/20 text-sky-200 border border-sky-400/50 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-sky-950/30 border border-transparent'
            )}
          >
            All Tasks
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#040814] border border-sky-500/30">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('today')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0',
              activeFilter === 'today'
                ? 'bg-sky-500/25 text-sky-200 border border-sky-400 shadow-glow-cyan font-bold'
                : 'text-slate-400 hover:text-white hover:bg-sky-950/30 border border-transparent'
            )}
          >
            <SunMedium className="w-3.5 h-3.5 text-sky-400" /> Today
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#040814] border border-sky-500/30">
              {todayTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('tomorrow')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0',
              activeFilter === 'tomorrow'
                ? 'bg-amber-500/25 text-amber-200 border border-amber-400 shadow-glow-gold font-bold'
                : 'text-slate-400 hover:text-amber-200 hover:bg-amber-950/30 border border-transparent'
            )}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Tomorrow (Kal) ⭐
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#040814] border border-amber-500/40 text-amber-300 font-bold">
              {tomorrowTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('upcoming')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0',
              activeFilter === 'upcoming'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-sky-950/30 border border-transparent'
            )}
          >
            <CalendarClock className="w-3.5 h-3.5 text-cyan-400" /> Upcoming
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#040814] border border-sky-500/30">
              {upcomingTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 shrink-0',
              activeFilter === 'completed'
                ? 'bg-teal-500/20 text-teal-200 border border-teal-400/50 shadow-glow-teal'
                : 'text-slate-400 hover:text-white hover:bg-sky-950/30 border border-transparent'
            )}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Completed
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#040814] border border-teal-500/30">
              {completedTasks.length}
            </span>
          </button>
        </div>

        {/* 5. Tasks List / Empty State */}
        <div className="mt-4 space-y-2.5">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400 font-mono text-xs">
              <div className="w-6 h-6 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
              Scanning daily mission log...
            </div>
          ) : displayTasks.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-2xl bg-[#040814]/60 border border-dashed border-sky-500/25 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-950/50 border border-sky-500/30 flex items-center justify-center text-sky-400">
                {activeFilter === 'tomorrow' ? (
                  <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
                ) : (
                  <Sparkles className="w-6 h-6 text-sky-400" />
                )}
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                  {activeFilter === 'tomorrow'
                    ? 'No Special Missions Scheduled for Tomorrow Yet'
                    : activeFilter === 'today'
                    ? 'No Pending Tasks for Today'
                    : activeFilter === 'completed'
                    ? 'No Completed Tasks in this filter'
                    : 'No Missions Scheduled'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeFilter === 'tomorrow'
                    ? 'Write down tasks you need to do tomorrow with their scheduled times so you awaken organized and ready.'
                    : 'Stay disciplined by logging your important one-off tasks in advance.'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddModal(activeFilter === 'tomorrow' ? tomorrowStr : todayStr)}
                className="gap-1.5 font-medium border-sky-500/40 text-sky-300"
              >
                <Plus className="w-3.5 h-3.5" />
                {activeFilter === 'tomorrow' ? 'Schedule Tomorrow\'s Task' : 'Add New Daily Task'}
              </Button>
            </div>
          ) : (
            displayTasks.map((task) => {
              const isUrgent = task.priority === 'urgent';
              const isHigh = task.priority === 'high';

              return (
                <div
                  key={task.id}
                  className={cn(
                    'group relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#040814]/80 backdrop-blur-xl',
                    task.is_completed
                      ? 'border-teal-500/20 opacity-70 bg-[#040814]/40'
                      : isUrgent
                      ? 'border-rose-500/40 hover:border-rose-400 shadow-glow-cyan'
                      : isHigh
                      ? 'border-amber-500/40 hover:border-amber-400'
                      : 'border-sky-500/25 hover:border-sky-400/50'
                  )}
                >
                  {/* Left accent stripe */}
                  <div
                    className={cn(
                      'absolute left-0 top-3 bottom-3 w-1 rounded-r-full',
                      task.is_completed
                        ? 'bg-teal-500/50'
                        : isUrgent
                        ? 'bg-rose-500'
                        : isHigh
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                    )}
                  />

                  {/* Left Section: Checkbox & Info */}
                  <div className="flex items-start sm:items-center gap-3 pl-2 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task)}
                      className={cn(
                        'w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all cursor-pointer mt-0.5 sm:mt-0',
                        task.is_completed
                          ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 border-teal-300 text-[#040814] shadow-glow-teal'
                          : 'bg-[#040814] border-sky-500/40 hover:border-sky-300 text-transparent hover:text-sky-300/40'
                      )}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* Task Title & Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'text-sm font-medium transition',
                            task.is_completed
                              ? 'line-through text-slate-500'
                              : 'text-white font-semibold'
                          )}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        {getPriorityBadge(task.priority)}

                        {/* XP Tag */}
                        <span className="text-[10px] font-mono text-teal-300 bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-500/30">
                          +{task.xp_reward || 15} XP
                        </span>
                      </div>

                      {/* Description Preview */}
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Time, Date Badges & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-11 sm:pl-0">
                    {/* Time Badge (Crucial for "itne baje krna hai") */}
                    {task.target_time && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-sky-950/80 text-sky-200 border border-sky-500/35">
                        <Clock className="w-3.5 h-3.5 text-sky-400" />
                        {format12HourTime(task.target_time)}
                      </span>
                    )}

                    {/* Date Badge (Crucial for "Kal ka task") */}
                    {getDateBadge(task.target_date, task.is_completed)}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 ml-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        title="Edit Mission"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-950/40 border border-transparent hover:border-sky-500/30 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id, task.title)}
                        title="Delete Mission"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Daily Task Creation / Edit Modal */}
      <DailyTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onTaskSaved={handleTaskSaved}
        taskToEdit={taskToEdit}
        defaultDate={activeFilter === 'tomorrow' ? tomorrowStr : todayStr}
      />
    </div>
  );
}
