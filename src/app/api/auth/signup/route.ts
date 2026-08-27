import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createAuthToken, createAuthCookieHeader, SUPER_ADMIN_EMAIL } from '@/lib/auth';
import { sendAdminAlert } from '@/lib/mailer';
import { validateEmailAddress } from '@/lib/email-validator';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, avatar = 'shadow_hunter', companion = 'shadow_wolf' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Strict Email Format & Spam Domain Validation
    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    const cleanEmail = emailValidation.normalizedEmail;

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    // Check if this is the Master Owner utkarshdhakane2@gmail.com
    const isMasterOwner = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();
    const role = isMasterOwner ? 'admin' : 'user';

    db.prepare(`
      INSERT INTO users (id, name, email, password, avatar, companion, role, plan_status, xp, level, current_streak, best_streak, total_completions, bio, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'free', 0, 1, 0, 0, 0, 'On a quest to awaken boundless discipline.', ?, ?)
    `).run(userId, name.trim(), cleanEmail, hashedPassword, avatar, companion, role, now, now);

    // Create starter habits for the new user
    const starterHabits = [
      { name: 'Morning Focus Meditation', category: 'Mindset', difficulty: 'easy', icon: 'Sparkles', color: '#dc2626', time: '07:30' },
      { name: 'Deep Coding / Study Quest (1hr)', category: 'Coding', difficulty: 'hard', icon: 'Code', color: '#ef4444', time: '10:00' },
      { name: 'Physical Training (Gym/Cardio)', category: 'Fitness', difficulty: 'medium', icon: 'Flame', color: '#b91c1c', time: '18:00' },
      { name: 'Read 15 Pages of Book', category: 'Study', difficulty: 'easy', icon: 'BookOpen', color: '#991b1b', time: '21:30' },
    ];

    const insertHabit = db.prepare(`
      INSERT INTO habits (id, user_id, name, description, category, frequency, frequency_days, reminder_time, difficulty, icon, color, is_archived, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'daily', '[]', ?, ?, ?, ?, 0, ?, ?)
    `);

    for (const h of starterHabits) {
      const hId = `hab_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      insertHabit.run(hId, userId, h.name, 'Daily discipline quest to level up your shinobi rank.', h.category, h.time, h.difficulty, h.icon, h.color, now, now);
    }

    // Trigger Admin notification alert for new signup
    try {
      await sendAdminAlert({
        eventType: 'NEW_USER_SIGNUP',
        userName: name.trim(),
        userEmail: cleanEmail,
        isPaid: false,
        details: 'New user registered an account on the Shinobi platform.',
      });
    } catch (err) {
      console.error('Alert send error:', err);
    }


    const token = await createAuthToken({ userId, email: cleanEmail, role });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        avatar,
        companion,
        role,
        plan_status: 'free',
        xp: 0,
        level: 1,
        current_streak: 0,
        best_streak: 0,
        total_completions: 0,
      },
    });

    response.headers.set('Set-Cookie', createAuthCookieHeader(token));
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
