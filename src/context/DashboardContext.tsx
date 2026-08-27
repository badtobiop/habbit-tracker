'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';

interface DashboardContextType {
  user: User | null;
  refreshUser: () => Promise<void>;
  updateUserLocally: (updated: Partial<User>) => void;
  triggerLevelUp: (level: number) => void;
  levelUpModalOpen: boolean;
  setLevelUpModalOpen: (open: boolean) => void;
  newLevelReached: number;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [newLevelReached, setNewLevelReached] = useState(1);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]);

  const updateUserLocally = (updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const triggerLevelUp = (level: number) => {
    setNewLevelReached(level);
    setLevelUpModalOpen(true);
  };

  return (
    <DashboardContext.Provider
      value={{
        user,
        refreshUser: fetchUser,
        updateUserLocally,
        triggerLevelUp,
        levelUpModalOpen,
        setLevelUpModalOpen,
        newLevelReached,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cyber-950 text-purple-400 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono tracking-widest uppercase text-slate-400">
            Syncing Hunter Domain...
          </span>
        </div>
      ) : (
        children
      )}
    </DashboardContext.Provider>
  );
}
