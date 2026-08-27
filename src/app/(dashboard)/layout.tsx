'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sidebar, MobileBottomNav } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { LevelUpModal } from '@/components/common/LevelUpModal';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { GSAPScrollProvider } from '@/components/landing/GSAPScrollProvider';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/Button';
import { Lock, Flame, ShieldCheck, Check } from 'lucide-react';
import { SUPER_ADMIN_EMAIL } from '@/lib/app-config';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, levelUpModalOpen, setLevelUpModalOpen, newLevelReached } = useDashboard();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      router.push('/login');
    }
  };

  const isMasterAdmin = user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || user?.role === 'admin';
  const isPaid = isMasterAdmin || user?.plan_status === 'paid_active' || user?.plan_status === 'pro';

  return (
    <div className="relative min-h-screen bg-black text-slate-100 overflow-x-hidden">
      {/* Full-App Cosmic Blood Nebula Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/blood-nebula-bg.jpg"
          alt="Cosmic Blood Nebula"
          fill
          priority
          className="object-cover object-center filter brightness-[0.42] contrast-[1.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90" />
      </div>

      {/* Fixed Left Sidebar for Desktop - NEVER SCROLLS OR DRIFTS */}
      <div className="fixed inset-y-0 left-0 w-64 z-30 hidden md:block">
        <Sidebar user={user} onLogout={handleLogout} />
      </div>

      {/* Main Content Area with left offset for sidebar */}
      <div className="relative z-10 md:pl-64 flex-1 flex flex-col min-w-0 pb-20 md:pb-8 min-h-screen">
        <Topbar user={user} />
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
          {/* If user has not paid ₹49 and is not Master Admin, show Paywall screen */}
          {!isPaid ? (
            <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto shadow-glow-red">
                <Lock className="w-8 h-8 text-red-500" />
              </div>

              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold uppercase font-mono">
                  Access Locked • ₹49 Lifetime Pass Required
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
                  Awaken Full Shinobi Clan Protocol
                </h1>
                <p className="text-sm text-slate-300 max-w-lg mx-auto">
                  To prevent bots and maintain dedicated multi-user servers, unlock lifetime access for less than the price of a coffee.
                </p>
              </div>

              {/* Paywall Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-black/65 border-2 border-red-500/40 backdrop-blur-2xl shadow-2xl space-y-6 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-heading font-black text-xl text-white">Lifetime Pass</span>
                    <span className="text-xs text-slate-400 block font-mono">Unlimited habit tracking & calendar notes</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-emerald-400 font-heading">₹49</span>
                    <span className="text-[10px] text-slate-400 block font-mono">1-Time Payment</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-red-400" />
                    <span>Unlimited Quests with Custom Reminders</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-red-400" />
                    <span>Real-Time Interactive Calendar with Reflection Journal</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-red-400" />
                    <span>Uchiha Ranks (1-Tomoe to S-Rank) & Spirit Familiars</span>
                  </div>
                </div>

                <Button
                  variant="glow-purple"
                  size="lg"
                  onClick={() => setPaymentModalOpen(true)}
                  className="w-full font-bold text-base py-4 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-xl shadow-red-600/30 cursor-pointer"
                >
                  <Flame className="w-5 h-5 mr-2 text-amber-300 fill-amber-300" />
                  Pay ₹49 via PhonePe / UPI & Unlock Now
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Direct bank transfer • Instant access activation</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">{children}</div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="relative z-40 md:hidden">
        <MobileBottomNav user={user} />
      </div>

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={levelUpModalOpen}
        onClose={() => setLevelUpModalOpen(false)}
        newLevel={newLevelReached}
      />

      {/* Payment Checkout Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <GSAPScrollProvider>
        <DashboardShell>{children}</DashboardShell>
      </GSAPScrollProvider>
    </DashboardProvider>
  );
}
