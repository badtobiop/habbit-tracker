import React from 'react';
import { Card } from '@/components/ui/Card';
import { Calendar, Flame, Trophy, ShieldCheck, Zap, Sword, Activity, Lock } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Flame,
      color: 'text-red-500',
      title: 'Mathematically Accurate Streaks',
      description: 'Streaks computed directly from atomic daily history. Track your active streak, historical best, and milestone flame.',
    },
    {
      icon: Calendar,
      color: 'text-red-400',
      title: 'Real-Time Calendar & Reflection Notes',
      description: 'Zero hardcoded dates. Live month traversal, leap-year calculations, daily heatmaps, and inline daily reflection notes.',
    },
    {
      icon: Trophy,
      color: 'text-red-500',
      title: 'Uchiha Ranks & Level Progression',
      description: 'Ascend across 1-Tomoe Genin to S-Rank Uchiha Sovereign. Earn XP by quest difficulty (+10 to +50 XP) and perfect day bonuses.',
    },
    {
      icon: Sword,
      color: 'text-red-400',
      title: 'Shinobi Familiars & Spirits',
      description: 'Unlock loyal shinobi spirits (Itachi\'s Karasu Crow, Katon Fire Fox, Flame Dragon, Susanoo) with passive XP multipliers.',
    },
    {
      icon: Activity,
      color: 'text-red-500',
      title: 'Deep Analytics & Attributes Radar',
      description: '7-day weekly completions, 30-day consistency rates, category distributions, and dynamically calculated RPG character stats.',
    },
    {
      icon: Lock,
      color: 'text-red-400',
      title: 'Strict Multi-Tenant User Isolation',
      description: 'Encrypted JWT sessions, bcrypt hashing, and server-side user verification. No user can ever tamper with another’s records.',
    },
  ];

  return (
    <section id="features" className="py-20 relative bg-transparent border-t border-red-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            Engineered For High Output
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
            Every Feature Designed To <span className="text-red-500">Eliminate Procrastination</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            We combined behavioral psychology streak mechanics with the rewarding progression of the Uchiha Clan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 gsap-stagger-container">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 space-y-3 bg-black/60 border border-red-500/25 rounded-2xl backdrop-blur-xl hover:border-red-500/50 hover:bg-black/75 transition-all shadow-xl gsap-stagger-item"
              >
                <div className="w-10 h-10 rounded-xl bg-black/80 border border-red-500/40 flex items-center justify-center shadow-glow-red">
                  <Icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
