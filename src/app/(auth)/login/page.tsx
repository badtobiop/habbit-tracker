'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { validateEmailAddress } from '@/lib/email-validator';
import { Flame, Sparkles, Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/components/common/ToastContext';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid, active email address');
      return;
    }

    if (!password) {
      setError('Please enter your secret password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailValidation.normalizedEmail, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      showToast({
        type: 'success',
        title: `Welcome back, ${data.user.name}!`,
        message: 'Your shinobi vault is unlocked.',
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Connection failed. Please check your network.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Full-Page Fixed Cosmic Blood Nebula Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/blood-nebula-bg.jpg"
          alt="Cosmic Blood Nebula"
          fill
          priority
          className="object-cover object-center filter brightness-[0.45] contrast-[1.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90" />
      </div>

      {/* Background glow aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6 my-auto">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-800 p-[1.5px] shadow-glow-red">
              <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-500 fill-red-500/30" />
              </div>
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-white">
              UCHIHA<span className="text-red-500">HABIT</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading">
            Resume Your Shinobi Journey
          </h2>
          <p className="text-xs text-slate-300">
            Sign in to check off daily quests and protect your unbroken streak flame.
          </p>
        </div>

        {/* Login Card with Semi-Transparent Frosted 3D Glass */}
        <div className="p-6 sm:p-8 bg-black/65 border-2 border-red-500/35 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-5">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2.5 shadow-glow-red">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 font-mono">Registered Gmail / Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 focus:border-red-500 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 font-mono">Secret Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 focus:border-red-500 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
                />
              </div>
            </div>

            <Button
              variant="glow-purple"
              size="lg"
              isLoading={loading}
              type="submit"
              className="w-full font-bold text-sm py-3.5 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <Flame className="w-4 h-4 mr-2 text-amber-300 fill-amber-300" />
              Enter Shinobi Domain
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-bit encrypted authentication • Anti-bruteforce active</span>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 pt-3 border-t border-slate-800">
            Don't have an account yet?{' '}
            <Link href="/signup" className="text-red-400 hover:text-red-300 font-bold hover:underline">
              Awaken Here (₹49)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
