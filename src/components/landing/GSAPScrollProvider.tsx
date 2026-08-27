'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function GSAPScrollProvider({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let lenis: Lenis | null = null;
    let updateLenisTicker: ((time: number) => void) | null = null;

    try {
      // 1. Initialize Lenis for luxurious smooth scrolling
      lenis = new Lenis({
        duration: 2.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
      });

      const onScroll = () => {
        try {
          ScrollTrigger.update();
        } catch (_) {}
      };

      lenis.on('scroll', onScroll);

      updateLenisTicker = (time: number) => {
        if (lenis) {
          lenis.raf(time * 1000);
        }
      };

      gsap.ticker.add(updateLenisTicker);
      gsap.ticker.lagSmoothing(0);
    } catch (err) {
      console.warn('Lenis smooth scroll initialization skipped:', err);
    }

    // 2. Safe GSAP animations context
    const ctx = gsap.context(() => {
      // Elements smoothly gliding in from LEFT
      gsap.utils.toArray<HTMLElement>('.gsap-slide-left').forEach((elem) => {
        gsap.fromTo(
          elem,
          { opacity: 0, x: -45, y: 15, scale: 0.98 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 1.4,
            ease: 'expo.out',
            force3D: true,
            scrollTrigger: {
              trigger: elem,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Elements smoothly gliding in from RIGHT
      gsap.utils.toArray<HTMLElement>('.gsap-slide-right').forEach((elem) => {
        gsap.fromTo(
          elem,
          { opacity: 0, x: 45, y: 15, scale: 0.98 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 1.4,
            ease: 'expo.out',
            force3D: true,
            scrollTrigger: {
              trigger: elem,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Standard smooth reveal with soft lift
      gsap.utils.toArray<HTMLElement>('.gsap-reveal').forEach((elem) => {
        gsap.fromTo(
          elem,
          { opacity: 0, y: 30, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.3,
            ease: 'expo.out',
            force3D: true,
            scrollTrigger: {
              trigger: elem,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Staggered grid cards smoothly cascading from left & right
      gsap.utils.toArray<HTMLElement>('.gsap-stagger-container').forEach((container) => {
        const items = container.querySelectorAll<HTMLElement>('.gsap-stagger-item');
        items.forEach((item, idx) => {
          const fromX = idx % 2 === 0 ? -35 : 35;
          gsap.fromTo(
            item,
            { opacity: 0, x: fromX, y: 20, scale: 0.97 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 1.3,
              delay: (idx % 3) * 0.08,
              ease: 'expo.out',
              force3D: true,
              scrollTrigger: {
                trigger: container,
                start: 'top 84%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      });
    }, containerRef);

    return () => {
      if (updateLenisTicker) {
        gsap.ticker.remove(updateLenisTicker);
      }
      if (lenis) {
        try {
          lenis.destroy();
        } catch (_) {}
        lenis = null;
      }
      ctx.revert();
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
