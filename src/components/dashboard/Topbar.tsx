'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Sparkles, Volume2, VolumeX, Moon, Shield } from 'lucide-react';
import { User as UserType } from '@/types';
import { getHunterRank } from '@/lib/anime-constants';
import { isSoundEnabled, setSoundEnabled as persistSoundEnabled } from '@/lib/utils';
import { useToast } from '@/components/common/ToastContext';

export interface TopbarProps {
  user: UserType | null;
}

export function Topbar({ user }: TopbarProps) {
  const { showToast } = useToast();
  const [currentDateString, setCurrentDateString] = useState('');
  const [greeting, setGreeting] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(isSoundEnabled());

    const handleSoundToggleEvent = () => {
      setSoundEnabled(isSoundEnabled());
    };
    window.addEventListener('anime_sound_toggle', handleSoundToggleEvent);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDateString(formattedDate);

    const hour = now.getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = 'Good Evening';
    } else if (hour >= 21 || hour < 4) {
      timeGreeting = 'Good Night';
    }

    if (user?.name) {
      setGreeting(`${timeGreeting}, Shinobi ${user.name}`);
    } else {
      setGreeting(`${timeGreeting}, Shinobi`);
    }

    return () => {
      window.removeEventListener('anime_sound_toggle', handleSoundToggleEvent);
    };
  }, [user]);

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    persistSoundEnabled(nextState);

    showToast({
      type: nextState ? 'success' : 'info',
      title: nextState ? '🔊 Sound FX Enabled' : '🔇 Sound FX Muted',
      message: nextState ? 'Audio cues and quest completion sounds are active.' : 'All audio sound effects muted.',
    });
  };

  const rank = user ? getHunterRank(user.level) : null;

  return (
    <header className="sticky top-0 z-20 bg-[#040814]/75 backdrop-blur-2xl border-b border-sky-500/25 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xl">
      {/* Left: Dynamic Greeting and Date */}
      <div>
        <div className="text-[11px] text-sky-400 font-mono flex items-center gap-1.5 font-semibold">
          <Moon className="w-3.5 h-3.5 text-sky-300" />
          <span>{currentDateString || 'Loading date...'}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight mt-0.5">
          {greeting}
        </h1>
      </div>

      {/* Right: Streak Flame, Shinobi Rank Badge, Sound Toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Streak Pill */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 shadow-glow-gold backdrop-blur-md">
          <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400 animate-pulse" />
          <div className="text-left">
            <div className="text-[9px] text-amber-300/80 uppercase font-mono font-bold leading-none">
              Streak
            </div>
            <div className="text-xs sm:text-sm font-black text-amber-200 leading-tight font-heading">
              {user?.current_streak || 0} {user?.current_streak === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>

        {/* Shinobi Rank Badge */}
        {rank && (
          <Link
            href="/anime"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-sky-950/70 border border-sky-500/40 hover:border-sky-400 transition-colors shadow-glow-cyan backdrop-blur-md"
          >
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black text-white bg-gradient-to-br from-sky-500 to-blue-600 shadow-glow-cyan"
            >
              {rank.rankLetter}
            </div>
            <div className="text-left">
              <div className="text-[9px] text-sky-300 uppercase font-mono font-bold leading-none">
                Rank {rank.rankLetter}
              </div>
              <div className="text-xs font-bold text-white leading-tight font-heading">
                Lvl {user?.level || 1}
              </div>
            </div>
          </Link>
        )}

        {/* Global Sound Toggle Button */}
        <button
          onClick={handleToggleSound}
          className="p-2.5 rounded-xl bg-[#040814]/70 border border-sky-500/25 hover:border-sky-400 text-slate-300 hover:text-white transition-colors backdrop-blur-md cursor-pointer"
          title={soundEnabled ? 'Click to Mute Sound FX' : 'Click to Enable Sound FX'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>
      </div>
    </header>
  );
}

