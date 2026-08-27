import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, executeSql } from '@/lib/turso';
import { getAuthUser } from '@/lib/auth';
import { Habit } from '@/types';

export const dynamic = 'force-dynamic';

interface RawCalendarHabitRow {
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
  is_completed_today: number;
  completed_at: string | null;
  day_xp: number | null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const yearStr = searchParams.get('year');
    const monthStr = searchParams.get('month');
    const specificDate = searchParams.get('date');

    const now = new Date();
    const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();
    const month = monthStr ? parseInt(monthStr, 10) : now.getMonth() + 1;

    const monthPadded = String(month).padStart(2, '0');
    const startDate = `${year}-${monthPadded}-01`;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthPadded}-${String(lastDayOfMonth).padStart(2, '0')}`;

    const totalHabitsRow = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM habits WHERE user_id = ? AND is_archived = 0',
      [user.id]
    );
    const totalHabits = totalHabitsRow?.count || 0;

    const completionRows = await queryAll<{
      completed_date: string;
      completed_count: number;
      total_xp: number;
    }>(`
      SELECT 
        completed_date, 
        COUNT(*) as completed_count,
        SUM(xp_earned) as total_xp
      FROM habit_completions
      WHERE user_id = ? AND completed_date BETWEEN ? AND ?
      GROUP BY completed_date
    `, [user.id, startDate, endDate]);

    const completionsMap = new Map<string, { completed_count: number; total_xp: number }>();
    completionRows.forEach((r) => completionsMap.set(r.completed_date, r));

    // Fetch daily notes for this month
    const noteRows = await queryAll<{
      note_date: string;
      note: string;
      mood: string;
    }>(`
      SELECT note_date, note, mood
      FROM daily_notes
      WHERE user_id = ? AND note_date BETWEEN ? AND ?
    `, [user.id, startDate, endDate]);

    const notesMap = new Map<string, { note: string; mood: string }>();
    noteRows.forEach((n) => notesMap.set(n.note_date, n));

    const monthDays = [];
    for (let d = 1; d <= lastDayOfMonth; d++) {
      const dateStr = `${year}-${monthPadded}-${String(d).padStart(2, '0')}`;
      const entry = completionsMap.get(dateStr);
      const noteEntry = notesMap.get(dateStr);
      const completedCount = entry?.completed_count || 0;
      const percentage = totalHabits > 0 ? Math.min(100, Math.round((completedCount / totalHabits) * 100)) : 0;
      const isPerfect = totalHabits > 0 && completedCount >= totalHabits;

      monthDays.push({
        date: dateStr,
        dayNumber: d,
        totalHabits,
        completedHabits: completedCount,
        percentage,
        isPerfect,
        xpEarned: entry?.total_xp || 0,
        note: noteEntry?.note || '',
        mood: noteEntry?.mood || '',
      });
    }

    let dayDetails = null;
    if (specificDate) {
      const habitsOnDate = await queryAll<RawCalendarHabitRow>(`
        SELECT 
          h.*,
          CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END AS is_completed_today,
          c.completed_at,
          c.xp_earned as day_xp
        FROM habits h
        LEFT JOIN habit_completions c ON h.id = c.habit_id AND c.completed_date = ?
        WHERE h.user_id = ? AND h.is_archived = 0
      `, [specificDate, user.id]);

      const specificNoteRow = await queryOne<{ note: string; mood: string }>(`
        SELECT note, mood
        FROM daily_notes
        WHERE user_id = ? AND note_date = ?
      `, [user.id, specificDate]);

      dayDetails = {
        date: specificDate,
        note: specificNoteRow?.note || '',
        mood: specificNoteRow?.mood || 'Victorious',
        habits: habitsOnDate.map((h) => ({
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
          is_completed_today: Boolean(h.is_completed_today),
        })),
      };
    }

    return NextResponse.json({
      success: true,
      year,
      month,
      totalHabits,
      days: monthDays,
      dayDetails,
    });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { date, note, mood = 'Victorious' } = body;

    if (!date || typeof note !== 'string') {
      return NextResponse.json({ error: 'Missing date or note content' }, { status: 400 });
    }

    const noteId = `dnote_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    await executeSql(`
      INSERT INTO daily_notes (id, user_id, note_date, note, mood, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, note_date) DO UPDATE SET
        note = excluded.note,
        mood = excluded.mood,
        updated_at = excluded.updated_at
    `, [noteId, user.id, date, note.trim(), mood, now, now]);

    return NextResponse.json({
      success: true,
      message: 'Daily reflection note saved successfully',
      date,
      note: note.trim(),
      mood,
    });
  } catch (error) {
    console.error('Error saving daily note:', error);
    return NextResponse.json({ error: 'Failed to save daily note' }, { status: 500 });
  }
}
