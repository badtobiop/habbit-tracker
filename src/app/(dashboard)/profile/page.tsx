'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AVATAR_OPTIONS, AvatarBadge } from '@/components/ui/AvatarBadge';
import { useToast } from '@/components/common/ToastContext';
import {
  User as UserIcon,
  Mail,
  Flame,
  Trophy,
  Award,
  Download,
  Shield,
  Save,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { getHunterRank } from '@/lib/anime-constants';

export default function ProfilePage() {
  const { user, refreshUser, updateUserLocally } = useDashboard();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'shadow_hunter');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setSelectedAvatar(user.avatar);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          avatar: selectedAvatar,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUserLocally({
          name: name.trim(),
          bio: bio.trim(),
          avatar: selectedAvatar,
        });
        showToast({ type: 'success', title: 'Profile Updated', message: 'Hunter directives saved.' });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const [habitsRes, statsRes, meRes] = await Promise.all([
        fetch('/api/habits'),
        fetch('/api/stats'),
        fetch('/api/auth/me'),
      ]);

      const habitsData = await habitsRes.json();
      const statsData = await statsRes.json();
      const meData = await meRes.json();

      const exportBlob = {
        exportedAt: new Date().toISOString(),
        user: meData.user,
        habits: habitsData.habits,
        stats: statsData.stats,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBlob, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `anime_habits_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast({ type: 'success', title: 'Data Exported', message: 'JSON backup file downloaded.' });
    } catch (err) {
      showToast({ type: 'error', title: 'Export Failed', message: 'Could not generate backup file.' });
    }
  };

  if (!user) return null;
  const rank = getHunterRank(user.level);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-mono font-semibold">
          <UserIcon className="w-3.5 h-3.5" />
          <span>Hunter Identity & Credentials</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
          Hunter Profile & Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Personal stats, persona customization, and data backup.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <Card glow="purple" className="p-6 sm:p-8 bg-cyber-900/90 border-purple-500/30">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="relative">
            <AvatarBadge avatarId={selectedAvatar} size="xl" />
            <div
              className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-md text-[11px] font-black text-white"
              style={{ backgroundColor: rank.color }}
            >
              Rank {rank.rankLetter}
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white font-heading">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-500/40 text-xs font-mono text-purple-300">
                Level {user.level} Hunter
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            <p className="text-xs text-slate-300 italic pt-1">{user.bio || 'On a quest to awaken boundless discipline.'}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-3.5 rounded-xl bg-cyber-950 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-mono">Current Streak</div>
            <div className="text-xl font-black text-amber-400 font-heading mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              {user.current_streak} Days
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-950 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-mono">Peak Streak</div>
            <div className="text-xl font-black text-amber-300 font-heading mt-0.5">
              {user.best_streak} Days
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-950 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-mono">Total Slays</div>
            <div className="text-xl font-black text-cyan-300 font-heading mt-0.5">
              {user.total_completions}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyber-950 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-mono">Total XP</div>
            <div className="text-xl font-black text-purple-300 font-heading mt-0.5 font-mono">
              {user.xp}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card glow="none" className="p-6 sm:p-8 bg-cyber-900/90 border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white font-heading">
          Customize Identity & Persona
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Hunter Alias / Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-cyber-950 border border-slate-700 focus:border-purple-500 text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Hunter Bio / Motto</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Your personal creed..."
              className="w-full px-4 py-2 rounded-xl bg-cyber-950 border border-slate-700 focus:border-purple-500 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Avatar Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Active Persona Avatar
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map((av) => {
                const isSelected = selectedAvatar === av.id;
                return (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/60 shadow-glow-purple scale-105'
                        : 'border-slate-800 bg-cyber-950/70 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{av.icon}</span>
                    <span className="text-[11px] font-bold text-slate-200 truncate w-full text-center">{av.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="glow-purple" type="submit" isLoading={saving} className="font-bold">
              <Save className="w-4 h-4 mr-1.5" />
              Save Hunter Directives
            </Button>
          </div>
        </form>
      </Card>

      {/* Data Backup & Privacy Section */}
      <Card glow="none" className="p-6 sm:p-8 bg-cyber-900/90 border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Data Export & Realm Security</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Download your complete habit history, completions, and progress as a JSON archive.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-1.5" />
            Export JSON Archive
          </Button>
        </div>
      </Card>
    </div>
  );
}
