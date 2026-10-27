/**
 * Custom Challenge & Arcade Creator Modal for Cul-de-Sac Chaos
 * Build and play custom mischief challenges with modifiers and target scores.
 */

import React, { useState } from 'react';
import { X, Play, Flame, ShieldAlert, Sparkles, Clock, Target, CheckSquare, Square } from 'lucide-react';
import { LevelConfig } from '../game/types';

interface ChallengeCreatorModalProps {
  onClose: () => void;
  onStartCustomChallenge: (customLevel: LevelConfig) => void;
}

export const ChallengeCreatorModal: React.FC<ChallengeCreatorModalProps> = ({
  onClose,
  onStartCustomChallenge,
}) => {
  const [title, setTitle] = useState('My Custom Rampage');
  const [timeLimit, setTimeLimit] = useState(120);
  const [targetScore, setTargetScore] = useState(4000);
  const [selectedLocation, setSelectedLocation] = useState<'street' | 'park' | 'mansion'>('street');

  // Modifiers
  const [modGuardLockdown, setModGuardLockdown] = useState(true);
  const [modPetFrenzy, setModPetFrenzy] = useState(true);
  const [modRivalTrouble, setModRivalTrouble] = useState(true);
  const [modSpeedBoost, setModSpeedBoost] = useState(false);

  const handleLaunch = () => {
    const customObjectives = [
      {
        id: 'chaos_points',
        text: `Rack up ${targetScore.toLocaleString()} Chaos Points`,
        current: 0,
        target: targetScore,
        completed: false,
        points: Math.round(targetScore * 0.25),
      },
      {
        id: 'kick_trash',
        text: 'Overturn 6 neighborhood trash cans',
        current: 0,
        target: 6,
        completed: false,
        points: 400,
      },
      {
        id: 'car_alarm',
        text: 'Trigger 2 parked car alarms',
        current: 0,
        target: 2,
        completed: false,
        points: 400,
      },
      {
        id: 'banana_slip',
        text: 'Slip a pursuing resident or guard with a banana',
        current: 0,
        target: 1,
        completed: false,
        points: 350,
      },
    ];

    const config: LevelConfig = {
      levelNumber: 777,
      title: title || 'Custom Mayhem Trial',
      description: `Custom Challenge at ${selectedLocation.toUpperCase()} with active modifiers.`,
      targetScore,
      timeLimit,
      objectives: customObjectives,
    };

    onStartCustomChallenge(config);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-amber-400 uppercase tracking-wide">
                Custom Challenge Creator
              </h2>
              <p className="text-xs text-slate-400">Design your own neighborhood trial & play immediately</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Challenge Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:border-amber-400 focus:outline-none"
              placeholder="e.g. Midnight Mansion Heist"
            />
          </div>

          {/* Location Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Primary Zone</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'street', label: 'Maple Way Street' },
                { id: 'park', label: 'Central Duck Park' },
                { id: 'mansion', label: 'The Rich Mansion' },
              ].map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedLocation === loc.id
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit & Target Score */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1">
                <span>Time Limit</span>
                <span className="font-mono text-amber-400">{timeLimit}s</span>
              </label>
              <input
                type="range"
                min={60}
                max={240}
                step={30}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1">
                <span>Target Score</span>
                <span className="font-mono text-amber-400">{targetScore.toLocaleString()} PTS</span>
              </label>
              <input
                type="range"
                min={1500}
                max={10000}
                step={500}
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Modifiers Checkboxes */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Chaos Modifiers</label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modGuardLockdown}
                  onChange={(e) => setModGuardLockdown(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-slate-200">
                  Officer Vance Estate Guard Patrol (High alert with flashlight cone)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modPetFrenzy}
                  onChange={(e) => setModPetFrenzy(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-slate-200">
                  Pet Frenzy (Bruno & Buster roam freely outside fences)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modRivalTrouble}
                  onChange={(e) => setModRivalTrouble(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-slate-200">
                  Rival Duo Infiltration (Ziggy & Dex compete for high score)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleLaunch}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black rounded-xl flex items-center gap-2 text-xs shadow-xl active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>LAUNCH CUSTOM TRIAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
