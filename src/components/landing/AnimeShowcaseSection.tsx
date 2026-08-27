'use client';

import React from 'react';
import { HUNTER_RANKS, COMPANIONS_CATALOG } from '@/lib/anime-constants';
import { Flame, Shield, Zap } from 'lucide-react';

export function AnimeShowcaseSection() {
  return (
    <section id="anime-rewards" className="py-20 relative bg-transparent border-t border-red-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            Evolution Hierarchy
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
            Ascend Through The <span className="text-red-500">Uchiha Clan Ranks</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every quest completed fuels your total XP. Unlock higher rank titles, crimson auras, and legendary spirit familiars.
          </p>
        </div>

        {/* Uchiha Ranks Progression Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16 gsap-stagger-container">
          {HUNTER_RANKS.map((rank) => (
            <div
              key={rank.rankLetter}
              className="p-5 relative overflow-hidden space-y-3 bg-black/60 border border-red-500/25 rounded-2xl backdrop-blur-xl hover:border-red-500/50 hover:bg-black/75 transition-all shadow-xl gsap-stagger-item"
            >
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base text-white bg-red-600 shadow-glow-red">
                  {rank.rankLetter}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/80 text-red-300 border border-red-500/30">
                  Level {rank.minLevel}+
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-heading">{rank.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rank.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>Tier Milestone Unlocks</span>
              </div>
            </div>
          ))}
        </div>

        {/* Anime Familiars Roster with Frosted 3D Glass */}
        <div className="rounded-2xl bg-black/65 border border-red-500/30 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 font-bold uppercase tracking-wider mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Shinobi Familiars</span>
              </div>
              <h3 className="text-xl font-bold text-white font-heading">
                Awaken Spirit Beasts to Empower Your Output
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Familiars accompany your dashboard and grant passive XP buffs for morning quests, coding sprints, and perfect days.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {COMPANIONS_CATALOG.map((comp) => (
              <div
                key={comp.id}
                className="p-4 rounded-xl bg-black/60 border border-red-500/20 hover:border-red-500/50 hover:bg-black/80 transition-all text-center space-y-2 backdrop-blur-md"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-950 border border-red-500/30 flex items-center justify-center text-2xl shadow-glow-red">
                  {comp.avatar}
                </div>
                <div>
                  <div className="font-bold text-white text-xs font-heading">{comp.name.split(' ')[0]}</div>
                  <div className="text-[9px] text-red-300 font-mono">Lvl {comp.requiredLevel}+ Required</div>
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">{comp.buffDescription}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
