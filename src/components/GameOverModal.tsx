/**
 * Suburban Gazette Wrap-Up Modal (Victory & Busted states)
 * Features Medal Awards, Extended Stat Breakdowns, and Replay Actions.
 */

import React from 'react';
import { GameStats } from '../game/types';
import { RotateCcw, Home, ArrowRight, Award, Trash2, Bell, AlertTriangle, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface GameOverModalProps {
  isVictory: boolean;
  reason?: string;
  stats: GameStats;
  currentLevel: number;
  medal?: 'bronze' | 'silver' | 'gold';
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onTitleMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  reason,
  stats,
  currentLevel,
  medal = 'bronze',
  hasNextLevel,
  onNextLevel,
  onRestart,
  onTitleMenu,
}) => {
  let titleAward = 'Rookie Prankster';
  if (stats.totalChaosScore >= 4500) titleAward = 'Suburban Menace Supreme';
  else if (stats.totalChaosScore >= 2800) titleAward = 'Cul-de-Sac Outlaw';
  else if (stats.totalChaosScore >= 1400) titleAward = 'Neighborhood Nuisance';

  const medalColors = {
    gold: 'bg-amber-400 text-slate-950 border-amber-300',
    silver: 'bg-slate-300 text-slate-950 border-white',
    bronze: 'bg-amber-700 text-amber-100 border-amber-600',
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 md:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-amber-50 rounded-2xl border-4 border-slate-900 shadow-2xl overflow-hidden text-slate-900 font-sans my-auto">
        {/* Newspaper Top Header Bar */}
        <div className="bg-slate-900 text-amber-100 px-5 py-3 flex items-center justify-between border-b-2 border-slate-950">
          <div className="flex flex-col">
            <span className="font-display font-extrabold tracking-widest text-[11px] md:text-xs uppercase text-amber-400">
              The Suburban Gazette · Special Edition
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Vol. 43 · Morning Curfew Incident</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isVictory && (
              <span className={`px-2 py-0.5 rounded font-display text-[10px] uppercase font-black border ${medalColors[medal]}`}>
                ★ {medal} Medal
              </span>
            )}
            <div className="flex items-center gap-1 font-display text-xs font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">
              <Award className="w-3.5 h-3.5" />
              <span>{isVictory ? 'LEVEL COMPLETE' : 'BUSTED!'}</span>
            </div>
          </div>
        </div>

        {/* Newspaper Headline */}
        <div className="p-5 pb-3 border-b border-slate-300 text-center">
          <h2 className="font-display font-extrabold text-xl md:text-3xl uppercase tracking-tight text-slate-950 mb-1 leading-tight">
            {isVictory
              ? 'Cul-de-Sac Peace Shattered by Duo!'
              : 'Troublemakers Nabbed Red-Handed!'}
          </h2>
          <p className="text-xs text-slate-600 font-serif italic max-w-md mx-auto">
            {isVictory
              ? 'Homeowners baffled as mysterious best-friend duo leaves trails of tipped trash, screaming car alarms, and high-fives.'
              : reason || 'Neighbors celebrate after vigilant patrol brings an end to the suburban prank spree.'}
          </p>
        </div>

        {/* Score & Rank Ribbon */}
        <div className="bg-amber-100/70 px-5 py-2.5 border-b border-amber-200 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-600">Final Chaos Score</span>
            <span className="font-mono text-xl md:text-2xl font-black text-rose-600 tabular-nums">
              {stats.totalChaosScore.toLocaleString()} PTS
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-600">Declared Status</span>
            <span className="font-display font-bold text-xs md:text-sm text-slate-900 bg-amber-300/80 px-2.5 py-0.5 rounded-full border border-amber-400">
              {titleAward}
            </span>
          </div>
        </div>

        {/* Extended Stat Breakdown Grid */}
        <div className="p-4 md:p-5 grid grid-cols-2 gap-2 bg-amber-50/50 text-xs">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Trash2 className="w-3.5 h-3.5 text-slate-500" /> Trash Kicked
            </span>
            <span className="font-mono font-bold tabular-nums text-slate-900">
              {stats.trashCansKicked}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Bell className="w-3.5 h-3.5 text-amber-500" /> Doorbells Rung
            </span>
            <span className="font-mono font-bold tabular-nums text-slate-900">
              {stats.doorbellsDitched}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <span className="flex items-center gap-1.5 text-slate-700">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Car Alarms
            </span>
            <span className="font-mono font-bold tabular-nums text-slate-900">
              {stats.carAlarmsTriggered}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> High-Fives
            </span>
            <span className="font-mono font-bold tabular-nums text-slate-900">
              {stats.highFivesShared}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Zap className="w-3.5 h-3.5 text-sky-500" /> Chain Reactions
            </span>
            <span className="font-mono font-bold tabular-nums text-slate-900">
              {stats.chainReactions}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
            <span className="flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Chases Evaded
            </span>
            <span className="font-mono font-bold tabular-nums text-slate-900">
              {stats.neighborsEvaded}
            </span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onTitleMenu}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 transition-colors shadow-sm cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Title Menu
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onRestart}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-amber-200 hover:bg-amber-300 rounded-lg border border-amber-300 transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try Again
            </button>

            {isVictory && hasNextLevel && (
              <button
                onClick={onNextLevel}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg border border-amber-500 transition-all shadow-md cursor-pointer"
              >
                Next Level
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
