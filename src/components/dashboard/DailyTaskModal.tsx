'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DailyTask, TaskPriority } from '@/types';
import { getLocalDateString, playAnimeSound } from '@/lib/utils';
import { useToast } from '@/components/common/ToastContext';
import {
  Calendar,
  Clock,
  Flame,
  AlertCircle,
  Tag,
  AlignLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface DailyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskSaved: (task: DailyTask, isNew: boolean) => void;
  taskToEdit?: DailyTask | null;
  defaultDate?: string;
}

function getTomorrowDateString(todayStr: string): string {
  const [y, m, d] = todayStr.split('-').map(Number);
  const tomorrow = new Date(y, m - 1, d);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const CATEGORIES = ['Personal', 'Work', 'Study', 'Health', 'Discipline', 'Urgent', 'Other'];

const PRIORITIES: { value: TaskPriority; label: string; color: string; border: string; bg: string }[] = [
  { value: 'low', label: 'Low', color: 'text-slate-300', border: 'border-slate-600', bg: 'bg-slate-800/60' },
  { value: 'medium', label: 'Medium', color: 'text-sky-300', border: 'border-sky-500/50', bg: 'bg-sky-950/50' },
  { value: 'high', label: 'High', color: 'text-amber-300', border: 'border-amber-500/50', bg: 'bg-amber-950/50' },
  { value: 'urgent', label: 'Urgent', color: 'text-rose-400', border: 'border-rose-500/60', bg: 'bg-rose-950/60' },
];

const TIME_PRESETS = [
  { label: '09:00 AM', value: '09:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '03:00 PM', value: '15:00' },
  { label: '06:00 PM', value: '18:00' },
  { label: '09:00 PM', value: '21:00' },
];

export function DailyTaskModal({
  isOpen,
  onClose,
  onTaskSaved,
  taskToEdit,
  defaultDate,
}: DailyTaskModalProps) {
  const { showToast } = useToast();
  const todayStr = getLocalDateString();
  const tomorrowStr = getTomorrowDateString(todayStr);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(defaultDate || tomorrowStr);
  const [targetTime, setTargetTime] = useState('09:00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Personal');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setTargetDate(taskToEdit.target_date);
      setTargetTime(taskToEdit.target_time || '09:00');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category || 'Personal');
    } else {
      setTitle('');
      setDescription('');
      setTargetDate(defaultDate || tomorrowStr);
      setTargetTime('09:00');
      setPriority('medium');
      setCategory('Personal');
    }
  }, [taskToEdit, defaultDate, tomorrowStr, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast({ type: 'error', title: 'Task title is required' });
      return;
    }

    setLoading(true);
    try {
      if (taskToEdit) {
        // Edit existing task
        const res = await fetch(`/api/tasks/${taskToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            target_date: targetDate,
            target_time: targetTime,
            priority,
            category,
          }),
        });
        const data = await res.json();
        if (data.success && data.task) {
          playAnimeSound('quest_complete');
          showToast({ type: 'success', title: 'Mission Updated', message: 'Daily mission updated successfully!' });
          onTaskSaved(data.task, false);
          onClose();
        } else {
          showToast({ type: 'error', title: 'Update Failed', message: data.error || 'Failed to update task' });
        }
      } else {
        // Create new task
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            target_date: targetDate,
            target_time: targetTime,
            priority,
            category,
          }),
        });
        const data = await res.json();
        if (data.success && data.task) {
          playAnimeSound('quest_complete');
          showToast({ type: 'success', title: 'Mission Scheduled', message: 'New daily mission queued!' });
          onTaskSaved(data.task, true);
          onClose();
        } else {
          showToast({ type: 'error', title: 'Creation Failed', message: data.error || 'Failed to create task' });
        }
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Network Error', message: err.message || 'Error saving task' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Daily Mission' : 'Schedule Daily Mission / Task'}
      subtitle="Prepare your day in advance. Set the date, time, and priority to stay disciplined."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-mono font-medium text-sky-300 uppercase tracking-wider mb-1.5">
            Mission / Task Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Doctor appointment, Submit project report, Call bank..."
            className="w-full bg-[#040814]/90 border border-sky-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition"
          />
        </div>

        {/* Date Selector with Quick Preset Buttons */}
        <div>
          <label className="block text-xs font-mono font-medium text-sky-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" /> Target Date
            </span>
            <span className="text-[11px] text-slate-400 font-sans">
              {targetDate === tomorrowStr ? '🌅 Scheduled for Tomorrow' : targetDate === todayStr ? '⚡ Scheduled for Today' : '📅 Upcoming Date'}
            </span>
          </label>

          {/* Quick Shortcuts */}
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => setTargetDate(todayStr)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                targetDate === todayStr
                  ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-glow-cyan'
                  : 'bg-sky-950/20 border-sky-500/20 text-slate-400 hover:text-white hover:border-sky-500/40'
              }`}
            >
              <Sparkles className="w-3 h-3 text-sky-400" /> Today
            </button>
            <button
              type="button"
              onClick={() => setTargetDate(tomorrowStr)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                targetDate === tomorrowStr
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-glow-gold'
                  : 'bg-amber-950/20 border-amber-500/20 text-slate-400 hover:text-amber-200 hover:border-amber-500/40'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" /> Tomorrow (Kal) ⭐
            </button>
          </div>

          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-[#040814]/90 border border-sky-500/35 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-400 transition"
          />
        </div>

        {/* Time Selector with Quick Time Presets */}
        <div>
          <label className="block text-xs font-mono font-medium text-sky-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> Scheduled Time (Kitne Baje Krna Hai)
            </span>
            <span className="text-[11px] text-sky-300/80 font-mono">
              {targetTime || 'Anytime'}
            </span>
          </label>

          {/* Quick Time Chips */}
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {TIME_PRESETS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTargetTime(t.value)}
                className={`py-1 px-1.5 rounded-lg text-[11px] font-mono border text-center transition-all ${
                  targetTime === t.value
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold shadow-glow-cyan'
                    : 'bg-ocean-850/40 border-sky-500/20 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            type="time"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="w-full bg-[#040814]/90 border border-sky-500/35 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-sky-400 transition"
          />
        </div>

        {/* Priority & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Priority */}
          <div>
            <label className="block text-xs font-mono font-medium text-sky-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Priority Level
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-medium border text-center transition-all flex items-center justify-center gap-1.5 ${
                    priority === p.value
                      ? `${p.bg} ${p.border} ${p.color} ring-1 ring-white/20 font-bold`
                      : 'bg-ocean-850/30 border-ocean-700/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${p.value === 'urgent' ? 'bg-rose-500 animate-ping' : 'bg-current'}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-mono font-medium text-sky-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" /> Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#040814]/90 border border-sky-500/35 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-400 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-ocean-950 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-xs font-mono font-medium text-sky-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400" /> Notes / Details (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any specific reminders, location, or notes..."
            className="w-full bg-[#040814]/90 border border-sky-500/35 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-sky-500/20">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow-cyan"
            size="md"
            isLoading={loading}
            className="min-w-[140px]"
          >
            {taskToEdit ? 'Save Changes' : 'Schedule Mission'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
