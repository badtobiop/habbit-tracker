'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/common/ToastContext';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  DollarSign,
  Activity,
  RefreshCw,
  Bell,
  Flame,
  Zap,
  Clock,
  Gift,
  Plus,
  Copy,
  Check,
  Send,
  KeyRound,
} from 'lucide-react';
import { formatReadableDate } from '@/lib/utils';
import { SUPER_ADMIN_EMAIL } from '@/lib/app-config';

export default function AdminPage() {
  const { user } = useDashboard();
  const { showToast } = useToast();

  const [adminData, setAdminData] = useState<{
    stats: {
      totalUsers: number;
      paidUsers: number;
      totalCompletions: number;
      totalHabits: number;
      estimatedRevenueINR: number;
    };
    users: any[];
    alerts?: any[];
  } | null>(null);

  const [giveawayData, setGiveawayData] = useState<{
    promoCodes: any[];
    redemptions: any[];
  }>({ promoCodes: [], redemptions: [] });

  const [loading, setLoading] = useState(true);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftLoading, setGiftLoading] = useState(false);
  const [customPromoCode, setCustomPromoCode] = useState('');
  const [promoMaxUses, setPromoMaxUses] = useState('1');
  const [createCodeLoading, setCreateCodeLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [resUsers, resGiveaway] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/giveaway'),
      ]);

      const dataUsers = await resUsers.json();
      if (resUsers.ok && dataUsers.success) {
        setAdminData(dataUsers);
      }

      const dataGiveaway = await resGiveaway.json();
      if (resGiveaway.ok && dataGiveaway.success) {
        setGiveawayData(dataGiveaway);
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to fetch admin data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTogglePlan = async (targetUserId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'paid_active' ? 'free' : 'paid_active';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, plan_status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast({ type: 'success', title: 'Status Updated', message: `User plan set to ${nextStatus}` });
        fetchAdminData();
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to update plan status' });
    }
  };

  const handleDirectGiftEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftEmail.trim()) {
      showToast({ type: 'error', title: 'Required', message: 'Please enter a target Gmail address' });
      return;
    }

    setGiftLoading(true);
    try {
      const res = await fetch('/api/admin/giveaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant_email',
          targetEmail: giftEmail.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast({ type: 'success', title: '🎁 Pass Gifted!', message: data.message });
        setGiftEmail('');
        fetchAdminData();
      } else {
        showToast({ type: 'error', title: 'Giveaway Failed', message: data.error || 'Failed to gift pass' });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Network error while gifting pass' });
    } finally {
      setGiftLoading(false);
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateCodeLoading(true);
    try {
      const res = await fetch('/api/admin/giveaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_code',
          customCode: customPromoCode.trim(),
          maxUses: parseInt(promoMaxUses, 10) || 1,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast({ type: 'success', title: '🎉 Promo Code Created!', message: data.message });
        setCustomPromoCode('');
        setPromoMaxUses('1');
        fetchAdminData();
      } else {
        showToast({ type: 'error', title: 'Error', message: data.error || 'Failed to create promo code' });
      }
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Network error while creating code' });
    } finally {
      setCreateCodeLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast({ type: 'success', title: 'Copied!', message: `Code "${code}" copied to clipboard` });
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (user?.role !== 'admin' && user?.email?.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return (
      <div className="py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white font-heading">Restricted Master Shinobi Command Area</h2>
        <p className="text-xs text-slate-400">
          This portal requires Master SuperAdmin clearance ({SUPER_ADMIN_EMAIL}).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono font-semibold shadow-glow-red">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Master Admin: {SUPER_ADMIN_EMAIL}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1.5">
            Platform Security, Users & SaaS Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time multi-user telemetry, instant login/signup stream, and ₹49 pass management.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchAdminData} isLoading={loading} className="border-red-500/40 text-red-300">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Data
        </Button>
      </div>

      {/* Metrics Grid */}
      {adminData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 space-y-2 bg-black/65 border border-red-500/30 rounded-2xl backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>TOTAL REGISTERED USERS</span>
              <Users className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-black text-white font-heading">
              {adminData.stats.totalUsers}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Isolated database accounts</div>
          </div>

          <div className="p-5 space-y-2 bg-black/65 border border-red-500/30 rounded-2xl backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>PAID ₹49 USERS</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-300 font-heading">
              {adminData.stats.paidUsers}
            </div>
            <div className="text-[11px] text-amber-300/80 font-mono">
              Est. Revenue: ₹{adminData.stats.estimatedRevenueINR}
            </div>
          </div>

          <div className="p-5 space-y-2 bg-black/65 border border-red-500/30 rounded-2xl backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>ACTIVE GIVEAWAY CODES</span>
              <Gift className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-300 font-heading">
              {giveawayData.promoCodes.length}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {giveawayData.redemptions.length} total pass redemptions
            </div>
          </div>

          <div className="p-5 space-y-2 bg-black/65 border border-red-500/30 rounded-2xl backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>TOTAL QUESTS COMPLETED</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white font-heading">
              {adminData.stats.totalCompletions}
            </div>
            <div className="text-[11px] text-emerald-400 font-mono">Verified DB habit ticks</div>
          </div>
        </div>
      )}

      {/* 🎁 GIVEAWAY & PROMO CENTER */}
      <div className="p-6 bg-black/75 border-2 border-red-500/40 rounded-3xl backdrop-blur-2xl space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400 shadow-glow-red">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-heading">
                🎁 Free ₹49 Lifetime Pass Giveaway Center
              </h2>
              <p className="text-xs text-slate-400">
                Gift 100% free lifetime access to any friend via their Gmail or generate secret giveaway voucher codes.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] font-mono font-bold self-start sm:self-auto">
            100% FREE GIFTING ENABLED
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Method 1: Direct 1-Click Gift via Gmail */}
          <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                Method 1: Direct Gift by User Gmail
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Enter any registered user's Gmail ID to immediately grant them 100% free lifetime access:
            </p>

            <form onSubmit={handleDirectGiftEmail} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Friend's Gmail Address:
                </label>
                <input
                  type="email"
                  placeholder="e.g. friend@gmail.com"
                  value={giftEmail}
                  onChange={(e) => setGiftEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
              <Button
                type="submit"
                variant="glow-purple"
                size="sm"
                isLoading={giftLoading}
                className="w-full font-bold text-xs bg-red-600 hover:bg-red-500 border-red-500/50 shadow-md shadow-red-600/30"
              >
                <Gift className="w-3.5 h-3.5 mr-1.5" />
                🎁 Grant Free ₹49 Lifetime Pass Now
              </Button>
            </form>
          </div>

          {/* Method 2: Generate Secret Giveaway Promo Codes */}
          <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-heading">
                Method 2: Generate Secret Giveaway Codes
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Create custom coupon codes (e.g. <code>FREE49</code> or <code>UCHIHA_VIP</code>) for giveaways:
            </p>

            <form onSubmit={handleCreatePromoCode} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Custom Code (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP_FRIEND"
                    value={customPromoCode}
                    onChange={(e) => setCustomPromoCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-black/80 border border-slate-700 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-400 block mb-1">
                    Max Uses:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={promoMaxUses}
                    onChange={(e) => setPromoMaxUses(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono text-center"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="outline"
                size="sm"
                isLoading={createCodeLoading}
                className="w-full font-bold text-xs border-amber-500/40 text-amber-300 hover:bg-amber-950/40"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Generate Giveaway Code
              </Button>
            </form>
          </div>
        </div>

        {/* Active Promo Codes Table */}
        {giveawayData.promoCodes.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Active Giveaway Promo Codes ({giveawayData.promoCodes.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {giveawayData.promoCodes.map((p) => {
                const isFullyUsed = p.used_count >= p.max_uses;
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-black/90 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-sm text-amber-400 tracking-wider">
                          {p.code}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            isFullyUsed ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-300'
                          }`}
                        >
                          {p.used_count}/{p.max_uses} USED
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        100% Free Lifetime Pass
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(p.code)}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="Copy code to clipboard"
                    >
                      {copiedCode === p.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Activity Alerts Feed */}
      <div className="p-6 bg-black/65 border border-red-500/30 rounded-2xl backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-white font-heading">
              Live User Login & Registration Alerts Feed
            </h2>
          </div>
          <span className="text-[11px] text-red-300 font-mono bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-500/30">
            Alerts target: {SUPER_ADMIN_EMAIL}
          </span>
        </div>

        {(!adminData?.alerts || adminData.alerts.length === 0) ? (
          <div className="py-6 text-center text-xs text-slate-400 font-mono bg-black/40 rounded-xl border border-slate-800">
            No external user login/signup events recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {adminData.alerts.map((a: any) => {
              const isSignup = a.event_type === 'NEW_USER_SIGNUP';
              const isPayment = a.event_type === 'PAYMENT_SUCCESS';
              return (
                <div
                  key={a.id}
                  className="p-3 rounded-xl bg-black/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                        isPayment
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : isSignup
                          ? 'bg-red-950 text-red-300 border border-red-500/50'
                          : 'bg-slate-900 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {isPayment ? <Gift className="w-3 h-3 text-emerald-400" /> : isSignup ? <Flame className="w-3 h-3 text-red-400" /> : <Zap className="w-3 h-3 text-amber-400" />}
                      {a.event_type}
                    </span>
                    <div>
                      <span className="text-white font-bold">{a.user_name}</span>
                      <span className="text-slate-400 ml-1.5 font-normal">({a.user_email})</span>
                      {a.details && (
                        <div className="text-[10px] text-slate-500 mt-0.5">{a.details}</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(a.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="p-6 bg-black/65 border border-red-500/30 rounded-2xl backdrop-blur-xl space-y-4 shadow-xl overflow-hidden">
        <h2 className="text-base font-bold text-white font-heading">
          All Registered Shinobi Accounts ({adminData?.users.length || 0})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Shinobi</th>
                <th className="py-3 px-4">Level & XP</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4">Quests</th>
                <th className="py-3 px-4">Plan Access</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {adminData?.users.map((u) => {
                const isSuper = u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                const isUserPaid = u.plan_status === 'paid_active' || u.plan_status === 'pro';
                return (
                  <tr key={u.id} className="hover:bg-black/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-heading text-sm flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {isSuper && (
                          <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold">
                            OWNER
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-red-300 font-bold">Lvl {u.level}</span>
                      <span className="text-slate-500 ml-1.5">({u.xp} XP)</span>
                    </td>
                    <td className="py-3.5 px-4 text-amber-400 font-bold">
                      🔥 {u.current_streak}d
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {u.habit_count} habits ({u.total_completions} slays)
                    </td>
                    <td className="py-3.5 px-4">
                      {isSuper ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/90 text-red-300 border border-red-500/50 shadow-glow-red flex items-center gap-1 w-fit">
                          👑 MASTER OWNER
                        </span>
                      ) : isUserPaid ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3 text-emerald-400" />
                          ₹49 PAID
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/40 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
                          ❌ UNPAID
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={isSuper ? 'text-red-400 font-bold' : 'text-slate-400'}>{u.role}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isSuper && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={isUserPaid ? 'outline' : 'glow-purple'}
                            size="sm"
                            onClick={() => handleTogglePlan(u.id, u.plan_status)}
                            className="text-[10px]"
                          >
                            {isUserPaid ? 'Revoke' : '🎁 Gift Free Pass'}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
