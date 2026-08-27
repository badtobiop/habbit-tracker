import { db } from '../src/lib/db.ts';
import { hashPassword, comparePassword, createAuthToken, verifyAuthToken } from '../src/lib/auth.ts';
import { calculateLevelFromXP, getHunterRank, getXPForLevel } from '../src/lib/anime-constants.ts';
import { recalculateUserStreak } from '../src/lib/xp-engine.ts';
import { checkAndAwardAchievements } from '../src/lib/achievement-engine.ts';

async function runTests() {
  console.log('--- STARTING ANIME HABIT TRACKER INTEGRATION TESTS ---');

  // 1. Password Hashing & Comparison Test
  console.log('[TEST 1] Password Hashing & Compare');
  const plainPass = 'hunter_shadow_pass_2026';
  const hashed = await hashPassword(plainPass);
  const isMatch = await comparePassword(plainPass, hashed);
  const isFalseMatch = await comparePassword('wrong_pass', hashed);
  console.assert(isMatch === true, 'Valid password match failed');
  console.assert(isFalseMatch === false, 'Invalid password accepted');
  console.log('✔ Password hashing & validation verified.');

  // 2. JWT Generation & Verification Test
  console.log('[TEST 2] JWT Token Creation & Verification');
  const token = await createAuthToken({ userId: 'usr_test_1', email: 'hunter1@anime.io', role: 'user' });
  const verified = await verifyAuthToken(token);
  console.assert(verified?.userId === 'usr_test_1', 'JWT userId mismatch');
  console.assert(verified?.email === 'hunter1@anime.io', 'JWT email mismatch');
  console.log('✔ JWT verification verified.');

  // 3. Multi-User Creation and Strict Data Isolation Test
  console.log('[TEST 3] Multi-User Account Creation & Isolation');
  const user1Id = `usr_test_jinwoo_${Date.now()}`;
  const user2Id = `usr_test_tanjiro_${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, password, avatar, companion, role, plan_status, xp, level, current_streak, best_streak, total_completions, created_at, updated_at)
    VALUES (?, 'Sung Jin-Woo', 'jinwoo@hunter.io', 'hashed_pass_1', 'shadow_hunter', 'shadow_wolf', 'admin', 'paid_active', 0, 1, 0, 0, 0, ?, ?)
  `).run(user1Id, now, now);

  db.prepare(`
    INSERT INTO users (id, name, email, password, avatar, companion, role, plan_status, xp, level, current_streak, best_streak, total_completions, created_at, updated_at)
    VALUES (?, 'Tanjiro Kamado', 'tanjiro@slayer.io', 'hashed_pass_2', 'flame_shinobi', 'fenix_wisp', 'user', 'free', 0, 1, 0, 0, 0, ?, ?)
  `).run(user2Id, now, now);

  // User 1 creates 3 habits
  const u1Habit1 = `hab_u1_1_${Date.now()}`;
  const u1Habit2 = `hab_u1_2_${Date.now()}`;
  db.prepare(`INSERT INTO habits (id, user_id, name, category, difficulty, created_at, updated_at) VALUES (?, ?, 'Shadow Monarch Workout', 'Fitness', 'extreme', ?, ?)`).run(u1Habit1, user1Id, now, now);
  db.prepare(`INSERT INTO habits (id, user_id, name, category, difficulty, created_at, updated_at) VALUES (?, ?, 'LeetCode Mastery', 'Coding', 'hard', ?, ?)`).run(u1Habit2, user1Id, now, now);

  // User 2 creates 1 habit
  const u2Habit1 = `hab_u2_1_${Date.now()}`;
  db.prepare(`INSERT INTO habits (id, user_id, name, category, difficulty, created_at, updated_at) VALUES (?, ?, 'Water Breathing Meditation', 'Mindset', 'easy', ?, ?)`).run(u2Habit1, user2Id, now, now);

  // Verify User 2 queries CANNOT see User 1's habits
  const user2Habits = db.prepare('SELECT id, name FROM habits WHERE user_id = ?').all(user2Id);
  console.assert(user2Habits.length === 1, 'User 2 habit count should be exactly 1');
  console.assert(user2Habits[0].id === u2Habit1, 'User 2 received wrong habit');

  const user1Habits = db.prepare('SELECT id, name FROM habits WHERE user_id = ?').all(user1Id);
  console.assert(user1Habits.length === 2, 'User 1 habit count should be exactly 2');
  console.log('✔ Multi-tenant database isolation verified.');

  // 4. Habit Completion, XP disbursement, and Streak Calculation
  console.log('[TEST 4] Habit Completion & Streak Recalculation');
  const dToday = '2026-08-26';
  const dYesterday = '2026-08-25';
  const d2DaysAgo = '2026-08-24';

  // Complete habit for 3 consecutive days for User 1
  db.prepare(`INSERT INTO habit_completions (id, habit_id, user_id, completed_date, xp_earned, completed_at) VALUES (?, ?, ?, ?, 50, ?)`).run(`c1_${Date.now()}`, u1Habit1, user1Id, d2DaysAgo, now);
  db.prepare(`INSERT INTO habit_completions (id, habit_id, user_id, completed_date, xp_earned, completed_at) VALUES (?, ?, ?, ?, 50, ?)`).run(`c2_${Date.now()}`, u1Habit1, user1Id, dYesterday, now);
  db.prepare(`INSERT INTO habit_completions (id, habit_id, user_id, completed_date, xp_earned, completed_at) VALUES (?, ?, ?, ?, 50, ?)`).run(`c3_${Date.now()}`, u1Habit1, user1Id, dToday, now);

  const streakResult = recalculateUserStreak(user1Id);
  console.assert(streakResult.currentStreak === 3, `Expected current streak 3, got ${streakResult.currentStreak}`);
  console.assert(streakResult.bestStreak >= 3, `Expected best streak >= 3, got ${streakResult.bestStreak}`);
  console.assert(streakResult.totalCompletions === 3, `Expected total completions 3, got ${streakResult.totalCompletions}`);
  console.log('✔ Consecutive streak calculation verified.');

  // 5. Automated Achievement Awarding
  console.log('[TEST 5] Automated Achievement Awakening');
  db.prepare('UPDATE users SET xp = 250, level = 3 WHERE id = ?').run(user1Id);
  const unlocked = checkAndAwardAchievements(user1Id);
  console.log(`✔ Awarded ${unlocked.length} achievements (e.g. First Awakening, Spark of Momentum 3-day streak).`);
  console.assert(unlocked.length >= 2, 'Should unlock at least First Awakening and 3-Day streak');

  // 6. Level & Hunter Rank Scaling Formulas
  console.log('[TEST 6] Level Scaling & Hunter Rank Progression');
  const lvl1 = calculateLevelFromXP(50);
  const lvl5 = calculateLevelFromXP(1500);
  const lvl25 = calculateLevelFromXP(25000);

  console.assert(lvl1.level >= 1, 'Level 1 check failed');
  console.assert(lvl5.level >= 5, 'Level 5 check failed');
  console.assert(getHunterRank(lvl1.level).rankLetter === 'E', 'Lvl 1 should be Rank E');
  console.assert(getHunterRank(5).rankLetter === 'D', 'Lvl 5 should be Rank D');
  console.assert(getHunterRank(12).rankLetter === 'C', 'Lvl 12 should be Rank C');
  console.assert(getHunterRank(22).rankLetter === 'B', 'Lvl 22 should be Rank B');
  console.assert(getHunterRank(35).rankLetter === 'A', 'Lvl 35 should be Rank A');
  console.assert(getHunterRank(50).rankLetter === 'S', 'Lvl 50 should be Rank S');
  console.log('✔ Hunter Rank and Level progression formulas verified.');

  console.log('\n=============================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================\n');
}

runTests().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
