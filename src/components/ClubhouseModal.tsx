/**
 * Secret Treehouse & Clubhouse Base Modal for Cul-de-Sac Chaos
 * Features: Gadget Storage & Unlocks, Mission/Challenge Board, Trophy Showcase,
 * Wardrobe/Costumes, Neighborhood Map, and Reset Progress.
 */

import React, { useState } from 'react';
import { GameProgress, ALL_HATS_LEO, ALL_HATS_MILO, ALL_SECRETS, saveProgress } from '../game/storage';
import {
  X,
  Home,
  Wrench,
  Scroll,
  Trophy,
  Shirt,
  MapPin,
  Check,
  Lock,
  Sparkles,
  Zap,
  Radio,
  Cloud,
  Rocket,
  Shield,
  Flame,
  RotateCcw,
} from 'lucide-react';

interface ClubhouseModalProps {
  progress: GameProgress;
  onUpdateProgress: (newProgress: GameProgress) => void;
  onClose: () => void;
  onLaunchChallenge?: (challengeId: string) => void;
}

interface GadgetInfo {
  id: string;
  name: string;
  category: string;
  desc: string;
  unlocked: boolean;
  unlockRequirement: string;
  stats: { cooldown: string; charges: string; noise: string };
}

interface MischiefBounty {
  id: string;
  title: string;
  rewardPoints: number;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  badgeName: string;
}

