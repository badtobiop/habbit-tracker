import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, RefreshCw, CheckCircle2, HelpCircle } from 'lucide-react';

export default function RefundPolicyPage() {
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
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Customer Satisfaction Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            Cancellation & Refund Policy
          </h1>
          <p className="text-sm text-slate-300">
            Clear guidelines on digital lifetime pass fulfillment and refund requests.
          </p>
        </div>

        <div className="p-6 sm:p-10 rounded-3xl bg-black/65 border border-red-500/30 backdrop-blur-2xl shadow-2xl space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1. Digital Service Nature
            </h2>
            <p>
              UchihaHabit is an instant-access digital web software product. Upon successful payment of ₹49, your account is immediately granted lifetime access to all platform features.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              2. 7-Day Money Back Support
            </h2>
            <p>
              If you experience technical issues where your account was charged but access was not unlocked, or if you face genuine unresolved technical bugs within 7 days of purchase, please email us with your Payment ID at <span className="text-red-400 font-mono font-bold">utkarshdhakane2@gmail.com</span>. We will gladly investigate and process a full refund to your original payment method within 5-7 business days.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              3. Cancellation of Subscriptions
            </h2>
            <p>
              Because UchihaHabit is a <strong>one-time ₹49 lifetime purchase</strong> (not a recurring monthly subscription), there are no recurring charges to cancel. You will never be charged twice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white font-heading">
              4. Duplicate Transactions
            </h2>
            <p>
              In the event of accidental duplicate payments caused by network drops during UPI checkout, duplicate charges will be automatically refunded within 3-5 working days.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
