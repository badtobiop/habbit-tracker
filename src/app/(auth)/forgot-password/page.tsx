'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Flame, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1.5px] shadow-glow-purple">
              <div className="w-full h-full bg-cyber-950 rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-white">
              ANIME<span className="text-purple-400">HABIT</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading">
            Reset Secret Hunter Key
          </h2>
          <p className="text-xs text-slate-400">
            Enter your hunter email address to receive password recovery coordinates.
          </p>
        </div>

        <Card glow="purple" className="p-8 bg-cyber-900/90 border-purple-500/30">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Recovery Link Dispatched</h3>
              <p className="text-xs text-slate-300">
                If an account exists for <span className="text-purple-300 font-mono">{email}</span>, password reset instructions have been transmitted.
              </p>
              <Link href="/login" className="block pt-2">
                <Button variant="secondary" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Hunter Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="hunter@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cyber-950/90 border border-slate-700 focus:border-purple-500 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                  />
                </div>
              </div>

              <Button variant="glow-purple" size="lg" type="submit" className="w-full font-bold">
                Send Recovery Key
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
