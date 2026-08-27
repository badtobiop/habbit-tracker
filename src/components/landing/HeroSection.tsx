'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Flame, Shield, ArrowRight, Trophy, CheckCircle2, Moon } from 'lucide-react';
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

    // Wrap in gsap.context for safe React 18 / Next.js lifecycle and hot-reload cleanup
    const ctx = gsap.context(() => {
      // 1. 3D Pure Moon GSAP Scroll Rotation with buttery smooth scrubbing
      if (moonRef.current) {
        gsap.to(moonRef.current, {
          rotationZ: 360,
          y: 90,
          scale: 1.05,
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
          { opacity: 0, x: -45, y: 15 },
          { opacity: 1, x: 0, y: 0, duration: 1.4, ease: 'expo.out' }
        );
      }

      // 3. Right column sliding in from RIGHT smoothly
      if (rightColRef.current) {
        gsap.fromTo(
          rightColRef.current,
          { opacity: 0, x: 45, y: 15 },
          { opacity: 1, x: 0, y: 0, duration: 1.4, ease: 'expo.out', delay: 0.12 }
        );
      }
    }, heroContainerRef);

    // 4. Interactive 3D mouse tilt on the moon sphere with gentle smooth damping
    const handleMouseMove = (e: MouseEvent) => {
      if (!moonRef.current) return;
      const { innerWidth, innerHeight } = window;
      const xRot = (e.clientY / innerHeight - 0.5) * -18;
      const yRot = (e.clientX / innerWidth - 0.5) * 18;

      gsap.to(moonRef.current, {
        rotationX: xRot,
        rotationY: yRot,
        duration: 1.0,
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
    <section ref={heroContainerRef} className="relative min-h-[102vh] pt-32 sm:pt-36 pb-28 flex flex-col items-center justify-center overflow-hidden bg-transparent">
      {/* 3D Pure Tsukuyomi Red Moon (Full Bleed Edge-to-Edge Sphere - ZERO Black Margins, NO Borders) */}
      <div
        className="relative z-[2] mb-12 sm:mb-16 flex flex-col items-center justify-center cursor-pointer pointer-events-auto"
        style={{ perspective: '1200px' }}
        title="Scroll the page or move mouse to rotate the 3D Red Moon"
      >
        {/* Soft Crimson Celestial Halo Bloom */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px] rounded-full bg-red-600/35 blur-[75px] pointer-events-none animate-pulse" />

        {/* 3D Rotating Pure Moon Sphere - 100% Full-Bleed Edge-to-Edge Circle */}
        <div
          ref={moonRef}
          className="w-56 h-56 sm:w-72 sm:h-72 lg:w-[340px] lg:h-[340px] rounded-full relative overflow-hidden transition-transform duration-100 ease-out border-0"
          style={{
            transformStyle: 'preserve-3d',
            boxShadow: '0 0 70px rgba(220, 38, 38, 0.65)',
          }}
        >
          {/* Full-Bleed Moon Artwork (Edge-to-Edge 100% Filled Lunar Surface) */}
          <Image
            src="/images/full-bleed-moon.jpg"
            alt="3D Pure Tsukuyomi Blood Moon"
            fill
            priority
            className="object-cover object-center filter brightness-[1.05] contrast-[1.2] scale-[1.12]"
          />
        </div>

        {/* 3D Moon Label */}
        <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-black/80 border border-red-500/30 text-[11px] text-red-300 font-mono pointer-events-none backdrop-blur-md">
          <Moon className="w-3.5 h-3.5 text-red-400 fill-red-400" />
          <span>3D Tsukuyomi Moon • Lenis Smooth Scroll</span>
        </div>
      </div>

      {/* Hero Content Container with comfortable spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Slides from LEFT via GSAP */}
          <div ref={leftColRef} className="lg:col-span-6 text-center lg:text-left space-y-6">
            {/* Uchiha Clan Protocol Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold shadow-glow-red backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>Uchiha Clan Discipline Protocol • ₹49 Lifetime</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight font-heading">
              Turn Your Habits <br />
              <span className="shimmer-text text-red-500">Into Shinobi Power.</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Ascend under the Crimson Moon. Conquer daily missions, protect unbroken streaks,
              and awaken legendary Uchiha Sharingan ranks.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1 relative z-20">
              <Link href="/signup" className="w-full sm:w-auto cursor-pointer">
                <Button variant="glow-purple" size="md" className="w-full sm:w-auto font-bold text-sm px-6 py-3.5 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-lg shadow-red-600/30 hover:scale-[1.02] cursor-pointer">
                  <Flame className="w-4 h-4 mr-2 text-amber-300 fill-amber-300" />
                  Awaken Clan Access — ₹49
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="#pricing" className="w-full sm:w-auto cursor-pointer">
                <Button variant="secondary" size="md" className="w-full sm:w-auto text-sm text-slate-200 border-slate-700 hover:border-red-500/50 cursor-pointer">
                  View ₹49 Pass Details
                </Button>
              </Link>
            </div>

            {/* Micro proof badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-mono pointer-events-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Real-Time Calendar Sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>100% Private Isolated Vault</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Uchiha Rank Progression</span>
              </div>
            </div>
          </div>

          {/* Right Column: Slides from RIGHT via GSAP with Semi-Transparent Frosted 3D Glass */}
          <div ref={rightColRef} className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md">
              {/* Subtle Glowing Outer Bloom */}
              <div className="absolute -inset-1.5 bg-red-600/20 rounded-[26px] blur-xl opacity-40 pointer-events-none" />

              {/* Main Card Container with Semi-Transparent Frosted Glass */}
              <div className="relative bg-black/65 border border-red-500/35 rounded-[24px] p-5 backdrop-blur-xl shadow-2xl space-y-4 overflow-hidden">
                {/* Mangekyo Sharingan Header Artwork */}
                <div className="relative h-36 rounded-xl overflow-hidden border border-red-500/30">
                  <Image
                    src="/images/mangekyo-card.jpg"
                    alt="Mangekyo Sharingan Pinwheel"
                    fill
                    className="object-cover object-center filter brightness-[1.05] contrast-[1.2]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                  {/* Character Info Tag over Image */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-black text-white text-base">Mangekyō Sharingan</span>
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[9px] shadow-glow-red">
                          RANK S ACTIVE
                        </span>
                      </div>
                      <span className="text-[10px] text-red-300 font-mono">Tsukuyomi Perception Domain</span>
                    </div>

                    <div className="text-right bg-black/80 px-2.5 py-1 rounded-lg border border-red-500/40">
                      <div className="text-[8px] text-slate-400 font-mono">Streak</div>
                      <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                        <Flame className="w-3 3.5 text-amber-400 fill-amber-400 animate-pulse" />
                        14 Days
                      </div>
                    </div>
                  </div>
                </div>

                {/* Level & XP Gauge */}
                <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-1.5 backdrop-blur-md">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-red-300 font-heading">UCHIHA LEVEL 12 (3-TOMOE JŌNIN)</span>
                    <span className="text-slate-400 font-mono text-[11px]">{demoXP} / 2,800 XP</span>
                  </div>
                  <ProgressBar value={(demoXP / 2800) * 100} variant="purple" height="sm" />
                </div>

                {/* Interactive Daily Quests */}
                <div className="space-y-2 relative z-20">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 px-1">
                    <span>DAILY MISSIONS (CLICK TO COMPLETE)</span>
                    <span className="text-red-400 font-mono">{completedCount} / 3 COMPLETED</span>
                  </div>

                  {/* Quest 1 */}
                  <button
                    type="button"
                    onClick={(e) => toggleDemo('quest-1', e)}
                    className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      completedDemo['quest-1']
                        ? 'bg-red-950/40 border-red-500/60 text-slate-200 shadow-sm'
                        : 'bg-black/50 border-slate-800 hover:border-red-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          completedDemo['quest-1'] ? 'bg-red-600 text-white shadow-glow-red' : 'border border-slate-600'
                        }`}
                      >
                        {completedDemo['quest-1'] && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs ${completedDemo['quest-1'] ? 'line-through text-slate-400' : 'font-medium text-white'}`}>
                        Katon Training & Coding Mastery (2 hrs)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-red-400">+35 XP</span>
                  </button>

                  {/* Quest 2 */}
                  <button
                    type="button"
                    onClick={(e) => toggleDemo('quest-2', e)}
                    className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      completedDemo['quest-2']
                        ? 'bg-red-950/40 border-red-500/60 text-slate-200 shadow-sm'
                        : 'bg-black/50 border-slate-800 hover:border-red-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          completedDemo['quest-2'] ? 'bg-red-600 text-white shadow-glow-red' : 'border border-slate-600'
                        }`}
                      >
                        {completedDemo['quest-2'] && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs ${completedDemo['quest-2'] ? 'line-through text-slate-400' : 'font-medium text-white'}`}>
                        Taijutsu Workout: 100 Pushups & 5km Run
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-rose-400">+50 XP</span>
                  </button>

                  {/* Quest 3 */}
                  <button
                    type="button"
                    onClick={(e) => toggleDemo('quest-3', e)}
                    className={`w-full p-2.5 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                      completedDemo['quest-3']
                        ? 'bg-red-950/40 border-red-500/60 text-slate-200 shadow-sm'
                        : 'bg-black/50 border-slate-800 hover:border-red-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          completedDemo['quest-3'] ? 'bg-red-600 text-white shadow-glow-red' : 'border border-slate-600'
                        }`}
                      >
                        {completedDemo['quest-3'] && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs ${completedDemo['quest-3'] ? 'line-through text-slate-400' : 'font-medium text-white'}`}>
                        Genjutsu Focus: Read 20 Pages Deep Work
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-400">+20 XP</span>
                  </button>
                </div>

                {/* Active Familiar Tag */}
                <div className="pt-1.5 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🦅</span>
                    <span className="text-red-300 text-xs font-medium">Active Familiar: Itachi's Karasu Crow</span>
                  </div>
                  <span className="text-red-400 font-mono text-[9px]">Tap to earn XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
