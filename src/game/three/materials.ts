import * as THREE from 'three';

/**
 * Creates and shares stylized low-poly PBR materials for the suburban cul-de-sac world.
 * Follows threejs guidelines: MeshStandardMaterial / MeshLambertMaterial with SRGB color space.
 */

// Procedural Canvas Texture for Road Markings (Yellow double center lines & white dash lines)
export function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base with subtle aggregate speckling
  ctx.fillStyle = '#272c35';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle asphalt grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    const rw = Math.random() * 3 + 1;
    ctx.fillRect(rx, ry, rw, rw);
  }

  // Yellow double center line
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(250, 0, 4, 512);
  ctx.fillRect(258, 0, 4, 512);

  // Outer white edge lines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(20, 0, 6, 512);
  ctx.fillRect(486, 0, 6, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Canvas Texture for Sidewalk Concrete
export function createSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 256, 256);

  // Expansion joints / slab lines
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 248);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Canvas Texture for Grass with Subtle Color Variations
export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3f7c32';
  ctx.fillRect(0, 0, 256, 256);

  // Stylized lawn blades
  ctx.fillStyle = '#4f9b3c';
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 3, 3);
  }

  ctx.fillStyle = '#2f6026';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(20, 20);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Graffiti Decal Texture when cars get tagged
