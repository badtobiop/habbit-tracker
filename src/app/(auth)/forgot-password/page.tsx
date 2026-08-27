'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { validateEmailAddress } from '@/lib/email-validator';
import { Flame, Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/common/ToastContext';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  // Step 1 = Enter Email, Step 2 = Enter OTP & New Password
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // STEP 1: SEND OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDevOtpHint(null);

    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-otp',
          email: emailValidation.normalizedEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP code.');
        setLoading(false);
        return;
      }

      if (data.otpHint) {
        setDevOtpHint(data.otpHint);
      }

      showToast({
        type: 'success',
        title: 'OTP Dispatched!',
        message: `6-digit security code sent to ${emailValidation.normalizedEmail}.`,
      });

      setStep(2);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err?.message || 'Connection error while sending OTP. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP AND RESET PASSWORD
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code received in your email.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-and-reset',
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify OTP.');
        setLoading(false);
        return;
      }

      setSuccessMsg(data.message || 'Password successfully updated!');
      showToast({
        type: 'success',
        title: 'Hunter Key Reset Successful!',
        message: 'Your password has been changed. Redirecting to login...',
      });

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err?.message || 'Connection error. Please check your network.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Cosmic Background */}
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

      {/* Glow Aura */}
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
            {step === 1 ? 'Recover Hunter Account' : 'Verify Email OTP'}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {step === 1
              ? 'Enter your registered email to receive a secure 6-digit verification code.'
              : `Enter the 6-digit OTP code sent to ${email} to set your new password.`}
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
          ) : step === 1 ? (
            /* STEP 1: ENTER EMAIL */
            <form onSubmit={handleSendOtp} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center gap-2.5 text-xs text-red-200 shadow-glow-red">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  Registered Gmail / Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. utkarshdhakane2@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
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
                Send 6-Digit OTP Code
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <Link href="/login" className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
                <Link href="/signup" className="text-red-400 hover:text-red-300 font-bold hover:underline">
                  Create Account
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: ENTER OTP & NEW PASSWORD */
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center gap-2.5 text-xs text-red-200 shadow-glow-red">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {devOtpHint && (
                <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-xs text-amber-200">
                  <span className="font-bold">Security OTP Code:</span> <span className="font-mono text-white text-sm tracking-widest">{devOtpHint}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300 font-mono">
                    6-Digit Email OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                    }}
                    className="text-[11px] text-red-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <RefreshCw className="w-3 h-3" /> Change Email
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-center font-mono font-bold text-lg tracking-widest placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors backdrop-blur-md"
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
                Verify OTP & Reset Password
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Resend OTP
                </button>
                <Link href="/login" className="text-slate-400 hover:text-white">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
