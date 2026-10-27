/**
 * Pause Menu Modal with controls quick-sheet and audio toggling
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Sliders } from 'lucide-react';
import { GameMode } from '../game/types';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onTitleMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  mode: GameMode;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onTitleMenu,
  isMuted,
  onToggleMute,
  onOpenSettings,
  mode,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 font-sans">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="font-display font-extrabold text-2xl uppercase tracking-wider text-amber-400">
            Game Paused
          </h2>
          <p className="text-xs text-slate-400 mt-1">Taking a breather from suburban trouble</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mb-6">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Resume Game
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors border border-slate-700 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Preferences, Mobile & Costumes
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart Level
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors border border-slate-700 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          <button
            onClick={onTitleMenu}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Return to Title
          </button>
        </div>

        {/* Controls Quick Sheet */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs">
          <span className="font-semibold text-amber-400 block mb-2 uppercase text-[10px] tracking-wider">
            Controls Quick Reference
          </span>
          <div className="space-y-1.5 text-slate-300 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">P1 (Leo):</span>
              <span>WASD / Virtual Joystick</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Kick / Action:</span>
              <span>Space / F or Touch KICK</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gadgets:</span>
              <span>G or Touch Gadget (Tab to swap)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Milo Command:</span>
              <span>Q or Touch Command</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">High-Five Duo:</span>
              <span>E or Touch DUO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
