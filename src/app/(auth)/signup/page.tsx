'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AVATAR_OPTIONS, AvatarBadge } from '@/components/ui/AvatarBadge';
import { COMPANIONS_CATALOG } from '@/lib/anime-constants';
import { validateEmailAddress } from '@/lib/email-validator';
import { Flame, Sparkles, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Shield, Check } from 'lucide-react';
import { useToast } from '@/components/common/ToastContext';

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('sasuke_mangekyo');
  const [selectedCompanion, setSelectedCompanion] = useState('shadow_wolf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your shinobi username');
      return;
    }

    // Validate email format and check for fake/disposable domains
    const emailValidation = validateEmailAddress(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Please enter a valid, active email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: emailValidation.normalizedEmail,
          password,
          avatar: selectedAvatar,
          companion: selectedCompanion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      showToast({
        type: 'success',
        title: `Shinobi ${name} Awakened!`,
        message: 'Your account has been registered. Welcome to the Uchiha Clan.',
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Connection failed. Please check your network.');
      setLoading(false);
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
            Awaken Your Shinobi Account
          </h2>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono backdrop-blur-md shadow-glow-red">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lifetime Access Pass • ₹49 only</span>
          </div>
        </div>

        {/* Signup Form Card with Semi-Transparent Frosted 3D Glass */}
        <div className="p-6 sm:p-8 bg-black/65 border-2 border-red-500/35 rounded-3xl backdrop-blur-2xl shadow-2xl space-y-6">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 flex items-center gap-2.5 text-xs text-red-200 shadow-glow-red">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Credentials */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                  Shinobi Alias / Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Itachi Uchiha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/70 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors backdrop-blur-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                  Valid Gmail / Email Address
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
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  Only active, genuine email addresses accepted (no disposable/fake emails).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 font-mono mb-1.5">
                  Master Password (Min 6 chars)
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
            </div>

            {/* Step 2: Choose Avatar Persona - Clean Spacious 2-Column Grid with No Text Overlap */}
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

            {/* Step 3: Choose Companion Familiar - Clean Spacious 2-Column Grid with No Text Overlap */}
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

            {/* Submit */}
            <Button
              type="submit"
              variant="glow-purple"
              size="lg"
              className="w-full font-bold text-sm py-4 bg-red-600 hover:bg-red-500 border-red-500/50 shadow-lg shadow-red-600/30 cursor-pointer"
              isLoading={loading}
            >
              <Flame className="w-4 h-4 mr-2 text-amber-300 fill-amber-300" />
              Awaken Account & Enter Domain
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Isolated database storage • 256-bit encryption</span>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Already awakened your account?{' '}
            <Link href="/login" className="text-red-400 hover:text-red-300 font-bold hover:underline">
              Login to Shinobi Vault
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
