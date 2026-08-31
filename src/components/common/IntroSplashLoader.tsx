'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export function IntroSplashLoader() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Super fast snappy flash: 320ms spin, 480ms complete exit
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 320);

    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 480);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center transition-opacity duration-150 ease-out pointer-events-none select-none ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 3D Glowing Fast Spinning Moon Centerpiece */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Soft Cyan Bloom Glow */}
        <div className="absolute w-36 h-36 rounded-full bg-sky-400/35 blur-[45px] animate-pulse pointer-events-none" />

        {/* Snappy Fast Spinning Moon */}
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full relative overflow-hidden shadow-2xl animate-spin"
          style={{
            animationDuration: '0.35s',
            boxShadow: '0 0 50px rgba(56, 189, 248, 0.9), 0 0 20px rgba(255, 255, 255, 0.8)',
          }}
        >
          <Image
            src="/images/full-bleed-blue-moon.jpg"
            alt="Spinning Lunar Moon"
            fill
            priority
            className="object-cover object-center scale-[1.15] filter brightness-[1.1]"
          />
        </div>
      </div>
    </div>
  );
}
