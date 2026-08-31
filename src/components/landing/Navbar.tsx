'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Moon, Sparkles, Menu, X, ArrowRight, Compass } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; level: number } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#040814]/85 backdrop-blur-xl border-b border-sky-500/25 py-2.5 shadow-xl shadow-black/50'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-sky-950/80 border border-sky-400/50 flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow-cyan">
            <Moon className="w-4 h-4 text-sky-300 fill-sky-300/30" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-lg tracking-tight text-white flex items-center">
              LUNAR<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">HABIT</span>
            </span>
            <span className="text-[8px] uppercase tracking-widest text-sky-400 font-mono -mt-1">
              Peaceful Sanctuary
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <Link href="#features" className="hover:text-sky-300 transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-sky-300 transition-colors">
            How It Works
          </Link>
          <Link href="#sanctuary-levels" className="hover:text-sky-300 transition-colors">
            Mastery Ranks
          </Link>
          <Link href="#pricing" className="hover:text-sky-300 transition-colors">
            Sanctuary Pass (₹49)
          </Link>
          <Link href="#faq" className="hover:text-sky-300 transition-colors">
            FAQ
          </Link>
        </div>

        {/* Smart Auth CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white border border-sky-500/25 bg-ocean-950/60 hover:bg-ocean-900/80 rounded-xl">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="glow-cyan" size="sm" className="text-xs bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 border-sky-400/50 rounded-xl font-bold shadow-glow-cyan">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-sky-200" />
              Join Sanctuary (₹49)
            </Button>
          </Link>
          {user && (
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" className="text-xs border-sky-500/40 text-sky-300 bg-sky-950/40 hover:bg-sky-900/50 rounded-xl font-semibold">
                Dashboard
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-ocean-950/80 border border-sky-500/30"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#040814]/95 border-b border-sky-500/25 px-6 py-5 space-y-3.5 backdrop-blur-2xl">
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-sky-300 text-sm font-medium"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-sky-300 text-sm font-medium"
          >
            How It Works
          </Link>
          <Link
            href="#sanctuary-levels"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-sky-300 text-sm font-medium"
          >
            Mastery Ranks
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-sky-300 text-sm font-medium"
          >
            Sanctuary Pass (₹49)
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-sky-300 text-sm font-medium"
          >
            FAQ
          </Link>
          <div className="pt-3 flex flex-col gap-2.5 border-t border-sky-500/20">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="sm" className="w-full text-xs border-sky-500/30">
                Sign In to Sanctuary
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="glow-cyan" size="sm" className="w-full text-xs bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 font-bold">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Join Sanctuary (₹49)
              </Button>
            </Link>
            {user && (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full text-xs border-sky-500/40 text-sky-300">
                  Go to Dashboard ({user.name})
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
