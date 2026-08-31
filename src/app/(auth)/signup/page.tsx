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
  Copy,
  Moon,
  Waves,
} from 'lucide-react';
import { useToast } from '@/components/common/ToastContext';
import { playAnimeSound } from '@/lib/utils';
import { AmbientMusicPlayer } from '@/components/common/AmbientMusicPlayer';

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

  // Step 3 Payment State
  const [activePaymentTab, setActivePaymentTab] = useState<'upi_direct' | 'razorpay' | 'giveaway'>('upi_direct');
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // UI status
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const upiId = 'dhakaneutkarsh0@okhdfcbank';
  const payeeName = 'Utkarsh Dhakane';
  const amount = 49;

  // Direct UPI Deep Link for Mobile Apps
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Lunar Habit Sanctuary Lifetime Pass')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiIntentUri)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    showToast({
      type: 'info',
      title: 'UPI ID Copied! 📋',
      message: `${upiId} copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  // ----------------------------------------------------
  // STEP 1: SEND SIGNUP OTP TO USER'S REAL EMAIL
  // ----------------------------------------------------
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your sanctuary username / alias.');
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

      playAnimeSound('achievement_unlocked');

      showToast({
        type: 'success',
        title: `✨ Practitioner ${name} Registered!`,
        message: 'Account verified! Complete ₹49 pass to enter your sanctuary.',
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
  // STEP 3: DIRECT UPI / UTR VERIFICATION
  // ----------------------------------------------------
  const handleVerifyDirectUPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!utrNumber.trim()) {
      setError('Please enter your 12-digit UPI Reference / UTR Number or Transaction ID.');
      return;
    }

    setPayLoading(true);
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: 'DIRECT_UPI_PHONEPE_GPAY',
          utr: utrNumber.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        playAnimeSound('achievement_unlocked');
        showToast({
          type: 'success',
          title: '✨ Lifetime Sanctuary Pass Activated!',
          message: 'Welcome to Lunar Habit Sanctuary. All features permanently unlocked!',
        });
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Payment verification failed');
      }
    } catch {
      setError('Payment verification error. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP 3: RAZORPAY GATEWAY CHECKOUT
  // ----------------------------------------------------
  const handlePayRazorpay = async () => {
    setPayLoading(true);
    setError('');
    try {
      const orderRes = await fetch('/api/payment/create-order', { method: 'POST' });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setError(orderData.error || 'Failed to initiate payment gateway');
        setPayLoading(false);
        return;
      }

      if (typeof window !== 'undefined' && window.Razorpay && orderData.keyId && !orderData.keyId.includes('test_uchihahabit')) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: orderData.currency,
          name: 'Lunar Habit Sanctuary',
          description: '₹49 Lifetime Sanctuary Pass',
          order_id: orderData.orderId,
          prefill: {
            name: name || orderData.user?.name,
            email: email || orderData.user?.email,
          },
          theme: {
            color: '#0284c7',
          },
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_method: 'RAZORPAY_GATEWAY',
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              playAnimeSound('achievement_unlocked');
              showToast({
                type: 'success',
                title: '✨ Lifetime Sanctuary Pass Activated!',
                message: 'Welcome to Lunar Habit Sanctuary. All features permanently unlocked!',
              });
              router.push('/dashboard');
              router.refresh();
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_rzp_${Date.now()}`,
            payment_method: 'RAZORPAY_CHECKOUT',
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          playAnimeSound('achievement_unlocked');
          showToast({
            type: 'success',
            title: '✨ Lifetime Sanctuary Pass Activated!',
            message: 'Welcome to Lunar Habit Sanctuary. All features permanently unlocked!',
          });
          router.push('/dashboard');
          router.refresh();
        } else {
          setError('Payment verification failed');
        }
      }
    } catch {
      setError('Payment gateway error. Please try Direct UPI QR instead.');
    } finally {
      setPayLoading(false);
    }
  };

  // ----------------------------------------------------
  // STEP 3: PROMO CODE REDEEM
  // ----------------------------------------------------
  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
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

      {/* Floating Cyan Halo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6 my-auto">
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

          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            {step === 1 && 'Step 1: Enter Name & Email'}
            {step === 2 && 'Step 2: Verify Email & Create Password'}
            {step === 3 && 'Step 3: Awaken Lifetime Sanctuary Pass'}
          </h2>

          {/* 3-Step Wizard Visual Indicator */}
          <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
              step === 1 ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-glow-cyan' : 'bg-ocean-950/60 border-sky-500/20 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Identity</span>
            </div>
            <div className="w-4 h-0.5 bg-sky-500/30" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
              step === 2 ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-glow-cyan' : 'bg-ocean-950/60 border-sky-500/20 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>OTP & Password</span>
            </div>
            <div className="w-4 h-0.5 bg-sky-500/30" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
              step === 3 ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow-glow-cyan' : 'bg-ocean-950/60 border-sky-500/20 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              <span>₹49 Unlock</span>
            </div>
          </div>
        </div>

        {/* Signup Form Card */}
        <div className="p-6 sm:p-8 bg-[#040814]/85 border border-sky-500/35 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-sky-950/90 border border-rose-500/60 flex items-center gap-2.5 text-xs text-rose-200 shadow-lg">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && step === 2 && (
            <div className="p-3.5 rounded-xl bg-teal-950/70 border border-teal-500/50 flex items-center gap-2.5 text-xs text-teal-200">
              <Check className="w-4 h-4 shrink-0 text-teal-400" />
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
                    Practitioner Alias / Full Name <span className="text-sky-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Utkarsh Dhakane"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-950/80 border border-sky-500/30 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors backdrop-blur-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                    Your Real Gmail / Email Address <span className="text-sky-400">*</span>
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-950/80 border border-sky-500/30 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors backdrop-blur-md"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    ⚡ We will send a 6-digit OTP code to this email to verify account ownership.
                  </p>
                </div>
              </div>

              {/* Choose Avatar Persona */}
              <div className="space-y-2.5 pt-3 border-t border-sky-500/15">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  Choose Sanctuary Persona:
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
                            ? 'bg-sky-950/80 border-sky-400 shadow-glow-cyan text-white'
                            : 'bg-ocean-950/50 border-sky-500/20 hover:border-sky-500/40 text-slate-300'
                        }`}
                      >
                        <AvatarBadge avatarId={opt.id} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{opt.name}</div>
                          <div className="text-[10px] text-sky-400 font-mono">Sanctuary Persona</div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shrink-0 shadow-glow-cyan">
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Choose Companion Familiar */}
              <div className="space-y-2.5 pt-3 border-t border-sky-500/15">
                <label className="block text-xs font-medium text-slate-300 font-mono">
                  Select Focus Guardian:
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
                            ? 'bg-sky-950/80 border-sky-400 shadow-glow-cyan text-white'
                            : 'bg-ocean-950/50 border-sky-500/20 hover:border-sky-500/40 text-slate-300'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-ocean-950 border border-sky-500/30 flex items-center justify-center text-xl shrink-0">
                          {comp.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{comp.name}</div>
                          <div className="text-[10px] text-teal-300 font-mono truncate">{comp.buffDescription}</div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shrink-0 shadow-glow-cyan">
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                variant="glow-cyan"
                size="lg"
                className="w-full font-bold text-sm py-4 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 border-sky-400/50 shadow-glow-cyan cursor-pointer"
                isLoading={loading}
              >
                <Mail className="w-4 h-4 mr-2 text-sky-200" />
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
              <div className="p-3.5 rounded-2xl bg-ocean-950/80 border border-sky-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-mono text-slate-200">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-sky-400 hover:text-sky-300 underline font-mono cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                    Enter 6-Digit Email OTP Code <span className="text-sky-400">*</span>
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-ocean-950/90 border border-sky-500/50 text-white text-lg tracking-widest font-mono text-center placeholder-slate-600 focus:outline-none focus:border-sky-400 focus:shadow-glow-cyan transition-all"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-400 font-mono">
                    <span>Code valid for 10 minutes</span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resending}
                      className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                      Resend Code
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                    Create Master Password (Min 6 chars) <span className="text-sky-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-950/80 border border-sky-500/30 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors backdrop-blur-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                    Confirm Password <span className="text-sky-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-950/80 border border-sky-500/30 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors backdrop-blur-md"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="glow-cyan"
                size="lg"
                className="w-full font-bold text-sm py-4 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 border-sky-400/50 shadow-glow-cyan cursor-pointer"
                isLoading={loading}
              >
                <Check className="w-4 h-4 mr-2 text-teal-200 stroke-[3]" />
                Verify Code & Create Account
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          )}

          {/* ==================================================== */}
          {/* STEP 3: ₹49 PASS UNLOCK (DIRECT UPI & RAZORPAY)      */}
          {/* ==================================================== */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1.5 p-4 rounded-2xl bg-sky-950/60 border border-sky-400/40 shadow-glow-cyan">
                <h3 className="text-lg font-bold text-white font-heading">
                  ✨ Account Verified! Unlock Lifetime Sanctuary Pass (₹49)
                </h3>
                <p className="text-xs text-slate-300">
                  Payment complete hone ke baad aapka Sanctuary Dashboard turant unlock ho jayega.
                </p>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-ocean-950/80 border border-sky-500/30 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setActivePaymentTab('upi_direct'); setError(''); }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activePaymentTab === 'upi_direct'
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-glow-cyan'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Direct UPI (Fast)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActivePaymentTab('razorpay'); setError(''); }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activePaymentTab === 'razorpay'
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-glow-cyan'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Razorpay / Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActivePaymentTab('giveaway'); setError(''); }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activePaymentTab === 'giveaway'
                      ? 'bg-teal-600 text-white shadow-glow-cyan'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Promo Code</span>
                </button>
              </div>

              {/* TAB 1: DIRECT UPI */}
              {activePaymentTab === 'upi_direct' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#040814]/90 to-ocean-950/80 border border-sky-500/30 text-center space-y-3">
                    <div className="relative w-40 h-40 mx-auto rounded-2xl bg-white p-2 shadow-2xl border-2 border-sky-400">
                      <Image
                        src={qrCodeUrl}
                        alt="Scan & Pay ₹49 UPI QR"
                        fill
                        unoptimized
                        className="object-contain p-1.5 rounded-xl"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white font-mono">
                        Scan & Pay <span className="text-teal-300 text-base font-black font-heading">₹49</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        PhonePe, GPay, Paytm ya BHIM se QR scan karein
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-ocean-950 border border-sky-500/30 max-w-sm mx-auto">
                      <div className="text-left font-mono truncate mr-2">
                        <span className="text-[10px] text-slate-400 block">UPI ID:</span>
                        <span className="text-xs text-sky-300 font-bold">{upiId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-400/40 text-[11px] text-sky-200 font-mono flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-teal-300" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyDirectUPI} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 font-mono">
                        Enter 12-Digit UTR / Transaction ID (Payment ke baad milta hai) <span className="text-sky-400">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 423859201948"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ocean-950/80 border border-sky-500/40 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-sky-400 focus:shadow-glow-cyan"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="glow-cyan"
                      size="lg"
                      className="w-full font-bold text-sm py-4 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 border-sky-400/50 shadow-glow-cyan cursor-pointer"
                      isLoading={payLoading}
                    >
                      <Sparkles className="w-4 h-4 mr-2 text-sky-200" />
                      Verify UTR & Activate Sanctuary (₹49)
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </form>
                </div>
              )}

              {/* TAB 2: RAZORPAY */}
              {activePaymentTab === 'razorpay' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#040814]/90 to-ocean-950/80 border border-sky-500/30 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-sky-950/90 border border-sky-500/50 flex items-center justify-center mx-auto text-sky-400 shadow-glow-cyan">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white font-heading">Secure Online Checkout</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        Credit/Debit Card, Netbanking, Wallets & UPI
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-ocean-950 border border-sky-500/20 text-left text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between font-mono">
                        <span>Lifetime Sanctuary Access:</span>
                        <span className="font-bold text-white">₹49.00</span>
                      </div>
                      <div className="flex justify-between font-mono text-teal-300">
                        <span>Instant Auto-Activation:</span>
                        <span className="font-bold">Included</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handlePayRazorpay}
                    variant="glow-cyan"
                    size="lg"
                    className="w-full font-bold text-sm py-4 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-400 hover:to-cyan-500 border-sky-400/50 shadow-glow-cyan cursor-pointer"
                    isLoading={payLoading}
                  >
                    <CreditCard className="w-4 h-4 mr-2 text-sky-200" />
                    Pay ₹49 via Razorpay
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              )}

              {/* TAB 3: GIVEAWAY PROMO CODE */}
              {activePaymentTab === 'giveaway' && (
                <form onSubmit={handleRedeemPromo} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#040814]/90 to-ocean-950/80 border border-teal-500/30 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-teal-950/90 border border-teal-500/50 flex items-center justify-center mx-auto text-teal-400 shadow-glow-cyan">
                      <Gift className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white font-heading">Redeem Giveaway Coupon</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Special promotion or early adopter voucher code
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 font-mono">Promo / Giveaway Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LUNARFREE"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 rounded-xl bg-ocean-950/80 border border-teal-500/40 text-white font-mono uppercase text-sm placeholder-slate-600 focus:outline-none focus:border-teal-400 focus:shadow-glow-cyan"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    className="w-full font-bold text-sm py-4 bg-teal-600 hover:bg-teal-500 text-white border-teal-400/50 shadow-glow-cyan cursor-pointer"
                    isLoading={promoLoading}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Redeem Code & Unlock 100% Free
                  </Button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-400 pt-3 border-t border-sky-500/15">
            Already registered?{' '}
            <Link href="/login" className="text-sky-400 hover:text-sky-300 font-bold hover:underline">
              Sign In to Sanctuary
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Ambient Music */}
      <AmbientMusicPlayer />
    </div>
  );
}
