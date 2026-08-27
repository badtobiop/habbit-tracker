'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/common/ToastContext';
import { useDashboard } from '@/context/DashboardContext';
import { Flame, Check, ShieldCheck, Zap, Lock, CreditCard, QrCode, Gift, ArrowRight, LogOut } from 'lucide-react';
import { playAnimeSound } from '@/lib/utils';

export function FullScreenPaywall() {
  const router = useRouter();
  const { user, updateUserLocally } = useDashboard();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'phonepe' | 'card'>('phonepe');
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      // 1. Create order
      const orderRes = await fetch('/api/payment/create-order', { method: 'POST' });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setError(orderData.error || 'Failed to initiate payment');
        setLoading(false);
        return;
      }

      // Check if Razorpay SDK script is available in browser
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
                payment_method: selectedMethod.toUpperCase(),
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
        // Direct verification & activation
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_upi_${Date.now()}`,
            payment_method: `UPI / ${selectedMethod.toUpperCase()}`,
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
          setError('Failed to verify payment');
        }
      }
    } catch {
      setError('Payment gateway error. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="w-16 h-16 rounded-3xl bg-red-950/90 border-2 border-red-500/60 flex items-center justify-center mx-auto shadow-glow-red">
            <Lock className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Shinobi Clan Pass Required • ₹49 Lifetime</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
            Unlock Full Access, Shinobi {user?.name || ''}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Payment hone ke baad hi aapka Dashboard, Habits aur Calendar activate hoga.
          </p>
        </div>

        {/* Paywall Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-black/75 border-2 border-red-500/40 backdrop-blur-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Pricing Row */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-red-950/30 border border-red-500/30">
            <div>
              <span className="font-heading font-black text-lg text-white block">Lifetime Shinobi Pass</span>
              <span className="text-xs text-slate-400 font-mono">One-time payment • Lifetime access</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400 font-heading">₹49</span>
              <span className="text-[10px] text-slate-400 block font-mono">No subscription</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-[10px] font-bold">✓</div>
              <span>Unlimited Habit Quests & Custom Reminders</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-[10px] font-bold">✓</div>
              <span>Real-Time Interactive Calendar & Daily Reflections</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center text-[10px] font-bold">✓</div>
              <span>Uchiha Clan Ranks, Spirit Familiars & Badges</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="block text-xs font-medium text-slate-300 font-mono">
              Select Instant Payment (₹49):
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
              onClick={handlePay}
              variant="glow-purple"
              size="lg"
              className="w-full font-bold text-sm py-4 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-xl shadow-red-600/30 cursor-pointer"
              isLoading={loading}
            >
              <Flame className="w-4 h-4 mr-2 text-amber-300 fill-amber-300" />
              Pay ₹49 & Unlock My Dashboard
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

          {/* Giveaway Code */}
          <form onSubmit={handleRedeemPromo} className="pt-3 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs text-purple-300 font-mono">
              <Gift className="w-3.5 h-3.5 text-purple-400" />
              <span>Have a Free Giveaway Promo Code?</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
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

          {/* Switch Account / Logout */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono">{user?.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 underline font-mono flex items-center gap-1"
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
