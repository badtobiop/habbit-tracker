import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'habittracker.db');

// Global singleton to prevent multiple connections in Next.js dev HMR
declare global {
  // eslint-disable-next-line no-var
  var __habittracker_db: Database.Database | undefined;
}

function getDatabaseConnection(): Database.Database {
  if (process.env.NODE_ENV === 'production') {
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    return db;
  }

  if (!global.__habittracker_db) {
    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    global.__habittracker_db = db;
  }
  return global.__habittracker_db;
}

function initSchema(db: Database.Database) {
  // Create tables if they do not exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT 'shadow_hunter',
      companion TEXT DEFAULT 'shadow_wolf',
      role TEXT DEFAULT 'user',
      plan_status TEXT DEFAULT 'free',
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      current_streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      total_completions INTEGER DEFAULT 0,
      bio TEXT DEFAULT 'On a quest to awaken boundless discipline.',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'Discipline',
      frequency TEXT NOT NULL DEFAULT 'daily',
      frequency_days TEXT DEFAULT '[]',
      reminder_time TEXT DEFAULT '08:00',
      difficulty TEXT NOT NULL DEFAULT 'medium',
      icon TEXT DEFAULT 'Flame',
      color TEXT DEFAULT '#9333ea',
      is_archived INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
    CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(user_id, is_archived);

    CREATE TABLE IF NOT EXISTS habit_completions (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      completed_date TEXT NOT NULL,
      xp_earned INTEGER DEFAULT 20,
      notes TEXT,
      completed_at TEXT NOT NULL,
      FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(habit_id, completed_date)
    );

    CREATE INDEX IF NOT EXISTS idx_completions_user_date ON habit_completions(user_id, completed_date);
    CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON habit_completions(habit_id, completed_date);

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      xp_reward INTEGER NOT NULL DEFAULT 50,
      requirement_type TEXT NOT NULL,
      requirement_value INTEGER NOT NULL,
      badge_tier TEXT NOT NULL DEFAULT 'Bronze'
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      unlocked_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
      UNIQUE(user_id, achievement_id)
    );

    CREATE TABLE IF NOT EXISTS daily_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      note_date TEXT NOT NULL,
      note TEXT NOT NULL,
      mood TEXT DEFAULT 'Victorious',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, note_date)
    );

    CREATE TABLE IF NOT EXISTS admin_alerts (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      user_name TEXT,
      user_email TEXT NOT NULL,
      created_at TEXT NOT NULL,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'INR',
      payment_id TEXT,
      order_id TEXT,
      status TEXT NOT NULL,
      payment_method TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS promo_codes (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      discount_type TEXT DEFAULT '100_percent_free',
      max_uses INTEGER DEFAULT 1,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_by TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS promo_redemptions (
      id TEXT PRIMARY KEY,
      promo_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_email TEXT NOT NULL,
      redeemed_at TEXT NOT NULL,
      FOREIGN KEY(promo_id) REFERENCES promo_codes(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(promo_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
    CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
    CREATE INDEX IF NOT EXISTS idx_admin_alerts_created ON admin_alerts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_daily_notes_user_date ON daily_notes(user_id, note_date);
    CREATE INDEX IF NOT EXISTS idx_user_achievements ON user_achievements(user_id);
  `);

  // Ensure Master Owner utkarshdhakane2@gmail.com is always admin in DB
  db.prepare(`
    UPDATE users SET role = 'admin' WHERE LOWER(email) = 'utkarshdhakane2@gmail.com';
  `).run();

  // Seed default achievements if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM achievements');
  const count = (countStmt.get() as { count: number }).count;

  if (count === 0) {
    const insertAch = db.prepare(`
      INSERT INTO achievements (id, code, title, description, icon, category, xp_reward, requirement_type, requirement_value, badge_tier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const defaultAchievements = [
      {
        id: 'ach_1',
        code: 'first_step',
        title: 'First Awakening',
        description: 'Completed your very first quest habit and took the first step on the Hunter path.',
        icon: 'Sparkles',
        category: 'Getting Started',
        xp_reward: 50,
        requirement_type: 'completions',
        requirement_value: 1,
        badge_tier: 'Bronze',
      },
      {
        id: 'ach_2',
        code: 'streak_3',
        title: 'Spark of Momentum',
        description: 'Maintained an unbroken habit streak for 3 consecutive days.',
        icon: 'Flame',
        category: 'Streaks',
        xp_reward: 75,
        requirement_type: 'streak',
        requirement_value: 3,
        badge_tier: 'Bronze',
      },
      {
        id: 'ach_3',
        code: 'streak_7',
        title: '7-Day Warrior',
        description: 'Demonstrated exceptional resolve by sustaining a 7-day completion streak.',
        icon: 'Shield',
        category: 'Streaks',
        xp_reward: 150,
        requirement_type: 'streak',
        requirement_value: 7,
        badge_tier: 'Silver',
      },
      {
        id: 'ach_4',
        code: 'streak_14',
        title: 'Iron Discipline',
        description: 'Surpassed 14 days of continuous unbroken dedication.',
        icon: 'Sword',
        category: 'Streaks',
        xp_reward: 300,
        requirement_type: 'streak',
        requirement_value: 14,
        badge_tier: 'Gold',
      },
      {
        id: 'ach_5',
        code: 'streak_30',
        title: '30-Day Master',
        description: 'Ascended to mastery with a flawless 30-day streak.',
        icon: 'Crown',
        category: 'Streaks',
        xp_reward: 750,
        requirement_type: 'streak',
        requirement_value: 30,
        badge_tier: 'Mythic',
      },
      {
        id: 'ach_6',
        code: 'completions_25',
        title: 'Dedicated Hunter',
        description: 'Completed 25 individual quest tasks across your journey.',
        icon: 'Target',
        category: 'Milestones',
        xp_reward: 120,
        requirement_type: 'completions',
        requirement_value: 25,
        badge_tier: 'Bronze',
      },
      {
        id: 'ach_7',
        code: 'completions_100',
        title: 'Habit Machine',
        description: 'Crushed 100 total habit executions. Unstoppable output.',
        icon: 'Zap',
        category: 'Milestones',
        xp_reward: 500,
        requirement_type: 'completions',
        requirement_value: 100,
        badge_tier: 'Gold',
      },
      {
        id: 'ach_8',
        code: 'level_5',
        title: 'D-Rank Slayer',
        description: 'Ascended past the initiate stage to reach Hunter Level 5.',
        icon: 'Award',
        category: 'Levels',
        xp_reward: 150,
        requirement_type: 'level',
        requirement_value: 5,
        badge_tier: 'Bronze',
      },
      {
        id: 'ach_9',
        code: 'level_12',
        title: 'C-Rank Shadow',
        description: 'Reached Hunter Level 12 and unlocked advanced shadow companion buffs.',
        icon: 'Skull',
        category: 'Levels',
        xp_reward: 350,
        requirement_type: 'level',
        requirement_value: 12,
        badge_tier: 'Silver',
      },
      {
        id: 'ach_10',
        code: 'level_25',
        title: 'B-Rank Hashira',
        description: 'Attained Level 25 through profound consistency and focus.',
        icon: 'Flame',
        category: 'Levels',
        xp_reward: 800,
        requirement_type: 'level',
        requirement_value: 25,
        badge_tier: 'Gold',
      },
      {
        id: 'ach_11',
        code: 'level_60',
        title: 'S-Rank Monarch',
        description: 'Ascended to the highest mythical realm of mortal discipline at Level 60+.',
        icon: 'Sparkles',
        category: 'Levels',
        xp_reward: 2500,
        requirement_type: 'level',
        requirement_value: 60,
        badge_tier: 'Shadow',
      },
    ];

    const insertMany = db.transaction((achievements) => {
      for (const a of achievements) {
        insertAch.run(
          a.id,
          a.code,
          a.title,
          a.description,
          a.icon,
          a.category,
          a.xp_reward,
          a.requirement_type,
          a.requirement_value,
          a.badge_tier
        );
      }
    });

    insertMany(defaultAchievements);
  }
}

export const db = getDatabaseConnection();
