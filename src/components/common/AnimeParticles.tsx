'use client';

import React, { useEffect, useRef } from 'react';

export function AnimeParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle crimson/amber ember motes
    const particleCount = Math.min(25, Math.floor(window.innerWidth / 50));
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedY: -(Math.random() * 0.35 + 0.12),
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.4 ? '#ef4444' : Math.random() > 0.2 ? '#dc2626' : '#f97316',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render calm embers
      for (const p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background Soft Crimson Ambient Vignette */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70vw] h-[450px] bg-red-600/10 rounded-full blur-[160px]" />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />
    </div>
  );
}
