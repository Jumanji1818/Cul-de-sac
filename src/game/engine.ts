/**
 * Authoritative 60fps Game Simulation Engine
 * Extended with Mobile Multi-Touch, Gadgets, Milo Companion Commands,
 * Chain Reactions, Buster the Yard Dog, and Local Progression.
 */

import {
  Player,
  Prop,
  NPC,
  Particle,
  GameMode,
  GameState,
  LevelConfig,
  GameStats,
  GadgetType,
  GadgetItem,
  CompanionCommand,
  FloatingText,
} from './types';
import { HOUSES, WALLS, createInitialProps, House, WallSegment, MAP_WIDTH, MAP_HEIGHT } from './map';
import {
  distance,
  resolveCircleWallCollision,
  resolveCircleHouseCollision,
  ScreenShaker,
  HitStopManager,
} from './physics';
import { audio } from './audio';
import {
  renderEnvironment,
  renderPlayer,
  renderProp,
  renderNPC,
  renderParticles,
  renderFloatingTexts,
} from './entities';
import { InputSystem } from './input';
import { createInitialGadgets } from './gadgets';
import {
  loadProgress,
  saveProgress,
  loadSettings,
  triggerHaptic,
  GameProgress,
  PlayerSettings,
} from './storage';
import { ThreeRenderer } from './three/threeRenderer';

export const LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    title: 'Morning Awakening',
    description: 'Rouse the neighborhood! Kick trash cans, fling flamingos, and ring doorbells.',
    targetScore: 1200,
    timeLimit: 120,
    objectives: [
      { id: 'kick_trash', text: 'Overturn 4 trash cans', current: 0, target: 4, completed: false, points: 200 },
      { id: 'doorbell_dash', text: 'Ding-dong-dash 2 houses', current: 0, target: 2, completed: false, points: 300 },
      { id: 'high_five', text: 'High-five your partner 2 times', current: 0, target: 2, completed: false, points: 200 },
      { id: 'bonus_flamingo', text: 'Bonus: Fling 2 lawn flamingos', current: 0, target: 2, completed: false, points: 150, isBonus: true },
    ],
  },
  {
    levelNumber: 2,
    title: 'Waterworks & Alarms',
    description: 'Sabotage lawn sprinklers, slip pursuers, and trigger car alarms!',
    targetScore: 2800,
    timeLimit: 140,
    objectives: [
      { id: 'crank_sprinklers', text: 'Activate 3 lawn sprinklers', current: 0, target: 3, completed: false, points: 300 },
      { id: 'car_alarm', text: 'Trigger 2 parked car alarms', current: 0, target: 2, completed: false, points: 400 },
      { id: 'banana_slip', text: 'Make a resident slip on a banana', current: 0, target: 1, completed: false, points: 350 },
      { id: 'bonus_chain', text: 'Bonus: Trigger 2 chain-reactions', current: 0, target: 2, completed: false, points: 300, isBonus: true },
    ],
  },
  {
    levelNumber: 3,
    title: 'Cul-de-Sac Legends',
    description: 'Toilet-paper the Grand Oak, cause total havoc, and evade Officer Higgins!',
    targetScore: 5000,
    timeLimit: 180,
    objectives: [
      { id: 'tp_oak', text: 'Toilet-paper the Community Oak 3 times', current: 0, target: 3, completed: false, points: 500 },
      { id: 'double_trouble_combo', text: 'Achieve a 4x Duo Multiplier', current: 0, target: 4, completed: false, points: 400 },
      { id: 'evade_police', text: 'Evade Officer Higgins for 20 seconds', current: 0, target: 20, completed: false, points: 600 },
      { id: 'bonus_buster', text: 'Bonus: Kick Buster’s red ball into his yard', current: 0, target: 1, completed: false, points: 250, isBonus: true },
    ],
  },
];

export const TIMED_CHAOS_LEVEL: LevelConfig = {
  levelNumber: 99,
  title: 'Timed Chaos Blitz',
  description: '2-Minute unrestricted suburban rampage! Rack up the highest score possible.',
  targetScore: 10000,
  timeLimit: 120,
  objectives: [
    { id: 'chaos_points', text: 'Earn 5,000 Chaos Points', current: 0, target: 5000, completed: false, points: 500 },
    { id: 'super_chain', text: 'Trigger 3 Chain Reactions', current: 0, target: 3, completed: false, points: 400 },
    { id: 'clean_escapes', text: 'Make 2 Clean Escapes from Chases', current: 0, target: 2, completed: false, points: 400 },
  ],
};

export const COOP_TRIALS_LEVEL: LevelConfig = {
  levelNumber: 98,
  title: 'Duo Chaos Trials',
  description: 'Teamwork is mandatory! Pull off high-fives, synchronized doorbells, and double kicks.',
  targetScore: 4000,
  timeLimit: 150,
  objectives: [
    { id: 'high_fives', text: 'Execute 4 High-Five Frenzies', current: 0, target: 4, completed: false, points: 400 },
    { id: 'double_kicks', text: 'Perform 4 Double Kicks together', current: 0, target: 4, completed: false, points: 500 },
    { id: 'max_combo', text: 'Hit a 5x Duo Multiplier', current: 0, target: 5, completed: false, points: 600 },
  ],
};

