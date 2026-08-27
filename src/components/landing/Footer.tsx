import React from 'react';
import Link from 'next/link';
import { Flame, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-black/85 py-12 text-slate-400 text-sm relative z-10 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center shadow-glow-red">
              <Flame className="w-4 h-4 text-red-500 fill-red-500/30" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-white tracking-tight">
                UCHIHA<span className="text-red-500">HABIT</span>
              </span>
              <span className="text-[8px] uppercase tracking-widest text-slate-500 font-mono -mt-1">
                Productivity Protocol
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
            <Link href="/login" className="hover:text-red-400 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="hover:text-red-400 transition-colors">
              Signup (₹49)
            </Link>
            <Link href="#features" className="hover:text-red-400 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-red-400 transition-colors">
              Pricing
            </Link>
            <Link href="/terms" className="hover:text-red-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-red-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund" className="hover:text-red-400 transition-colors">
              Refund Policy
            </Link>
            <Link href="/contact" className="hover:text-red-400 transition-colors">
              Contact & Support
            </Link>
          </div>
        </div>

        {/* Legal Disclaimer & Razorpay Compliance */}
        <div className="pt-6 border-t border-slate-900 text-center space-y-2">
          <p className="text-[11px] text-slate-400 max-w-3xl mx-auto leading-relaxed">
            <strong>Disclaimer:</strong> UchihaHabit is an independent digital gamified habit tracker. All character and concept references are fan-inspired homages under fair-use. All payments are securely processed via Razorpay.
          </p>
          <div className="text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>© {new Date().getFullYear()} UchihaHabit. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
