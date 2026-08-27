import { queryOne, queryAll, executeSql } from './turso';
import { Achievement } from '@/types';
import { calculateLevelFromXP } from './xp-engine';

export interface UnlockedReward {
  achievement: Achievement;
  xpBonus: number;
}

/**
 * Checks and awards any newly qualified achievements for the user.
 * Returns array of newly unlocked achievements.
 */
export async function checkAndAwardAchievements(userId: string): Promise<UnlockedReward[]> {
  const user = await queryOne<{
    id: string;
    xp: number;
    level: number;
    current_streak: number;
    best_streak: number;
    total_completions: number;
  }>('SELECT id, xp, level, current_streak, best_streak, total_completions FROM users WHERE id = ?', [userId]);

  if (!user) return [];

  // Get already unlocked achievement IDs
  const unlockedRows = await queryAll<{ achievement_id: string }>('SELECT achievement_id FROM user_achievements WHERE user_id = ?', [userId]);
  const unlockedSet = new Set(unlockedRows.map((r) => r.achievement_id));

  // Get all achievements
  const allAchievements = await queryAll<Achievement>('SELECT * FROM achievements');
  const newlyUnlocked: UnlockedReward[] = [];

  let additionalXP = 0;
  const now = new Date().toISOString();

  for (const ach of allAchievements) {
    if (unlockedSet.has(ach.id)) continue;

    let qualified = false;

    switch (ach.requirement_type) {
      case 'streak':
        if (user.best_streak >= ach.requirement_value || user.current_streak >= ach.requirement_value) {
          qualified = true;
        }
        break;
      case 'completions':
        if (user.total_completions >= ach.requirement_value) {
          qualified = true;
        }
        break;
      case 'level':
        if (user.level >= ach.requirement_value) {
          qualified = true;
        }
        break;
      default:
        break;
    }

    if (qualified) {
      const uachId = `uach_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await executeSql(`
        INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, achievement_id) DO NOTHING
      `, [uachId, userId, ach.id, now]);

      additionalXP += ach.xp_reward;
      newlyUnlocked.push({
        achievement: ach,
        xpBonus: ach.xp_reward,
      });
    }
  }

  if (additionalXP > 0) {
    const newTotalXP = user.xp + additionalXP;
    const { level: newLevel } = calculateLevelFromXP(newTotalXP);
    await executeSql('UPDATE users SET xp = ?, level = ? WHERE id = ?', [newTotalXP, newLevel, userId]);
  }

  return newlyUnlocked;
}
