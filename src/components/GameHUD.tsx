/**
 * Low-Occlusion Perimeter Game HUD with tabular-nums, Gadget Slot, and Companion State.
 */

import React from 'react';
import { MischiefObjective, GameMode, GadgetItem, CompanionCommand } from '../game/types';
import {
  Volume2,
  VolumeX,
  Pause,
  Flame,
  Check,
  ShieldAlert,
  Zap,
  Clock,
  Radio,
  Sparkles,
  Cloud,
  Rocket,
  Sliders,
  Video,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Home,
  Camera,
} from 'lucide-react';

interface GameHUDProps {
  score: number;
  combo: number;
  peaceLevel: number;
  wantedStars: number;
  objectives: MischiefObjective[];
  timeLeft: number;
  mode: GameMode;
  activeGadget: GadgetItem;
  companionCommand: CompanionCommand;
  cameraMode?: 'OVERVIEW' | 'FOLLOW';
  onToggleCameraMode?: () => void;
  onSnapCamera?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetCamera?: () => void;
  onOpenClubhouse?: () => void;
  onOpenPhotoMode?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenSettings: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  combo,
  peaceLevel,
  wantedStars,
  objectives,
  timeLeft,
  mode,
  activeGadget,
  companionCommand,
  cameraMode = 'OVERVIEW',
  onToggleCameraMode,
  onSnapCamera,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  onOpenClubhouse,
  onOpenPhotoMode,
  isMuted,
  onToggleMute,
  onPause,
  onOpenSettings,
}) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const peacePercent = Math.max(0, Math.min(100, Math.round(peaceLevel)));
  let peaceBarColor = 'bg-emerald-500';
  let peaceLabel = 'Peaceful';
  if (peacePercent < 35) {
    peaceBarColor = 'bg-rose-500';
    peaceLabel = 'NEIGHBORHOOD RIOT!';
  } else if (peacePercent < 70) {
    peaceBarColor = 'bg-amber-500';
    peaceLabel = 'Disturbed';
  }

  const renderGadgetIcon = () => {
    switch (activeGadget.type) {
      case 'decoy':
        return <Radio className="w-4 h-4 text-amber-300" />;
      case 'mega_kick':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'banana_peel':
        return <span className="text-base leading-none">🍌</span>;
      case 'confetti_bomb':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'smoke_puff':
        return <Cloud className="w-4 h-4 text-purple-300" />;
      case 'buddy_boost':
        return <Rocket className="w-4 h-4 text-orange-400" />;
      default:
        return <Zap className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 select-none z-10">
      {/* Top Header Strip */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left Cluster: Score, Multiplier, Peace */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Score & Combo */}
          <div className="flex items-center gap-3 bg-slate-950/85 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-slate-800 shadow-lg">
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-slate-400">Chaos Score</span>
              <span className="font-mono text-lg md:text-2xl font-bold tabular-nums text-amber-400">
                {score.toLocaleString()}
              </span>
            </div>

            {combo > 1 && (
              <div className="flex items-center gap-1 bg-rose-600/90 text-white font-display font-extrabold px-2 py-0.5 rounded-lg text-xs animate-pulse shadow-md">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span className="tabular-nums">{combo}x DUO</span>
              </div>
            )}
          </div>

          {/* Neighborhood Peace Disturbance Bar */}
          <div className="bg-slate-950/85 px-3 py-1.5 rounded-lg border border-slate-800 shadow-md w-44 md:w-60">
            <div className="flex items-center justify-between text-[10px] md:text-[11px] font-semibold mb-1">
              <span className="text-slate-300">Peace Level</span>
              <span className="tabular-nums text-slate-200">{peacePercent}%</span>
            </div>
            <div className="w-full h-1.5 md:h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${peaceBarColor} transition-all duration-300`}
                style={{ width: `${peacePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-Center Cluster: Wanted Stars */}
        <div className="flex flex-col items-center bg-slate-950/85 px-3 py-1 md:px-4 md:py-1.5 rounded-xl border border-slate-800 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1 text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-0.5">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span>Alert</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm md:text-lg transition-transform ${
                  star <= wantedStars
                    ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'text-slate-700'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Top-Right Cluster: Camera Controls, Objectives, Curfew Timer, Quick Actions */}
        <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            {/* Camera Controls Toolbar */}
            <div className="flex items-center gap-1 bg-slate-950/85 px-1.5 py-1 rounded-lg border border-slate-800 shadow-md">
              <button
                onClick={onToggleCameraMode}
                className={`px-2 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border ${
                  cameraMode === 'OVERVIEW'
                    ? 'bg-sky-950/70 text-sky-300 border-sky-700/60'
                    : 'bg-amber-950/70 text-amber-300 border-amber-700/60'
                }`}
                title="Toggle Camera: Stable Overview vs Follow Behind (Z)"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{cameraMode === 'OVERVIEW' ? 'Overview' : 'Follow'}</span>
              </button>

              <button
                onClick={onSnapCamera}
                className="p-1 md:p-1.5 hover:bg-slate-800 rounded text-amber-300 transition-colors cursor-pointer"
                title="Center Camera Behind Player (V / C)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onZoomIn}
                className="p-1 md:p-1.5 hover:bg-slate-800 rounded text-slate-300 transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onZoomOut}
                className="p-1 md:p-1.5 hover:bg-slate-800 rounded text-slate-300 transition-colors cursor-pointer"
                title="Zoom Out (Spot Wider Neighborhood)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Curfew Clock */}
            <div className="flex items-center gap-1.5 bg-slate-950/85 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-slate-800 text-slate-200 font-mono text-xs md:text-sm shadow-md">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="tabular-nums font-bold">{timeFormatted}</span>
            </div>

            {/* Clubhouse button */}
            {onOpenClubhouse && (
              <button
                onClick={onOpenClubhouse}
                className="p-1.5 md:p-2 bg-slate-950/85 hover:bg-slate-800 rounded-lg border border-amber-500/40 text-amber-300 transition-colors cursor-pointer shadow-md flex items-center gap-1"
                title="Clubhouse & Progression Base"
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-bold hidden sm:inline">Base</span>
              </button>
            )}

            {/* Photo Mode button */}
            {onOpenPhotoMode && (
              <button
                onClick={onOpenPhotoMode}
                className="p-1.5 md:p-2 bg-slate-950/85 hover:bg-slate-800 rounded-lg border border-slate-800 text-sky-300 transition-colors cursor-pointer shadow-md"
                title="Photo Studio Mode"
              >
                <Camera className="w-4 h-4 text-sky-400" />
              </button>
            )}

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 md:p-2 bg-slate-950/85 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 transition-colors cursor-pointer shadow-md"
              title="Preferences (Settings)"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
            </button>

            {/* Mute button */}
            <button
              onClick={onToggleMute}
              className="p-1.5 md:p-2 bg-slate-950/85 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 transition-colors cursor-pointer shadow-md"
              title="Toggle Audio (M)"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Pause button */}
            <button
              onClick={onPause}
              className="p-1.5 md:p-2 bg-slate-950/85 hover:bg-slate-800 rounded-lg border border-slate-800 text-slate-300 transition-colors cursor-pointer shadow-md"
              title="Pause Game (Esc)"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {/* Objectives Checklist Card */}
          <div className="bg-slate-950/85 p-2.5 md:p-3 rounded-xl border border-slate-800 shadow-xl max-w-xs text-[11px] md:text-xs">
            <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-amber-400 block mb-1">
              Mischief Checklist
            </span>
            <div className="space-y-1">
              {objectives.map((obj) => (
                <div
                  key={obj.id}
                  className={`flex items-start gap-1.5 transition-opacity ${
                    obj.completed ? 'text-emerald-400 line-through opacity-70' : 'text-slate-200'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-3 h-3 md:w-3.5 md:h-3.5 rounded flex items-center justify-center shrink-0 ${
                      obj.completed ? 'bg-emerald-500/20 text-emerald-400' : 'border border-slate-600'
                    }`}
                  >
                    {obj.completed && <Check className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                  </div>
                  <span className="leading-tight">
                    {obj.isBonus && <span className="text-amber-400 font-bold mr-1">★</span>}
                    {obj.text}{' '}
                    <span className="font-mono tabular-nums text-slate-400">
                      [{obj.current}/{obj.target}]
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Perimeter: Player Status & Gadget Card */}
      <div className="flex items-end justify-between w-full pointer-events-auto">
        {/* Leo Badge */}
        <div className="flex items-center gap-2 bg-slate-950/85 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border border-slate-800 shadow-lg">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white text-xs border border-rose-400">
            L
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">Leo</span>
            <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">WASD · Space Kick · V: Center Cam · Drag to Orbit</span>
          </div>
        </div>

        {/* Equipped Gadget Quick Slot Card */}
        <div className="flex items-center gap-2 bg-slate-950/90 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-sky-500/40 shadow-lg text-xs">
          <div className="w-7 h-7 rounded-lg bg-sky-950/80 border border-sky-400/60 flex items-center justify-center">
            {renderGadgetIcon()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-200 text-[11px] md:text-xs">{activeGadget.name}</span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>{activeGadget.chargesRemaining} charges left</span>
              {activeGadget.cooldownRemaining > 0 && (
                <span className="text-amber-400 font-bold">
                  {Math.ceil(activeGadget.cooldownRemaining)}s CD
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Milo Badge & Command */}
        <div className="flex items-center gap-2 bg-slate-950/85 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border border-slate-800 shadow-lg">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-200">Milo</span>
              <span className="text-[8px] md:text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded font-semibold uppercase">
                {mode === 'COOP' ? 'P2' : companionCommand}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
              {mode === 'COOP' ? 'Arrows · Enter Kick/Spray' : 'Smart AI · Lookout Guard'}
            </span>
          </div>
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs border border-amber-300">
            M
          </div>
        </div>
      </div>
    </div>
  );
};
