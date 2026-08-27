import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Habit } from '@/types';
import { recalculateUserStreak } from '@/lib/xp-engine';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existing = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Habit not found or unauthorized' }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      description,
      category,
      frequency,
      frequency_days,
      reminder_time,
      difficulty,
      icon,
      color,
    } = body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE habits
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          frequency = COALESCE(?, frequency),
          frequency_days = COALESCE(?, frequency_days),
          reminder_time = COALESCE(?, reminder_time),
          difficulty = COALESCE(?, difficulty),
          icon = COALESCE(?, icon),
          color = COALESCE(?, color),
          updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name !== undefined ? name.trim() : null,
      description !== undefined ? description.trim() : null,
      category || null,
      frequency || null,
      frequency_days !== undefined ? JSON.stringify(frequency_days) : null,
      reminder_time || null,
      difficulty || null,
      icon || null,
      color || null,
      now,
      id,
      user.id
    );

    const updated = db.prepare('SELECT * FROM habits WHERE id = ?').get(id) as Habit & { frequency_days: string };

    return NextResponse.json({
      success: true,
      habit: {
        ...updated,
        frequency_days: typeof updated.frequency_days === 'string' ? JSON.parse(updated.frequency_days || '[]') : updated.frequency_days,
      },
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership before delete
    const existing = db.prepare('SELECT id FROM habits WHERE id = ? AND user_id = ?').get(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Habit not found or unauthorized' }, { status: 404 });
    }

    // Delete completions associated with this habit and habit record
    db.prepare('DELETE FROM habit_completions WHERE habit_id = ? AND user_id = ?').run(id, user.id);
    db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(id, user.id);

    // Recalculate streak after deletion
    recalculateUserStreak(user.id);

    return NextResponse.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
