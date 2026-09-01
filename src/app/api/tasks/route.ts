import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne, executeSql } from '@/lib/turso';
import { getAuthUser } from '@/lib/auth';
import { DailyTask } from '@/types';
import { getLocalDateString } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface RawTaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string;
  target_time: string | null;
  priority: string;
  category: string;
  is_completed: number;
  completed_at: string | null;
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

function getTomorrowDateString(todayStr: string): string {
  const [y, m, d] = todayStr.split('-').map(Number);
  const tomorrow = new Date(y, m - 1, d);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // all | today | tomorrow | upcoming | completed
    const dateParam = searchParams.get('date');

    const todayStr = getLocalDateString();
    const tomorrowStr = getTomorrowDateString(todayStr);

    let sql = 'SELECT * FROM daily_tasks WHERE user_id = ?';
    const params: any[] = [user.id];

    if (dateParam) {
      sql += ' AND target_date = ?';
      params.push(dateParam);
    } else if (filter === 'today') {
      sql += ' AND target_date = ?';
      params.push(todayStr);
    } else if (filter === 'tomorrow') {
      sql += ' AND target_date = ?';
      params.push(tomorrowStr);
    } else if (filter === 'upcoming') {
      sql += ' AND target_date > ? AND is_completed = 0';
      params.push(tomorrowStr);
    } else if (filter === 'completed') {
      sql += ' AND is_completed = 1';
    }

    sql += " ORDER BY target_date ASC, CASE WHEN target_time IS NULL OR target_time = '' THEN 1 ELSE 0 END, target_time ASC, created_at ASC";

    const rows = await queryAll<RawTaskRow>(sql, params);

    // Compute status counts for badges
    const allUserTasks = await queryAll<RawTaskRow>(
      'SELECT target_date, is_completed FROM daily_tasks WHERE user_id = ?',
      [user.id]
    );

    let todayCount = 0;
    let tomorrowCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;
    let totalPendingCount = 0;

    for (const t of allUserTasks) {
      if (t.is_completed === 1) {
        completedCount++;
      } else {
        totalPendingCount++;
        if (t.target_date === todayStr) {
          todayCount++;
        } else if (t.target_date === tomorrowStr) {
          tomorrowCount++;
        } else if (t.target_date > tomorrowStr) {
          upcomingCount++;
        }
      }
    }

    const tasks: DailyTask[] = rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      title: r.title,
      description: r.description || undefined,
      target_date: r.target_date,
      target_time: r.target_time || undefined,
      priority: (r.priority as any) || 'medium',
      category: r.category || 'Task',
      is_completed: Boolean(r.is_completed),
      completed_at: r.completed_at || null,
      xp_reward: r.xp_reward || 15,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    return NextResponse.json({
      success: true,
      tasks,
      todayStr,
      tomorrowStr,
      counts: {
        today: todayCount,
        tomorrow: tomorrowCount,
        upcoming: upcomingCount,
        completed: completedCount,
        totalPending: totalPendingCount,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch daily tasks:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description = '',
      target_date,
      target_time = '',
      priority = 'medium',
      category = 'Task',
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const finalTargetDate = target_date && /^\d{4}-\d{2}-\d{2}$/.test(target_date)
      ? target_date
      : getLocalDateString();

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    await executeSql(`
      INSERT INTO daily_tasks (
        id, user_id, title, description, target_date, target_time, priority, category,
        is_completed, completed_at, xp_reward, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, 15, ?, ?)
    `, [
      taskId,
      user.id,
      title.trim(),
      description.trim() || null,
      finalTargetDate,
      target_time.trim() || null,
      priority,
      category,
      nowIso,
      nowIso,
    ]);

    const created = await queryOne<RawTaskRow>(
      'SELECT * FROM daily_tasks WHERE id = ?',
      [taskId]
    );

    if (!created) {
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    const task: DailyTask = {
      id: created.id,
      user_id: created.user_id,
      title: created.title,
      description: created.description || undefined,
      target_date: created.target_date,
      target_time: created.target_time || undefined,
      priority: (created.priority as any) || 'medium',
      category: created.category || 'Task',
      is_completed: Boolean(created.is_completed),
      completed_at: created.completed_at || null,
      xp_reward: created.xp_reward || 15,
      created_at: created.created_at,
      updated_at: created.updated_at,
    };

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('Failed to create daily task:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
