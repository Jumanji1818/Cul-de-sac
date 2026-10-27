/**
 * Core game types and interfaces for Cul-de-Sac Chaos: Double Trouble
 */

export type GameMode = 'SOLO' | 'COOP' | 'TIMED_CHAOS' | 'COOP_TRIALS';

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'BUSTED' | 'VICTORY';

export interface Vector2D {
  x: number;
  y: number;
}

export type GadgetType =
  | 'decoy'
  | 'mega_kick'
  | 'banana_peel'
  | 'confetti_bomb'
  | 'smoke_puff'
  | 'buddy_boost';

export interface GadgetItem {
  type: GadgetType;
  name: string;
  description: string;
  icon: string;
  cooldownRemaining: number;
  maxCooldown: number;
  chargesRemaining: number;
  maxCharges: number;
}

export type CompanionCommand = 'FOLLOW' | 'TROUBLE' | 'DISTRACT' | 'HIDE';

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  scale: number;
  maxLife: number;
  life: number;
}

export interface Player {
  id: 'leo' | 'milo';
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  facing: number; // Angle in radians
  isMoving: boolean;
  walkFrame: number;
  color: string;
  jacketColor: string;
  capColor: string;
  stamina: number;
  maxStamina: number;
  isSprinting: boolean;
  kickCooldown: number;
  highFiveCooldown: number;
  squashStretch: { sx: number; sy: number };
  isHidden: boolean;
  currentBushId: string | null;
  heldItem: 'flamingo' | 'gnome' | 'tp_roll' | null;
  score: number;
  // Upgrades
  megaKickTimer: number; // >0 means supercharged kicks
  boostSpeedTimer: number;
  selectedHat: string;
  shoutText?: string;
  shoutTimer?: number;
  isSpraying?: boolean;
  sprayTargetId?: string | null;
  isLookout?: boolean;
  lookoutWhistleTimer?: number;
  mischiefCooldown?: number;
  yHeight?: number;
  jumpVy?: number;
  isJumping?: boolean;
}

export type PropType =
  | 'trash_can'
  | 'recycle_bin'
  | 'dumpster'
  | 'mailbox'
  | 'flamingo'
  | 'gnome'
  | 'sprinkler'
  | 'car'
  | 'doorbell'
  | 'leaf_pile'
  | 'bush'
  | 'tp_tree'
  | 'fire_hydrant'
  | 'banana_peel'
  | 'decoy_prop'
  | 'buster_ball'
  | 'dog_house'
  | 'pond'
  | 'basketball_hoop'
  | 'gazebo'
  | 'graffiti_wall'
  | 'sausage_plate'
  | 'firework_box'
  | 'pool'
  | 'tennis_court';

export interface Prop {
  id: string;
  type: PropType;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  rotation: number;
  vx: number;
  vy: number;
  vRot: number;
  state: 'idle' | 'triggered' | 'knocked' | 'active' | 'cooldown';
  timer: number;
  interactionRadius: number;
  noiseValue: number;
  chaosPoints: number;
  houseId?: number;
  lastInteractedTime?: number;
  interactionCount?: number;
  extra?: {
    alarmTime?: number;
    sprinklerAngle?: number;
    tpCount?: number;
    ownerName?: string;
    doorbellRung?: boolean;
    knockedCount?: number;
    color?: string;
    decoyTimer?: number;
    slipped?: boolean;
    sprayProgress?: number;
    isSprayed?: boolean;
    graffitiType?: string;
    isWall?: boolean;
  };
}

export type NPCType =
  | 'henderson'
  | 'gable'
  | 'higgins'
  | 'buster'
  | 'guard'
  | 'bruno'
  | 'cleo'
  | 'rival_ziggy'
  | 'rival_dex'
  | 'pigeon';

export interface NPC {
  id: string;
  type: NPCType;
  name: string;
  title: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  facing: number;
  walkFrame: number;
  patrolPoints: Vector2D[];
  patrolIndex: number;
  state: 'PATROL' | 'INVESTIGATING' | 'CHASING' | 'STUNNED' | 'CALLING' | 'PLAYING';
  alertLevel: number; // 0 to 1
  suspicionTarget: Vector2D | null;
  targetPlayer: 'leo' | 'milo' | null;
  stunTimer: number;
  shoutText: string;
  shoutTimer: number;
  lastKnownPlayerPos?: Vector2D | null;
  searchTimer?: number;
  windupTimer?: number; // Visual telegraph before sprinting
  slipSpinAngle?: number;
  distractionTimer?: number; // Time pet/guard is eating/distracted
  visionCone: {
    angle: number;
    distance: number;
    fov: number; // in radians
  };
  yHeight?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type:
    | 'trash'
    | 'leaf'
    | 'water'
    | 'mud'
    | 'tp_ribbon'
    | 'star'
    | 'dust'
    | 'note'
    | 'exclamation'
    | 'heart'
    | 'confetti'
    | 'smoke'
    | 'paint'
    | 'spark';
  color: string;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
  rotation: number;
  vRot: number;
  scale?: number;
  text?: string;
}

export interface MischiefObjective {
  id: string;
  text: string;
  current: number;
  target: number;
  completed: boolean;
  points: number;
  isBonus?: boolean;
}

export interface LevelConfig {
  levelNumber: number;
  title: string;
  description: string;
  targetScore: number;
  timeLimit: number; // in seconds
  objectives: MischiefObjective[];
}

export interface GameStats {
  trashCansKicked: number;
  doorbellsDitched: number;
  carAlarmsTriggered: number;
  flamingosFlung: number;
  sprinklersCranked: number;
  tpRollsThrown: number;
  highFivesShared: number;
  neighborsEvaded: number;
  totalChaosScore: number;
  chainReactions: number;
  gadgetsUsed: number;
  bananaSlips: number;
  carsSprayed: number;
  wallsGraffitied?: number;
  guardsEvaded?: number;
  petsDistracted?: number;
}