export const ClubhouseModal: React.FC<ClubhouseModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
  onLaunchChallenge,
}) => {
  const [activeTab, setActiveTab] = useState<'gadgets' | 'missions' | 'trophies' | 'wardrobe' | 'map'>('gadgets');
  const [selectedGadgetId, setSelectedGadgetId] = useState<string>('decoy');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Expanded Gadget Roster
  const allGadgets: GadgetInfo[] = [
    {
      id: 'decoy',
      name: 'Noise-Making Decoy Radio',
      category: 'Distraction',
      desc: 'Blasts goofy polka music to attract all neighborhood residents and pets away from your prank location.',
      unlocked: true,
      unlockRequirement: 'Standard Issue',
      stats: { cooldown: '12s', charges: '3 Uses', noise: 'Loud (650px)' },
    },
    {
      id: 'mega_kick',
      name: 'Spring-Loaded Turbo Sneakers',
      category: 'Power',
      desc: 'Supercharges kicks for 8 seconds, launching trash cans and flamingos into orbit with massive knockback.',
      unlocked: true,
      unlockRequirement: 'Standard Issue',
      stats: { cooldown: '15s', charges: '2 Uses', noise: 'Silent' },
    },
    {
      id: 'banana_peel',
      name: 'Slippery Organic Banana Peel',
      category: 'Trap',
      desc: 'Drops a yellow banana peel behind you. Pursuing neighbors or guards slip and spin comically for 3.5 seconds.',
      unlocked: true,
      unlockRequirement: 'Standard Issue',
      stats: { cooldown: '8s', charges: '4 Uses', noise: 'Low' },
    },
    {
      id: 'confetti_bomb',
      name: 'Celebration Confetti Popper',
      category: 'Stun & Boost',
      desc: 'Pops a 360-degree storm of colorful confetti! Stuns all chasers instantly and grants +1 Combo multiplier.',
      unlocked: progress.totalPranks >= 5,
      unlockRequirement: 'Pull off 5 Pranks',
      stats: { cooldown: '20s', charges: '2 Uses', noise: 'Party' },
    },
    {
      id: 'smoke_puff',
      name: 'Ninja Smoke Disguise Puff',
      category: 'Escape',
      desc: 'Releases a thick plume of purple smoke, immediately breaking all NPC sightlines and resetting pursuer aggression.',
      unlocked: progress.totalPranks >= 10,
      unlockRequirement: 'Pull off 10 Pranks',
      stats: { cooldown: '18s', charges: '2 Uses', noise: 'Quiet' },
    },
    {
      id: 'sausage_treats',
      name: 'Sizzling Sausage Pet Pacifier',
      category: 'Pet Distraction',
      desc: 'Drops a plate of gourmet beef sausages. Buster the Bulldog and Bruno the Guard Dog immediately stop chasing to eat happily for 8s!',
      unlocked: progress.totalPranks >= 15,
      unlockRequirement: 'Pull off 15 Pranks',
      stats: { cooldown: '14s', charges: '3 Uses', noise: 'Sizzle' },
    },
    {
      id: 'firework_crate',
      name: 'Crackling Firework Battery',
      category: 'Chaos & Lure',
      desc: 'Launches a 5-shot crackling firework display into the sky, creating total neighborhood uproar and luring Officer Vance away.',
      unlocked: (progress.highScores['SOLO'] || 0) >= 2000,
      unlockRequirement: 'Score 2,000+ PTS in Solo',
      stats: { cooldown: '25s', charges: '1 Use', noise: 'Massive' },
    },
  ];

  // Bounties & Missions
  const mischiefBounties: MischiefBounty[] = [
    {
      id: 'bounty_trash',
      title: 'Curbside Clatter Champion',
      rewardPoints: 500,
      description: 'Overturn 8 trash cans or recycling bins in a single session.',
      targetCount: 8,
      currentCount: Math.min(8, progress.totalPranks),
      completed: progress.totalPranks >= 8,
      badgeName: 'Golden Trash Can',
    },
    {
      id: 'bounty_dog',
      title: 'Buster’s Best Friend',
      rewardPoints: 600,
      description: 'Kick Buster’s favorite red ball into his fenced yard.',
      targetCount: 1,
      currentCount: progress.discoveredSecrets.includes('buster_ball') ? 1 : 0,
      completed: progress.discoveredSecrets.includes('buster_ball'),
      badgeName: 'Dog Whisperer Bone',
    },
    {
      id: 'bounty_mansion',
      title: 'Gated Estate Phantom',
      rewardPoints: 1000,
      description: 'Graffiti the North Mansion Wall and evade Officer Vance.',
      targetCount: 1,
      currentCount: (progress.highScores['SOLO'] || 0) >= 3000 ? 1 : 0,
      completed: (progress.highScores['SOLO'] || 0) >= 3000,
      badgeName: 'Royal Spray Can',
    },
    {
      id: 'bounty_duo',
      title: 'Double Trouble Legend',
      rewardPoints: 800,
      description: 'Achieve a 5x Combo multiplier through synchronized high-fives.',
      targetCount: 5,
      currentCount: progress.discoveredSecrets.includes('double_trouble_legend') ? 5 : 1,
      completed: progress.discoveredSecrets.includes('double_trouble_legend'),
      badgeName: 'Friendship Fist Trophy',
    },
    {
      id: 'bounty_curfew',
      title: 'Master Evader',
      rewardPoints: 750,
      description: 'Evade bicycle patrol Officer Higgins without getting caught for 60 seconds.',
      targetCount: 1,
      currentCount: (progress.levelMedals[1] || progress.levelMedals[2]) ? 1 : 0,
      completed: Boolean(progress.levelMedals[1] || progress.levelMedals[2]),
      badgeName: 'Whistle Silencer',
    },
  ];

  const trophies = [
    {
      id: 'tr_bronze',
      name: 'Suburban Troublemaker',
      desc: 'Complete Level 1 Morning Awakening.',
      unlocked: Boolean(progress.levelMedals[0]),
      icon: '🥉',
    },
    {
      id: 'tr_silver',
      name: 'Cul-de-Sac Menace',
      desc: 'Complete Level 2 Waterworks & Alarms with Silver or Gold.',
      unlocked: progress.levelMedals[1] === 'silver' || progress.levelMedals[1] === 'gold',
      icon: '🥈',
    },
    {
      id: 'tr_gold',
      name: 'Legend of Maple Way',
      desc: 'Earn Gold Medal on Level 3 Cul-de-Sac Legends.',
      unlocked: progress.levelMedals[2] === 'gold',
      icon: '🥇',
    },
    {
      id: 'tr_combo',
      name: 'High-Five Prodigy',
      desc: 'Perform 10 high-fives with your partner.',
      unlocked: progress.discoveredSecrets.includes('double_trouble_legend'),
      icon: '⚡',
    },
    {
      id: 'tr_prankster',
      name: 'Master of Mayhem',
      desc: 'Trigger over 25 total neighborhood pranks.',
      unlocked: progress.totalPranks >= 25,
      icon: '👑',
    },
    {
      id: 'tr_secret',
      name: 'Secret Sleuth',
      desc: 'Discover all 5 hidden neighborhood easter eggs.',
      unlocked: progress.discoveredSecrets.length >= 4,
      icon: '🔍',
    },
  ];

  const selectedGadget = allGadgets.find((g) => g.id === selectedGadgetId) || allGadgets[0];

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

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Clubhouse Header Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/90 via-slate-950 to-slate-900 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-xl text-amber-400 uppercase tracking-wide">
                  Secret Oak Tree Clubhouse
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/40">
                  Base Camp
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Leo & Milo’s hidden headquarters • Gadget workbench, bounty board & wardrobe
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Close Clubhouse"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 p-2 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('gadgets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'gadgets'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Gadget Workbench
          </button>
          <button
            onClick={() => setActiveTab('missions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'missions'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Scroll className="w-4 h-4" />
            Bounties & Challenges
          </button>
          <button
            onClick={() => setActiveTab('trophies')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'trophies'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Trophy Showcase
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'wardrobe'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shirt className="w-4 h-4" />
            Costume Wardrobe
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Cul-de-Sac Map
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* TAB 1: GADGET WORKBENCH */}
          {activeTab === 'gadgets' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gadget List */}
              <div className="md:col-span-1 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Mischief Inventions
                </span>
                <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
                  {allGadgets.map((gadget) => (
                    <button
                      key={gadget.id}
                      onClick={() => setSelectedGadgetId(gadget.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        selectedGadgetId === gadget.id
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                          : gadget.unlocked
                          ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                          : 'bg-slate-950/30 border-slate-900 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            gadget.unlocked ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-600'
                          }`}
                        >
                          {gadget.unlocked ? <Zap className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-tight">{gadget.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{gadget.category}</div>
                        </div>
                      </div>
                      {gadget.unlocked && <span className="text-emerald-400 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gadget Details Showcase */}
              <div className="md:col-span-2 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {selectedGadget.category}
                      </span>
                      <h3 className="font-display font-extrabold text-xl text-white mt-1">
                        {selectedGadget.name}
                      </h3>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        selectedGadget.unlocked
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {selectedGadget.unlocked ? 'READY IN POCKET' : 'LOCKED'}
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm mt-3 leading-relaxed">{selectedGadget.desc}</p>

                  {/* Spec Sheet */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Cooldown</span>
                      <span className="text-amber-300 font-mono font-bold text-sm">
                        {selectedGadget.stats.cooldown}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Capacity</span>
                      <span className="text-sky-300 font-mono font-bold text-sm">
                        {selectedGadget.stats.charges}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Noise Level</span>
                      <span className="text-rose-300 font-mono font-bold text-sm">
                        {selectedGadget.stats.noise}
                      </span>
                    </div>
                  </div>

                  {!selectedGadget.unlocked && (
                    <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>Unlock Requirement: {selectedGadget.unlockRequirement}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 mt-6 flex items-center justify-between text-xs text-slate-400">
                  <span>Cycle equipped gadgets during gameplay with <strong>Tab</strong> key or on-screen button.</span>
                  <span className="text-emerald-400 font-bold">Auto-Equipped</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOUNTIES & CHALLENGES */}
          {activeTab === 'missions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-amber-400">Neighborhood Mischief Board</h3>
                  <p className="text-xs text-slate-400">
                    Complete special challenge objectives across the cul-de-sac for massive chaos bonuses and trophies.
                  </p>
                </div>
                <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs text-amber-400">
                  Completed: {mischiefBounties.filter((b) => b.completed).length} / {mischiefBounties.length}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {mischiefBounties.map((bounty) => (
                  <div
                    key={bounty.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      bounty.completed
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white flex items-center gap-1.5">
                          {bounty.completed && <Check className="w-4 h-4 text-emerald-400" />}
                          {bounty.title}
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-400">
                          +{bounty.rewardPoints} PTS
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{bounty.description}</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {bounty.currentCount} / {bounty.targetCount}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${bounty.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, (bounty.currentCount / bounty.targetCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TROPHY SHOWCASE */}
          {activeTab === 'trophies' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-lg text-amber-400">Cul-de-Sac Hall of Fame</h3>
                <p className="text-xs text-slate-400">
                  Earned medals and prestige achievements awarded for audacious suburban chaos.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                {trophies.map((t) => (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                      t.unlocked
                        ? 'bg-slate-950 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-950/40 border-slate-900 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{t.icon}</div>
                    <div className="font-bold text-sm text-white">{t.name}</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{t.desc}</p>
                    <div className="mt-3">
                      {t.unlocked ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COSTUME WARDROBE */}
          {activeTab === 'wardrobe' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Leo's Closet */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center font-bold text-white text-xs">
                    L
                  </div>
                  <h4 className="font-bold text-sm text-rose-300">Leo's Headwear</h4>
                </div>
                <div className="space-y-2">
                  {ALL_HATS_LEO.map((hat) => {
                    const isUnlocked = progress.unlockedHatsLeo.includes(hat.id);
                    const isSelected = progress.selectedHatLeo === hat.id;
                    return (
                      <button
                        key={hat.id}
                        disabled={!isUnlocked}
                        onClick={() => handleSelectLeoHat(hat.id)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-rose-600/30 border-rose-500 text-white font-bold'
                            : isUnlocked
                            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer'
                            : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isUnlocked ? <Sparkles className="w-3.5 h-3.5 text-rose-400" /> : <Lock className="w-3.5 h-3.5 text-slate-600" />}
                          <span>{hat.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {isSelected ? 'EQUIPPED' : isUnlocked ? 'Equip' : hat.unlockReq}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Milo's Closet */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                    M
                  </div>
                  <h4 className="font-bold text-sm text-amber-300">Milo's Headwear</h4>
                </div>
                <div className="space-y-2">
                  {ALL_HATS_MILO.map((hat) => {
                    const isUnlocked = progress.unlockedHatsMilo.includes(hat.id);
                    const isSelected = progress.selectedHatMilo === hat.id;
                    return (
                      <button
                        key={hat.id}
                        disabled={!isUnlocked}
                        onClick={() => handleSelectMiloHat(hat.id)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-amber-500/30 border-amber-500 text-white font-bold'
                            : isUnlocked
                            ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 cursor-pointer'
                            : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isUnlocked ? <Sparkles className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-slate-600" />}
                          <span>{hat.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {isSelected ? 'EQUIPPED' : isUnlocked ? 'Equip' : hat.unlockReq}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUL-DE-SAC MAP */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-display font-bold text-lg text-amber-400">Neighborhood Exploration Map</h3>
                <p className="text-xs text-slate-400">
                  Key areas of Maple Way cul-de-sac, secret passages, and danger zones.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-bold text-rose-400 block mb-1">🏠 101 Maple Way (Mr. Henderson)</span>
                  <p className="text-slate-400 text-[11px]">
                    Cranky homeowner. Highly protective of his prized lawn flamingos and lawn sprinklers. Prone to banana slips!
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-1">🏰 107 Maple Way (The Rich Mansion)</span>
                  <p className="text-slate-400 text-[11px]">
                    High security walls, luxury pool & private tennis court. Patrolled by Officer Vance with flashlight cone & Bruno the German Shepherd!
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-bold text-sky-400 block mb-1">🌳 Central Community Park & Duck Pond</span>
                  <p className="text-slate-400 text-[11px]">
                    The Grand Oak Treehouse (Home Base), swimming rubber ducks, basketball court, and the secret hedge shortcut.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="font-bold text-emerald-400 block mb-1">🐶 105 Maple Way (Miller Yard & Buster)</span>
                  <p className="text-slate-400 text-[11px]">
                    Buster the English Bulldog’s domain. Loves to fetch his bright red ball, or can be distracted with sausage plates!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Total Pranks Pulled: <strong className="text-amber-400 font-mono">{progress.totalPranks}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all cursor-pointer shadow-md"
          >
            Return to Action
          </button>
        </div>
      </div>
    </div>
  );
};
