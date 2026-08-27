'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AVATAR_OPTIONS, AvatarBadge } from '@/components/ui/AvatarBadge';
import { COMPANIONS_CATALOG } from '@/lib/anime-constants';
import { validateEmailAddress } from '@/lib/email-validator';
import {
  Flame,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Shield,
  Check,
  KeyRound,
  RefreshCw,
  Gift,
  CreditCard,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/components/common/ToastContext';
import { playAnimeSound } from '@/lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Wizard Step: 1 = Details & Persona, 2 = Verify Email & Set Password, 3 = Payment / Unlock
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('sasuke_mangekyo');
  const [selectedCompanion, setSelectedCompanion] = useState('shadow_wolf');

  // Giveaway & Payment state for Step 3
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'phonepe' | 'card'>('phonepe');

  // UI status
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ----------------------------------------------------
  // STEP 1: SEND SIGNUP OTP TO USER'S REAL EMAIL
  // ----------------------------------------------------
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your shinobi username / alias.');
      return;
    }

    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid, active email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-otp',
          name: name.trim(),
          email: emailValidation.normalizedEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to dispatch verification code. Please check your email.');
        setLoading(false);
        return;
      }

      showToast({
        type: 'success',
        title: '6-Digit Code Dispatched! 📬',
        message: `We sent a verification code to ${emailValidation.normalizedEmail}.`,
      });

      setSuccessMessage(`A 6-digit OTP code was sent to ${emailValidation.normalizedEmail}. Check your inbox or spam folder.`);
      setStep(2);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError('Connection failed. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP 2: VERIFY OTP & CREATE PASSWORD
  // ----------------------------------------------------
  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (password.length < 6) {
      setError('Master Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-and-signup',
          name: name.trim(),
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          password,
          avatar: selectedAvatar,
          companion: selectedCompanion,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Verification failed. Please verify your OTP code.');
        setLoading(false);
        return;
      }

      playAnimeSound('sharingan_awaken');

      showToast({
        type: 'success',
        title: `🔥 Shinobi ${name} Awakened!`,
        message: 'Account successfully registered and verified!',
      });

      setStep(3);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError('Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // RESEND OTP
  // ----------------------------------------------------
  const handleResendOTP = async () => {
    setError('');
    setResending(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-otp',
          name: name.trim(),
          email: email.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast({
          type: 'success',
          title: 'New Code Sent!',
          message: `Fresh verification code sent to ${email}`,
        });
      } else {
        setError(data.error || 'Failed to resend code');
      }
    } catch {
      setError('Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  // ----------------------------------------------------
  // STEP 3: INSTANT ₹49 PAYMENT / GIVEAWAY CODE UNLOCK
  // ----------------------------------------------------
  const handlePayNow = async () => {
    setPayLoading(true);
    try {
      // Direct verification for seamless UPI activation
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: selectedMethod.toUpperCase(),
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        playAnimeSound('achievement_unlocked');
        showToast({
          type: 'success',
          title: '🔥 Lifetime Shinobi Pass Activated!',
          message: 'Welcome to the inner sanctum. All features permanently unlocked!',
        });
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(verifyData.error || 'Payment verification failed');
      }
    } catch {
      setError('Payment gateway error. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) {
      setError('Please enter a giveaway code.');
      return;
    }
    setPromoLoading(true);
    try {
      const res = await fetch('/api/payment/redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        playAnimeSound('achievement_unlocked');

        showToast({
          type: 'success',
          title: '🎁 100% Free Lifetime Pass Unlocked!',
          message: data.message,
        });
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Invalid or expired giveaway code.');
      }
    } catch {
      setError('Failed to redeem giveaway code.');
    } finally {
      setPromoLoading(false);
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

      {/* Floating Crimson Halo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-red-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6 my-auto">
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
            {step === 1 && 'Step 1: Enter Name & Email'}
            {step === 2 && 'Step 2: Verify Email & Create Password'}
            {step === 3 && 'Step 3: Awaken Lifetime Shinobi Pass'}
          </h2>

          {/* 3-Step Wizard Visual Indicator */}
          <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
              step === 1 ? 'bg-red-950/80 border-red-500 text-red-300 shadow-glow-red' : 'bg-black/60 border-slate-800 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Identity</span>
            </div>
            <div className="w-4 h-0.5 bg-slate-800" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
              step === 2 ? 'bg-red-950/80 border-red-500 text-red-300 shadow-glow-red' : 'bg-black/60 border-slate-800 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>OTP & Password</span>
            </div>
            <div className="w-4 h-0.5 bg-slate-800" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
              step === 3 ? 'bg-red-950/80 border-red-500 text-red-300 shadow-glow-red' : 'bg-black/60 border-slate-800 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              <span>₹49 Unlock</span>
            </div>
          </div>
        </div>

        {/* Signup Form Card */}
        <div className="p-6 sm:p-8 bg-black/70 border-2 border-red-500/35 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center gap-2.5 text-xs text-red-200 shadow-glow-red animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && step === 2 && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-2.5 text-xs text-emerald-200">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 1: IDENTITY & AVATAR SELECTION                  */}
          {/* ==================================================== */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                    Shinobi Alias / Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kakashi Hatake"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors backdrop-blur-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                    Your Real Gmail / Email Address <span className="text-red-400">*</span>
                  </label>
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors backdrop-blur-md"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    ⚡ We will send a real 6-digit OTP code to this email to verify you own it.
                  </p>
                </div>
              </div>

              {/* Choose Avatar Persona */}
              <div className="space-y-2.5 pt-3 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  Choose Shinobi Persona:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVATAR_OPTIONS.map((opt) => {
                    const isSelected = selectedAvatar === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedAvatar(opt.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-red-950/80 border-red-500 shadow-glow-red text-white'
                            : 'bg-black/55 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <AvatarBadge avatarId={opt.id} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{opt.name}</div>
                          <div className="text-[10px] text-red-400/90 font-mono">Rank Persona</div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Choose Companion Familiar */}
              <div className="space-y-2.5 pt-3 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  Select Spirit Familiar:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COMPANIONS_CATALOG.slice(0, 4).map((comp) => {
                    const isSelected = selectedCompanion === comp.id;
                    return (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => setSelectedCompanion(comp.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-red-950/80 border-red-500 shadow-glow-red text-white'
                            : 'bg-black/55 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-black/80 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                          {comp.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{comp.name}</div>
                          <div className="text-[10px] text-amber-400 font-mono truncate">{comp.buffDescription}</div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                variant="glow-purple"
                size="lg"
                className="w-full font-bold text-sm py-4 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-lg shadow-red-600/30 cursor-pointer"
                isLoading={loading}
              >
                <Mail className="w-4 h-4 mr-2 text-amber-300" />
                Send 6-Digit Verification Code
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          {/* ==================================================== */}
          {/* STEP 2: VERIFY OTP & CREATE PASSWORD                 */}
          {/* ==================================================== */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndSignup} className="space-y-6">
              <div className="p-3.5 rounded-2xl bg-black/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-mono text-slate-200">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-red-400 hover:text-red-300 underline font-mono"
                >
                  Change Email
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                    Enter 6-Digit Email OTP Code <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="e.g. 583921"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/70 border border-red-500/40 text-white text-lg tracking-widest font-mono text-center placeholder-slate-600 focus:outline-none focus:border-red-500 focus:shadow-glow-red transition-all"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400 font-mono">
                    <span>Code valid for 10 minutes</span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resending}
                      className="text-red-400 hover:text-red-300 underline flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                      Resend Code
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                    Create Master Password (Min 6 chars) <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors backdrop-blur-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                    Confirm Password <span className="text-red-400">*</span>
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
              </div>

              <Button
                type="submit"
                variant="glow-purple"
                size="lg"
                className="w-full font-bold text-sm py-4 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-lg shadow-red-600/30 cursor-pointer"
                isLoading={loading}
              >
                <Check className="w-4 h-4 mr-2 text-emerald-300" />
                Verify Code & Create Account
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          {/* ==================================================== */}
          {/* STEP 3: ₹49 PASS UNLOCK OR GIVEAWAY CODE             */}
          {/* ==================================================== */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center space-y-2 p-5 rounded-2xl bg-red-950/40 border border-red-500/40 shadow-glow-red">
                <div className="w-12 h-12 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center mx-auto text-2xl">
                  🔥
                </div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Welcome, Shinobi {name}!
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your account is verified! Unlock your <strong>₹49 Lifetime Shinobi Pass</strong> to start conquering daily quests and climbing the Uchiha clan ranks.
                </p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  Select Instant Payment Method (₹49):
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('phonepe')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedMethod === 'phonepe'
                        ? 'bg-red-950/80 border-red-500 shadow-glow-red text-white'
                        : 'bg-black/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 mx-auto mb-1 text-red-400" />
                    <span className="text-xs font-bold block">PhonePe / UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedMethod === 'upi'
                        ? 'bg-red-950/80 border-red-500 shadow-glow-red text-white'
                        : 'bg-black/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Flame className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                    <span className="text-xs font-bold block">GPay / Paytm</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      selectedMethod === 'card'
                        ? 'bg-red-950/80 border-red-500 shadow-glow-red text-white'
                        : 'bg-black/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <span className="text-xs font-bold block">Card / NetBank</span>
                  </button>
                </div>

                <Button
                  type="button"
                  onClick={handlePayNow}
                  variant="glow-purple"
                  size="lg"
                  className="w-full font-bold text-sm py-4 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-lg shadow-red-600/30 cursor-pointer"
                  isLoading={payLoading}
                >
                  <Flame className="w-4 h-4 mr-2 text-amber-300 fill-amber-300" />
                  Pay ₹49 & Unlock Full Shinobi Pass
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>

              {/* Or Redeem Giveaway Code */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span>Have a Free Giveaway Promo Code?</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter CODE (e.g. UCHIHA_GIFT_XXX)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                  <Button
                    type="button"
                    onClick={handleRedeemPromo}
                    isLoading={promoLoading}
                    variant="secondary"
                    size="sm"
                    className="text-xs border-purple-500/40 text-purple-200 hover:bg-purple-950/60"
                  >
                    Apply Code
                  </Button>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="text-xs text-slate-400 hover:text-slate-200 underline font-mono"
                >
                  Preview Dashboard First ➔
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* ALWAYS VISIBLE FOOTER: DIRECT LOGIN LINK             */}
          {/* ==================================================== */}
          <div className="text-center text-xs text-slate-300 pt-4 border-t border-slate-800 space-y-2">
            <div>
              Already have a Shinobi account?{' '}
              <Link href="/login" className="text-red-400 hover:text-red-300 font-bold underline ml-1 cursor-pointer">
                Log In to Shinobi Vault
              </Link>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Isolated database storage • 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
