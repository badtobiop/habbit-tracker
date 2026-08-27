import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll } from '@/lib/turso';
import { getAuthUser } from '@/lib/auth';
import { calculateLevelFromXP, getHunterRank } from '@/lib/xp-engine';
import { UserStats } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level, xpNeededForNext, nextLevelXP, progressPercent } = calculateLevelFromXP(user.xp);
    const hunterRank = getHunterRank(user.level);

    // 1. Weekly completion history (last 7 days)
    const weeklyHistory: { day: string; date: string; completed: number; total: number }[] = [];
    const totalHabitsRow = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM habits WHERE user_id = ? AND is_archived = 0', [user.id]);
    const totalHabitsCount = totalHabitsRow?.count || 0;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;

      const completedRow = await queryOne<{ count: number }>(
        'SELECT COUNT(*) as count FROM habit_completions WHERE user_id = ? AND completed_date = ?',
        [user.id, dateStr]
      );
      const completedCount = completedRow?.count || 0;

      weeklyHistory.push({
        day: dayNames[d.getDay()],
        date: dateStr,
        completed: completedCount,
        total: Math.max(totalHabitsCount, completedCount),
      });
    }

    // 2. 7-day and 30-day completion rates
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = `${thirtyDaysAgo.getFullYear()}-${String(thirtyDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(thirtyDaysAgo.getDate()).padStart(2, '0')}`;

    const count7dRow = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM habit_completions WHERE user_id = ? AND completed_date >= ?',
      [user.id, sevenDaysAgoStr]
    );
    const count7d = count7dRow?.count || 0;
    const possible7d = Math.max(1, totalHabitsCount * 7);
    const completionRate7d = Math.min(100, Math.round((count7d / possible7d) * 100));

    const count30dRow = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM habit_completions WHERE user_id = ? AND completed_date >= ?',
      [user.id, thirtyDaysAgoStr]
    );
    const count30d = count30dRow?.count || 0;
    const possible30d = Math.max(1, totalHabitsCount * 30);
    const completionRate30d = Math.min(100, Math.round((count30d / possible30d) * 100));

    // 3. Most consistent habit
    const consistentHabitRow = await queryOne<{ name: string; count: number }>(`
      SELECT h.name, COUNT(c.id) as count
      FROM habits h
      JOIN habit_completions c ON h.id = c.habit_id
      WHERE h.user_id = ?
      GROUP BY h.id
      ORDER BY count DESC
      LIMIT 1
    `, [user.id]);

    // 4. Category distribution
    const categoryRows = await queryAll<{ category: string; count: number }>(`
      SELECT h.category, COUNT(c.id) as count
      FROM habits h
      JOIN habit_completions c ON h.id = c.habit_id
      WHERE h.user_id = ?
      GROUP BY h.category
      ORDER BY count DESC
    `, [user.id]);

    const totalCategoryCompletions = categoryRows.reduce((acc, r) => acc + r.count, 0) || 1;
    const categoryDistribution = categoryRows.map((r) => ({
      category: r.category,
      count: r.count,
      percentage: Math.round((r.count / totalCategoryCompletions) * 100),
    }));

    // If no category completions yet, fill defaults from existing habits
    if (categoryDistribution.length === 0) {
      const habitCats = await queryAll<{ category: string; count: number }>(
        'SELECT category, COUNT(*) as count FROM habits WHERE user_id = ? GROUP BY category',
        [user.id]
      );
      const totalH = habitCats.reduce((acc, r) => acc + r.count, 0) || 1;
      habitCats.forEach((c) => {
        categoryDistribution.push({
          category: c.category,
          count: c.count,
          percentage: Math.round((c.count / totalH) * 100),
        });
      });
    }

    // 5. Attributes Radar (Calculated dynamically)
    const baseAttr = Math.min(95, 20 + user.level * 3);
    const discipline = Math.min(99, Math.round(baseAttr + Math.min(25, user.current_streak * 2)));
    const consistency = Math.min(99, Math.round(baseAttr * 0.8 + completionRate7d * 0.4));
    const focus = Math.min(99, Math.round(baseAttr + (categoryDistribution.find((c) => c.category === 'Coding' || c.category === 'Study')?.percentage || 20) * 0.3));
    const vitality = Math.min(99, Math.round(baseAttr + (categoryDistribution.find((c) => c.category === 'Fitness' || c.category === 'Health')?.percentage || 20) * 0.3));
    const intellect = Math.min(99, Math.round(baseAttr + (categoryDistribution.find((c) => c.category === 'Study' || c.category === 'Mindset')?.percentage || 20) * 0.3));

    const stats: UserStats = {
      totalCompletions: user.total_completions,
      currentStreak: user.current_streak,
      bestStreak: user.best_streak,
      level: user.level,
      xp: user.xp,
      xpToNextLevel: xpNeededForNext,
      nextLevelThreshold: nextLevelXP,
      completionRate7d,
      completionRate30d,
      mostConsistentHabit: consistentHabitRow ? {
        name: consistentHabitRow.name,
        completions: consistentHabitRow.count,
      } : undefined,
      weeklyHistory,
      categoryDistribution,
      attributes: {
        discipline,
        consistency,
        focus,
        vitality,
        intellect,
      },
    };


    return NextResponse.json({
      success: true,
      stats,
      hunterRank,
      userLevel: user.level,
      userXP: user.xp,
      progressPercent,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to calculate user stats' }, { status: 500 });
  }
}