export interface EngineCallbacks {
  onScoreUpdate: (
    score: number,
    combo: number,
    peaceLevel: number,
    wantedStars: number,
    activeGadget: GadgetItem,
    companionCommand: CompanionCommand,
    cameraMode?: 'OVERVIEW' | 'FOLLOW'
  ) => void;
  onLevelComplete: (stats: GameStats, currentLevel: number, medal: 'bronze' | 'silver' | 'gold') => void;
  onGameOver: (stats: GameStats, reason: string) => void;
  onObjectivesUpdate: (objectives: LevelConfig['objectives'], timeLeft: number) => void;
}

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public threeRenderer: ThreeRenderer;
  private callbacks: EngineCallbacks;

  public state: GameState = 'TITLE';
  public mode: GameMode = 'SOLO';
  public currentLevelIndex: number = 0;
  public currentLevelConfig: LevelConfig = LEVELS[0];

  // Unified Input System
  public input: InputSystem;

  // Players
  public p1: Player;
  public p2: Player;

  // Gadgets System
  public gadgets: Record<GadgetType, GadgetItem>;
  public activeGadgetType: GadgetType = 'decoy';
  public gadgetOrder: GadgetType[] = [
    'decoy',
    'mega_kick',
    'banana_peel',
    'confetti_bomb',
    'smoke_puff',
    'buddy_boost',
  ];

  // Companion Command (Solo Mode)
  public companionCommand: CompanionCommand = 'FOLLOW';
  public companionCommandsList: CompanionCommand[] = ['FOLLOW', 'TROUBLE', 'DISTRACT', 'HIDE'];

  // World Data
  public houses: House[] = [];
  public walls: WallSegment[] = [];
  public props: Prop[] = [];
  public npcs: NPC[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Metrics
  public score: number = 0;
  public peaceLevel: number = 100;
  public comboMultiplier: number = 1;
  public comboTimer: number = 0;
  public wantedStars: number = 0;
  public timeLeft: number = 120;
  public frenzyTimer: number = 0;

  // Anti-Exploit & Diverse Prank Tracking
  private lastPrankTypes: string[] = [];
  private wasChased: boolean = false;
  private chaseCooldownTimer: number = 0;

  // Stats
  public stats: GameStats = {
    trashCansKicked: 0,
    doorbellsDitched: 0,
    carAlarmsTriggered: 0,
    flamingosFlung: 0,
    sprinklersCranked: 0,
    tpRollsThrown: 0,
    highFivesShared: 0,
    neighborsEvaded: 0,
    totalChaosScore: 0,
    chainReactions: 0,
    gadgetsUsed: 0,
    bananaSlips: 0,
    carsSprayed: 0,
  };

  // Camera, Shaker & Hitstop (3200 x 2200 Map)
  public cameraX: number = 1600;
  public cameraY: number = 1100;
  public cameraZoom: number = 1.0;
  public shaker: ScreenShaker = new ScreenShaker();
  public hitstop: HitStopManager = new HitStopManager();

  // Loop control
  private animationId: number | null = null;
  private lastTime: number = 0;
  public gameTime: number = 0;
  private isDestroyed: boolean = false;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;
    this.threeRenderer = new ThreeRenderer(canvas);

    // Load saved settings & progress
    const progress = loadProgress();
    const settings = loadSettings();

    // Unified input
    this.input = new InputSystem();
    this.input.joystickSensitivity = settings.joystickSensitivity;

    // Gadgets
    this.gadgets = createInitialGadgets();

    // Players spawn on North Maple Way sidewalk in front of 101 & 103 Maple Way
    this.p1 = this.createPlayer('leo', 'Leo', 520, 640, '#ef4444', '#dc2626', '#b91c1c', progress.selectedHatLeo);
    this.p2 = this.createPlayer('milo', 'Milo', 600, 640, '#eab308', '#ca8a04', '#1e293b', progress.selectedHatMilo);

    this.initWorld();
    this.threeRenderer.setAtmosphere(settings.atmosphere as any, settings.weather === 'rain' ? 'rain' : 'clear');
    this.startLoop();
  }

  private createPlayer(
    id: 'leo' | 'milo',
    name: string,
    x: number,
    y: number,
    color: string,
    jacketColor: string,
    capColor: string,
    selectedHat: string = 'classic_cap'
  ): Player {
    return {
      id,
      name,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 16,
      facing: Math.PI / 2,
      isMoving: false,
      walkFrame: 0,
      color,
      jacketColor,
      capColor,
      stamina: 100,
      maxStamina: 100,
      isSprinting: false,
      kickCooldown: 0,
      highFiveCooldown: 0,
      squashStretch: { sx: 1, sy: 1 },
      isHidden: false,
      currentBushId: null,
      heldItem: null,
      score: 0,
      megaKickTimer: 0,
      boostSpeedTimer: 0,
      selectedHat,
    };
  }

  public initWorld() {
    this.houses = JSON.parse(JSON.stringify(HOUSES));
    this.walls = [...WALLS];
    this.props = createInitialProps();
    this.floatingTexts = [];
    this.particles = [];

    // Suburban Residents + Buster the Bulldog
    this.npcs = [
      {
        id: 'henderson',
        type: 'henderson',
        name: 'Mr. Henderson',
        title: 'Cranky Homeowner',
        x: 420,
        y: 470,
        vx: 0,
        vy: 0,
        radius: 18,
        speed: 130,
        facing: Math.PI / 2,
        walkFrame: 0,
        patrolPoints: [
          { x: 380, y: 480 },
          { x: 580, y: 480 },
          { x: 500, y: 350 },
          { x: 320, y: 460 },
        ],
        patrolIndex: 0,
        state: 'PATROL',
        alertLevel: 0,
        suspicionTarget: null,
        targetPlayer: null,
        stunTimer: 0,
        shoutText: '',
        shoutTimer: 0,
        visionCone: {
          angle: Math.PI / 2,
          distance: 260,
          fov: Math.PI * 0.45,
        },
      },
      {
        id: 'gable',
        type: 'gable',
        name: 'Mrs. Gable',
        title: 'Neighborhood Watch',
        x: 1200,
        y: 460,
        vx: 0,
        vy: 0,
        radius: 16,
        speed: 105,
        facing: 0,
        walkFrame: 0,
        patrolPoints: [
          { x: 1050, y: 460 },
          { x: 1350, y: 460 },
          { x: 1200, y: 600 },
        ],
        patrolIndex: 0,
        state: 'PATROL',
        alertLevel: 0,
        suspicionTarget: null,
        targetPlayer: null,
        stunTimer: 0,
        shoutText: '',
        shoutTimer: 0,
        visionCone: {
          angle: 0,
          distance: 220,
          fov: Math.PI * 0.4,
        },
      },
      {
        id: 'higgins',
        type: 'higgins',
        name: 'Officer Higgins',
        title: 'Cul-de-Sac Bicycle Patrol',
        x: 850,
        y: 640,
        vx: 0,
        vy: 0,
        radius: 20,
        speed: 175,
        facing: 0,
        walkFrame: 0,
        patrolPoints: [
          { x: 850, y: 640 },
          { x: 1650, y: 640 },
          { x: 2500, y: 640 },
          { x: 2750, y: 1100 },
          { x: 2500, y: 1560 },
          { x: 1500, y: 1560 },
          { x: 500, y: 1560 },
          { x: 300, y: 1100 },
          { x: 480, y: 640 },
        ],
        patrolIndex: 0,
        state: 'PATROL',
        alertLevel: 0,
        suspicionTarget: null,
        targetPlayer: null,
        stunTimer: 0,
        shoutText: '',
        shoutTimer: 0,
        visionCone: {
          angle: -Math.PI / 2,
          distance: 310,
          fov: Math.PI * 0.5,
        },
      },
      {
        id: 'buster',
        type: 'buster',
        name: 'Buster',
        title: 'Playful Yard Bulldog',
        x: 1920,
        y: 1740,
        vx: 0,
        vy: 0,
        radius: 14,
        speed: 160,
        facing: 0,
        walkFrame: 0,
        patrolPoints: [
          { x: 1840, y: 1680 },
          { x: 2060, y: 1680 },
          { x: 2060, y: 1960 },
          { x: 1840, y: 1960 },
        ],
        patrolIndex: 0,
        state: 'PATROL',
        alertLevel: 0,
        suspicionTarget: null,
        targetPlayer: null,
        stunTimer: 0,
        shoutText: '',
        shoutTimer: 0,
        distractionTimer: 0,
        visionCone: {
          angle: 0,
          distance: 210,
          fov: Math.PI * 0.6,
        },
      },
      {
        id: 'guard',
        type: 'guard',
        name: 'Officer Vance',
        title: 'Mansion Security Guard',
        x: 2580,
        y: 640,
        vx: 0,
        vy: 0,
        radius: 20,
        speed: 155,
        facing: Math.PI,
        walkFrame: 0,
        patrolPoints: [
          { x: 2520, y: 640 },
          { x: 2820, y: 640 },
          { x: 2750, y: 350 },
          { x: 2580, y: 480 },
        ],
        patrolIndex: 0,
        state: 'PATROL',
        alertLevel: 0,
        suspicionTarget: null,
        targetPlayer: null,
        stunTimer: 0,
        shoutText: '',
        shoutTimer: 0,
        visionCone: {
          angle: Math.PI,
          distance: 280,
          fov: Math.PI * 0.5,
        },
      },
      {
        id: 'bruno',
        type: 'bruno',
        name: 'Bruno',
        title: 'Estate Guard Dog',
        x: 2650,
        y: 400,
        vx: 0,
        vy: 0,
        radius: 16,
        speed: 170,
        facing: 0,
        walkFrame: 0,
        patrolPoints: [
          { x: 2540, y: 300 },
          { x: 2850, y: 300 },
          { x: 2850, y: 520 },
          { x: 2540, y: 520 },
        ],
        patrolIndex: 0,
        state: 'PATROL',
        alertLevel: 0,
        suspicionTarget: null,
        targetPlayer: null,
        stunTimer: 0,
        shoutText: '',
        shoutTimer: 0,
        distractionTimer: 0,
        visionCone: {
          angle: 0,
          distance: 240,
          fov: Math.PI * 0.65,
        },
      },
      {
        id: 'cleo',
        type: 'cleo',
        name: 'Cleo',
        title: 'Neighborhood Calico Cat',
        x: 1080,
        y: 1100,
        vx: 0,
        vy: 0,
        radius: 12,
        speed: 120,
        facing: 0,
        walkFrame: 0,
        patrolPoints: [
          { x: 1020, y: 1050 },
          { x: 1250, y: 1050 },
          { x: 1250, y: 1250 },
          { x: 1020, y: 1250 },
        ],
        patrolIndex: 0,
        state: 'PATROL',
        alertLevel: 0,
        suspicionTarget: null,
        targetPlayer: null,
        stunTimer: 0,
        shoutText: '',
        shoutTimer: 0,
        distractionTimer: 0,
        visionCone: {
          angle: 0,
          distance: 140,
          fov: Math.PI * 0.7,
        },
      },
      {
        id: 'rival_ziggy',
        type: 'rival_ziggy',
        name: 'Ziggy',
        title: 'Rival Prank Leader',
        x: 1380,
        y: 640,
        vx: 0,
        vy: 0,
        radius: 18,
        speed: 135,
        facing: 0,
        walkFrame: 0,
        patrolPoints: [
          { x: 1380, y: 640 },
          { x: 1750, y: 640 },
          { x: 1750, y: 1100 },
          { x: 1380, y: 1100 },
        ],
        patrolIndex: 0,
        state: 'PATROL',
        alertLevel: 0,
        suspicionTarget: null,
        targetPlayer: null,
        stunTimer: 0,
        shoutText: '',
        shoutTimer: 0,
        visionCone: {
          angle: 0,
          distance: 200,
          fov: Math.PI * 0.45,
        },
      },
      {
        id: 'rival_dex',
        type: 'rival_dex',
        name: 'Dex',
        title: 'Rival Mischief Tech',
        x: 1440,
        y: 640,
        vx: 0,
        vy: 0,
        radius: 17,
        speed: 135,
        facing: 0,
        walkFrame: 0,
        patrolPoints: [
          { x: 1440, y: 640 },
          { x: 1800, y: 640 },
          { x: 1800, y: 1100 },
          { x: 1440, y: 1100 },
        ],
        patrolIndex: 0,
        state: 'PATROL',
        alertLevel: 0,
        suspicionTarget: null,
        targetPlayer: null,
        stunTimer: 0,
        shoutText: '',
        shoutTimer: 0,
        visionCone: {
          angle: 0,
          distance: 200,
          fov: Math.PI * 0.45,
        },
      },
    ];
  }

  public applySettings(settings: PlayerSettings) {
    audio.setMusicVolume(settings.musicVolume);
    audio.setSfxVolume(settings.sfxVolume);
    this.input.joystickSensitivity = settings.joystickSensitivity;
    this.threeRenderer.setAtmosphere(settings.atmosphere as any, settings.weather === 'rain' ? 'rain' : 'clear');
  }

  public setMode(mode: GameMode) {
    this.mode = mode;
  }

  public setEquippedHats(leoHat: string, miloHat: string) {
    this.p1.selectedHat = leoHat;
    this.p2.selectedHat = miloHat;
  }

  public toggleCameraMode(): 'OVERVIEW' | 'FOLLOW' {
    const newMode = this.threeRenderer.toggleCameraMode();
    this.spawnFloatingText(`CAM: ${newMode}`, this.p1.x, this.p1.y - 35, '#38bdf8');
    return newMode;
  }

  public snapCameraBehind() {
    this.threeRenderer.snapBehindPlayer(this.p1.facing);
    this.spawnFloatingText('CAM CENTERED', this.p1.x, this.p1.y - 35, '#facc15');
  }

  public zoomCamera(delta: number) {
    this.threeRenderer.zoom(delta);
  }

  public resetCamera() {
    this.threeRenderer.resetCamera();
    this.spawnFloatingText('CAM RESET', this.p1.x, this.p1.y - 35, '#38bdf8');
  }

  public getCameraMode(): 'OVERVIEW' | 'FOLLOW' {
    return this.threeRenderer.cameraMode;
  }

  public cycleGadget() {
    const curIdx = this.gadgetOrder.indexOf(this.activeGadgetType);
    const nextIdx = (curIdx + 1) % this.gadgetOrder.length;
    this.activeGadgetType = this.gadgetOrder[nextIdx];
    this.spawnFloatingText(
      this.gadgets[this.activeGadgetType].name,
      this.p1.x,
      this.p1.y - 45,
      '#38bdf8'
    );
  }

  public selectGadget(type: GadgetType) {
    if (this.gadgets[type]) {
      this.activeGadgetType = type;
    }
  }

  public cycleCompanionCommand() {
    const curIdx = this.companionCommandsList.indexOf(this.companionCommand);
    const nextIdx = (curIdx + 1) % this.companionCommandsList.length;
    this.companionCommand = this.companionCommandsList[nextIdx];
    triggerHaptic(20);

    const labels: Record<CompanionCommand, string> = {
      FOLLOW: 'Milo: Following You!',
      TROUBLE: 'Milo: Seeking Trouble!',
      DISTRACT: 'Milo: Distracting Neighbors!',
      HIDE: 'Milo: Hiding in Bush!',
    };

    this.spawnFloatingText(labels[this.companionCommand], this.p2.x, this.p2.y - 45, '#eab308');
    this.p2.shoutText = labels[this.companionCommand].split(':')[1].trim();
    this.p2.shoutTimer = 2.0;
  }

  public startGame(levelIndex: number = 0) {
    this.currentLevelIndex = levelIndex;

    if (this.mode === 'TIMED_CHAOS') {
      this.currentLevelConfig = JSON.parse(JSON.stringify(TIMED_CHAOS_LEVEL));
    } else if (this.mode === 'COOP_TRIALS') {
      this.currentLevelConfig = JSON.parse(JSON.stringify(COOP_TRIALS_LEVEL));
    } else {
      this.currentLevelConfig = JSON.parse(JSON.stringify(LEVELS[levelIndex] || LEVELS[0]));
    }

    this.timeLeft = this.currentLevelConfig.timeLimit;
    this.score = 0;
    this.peaceLevel = 100;
    this.wantedStars = 0;
    this.comboMultiplier = 1;
    this.comboTimer = 0;
    this.frenzyTimer = 0;
    this.gadgets = createInitialGadgets();
    this.lastPrankTypes = [];
    this.wasChased = false;

    this.stats = {
      trashCansKicked: 0,
      doorbellsDitched: 0,
      carAlarmsTriggered: 0,
      flamingosFlung: 0,
      sprinklersCranked: 0,
      tpRollsThrown: 0,
      highFivesShared: 0,
      neighborsEvaded: 0,
      totalChaosScore: 0,
      chainReactions: 0,
      gadgetsUsed: 0,
      bananaSlips: 0,
      carsSprayed: 0,
    };

    // Position players on North Maple Way sidewalk in front of 101 & 103 Maple Way
    this.p1.x = 520;
    this.p1.y = 640;
    this.p1.vx = 0;
    this.p1.vy = 0;
    this.p1.isHidden = false;
    this.p1.heldItem = null;
    this.p1.megaKickTimer = 0;
    this.p1.isSpraying = false;
    this.p1.sprayTargetId = undefined;
    this.p1.isLookout = false;

    this.p2.x = 600;
    this.p2.y = 640;
    this.p2.vx = 0;
    this.p2.vy = 0;
    this.p2.isHidden = false;
    this.p2.heldItem = null;
    this.p2.megaKickTimer = 0;
    this.p2.isSpraying = false;
    this.p2.sprayTargetId = undefined;
    this.p2.isLookout = false;

    this.initWorld();
    this.input.clearAll();
    this.state = 'PLAYING';
    audio.startMusic();
    audio.playKick();
    triggerHaptic(40);
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.input.clearAll();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
    }
  }

  public restartGame() {
    this.startGame(this.currentLevelIndex);
  }

  // --- Main Simulation Loop ---
  private startLoop() {
    const loop = (timestamp: number) => {
      if (this.isDestroyed) return;

      if (!this.lastTime) this.lastTime = timestamp;
      const rawDt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;

      // Frame delta clamp per craft guidelines
      const dt = Math.min(rawDt, 0.05);

      if (this.state === 'PLAYING') {
        const isHitstopped = this.hitstop.update(dt);
        if (!isHitstopped) {
          this.update(dt);
        }
      } else if (this.state === 'TITLE') {
        // Live camera pan on Title Screen
        this.cameraX = 1200 + Math.sin(timestamp * 0.0004) * 220;
        this.cameraY = 900 + Math.cos(timestamp * 0.0003) * 160;
      }

      this.render();

      this.input.endFrame();
      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  private update(dt: number) {
    this.gameTime += dt;
    this.shaker.update(dt);
    this.input.update(dt);

    // Timer countdown
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.triggerGameOver('Time is up! Neighborhood curfew took effect!');
      return;
    }

    // Combo timer decay
    if (this.comboMultiplier > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboMultiplier = Math.max(1, this.comboMultiplier - 1);
        this.comboTimer = 4.0;
      }
    }

    // Frenzy speed boost timer
    if (this.frenzyTimer > 0) {
      this.frenzyTimer -= dt;
    }

    // Mega kick timers
    if (this.p1.megaKickTimer > 0) this.p1.megaKickTimer -= dt;
    if (this.p2.megaKickTimer > 0) this.p2.megaKickTimer -= dt;

    // Update Gadgets Cooldowns
    Object.values(this.gadgets).forEach((g) => {
      if (g.cooldownRemaining > 0) {
        g.cooldownRemaining = Math.max(0, g.cooldownRemaining - dt);
      }
    });

    // P1 Actions from unified input
    const p1Input = this.input.getP1State();

    // Consume touch camera rotation delta
    const camDelta = this.input.consumeTouchCameraDelta();
    if (camDelta.dx !== 0 || camDelta.dy !== 0) {
      this.threeRenderer.addCameraRotationDelta(camDelta.dx, camDelta.dy);
    }

    // Check Gadget activation & cycling
    if (p1Input.cycleGadgetJustPressed) {
      this.cycleGadget();
    }
    if (p1Input.gadgetJustPressed) {
      this.activateGadget(this.p1);
    }
    if (p1Input.commandJustPressed && this.mode === 'SOLO') {
      this.cycleCompanionCommand();
    }

    // Camera Snap and Toggle Inputs (V / Z)
    if (p1Input.cameraSnapJustPressed) {
      this.snapCameraBehind();
    }
    if (p1Input.cameraToggleJustPressed) {
      this.toggleCameraMode();
    }

    // Double Trouble Friendship proximity calculation
    const friendsDist = distance(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    const areFriendsTogether = friendsDist < 160;

    // High-Five input check
    this.p1.highFiveCooldown = Math.max(0, this.p1.highFiveCooldown - dt);
    this.p2.highFiveCooldown = Math.max(0, this.p2.highFiveCooldown - dt);

    const p2Input = this.input.getP2State();
    const p1HighFive = p1Input.highFiveJustPressed;
    const p2HighFive = this.mode === 'COOP' ? p2Input.highFiveJustPressed : areFriendsTogether && p1HighFive;

    if (areFriendsTogether && p1HighFive && p2HighFive && this.p1.highFiveCooldown <= 0) {
      this.triggerHighFive();
    }

    // Update Players
    this.updatePlayerMovement(this.p1, p1Input, dt);

    if (this.mode === 'COOP') {
      this.updatePlayerMovement(this.p2, p2Input, dt);
    } else {
      // Improved Milo AI Companion
      this.updateAIBuddy(this.p2, this.p1, dt);
    }

    // Update Props (physics, alarms, water arcs, chain-reactions)
    this.updateProps(dt);

    // Update NPCs (Henderson, Gable, Higgins, Buster)
    this.updateNPCs(dt);

    // Update Floating Text and Particles
    this.updateFloatingTexts(dt);
    this.updateParticles(dt);

    // Update Wanted Stars & Peace Restoration
    this.updateWantedLevel(dt);

    // Check Objectives and Victory
    this.checkObjectives();

    // Smooth dynamic camera
    this.updateCamera(dt);

    // Notify React layer
    this.callbacks.onScoreUpdate(
      this.score,
      this.comboMultiplier,
      this.peaceLevel,
      this.wantedStars,
      this.gadgets[this.activeGadgetType],
      this.companionCommand,
      this.threeRenderer.cameraMode
    );
    this.callbacks.onObjectivesUpdate(this.currentLevelConfig.objectives, Math.ceil(this.timeLeft));
  }

  private updatePlayerMovement(
    player: Player,
    inputState: import('./input').PlayerActionState,
    dt: number
  ) {
    let moveX = inputState.moveX;
    let moveY = inputState.moveY;
    const sprint = inputState.isSprinting || this.frenzyTimer > 0;
    const kick = inputState.kickJustPressed;

    // 3D Jumping simulation
    if (inputState.jumpJustPressed && (!player.yHeight || player.yHeight <= 0.05)) {
      player.jumpVy = 8.5;
      player.isJumping = true;
      audio.playHighFive();
    }
    if (player.jumpVy !== undefined || (player.yHeight && player.yHeight > 0)) {
      player.yHeight = (player.yHeight || 0) + (player.jumpVy || 0) * dt;
      player.jumpVy = (player.jumpVy || 0) - 24 * dt;
      if (player.yHeight <= 0) {
        player.yHeight = 0;
        player.jumpVy = 0;
        player.isJumping = false;
      }
    }

    // Convert screen/joystick input relative to current 3D camera yaw
    let worldMoveX = 0;
    let worldMoveY = 0;

    if (moveX !== 0 || moveY !== 0) {
      const inputForward = -moveY; // W / stick up is forward
      const inputRight = moveX;    // D / stick right is right
      const yaw = this.threeRenderer.cameraYaw;
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);

      worldMoveX = inputRight * cosYaw - inputForward * sinYaw;
      worldMoveY = -inputRight * sinYaw - inputForward * cosYaw;

      const mag = Math.hypot(worldMoveX, worldMoveY);
      if (mag > 1) {
        worldMoveX /= mag;
        worldMoveY /= mag;
      }

      player.facing = Math.atan2(worldMoveY, worldMoveX);
      player.isMoving = true;
      player.walkFrame += dt * (sprint ? 18 : 12);
      if (Math.sin(player.walkFrame * 8) > 0.95 && Math.random() < 0.25) {
        audio.playFootstep('asphalt');
      }
    } else {
      player.isMoving = false;
    }

    // Sprint stamina calculation
    let baseSpeed = 195;
    if (sprint && player.stamina > 5) {
      baseSpeed = 300;
      if (this.frenzyTimer <= 0) {
        player.stamina = Math.max(0, player.stamina - dt * 26);
      }
    } else {
      player.stamina = Math.min(player.maxStamina, player.stamina + dt * 22);
    }

    // Friendship boost (+15% when walking together)
    const buddy = player.id === 'leo' ? this.p2 : this.p1;
    if (distance(player.x, player.y, buddy.x, buddy.y) < 180) {
      baseSpeed *= 1.15;
    }

    // Boost speed timer from gadgets
    if (player.boostSpeedTimer > 0) {
      player.boostSpeedTimer -= dt;
      baseSpeed *= 1.6;
    }

    player.vx = worldMoveX * baseSpeed;
    player.vy = worldMoveY * baseSpeed;

    // Smooth wall sliding: update X and resolve, then update Y and resolve
    player.x += player.vx * dt;
    player.x = Math.max(70, Math.min(MAP_WIDTH - 70, player.x));
    this.walls.forEach((wall) => {
      const res = resolveCircleWallCollision(player.x, player.y, player.radius, wall);
      player.x = res.x;
      player.y = res.y;
    });
    this.houses.forEach((house) => {
      const res = resolveCircleHouseCollision(player.x, player.y, player.radius, house);
      player.x = res.x;
      player.y = res.y;
    });

    player.y += player.vy * dt;
    player.y = Math.max(70, Math.min(MAP_HEIGHT - 70, player.y));
    this.walls.forEach((wall) => {
      const res = resolveCircleWallCollision(player.x, player.y, player.radius, wall);
      player.x = res.x;
      player.y = res.y;
    });
    this.houses.forEach((house) => {
      const res = resolveCircleHouseCollision(player.x, player.y, player.radius, house);
      player.x = res.x;
      player.y = res.y;
    });

    // Check Bush Hiding
    let isInsideBush = false;
    this.props.forEach((prop) => {
      if (prop.type === 'bush') {
        if (distance(player.x, player.y, prop.x, prop.y) < prop.interactionRadius) {
          isInsideBush = true;
          player.currentBushId = prop.id;
        }
      }
    });
    player.isHidden = isInsideBush;

    player.kickCooldown = Math.max(0, player.kickCooldown - dt);

    // --- Spray-Painting Parked Cars & Mansion Walls (Lookout Mechanic) ---
    const nearbyUnsprayedCar = this.props.find(
      (p) =>
        (p.type === 'car' || p.type === 'graffiti_wall') &&
        !p.extra?.isSprayed &&
        distance(player.x, player.y, p.x, p.y) < p.interactionRadius + 60
    );

    const isSprayingCar = nearbyUnsprayedCar && inputState.sprayHeld;

    if (isSprayingCar && nearbyUnsprayedCar) {
      player.isSpraying = true;
      player.sprayTargetId = nearbyUnsprayedCar.id;
      player.vx = 0;
      player.vy = 0;
      player.facing = Math.atan2(nearbyUnsprayedCar.y - player.y, nearbyUnsprayedCar.x - player.x);

      // Play procedural audio
      audio.playSprayPaint();
      if (Math.random() < 0.12) {
        audio.playSprayCanShake();
      }

      // Spawn aerosol spray paint particles
      if (Math.random() < 0.65) {
        const pColors = ['#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#22c55e'];
        const col = pColors[Math.floor(Math.random() * pColors.length)];
        const mistDist = Math.random() * 28 + 12;
        const mistAngle = player.facing + (Math.random() - 0.5) * 0.45;
        this.particles.push({
          x: player.x + Math.cos(mistAngle) * mistDist,
          y: player.y + Math.sin(mistAngle) * mistDist,
          vx: Math.cos(mistAngle) * 55 + (Math.random() - 0.5) * 20,
          vy: Math.sin(mistAngle) * 55 + (Math.random() - 0.5) * 20,
          size: Math.random() * 3.5 + 2,
          color: col,
          type: 'paint',
          life: 0.35,
          maxLife: 0.35,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 4,
          alpha: 1,
        });
      }

      // Progress accumulation (~3.6 seconds to finish)
      nearbyUnsprayedCar.extra = nearbyUnsprayedCar.extra || {};
      const curProg = nearbyUnsprayedCar.extra.sprayProgress || 0;
      const nextProg = Math.min(100, curProg + dt * 28);
      nearbyUnsprayedCar.extra.sprayProgress = nextProg;

      if (nextProg >= 100 && !nearbyUnsprayedCar.extra.isSprayed) {
        nearbyUnsprayedCar.extra.isSprayed = true;
        this.stats.carsSprayed = (this.stats.carsSprayed || 0) + 1;
        player.isSpraying = false;
        player.sprayTargetId = undefined;

        audio.playVictory();
        audio.playCarAlarm();
        this.shaker.addTrauma(0.55);
        this.hitstop.trigger(0.12);
        triggerHaptic(90);

        // Confetti & star explosion
        const pColors = ['#f43f5e', '#38bdf8', '#facc15', '#a855f7', '#22c55e'];
        for (let i = 0; i < 28; i++) {
          this.spawnParticleBurst(
            nearbyUnsprayedCar.x,
            nearbyUnsprayedCar.y,
            'confetti',
            1,
            pColors[i % pColors.length]
          );
        }
        this.spawnParticleBurst(nearbyUnsprayedCar.x, nearbyUnsprayedCar.y, 'star', 14, '#fbbf24');

        const points = 800 * this.comboMultiplier;
        this.addScore(points, 'GRAFFITI MASTERPIECE!', nearbyUnsprayedCar.x, nearbyUnsprayedCar.y - 35);
        this.disturbPeace(45);
        this.alertNearbyNPCs(nearbyUnsprayedCar.x, nearbyUnsprayedCar.y, 700);

        player.shoutText = 'TAGGED IT! GRAFFITI MASTERPIECE!';
        player.shoutTimer = 2.8;
      }
    } else {
      player.isSpraying = false;
      player.sprayTargetId = undefined;

      // Normal kick if not spraying
      if (kick && player.kickCooldown <= 0) {
        this.performKick(player);
      }
    }

    // Smooth squash/stretch return
    player.squashStretch.sx += (1 - player.squashStretch.sx) * dt * 10;
    player.squashStretch.sy += (1 - player.squashStretch.sy) * dt * 10;
  }

  // --- Smart Autonomous AI Companion Milo with Lookout & Mischief ---
  private updateAIBuddy(milo: Player, target: Player, dt: number) {
    const distToLeo = distance(milo.x, milo.y, target.x, target.y);
    let desiredX = 0;
    let desiredY = 0;
    let isSprinting = false;

    // Decrement companion timers
    milo.lookoutWhistleTimer = Math.max(0, (milo.lookoutWhistleTimer || 0) - dt);
    milo.mischiefCooldown = Math.max(0, (milo.mischiefCooldown || 0) - dt);
    if (milo.shoutTimer) milo.shoutTimer = Math.max(0, milo.shoutTimer - dt);
    if (target.shoutTimer) target.shoutTimer = Math.max(0, target.shoutTimer - dt);

    // Danger check: is any NPC chasing?
    const chasingNPC = this.npcs.find((n) => n.state === 'CHASING');

    // 1. LOOKOUT BEHAVIOR: Triggered automatically when Leo is spraying a car!
    const isLeoSpraying = target.isSpraying && target.sprayTargetId;
    const sprayTargetCar = isLeoSpraying
      ? this.props.find((p) => p.id === target.sprayTargetId)
      : null;

    if (isLeoSpraying && sprayTargetCar) {
      milo.isLookout = true;

      // Position Milo at the driveway / curb vantage point facing street
      const isNorth = sprayTargetCar.y < 1100;
      const lookoutX = sprayTargetCar.x + 35;
      const lookoutY = isNorth ? sprayTargetCar.y + 140 : sprayTargetCar.y - 140;
      const distToLookout = distance(milo.x, milo.y, lookoutX, lookoutY);

      if (distToLookout > 25) {
        const a = Math.atan2(lookoutY - milo.y, lookoutX - milo.x);
        desiredX = Math.cos(a);
        desiredY = Math.sin(a);
        isSprinting = true;
      } else {
        // In position: scanning left and right across the road
        milo.facing = (isNorth ? Math.PI / 2 : -Math.PI / 2) + Math.sin(this.gameTime * 4) * 0.7;
      }

      // Scan for approaching threats within 450px
      const approachingThreat = this.npcs.find(
        (n) =>
          distance(milo.x, milo.y, n.x, n.y) < 450 &&
          (n.state === 'CHASING' ||
            n.state === 'INVESTIGATING' ||
            distance(n.x, n.y, sprayTargetCar.x, sprayTargetCar.y) < 380)
      );

      if (approachingThreat) {
        if ((milo.lookoutWhistleTimer || 0) <= 0) {
          milo.lookoutWhistleTimer = 3.2;
          audio.playLookoutWhistle();
          this.shaker.addTrauma(0.25);
          triggerHaptic(75);

          const threatName = approachingThreat.name.toUpperCase();
          milo.shoutText = `CHEESE IT! ${threatName} IS COMING!`;
          milo.shoutTimer = 2.6;
          this.spawnFloatingText(
            `⚠️ ${threatName} INCOMING! RUN! ⚠️`,
            milo.x,
            milo.y - 45,
            '#ef4444'
          );
        }
      } else if ((milo.lookoutWhistleTimer || 0) <= 0 && Math.random() < 0.008) {
        // Reassuring lookout banter
        const tips = ["Coast is clear Leo, keep taggin'!", 'Looking good Leo!', "Hurry, almost done!"];
        milo.shoutText = tips[Math.floor(Math.random() * tips.length)];
        milo.shoutTimer = 2.0;
      }
    } else {
      // Not in lookout mode
      milo.isLookout = false;

      // 2. EXPLICIT COMMANDS OR AUTONOMOUS BEHAVIOR
      if (this.companionCommand === 'HIDE') {
        // Find nearest bush
        let nearestBush = this.props.find((p) => p.type === 'bush');
        let minBDist = 9999;
        this.props.forEach((p) => {
          if (p.type === 'bush') {
            const d = distance(milo.x, milo.y, p.x, p.y);
            if (d < minBDist) {
              minBDist = d;
              nearestBush = p;
            }
          }
        });
        if (nearestBush && minBDist > 15) {
          const a = Math.atan2(nearestBush.y - milo.y, nearestBush.x - milo.x);
          desiredX = Math.cos(a);
          desiredY = Math.sin(a);
          isSprinting = true;
        }
      } else if (this.companionCommand === 'DISTRACT' && chasingNPC) {
        // Run toward chasing NPC to wave arms and divert attention
        const a = Math.atan2(chasingNPC.y - milo.y, chasingNPC.x - milo.x);
        const d = distance(milo.x, milo.y, chasingNPC.x, chasingNPC.y);
        if (d > 70) {
          desiredX = Math.cos(a);
          desiredY = Math.sin(a);
        } else {
          // Taunt and run in circles
          desiredX = -Math.sin(a);
          desiredY = Math.cos(a);
        }
        isSprinting = true;
        if (Math.random() < 0.05) {
          chasingNPC.targetPlayer = 'milo';
          milo.shoutText = 'HEY! OVER HERE!';
          milo.shoutTimer = 2.0;
        }
      } else {
        // 3. AUTONOMOUS MISCHIEF (Milo takes initiative on his own!)
        // If there's an unknocked prop nearby and Milo is ready for mischief:
        const nearbyMischief = this.props.find(
          (p) =>
            (p.type === 'trash_can' ||
              p.type === 'recycle_bin' ||
              p.type === 'flamingo' ||
              p.type === 'gnome' ||
              p.type === 'sprinkler') &&
            p.state === 'idle' &&
            distance(milo.x, milo.y, p.x, p.y) < 300 &&
            distance(target.x, target.y, p.x, p.y) < 380
        );

        if (nearbyMischief && (milo.mischiefCooldown || 0) <= 0 && !chasingNPC) {
          const a = Math.atan2(nearbyMischief.y - milo.y, nearbyMischief.x - milo.x);
          const d = distance(milo.x, milo.y, nearbyMischief.x, nearbyMischief.y);

          if (d > 35) {
            desiredX = Math.cos(a);
            desiredY = Math.sin(a);
            isSprinting = true;
            if (!milo.shoutTimer || milo.shoutTimer <= 0) {
              milo.shoutText = 'Watch this Leo!';
              milo.shoutTimer = 1.4;
            }
          } else if (milo.kickCooldown <= 0) {
            this.performKick(milo);
            milo.mischiefCooldown = 4.0;
            const barks = ['TIMBER!', 'Down it goes!', 'Mischief made!'];
            milo.shoutText = barks[Math.floor(Math.random() * barks.length)];
            milo.shoutTimer = 1.8;
          }
        } else if (chasingNPC && distance(milo.x, milo.y, chasingNPC.x, chasingNPC.y) < 180) {
          // Flee from danger
          const awayAngle = Math.atan2(milo.y - chasingNPC.y, milo.x - chasingNPC.x);
          desiredX = Math.cos(awayAngle);
          desiredY = Math.sin(awayAngle);
          isSprinting = true;
        } else if (distToLeo > 95) {
          // Follow Leo dynamically with friendly flanking offset
          const flankAngle = Math.atan2(target.y - milo.y, target.x - milo.x);
          desiredX = Math.cos(flankAngle);
          desiredY = Math.sin(flankAngle);
          isSprinting = distToLeo > 220;
        }
      }
    }

    if (desiredX !== 0 || desiredY !== 0) {
      milo.facing = Math.atan2(desiredY, desiredX);
      milo.isMoving = true;
      milo.walkFrame += dt * (isSprinting ? 18 : 12);
      const speed = isSprinting ? 285 : 190;
      milo.vx = desiredX * speed;
      milo.vy = desiredY * speed;

      milo.x += milo.vx * dt;
      this.walls.forEach((wall) => {
        const res = resolveCircleWallCollision(milo.x, milo.y, milo.radius, wall);
        milo.x = res.x;
        milo.y = res.y;
      });
      this.houses.forEach((house) => {
        const res = resolveCircleHouseCollision(milo.x, milo.y, milo.radius, house);
        milo.x = res.x;
        milo.y = res.y;
      });

      milo.y += milo.vy * dt;
      this.walls.forEach((wall) => {
        const res = resolveCircleWallCollision(milo.x, milo.y, milo.radius, wall);
        milo.x = res.x;
        milo.y = res.y;
      });
      this.houses.forEach((house) => {
        const res = resolveCircleHouseCollision(milo.x, milo.y, milo.radius, house);
        milo.x = res.x;
        milo.y = res.y;
      });
    } else {
      milo.isMoving = false;
      milo.vx = 0;
      milo.vy = 0;
    }

    // Check Bush Hiding
    let isInsideBush = false;
    this.props.forEach((prop) => {
      if (prop.type === 'bush') {
        if (distance(milo.x, milo.y, prop.x, prop.y) < prop.interactionRadius) {
          isInsideBush = true;
          milo.currentBushId = prop.id;
        }
      }
    });
    milo.isHidden = isInsideBush;

    // Auto-assist double kick if close to Leo kicking
    milo.kickCooldown = Math.max(0, milo.kickCooldown - dt);
    if (target.kickCooldown > 0.2 && milo.kickCooldown <= 0 && distToLeo < 130) {
      this.performKick(milo);
    }
  }

  // --- Gadgets Execution ---
  public activateGadget(player: Player) {
    const gadget = this.gadgets[this.activeGadgetType];
    if (!gadget || gadget.cooldownRemaining > 0 || gadget.chargesRemaining <= 0) {
      return;
    }

    gadget.chargesRemaining--;
    gadget.cooldownRemaining = gadget.maxCooldown;
    this.stats.gadgetsUsed++;
    triggerHaptic(45);

    switch (gadget.type) {
      case 'decoy': {
        audio.playDecoyMusic();
        this.props.push({
          id: `decoy_${Date.now()}`,
          type: 'decoy_prop',
          x: player.x,
          y: player.y,
          width: 32,
          height: 20,
          radius: 18,
          rotation: 0,
          vx: 0,
          vy: 0,
          vRot: 0,
          state: 'active',
          timer: 8.0,
          interactionRadius: 40,
          noiseValue: 80,
          chaosPoints: 100,
        });
        this.spawnFloatingText('DECOY DEPLOYED!', player.x, player.y - 30, '#38bdf8');
        this.alertNearbyNPCs(player.x, player.y, 650);
        break;
      }

      case 'mega_kick': {
        audio.playMegaKickBoost();
        player.megaKickTimer = 8.0;
        this.shaker.addTrauma(0.25);
        this.spawnParticleBurst(player.x, player.y, 'star', 12, '#fbbf24');
        this.spawnFloatingText('MEGA KICK READY!', player.x, player.y - 30, '#f59e0b');
        break;
      }

      case 'banana_peel': {
        audio.playWhoosh();
        this.props.push({
          id: `banana_${Date.now()}`,
          type: 'banana_peel',
          x: player.x - Math.cos(player.facing) * 15,
          y: player.y - Math.sin(player.facing) * 15,
          width: 16,
          height: 16,
          radius: 12,
          rotation: Math.random() * Math.PI,
          vx: 0,
          vy: 0,
          vRot: 0,
          state: 'idle',
          timer: 30,
          interactionRadius: 20,
          noiseValue: 10,
          chaosPoints: 50,
        });
        this.spawnFloatingText('BANANA PEEL DROPPED!', player.x, player.y - 30, '#facc15');
        break;
      }

      case 'confetti_bomb': {
        audio.playConfettiPop();
        this.shaker.addTrauma(0.3);
        this.comboMultiplier = Math.min(5, this.comboMultiplier + 1);
        this.comboTimer = 7.0;

        // Spawn confetti particles in 360
        const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#a855f7', '#22c55e'];
        for (let i = 0; i < 28; i++) {
          const col = colors[i % colors.length];
          this.spawnParticleBurst(player.x, player.y, 'confetti', 1, col);
        }

        // Stun nearby chasers
        this.npcs.forEach((npc) => {
          if (distance(player.x, player.y, npc.x, npc.y) < 260) {
            npc.stunTimer = 3.5;
            npc.state = 'STUNNED';
            npc.shoutText = 'MY EYES! CONFETTI!';
            npc.shoutTimer = 2.5;
          }
        });

        this.spawnFloatingText('CONFETTI PARTY!', player.x, player.y - 30, '#ec4899');
        break;
      }

      case 'smoke_puff': {
        audio.playSmokePoof();
        for (let i = 0; i < 16; i++) {
          this.spawnParticleBurst(player.x, player.y, 'smoke', 1, '#a855f7');
        }

        // Break all active chases
        this.npcs.forEach((npc) => {
          if (npc.state === 'CHASING') {
            npc.state = 'INVESTIGATING';
            npc.targetPlayer = null;
            npc.shoutText = 'COUGH! WHERE ARE THEY?!';
            npc.shoutTimer = 2.5;
            this.stats.neighborsEvaded++;
          }
        });

        this.spawnFloatingText('SMOKE SCREEN ESCAPE!', player.x, player.y - 30, '#a855f7');
        break;
      }

      case 'buddy_boost': {
        audio.playBuddyBoost();
        this.shaker.addTrauma(0.4);
        player.boostSpeedTimer = 3.0;
        const buddy = player.id === 'leo' ? this.p2 : this.p1;
        buddy.boostSpeedTimer = 3.0;

        // Forward rocket boost
        const angle = player.facing;
        player.vx = Math.cos(angle) * 600;
        player.vy = Math.sin(angle) * 600;
        buddy.vx = Math.cos(angle) * 600;
        buddy.vy = Math.sin(angle) * 600;

        this.spawnParticleBurst(player.x, player.y, 'star', 10, '#fbbf24');
        this.spawnFloatingText('BUDDY BOOST ROCKET!', player.x, player.y - 30, '#f97316');
        break;
      }
    }
  }

  // --- Interaction & Kicking ---
  private performKick(player: Player) {
    player.kickCooldown = 0.35;
    player.squashStretch.sx = 1.35;
    player.squashStretch.sy = 0.75;
    audio.playKick();
    triggerHaptic(25);

    const buddy = player.id === 'leo' ? this.p2 : this.p1;
    const isDoubleTrouble = distance(player.x, player.y, buddy.x, buddy.y) < 140;
    const isMega = player.megaKickTimer > 0;

    let hitSomething = false;

    // Check props
    this.props.forEach((prop) => {
      const d = distance(player.x, player.y, prop.x, prop.y);
      if (d < prop.interactionRadius + player.radius) {
        hitSomething = true;
        this.interactWithProp(player, prop, isDoubleTrouble, isMega);
      }
    });

    // Check Doorbells on Houses
    this.houses.forEach((house) => {
      const d = distance(player.x, player.y, house.doorbellX, house.doorbellY);
      if (d < 45 && house.doorbellCooldown <= 0) {
        hitSomething = true;
        this.ringDoorbell(house, player);
      }
    });

    if (hitSomething) {
      const traumaAmount = isMega ? 0.5 : isDoubleTrouble ? 0.35 : 0.15;
      this.shaker.addTrauma(traumaAmount);
      if (isDoubleTrouble || isMega) {
        this.hitstop.trigger(0.07);
        this.spawnParticleBurst(player.x, player.y, 'star', 6, '#fbbf24');
      }
    }
  }

  private interactWithProp(
    player: Player,
    prop: Prop,
    isDoubleTrouble: boolean,
    isMega: boolean
  ) {
    const angle = Math.atan2(prop.y - player.y, prop.x - player.x);
    let force = isDoubleTrouble ? 480 : 280;
    if (isMega) force *= 2.2;

    // Anti-Exploit Diminishing Returns check
    const now = this.gameTime;
    if (!prop.lastInteractedTime) prop.lastInteractedTime = 0;
    if (!prop.interactionCount) prop.interactionCount = 0;

    let multiplierYield = 1.0;
    if (now - prop.lastInteractedTime < 12.0) {
      prop.interactionCount++;
      if (prop.interactionCount === 2) multiplierYield = 0.5;
      else if (prop.interactionCount >= 3) multiplierYield = 0.15;
    } else {
      prop.interactionCount = 1;
    }
    prop.lastInteractedTime = now;

    // Diverse prank streak
    this.checkPrankVariety(prop.type);

    switch (prop.type) {
      case 'trash_can':
      case 'recycle_bin':
      case 'dumpster': {
        prop.state = 'knocked';
        prop.vx = Math.cos(angle) * force;
        prop.vy = Math.sin(angle) * force;
        prop.vRot = (Math.random() - 0.5) * (isMega ? 22 : 12);
        audio.playTrashCrash();

        this.spawnParticleBurst(prop.x, prop.y, 'trash', 8, '#e2e8f0');
        this.spawnParticleBurst(prop.x, prop.y, 'trash', 4, '#eab308');

        const basePoints = Math.round(
          (isDoubleTrouble ? prop.chaosPoints * 2 : prop.chaosPoints) * multiplierYield
        );
        const finalPts = basePoints * this.comboMultiplier;

        this.addScore(finalPts, 'TRASH CLATTER!', prop.x, prop.y);
        this.stats.trashCansKicked++;
        this.updateObjective('kick_trash', 1);
        this.disturbPeace(prop.noiseValue);
        this.alertNearbyNPCs(prop.x, prop.y, 480);
        break;
      }

      case 'flamingo': {
        prop.state = 'knocked';
        prop.vx = Math.cos(angle) * (force * 1.3);
        prop.vy = Math.sin(angle) * (force * 1.3);
        prop.vRot = 16;
        audio.playFlamingoFlung();
        this.spawnParticleBurst(prop.x, prop.y, 'star', 5, '#f43f5e');

        const finalPts = Math.round((isDoubleTrouble ? 140 : 70) * multiplierYield * this.comboMultiplier);
        this.addScore(finalPts, 'FLAMINGO FLUNG!', prop.x, prop.y);
        this.stats.flamingosFlung++;
        this.updateObjective('fling_flamingos', 1);
        this.updateObjective('bonus_flamingo', 1);
        this.disturbPeace(25);
        this.alertNearbyNPCs(prop.x, prop.y, 350);
        break;
      }

      case 'gnome': {
        prop.state = 'knocked';
        prop.vx = Math.cos(angle) * force;
        prop.vy = Math.sin(angle) * force;
        prop.vRot = 8;
        audio.playKick();
        this.spawnParticleBurst(prop.x, prop.y, 'dust', 6, '#cbd5e1');
        const finalPts = Math.round(80 * multiplierYield * this.comboMultiplier);
        this.addScore(finalPts, 'GNOME TOPPLED!', prop.x, prop.y);
        this.disturbPeace(20);
        break;
      }

      case 'sprinkler': {
        prop.state = 'active';
        prop.timer = 15;
        audio.playSprinkler();
        this.spawnParticleBurst(prop.x, prop.y, 'water', 12, '#38bdf8');
        const finalPts = Math.round(120 * multiplierYield * this.comboMultiplier);
        this.addScore(finalPts, 'SPRINKLER SABOTAGED!', prop.x, prop.y);
        this.stats.sprinklersCranked++;
        this.updateObjective('crank_sprinklers', 1);
        this.disturbPeace(30);
        this.alertNearbyNPCs(prop.x, prop.y, 320);
        break;
      }

      case 'car': {
        if (prop.state !== 'active') {
          prop.state = 'active';
          prop.timer = 12;
          audio.playCarAlarm();
          this.shaker.addTrauma(0.4);
          this.spawnParticleBurst(prop.x, prop.y, 'star', 10, '#fef08a');
          const finalPts = Math.round(250 * multiplierYield * this.comboMultiplier);
          this.addScore(finalPts, 'CAR ALARM BLARING!', prop.x, prop.y);
          this.stats.carAlarmsTriggered++;
          this.updateObjective('car_alarm', 1);
          this.disturbPeace(50);
          this.alertNearbyNPCs(prop.x, prop.y, 750);
        }
        break;
      }

      case 'tp_tree': {
        if (!prop.extra) prop.extra = { tpCount: 0 };
        prop.extra.tpCount = (prop.extra.tpCount || 0) + 1;
        audio.playTpRoll();
        this.spawnParticleBurst(prop.x, prop.y, 'tp_ribbon', 8, '#ffffff');
        const finalPts = Math.round(200 * multiplierYield * this.comboMultiplier);
        this.addScore(finalPts, 'TOILET PAPER BOMB!', prop.x, prop.y);
        this.stats.tpRollsThrown++;
        this.updateObjective('tp_oak', 1);
        this.disturbPeace(35);
        this.alertNearbyNPCs(prop.x, prop.y, 400);

        if (prop.extra.tpCount >= 3) {
          this.unlockSecret('full_toilet_paper');
        }
        break;
      }

      case 'leaf_pile': {
        audio.playLeafRustle();
        this.spawnParticleBurst(prop.x, prop.y, 'leaf', 16, '#ea580c');
        this.spawnParticleBurst(prop.x, prop.y, 'leaf', 12, '#ca8a04');
        const finalPts = Math.round(60 * multiplierYield * this.comboMultiplier);
        this.addScore(finalPts, 'LEAF CRUNCH!', prop.x, prop.y);
        this.disturbPeace(15);
        break;
      }

      case 'buster_ball': {
        prop.vx = Math.cos(angle) * (force * 1.5);
        prop.vy = Math.sin(angle) * (force * 1.5);
        prop.vRot = 14;
        audio.playKick();
        this.spawnFloatingText('FETCH BUSTER!', prop.x, prop.y - 20, '#ef4444');

        // Alert Buster to chase the ball
        const buster = this.npcs.find((n) => n.id === 'buster');
        if (buster) {
          buster.state = 'PLAYING';
          buster.suspicionTarget = { x: prop.x, y: prop.y };
          buster.shoutText = 'RUFF! BALL!';
          buster.shoutTimer = 2.0;
          audio.playDogBark();
        }
        this.updateObjective('bonus_buster', 1);
        this.unlockSecret('buster_ball');
        break;
      }
      case 'sausage_plate': {
        audio.playKick();
        prop.vx = Math.cos(angle) * (force * 0.85);
        prop.vy = Math.sin(angle) * (force * 0.85);
        this.spawnParticleBurst(prop.x, prop.y, 'star', 6, '#f97316');
        this.spawnFloatingText('SAUSAGE FLING! 🌭', prop.x, prop.y - 20, '#f97316');
        let pacifiedCount = 0;
        this.npcs.forEach((npc) => {
          if (npc.type === 'buster' || npc.type === 'bruno' || npc.type === 'cleo') {
            const dPet = distance(prop.x, prop.y, npc.x, npc.y);
            if (dPet < 650) {
              npc.distractionTimer = 8.5;
              npc.state = 'PLAYING';
              npc.targetPlayer = null;
              npc.suspicionTarget = { x: prop.x, y: prop.y };
              npc.shoutText = npc.type === 'cleo' ? 'PURRRR! TREAT! 🐾' : 'YUM! SAUSAGE! 🦴';
              npc.shoutTimer = 3.5;
              pacifiedCount++;
            }
          }
        });
        if (pacifiedCount > 0) {
          audio.playDogBark();
          this.addScore(300 * this.comboMultiplier, 'PETS PACIFIED! 🐾', prop.x, prop.y);
          this.spawnParticleBurst(prop.x, prop.y, 'star', 10, '#ec4899');
        } else {
          this.addScore(100 * this.comboMultiplier, 'SNACK LAUNCHED!', prop.x, prop.y);
        }
        break;
      }
      case 'firework_box': {
        if (prop.state !== 'active') {
          prop.state = 'active';
          prop.timer = 8;
          audio.playCarAlarm();
          this.shaker.addTrauma(0.5);
          const pColors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#a855f7'];
          for (let i = 0; i < 24; i++) {
            this.spawnParticleBurst(prop.x, prop.y, 'star', 1, pColors[i % pColors.length]);
          }
          this.spawnFloatingText('FIREWORKS IGNITED! 🎆', prop.x, prop.y - 30, '#f59e0b');
          this.addScore(350 * this.comboMultiplier, 'SPARK SPECTACLE! 🎆', prop.x, prop.y);
          this.disturbPeace(60);
          this.alertNearbyNPCs(prop.x, prop.y, 850);
        }
        break;
      }
    }
  }

  private ringDoorbell(house: House, player: Player) {
    house.doorbellCooldown = 18;
    audio.playDoorbell();
    this.addScore(150 * this.comboMultiplier, 'DING-DONG DASH!', house.doorbellX, house.doorbellY);
    this.stats.doorbellsDitched++;
    this.updateObjective('doorbell_dash', 1);
    this.disturbPeace(35);

    const homeowner = this.npcs.find((n) => n.id === 'henderson' && house.id === 1) || this.npcs[0];
    if (homeowner) {
      homeowner.state = 'INVESTIGATING';
      homeowner.suspicionTarget = { x: house.doorbellX, y: house.doorbellY + 20 };
      homeowner.shoutText = 'WHO’S AT THE DOOR?!';
      homeowner.shoutTimer = 2.5;
      audio.playGrumble();
    }
  }

  private triggerHighFive() {
    this.p1.highFiveCooldown = 4.0;
    this.p2.highFiveCooldown = 4.0;
    this.frenzyTimer = 6.0;
    this.comboMultiplier = Math.min(5, this.comboMultiplier + 1);
    this.comboTimer = 7.0;

    audio.playHighFive();
    triggerHaptic(50);
    this.shaker.addTrauma(0.3);
    this.hitstop.trigger(0.08);

    const midX = (this.p1.x + this.p2.x) / 2;
    const midY = (this.p1.y + this.p2.y) / 2;
    this.spawnParticleBurst(midX, midY, 'star', 12, '#fbbf24');
    this.spawnParticleBurst(midX, midY, 'heart', 4, '#f43f5e');

    this.addScore(100 * this.comboMultiplier, 'DOUBLE TROUBLE HIGH-FIVE!', midX, midY);
    this.stats.highFivesShared++;
    this.updateObjective('high_five', 1);
    this.updateObjective('high_fives', 1);
    this.updateObjective('double_trouble_combo', this.comboMultiplier);
    this.updateObjective('max_combo', this.comboMultiplier);

    if (this.comboMultiplier >= 5) {
      this.unlockSecret('double_trouble_legend');
    }
  }

  // --- Variety Combo Streak ---
  private checkPrankVariety(propType: string) {
    this.lastPrankTypes.push(propType);
    if (this.lastPrankTypes.length > 5) this.lastPrankTypes.shift();

    const uniqueCount = new Set(this.lastPrankTypes).size;
    if (uniqueCount >= 3 && this.lastPrankTypes.length >= 3) {
      const bonusPts = 250 * this.comboMultiplier;
      this.addScore(bonusPts, 'VARIETY PRANK STREAK!', this.p1.x, this.p1.y - 40);
      this.lastPrankTypes = [];
    }
  }

  // --- Props Physics & Chain Reactions ---
  private updateProps(dt: number) {
    this.props.forEach((prop, i) => {
      // Movement & Friction
      const speed = Math.hypot(prop.vx, prop.vy);
      if (speed > 0.1) {
        prop.x += prop.vx * dt;
        prop.y += prop.vy * dt;
        prop.vx *= Math.pow(0.88, dt * 60);
        prop.vy *= Math.pow(0.88, dt * 60);

        // Chain Reaction: moving props hit other props!
        if (speed > 110) {
          for (let j = 0; j < this.props.length; j++) {
            if (i === j) continue;
            const other = this.props[j];
            if (distance(prop.x, prop.y, other.x, other.y) < prop.radius + other.radius) {
              this.triggerChainReaction(prop, other);
            }
          }
        }
      } else {
        prop.vx = 0;
        prop.vy = 0;
      }

      if (Math.abs(prop.vRot) > 0.1) {
        prop.rotation += prop.vRot * dt;
        prop.vRot *= Math.pow(0.9, dt * 60);
      } else {
        prop.vRot = 0;
      }

      // Boundary clamp
      prop.x = Math.max(60, Math.min(MAP_WIDTH - 60, prop.x));
      prop.y = Math.max(60, Math.min(MAP_HEIGHT - 60, prop.y));

      // Timers
      if (prop.timer > 0) {
        prop.timer -= dt;
        if (prop.type === 'sprinkler' && prop.state === 'active') {
          if (Math.random() < 0.3) {
            audio.playSprinkler();
            this.spawnParticleBurst(prop.x, prop.y, 'water', 4, '#38bdf8');
          }
        } else if (prop.type === 'car' && prop.state === 'active') {
          if (Math.random() < 0.1) audio.playCarAlarm();
        } else if (prop.type === 'decoy_prop') {
          if (Math.random() < 0.15) {
            this.alertNearbyNPCs(prop.x, prop.y, 500);
          }
        }

        if (prop.timer <= 0) {
          if (prop.type === 'decoy_prop' || prop.type === 'banana_peel') {
            this.props.splice(i, 1);
          } else {
            prop.state = 'idle';
          }
        }
      }
    });

    // Update house doorbell cooldowns
    this.houses.forEach((h) => {
      if (h.doorbellCooldown > 0) h.doorbellCooldown -= dt;
    });
  }

  private triggerChainReaction(source: Prop, target: Prop) {
    if (target.state === 'knocked' || target.state === 'active') return;

    this.stats.chainReactions++;
    this.updateObjective('bonus_chain', 1);
    this.updateObjective('super_chain', 1);

    const a = Math.atan2(target.y - source.y, target.x - source.x);
    target.vx = Math.cos(a) * 320;
    target.vy = Math.sin(a) * 320;
    target.state = 'knocked';

    audio.playTrashCrash();
    this.shaker.addTrauma(0.3);
    this.spawnParticleBurst(target.x, target.y, 'star', 6, '#fbbf24');
    this.addScore(150 * this.comboMultiplier, 'CHAIN REACTION!', target.x, target.y);
  }

  // --- NPCs, Buster & Pursuit AI ---
  private updateNPCs(dt: number) {
    let anyChasing = false;

    this.npcs.forEach((npc) => {
      if (npc.shoutTimer > 0) npc.shoutTimer -= dt;

      // Stunned timer (e.g. slipped on banana peel)
      if (npc.stunTimer > 0) {
        npc.stunTimer -= dt;
        npc.facing += dt * 10; // Spinning comically
        if (npc.stunTimer <= 0) {
          npc.state = 'PATROL';
        }
        return;
      }

      // Distraction timer (e.g. eating sausage plate)
      if (npc.distractionTimer && npc.distractionTimer > 0) {
        npc.distractionTimer -= dt;
        npc.state = 'PLAYING';
        npc.walkFrame += dt * 6;
        npc.facing += Math.sin(this.gameTime * 4) * 0.04;
        if (npc.distractionTimer <= 0) {
          npc.state = 'PATROL';
        }
        return;
      }

      // Pets & Animals special logic (Buster, Bruno, Cleo)
      if (npc.type === 'buster' || npc.type === 'bruno' || npc.type === 'cleo') {
        this.updatePet(npc, dt);
        return;
      }

      // Rivals special logic (Ziggy & Dex)
      if (npc.type === 'rival_ziggy' || npc.type === 'rival_dex') {
        this.updateRivalPrankster(npc, dt);
        return;
      }

      // Check banana peels on ground
      this.props.forEach((prop, pIdx) => {
        if (prop.type === 'banana_peel' && distance(npc.x, npc.y, prop.x, prop.y) < npc.radius + 10) {
          npc.stunTimer = 3.5;
          npc.state = 'STUNNED';
          npc.shoutText = 'WHOA! SLIPPED!';
          npc.shoutTimer = 2.5;
          audio.playBananaSlip();
          this.stats.bananaSlips++;
          this.updateObjective('banana_slip', 1);
          this.unlockSecret('banana_slip');
          this.props.splice(pIdx, 1);
          this.addScore(200 * this.comboMultiplier, 'BANANA SLIP-UP!', npc.x, npc.y);
        }
      });

      // Vision check against players
      const targetP = this.getClosestVisiblePlayer(npc);

      if (targetP) {
        anyChasing = true;
        this.wasChased = true;

        if (npc.state !== 'CHASING') {
          npc.state = 'CHASING';
          npc.targetPlayer = targetP.id;
          npc.shoutTimer = 3.0;

          if (npc.type === 'henderson') {
            npc.shoutText = 'GET OFF MY LAWN!';
            audio.playGrumble();
          } else if (npc.type === 'gable') {
            npc.shoutText = 'I’M CALLING HIGGINS!';
            audio.playGrumble();
          } else if (npc.type === 'higgins') {
            npc.shoutText = 'PULL OVER, TROUBLEMAKERS!';
            audio.playWhistle();
          }
          } else if (npc.type === 'guard') {
            npc.shoutText = 'VANCE: SECURITY BREACH! HALT!';
            audio.playWhistle();
          this.shaker.addTrauma(0.2);
          triggerHaptic(30);
        }

        // Run towards target player
        const dx = targetP.x - npc.x;
        const dy = targetP.y - npc.y;
        const angle = Math.atan2(dy, dx);
        npc.facing = angle;
        npc.walkFrame += dt * 14;

        const chaseSpeed = npc.speed * (this.wantedStars >= 4 ? 1.3 : 1.15);
        npc.x += Math.cos(angle) * chaseSpeed * dt;
        npc.y += Math.sin(angle) * chaseSpeed * dt;

        // Busted check!
        const d = distance(npc.x, npc.y, targetP.x, targetP.y);
        if (d < npc.radius + targetP.radius) {
          // Check if buddy boost / frenzy gives temporary immunity
          if (targetP.boostSpeedTimer <= 0) {
            this.triggerBusted(npc.name);
            return;
          }
        }

        if (npc.type === 'higgins') {
          this.updateObjective('evade_police', dt);
        }
      } else if (npc.state === 'CHASING') {
        // Target lost (hid in bush or behind smoke)
        npc.state = 'INVESTIGATING';
        npc.targetPlayer = null;
        npc.suspicionTarget = { x: npc.x, y: npc.y };
        npc.shoutText = 'Where did they go?!';
        npc.shoutTimer = 2.0;
        this.stats.neighborsEvaded++;

        // Clean Escape bonus
        if (this.wantedStars >= 2) {
          this.addScore(300, 'CLEAN ESCAPE!', npc.x, npc.y);
          this.updateObjective('clean_escapes', 1);
        }
      } else if (npc.state === 'INVESTIGATING') {
        if (npc.suspicionTarget) {
          const dx = npc.suspicionTarget.x - npc.x;
          const dy = npc.suspicionTarget.y - npc.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 20) {
            npc.facing = Math.atan2(dy, dx);
            npc.walkFrame += dt * 8;
            npc.x += (dx / d) * npc.speed * 0.8 * dt;
            npc.y += (dy / d) * npc.speed * 0.8 * dt;
          } else {
            npc.suspicionTarget = null;
            setTimeout(() => {
              if (npc.state === 'INVESTIGATING') npc.state = 'PATROL';
            }, 3000);
          }
        }
      } else {
        // Standard patrol
        const pt = npc.patrolPoints[npc.patrolIndex];
        if (pt) {
          const dx = pt.x - npc.x;
          const dy = pt.y - npc.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 25) {
            npc.patrolIndex = (npc.patrolIndex + 1) % npc.patrolPoints.length;
          } else {
            npc.facing = Math.atan2(dy, dx);
            npc.walkFrame += dt * 7;
            npc.x += (dx / d) * npc.speed * 0.65 * dt;
            npc.y += (dy / d) * npc.speed * 0.65 * dt;
          }
        }
      }

      // NPC collisions
      this.walls.forEach((wall) => {
        const res = resolveCircleWallCollision(npc.x, npc.y, npc.radius, wall);
        npc.x = res.x;
        npc.y = res.y;
      });
      this.houses.forEach((house) => {
        const res = resolveCircleHouseCollision(npc.x, npc.y, npc.radius, house);
        npc.x = res.x;
        npc.y = res.y;
      });
    });

    if (anyChasing) {
      this.chaseCooldownTimer = 0;
    } else {
      this.chaseCooldownTimer += dt;
    }
  }

  private updatePet(pet: NPC, dt: number) {
    if (pet.distractionTimer && pet.distractionTimer > 0) {
      pet.distractionTimer -= dt;
      pet.state = 'PLAYING';
      pet.walkFrame += dt * 6;
      if (pet.shoutTimer <= 0) {
        pet.shoutText = pet.type === 'cleo' ? 'PURRRR! ❤️' : 'NOM NOM! ❤️';
        pet.shoutTimer = 2.5;
      }
      return;
    }

    // Special ball playing for Buster
    if (pet.type === 'buster') {
      const ball = this.props.find((p) => p.type === 'buster_ball');
      if (pet.state === 'PLAYING' && ball) {
        const d = distance(pet.x, pet.y, ball.x, ball.y);
        if (d > 20) {
          const a = Math.atan2(ball.y - pet.y, ball.x - pet.x);
          pet.facing = a;
          pet.walkFrame += dt * 14;
          pet.x += Math.cos(a) * pet.speed * dt;
          pet.y += Math.sin(a) * pet.speed * dt;
          return;
        } else {
          ball.vx = (Math.random() - 0.5) * 100;
          ball.vy = (Math.random() - 0.5) * 100;
          pet.shoutText = 'PANT! PANT!';
          pet.shoutTimer = 2.0;
          pet.state = 'PATROL';
        }
      }
    }

    // Yard / Area Trespassing triggers pet chase
    const targetP = this.getClosestVisiblePlayer(pet);
    let shouldChase = false;
    if (targetP && !targetP.isHidden) {
      if (pet.type === 'buster') {
        if (targetP.x >= 1780 && targetP.x <= 2260 && targetP.y >= 1560 && targetP.y <= 2100) {
          shouldChase = true;
        }
      } else if (pet.type === 'bruno') {
        if (targetP.x >= 2480 && targetP.y <= 700) {
          shouldChase = true;
        }
      }
    }

    if (shouldChase && targetP) {
      if (pet.state !== 'CHASING') {
        pet.state = 'CHASING';
        pet.targetPlayer = targetP.id;
        pet.shoutText = pet.type === 'bruno' ? 'WOOF! INTRUDER!' : 'RUFF! GET OUT!';
        pet.shoutTimer = 2.0;
        audio.playDogBark();
      }
      const dx = targetP.x - pet.x;
      const dy = targetP.y - pet.y;
      const angle = Math.atan2(dy, dx);
      pet.facing = angle;
      pet.walkFrame += dt * 14;
      pet.x += Math.cos(angle) * pet.speed * 1.05 * dt;
      pet.y += Math.sin(angle) * pet.speed * 1.05 * dt;

      const d = distance(pet.x, pet.y, targetP.x, targetP.y);
      if (d < pet.radius + targetP.radius) {
        if (targetP.boostSpeedTimer <= 0) {
          this.triggerBusted(`${pet.name} (Caught Trespassing!)`);
        }
      }
    } else {
      pet.state = 'PATROL';
      const pt = pet.patrolPoints[pet.patrolIndex];
      if (pt) {
        const dx = pt.x - pet.x;
        const dy = pt.y - pet.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 22) {
          pet.patrolIndex = (pet.patrolIndex + 1) % pet.patrolPoints.length;
        } else {
          pet.facing = Math.atan2(dy, dx);
          pet.walkFrame += dt * (pet.type === 'cleo' ? 6 : 8);
          pet.x += (dx / d) * pet.speed * 0.6 * dt;
          pet.y += (dy / d) * pet.speed * 0.6 * dt;
        }
      }
    }

    this.walls.forEach((wall) => {
      const res = resolveCircleWallCollision(pet.x, pet.y, pet.radius, wall);
      pet.x = res.x;
      pet.y = res.y;
    });
  }

  private updateRivalPrankster(rival: NPC, dt: number) {
    const pt = rival.patrolPoints[rival.patrolIndex];
    if (pt) {
      const dx = pt.x - rival.x;
      const dy = pt.y - rival.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 25) {
        rival.patrolIndex = (rival.patrolIndex + 1) % rival.patrolPoints.length;
      } else {
        rival.facing = Math.atan2(dy, dx);
        rival.walkFrame += dt * 8;
        rival.x += (dx / d) * rival.speed * 0.7 * dt;
        rival.y += (dy / d) * rival.speed * 0.7 * dt;
      }
    }

    if (Math.random() < 0.002 && rival.shoutTimer <= 0) {
      const banters = [
        'ZIGGY: Double Trouble won’t beat our score!',
        'DEX: Check out that mansion wall!',
        'ZIGGY: We run this cul-de-sac!',
        'DEX: Watch out for Officer Vance!',
      ];
      rival.shoutText = banters[Math.floor(Math.random() * banters.length)];
      rival.shoutTimer = 3.5;
    }

    this.walls.forEach((wall) => {
      const res = resolveCircleWallCollision(rival.x, rival.y, rival.radius, wall);
      rival.x = res.x;
      rival.y = res.y;
    });
    this.houses.forEach((house) => {
      const res = resolveCircleHouseCollision(rival.x, rival.y, rival.radius, house);
      rival.x = res.x;
      rival.y = res.y;
    });
  }

  private getClosestVisiblePlayer(npc: NPC): Player | null {
    const players = [this.p1, this.p2];
    for (const p of players) {
      if (p.isHidden) continue;

      const d = distance(npc.x, npc.y, p.x, p.y);
      if (d > npc.visionCone.distance) continue;

      const angleToPlayer = Math.atan2(p.y - npc.y, p.x - npc.x);
      let diff = angleToPlayer - npc.facing;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      if (Math.abs(diff) < npc.visionCone.fov / 2 || d < 65) {
        return p;
      }
    }
    return null;
  }

  private alertNearbyNPCs(x: number, y: number, hearingRadius: number) {
    this.npcs.forEach((npc) => {
      if (npc.type === 'buster') return;
      const d = distance(npc.x, npc.y, x, y);
      if (d < hearingRadius && npc.state !== 'CHASING') {
        npc.state = 'INVESTIGATING';
        npc.suspicionTarget = { x, y };
        npc.shoutText = 'What was that racket?!';
        npc.shoutTimer = 2.0;
        audio.playGrumble();
      }
    });
  }

  // --- Particles & Floating Text ---
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y += ft.vy * dt;
      ft.scale = Math.max(0.8, ft.scale - dt * 0.2);
    }
  }

  public spawnFloatingText(text: string, x: number, y: number, color: string = '#fbbf24') {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      vx: 0,
      vy: -35,
      color,
      alpha: 1.0,
      scale: 1.25,
      maxLife: 1.2,
      life: 1.2,
    });
  }

  public spawnParticleBurst(
    x: number,
    y: number,
    type: Particle['type'],
    count: number,
    color: string
  ) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type,
        color,
        size: 5 + Math.random() * 7,
        alpha: 1.0,
        maxLife: 0.6 + Math.random() * 0.5,
        life: 0.6 + Math.random() * 0.5,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 8,
      });
    }
  }

  public addScore(points: number, textPopup?: string, x?: number, y?: number) {
    this.score += points;
    this.stats.totalChaosScore = this.score;

    if (textPopup && x !== undefined && y !== undefined) {
      this.spawnFloatingText(`+${points} ${textPopup}`, x, y - 25, '#fbbf24');
    }
    this.updateObjective('chaos_points', points);
  }

  private disturbPeace(amount: number) {
    this.peaceLevel = Math.max(0, this.peaceLevel - amount);
  }

  private updateWantedLevel(dt: number) {
    const chaos = (100 - this.peaceLevel) / 100;
    this.wantedStars = Math.min(5, Math.floor(chaos * 5) + 1);
    audio.setChaosLevel(chaos);

    if (this.peaceLevel < 100 && this.comboTimer <= 0) {
      this.peaceLevel = Math.min(100, this.peaceLevel + dt * 2.5);
    }
  }

  private updateObjective(objectiveId: string, amount: number) {
    const obj = this.currentLevelConfig.objectives.find((o) => o.id === objectiveId);
    if (obj && !obj.completed) {
      obj.current += amount;
      if (obj.current >= obj.target) {
        obj.current = obj.target;
        obj.completed = true;
        this.addScore(obj.points, 'OBJECTIVE COMPLETE!', this.p1.x, this.p1.y - 45);
        audio.playVictory();
        this.shaker.addTrauma(0.35);
        triggerHaptic(60);
      }
    }
  }

  private checkObjectives() {
    const nonBonusObjs = this.currentLevelConfig.objectives.filter((o) => !o.isBonus);
    const allDone = nonBonusObjs.every((o) => o.completed);

    if (allDone || this.score >= this.currentLevelConfig.targetScore) {
      this.triggerVictory();
    }
  }

  private unlockSecret(secretId: string) {
    const prog = loadProgress();
    if (!prog.discoveredSecrets.includes(secretId)) {
      prog.discoveredSecrets.push(secretId);
      saveProgress(prog);
      this.spawnFloatingText('SECRET DISCOVERED!', this.p1.x, this.p1.y - 50, '#38bdf8');
      audio.playVictory();
    }
  }

  private updateCamera(dt: number) {
    const targetX = (this.p1.x + this.p2.x) / 2;
    const targetY = (this.p1.y + this.p2.y) / 2;

    this.cameraX += (targetX - this.cameraX) * dt * 4.5;
    this.cameraY += (targetY - this.cameraY) * dt * 4.5;

    const dist = distance(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    const targetZoom = Math.max(0.75, Math.min(1.15, 1.2 - dist * 0.0007));
    this.cameraZoom += (targetZoom - this.cameraZoom) * dt * 3.0;
  }

  private triggerBusted(byWhom: string) {
    this.state = 'BUSTED';
    audio.stopMusic();
    audio.playBusted();
    triggerHaptic(100);
    this.saveGameSession(false);
    this.callbacks.onGameOver(this.stats, `Caught red-handed by ${byWhom}! Busted!`);
  }

  private triggerGameOver(reason: string) {
    this.state = 'BUSTED';
    audio.stopMusic();
    audio.playBusted();
    this.saveGameSession(false);
    this.callbacks.onGameOver(this.stats, reason);
  }

  private triggerVictory() {
    this.state = 'VICTORY';
    audio.stopMusic();
    audio.playVictory();
    triggerHaptic(80);

    // Calculate medal
    let medal: 'bronze' | 'silver' | 'gold' = 'bronze';
    if (this.score >= this.currentLevelConfig.targetScore * 1.5) medal = 'gold';
    else if (this.score >= this.currentLevelConfig.targetScore * 1.2) medal = 'silver';

    this.saveGameSession(true, medal);
    this.callbacks.onLevelComplete(this.stats, this.currentLevelIndex, medal);
  }

  private saveGameSession(won: boolean, medal?: 'bronze' | 'silver' | 'gold') {
    const prog = loadProgress();
    const curHighScore = prog.highScores[this.mode] || 0;
    if (this.score > curHighScore) {
      prog.highScores[this.mode] = this.score;
    }
    prog.totalPranks += this.stats.trashCansKicked + this.stats.doorbellsDitched + this.stats.flamingosFlung;

    if (won && medal) {
      prog.levelMedals[this.currentLevelIndex] = medal;

      // Unlock hats if requirements met
      if (this.score >= 3000 && !prog.unlockedHatsLeo.includes('detective_fedora')) {
        prog.unlockedHatsLeo.push('detective_fedora');
      }
      if (this.currentLevelIndex >= 2 && !prog.unlockedHatsLeo.includes('golden_crown')) {
        prog.unlockedHatsLeo.push('golden_crown');
      }
      if (prog.totalPranks >= 20 && !prog.unlockedHatsMilo.includes('viking_helmet')) {
        prog.unlockedHatsMilo.push('viking_helmet');
      }
    }

    saveProgress(prog);
  }

  // --- Rendering Pass ---
  public render() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    if (width === 0 || height === 0) return;

    // Check TP objective for Grand Oak streamers
    const tpObjective = this.currentLevelConfig.objectives.find((o) => o.id === 'tp_oak');
    const tpCount = tpObjective ? tpObjective.current : 0;

    // Execute 3D WebGL Rendering
    this.threeRenderer.render(
      this.p1,
      this.p2,
      this.npcs,
      this.props,
      this.particles,
      this.floatingTexts,
      this.mode,
      this.shaker,
      this.gameTime,
      tpCount
    );
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.threeRenderer.resize(width, height);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    audio.stopMusic();
    this.input.destroy();
    this.threeRenderer.destroy();
  }
}
