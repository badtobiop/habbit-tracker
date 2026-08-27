import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { DIFFICULTY_XP, calculateLevelFromXP, recalculateUserStreak } from '@/lib/xp-engine';
import { checkAndAwardAchievements } from '@/lib/achievement-engine';
import { getLocalDateString } from '@/lib/utils';
import { HabitDifficulty } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { habit_id, completed_date = getLocalDateString(), notes = '' } = await req.json();

    if (!habit_id) {
      return NextResponse.json({ error: 'habit_id is required' }, { status: 400 });
    }

    // Verify habit belongs to authenticated user
    const habit = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(habit_id, user.id) as {
      id: string;
      difficulty: HabitDifficulty;
      name: string;
    } | undefined;

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found or unauthorized' }, { status: 404 });
    }

    // Check if completion already exists for this habit & date
    const existing = db.prepare('SELECT id, xp_earned FROM habit_completions WHERE habit_id = ? AND completed_date = ?').get(
      habit_id,
      completed_date
    ) as { id: string; xp_earned: number } | undefined;

    const prevLevel = user.level;

    if (existing) {
      // Toggle to INCOMPLETE
      db.prepare('DELETE FROM habit_completions WHERE id = ?').run(existing.id);

      // Deduct XP earned
      const currentXP = Math.max(0, user.xp - existing.xp_earned);
      const { level: newLevel } = calculateLevelFromXP(currentXP);

      db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(currentXP, newLevel, user.id);

      // Recalculate streak
      const streakStats = recalculateUserStreak(user.id);

      return NextResponse.json({
        success: true,
        action: 'uncompleted',
        is_completed: false,
        habit_id,
        completed_date,
        xp_deducted: existing.xp_earned,
        xp: currentXP,
        level: newLevel,
        current_streak: streakStats.currentStreak,
        best_streak: streakStats.bestStreak,
        total_completions: streakStats.totalCompletions,
      });
    } else {
      // Toggle to COMPLETE
      let xpEarned = DIFFICULTY_XP[habit.difficulty] || 20;

      // Check for companion bonus
      if (user.companion === 'void_raven' && habit.difficulty === 'extreme') {
        xpEarned *= 2;
      }

      // Check if this makes it a Perfect Day (all habits for user completed today)
      const allUserHabits = db.prepare('SELECT id FROM habits WHERE user_id = ? AND is_archived = 0').all(user.id) as { id: string }[];
      const completedToday = db.prepare('SELECT habit_id FROM habit_completions WHERE user_id = ? AND completed_date = ?').all(
        user.id,
        completed_date
      ) as { habit_id: string }[];

      let isPerfectDay = false;
      if (allUserHabits.length > 0 && completedToday.length + 1 >= allUserHabits.length) {
        isPerfectDay = true;
        xpEarned += user.companion === 'astral_sovereign' ? 75 : 50; // Perfect day bonus
      }

      const completionId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO habit_completions (id, habit_id, user_id, completed_date, xp_earned, notes, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(completionId, habit_id, user.id, completed_date, xpEarned, notes, now);

      // Update XP & level
      const newXP = user.xp + xpEarned;
      const { level: newLevel } = calculateLevelFromXP(newXP);

      db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXP, newLevel, user.id);

      // Recalculate streak
      const streakStats = recalculateUserStreak(user.id);

      // Check achievements
      const newlyUnlocked = checkAndAwardAchievements(user.id);

      // Re-fetch updated user record for fresh stats
      const updatedUser = db.prepare('SELECT xp, level, current_streak, best_streak, total_completions FROM users WHERE id = ?').get(user.id) as {
        xp: number;
        level: number;
        current_streak: number;
        best_streak: number;
        total_completions: number;
      };

      const leveledUp = updatedUser.level > prevLevel;

      return NextResponse.json({
        success: true,
        action: 'completed',
        is_completed: true,
        habit_id,
        completed_date,
        xp_earned: xpEarned,
        is_perfect_day: isPerfectDay,
        xp: updatedUser.xp,
        level: updatedUser.level,
        leveled_up: leveledUp,
        current_streak: updatedUser.current_streak,
        best_streak: updatedUser.best_streak,
        total_completions: updatedUser.total_completions,
        new_achievements: newlyUnlocked,
      });
    }
  } catch (error) {
    console.error('Error toggling completion:', error);
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 });
  }
}
