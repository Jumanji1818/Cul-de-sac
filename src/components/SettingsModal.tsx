/**
 * Settings & Wardrobe / Secrets Modal for Cul-de-Sac Chaos
 */

import React, { useState } from 'react';
import {
  PlayerSettings,
  GameProgress,
  ALL_HATS_LEO,
  ALL_HATS_MILO,
  ALL_SECRETS,
  saveSettings,
  saveProgress,
  resetAllProgress,
} from '../game/storage';
import { X, Sliders, Shirt, Trophy, RotateCcw, Check, Lock, Smartphone, Vibrate } from 'lucide-react';

interface SettingsModalProps {
  settings: PlayerSettings;
  progress: GameProgress;
  onUpdateSettings: (newSettings: PlayerSettings) => void;
  onUpdateProgress: (newProgress: GameProgress) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  progress,
  onUpdateSettings,
  onUpdateProgress,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'wardrobe' | 'secrets'>('settings');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggleVibration = () => {
    const next = { ...settings, vibrationEnabled: !settings.vibrationEnabled };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const handleToggleFloating = () => {
    const next = { ...settings, joystickFloating: !settings.joystickFloating };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const handleSensitivityChange = (val: number) => {
    const next = { ...settings, joystickSensitivity: val };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const handleButtonSizeChange = (size: 'small' | 'medium' | 'large') => {
    const next = { ...settings, buttonSize: size };
    onUpdateSettings(next);
    saveSettings(next);
  };

  const handleSelectLeoHat = (hatId: string) => {
    if (progress.unlockedHatsLeo.includes(hatId)) {
      const next = { ...progress, selectedHatLeo: hatId };
      onUpdateProgress(next);
      saveProgress(next);
    }
  };

  const handleSelectMiloHat = (hatId: string) => {
    if (progress.unlockedHatsMilo.includes(hatId)) {
      const next = { ...progress, selectedHatMilo: hatId };
      onUpdateProgress(next);
      saveProgress(next);
    }
  };

  const handleResetProgress = () => {
    resetAllProgress();
    window.location.reload();
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-display font-extrabold text-xl text-amber-400 uppercase tracking-wide">
              Game Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Controls & Mobile
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'wardrobe'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shirt className="w-3.5 h-3.5" />
            Costumes & Hats
          </button>
          <button
            onClick={() => setActiveTab('secrets')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'secrets'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Secrets & Medals
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Atmosphere & Lighting */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">Neighborhood Atmosphere</span>
                  <span className="text-[10px] text-slate-400">Time of day lighting & sky</span>
                </div>
                <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                  {[
                    { id: 'day', label: '☀️ Day' },
                    { id: 'sunset', label: '🌅 Sunset' },
                    { id: 'night', label: '🌙 Night' },
                  ].map((atm) => (
                    <button
                      key={atm.id}
                      onClick={() => {
                        const next = { ...settings, atmosphere: atm.id as any };
                        onUpdateSettings(next);
                        saveSettings(next);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        settings.atmosphere === atm.id ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {atm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Conditions */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">Weather Effect</span>
                  <span className="text-[10px] text-slate-400">Puddles and rainfall streaks</span>
                </div>
                <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                  {[
                    { id: 'sunny', label: '🌤️ Clear' },
                    { id: 'rain', label: '🌧️ Rain' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        const next = { ...settings, weather: w.id as any };
                        onUpdateSettings(next);
                        saveSettings(next);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        settings.weather === w.id ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound & Music Volumes */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-slate-200">Sound Effects Volume</span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => {
                    const next = { ...settings, sfxVolume: parseFloat(e.target.value) };
                    onUpdateSettings(next);
                    saveSettings(next);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="flex justify-between items-center font-medium pt-2">
                  <span className="text-slate-200">Music Volume</span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => {
                    const next = { ...settings, musicVolume: parseFloat(e.target.value) };
                    onUpdateSettings(next);
                    saveSettings(next);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Mobile Joystick Sensitivity */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between items-center font-medium">
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    Touch Joystick Sensitivity
                  </span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">
                    {settings.joystickSensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.1"
                  value={settings.joystickSensitivity}
                  onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Joystick Mode: Floating vs Fixed */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">Floating Virtual Joystick</span>
                  <span className="text-[10px] text-slate-400">
                    Spawns wherever your left thumb touches the screen
                  </span>
                </div>
                <button
                  onClick={handleToggleFloating}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    settings.joystickFloating ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Action Button Size */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">Action Button Scale</span>
                  <span className="text-[10px] text-slate-400">Thumb sizing for phones and tablets</span>
                </div>
                <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                  {(['small', 'medium', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleButtonSizeChange(s)}
                      className={`px-2.5 py-1 rounded text-[11px] capitalize font-medium transition-colors ${
                        settings.buttonSize === s ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Haptic Vibration */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <Vibrate className="w-3.5 h-3.5 text-amber-400" />
                    Vibration Haptic Feedback
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Haptics on kicks, car alarms, and high-fives (mobile)
                  </span>
                </div>
                <button
                  onClick={handleToggleVibration}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    settings.vibrationEnabled ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Reset Progress */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Reset high scores & unlocked items</span>
                {showResetConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetProgress}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs"
                    >
                      Confirm Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1.5 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Data
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'wardrobe' && (
            <div className="space-y-4">
              {/* Leo's Hats */}
              <div>
                <span className="font-bold text-slate-300 block mb-2 uppercase text-[11px] tracking-wider text-rose-400">
                  Leo's Costumes & Hats
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_HATS_LEO.map((hat) => {
                    const isUnlocked = progress.unlockedHatsLeo.includes(hat.id);
                    const isSelected = progress.selectedHatLeo === hat.id;
                    return (
                      <button
                        key={hat.id}
                        disabled={!isUnlocked}
                        onClick={() => handleSelectLeoHat(hat.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-rose-950/60 border-rose-500 text-white shadow-md'
                            : isUnlocked
                            ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-950/30 border-slate-800/40 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{hat.name}</span>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-rose-400" />
                          ) : !isUnlocked ? (
                            <Lock className="w-3 h-3 text-slate-600" />
                          ) : null}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">{hat.unlockReq}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Milo's Hats */}
              <div>
                <span className="font-bold text-slate-300 block mb-2 uppercase text-[11px] tracking-wider text-amber-400">
                  Milo's Costumes & Hats
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_HATS_MILO.map((hat) => {
                    const isUnlocked = progress.unlockedHatsMilo.includes(hat.id);
                    const isSelected = progress.selectedHatMilo === hat.id;
                    return (
                      <button
                        key={hat.id}
                        disabled={!isUnlocked}
                        onClick={() => handleSelectMiloHat(hat.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-500 text-white shadow-md'
                            : isUnlocked
                            ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            : 'bg-slate-950/30 border-slate-800/40 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{hat.name}</span>
                          {isSelected ? (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          ) : !isUnlocked ? (
                            <Lock className="w-3 h-3 text-slate-600" />
                          ) : null}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">{hat.unlockReq}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'secrets' && (
            <div className="space-y-4">
              <div>
                <span className="font-bold text-slate-300 block mb-2 uppercase text-[11px] tracking-wider text-amber-400">
                  Neighborhood Secrets Checklist
                </span>
                <div className="space-y-2">
                  {ALL_SECRETS.map((secret) => {
                    const isDiscovered = progress.discoveredSecrets.includes(secret.id);
                    return (
                      <div
                        key={secret.id}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                          isDiscovered
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                            : 'bg-slate-950/50 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                            isDiscovered ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'
                          }`}
                        >
                          {isDiscovered && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">{secret.name}</span>
                          <span className="text-[11px] text-slate-400 mt-0.5">{secret.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
