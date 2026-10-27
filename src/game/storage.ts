/**
 * Local Storage Persistence for Cul-de-Sac Chaos
 * Stores high scores, medals, unlocked hats/costumes, secrets, and player settings.
 */

export interface PlayerSettings {
  isMuted: boolean;
  sfxVolume: number;
  musicVolume: number;
  screenShake: number; // 0.0 to 1.0
  reducedMotion: boolean;
  // Visual Atmosphere & Graphics
  atmosphere: 'day' | 'sunset' | 'night';
  weather: 'sunny' | 'rain';
  graphicsQuality: 'high' | 'low';
  // Mobile / Touch controls
  touchControlsEnabled: boolean;
  joystickFloating: boolean;
  joystickSensitivity: number; // 0.5 to 1.8
  buttonSize: 'small' | 'medium' | 'large';
  vibrationEnabled: boolean;
}

export interface GameProgress {
  highScores: { [mode: string]: number };
  bestTimes: { [levelId: string]: number };
  levelMedals: { [levelIndex: number]: 'bronze' | 'silver' | 'gold' };
  unlockedHatsLeo: string[];
  unlockedHatsMilo: string[];
  selectedHatLeo: string;
  selectedHatMilo: string;
  discoveredSecrets: string[];
  totalPlayTime: number;
  totalPranks: number;
}

const SETTINGS_KEY = 'culdesac_chaos_settings_v2';
const PROGRESS_KEY = 'culdesac_chaos_progress_v2';

export const DEFAULT_SETTINGS: PlayerSettings = {
  isMuted: false,
  sfxVolume: 0.9,
  musicVolume: 0.35,
  screenShake: 1.0,
  reducedMotion: false,
  atmosphere: 'day',
  weather: 'sunny',
  graphicsQuality: 'high',
  touchControlsEnabled: true,
  joystickFloating: false,
  joystickSensitivity: 1.0,
  buttonSize: 'medium',
  vibrationEnabled: true,
};

export const DEFAULT_PROGRESS: GameProgress = {
  highScores: {
    SOLO: 0,
    COOP: 0,
    TIMED_CHAOS: 0,
  },
  bestTimes: {},
  levelMedals: {},
  unlockedHatsLeo: ['classic_cap', 'pirate_bandana'],
  unlockedHatsMilo: ['beanie', 'detective_fedora'],
  selectedHatLeo: 'classic_cap',
  selectedHatMilo: 'beanie',
  discoveredSecrets: [],
  totalPlayTime: 0,
  totalPranks: 0,
};

export const ALL_HATS_LEO = [
  { id: 'classic_cap', name: 'Backwards Red Cap', unlockReq: 'Default' },
  { id: 'pirate_bandana', name: 'Pirate Bandana', unlockReq: 'Unlocked' },
  { id: 'detective_fedora', name: 'Detective Fedora', unlockReq: 'Score 3,000+ PTS' },
  { id: 'golden_crown', name: 'King of Chaos Crown', unlockReq: 'Complete Level 3' },
];

export const ALL_HATS_MILO = [
  { id: 'beanie', name: 'Cozy Knit Beanie', unlockReq: 'Default' },
  { id: 'detective_fedora', name: 'Brown Bowler Hat', unlockReq: 'Unlocked' },
  { id: 'viking_helmet', name: 'Viking Horns', unlockReq: 'Overturn 20 Trash Cans' },
  { id: 'chef_toque', name: 'Master Chef Hat', unlockReq: 'Reach 5x Multiplier' },
];

export const ALL_SECRETS = [
  { id: 'buster_ball', name: "Play fetch with Buster's red ball", desc: 'Kick Buster the dog’s red ball into his yard.' },
  { id: 'alarm_symphony', name: 'Triple Car Alarm Symphony', desc: 'Trigger 3 parked car alarms within 10 seconds.' },
  { id: 'full_toilet_paper', name: 'Tree Covered in White', desc: 'Throw 3 toilet paper rolls at the Grand Oak.' },
  { id: 'double_trouble_legend', name: 'Double Trouble Max Combo', desc: 'Achieve a 5x Duo multiplier with high-fives.' },
  { id: 'banana_slip', name: 'Banana Slip-Up', desc: 'Make Mr. Henderson slip on a discarded banana peel.' },
];

export function loadSettings(): PlayerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: PlayerSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota or disabled storage
  }
}

export function loadProgress(): GameProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      highScores: { ...DEFAULT_PROGRESS.highScores, ...(parsed.highScores || {}) },
      unlockedHatsLeo: parsed.unlockedHatsLeo || DEFAULT_PROGRESS.unlockedHatsLeo,
      unlockedHatsMilo: parsed.unlockedHatsMilo || DEFAULT_PROGRESS.unlockedHatsMilo,
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: GameProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota
  }
}

export function resetAllProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // Ignore
  }
}

export function triggerHaptic(durationMs: number = 25): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const settings = loadSettings();
      if (settings.vibrationEnabled) {
        navigator.vibrate(durationMs);
      }
    }
  } catch {
    // Vibration not supported or allowed
  }
}
