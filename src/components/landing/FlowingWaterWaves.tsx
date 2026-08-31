'use client';

import React from 'react';

export function FlowingWaterWaves() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-44 sm:h-56 lg:h-64 pointer-events-none z-0 overflow-hidden select-none">
      {/* Bioluminescent Ocean Glow Ambient Radial Bloom */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-cyan-950/60 via-sky-950/30 to-transparent blur-xl" />

      {/* Wave Layer 1 (Deep Ocean Flow - Slow & Deep) */}
      <div className="absolute bottom-0 left-0 right-0 w-[200%] h-24 sm:h-32 opacity-40 animate-wave-slow">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full text-cyan-700/30 fill-current"
        >
          <path d="M0,0 C150,90 350,-40 500,50 C650,140 900,10 1200,40 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* Wave Layer 2 (Bioluminescent Cyan Shimmer - Medium Speed) */}
      <div className="absolute bottom-0 left-0 right-0 w-[200%] h-20 sm:h-28 opacity-55 animate-wave-medium">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full text-sky-500/35 fill-current filter drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
        >
          <path d="M0,30 C200,100 450,0 600,60 C750,120 1000,20 1200,50 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* Wave Layer 3 (Surface Gentle Ripples - Fast & Ethereal) */}
      <div className="absolute bottom-0 left-0 right-0 w-[200%] h-14 sm:h-20 opacity-70 animate-wave-fast">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-full text-cyan-300/40 fill-current filter drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]"
        >
          <path d="M0,50 C300,110 500,20 700,70 C900,120 1100,40 1200,60 L1200,120 L0,120 Z" />
        </svg>
      </div>

      {/* Subtle Bottom Horizon Mist Line */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#040814] via-[#040814]/70 to-transparent" />
    </div>
  );
}
