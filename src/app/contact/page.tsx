import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, MapPin, Clock, MessageSquare, Flame } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-slate-100 relative overflow-hidden py-16 px-4 sm:px-8">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/blood-nebula-bg.jpg"
          alt="Cosmic Nebula"
          fill
          priority
          className="object-cover object-center filter brightness-[0.35] contrast-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-black/95" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support & Queries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Contact Support & Operational Details
          </h1>
          <p className="text-sm text-slate-300">
            Have questions about your ₹49 lifetime pass, technical feedback, or partnership queries?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-black/65 border border-red-500/30 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shadow-glow-red">
              <Mail className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Official Support Email</h3>
            <p className="text-xs text-slate-300">
              For direct assistance, payment verification, or feature suggestions:
            </p>
            <div className="p-3 rounded-xl bg-black/80 border border-slate-800 text-sm font-mono text-red-300 font-bold">
              utkarshdhakane2@gmail.com
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-black/65 border border-red-500/30 backdrop-blur-2xl shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shadow-glow-red">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Response Timings</h3>
            <p className="text-xs text-slate-300">
              Queries received are typically resolved within 24 to 48 hours.
            </p>
            <div className="p-3 rounded-xl bg-black/80 border border-slate-800 text-xs font-mono text-slate-300">
              Mon - Sat: 9:00 AM - 8:00 PM IST
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-black/65 border border-red-500/30 backdrop-blur-2xl shadow-2xl space-y-2">
          <div className="text-xs font-mono uppercase text-red-400 font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Operational Location
          </div>
          <p className="text-xs text-slate-300">
            Maharashtra, India. Operated as an independent digital web software product.
          </p>
        </div>
      </div>
    </div>
  );
}
