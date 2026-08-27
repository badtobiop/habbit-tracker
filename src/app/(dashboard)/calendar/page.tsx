'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/common/ToastContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Zap,
  BookOpen,
  Save,
  Smile,
  Lock,
  MinusCircle,
} from 'lucide-react';
import { getLocalDateString, formatReadableDate, playAnimeSound } from '@/lib/utils';
import { Habit } from '@/types';

interface DayData {
  date: string;
  dayNumber: number;
  totalHabits: number;
  completedHabits: number;
  percentage: number;
  isPerfect: boolean;
  xpEarned: number;
  note?: string;
  mood?: string;
}

const MOOD_OPTIONS = [
  { id: 'Victorious', label: '🔥 Victorious', color: 'border-red-500 text-red-300 bg-red-950/60' },
  { id: 'Focused', label: '⚡ Ultra Focused', color: 'border-cyan-500 text-cyan-300 bg-cyan-950/60' },
  { id: 'Challenging', label: '⚔️ Slayed Battle', color: 'border-purple-500 text-purple-300 bg-purple-950/60' },
  { id: 'Grounded', label: '🧘 Calm & Mindful', color: 'border-emerald-500 text-emerald-300 bg-emerald-950/60' },
];

export default function CalendarPage() {
  const { updateUserLocally, triggerLevelUp } = useDashboard();
  const { showToast, showXP } = useToast();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected date for day drilldown modal
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayHabits, setSelectedDayHabits] = useState<Habit[]>([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  // Daily Reflection Note State
  const [dailyNote, setDailyNote] = useState('');
  const [dailyMood, setDailyMood] = useState('Victorious');
  const [savingNote, setSavingNote] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const todayStr = getLocalDateString();

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/calendar?year=${year}&month=${month}`);
      const data = await res.json();
      if (data.success && data.days) {
        setDays(data.days);
      }
    } catch (err) {
      console.error('Failed to fetch calendar:', err);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleSelectDay = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setDrilldownLoading(true);

    try {
      const res = await fetch(`/api/habits?date=${dateStr}`);
      const data = await res.json();
      if (data.success && data.habits) {
        setSelectedDayHabits(data.habits);
      }

      // Check if note exists for this day from already fetched calendar data
      const matchingDay = days.find((d) => d.date === dateStr);
      if (matchingDay) {
        setDailyNote(matchingDay.note || '');
        setDailyMood(matchingDay.mood || 'Victorious');
      } else {
        setDailyNote('');
        setDailyMood('Victorious');
      }
    } catch (err) {
      console.error('Failed to fetch day habits:', err);
    } finally {
      setDrilldownLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedDate) return;
    setSavingNote(true);

    try {
      const res = await fetch('/api/calendar/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          note: dailyNote.trim(),
          mood: dailyMood,
        }),
      });

      if (res.ok) {
        showToast({
          type: 'success',
          title: '📜 Shinobi Note Saved',
          message: 'Your daily reflection is pinned to this calendar day.',
        });

        // Update local days state immediately
        setDays((prev) =>
          prev.map((d) =>
            d.date === selectedDate ? { ...d, note: dailyNote.trim(), mood: dailyMood } : d
          )
        );
      } else {
        showToast({ type: 'error', title: 'Error', message: 'Failed to save note' });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Network error saving note' });
    } finally {
      setSavingNote(false);
    }
  };

  const handleToggleDayHabit = async (habitId: string) => {
    if (!selectedDate) return;

    // Strict Discipline Rule: Past days cannot be retroactively toggled
    if (selectedDate < todayStr) {
      showToast({
        type: 'info',
        title: '⏳ Historical Record (Read-Only)',
        message: 'Habits from previous dates cannot be retroactively modified to keep your streak discipline genuine.',
      });
      return;
    }

    if (selectedDate > todayStr) {
      showToast({
        type: 'info',
        title: '🔮 Future Quest',
        message: 'This quest is scheduled for a future date and can be completed when that day arrives.',
      });
      return;
    }

    try {
      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit_id: habitId,
          completed_date: selectedDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedDayHabits((prev) =>
          prev.map((h) =>
            h.id === habitId ? { ...h, is_completed_today: data.is_completed } : h
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
          playAnimeSound('amaterasu_flame');
          showXP(data.xp_earned, `Quest Completed for Today!`);
          if (data.leveled_up) triggerLevelUp(data.level);
        }

        // Refresh month calendar view
        fetchCalendar();
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to record completion' });
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const emptyPaddingDays = Array.from({ length: firstDayOfMonth });

  const isPastSelectedDate = selectedDate ? selectedDate < todayStr : false;
  const isTodaySelectedDate = selectedDate ? selectedDate === todayStr : false;
  const isFutureSelectedDate = selectedDate ? selectedDate > todayStr : false;

  return (
    <div className="space-y-6">
      {/* Calendar Header & Month Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-red-400 font-mono flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CHRONICLES OF DISCIPLINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight mt-1">
            Shinobi Habit Calendar & Reflection Journal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Track daily quest slays, perfect days, and write personal victory logs for every date.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            className="p-2 border-red-500/40 text-slate-300 hover:text-white bg-black/60 backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="px-4 py-2 rounded-xl bg-black/75 border border-red-500/40 text-sm font-bold text-white font-heading min-w-[160px] text-center shadow-glow-red backdrop-blur-md">
            {monthNames[month - 1]} {year}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            className="p-2 border-red-500/40 text-slate-300 hover:text-white bg-black/60 backdrop-blur-md"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <Card glow="red" className="p-4 sm:p-6 bg-black/65 border-red-500/35 backdrop-blur-xl space-y-4 shadow-xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-mono font-bold text-slate-400 pb-2 border-b border-slate-800">
          <div className="text-red-400">Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-red-400">Sat</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {/* Empty prefix padding */}
          {emptyPaddingDays.map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[85px] sm:min-h-[105px] rounded-xl bg-black/30 border border-transparent opacity-30 pointer-events-none" />
          ))}

          {/* Days */}
          {days.map((day) => {
            const isToday = day.date === todayStr;
            const hasActivity = day.completedHabits > 0;
            const hasNote = Boolean(day.note && day.note.trim());

            return (
              <div
                key={day.date}
                onClick={() => handleSelectDay(day.date)}
                className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-200 group hover:scale-[1.03] hover:z-10 ${
                  isToday
                    ? 'border-red-500 bg-red-950/40 shadow-glow-red ring-1 ring-red-400/50'
                    : day.isPerfect
                    ? 'border-amber-500/50 bg-amber-950/30 shadow-sm'
                    : hasActivity
                    ? 'border-red-500/40 bg-red-950/20'
                    : 'border-slate-800 bg-black/60 hover:border-slate-700'
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isToday
                        ? 'px-1.5 py-0.5 rounded bg-red-600 text-white shadow-glow-red'
                        : 'text-slate-300'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  {day.isPerfect && (
                    <span className="text-[10px]" title="Perfect 100% Day">
                      ⭐
                    </span>
                  )}
                </div>

                {/* Daily Reflection Note Preview Snippet inside Calendar Tile */}
                {hasNote && (
                  <div
                    className="my-1 px-1.5 py-0.5 rounded-lg bg-red-950/80 border border-red-500/40 text-[9px] sm:text-[10px] text-red-200 line-clamp-2 leading-tight font-mono shadow-sm group-hover:border-red-400 transition-colors"
                    title={`Shinobi Note: ${day.note}`}
                  >
                    <span className="text-amber-300 font-bold mr-1">📜</span>
                    {day.note}
                  </div>
                )}

                {/* Progress Indicators */}
                <div className="space-y-1 mt-auto">
                  {day.totalHabits > 0 && (
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
                      <span className={day.isPerfect ? 'text-amber-300 font-bold' : hasActivity ? 'text-red-300' : 'text-slate-500'}>
                        {day.completedHabits}/{day.totalHabits}
                      </span>
                      {day.xpEarned > 0 && (
                        <span className="text-red-400 font-bold hidden sm:inline">
                          +{day.xpEarned} XP
                        </span>
                      )}
                    </div>
                  )}

                  {/* Micro progress bar */}
                  {day.totalHabits > 0 && (
                    <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          day.isPerfect
                            ? 'bg-amber-400 shadow-glow-gold'
                            : hasActivity
                            ? 'bg-red-500 shadow-glow-red'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${day.percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow-gold" />
              <span>⭐ Perfect 100% Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-glow-red" />
              <span>Slayed Quests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-red-500 bg-red-950/60" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📜</span>
              <span>Daily Reflection Note</span>
            </div>
          </div>
          <span className="text-slate-400 font-mono">Tap any date to write notes & view quest logs</span>
        </div>
      </Card>

      {/* Day Details Drilldown & Daily Reflection Note Modal */}
      <Modal
        isOpen={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? `Shinobi Quest Log: ${formatReadableDate(selectedDate)}` : 'Quest Log'}
        subtitle={
          isPastSelectedDate
            ? `Historical record for ${formatReadableDate(selectedDate || '')} • Read-Only Log`
            : isTodaySelectedDate
            ? `Today's Active Mission Log • Interactive Checklist`
            : `Upcoming schedule for ${formatReadableDate(selectedDate || '')}`
        }
        maxWidth="lg"
      >
        <div className="space-y-6">
          {drilldownLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              Loading records for {selectedDate}...
            </div>
          ) : (
            <>
              {/* 1. Daily Quests List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-red-400" />
                    <span>Missions for this Date</span>
                  </h4>
                  {isPastSelectedDate && (
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Historical Record (Past dates locked)
                    </span>
                  )}
                  {isTodaySelectedDate && (
                    <span className="text-[10px] text-red-400 font-mono font-bold animate-pulse">
                      ⚡ Active Today (Tap to Slay)
                    </span>
                  )}
                </div>

                {selectedDayHabits.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 bg-black/50 rounded-xl border border-slate-800 font-mono">
                    No habit quests scheduled for this date.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayHabits.map((h) => {
                      const isCompleted = Boolean(h.is_completed_today);

                      // Click handler only enabled for TODAY
                      const handleClick = () => {
                        handleToggleDayHabit(h.id);
                      };

                      return (
                        <div
                          key={h.id}
                          onClick={handleClick}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all select-none ${
                            isTodaySelectedDate
                              ? isCompleted
                                ? 'bg-red-950/40 border-red-500/60 text-slate-200 shadow-glow-red cursor-pointer'
                                : 'bg-black/75 border-slate-800 hover:border-red-500/50 text-slate-300 cursor-pointer hover:scale-[1.01]'
                              : isPastSelectedDate
                              ? isCompleted
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 cursor-default'
                                : 'bg-black/50 border-slate-800/80 text-slate-400 cursor-default'
                              : 'bg-black/40 border-slate-800/60 text-slate-400 cursor-default'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                                isCompleted
                                  ? isPastSelectedDate
                                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/40'
                                    : 'bg-red-600 text-white shadow-glow-red'
                                  : isPastSelectedDate
                                  ? 'border border-slate-700 bg-black/40 text-slate-500'
                                  : 'border border-slate-700 bg-black/60'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : isPastSelectedDate ? (
                                <MinusCircle className="w-4 h-4 text-slate-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs sm:text-sm font-bold font-heading truncate ${isCompleted ? 'text-white' : 'text-slate-300'}`}>
                                {h.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                {h.category} • {h.difficulty.toUpperCase()}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {isTodaySelectedDate ? (
                              isCompleted ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-500/40 shadow-glow-red">
                                  ✅ Slayed Today
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse">
                                  ⚡ Tap to Complete
                                </span>
                              )
                            ) : isPastSelectedDate ? (
                              isCompleted ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                                  ✅ Slayed on this date
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-black/60 border border-slate-800">
                                  ⏳ Uncompleted Quest
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 bg-black/40 border border-slate-800">
                                🔮 Scheduled
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Daily Reflection Note / Journal Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/65 border border-red-500/35 space-y-3.5 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                    <span className="text-base">📜</span>
                    <span>Daily Reflection & Victory Note</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Appears in calendar tile</span>
                </div>

                {/* Mood selector pills */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 block font-mono">
                    How did you feel conquering today's tasks?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOOD_OPTIONS.map((m) => {
                      const isSelected = dailyMood === m.id;
                      return (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setDailyMood(m.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? `${m.color} shadow-sm scale-105 font-bold`
                              : 'bg-black/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Note Textarea */}
                <div className="space-y-1.5">
                  <textarea
                    rows={3}
                    placeholder="e.g. Completed all daily quests! Great focus on deep work and completed morning workouts without hesitation."
                    value={dailyNote}
                    onChange={(e) => setDailyNote(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/75 border border-red-500/40 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-colors resize-none backdrop-blur-md font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Pitched to {formatReadableDate(selectedDate || '')}
                  </div>
                  <Button
                    variant="glow-purple"
                    size="sm"
                    onClick={handleSaveNote}
                    isLoading={savingNote}
                    className="bg-red-600 hover:bg-red-500 border-red-500/50 text-xs shadow-glow-red cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Note to Calendar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
