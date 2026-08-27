'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Check, Flame, Shield, Zap, Crown } from 'lucide-react';

export function PricingSection() {
  const perks = [
    'Complete Multi-User Personal Account Isolation',
    'Unlimited Habit Quests with Custom Schedules & Times',
    'Custom Category Creator with Dynamic Codex Filters',
    'Real-Time Dynamic Interactive Calendar with Reflection Journal',
    'Mathematically Accurate Streak Tracking & Peak Records',
    'Balanced RPG Uchiha Clan Rank Awakening (1-Tomoe to S-Rank)',
    'Unlockable Shinobi Spirit Familiars & Passive Buffs',
    '11+ Milestone Achievements & Radiant Badges',
    'Deep Analytics Dashboard & Attributes Radar Chart',
    'Web Audio Uchiha Sharingan Sound Effects & Fanfares',
    'Mobile, Tablet & Desktop Responsive Web App',
  ];

  return (
    <section id="pricing" className="py-20 relative bg-transparent border-t border-red-500/15 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            Unbeatable Lifetime Value
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
            Simple, Transparent <span className="text-red-500">Pricing</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Invest in your unstoppable discipline for less than the price of a coffee.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Holographic Card Wrap */}
          <div className="relative group">
            {/* Glowing Aura Outer Bloom */}
            <div className="absolute -inset-1.5 bg-red-600/30 rounded-[28px] blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none" />

            {/* Main Card with Frosted 3D Glass */}
            <div className="relative p-6 sm:p-8 bg-black/70 border-2 border-red-500/50 rounded-[24px] shadow-2xl backdrop-blur-2xl space-y-6 overflow-hidden transition-all duration-300 group-hover:border-red-400">
              {/* Subtle top crimson accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 pointer-events-none" />

              {/* Badge & Crown Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 shadow-glow-red">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/60 text-red-300 text-[11px] font-bold uppercase tracking-wider font-mono">
                    Full Clan Access
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <Zap className="w-3 h-3" /> Instant Activation
                </span>
              </div>

              {/* Price Tag */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white font-heading">₹49</span>
                  <span className="text-slate-400 text-xs font-medium font-mono">/ lifetime user access</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  One-time access. No recurring subscription traps. Full future updates included.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-2.5 pt-3 border-t border-slate-800">
                {perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <div className="w-4 h-4 rounded bg-red-950/90 border border-red-500/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-red-300" />
                    </div>
                    <span className="font-sans">{perk}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="space-y-2.5 pt-3 relative z-20">
                <Link href="/signup" className="block w-full cursor-pointer">
                  <Button
                    variant="glow-purple"
                    size="md"
                    className="w-full font-bold text-sm py-3.5 bg-red-600 hover:bg-red-500 text-white border-red-500/50 shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <Flame className="w-4 h-4 mr-2 text-amber-300 fill-amber-300" />
                    Awaken Lifetime Access — ₹49
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono pointer-events-none">
                  <Shield className="w-3 h-3 text-slate-500" />
                  <span>Secure multi-user encrypted database storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
