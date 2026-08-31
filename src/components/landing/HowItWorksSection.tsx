'use client';

import React from 'react';

export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Plant Your Daily Intentions',
      description: 'Set your daily habits across Coding, Fitness, Study, Mindset, and Health. Assign difficulty tiers and custom target goals.',
      badge: 'Step 1',
      icon: '📜',
    },
    {
      num: '02',
      title: 'Check Off Daily Quests in 1 Click',
      description: 'Complete daily habits directly on the spreadsheet matrix. Gain XP, protect your streak momentum, and achieve Perfect Days.',
      badge: 'Step 2',
      icon: '✨',
    },
    {
      num: '03',
      title: 'Ascend in Clarity & Inner Power',
      description: 'Level up from Novice Seeker to Lunar Sovereign. Unlock badges, reflection logs, and track weekly donut percentages effortlessly.',
      badge: 'Step 3',
      icon: '🌙',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 relative bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-glow-cyan">
            Simple 3-Step Flow
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
            How The <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Lunar Habit Flow</span> Works
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Turn daily habit practice into a peaceful and rewarding journey of self-mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative gsap-stagger-container">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-[#040814]/75 border border-sky-500/25 hover:border-sky-400/50 hover:bg-ocean-900/60 transition-all duration-300 backdrop-blur-xl group hover:-translate-y-1 shadow-xl gsap-stagger-item"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{step.icon}</span>
                <span className="text-2xl font-black text-sky-400/30 font-mono group-hover:text-sky-300/60 transition-colors">
                  {step.num}
                </span>
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded bg-sky-950/80 border border-sky-400/30 text-[10px] font-mono text-sky-300 mb-2">
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
