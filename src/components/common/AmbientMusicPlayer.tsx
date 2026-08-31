'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ambientSound, AMBIENT_TRACKS, AmbientTrackId } from '@/lib/ambient-sound';
import { Volume2, VolumeX, Play, Pause, ChevronDown, ChevronUp, Music } from 'lucide-react';

export function AmbientMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AmbientTrackId>('calm_ocean_tide');
  const [volume, setVolume] = useState(65);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasTriggeredRef = useRef(false);

  const startPlayback = useCallback(() => {
    try {
      ambientSound.initContext();
      ambientSound.play(currentTrack);
      setIsPlaying(true);
    } catch (_) {}
  }, [currentTrack]);

  useEffect(() => {
    // Attempt autoplay on mount
    startPlayback();

    // Unlock on first user gesture anywhere on screen
    const unlockAudio = () => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        startPlayback();
      }
    };

    window.addEventListener('click', unlockAudio, { capture: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { capture: true, passive: true });
    window.addEventListener('pointerdown', unlockAudio, { capture: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { capture: true, passive: true });
    window.addEventListener('scroll', unlockAudio, { capture: true, passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio, true);
      window.removeEventListener('touchstart', unlockAudio, true);
      window.removeEventListener('pointerdown', unlockAudio, true);
      window.removeEventListener('keydown', unlockAudio, true);
      window.removeEventListener('scroll', unlockAudio, true);
    };
  }, [startPlayback]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlaying) {
      ambientSound.stop();
      setIsPlaying(false);
    } else {
      startPlayback();
    }
  };

  const handleTrackChange = (trackId: AmbientTrackId) => {
    setCurrentTrack(trackId);
    ambientSound.play(trackId);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    ambientSound.setVolume(val / 100);
  };

  const activeTrackObj = AMBIENT_TRACKS.find((t) => t.id === currentTrack) || AMBIENT_TRACKS[0];

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Expanded Track & Volume Control Card */}
      {isExpanded && (
        <div className="mb-2.5 p-4 rounded-2xl bg-[#040814]/95 border border-sky-500/40 shadow-2xl backdrop-blur-2xl w-72 sm:w-80 space-y-3.5 text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌙</span>
              <div>
                <h4 className="text-xs font-bold font-heading text-white">PEACEFUL SANCTUARY SOUND</h4>
                <p className="text-[9px] text-sky-300 font-mono">Calm 432Hz Zen Ambiance</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg hover:bg-sky-950/60 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Track Selection Chips */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
              Select Sanctuary Tone:
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {AMBIENT_TRACKS.map((track) => {
                const isActive = currentTrack === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleTrackChange(track.id)}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-950/90 to-ocean-900/90 border-sky-400/60 text-white shadow-glow-cyan'
                        : 'bg-ocean-950/40 border-sky-500/15 text-slate-300 hover:border-sky-500/40 hover:bg-ocean-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{track.emoji}</span>
                      <div>
                        <div className="text-xs font-bold">{track.name}</div>
                        <div className="text-[9px] text-slate-400 leading-tight line-clamp-1">
                          {track.description}
                        </div>
                      </div>
                    </div>
                    {isActive && isPlaying && (
                      <span className="flex items-center gap-0.5 ml-2">
                        <span className="w-1 h-3 bg-sky-400 animate-pulse rounded-full" />
                        <span className="w-1 h-4 bg-cyan-300 animate-pulse delay-75 rounded-full" />
                        <span className="w-1 h-2 bg-sky-400 animate-pulse delay-150 rounded-full" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Volume Control */}
          <div className="space-y-1.5 pt-1 border-t border-sky-500/15">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
                <span>Volume</span>
              </span>
              <span className="text-sky-300 font-bold">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 bg-ocean-950 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>
      )}

      {/* Floating Compact Glass Pill */}
      <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-[#040814]/90 border border-sky-500/40 shadow-2xl backdrop-blur-2xl hover:border-sky-400/70 transition-all">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-glow-cyan scale-105'
              : 'bg-ocean-950 text-sky-300 border border-sky-500/40 hover:bg-sky-950 hover:scale-105'
          }`}
          title={isPlaying ? 'Pause Ambient Sound' : 'Play Ambient Sound'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5 fill-sky-300" />}
        </button>

        {/* Track Info & Equalizer */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 cursor-pointer px-1"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">{activeTrackObj.emoji}</span>
              <span className="text-xs font-bold text-white max-w-[110px] sm:max-w-[130px] truncate">
                {activeTrackObj.name}
              </span>
            </div>
            <span className="text-[9px] text-sky-400 font-mono">
              {isPlaying ? 'Playing Sanctuary Calm' : 'Click to Listen'}
            </span>
          </div>

          {/* Animated Equalizer Wavebars */}
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-4 ml-1">
              <span className="w-0.5 h-3 bg-sky-400 animate-pulse rounded-full" />
              <span className="w-0.5 h-4 bg-cyan-300 animate-pulse delay-100 rounded-full" />
              <span className="w-0.5 h-2 bg-teal-400 animate-pulse delay-75 rounded-full" />
              <span className="w-0.5 h-3.5 bg-sky-300 animate-pulse delay-150 rounded-full" />
            </div>
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </div>
    </div>
  );
}
