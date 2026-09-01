import { NextRequest, NextResponse } from 'next/server';
import { queryOne, executeSql } from '@/lib/turso';
import { getAuthUser } from '@/lib/auth';
import { calculateLevelFromXP } from '@/lib/xp-engine';
import { DailyTask } from '@/types';

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await queryOne<RawTaskRow>(
      'SELECT * FROM daily_tasks WHERE id = ? AND user_id = ?',
      [taskId, user.id]
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      target_date,
      target_time,
      priority,
      category,
      is_completed,
    } = body;

    const nowIso = new Date().toISOString();
    let updatedCompleted = task.is_completed;
    let completedAt = task.completed_at;
    let userXp = user.xp;
    let userLevel = user.level;
    let xpDiff = 0;

    // Handle completion toggle
    if (typeof is_completed === 'boolean') {
      const nextCompleted = is_completed ? 1 : 0;
      if (nextCompleted !== task.is_completed) {
        updatedCompleted = nextCompleted;
        if (nextCompleted === 1) {
          completedAt = nowIso;
          xpDiff = task.xp_reward || 15;
          userXp += xpDiff;
        } else {
          completedAt = null;
          xpDiff = -(task.xp_reward || 15);
          userXp = Math.max(0, userXp + xpDiff);
        }

        const { level: newLevel } = calculateLevelFromXP(userXp);
        userLevel = newLevel;

        await executeSql(
          'UPDATE users SET xp = ?, level = ? WHERE id = ?',
          [userXp, userLevel, user.id]
        );
      }
    }

    const newTitle = typeof title === 'string' && title.trim().length > 0 ? title.trim() : task.title;
    const newDescription = typeof description === 'string' ? description.trim() : task.description;
    const newTargetDate = typeof target_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(target_date) ? target_date : task.target_date;
    const newTargetTime = typeof target_time === 'string' ? target_time.trim() : task.target_time;
    const newPriority = typeof priority === 'string' ? priority : task.priority;
    const newCategory = typeof category === 'string' ? category : task.category;

    await executeSql(`
      UPDATE daily_tasks SET
        title = ?,
        description = ?,
        target_date = ?,
        target_time = ?,
        priority = ?,
        category = ?,
        is_completed = ?,
        completed_at = ?,
        updated_at = ?
      WHERE id = ? AND user_id = ?
    `, [
      newTitle,
      newDescription,
      newTargetDate,
      newTargetTime,
      newPriority,
      newCategory,
      updatedCompleted,
      completedAt,
      nowIso,
      taskId,
      user.id,
    ]);

    const updated = await queryOne<RawTaskRow>(
      'SELECT * FROM daily_tasks WHERE id = ?',
      [taskId]
    );

    const formattedTask: DailyTask = {
      id: updated!.id,
      user_id: updated!.user_id,
      title: updated!.title,
      description: updated!.description || undefined,
      target_date: updated!.target_date,
      target_time: updated!.target_time || undefined,
      priority: (updated!.priority as any) || 'medium',
      category: updated!.category || 'Task',
      is_completed: Boolean(updated!.is_completed),
      completed_at: updated!.completed_at || null,
      xp_reward: updated!.xp_reward || 15,
      created_at: updated!.created_at,
      updated_at: updated!.updated_at,
    };

    return NextResponse.json({
      success: true,
      task: formattedTask,
      xpDiff,
      user: {
        xp: userXp,
        level: userLevel,
      },
    });
  } catch (error: any) {
    console.error('Failed to update daily task:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await queryOne<{ id: string }>(
      'SELECT id FROM daily_tasks WHERE id = ? AND user_id = ?',
      [taskId, user.id]
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 });
    }

    await executeSql('DELETE FROM daily_tasks WHERE id = ? AND user_id = ?', [taskId, user.id]);

    return NextResponse.json({ success: true, id: taskId });
  } catch (error: any) {
    console.error('Failed to delete daily task:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
