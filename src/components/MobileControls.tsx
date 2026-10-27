/**
 * Touch Controls for Mobile Devices (Android & iOS)
 * Virtual Joystick + Ergonomic Action Buttons with Multi-Touch Support.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { InputSystem } from '../game/input';
import { GadgetItem, CompanionCommand, GameMode } from '../game/types';
import { Zap, Sparkles, Flame, Radio, Rocket, Cloud, Footprints, Paintbrush } from 'lucide-react';

interface MobileControlsProps {
  input: InputSystem;
  activeGadget: GadgetItem;
  companionCommand: CompanionCommand;
  mode: GameMode;
  buttonSize?: 'small' | 'medium' | 'large';
  isFloatingJoystick?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  input,
  activeGadget,
  companionCommand,
  mode,
  buttonSize = 'medium',
  isFloatingJoystick = false,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number } | null>(null);

  // Button sizes scale
  const sizeClasses = {
    small: 'w-14 h-14 text-xs',
    medium: 'w-16 h-16 text-sm',
    large: 'w-20 h-20 text-base',
  };

  const maxRadius = buttonSize === 'large' ? 56 : buttonSize === 'small' ? 40 : 48;

  // Handle Joystick Touch Start
  const handleJoystickTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (joystickTouchIdRef.current !== null) return;

      const touch = e.changedTouches[0];
      joystickTouchIdRef.current = touch.identifier;
      setIsJoystickActive(true);

      if (isFloatingJoystick) {
        setFloatingPos({ x: touch.clientX, y: touch.clientY });
      }

      updateJoystickPosition(touch.clientX, touch.clientY);
    },
    [isFloatingJoystick]
  );

  const updateJoystickPosition = useCallback(
    (clientX: number, clientY: number) => {
      let centerX = 0;
      let centerY = 0;

      if (isFloatingJoystick && floatingPos) {
        centerX = floatingPos.x;
        centerY = floatingPos.y;
      } else if (joystickBaseRef.current) {
        const rect = joystickBaseRef.current.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
      }

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist === 0) {
        setKnobOffset({ x: 0, y: 0 });
        input.setJoystickMove(0, 0);
        return;
      }

      const clampedDist = Math.min(dist, maxRadius);
      const normX = dx / dist;
      const normY = dy / dist;

      setKnobOffset({
        x: normX * clampedDist,
        y: normY * clampedDist,
      });

      // Pass normalized 0-1 vector to InputSystem
      input.setJoystickMove((normX * clampedDist) / maxRadius, (normY * clampedDist) / maxRadius);
    },
    [input, isFloatingJoystick, floatingPos, maxRadius]
  );

  // Global Touch Move & End Listeners
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (joystickTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === joystickTouchIdRef.current) {
          updateJoystickPosition(t.clientX, t.clientY);
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (joystickTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === joystickTouchIdRef.current) {
          joystickTouchIdRef.current = null;
          setIsJoystickActive(false);
          setKnobOffset({ x: 0, y: 0 });
          setFloatingPos(null);
          input.setJoystickMove(0, 0);
          break;
        }
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [updateJoystickPosition, input]);

  // Gadget Icon Lookup
  const renderGadgetIcon = () => {
    switch (activeGadget.type) {
      case 'decoy':
        return <Radio className="w-5 h-5 text-amber-300" />;
      case 'mega_kick':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'banana_peel':
        return <span className="text-xl">🍌</span>;
      case 'confetti_bomb':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      case 'smoke_puff':
        return <Cloud className="w-5 h-5 text-purple-300" />;
      case 'buddy_boost':
        return <Rocket className="w-5 h-5 text-orange-400" />;
      default:
        return <Zap className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden">
      {/* 1. Virtual Joystick Area (Bottom-Left) */}
      <div
        className="absolute bottom-6 left-6 w-36 h-36 flex items-center justify-center pointer-events-auto touch-none"
        onTouchStart={handleJoystickTouchStart}
      >
        <div
          ref={joystickBaseRef}
          className={`relative rounded-full border-2 transition-all flex items-center justify-center ${
            isJoystickActive
              ? 'w-28 h-28 bg-slate-900/75 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
              : 'w-28 h-28 bg-slate-900/40 border-slate-600/60'
          }`}
          style={
            isFloatingJoystick && floatingPos
              ? { position: 'fixed', left: floatingPos.x - 56, top: floatingPos.y - 56 }
              : undefined
          }
        >
          {/* Subtle directional cross markings */}
          <div className="absolute w-full h-[1px] bg-slate-600/30" />
          <div className="absolute h-full w-[1px] bg-slate-600/30" />

          {/* Joystick Thumb Knob */}
          <div
            className={`w-14 h-14 rounded-full border-2 transition-transform shadow-lg flex items-center justify-center ${
              isJoystickActive
                ? 'bg-amber-400 border-amber-200 text-slate-950 scale-105'
                : 'bg-slate-700/80 border-slate-500 text-slate-300'
            }`}
            style={{
              transform: `translate3d(${knobOffset.x}px, ${knobOffset.y}px, 0)`,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-slate-900/40" />
          </div>
        </div>
      </div>

      {/* 2. Action Buttons Cluster (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-auto touch-none">
        {/* Top Row of Buttons: Companion Command & Cycle Gadget */}
        <div className="flex items-center gap-3">
          {/* Milo Companion Command Toggle (Solo Mode Only) */}
          {mode === 'SOLO' && (
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                input.triggerTouchCommand();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-amber-300 border border-amber-500/40 shadow-lg text-xs font-bold active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <span className="text-[10px] uppercase text-slate-400">Milo:</span>
              <span>{companionCommand}</span>
            </button>
          )}

          {/* Cycle Gadget Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              input.triggerTouchCycleGadget();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-sky-300 border border-sky-500/40 shadow-lg text-xs font-bold active:scale-95 transition-transform"
          >
            Swap Gadget ⇄
          </button>
        </div>

        {/* Action Buttons Arc */}
        <div className="flex items-end gap-3">
          {/* Gadget Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              input.triggerTouchGadget();
            }}
            className={`relative rounded-2xl bg-slate-900/90 border-2 border-sky-400 text-white font-bold shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform ${sizeClasses[buttonSize]}`}
          >
            {renderGadgetIcon()}
            <span className="text-[9px] font-mono mt-0.5 text-sky-200">
              {activeGadget.chargesRemaining}
            </span>
            {activeGadget.cooldownRemaining > 0 && (
              <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex items-center justify-center font-mono text-xs font-bold text-amber-300">
                {Math.ceil(activeGadget.cooldownRemaining)}s
              </div>
            )}
          </button>

          {/* High-Five / Duo Combo Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              input.triggerTouchHighFive();
            }}
            className={`rounded-2xl bg-amber-500 hover:bg-amber-400 border-2 border-amber-300 text-slate-950 font-bold shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform ${sizeClasses[buttonSize]}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[9px] uppercase font-display font-extrabold mt-0.5">DUO</span>
          </button>

          {/* Jump Button (3D Parkour & Curbs) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              input.triggerTouchJump();
            }}
            className={`rounded-2xl bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-300 text-white font-bold shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform ${sizeClasses[buttonSize]}`}
          >
            <Rocket className="w-5 h-5 text-cyan-200" />
            <span className="text-[9px] uppercase font-display font-extrabold mt-0.5">JUMP</span>
          </button>

          {/* Sprint Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              input.setTouchSprint(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              input.setTouchSprint(false);
            }}
            className={`rounded-2xl bg-slate-800/90 border-2 border-slate-600 text-white font-bold shadow-xl flex flex-col items-center justify-center active:scale-90 transition-transform ${sizeClasses[buttonSize]}`}
          >
            <Footprints className="w-5 h-5 text-amber-300" />
            <span className="text-[9px] uppercase font-mono mt-0.5">Sprint</span>
          </button>

          {/* Spray / Tag Parked Car Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              input.triggerTouchSpray(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              input.triggerTouchSpray(false);
            }}
            className={`rounded-2xl bg-gradient-to-tr from-fuchsia-600 to-pink-500 border-2 border-fuchsia-300 text-white font-bold shadow-[0_0_15px_rgba(236,72,153,0.45)] flex flex-col items-center justify-center active:scale-90 transition-transform ${sizeClasses[buttonSize]}`}
          >
            <Paintbrush className="w-5 h-5 text-yellow-200" />
            <span className="text-[9px] uppercase font-display font-black mt-0.5 tracking-wider">SPRAY</span>
          </button>

          {/* Primary Kick / Interact Button (Larger) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              input.triggerTouchKick(true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              input.triggerTouchKick(false);
            }}
            className={`rounded-2xl bg-rose-600 hover:bg-rose-500 border-3 border-rose-300 text-white font-black shadow-[0_0_20px_rgba(239,68,68,0.5)] flex flex-col items-center justify-center active:scale-90 transition-transform ${
              buttonSize === 'large'
                ? 'w-24 h-24 text-lg'
                : buttonSize === 'small'
                ? 'w-18 h-18 text-sm'
                : 'w-20 h-20 text-base'
            }`}
          >
            <Flame className="w-7 h-7 text-amber-200 fill-amber-200" />
            <span className="text-[10px] uppercase font-display tracking-wider mt-0.5 font-extrabold">
              KICK
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
