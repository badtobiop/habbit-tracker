export * from './anime-constants';
import { db } from './db';

/**
 * Accurately calculates user streak from database completion history
 */
export function recalculateUserStreak(userId: string): { currentStreak: number; bestStreak: number; totalCompletions: number } {
  // 1. Get total completions count
  const totalStmt = db.prepare('SELECT COUNT(*) as total FROM habit_completions WHERE user_id = ?');
  const totalCompletions = (totalStmt.get(userId) as { total: number })?.total || 0;

  // 2. Get distinct completion dates sorted descending
  const datesStmt = db.prepare(`
    SELECT DISTINCT completed_date 
    FROM habit_completions 
    WHERE user_id = ? 
    ORDER BY completed_date DESC
  `);
  const rows = datesStmt.all(userId) as { completed_date: string }[];

  if (rows.length === 0) {
    db.prepare('UPDATE users SET current_streak = 0, total_completions = 0 WHERE id = ?').run(userId);
    return { currentStreak: 0, bestStreak: 0, totalCompletions: 0 };
  }

  const completedDates = new Set(rows.map((r) => r.completed_date));

  // Determine current streak
  const today = new Date();
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatYMD(yesterday);

  let currentStreak = 0;
  let checkDate: Date;

  if (completedDates.has(todayStr)) {
    checkDate = new Date(today);
  } else if (completedDates.has(yesterdayStr)) {
    checkDate = new Date(yesterday);
  } else {
    currentStreak = 0;
    checkDate = new Date(today);
  }

  if (completedDates.has(formatYMD(checkDate))) {
    while (completedDates.has(formatYMD(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate all-time best streak
  const sortedDates = Array.from(completedDates).sort();
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currDate = new Date(y, m - 1, d);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    prevDate = currDate;
  }

  bestStreak = Math.max(bestStreak, currentStreak);

  // Update user in DB
  const userRow = db.prepare('SELECT best_streak FROM users WHERE id = ?').get(userId) as { best_streak: number } | undefined;
  const historicBest = Math.max(userRow?.best_streak || 0, bestStreak);

  db.prepare(`
    UPDATE users 
    SET current_streak = ?, best_streak = ?, total_completions = ? 
    WHERE id = ?
  `).run(currentStreak, historicBest, totalCompletions, userId);

  return {
    currentStreak,
    bestStreak: historicBest,
    totalCompletions,
  };
}