export function createGraffitiTexture(tagType: string = 'CHAOS'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 512, 256);

  ctx.save();
  ctx.translate(256, 128);
  ctx.rotate(-0.08);

  // Outer neon spray glow
  ctx.font = 'bold 72px "Impact", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.lineWidth = 14;
  ctx.strokeStyle = '#ec4899'; // Hot pink spray border
  ctx.strokeText(tagType, 0, 0);

  ctx.fillStyle = '#fde047'; // Bright neon yellow fill
  ctx.fillText(tagType, 0, 0);

  // Drip marks
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(-80, 48, 8, 0, Math.PI * 2);
  ctx.arc(-20, 55, 6, 0, Math.PI * 2);
  ctx.arc(60, 50, 7, 0, Math.PI * 2);
  ctx.arc(120, 45, 9, 0, Math.PI * 2);
  ctx.fill();

  // Drip streaks
  ctx.fillRect(-82, 35, 4, 15);
  ctx.fillRect(-22, 35, 4, 20);
  ctx.fillRect(58, 35, 4, 16);
  ctx.fillRect(118, 35, 4, 12);

  // Flame doodles or crown on top
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('👑 DOUBLE TROUBLE 💥', 0, -56);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Rich Street Art Mural Texture for Mansion Boundary Walls
export function createGraffitiWallTexture(tagText: string = 'CHAOS CITY'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Stucco background
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 512, 256);

  // Splatter dots
  const splashColors = ['#ec4899', '#06b6d4', '#eab308', '#a855f7', '#10b981'];
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = splashColors[i % splashColors.length];
    const sx = Math.random() * 512;
    const sy = Math.random() * 256;
    const sr = Math.random() * 8 + 2;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(256, 130);
  ctx.rotate(-0.05);

  // Bubble 3D Drop Shadow
  ctx.font = '900 68px "Impact", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#0f172a';
  ctx.fillText(tagText, 6, 6);

  // Neon gradient outline
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#f43f5e';
  ctx.strokeText(tagText, 0, 0);

  ctx.fillStyle = '#facc15';
  ctx.fillText(tagText, 0, 0);

  // Big drips
  ctx.fillStyle = '#f43f5e';
  for (let d = -180; d <= 180; d += 60) {
    ctx.beginPath();
    ctx.arc(d, 40, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(d - 3, 20, 6, 32);
  }

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('⚡ LEO + MILO WUZ HERE ⚡', 0, -56);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Cartoon Character Face Decals (Expressive eyes, eyebrows, smiles & scowls)
export function createCharacterFaceTexture(type: 'leo' | 'milo' | 'henderson' | 'gable' | 'higgins' | 'guard' | 'rival'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);

  if (type === 'leo') {
    // Confident mischievous eyes & cocky grin
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(85, 110, 28, 36, -0.05, 0, Math.PI * 2);
    ctx.ellipse(171, 110, 28, 36, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Blue iris
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(88, 110, 16, 0, Math.PI * 2);
    ctx.arc(168, 110, 16, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(90, 110, 9, 0, Math.PI * 2);
    ctx.arc(166, 110, 9, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(86, 104, 4, 0, Math.PI * 2);
    ctx.arc(162, 104, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(55, 75);
    ctx.lineTo(110, 68);
    ctx.moveTo(146, 68);
    ctx.lineTo(201, 80);
    ctx.stroke();

    // Cheeky asymmetric grin
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(75, 180);
    ctx.quadraticCurveTo(128, 225, 185, 175);
    ctx.quadraticCurveTo(128, 190, 75, 180);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(85, 182);
    ctx.quadraticCurveTo(128, 195, 175, 178);
    ctx.quadraticCurveTo(128, 185, 85, 182);
    ctx.fill();
  } else if (type === 'milo') {
    // Big curious cartoon eyes & happy smile
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(80, 115, 32, 36, 0, 0, Math.PI * 2);
    ctx.ellipse(176, 115, 32, 36, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(80, 115, 18, 0, Math.PI * 2);
    ctx.arc(176, 115, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(80, 115, 10, 0, Math.PI * 2);
    ctx.arc(176, 115, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(76, 108, 5, 0, Math.PI * 2);
    ctx.arc(172, 108, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(80, 85, 26, Math.PI * 1.1, Math.PI * 1.9);
    ctx.arc(176, 85, 26, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();

    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(128, 175, 28, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  } else if (type === 'henderson') {
    // Furious scowling eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(85, 120, 22, 18, -0.1, 0, Math.PI * 2);
    ctx.ellipse(171, 120, 22, 18, 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.arc(85, 120, 9, 0, Math.PI * 2);
    ctx.arc(171, 120, 9, 0, Math.PI * 2);
    ctx.fill();

    // Angry bushy eyebrows
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(50, 75);
    ctx.lineTo(115, 105);
    ctx.moveTo(206, 75);
    ctx.lineTo(141, 105);
    ctx.stroke();

    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(128, 220, 32, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  } else if (type === 'guard') {
    // Aviator sunglasses & stern jaw
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(50, 95, 65, 35, [4, 4, 12, 12]);
    ctx.roundRect(141, 95, 65, 35, [4, 4, 12, 12]);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 102);
    ctx.lineTo(75, 122);
    ctx.moveTo(150, 102);
    ctx.lineTo(165, 122);
    ctx.stroke();

    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(95, 190);
    ctx.lineTo(161, 190);
    ctx.stroke();
  } else if (type === 'rival') {
    // Sneering rival eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(85, 110, 24, 30, 0.1, 0, Math.PI * 2);
    ctx.ellipse(171, 110, 24, 30, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(88, 110, 13, 0, Math.PI * 2);
    ctx.arc(168, 110, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(90, 110, 7, 0, Math.PI * 2);
    ctx.arc(166, 110, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(55, 80);
    ctx.lineTo(105, 65);
    ctx.moveTo(151, 65);
    ctx.lineTo(201, 80);
    ctx.stroke();

    ctx.strokeStyle = '#701a75';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(85, 185);
    ctx.quadraticCurveTo(130, 210, 185, 165);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class MaterialPalette {
  public road: THREE.MeshStandardMaterial;
  public sidewalk: THREE.MeshStandardMaterial;
  public curb: THREE.MeshStandardMaterial;
  public grass: THREE.MeshStandardMaterial;
  public darkGrass: THREE.MeshStandardMaterial;
  public woodFence: THREE.MeshStandardMaterial;
  public brickWall: THREE.MeshStandardMaterial;
  public hedge: THREE.MeshStandardMaterial;
  public asphaltCourt: THREE.MeshStandardMaterial;
  public water: THREE.MeshStandardMaterial;
  public windowLit: THREE.MeshStandardMaterial;
  public windowDark: THREE.MeshStandardMaterial;
  public lamppost: THREE.MeshStandardMaterial;
  public lampGlow: THREE.MeshBasicMaterial;
  public treeTrunk: THREE.MeshStandardMaterial;
  public treeLeaves: THREE.MeshStandardMaterial;
  public treeLeavesAutumn: THREE.MeshStandardMaterial;
  public trashMetal: THREE.MeshStandardMaterial;
  public trashPlastic: THREE.MeshStandardMaterial;
  public sprinklerBrass: THREE.MeshStandardMaterial;
  public flamingoPink: THREE.MeshStandardMaterial;
  public gnomeRed: THREE.MeshStandardMaterial;
  public carTire: THREE.MeshStandardMaterial;
  public carGlass: THREE.MeshStandardMaterial;
  public carChrome: THREE.MeshStandardMaterial;
  public carHeadlightOff: THREE.MeshStandardMaterial;
  public carHeadlightOn: THREE.MeshBasicMaterial;
  public shadowDisc: THREE.MeshBasicMaterial;
  // Mansion, Guard & Pets Materials
  public mansionMarble: THREE.MeshStandardMaterial;
  public mansionStucco: THREE.MeshStandardMaterial;
  public goldRail: THREE.MeshStandardMaterial;
  public poolWater: THREE.MeshStandardMaterial;
  public tennisGreen: THREE.MeshStandardMaterial;
  public flashlightCone: THREE.MeshBasicMaterial;
  public guardNavy: THREE.MeshStandardMaterial;
  public dogFurTan: THREE.MeshStandardMaterial;
  public dogFurBlack: THREE.MeshStandardMaterial;
  public catCalico: THREE.MeshStandardMaterial;
  public sausageMeat: THREE.MeshStandardMaterial;
  public fireworkGold: THREE.MeshStandardMaterial;

  constructor() {
    this.road = new THREE.MeshStandardMaterial({
      map: createRoadTexture(),
      roughness: 0.85,
      metalness: 0.1,
    });

    this.sidewalk = new THREE.MeshStandardMaterial({
      map: createSidewalkTexture(),
      roughness: 0.8,
      metalness: 0.05,
    });

    this.curb = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.7,
    });

    this.grass = new THREE.MeshStandardMaterial({
      map: createGrassTexture(),
      roughness: 0.9,
      metalness: 0.0,
    });

    this.darkGrass = new THREE.MeshStandardMaterial({
      color: 0x275924,
      roughness: 0.9,
    });

    this.woodFence = new THREE.MeshStandardMaterial({
      color: 0xfaf5ef,
      roughness: 0.65,
    });

    this.brickWall = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.85,
    });

    this.hedge = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.9,
      flatShading: true,
    });

    this.asphaltCourt = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
    });

    this.water = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.3,
      transparent: true,
      opacity: 0.88,
    });

    this.windowLit = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.75,
      roughness: 0.2,
    });

    this.windowDark = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.5,
    });

    this.lamppost = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.7,
    });

    this.lampGlow = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    });

    this.treeTrunk = new THREE.MeshStandardMaterial({
      color: 0x5c3d2e,
      roughness: 0.9,
      flatShading: true,
    });

    this.treeLeaves = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.8,
      flatShading: true,
    });

    this.trashMetal = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.4,
      metalness: 0.6,
    });

    this.trashPlastic = new THREE.MeshStandardMaterial({
      color: 0x059669,
      roughness: 0.5,
    });

    this.sprinklerBrass = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.8,
    });

    this.flamingoPink = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.4,
      flatShading: true,
    });

    this.gnomeRed = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.5,
    });

    this.carTire = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
    });

    this.carGlass = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    this.carChrome = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.15,
      metalness: 0.9,
    });

    this.treeLeavesAutumn = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.8,
      flatShading: true,
    });

    this.carHeadlightOff = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.2,
    });

    this.carHeadlightOn = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    });

    // Ground contact shadow blob
    this.shadowDisc = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });

    // Mansion Materials
    this.mansionMarble = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.1,
    });

    this.mansionStucco = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.85,
    });

    this.goldRail = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.85,
    });

    this.poolWater = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.82,
    });

    this.tennisGreen = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.85,
    });

    this.flashlightCone = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    this.guardNavy = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.5,
    });

    this.dogFurTan = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.7,
      flatShading: true,
    });

    this.dogFurBlack = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.6,
      flatShading: true,
    });

    this.catCalico = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.65,
      flatShading: true,
    });

    this.sausageMeat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.35,
    });

    this.fireworkGold = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      roughness: 0.3,
      metalness: 0.6,
    });
  }

  // Create custom color car material
  public getCarPaint(colorHex: string | number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: typeof colorHex === 'string' ? new THREE.Color(colorHex) : colorHex,
      roughness: 0.25,
      metalness: 0.55,
    });
  }

  // Create custom house siding material
  public getHouseSiding(colorHex: string | number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: typeof colorHex === 'string' ? new THREE.Color(colorHex) : colorHex,
      roughness: 0.7,
      metalness: 0.05,
    });
  }

  // Create custom house roof material
  public getHouseRoof(colorHex: string | number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: typeof colorHex === 'string' ? new THREE.Color(colorHex) : colorHex,
      roughness: 0.65,
      flatShading: true,
    });
  }

  public dispose() {
    this.road.dispose();
    this.sidewalk.dispose();
    this.curb.dispose();
    this.grass.dispose();
    this.darkGrass.dispose();
    this.woodFence.dispose();
    this.brickWall.dispose();
    this.hedge.dispose();
    this.asphaltCourt.dispose();
    this.water.dispose();
    this.windowLit.dispose();
    this.windowDark.dispose();
    this.lamppost.dispose();
    this.lampGlow.dispose();
    this.treeTrunk.dispose();
    this.treeLeaves.dispose();
    this.treeLeavesAutumn.dispose();
    this.trashMetal.dispose();
    this.trashPlastic.dispose();
    this.sprinklerBrass.dispose();
    this.flamingoPink.dispose();
    this.gnomeRed.dispose();
    this.carTire.dispose();
    this.carGlass.dispose();
    this.carChrome.dispose();
    this.carHeadlightOff.dispose();
    this.carHeadlightOn.dispose();
    this.shadowDisc.dispose();
    this.mansionMarble.dispose();
    this.mansionStucco.dispose();
    this.goldRail.dispose();
    this.poolWater.dispose();
    this.tennisGreen.dispose();
    this.flashlightCone.dispose();
    this.guardNavy.dispose();
    this.dogFurTan.dispose();
    this.dogFurBlack.dispose();
    this.catCalico.dispose();
    this.sausageMeat.dispose();
    this.fireworkGold.dispose();
  }
}
