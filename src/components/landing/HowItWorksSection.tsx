'use client';

import React from 'react';

export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Initialize Your Quests',
      description: 'Set your daily habits across Coding, Fitness, Study, Mindset, and Health. Assign difficulty tiers (E-Rank to S-Rank).',
      badge: 'Step 1',
      icon: '📜',
    },
    {
      num: '02',
      title: 'Conquer Daily Habit Slayers',
      description: 'Complete daily tasks with one tap. Collect XP gains, preserve your streak flame, and earn Perfect Day multipliers.',
      badge: 'Step 2',
      icon: '⚔️',
    },
    {
      num: '03',
      title: 'Awaken Uchiha Ranks & Spirits',
      description: 'Level up from 1-Tomoe Genin to S-Rank Sovereign. Unlock badges, shinobi avatars, and spirit familiars to empower your life.',
      badge: 'Step 3',
      icon: '👑',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 relative bg-transparent border-t border-red-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            Simple 3-Step Protocol
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
            How The <span className="text-red-500">Shinobi Awakening</span> Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Turn daily habit management into a legendary discipline journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative gsap-stagger-container">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-black/60 border border-red-500/25 hover:border-red-500/50 hover:bg-black/75 transition-all duration-300 backdrop-blur-xl group hover:-translate-y-1 shadow-xl gsap-stagger-item"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{step.icon}</span>
                <span className="text-2xl font-black text-red-500/30 font-mono group-hover:text-red-500/60 transition-colors">
                  {step.num}
                </span>
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded bg-red-950/80 border border-red-500/30 text-[10px] font-mono text-red-300 mb-2">
                {step.badge}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-heading mb-1.5">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
