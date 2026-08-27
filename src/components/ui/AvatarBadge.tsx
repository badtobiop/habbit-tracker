import React from 'react';
import { cn } from '@/lib/utils';

export const AVATAR_OPTIONS = [
  { id: 'sasuke_mangekyo', name: 'Sasuke Uchiha (Eternal Mangekyō)', icon: '⚡', color: 'from-red-600 via-purple-700 to-slate-950', border: 'border-red-500' },
  { id: 'itachi_crow', name: 'Itachi Uchiha (Tsukuyomi Master)', icon: '🦅', color: 'from-red-700 via-rose-900 to-black', border: 'border-red-500' },
  { id: 'madara_warlord', name: 'Madara Uchiha (Susanoo Warlord)', icon: '👑', color: 'from-purple-600 via-indigo-900 to-black', border: 'border-purple-500' },
  { id: 'obito_kamui', name: 'Obito Uchiha (Kamui Master)', icon: '🌀', color: 'from-orange-600 via-amber-900 to-black', border: 'border-orange-500' },
  { id: 'shisui_koto', name: 'Shisui Uchiha (Body Flicker)', icon: '🗡️', color: 'from-emerald-600 via-teal-900 to-black', border: 'border-emerald-500' },
  { id: 'flame_shinobi', name: 'Katon Shinobi Initiate', icon: '🔥', color: 'from-rose-600 to-amber-900', border: 'border-rose-500' },
];

export interface AvatarBadgeProps {
  avatarId?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  className?: string;
}

export function AvatarBadge({ avatarId = 'sasuke_mangekyo', size = 'md', showGlow = true, className }: AvatarBadgeProps) {
  const avatar = AVATAR_OPTIONS.find((a) => a.id === avatarId) || AVATAR_OPTIONS[0];

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-4xl',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br border-2 select-none shadow-lg transition-transform',
        avatar.color,
        avatar.border,
        sizeClasses[size],
        showGlow && 'shadow-glow-red',
        className
      )}
      title={avatar.name}
    >
      <span>{avatar.icon}</span>
    </div>
  );
}
