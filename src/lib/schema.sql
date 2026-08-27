-- PostgreSQL & SQLite Compatible Relational Schema for Anime Habit Tracker

-- Users Table
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

-- Habits Table
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

-- Habit Completions Table
CREATE TABLE IF NOT EXISTS habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  completed_date TEXT NOT NULL, -- Format: YYYY-MM-DD
  xp_earned INTEGER DEFAULT 20,
  notes TEXT,
  completed_at TEXT NOT NULL,
  FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(habit_id, completed_date)
);

CREATE INDEX IF NOT EXISTS idx_completions_user_date ON habit_completions(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON habit_completions(habit_id, completed_date);

-- Achievements Catalog Table
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

-- User Unlocked Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements ON user_achievements(user_id);
