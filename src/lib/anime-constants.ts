import { HabitDifficulty, HunterRank, Companion } from '@/types';

export const DIFFICULTY_XP: Record<HabitDifficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
  extreme: 50,
};

export const HUNTER_RANKS: HunterRank[] = [
  {
    rankLetter: 'E',
    title: '1-Tomoe Initiate (Genin)',
    minLevel: 1,
    maxLevel: 4,
    color: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-600',
    description: 'Freshly awakened shinobi. Learning the basics of chakra focus and building daily habit discipline.',
    auraEffect: 'aura-slate',
  },
  {
    rankLetter: 'D',
    title: '2-Tomoe Awakening (Chūnin)',
    minLevel: 5,
    maxLevel: 11,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    badgeBg: 'bg-red-950/80 text-red-300 border-red-500/40',
    description: 'Battle-tested shinobi. Reading and dodging daily procrastination with developing Sharingan perception.',
    auraEffect: 'aura-red',
  },
  {
    rankLetter: 'C',
    title: '3-Tomoe Sharingan (Jōnin)',
    minLevel: 12,
    maxLevel: 24,
    color: '#dc2626',
    glowColor: 'rgba(220, 38, 38, 0.5)',
    badgeBg: 'bg-red-950/90 text-red-200 border-red-500/50',
    description: 'Elite clan member. Complete mastery over regular daily routines. Distractions are trapped in Genjutsu.',
    auraEffect: 'aura-red',
  },
  {
    rankLetter: 'B',
    title: 'Mangekyō Sharingan Master',
    minLevel: 25,
    maxLevel: 39,
    color: '#7c3aed',
    glowColor: 'rgba(124, 58, 237, 0.5)',
    badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
    description: 'Awakened high ocular jutsu. Burns through massive daily workloads with unyielding Amaterasu flame.',
    auraEffect: 'aura-purple',
  },
  {
    rankLetter: 'A',
    title: 'Eternal Mangekyō (Susanoo Armor)',
    minLevel: 40,
    maxLevel: 59,
    color: '#9333ea',
    glowColor: 'rgba(147, 51, 234, 0.6)',
    badgeBg: 'bg-purple-950/90 text-purple-200 border-purple-500/60',
    description: 'Towering willpower. Protected by the spectral armor of the Susanoo against all lazy temptations.',
    auraEffect: 'aura-purple',
  },
  {
    rankLetter: 'S',
    title: 'God of Shinobi (Uchiha Sovereign)',
    minLevel: 60,
    maxLevel: 999,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.7)',
    badgeBg: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
    description: 'Mythical entity of absolute discipline. Commands destiny and rules over the habit domain without rival.',
    auraEffect: 'aura-gold',
  },
];

export const COMPANIONS_CATALOG: Companion[] = [
  {
    id: 'shadow_wolf',
    name: 'Kage (Shinobi Wolf)',
    title: 'Loyal Shinobi Beast',
    element: 'Dark Fire',
    avatar: '🐺',
    requiredLevel: 1,
    buffDescription: '+5% XP bonus on Morning Quests',
    story: 'Awakened beside you in the Uchiha compound, tracking your daily missions.',
  },
  {
    id: 'fenix_wisp',
    name: 'Homura (Katon Flame Fox)',
    title: 'Fire Style Familiar',
    element: 'Katon (Fire)',
    avatar: '🦊',
    requiredLevel: 5,
    buffDescription: 'Streak Shield glow effect & +10 XP on 3+ streaks',
    story: 'Born from the relentless Katon flame of your unbroken habit streaks.',
  },
  {
    id: 'void_raven',
    name: 'Karasu (Itachi\'s Genjutsu Crow)',
    title: 'Astral Genjutsu Crow',
    element: 'Genjutsu / Void',
    avatar: '🦅',
    requiredLevel: 15,
    buffDescription: 'Doubles XP for S-Rank Extreme Quests',
    story: 'Observes your mental clarity and deep work sessions from high dimensional branches.',
  },
  {
    id: 'cyber_dragon',
    name: 'Ryuujin (Karyu Flame Dragon)',
    title: 'Fire Dragon Jutsu',
    element: 'Lightning & Fire',
    avatar: '🐉',
    requiredLevel: 30,
    buffDescription: '+25% XP bonus across all Coding & Study quests',
    story: 'Fierce dragon summoned from the highest tier of fire ninjutsu.',
  },
  {
    id: 'astral_sovereign',
    name: 'Susanoo Sovereign',
    title: 'Perfect Susanoo Guardian',
    element: 'Spectral Ethereal Armor',
    avatar: '👑',
    requiredLevel: 50,
    buffDescription: 'Universal +50 XP bonus on all Perfect Days',
    story: 'Ultimate ethereal warrior standing sentinel over your ironclad discipline domain.',
  },
];

export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(250 * Math.pow(level - 1, 1.8));
}

export function calculateLevelFromXP(totalXP: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  xpNeededForNext: number;
  progressPercent: number;
} {
  let level = 1;
  while (getXPForLevel(level + 1) <= totalXP) {
    level++;
  }

  const currentLevelBaseXP = getXPForLevel(level);
  const nextLevelBaseXP = getXPForLevel(level + 1);
  const xpInCurrentLevel = totalXP - currentLevelBaseXP;
  const xpSpanForLevel = nextLevelBaseXP - currentLevelBaseXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpSpanForLevel) * 100)));

  return {
    level,
    currentLevelXP: xpInCurrentLevel,
    nextLevelXP: xpSpanForLevel,
    xpNeededForNext: Math.max(0, nextLevelBaseXP - totalXP),
    progressPercent,
  };
}

export function getHunterRank(level: number): HunterRank {
  for (let i = HUNTER_RANKS.length - 1; i >= 0; i--) {
    if (level >= HUNTER_RANKS[i].minLevel) {
      return HUNTER_RANKS[i];
    }
  }
  return HUNTER_RANKS[0];
}
