import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

    db.prepare(`
      INSERT INTO daily_notes (id, user_id, note_date, note, mood, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, note_date) DO UPDATE SET
        note = excluded.note,
        mood = excluded.mood,
        updated_at = excluded.updated_at
    `).run(noteId, user.id, date, note.trim(), mood, now, now);

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
