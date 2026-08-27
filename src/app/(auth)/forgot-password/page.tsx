'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { validateEmailAddress } from '@/lib/email-validator';
import { Flame, Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { useToast } from '@/components/common/ToastContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid email address');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailValidation.normalizedEmail,
          newPassword,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: `Server error (${res.status})` };
      }

      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Password successfully updated!');
      showToast({
        type: 'success',
        title: 'Hunter Key Reset Successful!',
        message: 'Your password has been changed. You can now login.',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Password reset network error:', err);
      setError(err?.message || 'Connection error. Please check your network.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Full-Page Cosmic Blood Nebula Background */}
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

      {/* Floating Aura */}
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            Reset Secret Hunter Key
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Enter your registered email and choose a new master password.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 bg-black/65 border-2 border-red-500/35 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-6">
          {successMsg ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-glow-emerald">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">Secret Key Updated!</h3>
              <p className="text-xs text-emerald-200">
                {successMsg} Redirecting to login portal...
              </p>
              <Link href="/login" className="block pt-2">
                <Button variant="glow-purple" className="w-full bg-red-600 hover:bg-red-500 border-red-500">
                  Proceed to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center gap-2.5 text-xs text-red-200 shadow-glow-red">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="utkarshdhakane2@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors backdrop-blur-md"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  New Master Password (Min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors backdrop-blur-md"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors backdrop-blur-md"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="glow-purple"
                size="lg"
                className="w-full font-bold text-sm py-3.5 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-lg shadow-red-600/30 cursor-pointer mt-2"
                isLoading={loading}
              >
                Reset Password & Unlock Vault
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <Link href="/login" className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
                <Link href="/signup" className="text-red-400 hover:text-red-300 font-bold hover:underline">
                  Create New Account
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
