import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, executeSql } from '@/lib/turso';
import { getAuthUser, SUPER_ADMIN_EMAIL } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isMasterAdmin = user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || user.role === 'admin';
    if (!isMasterAdmin) {
      return NextResponse.json({ error: 'Forbidden: Master Admin privileges required' }, { status: 403 });
    }

    // Fetch system overview
    const users = await queryAll(`
      SELECT 
        id, name, email, role, plan_status, xp, level, current_streak, best_streak, total_completions, created_at,
        (SELECT COUNT(*) FROM habits WHERE user_id = users.id AND is_archived = 0) as habit_count
      FROM users
      ORDER BY created_at DESC
    `);

    // Fetch live user login & registration audit alerts
    const alerts = await queryAll(`
      SELECT id, event_type, user_name, user_email, created_at, details
      FROM admin_alerts
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const totalCompletionsRow = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM habit_completions');
    const totalHabitsRow = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM habits');

    const stats = {
      totalUsers: users.length,
      paidUsers: users.filter((u: any) => u.plan_status === 'paid_active' || u.plan_status === 'pro').length,
      totalCompletions: totalCompletionsRow?.count || 0,
      totalHabits: totalHabitsRow?.count || 0,
      estimatedRevenueINR: users.filter((u: any) => u.plan_status === 'paid_active' || u.plan_status === 'pro').length * 49,
    };

    return NextResponse.json({
      success: true,
      stats,
      users,
      alerts,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || (user.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase() && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden: Master Admin privileges required' }, { status: 403 });
    }

    const { targetUserId, plan_status, role } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId is required' }, { status: 400 });
    }

    const targetUser = await queryOne<{ id: string; email: string }>('SELECT id, email FROM users WHERE id = ?', [targetUserId]);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // STRICT SECURITY LOCK: No user other than utkarshdhakane2@gmail.com can EVER be granted the 'admin' role
    const isTargetMasterAdmin = targetUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const safeRole = isTargetMasterAdmin ? 'admin' : (role === 'admin' ? 'user' : (role || undefined));

    const now = new Date().toISOString();

    await executeSql(`
      UPDATE users 
      SET plan_status = COALESCE(?, plan_status),
          role = COALESCE(?, role),
          updated_at = ?
      WHERE id = ?
    `, [plan_status || null, safeRole || null, now, targetUserId]);

    return NextResponse.json({
      success: true,
      message: 'User status updated safely by master admin',
    });
  } catch (error) {
    console.error('Error updating user as admin:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
