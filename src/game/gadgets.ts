/**
 * Interactive Gadget System for Cul-de-Sac Chaos
 */

import { GadgetItem, GadgetType } from './types';

export const GADGET_DEFINITIONS: Record<GadgetType, Omit<GadgetItem, 'cooldownRemaining' | 'chargesRemaining'>> = {
  decoy: {
    type: 'decoy',
    name: 'Decoy Boombox',
    description: 'Drops a noisy radio that plays funky music, drawing all nearby residents.',
    icon: 'Radio',
    maxCooldown: 12,
    maxCharges: 3,
  },
  mega_kick: {
    type: 'mega_kick',
    name: 'Mega Kick Soda',
    description: 'Chug for 8s of supercharged kicks that launch objects with massive force.',
    icon: 'Zap',
    maxCooldown: 15,
    maxCharges: 3,
  },
  banana_peel: {
    type: 'banana_peel',
    name: 'Banana Peel',
    description: 'Drops a slippery peel that causes chasing residents to spin and wipe out.',
    icon: 'Banana',
    maxCooldown: 8,
    maxCharges: 4,
  },
  confetti_bomb: {
    type: 'confetti_bomb',
    name: 'Confetti Popper',
    description: 'Bursts a dazzling party explosion that distracts neighbors and boosts combo.',
    icon: 'Sparkles',
    maxCooldown: 14,
    maxCharges: 3,
  },
  smoke_puff: {
    type: 'smoke_puff',
    name: 'Stink Smoke',
    description: 'Deploys a dense cloud that instantly breaks line of sight from chasers.',
    icon: 'Cloud',
    maxCooldown: 12,
    maxCharges: 3,
  },
  buddy_boost: {
    type: 'buddy_boost',
    name: 'Buddy Boost Dash',
    description: 'Rocket-launches the duo forward with an invincible speed burst.',
    icon: 'Rocket',
    maxCooldown: 18,
    maxCharges: 2,
  },
};

export function createInitialGadgets(): Record<GadgetType, GadgetItem> {
  const result = {} as Record<GadgetType, GadgetItem>;
  (Object.keys(GADGET_DEFINITIONS) as GadgetType[]).forEach((key) => {
    const def = GADGET_DEFINITIONS[key];
    result[key] = {
      ...def,
      cooldownRemaining: 0,
      chargesRemaining: def.maxCharges,
    };
  });
  return result;
}
