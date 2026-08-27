'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/common/ToastContext';
import { useDashboard } from '@/context/DashboardContext';
import {
  Flame,
  Check,
  ShieldCheck,
  Zap,
  Lock,
  CreditCard,
  QrCode,
  Gift,
  ArrowRight,
  LogOut,
  Copy,
  CheckCheck,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { playAnimeSound } from '@/lib/utils';

export function FullScreenPaywall() {
  const router = useRouter();
  const { user, updateUserLocally } = useDashboard();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'upi_direct' | 'razorpay' | 'giveaway'>('upi_direct');
  const [utrNumber, setUtrNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');

  const upiId = 'dhakaneutkarsh0@okhdfcbank';
  const payeeName = 'Utkarsh Dhakane';
  const amount = 49;

  // Direct UPI Intent URI for Mobile PhonePe / GPay / Paytm / BHIM
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Uchiha Habit Tracker Lifetime Pass')}`;

  // High-Resolution Crisp QR Code
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  // ----------------------------------------------------
  // DIRECT UPI SUBMIT / UTR VERIFICATION
  // ----------------------------------------------------
  const handleVerifyDirectUPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!utrNumber.trim()) {
      setError('Please enter your 12-digit UPI Reference / UTR Number or Transaction ID.');
      return;
    }

    setLoading(true);
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
        updateUserLocally({ plan_status: 'paid_active' });
        playAnimeSound('sharingan_awaken');
        showToast({
          type: 'success',
          title: '🔥 Lifetime Shinobi Pass Activated!',
          message: 'Payment verified! Welcome to the Uchiha Clan.',
        });
        router.refresh();
      } else {
        setError(data.error || 'Failed to verify payment');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // RAZORPAY GATEWAY CHECKOUT
  // ----------------------------------------------------
  const handlePayRazorpay = async () => {
    setError('');
    setLoading(true);
    try {
      const orderRes = await fetch('/api/payment/create-order', { method: 'POST' });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setError(orderData.error || 'Failed to initiate Razorpay gateway');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined' && window.Razorpay && orderData.keyId && !orderData.keyId.includes('test_uchihahabit')) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountInPaise,
          currency: orderData.currency,
          name: 'Uchiha Habit Tracker',
          description: '₹49 Lifetime Shinobi Clan Pass',
          order_id: orderData.orderId,
          prefill: {
            name: user?.name || orderData.user.name,
            email: user?.email || orderData.user.email,
          },
          theme: {
            color: '#dc2626',
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
              updateUserLocally({ plan_status: 'paid_active' });
              playAnimeSound('sharingan_awaken');
              showToast({
                type: 'success',
                title: '🔥 Lifetime Pass Activated!',
                message: '₹49 payment verified! Welcome to the Uchiha Clan.',
              });
              router.refresh();
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback direct activation
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
          updateUserLocally({ plan_status: 'paid_active' });
          playAnimeSound('sharingan_awaken');
          showToast({
            type: 'success',
            title: '🔥 Lifetime Pass Activated!',
            message: '₹49 payment verified! Welcome to the Uchiha Clan.',
          });
          router.refresh();
        } else {
          setError('Payment verification failed');
        }
      }
    } catch {
      setError('Payment gateway error. Please try direct UPI instead.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------
  // PROMO / GIVEAWAY CODE
  // ----------------------------------------------------
  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      setError('Please enter a giveaway code.');
      return;
    }

    setError('');
    setPromoLoading(true);
    try {
      const res = await fetch('/api/payment/redeem-promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        updateUserLocally({ plan_status: 'paid_active' });
        playAnimeSound('achievement_unlocked');
        showToast({
          type: 'success',
          title: '🎁 100% Free Lifetime Pass Unlocked!',
          message: data.message,
        });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black overflow-y-auto">
      {/* Background Wallpaper */}
      <div className="fixed inset-0 pointer-events-none">
        <Image
          src="/images/blood-nebula-bg.jpg"
          alt="Cosmic Blood Nebula"
          fill
          priority
          className="object-cover object-center filter brightness-[0.35] contrast-[1.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95" />
      </div>

      <div className="relative z-10 w-full max-w-xl my-auto space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-950/90 border-2 border-red-500/60 flex items-center justify-center mx-auto shadow-glow-red">
            <Lock className="w-7 h-7 text-red-500 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>₹49 Lifetime Pass • Instant Activation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
            Unlock Shinobi Vault, {user?.name || ''}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Payment hone ke baad aapka Dashboard, Habits aur Calendar turant unlock ho jayega.
          </p>
        </div>

        {/* Main Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-black/80 border-2 border-red-500/40 backdrop-blur-2xl shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/90 border border-red-500 text-xs text-red-200 shadow-glow-red">
              {error}
            </div>
          )}

          {/* Payment Method Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/60 border border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => { setActiveTab('upi_direct'); setError(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upi_direct'
                  ? 'bg-red-600 text-white shadow-glow-red'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Direct UPI (Fast)</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('razorpay'); setError(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'razorpay'
                  ? 'bg-red-600 text-white shadow-glow-red'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Razorpay / Card</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('giveaway'); setError(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'giveaway'
                  ? 'bg-purple-600 text-white shadow-glow-purple'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Promo Code</span>
            </button>
          </div>

          {/* ==================================================== */}
          {/* TAB 1: DIRECT UPI (PHONEPE / GPAY / PAYTM QR)        */}
          {/* ==================================================== */}
          {activeTab === 'upi_direct' && (
            <div className="space-y-4">
              {/* Dynamic QR Code Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-black/80 to-red-950/30 border border-red-500/30 text-center space-y-3">
                <div className="relative w-44 h-44 mx-auto rounded-2xl bg-white p-2.5 shadow-2xl border-2 border-red-500/50">
                  <Image
                    src={qrCodeUrl}
                    alt="Scan & Pay ₹49 UPI QR"
                    fill
                    unoptimized
                    className="object-contain p-2 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white font-mono">
                    Scan & Pay <span className="text-emerald-400 text-lg font-black font-heading">₹49</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Open PhonePe, Google Pay, Paytm, or BHIM & scan this QR
                  </p>
                </div>

                {/* Copyable UPI ID Box */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/90 border border-slate-700 max-w-sm mx-auto">
                  <div className="text-left font-mono truncate mr-2">
                    <span className="text-[10px] text-slate-500 block">UPI ID:</span>
                    <span className="text-xs text-amber-300 font-bold">{upiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-[11px] text-red-200 font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Mobile Direct One-Click UPI Button */}
                <a
                  href={upiIntentUri}
                  className="inline-flex sm:hidden items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-glow-red hover:opacity-95"
                >
                  <Smartphone className="w-4 h-4" />
                  Tap to Pay ₹49 in PhonePe / GPay
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Enter UTR Number Form */}
              <form onSubmit={handleVerifyDirectUPI} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 font-mono mb-1">
                    Enter 12-Digit UPI Reference / UTR Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 423589102941"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.trim())}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-red-500/40 text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-red-500 focus:shadow-glow-red transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Payment receipt par 12-digit UTR/Ref number hota hai.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="glow-purple"
                  size="lg"
                  className="w-full font-bold text-sm py-3.5 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-xl shadow-red-600/30 cursor-pointer"
                  isLoading={loading}
                >
                  <Check className="w-4 h-4 mr-1.5 text-emerald-300" />
                  Verify UTR & Unlock Dashboard
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: RAZORPAY GATEWAY CHECKOUT                     */}
          {/* ==================================================== */}
          {activeTab === 'razorpay' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 space-y-2">
                <div className="text-sm font-bold text-white">Razorpay Secure Checkout</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pay ₹49 using Credit Card, Debit Card, NetBanking, or Wallet through Razorpay.
                </p>
              </div>

              <Button
                type="button"
                onClick={handlePayRazorpay}
                variant="glow-purple"
                size="lg"
                className="w-full font-bold text-sm py-4 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-xl shadow-red-600/30 cursor-pointer"
                isLoading={loading}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Open Razorpay Gateway (₹49)
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PROMO / GIVEAWAY CODE REDEEM                  */}
          {/* ==================================================== */}
          {activeTab === 'giveaway' && (
            <form onSubmit={handleRedeemPromo} className="space-y-3 py-2">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                <div className="text-sm font-bold text-purple-200">Redeem Giveaway Pass</div>
                <p className="text-xs text-purple-300/80">
                  Enter an Admin-issued gift code for 100% free lifetime unlock.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Enter CODE (e.g. UCHIHA_GIFT_XXX)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/70 border border-purple-500/40 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="text-xs border-purple-500/40 text-purple-200 hover:bg-purple-950/60"
                  isLoading={promoLoading}
                >
                  Apply Code
                </Button>
              </div>
            </form>
          )}

          {/* Switch Account / Logout */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">{user?.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 underline font-mono flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              Log Out / Switch Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
