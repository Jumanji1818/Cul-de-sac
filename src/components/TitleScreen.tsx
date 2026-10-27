/**
 * Upgraded Title Screen with SVG title lockup, multiple game modes,
 * mobile touchscreen support, and preferences/wardrobe access.
 */

import React from 'react';
import { GameMode } from '../game/types';
import { Users, User, Volume2, VolumeX, Sparkles, Sliders, Timer, Target, Home, Flame } from 'lucide-react';

interface TitleScreenProps {
  mode: GameMode;
  onSetMode: (mode: GameMode) => void;
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenClubhouse?: () => void;
  onOpenChallengeCreator?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  mode,
  onSetMode,
  onStart,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenClubhouse,
  onOpenChallengeCreator,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-10 z-20 overflow-y-auto">
      {/* Top Bar with Audio, Clubhouse, Custom Challenges & Settings */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-300 bg-slate-900/85 px-3 py-1.5 rounded-md border border-amber-500/30 shadow-md">
            Suburban Havoc Simulator v2.0
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {onOpenClubhouse && (
            <button
              onClick={onOpenClubhouse}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900/80 rounded-md border border-amber-500/50 transition-colors shadow-md cursor-pointer"
              title="Secret Clubhouse & Progression Base"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>Clubhouse 🏡</span>
            </button>
          )}

          {onOpenChallengeCreator && (
            <button
              onClick={onOpenChallengeCreator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-300 bg-sky-950/80 hover:bg-sky-900/80 rounded-md border border-sky-500/50 transition-colors shadow-md cursor-pointer"
              title="Create Custom Mischief Challenge"
            >
              <Flame className="w-3.5 h-3.5 text-sky-400" />
              <span>Custom Challenge 🎮</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/85 hover:bg-slate-800 rounded-md border border-slate-700 transition-colors shadow-md cursor-pointer"
            title="Settings & Costumes"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Settings</span>
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/85 hover:bg-slate-800 rounded-md border border-slate-700 transition-colors shadow-md cursor-pointer"
            title="Toggle Audio (M)"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="tabular-nums hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece & Inline SVG Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-2xl mx-auto pointer-events-auto py-6">
        {/* Bespoke Inline SVG Logo */}
        <div className="w-full max-w-lg mb-4 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]">
          <svg viewBox="0 0 600 160" className="w-full h-auto">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient id="troubleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Backplate shadow text */}
            <text
              x="300"
              y="74"
              textAnchor="middle"
              className="font-display font-extrabold"
              fontSize="66"
              fill="#0f172a"
              letterSpacing="2"
            >
              CUL-DE-SAC CHAOS
            </text>

            {/* Foreground title */}
            <text
              x="298"
              y="70"
              textAnchor="middle"
              className="font-display font-extrabold"
              fontSize="66"
              fill="url(#titleGrad)"
              stroke="#0f172a"
              strokeWidth="5"
              letterSpacing="2"
            >
              CUL-DE-SAC CHAOS
            </text>

            {/* Sub-lockup banner */}
            <rect x="150" y="98" width="300" height="36" rx="6" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
            <text
              x="300"
              y="122"
              textAnchor="middle"
              className="font-display font-bold"
              fontSize="20"
              fill="url(#troubleGrad)"
              letterSpacing="4"
            >
              ★ DOUBLE TROUBLE ★
            </text>
          </svg>
        </div>

        <p className="text-xs md:text-sm text-slate-200 mb-6 max-w-md font-medium leading-relaxed drop-shadow-md">
          Two best friends causing chaotic suburban trouble! Smart companion Milo kicks cans independently and acts as your lookout whistling warnings while you spray-paint parked cars in an expanded neighborhood!
        </p>

        {/* Game Mode Selector Grid */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-700/80 mb-6 shadow-xl max-w-lg w-full">
          <button
            onClick={() => onSetMode('SOLO')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'SOLO'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Solo + AI Buddy
          </button>
          <button
            onClick={() => onSetMode('COOP')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'COOP'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Local 2P Co-Op
          </button>
          <button
            onClick={() => onSetMode('TIMED_CHAOS')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'TIMED_CHAOS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Timer className="w-3.5 h-3.5 text-rose-400" />
            Timed Blitz (2 Min)
          </button>
          <button
            onClick={() => onSetMode('COOP_TRIALS')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'COOP_TRIALS'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-sky-400" />
            Duo Synergy Trials
          </button>
        </div>

        {/* Primary Start CTA */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-10 py-3.5 text-base md:text-lg font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.5)] border-2 border-amber-200 transition-all cursor-pointer"
        >
          <Sparkles className="w-5 h-5 mr-2 animate-bounce" />
          START HAVOC
        </button>
        <span className="text-[11px] text-amber-200/90 mt-2 font-medium tracking-wide">
          Press Space or Enter · Touch to Start
        </span>
      </div>

      {/* Flat Control Hints Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full text-[11px] text-slate-300 font-mono tracking-tight bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800/80 pointer-events-auto shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-semibold">Controls:</span>
          <span>WASD/Touch Move · Space/Touch Kick · Hold R/Spray Tag Car · E High-Five</span>
        </div>

        <div className="text-slate-400 mt-1 md:mt-0 flex items-center gap-2">
          <span>Esc Pause · Q Milo Command · G Gadget · Tab Swap Gadget</span>
        </div>
      </div>
    </div>
  );
};
