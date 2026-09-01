export type UserRole = 'user' | 'admin';
export type PlanStatus = 'free' | 'paid_active' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  companion: string;
  role: UserRole;
  plan_status: PlanStatus;
  xp: number;
  level: number;
  current_streak: number;
  best_streak: number;
  total_completions: number;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export type HabitDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type HabitCategory = 'Coding' | 'Fitness' | 'Study' | 'Health' | 'Mindset' | 'Discipline' | 'Creativity' | 'Other' | string;
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  frequency_days: number[]; // 0=Sunday, 1=Monday...
  reminder_time: string;
  difficulty: HabitDifficulty;
  icon: string;
  color: string;
  is_archived: number;
  created_at: string;
  updated_at: string;
  is_completed_today?: boolean;
  completion_count?: number;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string; // YYYY-MM-DD
  xp_earned: number;
  notes?: string;
  completed_at: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface DailyTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date: string; // YYYY-MM-DD
  target_time?: string; // HH:MM or 12-hour formatted time
  priority: TaskPriority;
  category?: string;
  is_completed: boolean;
  completed_at?: string | null;
  xp_reward: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  requirement_type: 'streak' | 'completions' | 'level' | 'perfect_days' | 'category_count';
  requirement_value: number;
  badge_tier: 'Bronze' | 'Silver' | 'Gold' | 'Mythic' | 'Shadow';
  is_unlocked?: boolean;
  unlocked_at?: string | null;
  progress?: number;
}

export interface HunterRank {
  rankLetter: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'Monarch';
  title: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  glowColor: string;
  badgeBg: string;
  description: string;
  auraEffect: string;
}

export interface Companion {
  id: string;
  name: string;
  title: string;
  element: string;
  avatar: string;
  requiredLevel: number;
  buffDescription: string;
  story: string;
}

export interface DayCompletionOverview {
  date: string; // YYYY-MM-DD
  totalHabits: number;
  completedHabits: number;
  percentage: number;
  isPerfect: boolean;
  xpEarned: number;
}

export interface UserStats {
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  nextLevelThreshold: number;
  completionRate7d: number;
  completionRate30d: number;
  mostConsistentHabit?: {
    name: string;
    completions: number;
  };
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  weeklyHistory: {
    day: string;
    date: string;
    completed: number;
    total: number;
  }[];
  attributes: {
    discipline: number;
    focus: number;
    vitality: number;
    intellect: number;
    consistency: number;
  };
}
