import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns YYYY-MM-DD in local time
 */
export function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function format12HourTime(timeStr: string): string {
  if (!timeStr) return '08:00 AM';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;

  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2).padStart(2, '0');

  if (isNaN(hours)) return timeStr;

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 hour converts to 12 AM
  const formattedHours = String(hours).padStart(2, '0');

  return `${formattedHours}:${minutes} ${ampm}`;
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  let timeGreet = 'Good Morning';
  if (hour >= 12 && hour < 17) timeGreet = 'Good Afternoon';
  else if (hour >= 17 && hour < 21) timeGreet = 'Good Evening';
  else if (hour >= 21 || hour < 4) timeGreet = 'Good Night';

  return `${timeGreet}, Shinobi ${name}`;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem('anime_sound_enabled') !== 'false';
  } catch (_) {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('anime_sound_enabled', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('anime_sound_toggle'));
  } catch (_) {}
}

/**
 * Procedural Web Audio API sound effects for anime feedback (zero external audio asset latency)
 */
export type AnimeSoundType = 'quest_complete' | 'amaterasu_flame' | 'level_up' | 'streak_fire' | 'achievement_unlocked' | 'sharingan_awaken';

export function playAnimeSound(type: AnimeSoundType) {
  if (typeof window === 'undefined') return;

  // STRICT GLOBAL MUTE CHECK: If user muted sound FX, return immediately!
  if (!isSoundEnabled()) return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'quest_complete' || type === 'amaterasu_flame') {
      // 🔥 ICONIC UCHIHA AMATERASU BLACK FLAMES ACTIVATION SOUND
      const now = ctx.currentTime;

      // 1. Mangekyō Ocular Tension / Eye Lock High-Pitch Metallic Ringing (1850Hz -> 2650Hz)
      const eyeRing1 = ctx.createOscillator();
      const eyeRing2 = ctx.createOscillator();
      const eyeGain = ctx.createGain();

      eyeRing1.type = 'sine';
      eyeRing1.frequency.setValueAtTime(1850, now);
      eyeRing1.frequency.exponentialRampToValueAtTime(2650, now + 0.18);

      eyeRing2.type = 'triangle';
      eyeRing2.frequency.setValueAtTime(2780, now);
      eyeRing2.frequency.exponentialRampToValueAtTime(3400, now + 0.15);

      eyeGain.gain.setValueAtTime(0.28, now);
      eyeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      eyeRing1.connect(eyeGain);
      eyeRing2.connect(eyeGain);
      eyeGain.connect(ctx.destination);

      eyeRing1.start(now);
      eyeRing2.start(now);
      eyeRing1.stop(now + 0.55);
      eyeRing2.stop(now + 0.55);

      // 2. Heavy Sub-Bass Flame Impact (Deep Resonant "WHOOOM" 110Hz -> 38Hz)
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const bassFilter = ctx.createBiquadFilter();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(110, now);
      bassOsc.frequency.exponentialRampToValueAtTime(38, now + 0.45);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(280, now);
      bassFilter.frequency.exponentialRampToValueAtTime(80, now + 0.45);

      bassGain.gain.setValueAtTime(0.35, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + 0.5);

      // 3. Black Fire Burst Noise / Fire Whoosh (Noise Buffer through Bandpass Resonance)
      const bufferSize = ctx.sampleRate * 0.45; // 450ms noise
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(450, now + 0.4);
      noiseFilter.Q.setValueAtTime(3.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.32, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.45);

    } else if (type === 'sharingan_awaken') {
      // Authentic Uchiha Sharingan Eye Activation Sound
      const now = ctx.currentTime;
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(80, now);
      bassOsc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
      bassGain.gain.setValueAtTime(0.3, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.35);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start();
      bassOsc.stop(now + 0.7);

      // Iconic Metallic Ringing Tone
      const ringOsc1 = ctx.createOscillator();
      const ringOsc2 = ctx.createOscillator();
      const ringGain = ctx.createGain();

      ringOsc1.type = 'sine';
      ringOsc1.frequency.setValueAtTime(1420, now + 0.05);
      ringOsc1.frequency.exponentialRampToValueAtTime(1750, now + 0.4);

      ringOsc2.type = 'triangle';
      ringOsc2.frequency.setValueAtTime(2130, now + 0.05);
      ringOsc2.frequency.exponentialRampToValueAtTime(2450, now + 0.35);

      ringGain.gain.setValueAtTime(0.25, now + 0.05);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      ringOsc1.connect(ringGain);
      ringOsc2.connect(ringGain);
      ringGain.connect(ctx.destination);

      ringOsc1.start(now + 0.05);
      ringOsc2.start(now + 0.05);
      ringOsc1.stop(now + 0.9);
      ringOsc2.stop(now + 0.9);

    } else if (type === 'level_up') {
      // Fanfare powerup chime
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });

    } else if (type === 'streak_fire') {
      // Deep resonant power sweep
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(now + 0.3);

    } else if (type === 'achievement_unlocked') {
      // Radiant mythical chime
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.18, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.5);
      });
    }
  } catch (err) {
    // Graceful fallback if audio context blocked by browser policy
  }
}
