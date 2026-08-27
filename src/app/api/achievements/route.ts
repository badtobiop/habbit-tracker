import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { Achievement } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allAchievements = db.prepare('SELECT * FROM achievements ORDER BY requirement_value ASC').all() as Achievement[];

    const userUnlocked = db.prepare(`
      SELECT achievement_id, unlocked_at 
      FROM user_achievements 
      WHERE user_id = ?
    `).all(user.id) as { achievement_id: string; unlocked_at: string }[];

    const unlockedMap = new Map<string, string>();
    userUnlocked.forEach((u) => unlockedMap.set(u.achievement_id, u.unlocked_at));

    const enrichedAchievements = allAchievements.map((ach) => {
      const isUnlocked = unlockedMap.has(ach.id);
      let currentValue = 0;

      switch (ach.requirement_type) {
        case 'streak':
          currentValue = Math.max(user.current_streak, user.best_streak);
          break;
        case 'completions':
          currentValue = user.total_completions;
          break;
        case 'level':
          currentValue = user.level;
          break;
        default:
          currentValue = 0;
      }

      const progress = isUnlocked ? 100 : Math.min(100, Math.round((currentValue / ach.requirement_value) * 100));

      return {
        ...ach,
        is_unlocked: isUnlocked,
        unlocked_at: unlockedMap.get(ach.id) || null,
        current_value: currentValue,
        progress,
      };
    });

    const totalCount = enrichedAchievements.length;
    const unlockedCount = enrichedAchievements.filter((a) => a.is_unlocked).length;

    return NextResponse.json({
      success: true,
      achievements: enrichedAchievements,
      totalCount,
      unlockedCount,
      unlockedPercent: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
