'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sidebar, MobileBottomNav } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { LevelUpModal } from '@/components/common/LevelUpModal';
import { FullScreenPaywall } from '@/components/payment/FullScreenPaywall';
import { GSAPScrollProvider } from '@/components/landing/GSAPScrollProvider';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';
import { SUPER_ADMIN_EMAIL } from '@/lib/app-config';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, levelUpModalOpen, setLevelUpModalOpen, newLevelReached } = useDashboard();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const isMasterAdmin = user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || user?.role === 'admin';
  const isPaid = isMasterAdmin || user?.plan_status === 'paid_active' || user?.plan_status === 'pro';

  // STRICT PAYWALL ENFORCEMENT: If user has NOT paid ₹49 and is not Master Admin, block completely!
  if (!isPaid) {
    return <FullScreenPaywall />;
  }

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
          <div className="animate-fade-in">{children}</div>
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
