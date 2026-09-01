'use client';

import React from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { QuickStatsCards } from '@/components/dashboard/QuickStatsCards';
import { DailyTasksSection } from '@/components/dashboard/DailyTasksSection';
import { MonthlyHabitTrackerGrid } from '@/components/dashboard/MonthlyHabitTrackerGrid';
import { LevelProgressCard } from '@/components/dashboard/LevelProgressCard';
import { CharacterCompanionCard } from '@/components/dashboard/CharacterCompanionCard';

export default function DashboardPage() {
  const { user } = useDashboard();

  return (
    <div className="space-y-8">
      {/* 1. Quick Stats Overview Cards */}
      <QuickStatsCards user={user} habits={[]} />

      {/* 2. Daily Tasks & Upcoming Scheduled Missions */}
      <DailyTasksSection />

      {/* 3. Spreadsheet-Style Monthly Habit Tracker Grid (Main Interactive Feature) */}
      <MonthlyHabitTrackerGrid />

      {/* 3. Level Progression Gauge & Familiar Companion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <LevelProgressCard user={user} />
        </div>
        <div className="lg:col-span-5">
          <CharacterCompanionCard user={user} />
        </div>
      </div>
    </div>
  );
}

