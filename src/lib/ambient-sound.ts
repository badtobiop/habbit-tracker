'use client';

/**
 * Lunar Sanctuary Peaceful Ambient Soundscape Engine
 * 100% Continuous, soothing Peaceful Ocean Drift & gentle night breeze.
 */

export type AmbientTrackId = 'calm_ocean_tide' | 'moonlit_peace' | 'gentle_night_breeze' | 'deep_focus_calm';

export interface AmbientTrack {
  id: AmbientTrackId;
  name: string;
  emoji: string;
  description: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'calm_ocean_tide',
    name: 'Peaceful Ocean Drift',
    emoji: '🌊',
    description: 'Continuous soft, ultra-slow oceanic drift and peaceful ambiance',
  },
  {
    id: 'moonlit_peace',
    name: 'Moonlit Sanctuary Calm',
    emoji: '🌙',
    description: 'Continuous warm 432Hz meditative harmony & soft slow night breeze',
  },
  {
    id: 'gentle_night_breeze',
    name: 'Gentle Starlight Breeze',
    emoji: '🍃',
    description: 'Continuous soothing night wind whispering over calm water',
  },
  {
    id: 'deep_focus_calm',
    name: 'Deep Focus Alpha Drone',
    emoji: '🌌',
    description: 'Continuous sacred 108Hz warm cosmic meditation drone',
  },
];

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTrack: AmbientTrackId = 'calm_ocean_tide';
  private masterGain: GainNode | null = null;
  private volume: number = 0.65;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];

  public initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): AmbientTrackId {
    return this.currentTrack;
  }

  public stop() {
    this.isPlaying = false;
    this.activeNodes.forEach((n) => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (_) {}
    });
    this.activeNodes = [];
  }

  public play(trackId?: AmbientTrackId) {
    if (typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (trackId) {
      this.currentTrack = trackId;
    }

    this.stop();
    this.isPlaying = true;

    if (this.currentTrack === 'calm_ocean_tide') {
      this.startCalmOceanTide();
    } else if (this.currentTrack === 'moonlit_peace') {
      this.startMoonlitPeace();
    } else if (this.currentTrack === 'gentle_night_breeze') {
      this.startGentleNightBreeze();
    } else if (this.currentTrack === 'deep_focus_calm') {
      this.startDeepFocusCalm();
    }
  }

  /**
   * Continuous, clearly audible, soothing night breeze
   */
  private addSlowNightBreeze(gainLevel: number = 0.28) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.055;
        b1 = 0.99332 * b1 + white * 0.075;
        b2 = 0.96900 * b2 + white * 0.15;
        data[i] = (b0 + b1 + b2) * 0.65;
      }
    }

    const breezeSource = ctx.createBufferSource();
    breezeSource.buffer = buffer;
    breezeSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    // Smooth breathing LFO
    const breezeLFO = ctx.createOscillator();
    breezeLFO.frequency.setValueAtTime(0.06, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(180, ctx.currentTime);

    breezeLFO.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const breezeGain = ctx.createGain();
    breezeGain.gain.setValueAtTime(gainLevel, ctx.currentTime);

    breezeSource.connect(filter);
    filter.connect(breezeGain);
    breezeGain.connect(this.masterGain);

    breezeSource.start();
    breezeLFO.start();

    this.activeNodes.push(breezeSource, breezeLFO, filter, breezeGain);
  }

  /**
   * 1. Peaceful Ocean Drift: Continuous deep oceanic tidal waves and soothing drift
   */
  private startCalmOceanTide() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Layer 1: Soft nocturnal sea breeze
    this.addSlowNightBreeze(0.32);

    // Layer 2: Deep oceanic tidal pink-noise swell (slow 12-second wave breathing)
    const bufferSize = ctx.sampleRate * 6;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.8;
      }
    }

    const swellSource = ctx.createBufferSource();
    swellSource.buffer = buffer;
    swellSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);

    // Slow rhythmic wave cycle (0.08Hz = ~12.5 seconds per wave rise & fall)
    const swellLFO = ctx.createOscillator();
    swellLFO.frequency.setValueAtTime(0.08, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(220, now);

    swellLFO.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const swellGain = ctx.createGain();
    swellGain.gain.setValueAtTime(0.38, now);

    // Layer 3: Warm subtle underwater oceanic resonance drone (54Hz / 108Hz)
    const subDrone = ctx.createOscillator();
    subDrone.type = 'sine';
    subDrone.frequency.setValueAtTime(54, now);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.16, now);

    subDrone.connect(subGain);
    subGain.connect(this.masterGain);
    subDrone.start();

    swellSource.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(this.masterGain);

    swellSource.start();
    swellLFO.start();

    this.activeNodes.push(swellSource, swellLFO, filter, swellGain, subDrone, subGain);
  }

  /**
   * 2. Moonlit Sanctuary Calm: Warm 432Hz chord pad & night breeze
   */
  private startMoonlitPeace() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    this.addSlowNightBreeze(0.24);

    const chordFreqs = [108, 162, 216, 270, 324];

    chordFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, now);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08 + idx * 0.015, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(2.0, now);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const targetGain = 0.18 / (idx === 0 ? 1.0 : 1.4);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(targetGain, now + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      lfo.start(now);

      this.activeNodes.push(osc, lfo, filter, gain);
    });
  }

  /**
   * 3. Gentle Starlight Breeze: Continuous pure wind & starlight atmosphere
   */
  private startGentleNightBreeze() {
    this.addSlowNightBreeze(0.48);
  }

  /**
   * 4. Deep Focus Alpha Drone: Sacred 108Hz / 216Hz binaural meditation drone
   */
  private startDeepFocusCalm() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    this.addSlowNightBreeze(0.18);

    const drone1 = ctx.createOscillator();
    const drone2 = ctx.createOscillator();
    const droneGain = ctx.createGain();

    drone1.type = 'sine';
    drone1.frequency.setValueAtTime(108, now);

    drone2.type = 'triangle';
    drone2.frequency.setValueAtTime(216, now);

    droneGain.gain.setValueAtTime(0.01, now);
    droneGain.gain.linearRampToValueAtTime(0.22, now + 0.08);

    drone1.connect(droneGain);
    drone2.connect(droneGain);
    droneGain.connect(this.masterGain);

    drone1.start();
    drone2.start();

    this.activeNodes.push(drone1, drone2, droneGain);
  }
}

export const ambientSound = new AmbientSoundEngine();
