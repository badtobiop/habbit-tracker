import React from 'react';
import { Calendar, Sparkles, Trophy, ShieldCheck, Zap, Moon, Activity, Lock, Compass } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Calendar,
      color: 'text-sky-400',
      title: 'Spreadsheet-Style Monthly Matrix',
      description: 'Zero friction 5-week spreadsheet layout with right-angled checkmarks, daily counters, and weekly circular donut rings.',
    },
    {
      icon: Sparkles,
      color: 'text-cyan-400',
      title: 'Mathematically Pure Streaks',
      description: 'Streaks computed directly from atomic daily history. Track your active continuous flow, historical best, and milestone flame.',
    },
    {
      icon: Moon,
      color: 'text-sky-300',
      title: 'Real-Time Calendar & Reflection Journal',
      description: 'Live month traversal, leap-year calculations, daily heatmaps, and inline daily reflection victory logs pinned to every date.',
    },
    {
      icon: Trophy,
      color: 'text-amber-400',
      title: 'Mindful Mastery & Level Progression',
      description: 'Ascend across peaceful discipline ranks from Seeker to Lunar Sovereign. Earn XP by difficulty tiers and perfect day bonuses.',
    },
    {
      icon: Compass,
      color: 'text-teal-400',
      title: 'Deep Analytics & Consistency Telemetry',
      description: 'Weekly completions, 30-day consistency rates, category distribution, and dynamically calculated discipline attributes.',
    },
    {
      icon: Lock,
      color: 'text-sky-400',
      title: 'Strict Multi-Tenant User Isolation',
      description: 'Encrypted JWT sessions, bcrypt hashing, and server-side verification. Your habits and private notes are 100% isolated.',
    },
  ];

  return (
    <section id="features" className="py-20 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-glow-cyan">
            Engineered For Calm Consistency
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
            Every Feature Designed For <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Effortless Self-Mastery</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            We combined peaceful behavioral psychology streak mechanics with the harmonious progression of the Lunar Sanctuary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 gsap-stagger-container">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 space-y-3 bg-[#040814]/75 border border-sky-500/25 rounded-2xl backdrop-blur-xl hover:border-sky-400/50 hover:bg-ocean-900/60 transition-all shadow-xl gsap-stagger-item"
              >
                <div className="w-10 h-10 rounded-xl bg-ocean-950/90 border border-sky-500/40 flex items-center justify-center shadow-glow-cyan">
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
