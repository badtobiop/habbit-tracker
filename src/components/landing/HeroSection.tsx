'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Sparkles, Shield, ArrowRight, Trophy, Check, Moon, Compass, Waves } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { playAnimeSound } from '@/lib/utils';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSection() {
  const [completedDemo, setCompletedDemo] = useState<Record<string, boolean>>({
    'quest-1': true,
    'quest-2': false,
    'quest-3': true,
  });

  const heroContainerRef = useRef<HTMLDivElement | null>(null);
  const moonRef = useRef<HTMLDivElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ctx = gsap.context(() => {
      // 1. Fixed Celestial Moon: Stays anchored in its exact spot in the sky, never scrolls away off the top, gently rotates with scroll
      if (moonRef.current) {
        gsap.to(moonRef.current, {
          rotationZ: 360,
          ease: 'none',
          scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2.0,
          },
        });
      }

      // 2. Left column sliding in from LEFT smoothly
      if (leftColRef.current) {
        gsap.fromTo(
          leftColRef.current,
          { opacity: 0, x: -40, y: 15 },
          { opacity: 1, x: 0, y: 0, duration: 1.3, ease: 'expo.out' }
        );
      }

      // 3. Right column sliding in from RIGHT smoothly
      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { opacity: 0, x: 40, y: 15 },
          { opacity: 1, x: 0, y: 0, duration: 1.3, ease: 'expo.out', delay: 0.1 }
        );
      }
    }, heroContainerRef);

    // 4. Interactive 3D mouse tilt on the moon sphere with gentle smooth damping
    const handleMouseMove = (e: MouseEvent) => {
      if (!moonRef.current) return;
      const { innerWidth, innerHeight } = window;
      const xRot = (e.clientY / innerHeight - 0.5) * -16;
      const yRot = (e.clientX / innerWidth - 0.5) * 16;

      gsap.to(moonRef.current, {
        rotationX: xRot,
        rotationY: yRot,
        duration: 0.9,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, []);

  const toggleDemo = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const isNowComplete = !completedDemo[id];
    setCompletedDemo((prev) => ({ ...prev, [id]: isNowComplete }));
    if (isNowComplete) {
      playAnimeSound('quest_complete');
    }
  };

  const completedCount = Object.values(completedDemo).filter(Boolean).length;
  const demoXP = 1450 + completedCount * 35;

  return (
    <section
      ref={heroContainerRef}
      className="relative min-h-[96vh] pt-[170px] sm:pt-[200px] lg:pt-[220px] pb-24 flex flex-col items-center justify-center overflow-hidden bg-transparent"
    >
      {/* Fixed 3D Glowing Celestial Light Blue Moon (Sleek Compact Size) */}
      <div
        className="fixed top-20 sm:top-24 lg:top-24 left-1/2 -translate-x-1/2 z-0 flex flex-col items-center justify-center pointer-events-none select-none"
        style={{ perspective: '1200px' }}
      >
        {/* Soft Luminous Cyan Ambient Halo radiating into dark sky */}
        <div className="absolute w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56 rounded-full bg-sky-400/20 blur-[65px] pointer-events-none animate-pulse" />

        {/* 3D Pure Circular Light Blue Moon Sphere (Compact & Sleek ~144px) */}
        <div
          ref={moonRef}
          className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full relative overflow-hidden transition-transform duration-100 ease-out border-0"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 60px rgba(56, 189, 248, 0.7), 0 0 20px rgba(186, 230, 253, 0.5)',
          }}
        >
          <Image
            src="/images/full-bleed-blue-moon.jpg"
            alt="Celestial Light Blue Moon"
            fill
            priority
            className="object-cover object-center filter brightness-[1.08] contrast-[1.12] scale-[1.16]"
          />
        </div>
      </div>

      {/* Hero Content Container (With ample breathing space below the moon) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column */}
          <div ref={leftColRef} className="lg:col-span-6 text-center lg:text-left space-y-6">
            {/* Peaceful Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#040814]/85 border border-sky-400/40 text-sky-200 text-xs font-semibold shadow-glow-cyan backdrop-blur-md">
              <Moon className="w-3.5 h-3.5 text-sky-300 fill-sky-300/40" />
              <span>Peaceful Lunar Habit Sanctuary • ₹49 Lifetime Pass</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-heading">
              Find Your Inner Calm. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-teal-300">
                Master Your Daily Habits.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Cultivate unbroken daily consistency under the tranquil glow of the Moon.
              Track habits with mindful clarity, protect unbroken streaks, and awaken self-mastery.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1 relative z-20">
              <Link href="/signup" className="w-full sm:w-auto cursor-pointer">
                <Button variant="glow-cyan" size="md" className="w-full sm:w-auto font-bold text-sm px-6 py-3.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 border-sky-400/50 shadow-glow-cyan hover:scale-[1.02] cursor-pointer">
                  <Sparkles className="w-4 h-4 mr-2 text-sky-200" />
                  Enter Sanctuary — ₹49
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="#pricing" className="w-full sm:w-auto cursor-pointer">
                <Button variant="secondary" size="md" className="w-full sm:w-auto text-sm text-slate-200 border-sky-500/30 bg-ocean-950/80 hover:border-sky-400 cursor-pointer">
                  View Sanctuary Pass (₹49)
                </Button>
              </Link>
            </div>

            {/* Micro proof badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono pointer-events-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>Spreadsheet Habit Matrix</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span>100% Private Isolated Vault</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Daily Reflection Journal</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Card */}
          <div ref={rightColRef} className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md">
              {/* Subtle Glowing Outer Bloom */}
              <div className="absolute -inset-1.5 bg-sky-500/20 rounded-[26px] blur-xl opacity-40 pointer-events-none" />

              {/* Main Card Container with Ocean Glass */}
              <div className="relative bg-[#040814]/85 border border-sky-500/35 rounded-[24px] p-5 backdrop-blur-xl shadow-2xl space-y-4 overflow-hidden">
                {/* Lunar Ocean Header Artwork */}
                <div className="relative h-36 rounded-xl overflow-hidden border border-sky-500/30">
                  <Image
                    src="/images/lunar-card.jpg"
                    alt="Lunar Ocean Sanctuary"
                    fill
                    className="object-cover object-center filter brightness-[1.05] contrast-[1.1]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040814]/90 via-[#040814]/40 to-transparent pointer-events-none" />

                  {/* Sanctuary Info Tag over Image */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-black text-white text-base">Lunar Clarity Sanctuary</span>
                        <span className="px-2 py-0.5 rounded bg-sky-600 text-white font-black text-[9px] shadow-glow-cyan">
                          FLOW STATE
                        </span>
                      </div>
                      <span className="text-[10px] text-sky-300 font-mono">Mindful Focus & Serenity</span>
                    </div>

                    <div className="text-right bg-ocean-950/85 px-2.5 py-1 rounded-lg border border-sky-500/40">
                      <div className="text-[8px] text-slate-400 font-mono">Streak</div>
                      <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                        <Waves className="w-3 h-3 text-sky-400" />
                        14 Days
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level & XP Gauge */}
                <div className="p-3 rounded-xl bg-ocean-950/70 border border-sky-500/20 space-y-1.5 backdrop-blur-md">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-sky-300 font-heading">SANCTUARY LEVEL 12 (MINDFUL MASTER)</span>
                    <span className="text-slate-400 font-mono text-[11px]">{demoXP} / 2,800 XP</span>
                  </div>
                  <ProgressBar value={(demoXP / 2800) * 100} variant="cyan" height="sm" />
                </div>

                {/* Interactive Daily Habits with Right-Angled Square Checkboxes */}
                <div className="space-y-2 relative z-20">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 px-1">
                    <span>DAILY PRACTICE (CLICK TO COMPLETE)</span>
                    <span className="text-sky-400 font-mono">{completedCount} / 3 COMPLETED</span>
                  </div>

                  {/* Habit 1 */}
                  <button
                    type="button"
                    onClick={(e) => toggleDemo('quest-1', e)}
                    className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      completedDemo['quest-1']
                        ? 'bg-sky-950/40 border-sky-500/60 text-slate-200 shadow-sm'
                        : 'bg-ocean-950/50 border-ocean-800 hover:border-sky-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-[2px] border-[1.5px] flex items-center justify-center transition-colors ${
                          completedDemo['quest-1'] ? 'bg-gradient-to-br from-sky-500 to-cyan-600 border-sky-400 text-white shadow-glow-cyan' : 'border-slate-600 bg-ocean-950/80'
                        }`}
                      >
                        {completedDemo['quest-1'] && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                      </div>
                      <span className={`text-xs ${completedDemo['quest-1'] ? 'line-through text-slate-400' : 'font-medium text-white'}`}>
                        Morning Meditation & Mindful Journaling (20 min)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-sky-400">+35 XP</span>
                  </button>

                  {/* Habit 2 */}
                  <button
                    type="button"
                    onClick={(e) => toggleDemo('quest-2', e)}
                    className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      completedDemo['quest-2']
                        ? 'bg-sky-950/40 border-sky-500/60 text-slate-200 shadow-sm'
                        : 'bg-ocean-950/50 border-ocean-800 hover:border-sky-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-[2px] border-[1.5px] flex items-center justify-center transition-colors ${
                          completedDemo['quest-2'] ? 'bg-gradient-to-br from-sky-500 to-cyan-600 border-sky-400 text-white shadow-glow-cyan' : 'border-slate-600 bg-ocean-950/80'
                        }`}
                      >
                        {completedDemo['quest-2'] && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                      </div>
                      <span className={`text-xs ${completedDemo['quest-2'] ? 'line-through text-slate-400' : 'font-medium text-white'}`}>
                        Deep Work & Code Crafting (2 hrs)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-teal-300">+50 XP</span>
                  </button>

                  {/* Habit 3 */}
                  <button
                    type="button"
                    onClick={(e) => toggleDemo('quest-3', e)}
                    className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      completedDemo['quest-3']
                        ? 'bg-sky-950/40 border-sky-500/60 text-slate-200 shadow-sm'
                        : 'bg-ocean-950/50 border-ocean-800 hover:border-sky-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-[2px] border-[1.5px] flex items-center justify-center transition-colors ${
                          completedDemo['quest-3'] ? 'bg-gradient-to-br from-sky-500 to-cyan-600 border-sky-400 text-white shadow-glow-cyan' : 'border-slate-600 bg-ocean-950/80'
                        }`}
                      >
                        {completedDemo['quest-3'] && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                      </div>
                      <span className={`text-xs ${completedDemo['quest-3'] ? 'line-through text-slate-400' : 'font-medium text-white'}`}>
                        Evening Reflection & 5km Walk
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-300">+20 XP</span>
                  </button>
                </div>

                {/* Active Sanctuary Focus */}
                <div className="pt-1.5 flex items-center justify-between text-xs text-slate-400 border-t border-sky-500/20">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌊</span>
                    <span className="text-sky-300 text-xs font-medium">Active Element: Tidal Focus (+15% Calm)</span>
                  </div>
                  <span className="text-sky-400 font-mono text-[9px]">Tap to practice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
