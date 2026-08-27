'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Flame, Sparkles, Menu, X, ArrowRight, User } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; level: number } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Check if visitor already has an active login session
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
          ? 'bg-black/75 backdrop-blur-xl border-b border-red-500/20 py-2.5 shadow-xl shadow-black/50'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow-red">
            <Flame className="w-4 h-4 text-red-500 fill-red-500/30" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-lg tracking-tight text-white flex items-center">
              UCHIHA<span className="text-red-500">HABIT</span>
            </span>
            <span className="text-[8px] uppercase tracking-widest text-slate-400 font-mono -mt-1">
              Sharingan Protocol
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-300">
          <Link href="#features" className="hover:text-red-400 transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-red-400 transition-colors">
            How It Works
          </Link>
          <Link href="#anime-rewards" className="hover:text-red-400 transition-colors">
            Clan Ranks
          </Link>
          <Link href="#pricing" className="hover:text-red-400 transition-colors">
            Pricing (₹49)
          </Link>
          <Link href="#faq" className="hover:text-red-400 transition-colors">
            FAQ
          </Link>
        </div>

        {/* Smart Auth CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white border border-slate-700/60 bg-black/40 hover:bg-black/60">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="glow-purple" size="sm" className="text-xs bg-red-600 hover:bg-red-500 border-red-500/40">
              <Flame className="w-3.5 h-3.5 mr-1 text-amber-300 fill-amber-300" />
              Sign Up (₹49)
            </Button>
          </Link>
          {user && (
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" className="text-xs border-red-500/40 text-red-300 bg-red-950/40 hover:bg-red-900/50">
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
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-black/60 border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/90 border-b border-red-500/20 px-6 py-5 space-y-3.5 backdrop-blur-2xl">
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-red-400 text-sm font-medium"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-red-400 text-sm font-medium"
          >
            How It Works
          </Link>
          <Link
            href="#anime-rewards"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-red-400 text-sm font-medium"
          >
            Clan Ranks
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-red-400 text-sm font-medium"
          >
            Pricing (₹49)
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-200 hover:text-red-400 text-sm font-medium"
          >
            FAQ
          </Link>
          <div className="pt-3 flex flex-col gap-2.5 border-t border-slate-800">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="sm" className="w-full text-xs">
                Sign In to Shinobi Vault
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="glow-purple" size="sm" className="w-full text-xs bg-red-600 hover:bg-red-500">
                <Flame className="w-3.5 h-3.5 mr-1" />
                Sign Up / Create Account (₹49)
              </Button>
            </Link>
            {user && (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full text-xs border-red-500/40 text-red-300">
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
