import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, ShieldCheck, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <Lock className="w-3.5 h-3.5" />
            <span>Data Privacy Standards • DPDP Act Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-300">
            We value your personal privacy and handle your habit logs and account credentials with military-grade encryption.
          </p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-black/65 border border-red-500/30 backdrop-blur-2xl shadow-2xl space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1. Information We Collect
            </h2>
            <p>
              When you create an account, we collect your alias name, genuine email address, and a securely salted bcrypt-hashed password. We also store the habit logs, completion checkmarks, and reflection notes you create inside your journal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              2. Payment Data Security
            </h2>
            <p>
              We do <strong>NOT</strong> store or have access to your credit card numbers, debit card PINs, CVVs, or UPI MPINs. All payments are processed directly and securely via Razorpay in compliance with RBI guidelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              3. Data Retention & Zero 3rd-Party Sales
            </h2>
            <p>
              We will never sell, rent, or trade your personal email address or habit tracking data to advertisers, data brokers, or third-party marketing companies. Your productivity logs belong exclusively to you.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              4. Cookies & Session Storage
            </h2>
            <p>
              We use secure, HttpOnly session cookies solely to keep you authenticated without requiring you to repeatedly re-enter your password on every page visit.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              5. Contacting Privacy Support
            </h2>
            <p>
              If you have any questions regarding your data privacy or wish to request data erasure, contact us at: <span className="text-red-400 font-mono font-bold">utkarshdhakane2@gmail.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
