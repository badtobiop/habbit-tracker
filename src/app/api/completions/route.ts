import { NextRequest, NextResponse } from 'next/server';
import { queryOne, queryAll, executeSql } from '@/lib/turso';
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
    const habit = await queryOne<{
      id: string;
      difficulty: HabitDifficulty;
      name: string;
    }>('SELECT * FROM habits WHERE id = ? AND user_id = ?', [habit_id, user.id]);

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found or unauthorized' }, { status: 404 });
    }

    // Check if completion already exists for this habit & date
    const existing = await queryOne<{ id: string; xp_earned: number }>(
      'SELECT id, xp_earned FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
      [habit_id, completed_date]
    );

    const prevLevel = user.level;

    if (existing) {
      // Toggle to INCOMPLETE
      await executeSql('DELETE FROM habit_completions WHERE id = ?', [existing.id]);

      // Deduct XP earned
      const currentXP = Math.max(0, user.xp - existing.xp_earned);
      const { level: newLevel } = calculateLevelFromXP(currentXP);

      await executeSql('UPDATE users SET xp = ?, level = ? WHERE id = ?', [currentXP, newLevel, user.id]);

      // Recalculate streak
      const streakStats = await recalculateUserStreak(user.id);

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
      const allUserHabits = await queryAll<{ id: string }>('SELECT id FROM habits WHERE user_id = ? AND is_archived = 0', [user.id]);
      const completedToday = await queryAll<{ habit_id: string }>(
        'SELECT habit_id FROM habit_completions WHERE user_id = ? AND completed_date = ?',
        [user.id, completed_date]
      );

      let isPerfectDay = false;
      if (allUserHabits.length > 0 && completedToday.length + 1 >= allUserHabits.length) {
        isPerfectDay = true;
        xpEarned += user.companion === 'astral_sovereign' ? 75 : 50; // Perfect day bonus
      }

      const completionId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const now = new Date().toISOString();

      await executeSql(`
        INSERT INTO habit_completions (id, habit_id, user_id, completed_date, xp_earned, notes, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [completionId, habit_id, user.id, completed_date, xpEarned, notes, now]);

      // Update XP & level
      const newXP = user.xp + xpEarned;
      const { level: newLevel } = calculateLevelFromXP(newXP);

      await executeSql('UPDATE users SET xp = ?, level = ? WHERE id = ?', [newXP, newLevel, user.id]);

      // Recalculate streak
      const streakStats = await recalculateUserStreak(user.id);

      // Check achievements
      const newlyUnlocked = await checkAndAwardAchievements(user.id);

      // Re-fetch updated user record for fresh stats
      const updatedUser = await queryOne<{
        xp: number;
        level: number;
        current_streak: number;
        best_streak: number;
        total_completions: number;
      }>('SELECT xp, level, current_streak, best_streak, total_completions FROM users WHERE id = ?', [user.id]);

      const leveledUp = (updatedUser?.level || newLevel) > prevLevel;

      return NextResponse.json({
        success: true,
        action: 'completed',
        is_completed: true,
        habit_id,
        completed_date,
        xp_earned: xpEarned,
        is_perfect_day: isPerfectDay,
        xp: updatedUser?.xp || newXP,
        level: updatedUser?.level || newLevel,
        leveled_up: leveledUp,
        current_streak: updatedUser?.current_streak || streakStats.currentStreak,
        best_streak: updatedUser?.best_streak || streakStats.bestStreak,
        total_completions: updatedUser?.total_completions || streakStats.totalCompletions,
        new_achievements: newlyUnlocked,
      });
    }
  } catch (error) {
    console.error('Error toggling completion:', error);
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 });
  }
}
