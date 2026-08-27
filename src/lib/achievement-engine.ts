import { db } from './db';
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
export function checkAndAwardAchievements(userId: string): UnlockedReward[] {
  const user = db.prepare('SELECT id, xp, level, current_streak, best_streak, total_completions FROM users WHERE id = ?').get(userId) as {
    id: string;
    xp: number;
    level: number;
    current_streak: number;
    best_streak: number;
    total_completions: number;
  } | undefined;

  if (!user) return [];

  // Get already unlocked achievement IDs
  const unlockedRows = db.prepare('SELECT achievement_id FROM user_achievements WHERE user_id = ?').all(userId) as { achievement_id: string }[];
  const unlockedSet = new Set(unlockedRows.map((r) => r.achievement_id));

  // Get all achievements
  const allAchievements = db.prepare('SELECT * FROM achievements').all() as Achievement[];
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
      db.prepare(`
        INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, unlocked_at)
        VALUES (?, ?, ?, ?)
      `).run(`uach_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, userId, ach.id, now);

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
    db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newTotalXP, newLevel, userId);
  }

  return newlyUnlocked;
}
