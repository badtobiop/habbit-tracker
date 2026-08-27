'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Flame, Zap, Volume2, ArrowDown, Eye } from 'lucide-react';
import { playAnimeSound } from '@/lib/utils';

export function AnimeEyeIntro() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [awakened, setAwakened] = useState(false);
  const [isSharinganActive, setIsSharinganActive] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAwakened(true);
    }, 400);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 30;
      const y = (e.clientY / innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const eyeScale = Math.max(0.85, 1 + scrollY * 0.0008);
  const eyeOpacity = Math.max(0.3, 1 - scrollY * 0.0016);
  const textTranslate = scrollY * 0.35;

  const handleAwakenSharingan = () => {
    setIsSharinganActive(true);
    playAnimeSound('sharingan_awaken');
    setTimeout(() => {
      setIsSharinganActive(false);
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden border-b border-red-500/20 bg-cyber-950"
      style={{ minHeight: '520px' }}
    >
      {/* Background Uchiha Mangekyo & Rinnegan Awakening Visual */}
      <div
        className={`absolute inset-0 transition-transform duration-700 ease-out pointer-events-none ${
          isSharinganActive ? 'scale-105 filter brightness-125' : ''
        }`}
        style={{
          transform: `scale(${eyeScale}) translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)`,
          opacity: eyeOpacity,
        }}
      >
        <Image
          src="/images/anime-eyes.jpg"
          alt="Uchiha Mangekyo Sharingan Awakening"
          fill
          priority
          className="object-cover object-center filter brightness-[0.8] contrast-[1.25]"
        />

        {/* Ambient Dark Red & Purple Amaterasu Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-950 via-cyber-950/40 to-cyber-950/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-950/90 via-transparent to-cyber-950/90" />
      </div>

      {/* Crimson Mangekyo & Susanoo Violet Aura Pulse */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          awakened ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Left Crimson Mangekyo Aura Point */}
        <div
          className={`absolute top-[40%] left-[30%] w-40 h-40 bg-red-600/40 rounded-full blur-[45px] transition-all duration-300 ${
            isSharinganActive ? 'scale-150 bg-red-500/70 animate-ping' : 'animate-pulse'
          }`}
          style={{
            transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
          }}
        />

        {/* Right Rinnegan Violet Aura Point */}
        <div
          className={`absolute top-[40%] right-[30%] w-40 h-40 bg-purple-600/50 rounded-full blur-[45px] transition-all duration-300 ${
            isSharinganActive ? 'scale-150 bg-purple-400/80 animate-ping' : 'animate-pulse'
          }`}
          style={{
            transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
          }}
        />
      </div>

      {/* Floating Foreground Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 flex flex-col items-center justify-center text-center z-10 space-y-5">
        {/* Clan Uchiha Header Pill */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono font-bold shadow-glow-red backdrop-blur-xl animate-bounce pointer-events-none"
          style={{ transform: `translateY(${-textTranslate * 0.2}px)` }}
        >
          <Flame className="w-4 h-4 text-red-400 fill-red-400 animate-pulse" />
          <span>[UCHIHA CLAN PROTOCOL: MANGEKYŌ SHARINGAN AWAKENING]</span>
        </div>

        {/* Title */}
        <div
          className="space-y-2 transition-transform duration-300 pointer-events-none"
          style={{ transform: `translateY(${-textTranslate * 0.4}px)` }}
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-heading leading-tight">
            AWAKEN THE <span className="shimmer-text text-red-500 text-glow-red">UCHIHA DISCIPLINE</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-mono">
            Conquer your procrastination with the visual prowess of the Sharingan. Rule your daily habits without mercy.
          </p>
        </div>

        {/* Authentic Sharingan Trigger Button */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 pt-2 relative z-20"
          style={{ transform: `translateY(${-textTranslate * 0.5}px)` }}
        >
          <button
            onClick={handleAwakenSharingan}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-950 via-red-900 to-purple-950 border border-red-500/60 text-red-200 text-xs sm:text-sm font-mono font-black hover:scale-105 active:scale-95 transition-all shadow-glow-red cursor-pointer"
          >
            <Eye className="w-4 h-4 text-red-400 fill-red-400 animate-spin" />
            <span>🔥 Awaken Mangekyō Sharingan</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-500/40 px-3.5 py-2 rounded-xl pointer-events-none">
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            <span>Scroll Down to Enter Clan Domain</span>
          </div>
        </div>
      </div>
    </div>
  );
}
