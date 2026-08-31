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
  Moon,
  Zap,
  BookOpen,
  Save,
  Lock,
  MinusCircle,
  Trophy,
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
  { id: 'Victorious', label: '🌊 Oceanic Flow', color: 'border-sky-400 text-sky-200 bg-sky-950/80 shadow-glow-cyan' },
  { id: 'Focused', label: '⚡ Deep Focus', color: 'border-cyan-400 text-cyan-200 bg-cyan-950/80' },
  { id: 'Grounded', label: '🌙 Moonlit Calm', color: 'border-teal-400 text-teal-200 bg-teal-950/80' },
  { id: 'StarAscension', label: '🌟 Star Ascension', color: 'border-amber-400 text-amber-200 bg-amber-950/80' },
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
          title: '📜 Lunar Reflection Saved',
          message: 'Your daily victory note is pinned to this calendar date.',
        });

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

    if (selectedDate < todayStr) {
      showToast({
        type: 'info',
        title: '⏳ Historical Record (Read-Only)',
        message: 'Habits from previous dates cannot be retroactively modified to keep streak discipline genuine.',
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

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const emptyPaddingDays = Array.from({ length: firstDayOfMonth });

  const isPastSelectedDate = selectedDate ? selectedDate < todayStr : false;
  const isTodaySelectedDate = selectedDate ? selectedDate === todayStr : false;
  const isFutureSelectedDate = selectedDate ? selectedDate > todayStr : false;

  return (
    <div className="space-y-6">
      {/* Calendar Header & Month Switcher */}
      <div className="rounded-3xl bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border border-sky-500/30 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/40 text-[11px] font-mono font-bold text-sky-300 uppercase tracking-widest flex items-center gap-1.5 shadow-glow-cyan">
                <Moon className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                Chronicles of Lunar Discipline
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
              Moonlit Habit Calendar & Reflection Sanctuary
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans">
              Track daily quest completions, perfect discipline days, and pin personal reflection notes to every calendar date.
            </p>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-2 bg-ocean-950/90 border border-sky-500/30 p-1.5 rounded-2xl shadow-lg backdrop-blur-md self-start lg:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevMonth}
              className="p-2 border-sky-500/30 text-sky-300 hover:text-white hover:bg-sky-950/60 rounded-xl"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="px-4 py-1.5 rounded-xl text-sm font-black text-white font-mono min-w-[150px] text-center tracking-wide">
              {monthNames[month - 1]} {year}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              className="p-2 border-sky-500/30 text-sky-300 hover:text-white hover:bg-sky-950/60 rounded-xl"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <Card glow="cyan" className="p-4 sm:p-6 bg-ocean-900/80 border-sky-500/30 backdrop-blur-2xl space-y-4 shadow-2xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-mono font-bold text-slate-400 pb-2 border-b border-sky-500/20">
          <div className="text-sky-400">Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-sky-400">Sat</div>
        </div>

        {/* Days Matrix */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto" />
            <div className="text-xs font-mono text-sky-300 uppercase tracking-widest">
              Synthesizing Calendar Matrix...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
            {emptyPaddingDays.map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[85px] sm:min-h-[105px] rounded-xl bg-ocean-950/40 border border-transparent opacity-20 pointer-events-none" />
            ))}

            {days.map((day) => {
              const isToday = day.date === todayStr;
              const hasActivity = day.completedHabits > 0;
              const hasNote = Boolean(day.note && day.note.trim());

              return (
                <div
                  key={day.date}
                  onClick={() => handleSelectDay(day.date)}
                  className={`min-h-[85px] sm:min-h-[105px] p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-200 group hover:scale-[1.02] hover:z-10 select-none ${
                    isToday
                      ? 'border-sky-400 bg-sky-950/50 shadow-glow-cyan ring-1 ring-sky-300/60'
                      : day.isPerfect
                      ? 'border-amber-400/50 bg-amber-950/30 shadow-sm'
                      : hasActivity
                      ? 'border-sky-500/40 bg-ocean-950/80 hover:border-sky-400'
                      : 'border-ocean-800/80 bg-ocean-950/60 hover:border-sky-500/40'
                  }`}
                >
                  {/* Date header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? 'px-1.5 py-0.5 rounded bg-sky-400 text-ocean-950 font-black shadow-glow-cyan'
                          : 'text-slate-200'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {day.isPerfect && (
                      <span className="text-[11px]" title="Perfect 100% Day">
                        ⭐
                      </span>
                    )}
                  </div>

                  {/* Daily Reflection Note Preview Snippet inside Calendar Tile */}
                  {hasNote && (
                    <div
                      className="my-1 px-1.5 py-0.5 rounded-lg bg-ocean-900/90 border border-sky-500/40 text-[9px] sm:text-[10px] text-sky-200 line-clamp-2 leading-tight font-mono shadow-sm group-hover:border-sky-300 transition-colors"
                      title={`Reflection Note: ${day.note}`}
                    >
                      <span className="text-amber-300 font-bold mr-1">📜</span>
                      {day.note}
                    </div>
                  )}

                  {/* Progress Indicators */}
                  <div className="space-y-1 mt-auto">
                    {day.totalHabits > 0 && (
                      <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-slate-400">
                        <span className={day.isPerfect ? 'text-amber-300 font-bold' : hasActivity ? 'text-sky-300' : 'text-slate-500'}>
                          {day.completedHabits}/{day.totalHabits}
                        </span>
                        {day.xpEarned > 0 && (
                          <span className="text-sky-300 font-bold hidden sm:inline">
                            +{day.xpEarned} XP
                          </span>
                        )}
                      </div>
                    )}

                    {/* Micro progress bar */}
                    {day.totalHabits > 0 && (
                      <div className="w-full h-1 bg-ocean-950 rounded-full overflow-hidden border border-sky-500/20">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            day.isPerfect
                              ? 'bg-amber-400 shadow-glow-gold'
                              : hasActivity
                              ? 'bg-gradient-to-r from-sky-500 to-cyan-400 shadow-glow-cyan'
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
        )}

        {/* Legend */}
        <div className="pt-3 border-t border-sky-500/20 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow-gold" />
              <span>⭐ Perfect 100% Day</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-glow-cyan" />
              <span>Slayed Quests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border border-sky-400 bg-sky-950/60" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">📜</span>
              <span>Daily Reflection Note</span>
            </div>
          </div>
          <span className="text-slate-400 font-mono">Tap any date to write notes & view mission logs</span>
        </div>
      </Card>

      {/* Day Details Drilldown & Daily Reflection Note Modal */}
      <Modal
        isOpen={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? `Lunar Mission Log: ${formatReadableDate(selectedDate)}` : 'Mission Log'}
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
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span>Missions for this Date</span>
                  </h4>
                  {isPastSelectedDate && (
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      Historical Record (Past dates locked)
                    </span>
                  )}
                  {isTodaySelectedDate && (
                    <span className="text-[10px] text-sky-400 font-mono font-bold animate-pulse">
                      ⚡ Active Today (Tap to Slay)
                    </span>
                  )}
                </div>

                {selectedDayHabits.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 bg-ocean-950/50 rounded-xl border border-sky-500/20 font-mono">
                    No habit quests scheduled for this date.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedDayHabits.map((h) => {
                      const isCompleted = Boolean(h.is_completed_today);

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
                                ? 'bg-sky-950/40 border-sky-400/60 text-slate-200 shadow-glow-cyan cursor-pointer'
                                : 'bg-ocean-950/80 border-ocean-800 hover:border-sky-500/50 text-slate-300 cursor-pointer hover:scale-[1.01]'
                              : isPastSelectedDate
                              ? isCompleted
                                ? 'bg-teal-950/30 border-teal-500/40 text-teal-200 cursor-default'
                                : 'bg-ocean-950/50 border-ocean-800/80 text-slate-400 cursor-default'
                              : 'bg-ocean-950/40 border-ocean-800/60 text-slate-400 cursor-default'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                                isCompleted
                                  ? isPastSelectedDate
                                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-500/40'
                                    : 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-glow-cyan'
                                  : isPastSelectedDate
                                  ? 'border border-slate-700 bg-ocean-950/40 text-slate-500'
                                  : 'border border-slate-700 bg-ocean-950/60'
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
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-950/80 text-sky-300 border border-sky-400/40 shadow-glow-cyan">
                                  ✅ Slayed Today
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse">
                                  ⚡ Tap to Complete
                                </span>
                              )
                            ) : isPastSelectedDate ? (
                              isCompleted ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-950/80 text-teal-300 border border-teal-500/40">
                                  ✅ Slayed on this date
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-ocean-950/60 border border-ocean-800">
                                  ⏳ Uncompleted Quest
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-500 bg-ocean-950/40 border border-ocean-800">
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
              <div className="p-4 sm:p-5 rounded-2xl bg-ocean-950/80 border border-sky-500/30 space-y-3.5 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2 font-mono">
                    <span className="text-base">📜</span>
                    <span>Daily Reflection & Victory Log</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Appears on calendar tile</span>
                </div>

                {/* Mood selector pills */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 block font-mono">
                    How did you conquer today's directives?
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
                              : 'bg-ocean-900/60 border-ocean-700/60 text-slate-400 hover:text-white'
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
                    placeholder="e.g. Completed all daily habits! Maintained focus on deep work and completed my workout on schedule."
                    value={dailyNote}
                    onChange={(e) => setDailyNote(e.target.value)}
                    className="w-full p-3 rounded-xl bg-ocean-900/90 border border-sky-500/30 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-colors resize-none backdrop-blur-md font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] text-slate-400 font-mono">
                    Logged for {formatReadableDate(selectedDate || '')}
                  </div>
                  <Button
                    variant="glow-cyan"
                    size="sm"
                    onClick={handleSaveNote}
                    isLoading={savingNote}
                    className="bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 border-sky-400/50 text-xs shadow-glow-cyan cursor-pointer font-bold"
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
