import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, Shield, ArrowRight, Zap, Flame } from 'lucide-react';
import { User } from '@/types';
import { COMPANIONS_CATALOG, getHunterRank } from '@/lib/anime-constants';

export interface CharacterCompanionCardProps {
  user: User | null;
}

export function CharacterCompanionCard({ user }: CharacterCompanionCardProps) {
  if (!user) return null;

  const companion = COMPANIONS_CATALOG.find((c) => c.id === user.companion) || COMPANIONS_CATALOG[0];
  const rank = getHunterRank(user.level);

  return (
    <Card glow="red" className="p-6 bg-black/65 border-red-500/35 backdrop-blur-xl relative overflow-hidden space-y-5 shadow-xl">
      {/* Background Aura */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          {/* Avatar icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-black border-2 border-red-500/50 flex items-center justify-center text-3xl shadow-glow-red">
            {companion.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-heading">{companion.name}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300">
                Lvl {companion.requiredLevel}+
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">{companion.title}</div>
          </div>
        </div>

        {/* Rank Badge */}
        <div
          className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-black text-white shadow-lg bg-red-600 shadow-glow-red"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rank {rank.rankLetter}</span>
        </div>
      </div>

      {/* Buff Details */}
      <div className="p-3.5 rounded-2xl bg-black/75 border border-slate-800 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-300">
          <Zap className="w-3.5 h-3.5 text-red-400" />
          <span>Active Familiar Buff</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          {companion.buffDescription}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400 font-mono">Element: <strong className="text-red-400">{companion.element}</strong></span>
        <Link href="/anime">
          <Button variant="outline" size="sm" className="text-xs border-red-500/40 text-red-300 hover:bg-red-950/40">
            Manage Shinobi & Familiars
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
