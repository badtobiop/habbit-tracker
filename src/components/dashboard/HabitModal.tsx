'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Habit, HabitCategory, HabitDifficulty, HabitFrequency } from '@/types';
import { Sparkles, Clock, Target, Flame, Plus, Check } from 'lucide-react';
import { format12HourTime } from '@/lib/utils';

export interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => Promise<void>;
  initialHabit?: Habit | null;
}

const PRESET_CATEGORIES: { name: string; emoji: string }[] = [
  { name: 'Coding', emoji: '💻' },
  { name: 'Fitness', emoji: '🏋️' },
  { name: 'Study', emoji: '📚' },
  { name: 'Health', emoji: '💧' },
  { name: 'Mindset', emoji: '🧘' },
  { name: 'Discipline', emoji: '⚔️' },
  { name: 'Creativity', emoji: '🎨' },
];

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export function HabitModal({ isOpen, onClose, onSave, initialHabit }: HabitModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Coding');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategoryMode, setIsCustomCategoryMode] = useState(false);
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('medium');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  
  // 12-Hour AM/PM Time State
  const [timeHour, setTimeHour] = useState('08');
  const [timeMinute, setTimeMinute] = useState('00');
  const [timeAmPm, setTimeAmPm] = useState<'AM' | 'PM'>('AM');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name || '');
      setDescription(initialHabit.description || '');
      const isPreset = PRESET_CATEGORIES.some((c) => c.name === initialHabit.category);
      if (isPreset) {
        setCategory(initialHabit.category);
        setIsCustomCategoryMode(false);
        setCustomCategoryInput('');
      } else {
        setCategory(initialHabit.category);
        setIsCustomCategoryMode(true);
        setCustomCategoryInput(initialHabit.category);
      }
      setDifficulty(initialHabit.difficulty || 'medium');
      setFrequency(initialHabit.frequency || 'daily');

      // Parse existing time into Hour, Minute, AM/PM
      const formatted = format12HourTime(initialHabit.reminder_time || '08:00 AM');
      const [timePart, ampmPart] = formatted.split(' ');
      if (timePart) {
        const [h, m] = timePart.split(':');
        if (h) setTimeHour(h.padStart(2, '0'));
        if (m) setTimeMinute(m.padStart(2, '0'));
      }
      if (ampmPart === 'PM' || ampmPart === 'AM') {
        setTimeAmPm(ampmPart);
      }
    } else {
      setName('');
      setDescription('');
      setCategory('Coding');
      setIsCustomCategoryMode(false);
      setCustomCategoryInput('');
      setDifficulty('medium');
      setFrequency('daily');
      setTimeHour('08');
      setTimeMinute('00');
      setTimeAmPm('AM');
    }
  }, [initialHabit, isOpen]);

  const difficulties: { tier: HabitDifficulty; label: string; xp: string; color: string }[] = [
    { tier: 'easy', label: 'E-Rank (Easy)', xp: '+10 XP', color: 'border-emerald-500/60 text-emerald-300' },
    { tier: 'medium', label: 'C-Rank (Medium)', xp: '+20 XP', color: 'border-cyan-500/60 text-cyan-300' },
    { tier: 'hard', label: 'A-Rank (Hard)', xp: '+35 XP', color: 'border-red-500/60 text-red-300' },
    { tier: 'extreme', label: 'S-Rank (Extreme)', xp: '+50 XP', color: 'border-amber-500/60 text-amber-300' },
  ];

  const handleSelectPreset = (catName: string) => {
    setCategory(catName);
    setIsCustomCategoryMode(false);
  };

  const handleEnableCustomMode = () => {
    setIsCustomCategoryMode(true);
    if (customCategoryInput.trim()) {
      setCategory(customCategoryInput.trim());
    }
  };

  const handleCustomCategoryChange = (val: string) => {
    setCustomCategoryInput(val);
    if (val.trim()) {
      setCategory(val.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = isCustomCategoryMode && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category;

    const formattedTime = `${timeHour}:${timeMinute} ${timeAmPm}`;

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        category: finalCategory,
        difficulty,
        frequency,
        reminder_time: formattedTime,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialHabit ? 'Modify Quest Directives' : 'Awaken New Habit Quest'}
      subtitle="Define your daily discipline quest, difficulty yield, and target completion time"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Habit Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 font-mono">Quest Name</label>
          <input
            type="text"
            required
            placeholder="e.g. 50 Pushups & Core, Read 20 Pages, Solve 2 LeetCode..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-black/75 border border-slate-700 focus:border-red-500 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors backdrop-blur-md"
          />
        </div>

        {/* Description / Story Goal */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 font-mono">Shinobi Directive / Why</label>
          <textarea
            rows={2}
            placeholder="e.g. Build unbreakable mental focus and ignite the morning Sharingan fire."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-black/75 border border-slate-700 focus:border-red-500 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors resize-none backdrop-blur-md"
          />
        </div>

        {/* Category Picker & Custom Category Option */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 font-mono">Select or Create Category</label>
            <span className="text-[10px] text-red-400 font-mono">
              Active: {isCustomCategoryMode && customCategoryInput ? customCategoryInput : category}
            </span>
          </div>

          {/* Presets Row */}
          <div className="flex flex-wrap gap-2">
            {PRESET_CATEGORIES.map((cat) => {
              const isSelected = !isCustomCategoryMode && category === cat.name;
              return (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => handleSelectPreset(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-950/80 border-red-500 text-white shadow-glow-red font-bold'
                      : 'bg-black/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}

            {/* Custom Category Button */}
            <button
              type="button"
              onClick={handleEnableCustomMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                isCustomCategoryMode
                  ? 'bg-red-950/80 border-red-500 text-white shadow-glow-red font-bold'
                  : 'bg-black/60 border-dashed border-slate-700 text-slate-300 hover:border-red-500/50'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-red-400" />
              <span>+ Custom Category</span>
            </button>
          </div>

          {/* Custom Category Input Field (Active when Custom mode selected) */}
          {isCustomCategoryMode && (
            <div className="p-3 rounded-2xl bg-black/80 border border-red-500/40 space-y-2 animate-in fade-in duration-200">
              <label className="text-xs font-semibold text-red-300 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                <span>Enter Custom Category Name:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required={isCustomCategoryMode}
                  placeholder="e.g. Trading, Guitar, Reading, Languages, Business..."
                  value={customCategoryInput}
                  onChange={(e) => handleCustomCategoryChange(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-black border border-red-500/50 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Difficulty Tier Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 font-mono">Difficulty Tier & XP Yield</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {difficulties.map((diff) => {
              const isSelected = difficulty === diff.tier;
              return (
                <button
                  type="button"
                  key={diff.tier}
                  onClick={() => setDifficulty(diff.tier)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? `bg-red-950/80 border-red-500 shadow-glow-red text-white`
                      : 'bg-black/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">{diff.label.split(' ')[0]}</span>
                  <span className="text-[11px] font-mono mt-1 font-semibold text-red-300">{diff.xp}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Frequency & 12-Hour AM/PM Time Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 font-mono">Quest Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
              className="w-full px-3 py-2.5 rounded-xl bg-black/75 border border-slate-700 text-sm text-white focus:outline-none focus:border-red-500 backdrop-blur-md cursor-pointer font-mono"
            >
              <option value="daily">Daily (7 Days a week)</option>
              <option value="weekdays">Weekdays (Mon - Fri)</option>
              <option value="weekends">Weekends (Sat - Sun)</option>
            </select>
          </div>

          {/* 12-Hour AM / PM Time Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 font-mono">Target Time & Reminder</label>
              <span className="text-[10px] text-amber-300 font-mono font-bold">
                ⏰ {timeHour}:{timeMinute} {timeAmPm}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Hour */}
              <select
                value={timeHour}
                onChange={(e) => setTimeHour(e.target.value)}
                className="w-16 px-2 py-2 rounded-xl bg-black/75 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-red-500 font-mono text-center cursor-pointer"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h} className="bg-black text-white">{h}</option>
                ))}
              </select>

              <span className="text-white font-bold font-mono">:</span>

              {/* Minute */}
              <select
                value={timeMinute}
                onChange={(e) => setTimeMinute(e.target.value)}
                className="w-16 px-2 py-2 rounded-xl bg-black/75 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-red-500 font-mono text-center cursor-pointer"
              >
                {MINUTES.map((m) => (
                  <option key={m} value={m} className="bg-black text-white">{m}</option>
                ))}
              </select>

              {/* AM / PM Toggle */}
              <div className="flex rounded-xl bg-black/80 border border-slate-700 p-0.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setTimeAmPm('AM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    timeAmPm === 'AM'
                      ? 'bg-amber-600 text-white shadow-glow-gold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setTimeAmPm('PM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    timeAmPm === 'PM'
                      ? 'bg-red-600 text-white shadow-glow-red'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="glow-purple" type="submit" isLoading={loading} className="font-bold bg-red-600 hover:bg-red-500 border-red-500/50 shadow-glow-red cursor-pointer">
            <Sparkles className="w-4 h-4 mr-1.5" />
            {initialHabit ? 'Save Changes' : 'Awaken Quest'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
