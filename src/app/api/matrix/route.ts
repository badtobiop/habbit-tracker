import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne } from '@/lib/turso';
import { getAuthUser } from '@/lib/auth';
import { Habit } from '@/types';

export const dynamic = 'force-dynamic';

interface CompletionRow {
  habit_id: string;
  completed_date: string;
  xp_earned: number;
}

interface RawHabitRow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: any;
  frequency: any;
  frequency_days: string;
  reminder_time: string;
  difficulty: any;
  icon: string;
  color: string;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const year = parseInt(searchParams.get('year') || String(now.getFullYear()), 10);
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1), 10);

    const monthPadded = String(month).padStart(2, '0');
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = `${year}-${monthPadded}-01`;
    const endDate = `${year}-${monthPadded}-${String(daysInMonth).padStart(2, '0')}`;

    // 1. Fetch user's active habits
    const rawHabits = await queryAll<RawHabitRow>(`
      SELECT * FROM habits 
      WHERE user_id = ? AND is_archived = 0 
      ORDER BY created_at ASC
    `, [user.id]);

    const habits: Habit[] = rawHabits.map((h) => ({
      id: h.id,
      user_id: h.user_id,
      name: h.name,
      description: h.description,
      category: h.category,
      frequency: h.frequency,
      frequency_days: (() => {
        try {
          return typeof h.frequency_days === 'string' ? JSON.parse(h.frequency_days || '[]') : (h.frequency_days || []);
        } catch {
          return [];
        }
      })(),
      reminder_time: h.reminder_time,
      difficulty: h.difficulty,
      icon: h.icon,
      color: h.color,
      is_archived: h.is_archived,
      created_at: h.created_at,
      updated_at: h.updated_at,
    }));

    // 2. Fetch all completions in this month
    const completionRows = await queryAll<CompletionRow>(`
      SELECT habit_id, completed_date, xp_earned
      FROM habit_completions
      WHERE user_id = ? AND completed_date BETWEEN ? AND ?
    `, [user.id, startDate, endDate]);

    // completionsMap: { [habitId]: { [dateStr]: true } }
    const completionsMap: Record<string, Record<string, boolean>> = {};
    completionRows.forEach((row) => {
      if (!completionsMap[row.habit_id]) {
        completionsMap[row.habit_id] = {};
      }
      completionsMap[row.habit_id][row.completed_date] = true;
    });

    // 3. Build days list with weekday names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const shortDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    interface DayInfo {
      dayNumber: number;
      dateStr: string;
      dayOfWeek: string;
      shortDay: string;
      weekIndex: number;
      completedCount: number;
      incompleteCount: number;
    }

    const days: DayInfo[] = [];
    const totalHabitsCount = habits.length;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${monthPadded}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(year, month - 1, d);
      const dayOfWeekIdx = dateObj.getDay();

      // Determine week index (Week 1 = 1..7, Week 2 = 8..14, Week 3 = 15..21, Week 4 = 22..28, Week 5 = 29..31)
      let weekIndex = Math.floor((d - 1) / 7);
      if (weekIndex > 4) weekIndex = 4; // cap at week 5

      let completedOnDay = 0;
      habits.forEach((h) => {
        if (completionsMap[h.id]?.[dateStr]) {
          completedOnDay++;
        }
      });

      days.push({
        dayNumber: d,
        dateStr,
        dayOfWeek: dayNames[dayOfWeekIdx],
        shortDay: shortDayNames[dayOfWeekIdx],
        weekIndex,
        completedCount: completedOnDay,
        incompleteCount: Math.max(0, totalHabitsCount - completedOnDay),
      });
    }

    // 4. Build Week groupings
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

    const weekColors = [
      { name: 'Week 1', color: 'from-amber-500/80 to-amber-600/90', border: 'border-amber-500/40', text: 'text-amber-300', fill: '#f59e0b', track: '#78350f' },
      { name: 'Week 2', color: 'from-sky-500/80 to-blue-600/90', border: 'border-sky-500/40', text: 'text-sky-300', fill: '#38bdf8', track: '#0c4a6e' },
      { name: 'Week 3', color: 'from-cyan-500/80 to-teal-600/90', border: 'border-cyan-500/40', text: 'text-cyan-300', fill: '#06b6d4', track: '#164e63' },
      { name: 'Week 4', color: 'from-emerald-500/80 to-teal-700/90', border: 'border-emerald-500/40', text: 'text-emerald-300', fill: '#10b981', track: '#064e3b' },
      { name: 'Week 5', color: 'from-violet-500/80 to-purple-600/90', border: 'border-violet-500/40', text: 'text-violet-300', fill: '#8b5cf6', track: '#4c1d95' },
    ];

    const weeks: WeekInfo[] = [];
    for (let w = 0; w <= 4; w++) {
      const weekDays = days.filter((d) => d.weekIndex === w);
      if (weekDays.length === 0) continue;

      const startDay = weekDays[0].dayNumber;
      const endDay = weekDays[weekDays.length - 1].dayNumber;
      const totalPossible = totalHabitsCount * weekDays.length;
      const totalCompleted = weekDays.reduce((acc, d) => acc + d.completedCount, 0);
      const totalIncomplete = totalPossible - totalCompleted;
      const percentage = totalPossible > 0 ? Number(((totalCompleted / totalPossible) * 100).toFixed(2)) : 0;

      weeks.push({
        weekNumber: w + 1,
        label: `Week ${w + 1}`,
        startDay,
        endDay,
        days: weekDays,
        totalPossible,
        totalCompleted,
        totalIncomplete,
        percentage,
        color: weekColors[w].fill,
      });
    }

    // 5. Per-habit progress stats
    const habitStats = habits.map((h) => {
      let habitCompletedCount = 0;
      days.forEach((d) => {
        if (completionsMap[h.id]?.[d.dateStr]) {
          habitCompletedCount++;
        }
      });
      const goal = daysInMonth; // standard month goal or can be dynamic
      const progress = goal > 0 ? Number(((habitCompletedCount / goal) * 100).toFixed(1)) : 0;
      return {
        habitId: h.id,
        completedCount: habitCompletedCount,
        goal,
        progressPercentage: progress,
      };
    });

    // 6. Overall Month Progress
    const totalMonthPossible = totalHabitsCount * daysInMonth;
    const totalMonthCompleted = completionRows.length;
    const totalMonthIncomplete = Math.max(0, totalMonthPossible - totalMonthCompleted);
    const monthPercentage = totalMonthPossible > 0
      ? Number(((totalMonthCompleted / totalMonthPossible) * 100).toFixed(2))
      : 0;

    return NextResponse.json({
      success: true,
      year,
      month,
      daysInMonth,
      habits,
      completionsMap,
      days,
      weeks,
      habitStats,
      summary: {
        totalHabitsCount,
        totalMonthPossible,
        totalMonthCompleted,
        totalMonthIncomplete,
        monthPercentage,
      },
    });
  } catch (error) {
    console.error('Error fetching habit matrix:', error);
    return NextResponse.json({ error: 'Failed to fetch habit matrix' }, { status: 500 });
  }
}
