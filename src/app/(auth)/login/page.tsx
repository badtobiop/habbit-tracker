'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { validateEmailAddress } from '@/lib/email-validator';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle, Shield, Moon, Waves } from 'lucide-react';
import { useToast } from '@/components/common/ToastContext';
import { AmbientMusicPlayer } from '@/components/common/AmbientMusicPlayer';

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

      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = { error: `Server error (${res.status}). Please try again shortly.` };
      }

      if (!res.ok) {
        setError(data.error || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      showToast({
        type: 'success',
        title: `Welcome back, ${data.user?.name || 'Practitioner'}!`,
        message: 'Your sanctuary vault is unlocked.',
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Connection failed. Please check your network.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#040814]">
      {/* Full-Page Fixed Cosmic Mountain Ocean Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/lunar-mountain-ocean-bg.jpg"
          alt="Cosmic Mountain Ocean"
          fill
          priority
          className="object-cover object-center filter brightness-[0.6] contrast-[1.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040814]/85 via-[#040814]/75 to-[#040814]/90 pointer-events-none" />
      </div>

      {/* Subtle Glowing Cyan Halo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6 my-auto">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-500 to-sky-700 p-[1.5px] shadow-glow-cyan">
              <div className="w-full h-full bg-[#040814] rounded-[10px] flex items-center justify-center">
                <Moon className="w-5 h-5 text-sky-400 fill-sky-400/30" />
              </div>
            </div>
            <span className="font-heading font-black text-2xl tracking-tight text-white">
              LUNAR<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">HABIT</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight font-heading">
            Welcome Back to Your Sanctuary
          </h2>
          <p className="text-xs text-slate-300">
            Sign in to check off daily mindful habits and protect your flow state momentum.
          </p>
        </div>

        {/* Login Card with Frosted Ocean Glass */}
        <div className="p-6 sm:p-8 bg-[#040814]/85 border border-sky-500/35 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-5">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-sky-950/90 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2.5 shadow-lg">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 font-mono">Registered Email Address</label>
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-950/80 border border-sky-500/30 focus:border-sky-400 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-950/80 border border-sky-500/30 focus:border-sky-400 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
                />
              </div>
            </div>

            <Button
              variant="glow-cyan"
              size="lg"
              isLoading={loading}
              type="submit"
              className="w-full font-bold text-sm py-3.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 border-sky-400/50 shadow-glow-cyan cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mr-2 text-sky-200" />
              Enter Lunar Sanctuary
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>256-bit encrypted authentication • Private Vault</span>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 pt-3 border-t border-sky-500/15">
            Don't have an account yet?{' '}
            <Link href="/signup" className="text-sky-400 hover:text-sky-300 font-bold hover:underline">
              Join Sanctuary (₹49)
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Ambient Music */}
      <AmbientMusicPlayer />
    </div>
  );
}
