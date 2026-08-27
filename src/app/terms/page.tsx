import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, FileText, AlertCircle } from 'lucide-react';

export default function TermsPage() {
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
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Documentation • Last Updated: August 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Terms & Conditions
          </h1>
          <p className="text-sm text-slate-300">
            Please review the terms of service governing the usage of UchihaHabit Productivity Platform.
          </p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-black/65 border border-red-500/30 backdrop-blur-2xl shadow-2xl space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using UchihaHabit, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and all applicable laws in the Republic of India.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              2. Digital Service & Lifetime Access
            </h2>
            <p>
              UchihaHabit provides a gamified daily habit tracking web application. The ₹49 payment grants a lifetime, single-user digital access pass to features including quest tracking, interactive calendar logs, leveling mechanics, and companion buffs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              3. User Account Security
            </h2>
            <p>
              Users are responsible for safeguarding their login credentials. Any unauthorized access resulting from compromised user passwords is the responsibility of the account holder.
            </p>
          </section>

          <section className="space-y-2 p-4 rounded-2xl bg-red-950/40 border border-red-500/30">
            <h2 className="text-base font-bold text-red-300 font-heading flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              4. Anime Lore Fair-Use & Fan Homage Disclaimer
            </h2>
            <p className="text-xs text-slate-300">
              UchihaHabit is an independent productivity web platform. Naruto, Uchiha, Sharingan, and related characters/terms are registered trademarks and copyrights of Masashi Kishimoto, Shueisha, Studio Pierrot, and TV Tokyo. This web application is a community fan homage created for habit building and self-discipline inspiration, and is not affiliated with, sponsored by, or endorsed by official copyright holders. All visual assets and interface elements are original digital designs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              5. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Maharashtra, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
