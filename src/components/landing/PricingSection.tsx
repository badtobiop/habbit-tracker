'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Check, Sparkles, Shield, Zap, Crown, Moon } from 'lucide-react';

export function PricingSection() {
  const perks = [
    'Complete Multi-User Personal Account Isolation',
    'Interactive 5-Week Spreadsheet Habit Matrix (Zero Scroll)',
    'Real-Time Dynamic Calendar with Daily Reflection Journal',
    'Right-Angled Checkmark Matrix with Instant Database Sync',
    'Weekly Circular SVG Donut Progress Percentage Rings',
    'Mathematically Accurate Streak Tracking & Peak Records',
    'Balanced RPG Sanctuary Rank Progression (Level 1 to 100+)',
    'Unlockable Familiar Spirit Guardians & Passive Buffs',
    'Category Filter Pills & Difficulty Tier Rewards',
    'Deep Analytics Dashboard & Consistency Attributes Radar',
    'Mobile, Tablet & Desktop Responsive Web App',
  ];

  return (
    <section id="pricing" className="py-20 relative bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-glow-cyan">
            Unbeatable Lifetime Value
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
            Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Sanctuary Pass</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Invest in your mindful discipline and daily clarity for less than the cost of a cup of tea.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {/* Holographic Card Wrap */}
          <div className="relative group">
            {/* Glowing Aura Outer Bloom */}
            <div className="absolute -inset-1.5 bg-sky-500/30 rounded-[28px] blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none" />

            {/* Main Card with Frosted 3D Glass */}
            <div className="relative p-6 sm:p-8 bg-[#040814]/80 border-2 border-sky-500/50 rounded-[24px] shadow-2xl backdrop-blur-2xl space-y-6 overflow-hidden transition-all duration-300 group-hover:border-sky-400">
              {/* Subtle top ocean accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-400 pointer-events-none" />

              {/* Badge & Crown Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-950/80 border border-sky-500/50 flex items-center justify-center text-sky-400 shadow-glow-cyan">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/60 text-sky-200 text-[11px] font-bold uppercase tracking-wider font-mono">
                    Full Sanctuary Access
                  </span>
                </div>
                <span className="text-[11px] font-mono text-teal-300 font-bold flex items-center gap-1 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-500/30">
                  <Zap className="w-3 h-3" /> Instant Activation
                </span>
              </div>

              {/* Price Tag */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white font-heading">₹49</span>
                  <span className="text-slate-400 text-xs font-medium font-mono">/ lifetime user pass</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  One-time access. No recurring subscription traps. Full future updates included.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-2.5 pt-3 border-t border-sky-500/15">
                {perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <div className="w-4 h-4 rounded bg-sky-950/90 border border-sky-400/50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-sky-300" />
                    </div>
                    <span className="font-sans">{perk}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="space-y-2.5 pt-3 relative z-20">
                <Link href="/signup" className="block w-full cursor-pointer">
                  <Button
                    variant="glow-cyan"
                    size="md"
                    className="w-full font-bold text-sm py-3.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 text-white border-sky-400/50 shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 mr-2 text-sky-200" />
                    Awaken Lifetime Sanctuary — ₹49
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono pointer-events-none">
                  <Shield className="w-3 h-3 text-sky-400" />
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
