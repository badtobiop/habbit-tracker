'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  CheckSquare,
  Sparkles,
  BarChart3,
  Trophy,
  User,
  ShieldAlert,
  LogOut,
  Moon,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User as UserType } from '@/types';
import { SUPER_ADMIN_EMAIL } from '@/lib/app-config';

export interface SidebarProps {
  user: UserType | null;
  onLogout: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const isMasterAdmin = user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || user?.role === 'admin';

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Calendar Journal', href: '/calendar', icon: CalendarIcon },
    { label: 'Quests & Habits', href: '/habits', icon: CheckSquare },
    { label: 'Anime & Ranks', href: '/anime', icon: Sparkles },
    { label: 'Statistics', href: '/stats', icon: BarChart3 },
    { label: 'Achievements', href: '/achievements', icon: Trophy },
    { label: 'Shinobi Profile', href: '/profile', icon: User },
  ];

  if (isMasterAdmin) {
    navItems.push({ label: 'Admin Portal', href: '/admin', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 h-full bg-[#040814]/80 backdrop-blur-2xl border-r border-sky-500/25 flex flex-col justify-between p-4 select-none shadow-2xl overflow-hidden">
      {/* Top Header & Scrollable Nav Links */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-4">
        {/* Brand Header */}
        <div className="shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1.5 rounded-2xl hover:bg-sky-500/10 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-teal-400 p-[1px] shadow-glow-cyan shrink-0">
              <div className="w-full h-full bg-[#040814] rounded-[11px] flex items-center justify-center">
                <Moon className="w-5 h-5 text-sky-300 fill-sky-300/30 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-black text-base tracking-tight text-white flex items-center">
                LUNAR<span className="text-sky-400">HABIT</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-sky-300/70 font-mono -mt-1 truncate">
                Ocean Protocol
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto pr-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isAdminItem = item.href === '/admin';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-sky-950/80 text-white border border-sky-400/50 shadow-glow-cyan font-semibold'
                    : isAdminItem
                    ? 'text-amber-400 hover:text-white hover:bg-amber-950/30 border border-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-sky-500/10'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors shrink-0',
                    isActive ? 'text-sky-300' : isAdminItem ? 'text-amber-400' : 'text-slate-400 group-hover:text-sky-200'
                  )}
                />
                <span className="truncate">{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-glow-cyan shrink-0" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Permanently Locked Bottom User Profile & Logout */}
      <div className="shrink-0 pt-3 border-t border-sky-500/20 space-y-2 mt-auto">
        {user && (
          <Link
            href="/profile"
            className="p-2.5 rounded-2xl bg-[#040814]/75 border border-sky-500/20 hover:border-sky-400/50 flex items-center gap-2.5 transition-colors group backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-950/80 border border-sky-400/40 flex items-center justify-center text-sm shadow-glow-cyan shrink-0">
              🌙
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate font-heading group-hover:text-sky-200">
                {user.name}
              </div>
              <div className="text-[10px] text-sky-300 font-mono truncate">
                Level {user.level} Shinobi
              </div>
            </div>
          </Link>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-sky-300 hover:bg-sky-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Realm / Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileBottomNav({ user }: { user: UserType | null }) {
  const pathname = usePathname();
  const isMasterAdmin = user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || user?.role === 'admin';

  const items = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Quests', href: '/habits', icon: CheckSquare },
    { label: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { label: 'Stats', href: '/stats', icon: BarChart3 },
    { label: 'Anime', href: '/anime', icon: Sparkles },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  if (isMasterAdmin) {
    items.push({ label: 'Admin', href: '/admin', icon: ShieldAlert });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#040814]/95 border-t border-sky-500/25 backdrop-blur-2xl px-2 py-2 flex items-center justify-around shadow-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] transition-all',
              isActive ? 'text-sky-300 font-bold bg-sky-950/70 shadow-glow-cyan' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Icon className={cn('w-4 h-4', isActive && 'text-sky-300')} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

