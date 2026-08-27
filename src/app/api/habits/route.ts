import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Habit } from '@/types';
import { getLocalDateString } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
  is_completed_today: number;
  completion_count: number;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetDate = searchParams.get('date') || getLocalDateString();

    const stmt = db.prepare(`
      SELECT 
        h.*,
        CASE WHEN c.id IS NOT NULL THEN 1 ELSE 0 END AS is_completed_today,
        (SELECT COUNT(*) FROM habit_completions hc WHERE hc.habit_id = h.id) as completion_count
      FROM habits h
      LEFT JOIN habit_completions c ON h.id = c.habit_id AND c.completed_date = ?
      WHERE h.user_id = ? AND h.is_archived = 0
      ORDER BY h.created_at ASC
    `);

    const rawHabits = stmt.all(targetDate, user.id) as RawHabitRow[];

    const habits: Habit[] = rawHabits.map((h) => ({
      id: h.id,
      user_id: h.user_id,
      name: h.name,
      description: h.description,
      category: h.category,
      frequency: h.frequency,
      frequency_days: typeof h.frequency_days === 'string' ? JSON.parse(h.frequency_days || '[]') : h.frequency_days,
      reminder_time: h.reminder_time,
      difficulty: h.difficulty,
      icon: h.icon,
      color: h.color,
      is_archived: h.is_archived,
      created_at: h.created_at,
      updated_at: h.updated_at,
      is_completed_today: Boolean(h.is_completed_today),
      completion_count: h.completion_count || 0,
    }));

    return NextResponse.json({ success: true, habits, date: targetDate });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name,
      description = '',
      category = 'Discipline',
      frequency = 'daily',
      frequency_days = [],
      reminder_time = '08:00',
      difficulty = 'medium',
      icon = 'Flame',
      color = '#9333ea',
    } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Habit title is required' }, { status: 400 });
    }

    const habitId = `hab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_days, reminder_time, difficulty, icon, color, is_archived, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      habitId,
      user.id,
      name.trim(),
      description.trim(),
      category,
      frequency,
      JSON.stringify(frequency_days),
      reminder_time,
      difficulty,
      icon,
      color,
      now,
      now
    );

    const createdHabit: Habit = {
      id: habitId,
      user_id: user.id,
      name: name.trim(),
      description: description.trim(),
      category,
      frequency,
      frequency_days,
      reminder_time,
      difficulty,
      icon,
      color,
      is_archived: 0,
      created_at: now,
      updated_at: now,
      is_completed_today: false,
      completion_count: 0,
    };

    return NextResponse.json({ success: true, habit: createdHabit }, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}
