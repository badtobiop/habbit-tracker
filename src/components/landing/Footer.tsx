import React from 'react';
import Link from 'next/link';
import { Moon, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#040814]/90 py-12 text-slate-400 text-sm relative z-10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-950/80 border border-sky-400/40 flex items-center justify-center shadow-glow-cyan">
              <Moon className="w-4 h-4 text-sky-300 fill-sky-300/30" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-white tracking-tight">
                LUNAR<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">HABIT</span>
              </span>
              <span className="text-[8px] uppercase tracking-widest text-sky-400 font-mono -mt-1">
                Mindful Sanctuary Protocol
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
            <Link href="/login" className="hover:text-sky-300 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="hover:text-sky-300 transition-colors">
              Signup (₹49)
            </Link>
            <Link href="#features" className="hover:text-sky-300 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-sky-300 transition-colors">
              Sanctuary Pass
            </Link>
            <Link href="/terms" className="hover:text-sky-300 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-sky-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund" className="hover:text-sky-300 transition-colors">
              Refund Policy
            </Link>
            <Link href="/contact" className="hover:text-sky-300 transition-colors">
              Contact & Support
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-6 border-t border-sky-500/10 text-center space-y-2">
          <p className="text-[11px] text-slate-400 max-w-3xl mx-auto leading-relaxed">
            <strong>Disclaimer:</strong> LunarHabit is an independent mindful habit tracking application. All payments are securely processed via Razorpay.
          </p>
          <div className="text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>© {new Date().getFullYear()} LunarHabit Sanctuary. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
