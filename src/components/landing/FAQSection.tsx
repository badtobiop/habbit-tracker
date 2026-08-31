'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the multi-user architecture work?',
      a: 'Every user gets an independent, private account. All database queries strictly authenticate ownership on the backend using encrypted JWT tokens and database constraints. No user can ever view, modify, or tamper with another user’s habits or records.',
    },
    {
      q: 'How are habit streaks calculated?',
      a: 'Streaks are computed mathematically from your real daily completion history. Completing your scheduled habits sequentially increments your current streak and updates your all-time best record.',
    },
    {
      q: 'What makes Lunar Habit Tracker unique?',
      a: 'Unlike clunky spreadsheets, Lunar Habit Tracker combines an intuitive 5-week spreadsheet grid with weekly circular donut percentage charts, mindful reflection logs, level progression, and focus guardians.',
    },
    {
      q: 'Does the calendar update in real-time with my local date?',
      a: 'Yes! The calendar automatically synchronizes with your device’s current date, handles leap years and variable month lengths, allows inline reflection notes, and enables seamless drill-down to view dates.',
    },
    {
      q: 'Is my habit and reflection note data private?',
      a: 'Absolutely. Your personal habit history, victory notes, and statistics are strictly encrypted and isolated to your unique user account ID.',
    },
  ];

  return (
    <section id="faq" className="py-20 relative bg-transparent">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/40 text-sky-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-glow-cyan">
            Got Questions?
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">Questions</span>
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#040814]/75 border border-sky-500/25 transition-all overflow-hidden backdrop-blur-xl hover:border-sky-400/45 shadow-lg"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-white text-sm sm:text-base font-heading">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-sky-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-sky-500/15 pt-3 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
