/**
 * Photo Mode Modal for Cul-de-Sac Chaos
 * Allows custom framing, character poses, visual filters, and downloading snapshots.
 */

import React, { useState } from 'react';
import { Camera, X, Download, Sparkles, Sliders, Eye, Sun, Moon, Contrast } from 'lucide-react';
import { GameEngine } from '../game/engine';

interface PhotoModeModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export type PhotoFilter = 'normal' | 'vibrant' | 'sunset' | 'noir' | 'neon';
export type CharacterPose = 'smirk' | 'victory' | 'kick' | 'spray' | 'ninja';

export const PhotoModeModal: React.FC<PhotoModeModalProps> = ({ engine, onClose }) => {
  const [filter, setFilter] = useState<PhotoFilter>('normal');
  const [pose, setPose] = useState<CharacterPose>('smirk');
  const [zoom, setZoom] = useState<number>(20);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCapture = () => {
    try {
      const canvas = engine.canvas;
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl);

      // Trigger browser download
      const link = document.createElement('a');
      link.download = `CulDeSacChaos_Snapshot_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      // Fallback
    }
  };

  const handleZoomChange = (newDist: number) => {
    setZoom(newDist);
    engine.threeRenderer.targetDistance = newDist;
    engine.threeRenderer.cameraDistance = newDist;
  };

  const handlePoseChange = (newPose: CharacterPose) => {
    setPose(newPose);
    if (newPose === 'kick') {
      engine.p1.kickCooldown = 2.0;
    } else if (newPose === 'spray') {
      engine.p1.isSpraying = true;
    } else {
      engine.p1.kickCooldown = 0;
      engine.p1.isSpraying = false;
    }
  };

  const getFilterStyle = (): React.CSSProperties => {
    switch (filter) {
      case 'vibrant':
        return { filter: 'saturate(1.6) contrast(1.15) brightness(1.05)' };
      case 'sunset':
        return { filter: 'sepia(0.4) saturate(1.4) hue-rotate(-15deg)' };
      case 'noir':
        return { filter: 'grayscale(1) contrast(1.4) brightness(0.95)' };
      case 'neon':
        return { filter: 'saturate(2.2) contrast(1.3) hue-rotate(30deg)' };
      default:
        return {};
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between pointer-events-none p-4 md:p-6 select-none animate-fade-in">
      {/* Top Banner */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-950/90 px-4 py-2 rounded-xl border border-amber-500/40 shadow-xl">
          <Camera className="w-5 h-5 text-amber-400" />
          <span className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
            Photo Studio Mode
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
            Drag screen to frame shot
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors cursor-pointer shadow-lg"
          title="Exit Photo Mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Snapshot Preview Modal if taken */}
      {capturedImage && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 max-w-lg w-full flex flex-col items-center">
            <h3 className="font-bold text-amber-400 text-base mb-2">Snapshot Saved to Photos!</h3>
            <img src={capturedImage} alt="Captured Screenshot" className="rounded-xl border border-slate-800 max-h-64 object-cover" />
            <button
              onClick={() => setCapturedImage(null)}
              className="mt-4 px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl cursor-pointer"
            >
              Back to Camera
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-950/95 border border-slate-800 p-4 rounded-2xl shadow-2xl pointer-events-auto w-full max-w-3xl mx-auto backdrop-blur-md">
        {/* Poses */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pose:</span>
          <div className="flex items-center gap-1">
            {(['smirk', 'victory', 'kick', 'spray'] as CharacterPose[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePoseChange(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  pose === p ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Filter:</span>
          <div className="flex items-center gap-1">
            {(['normal', 'vibrant', 'sunset', 'noir', 'neon'] as PhotoFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  filter === f ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Zoom:</span>
          <input
            type="range"
            min={12}
            max={32}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-24 accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Snap Button */}
        <button
          onClick={handleCapture}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black rounded-xl flex items-center gap-2 text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>SNAP PHOTO</span>
        </button>
      </div>
    </div>
  );
};
