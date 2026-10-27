/**
 * Canvas Rendering for Players, Props, NPCs, Particles, and Suburban Environment
 */

import { Player, Prop, NPC, Particle } from './types';
import { House, WallSegment, MAP_WIDTH, MAP_HEIGHT } from './map';

export function renderEnvironment(
  ctx: CanvasRenderingContext2D,
  houses: House[],
  walls: WallSegment[],
  cameraX: number,
  cameraY: number,
  viewportW: number,
  viewportH: number,
  gameTime: number
) {
  // 1. Base Grassy Lawn with alternating mowed stripes
  ctx.fillStyle = '#357a40';
  ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Striped lawn pattern (classic manicured suburban lawns)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  for (let y = 0; y < MAP_HEIGHT; y += 40) {
    if ((y / 40) % 2 === 0) {
      ctx.fillRect(0, y, MAP_WIDTH, 20);
    }
  }

  // Soft clover / flower patches
  ctx.fillStyle = '#2f6c38';
  for (let x = 120; x < MAP_WIDTH; x += 360) {
    for (let y = 120; y < MAP_HEIGHT; y += 360) {
      ctx.beginPath();
      ctx.arc(x + 50, y + 40, 65, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Main Asphalt Roads & Cul-de-Sac Roundabout (Expanded 3200 x 2200 World)
  const centerX = 1600;
  const centerY = 1100;
  const outerRoadRadius = 450;
  const innerIslandRadius = 210;
  const roadWidth = 240;

  // --- Outer road curb (concrete grey) ---
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRoadRadius + 16, 0, Math.PI * 2);
  ctx.fill();

  // Straight street to South Highway Exit
  ctx.fillRect(centerX - (roadWidth / 2 + 16), centerY, roadWidth + 32, MAP_HEIGHT - centerY);

  // West Suburban Lane
  ctx.fillRect(0, centerY - (roadWidth / 2 + 16), centerX, roadWidth + 32);

  // East Park Boulevard
  ctx.fillRect(centerX, centerY - (roadWidth / 2 + 16), MAP_WIDTH - centerX, roadWidth + 32);

  // --- Asphalt surface ---
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRoadRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(centerX - roadWidth / 2, centerY, roadWidth, MAP_HEIGHT - centerY);
  ctx.fillRect(0, centerY - roadWidth / 2, centerX, roadWidth);
  ctx.fillRect(centerX, centerY - roadWidth / 2, MAP_WIDTH - centerX, roadWidth);

  // --- Road Markings: Yellow Double Center Lines ---
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 4;
  ctx.setLineDash([24, 18]);

  // South road markings
  ctx.beginPath();
  ctx.moveTo(centerX - 3, centerY + outerRoadRadius - 30);
  ctx.lineTo(centerX - 3, MAP_HEIGHT - 60);
  ctx.stroke();

  // West road markings
  ctx.beginPath();
  ctx.moveTo(60, centerY);
  ctx.lineTo(centerX - outerRoadRadius + 30, centerY);
  ctx.stroke();

  // East road markings
  ctx.beginPath();
  ctx.moveTo(centerX + outerRoadRadius - 30, centerY);
  ctx.lineTo(MAP_WIDTH - 60, centerY);
  ctx.stroke();

  // --- Crosswalks ---
  ctx.setLineDash([]);
  ctx.fillStyle = '#f8fafc';
  // South crosswalk
  for (let cy = MAP_HEIGHT - 220; cy <= MAP_HEIGHT - 170; cy += 14) {
    ctx.fillRect(centerX - 105, cy, 210, 7);
  }
  // West crosswalk near roundabout
  for (let cx = centerX - outerRoadRadius - 70; cx <= centerX - outerRoadRadius - 20; cx += 14) {
    ctx.fillRect(cx, centerY - 105, 7, 210);
  }
  // East crosswalk near roundabout
  for (let cx = centerX + outerRoadRadius + 20; cx <= centerX + outerRoadRadius + 70; cx += 14) {
    ctx.fillRect(cx, centerY - 105, 7, 210);
  }

  // --- Inner Grassy Roundabout Island & Grand Tiered Fountain ---
  ctx.fillStyle = '#64748b'; // Curb
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerIslandRadius + 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2d6a36'; // Lawn
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerIslandRadius, 0, Math.PI * 2);
  ctx.fill();

  // Flower bed ring
  ctx.fillStyle = '#ec4899';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const fx = centerX + Math.cos(a) * (innerIslandRadius - 25);
    const fy = centerY + Math.sin(a) * (innerIslandRadius - 25);
    ctx.beginPath();
    ctx.arc(fx, fy, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stone Fountain Base
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 68, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Pool Water
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 56, 0, Math.PI * 2);
  ctx.fill();

  // Tier 2 Center Stone Pillar
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 16, 0, Math.PI * 2);
  ctx.fill();

  // Animated Water fountain spray rings
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 22 + (Math.sin(gameTime * 3) + 1) * 14, 0, Math.PI * 2);
  ctx.stroke();

  // --- 3. Special Landmarks Rendering ---

  // A. Serene Duck Pond (x: 2600, y: 520, radius: 150)
  const pondX = 2600;
  const pondY = 520;
  // Pond stone rim
  ctx.fillStyle = '#78716c';
  ctx.beginPath();
  ctx.ellipse(pondX, pondY, 175, 125, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Deep pond water
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.ellipse(pondX, pondY, 160, 110, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Water ripples
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(pondX, pondY, 90 + Math.sin(gameTime * 2) * 12, 60 + Math.sin(gameTime * 2) * 8, 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // Lily pads
  const padCoords = [
    { x: pondX - 60, y: pondY - 30 },
    { x: pondX + 70, y: pondY + 25 },
    { x: pondX - 20, y: pondY + 50 },
  ];
  padCoords.forEach((p, idx) => {
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 14, 0.2, Math.PI * 1.85);
    ctx.fill();
    // Lotus flower on one
    if (idx === 0) {
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Swimming Yellow Ducks with Bobbing Animation
  const duck1Angle = gameTime * 0.4;
  const d1X = pondX + Math.cos(duck1Angle) * 75;
  const d1Y = pondY + Math.sin(duck1Angle) * 45;
  // Duck body
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.ellipse(d1X, d1Y, 11, 7, duck1Angle + Math.PI / 2, 0, Math.PI * 2);
  ctx.fill();
  // Duck head
  const headAngle = duck1Angle + Math.PI / 2;
  const dhX = d1X + Math.cos(headAngle) * 9;
  const dhY = d1Y + Math.sin(headAngle) * 9;
  ctx.beginPath();
  ctx.arc(dhX, dhY, 5, 0, Math.PI * 2);
  ctx.fill();
  // Duck orange beak
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(dhX + Math.cos(headAngle) * 4, dhY + Math.sin(headAngle) * 4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Duck 2 (Duckling trailing behind)
  const duck2Angle = duck1Angle - 0.35;
  const d2X = pondX + Math.cos(duck2Angle) * 65;
  const d2Y = pondY + Math.sin(duck2Angle) * 40;
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(d2X, d2Y, 5, 0, Math.PI * 2);
  ctx.fill();

  // B. Neighborhood Basketball Court (x: 650, y: 1680)
  const courtX = 520;
  const courtY = 1570;
  const courtW = 260;
  const courtH = 210;
  // Court Border
  ctx.fillStyle = '#64748b';
  ctx.fillRect(courtX - 6, courtY - 6, courtW + 12, courtH + 12);
  // Court Pavement (Terracotta & Forest Green)
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(courtX, courtY, courtW, courtH);
  ctx.fillStyle = '#15803d'; // Key paint
  ctx.fillRect(courtX + courtW - 90, courtY + 45, 90, 120);

  // White Court Markings
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 3;
  ctx.strokeRect(courtX + 10, courtY + 10, courtW - 20, courtH - 20);
  // Center free-throw circle
  ctx.beginPath();
  ctx.arc(courtX + courtW - 90, courtY + courtH / 2, 45, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  // 3-Point Line
  ctx.beginPath();
  ctx.arc(courtX + courtW - 10, courtY + courtH / 2, 130, Math.PI * 0.65, Math.PI * 1.35);
  ctx.stroke();

  // Basketball Hoop Backboard & Rim
  const hoopX = courtX + courtW - 8;
  const hoopY = courtY + courtH / 2;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(hoopX - 4, hoopY - 26, 6, 52);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.strokeRect(hoopX - 4, hoopY - 26, 6, 52);
  // Orange Rim
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(hoopX - 16, hoopY, 12, 0, Math.PI * 2);
  ctx.stroke();
  // Net
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(hoopX - 22, hoopY - 8, 12, 16);

  // C. Garden Gazebo (x: 2550, y: 880)
  const gzX = 2550;
  const gzY = 880;
  // Wooden Deck
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(gzX, gzY, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Roof Shingles
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(gzX, gzY, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0369a1';
  ctx.beginPath();
  ctx.arc(gzX, gzY, 20, 0, Math.PI * 2);
  ctx.fill();
  // White columns
  ctx.fillStyle = '#f8fafc';
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    ctx.beginPath();
    ctx.arc(gzX + Math.cos(a) * 36, gzY + Math.sin(a) * 36, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 4. Sidewalks & Driveways to Houses ---
  ctx.fillStyle = '#cbd5e1';
  houses.forEach((h) => {
    // Driveway to house
    const dwX = h.x + h.width * 0.65;
    const isNorth = h.y < centerY;
    const dwY = isNorth ? h.y + h.height : centerY + roadWidth / 2;
    const dwH = isNorth ? (centerY - roadWidth / 2) - (h.y + h.height) : (h.y) - (centerY + roadWidth / 2);
    if (dwH > 0) {
      ctx.fillRect(dwX - 30, isNorth ? h.y + h.height : centerY + roadWidth / 2, 60, dwH);
    }

    // Front Walkway to door
    ctx.fillRect(h.doorbellX - 14, h.doorbellY - 5, 28, isNorth ? 85 : 45);
  });

  // Streetlamps along road curbs with warm soft glow circles
  const lampPositions = [
    { x: centerX - outerRoadRadius + 20, y: centerY - roadWidth / 2 - 20 },
    { x: centerX + outerRoadRadius - 20, y: centerY - roadWidth / 2 - 20 },
    { x: centerX - roadWidth / 2 - 20, y: centerY + outerRoadRadius + 40 },
    { x: centerX + roadWidth / 2 + 20, y: centerY + outerRoadRadius + 40 },
    { x: 450, y: centerY - roadWidth / 2 - 20 },
    { x: 2750, y: centerY + roadWidth / 2 + 20 },
  ];
  lampPositions.forEach((lp) => {
    // Warm translucent light pool on grass/road
    ctx.fillStyle = 'rgba(253, 224, 71, 0.08)';
    ctx.beginPath();
    ctx.arc(lp.x, lp.y, 65, 0, Math.PI * 2);
    ctx.fill();

    // Black Lamp Post
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(lp.x, lp.y, 6, 0, Math.PI * 2);
    ctx.fill();
    // Yellow glowing bulb
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lp.x, lp.y - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Render Houses
  houses.forEach((h) => {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(h.x + 8, h.y + 8, h.width, h.height);

    // House Main Wall Body
    ctx.fillStyle = h.color;
    ctx.fillRect(h.x, h.y, h.width, h.height);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(h.x, h.y, h.width, h.height);

    // Roof Top Section
    ctx.fillStyle = h.roofColor;
    ctx.beginPath();
    ctx.moveTo(h.x - 12, h.y + 70);
    ctx.lineTo(h.x + h.width / 2, h.y - 20);
    ctx.lineTo(h.x + h.width + 12, h.y + 70);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Windows
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(h.x + 35, h.y + 100, 48, 50);
    ctx.fillRect(h.x + h.width - 83, h.y + 100, 48, 50);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(h.x + 35, h.y + 100, 48, 50);
    ctx.strokeRect(h.x + h.width - 83, h.y + 100, 48, 50);

    // Front Door
    ctx.fillStyle = '#78350f';
    const doorW = 40;
    const doorH = 65;
    const doorX = h.doorbellX - doorW / 2;
    const doorY = h.y + h.height - doorH;
    ctx.fillRect(doorX, doorY, doorW, doorH);

    // Door knob
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(doorX + 8, doorY + doorH * 0.55, 4, 0, Math.PI * 2);
    ctx.fill();

    // Doorbell Button on doorframe
    ctx.fillStyle = h.doorbellCooldown > 0 ? '#ef4444' : '#22c55e';
    ctx.beginPath();
    ctx.arc(h.doorbellX + 26, doorY + 30, 5, 0, Math.PI * 2);
    ctx.fill();

    // Welcome Mat
    ctx.fillStyle = '#b45309';
    ctx.fillRect(doorX - 6, h.y + h.height + 2, doorW + 12, 14);

    // Address Plaque
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(h.address, h.x + h.width / 2, h.y + 90);
  });

  // 4. Render Walls & Fences
  walls.forEach((w) => {
    ctx.beginPath();
    ctx.moveTo(w.x1, w.y1);
    ctx.lineTo(w.x2, w.y2);

    if (w.type === 'brick') {
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 14;
      ctx.lineCap = 'square';
      ctx.stroke();

      ctx.strokeStyle = '#fca5a5';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (w.type === 'fence') {
      // White Picket Fence
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Pickets cross strokes
      const dx = w.x2 - w.x1;
      const dy = w.y2 - w.y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(length / 16);
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i <= steps; i++) {
        const px = w.x1 + (dx / length) * (i * 16);
        const py = w.y1 + (dy / length) * (i * 16);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (w.type === 'hedge') {
      // Lush green hedge
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 20;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 10;
      ctx.stroke();
    }
  });
}

export function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  gameTime: number
) {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Squash and stretch
  ctx.scale(player.squashStretch.sx, player.squashStretch.sy);

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, player.radius + 2, player.radius * 1.1, player.radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // If player is hidden in bush, draw playful stealth eyes
  if (player.isHidden) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6, -4, 5, 0, Math.PI * 2);
    ctx.arc(6, -4, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-5 + Math.cos(player.facing) * 2, -4 + Math.sin(player.facing) * 2, 2.5, 0, Math.PI * 2);
    ctx.arc(7 + Math.cos(player.facing) * 2, -4 + Math.sin(player.facing) * 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Stealth icon above
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN', 0, -22);
    ctx.restore();
    return;
  }

  // Walk bob animation
  const walkBob = player.isMoving ? Math.sin(player.walkFrame * 8) * 3 : 0;
  const legSwing = player.isMoving ? Math.sin(player.walkFrame * 8) * 6 : 0;

  // Legs / Sneakers
  ctx.fillStyle = '#1e293b'; // Pants
  ctx.fillRect(-8, 6, 6, 12 + (player.isMoving ? legSwing : 0));
  ctx.fillRect(2, 6, 6, 12 - (player.isMoving ? legSwing : 0));

  ctx.fillStyle = '#ffffff'; // Sneakers
  ctx.fillRect(-9, 16 + (player.isMoving ? legSwing : 0), 8, 5);
  ctx.fillRect(1, 16 - (player.isMoving ? legSwing : 0), 8, 5);

  // Body / Torso
  ctx.fillStyle = player.jacketColor;
  ctx.beginPath();
  ctx.roundRect(-12, -10 + walkBob, 24, 20, 6);
  ctx.fill();

  // Zipper or hoodie cord
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -8 + walkBob);
  ctx.lineTo(0, 8 + walkBob);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#fed7aa'; // Skin
  ctx.beginPath();
  ctx.arc(0, -18 + walkBob, 11, 0, Math.PI * 2);
  ctx.fill();

  // Mega Kick Aura if active
  if (player.megaKickTimer > 0) {
    ctx.strokeStyle = Math.sin(gameTime * 25) > 0 ? '#f59e0b' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -5 + walkBob, player.radius * 1.3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillText('⚡MEGA⚡', 0, -38 + walkBob);
  }

  // Cap / Hat / Costume
  const hat = player.selectedHat || (player.id === 'leo' ? 'classic_cap' : 'beanie');

  if (hat === 'classic_cap') {
    ctx.fillStyle = player.capColor;
    ctx.beginPath();
    ctx.arc(0, -21 + walkBob, 11, Math.PI, 0, false);
    ctx.fill();
    ctx.fillRect(-14, -22 + walkBob, 8, 4); // Visor
  } else if (hat === 'pirate_bandana') {
    ctx.fillStyle = '#1e1b4b'; // Deep pirate indigo
    ctx.beginPath();
    ctx.arc(0, -21 + walkBob, 12, Math.PI, 0, false);
    ctx.fill();
    // Skull or cross tie
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-14, -18 + walkBob, 6, 6);
  } else if (hat === 'detective_fedora') {
    ctx.fillStyle = '#78350f'; // Brown felt fedora
    ctx.beginPath();
    ctx.ellipse(0, -21 + walkBob, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-8, -29 + walkBob, 16, 10);
    ctx.fillStyle = '#1e293b'; // Band
    ctx.fillRect(-8, -23 + walkBob, 16, 3);
  } else if (hat === 'golden_crown') {
    ctx.fillStyle = '#eab308'; // Gold crown
    ctx.beginPath();
    ctx.moveTo(-11, -20 + walkBob);
    ctx.lineTo(-11, -32 + walkBob);
    ctx.lineTo(-5, -26 + walkBob);
    ctx.lineTo(0, -34 + walkBob);
    ctx.lineTo(5, -26 + walkBob);
    ctx.lineTo(11, -32 + walkBob);
    ctx.lineTo(11, -20 + walkBob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#dc2626'; // Ruby gem
    ctx.beginPath();
    ctx.arc(0, -26 + walkBob, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (hat === 'viking_helmet') {
    ctx.fillStyle = '#64748b'; // Iron dome
    ctx.beginPath();
    ctx.arc(0, -20 + walkBob, 12, Math.PI, 0, false);
    ctx.fill();
    // Horns
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-10, -22 + walkBob);
    ctx.quadraticCurveTo(-18, -32 + walkBob, -14, -36 + walkBob);
    ctx.quadraticCurveTo(-12, -26 + walkBob, -8, -20 + walkBob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, -22 + walkBob);
    ctx.quadraticCurveTo(18, -32 + walkBob, 14, -36 + walkBob);
    ctx.quadraticCurveTo(12, -26 + walkBob, 8, -20 + walkBob);
    ctx.fill();
  } else if (hat === 'chef_toque') {
    ctx.fillStyle = '#ffffff'; // Puffy chef hat
    ctx.fillRect(-8, -24 + walkBob, 16, 6);
    ctx.beginPath();
    ctx.arc(-5, -30 + walkBob, 7, 0, Math.PI * 2);
    ctx.arc(5, -30 + walkBob, 7, 0, Math.PI * 2);
    ctx.arc(0, -34 + walkBob, 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Default Milo Beanie
    ctx.fillStyle = player.capColor;
    ctx.beginPath();
    ctx.arc(0, -20 + walkBob, 12, Math.PI, 0, false);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -28 + walkBob, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Face details (Eyes & Smile)
  const eyeDx = Math.cos(player.facing) * 4;
  const eyeDy = Math.sin(player.facing) * 3;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-4 + eyeDx, -18 + walkBob + eyeDy, 1.8, 0, Math.PI * 2);
  ctx.arc(4 + eyeDx, -18 + walkBob + eyeDy, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Cheeky smirk
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(eyeDx, -14 + walkBob + eyeDy, 3.5, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Held item overhead
  if (player.heldItem === 'flamingo') {
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, -38 + walkBob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(6, -39 + walkBob, 8, 3);
  } else if (player.heldItem === 'gnome') {
    ctx.fillStyle = '#ef4444'; // Red cone hat
    ctx.beginPath();
    ctx.moveTo(0, -44 + walkBob);
    ctx.lineTo(-7, -32 + walkBob);
    ctx.lineTo(7, -32 + walkBob);
    ctx.closePath();
    ctx.fill();
  }

  // Spray can in hand if spraying
  if (player.isSpraying) {
    ctx.save();
    const sprayAngle = player.facing;
    const canX = Math.cos(sprayAngle) * 14;
    const canY = Math.sin(sprayAngle) * 14 - 4 + walkBob;

    // Aerosol spray can
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(canX - 4, canY - 8, 8, 14);
    ctx.fillStyle = '#ec4899'; // Hot pink cap
    ctx.fillRect(canX - 3, canY - 12, 6, 4);

    // Aerosol mist cone
    const mistLen = 32 + Math.sin(gameTime * 30) * 8;
    const mistAngle = sprayAngle;
    ctx.fillStyle = 'rgba(236, 72, 153, 0.45)';
    ctx.beginPath();
    ctx.moveTo(canX, canY - 10);
    ctx.lineTo(
      canX + Math.cos(mistAngle - 0.4) * mistLen,
      canY - 10 + Math.sin(mistAngle - 0.4) * mistLen
    );
    ctx.lineTo(
      canX + Math.cos(mistAngle + 0.4) * mistLen,
      canY - 10 + Math.sin(mistAngle + 0.4) * mistLen
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Lookout radar badge overhead if player is acting as lookout
  if (player.isLookout) {
    const pulse = (Math.sin(gameTime * 10) + 1) * 3;
    ctx.save();
    ctx.translate(0, -56 + walkBob);

    // Pulsing warning radar circle
    ctx.fillStyle = 'rgba(234, 179, 8, 0.22)';
    ctx.beginPath();
    ctx.arc(0, 0, 16 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // High-visibility badge
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-40, -11, 80, 22, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 10px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#facc15';
    ctx.fillText('👀 LOOKOUT', 0, 4);
    ctx.restore();
  }

  // Name banner over head
  ctx.font = 'bold 11px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeText(player.name, 0, -30 + walkBob);
  ctx.fillText(player.name, 0, -30 + walkBob);

  // Companion Shout Speech Bubble
  if (player.shoutTimer && player.shoutTimer > 0 && player.shoutText) {
    ctx.font = 'bold 11px Bricolage Grotesque, Outfit, sans-serif';
    const textWidth = ctx.measureText(player.shoutText).width;
    const boxW = textWidth + 14;
    const boxH = 20;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -62 + walkBob, boxW, boxH, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.fillText(player.shoutText, 0, -48 + walkBob);
  }

  ctx.restore();
}

export function renderProp(ctx: CanvasRenderingContext2D, prop: Prop, gameTime: number) {
  ctx.save();
  ctx.translate(prop.x, prop.y);
  ctx.rotate(prop.rotation);

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, prop.height * 0.45, prop.width * 0.55, prop.height * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (prop.type) {
    case 'trash_can': {
      const isKnocked = prop.state === 'knocked';
      ctx.fillStyle = isKnocked ? '#94a3b8' : '#cbd5e1';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;

      // Trash can cylinder
      ctx.beginPath();
      ctx.roundRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height, 4);
      ctx.fill();
      ctx.stroke();

      // Ribbed lines
      ctx.beginPath();
      ctx.moveTo(-prop.width / 2 + 4, -4);
      ctx.lineTo(prop.width / 2 - 4, -4);
      ctx.moveTo(-prop.width / 2 + 4, 4);
      ctx.lineTo(prop.width / 2 - 4, 4);
      ctx.stroke();

      // Spilled trash if knocked
      if (isKnocked) {
        // Banana peel
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(16, 8, 5, 0, Math.PI * 1.5);
        ctx.fill();

        // Soda can
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(18, -10, 8, 12);
      }
      break;
    }

    case 'recycle_bin': {
      ctx.fillStyle = prop.state === 'knocked' ? '#2563eb' : '#3b82f6';
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height, 5);
      ctx.fill();
      ctx.stroke();

      // Recycle arrow logo
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♻', 0, 4);
      break;
    }

    case 'dumpster': {
      ctx.fillStyle = '#1e3a1e';
      ctx.strokeStyle = '#0f2910';
      ctx.lineWidth = 3;
      ctx.fillRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height);
      ctx.strokeRect(-prop.width / 2, -prop.height / 2, prop.width, prop.height);

      // Warning stripes on rim
      ctx.fillStyle = '#eab308';
      for (let i = -prop.width / 2 + 6; i < prop.width / 2 - 6; i += 16) {
        ctx.fillRect(i, -prop.height / 2, 8, 6);
      }
      break;
    }

    case 'flamingo': {
      // Wire legs
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-2, 0);
      ctx.lineTo(-2, 12);
      ctx.moveTo(3, 0);
      ctx.lineTo(3, 12);
      ctx.stroke();

      // Pink Body
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(0, -2, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck & Head
      ctx.beginPath();
      ctx.moveTo(-5, -4);
      ctx.quadraticCurveTo(-10, -14, -6, -18);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f43f5e';
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(-6, -18, 4, 0, Math.PI * 2);
      ctx.fill();

      // Yellow beak
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-9, -19);
      ctx.lineTo(-14, -17);
      ctx.lineTo(-9, -15);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'gnome': {
      // Blue tunic
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-6, -2, 12, 10);

      // Beard
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(0, 6);
      ctx.lineTo(6, -2);
      ctx.closePath();
      ctx.fill();

      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Red pointy hat
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-7, -4);
      ctx.lineTo(0, -18);
      ctx.lineTo(7, -4);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'sprinkler': {
      // Base valve
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Brass spinner nozzle
      const sAngle = (prop.extra?.sprinklerAngle || 0) + (prop.state === 'active' ? gameTime * 12 : 0);
      ctx.save();
      ctx.rotate(sAngle);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-10, -3, 20, 6);
      ctx.restore();

      // Active water spray arcs
      if (prop.state === 'active') {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
          const streamAngle = sAngle + a;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(streamAngle) * 45, Math.sin(streamAngle) * 45);
          ctx.stroke();
        }
      }
      break;
    }

    case 'car': {
      const isAlarm = prop.state === 'active';
      const bounce = isAlarm ? Math.sin(gameTime * 25) * 3 : 0;
      const carColor = prop.extra?.color || '#dc2626';
      const isSprayed = !!prop.extra?.isSprayed;
      const sprayProgress = prop.extra?.sprayProgress || 0;

      // Wheels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-prop.width / 2 + 8, -prop.height / 2 - 4 + bounce, 18, 8);
      ctx.fillRect(prop.width / 2 - 26, -prop.height / 2 - 4 + bounce, 18, 8);
      ctx.fillRect(-prop.width / 2 + 8, prop.height / 2 - 4 + bounce, 18, 8);
      ctx.fillRect(prop.width / 2 - 26, prop.height / 2 - 4 + bounce, 18, 8);

      // Car body
      ctx.fillStyle = carColor;
      ctx.beginPath();
      ctx.roundRect(-prop.width / 2, -prop.height / 2 + bounce, prop.width, prop.height, 8);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Windshield & Cabin
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-prop.width / 2 + 20, -prop.height / 2 + 6 + bounce, prop.width - 40, prop.height - 12, 4);
      ctx.fill();

      ctx.fillStyle = '#94a3b8'; // Glass reflection
      ctx.fillRect(-prop.width / 2 + 25, -prop.height / 2 + 10 + bounce, 12, prop.height - 20);

      // Headlights
      const blinkOn = isAlarm && Math.sin(gameTime * 30) > 0;
      ctx.fillStyle = blinkOn ? '#fef08a' : '#fef9c3';
      ctx.fillRect(prop.width / 2 - 4, -prop.height / 2 + 4 + bounce, 4, 8);
      ctx.fillRect(prop.width / 2 - 4, prop.height / 2 - 12 + bounce, 4, 8);

      // Flashing Alarm rays
      if (blinkOn) {
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, bounce, 65, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- Street-Art Graffiti Rendering if Car Has Been Sprayed ---
      if (isSprayed) {
        // Vibrant spray paint splatters across hood and doors
        ctx.fillStyle = '#f43f5e'; // Neon pink splatter
        ctx.beginPath();
        ctx.arc(-prop.width / 2 + 24, bounce - 4, 9, 0, Math.PI * 2);
        ctx.arc(-prop.width / 2 + 32, bounce + 6, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#38bdf8'; // Bright cyan drips
        ctx.beginPath();
        ctx.arc(prop.width / 2 - 28, bounce - 6, 8, 0, Math.PI * 2);
        ctx.arc(prop.width / 2 - 18, bounce + 4, 6, 0, Math.PI * 2);
        ctx.fill();

        // Paint drip trails down car doors
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-12, bounce + 8, 4, 12);
        ctx.fillRect(6, bounce + 8, 3, 10);
        ctx.beginPath();
        ctx.arc(-10, bounce + 20, 2.5, 0, Math.PI * 2);
        ctx.arc(7.5, bounce + 18, 2, 0, Math.PI * 2);
        ctx.fill();

        // Stylized Graffiti Tagging: "CHAOS" or "DUO"
        ctx.font = 'bold 12px Bricolage Grotesque, Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.strokeText('CHAOS', 0, bounce + 5);
        ctx.fillText('CHAOS', 0, bounce + 5);

        // Neon crown tag stencil
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.moveTo(-18, bounce - 14);
        ctx.lineTo(-14, bounce - 20);
        ctx.lineTo(-10, bounce - 16);
        ctx.lineTo(-6, bounce - 20);
        ctx.lineTo(-2, bounce - 14);
        ctx.closePath();
        ctx.fill();

        // Sparkle stars
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('✦', 20, bounce - 12);
      }

      // --- Interactive Spray Painting Progress Bar ---
      if (sprayProgress > 0 && !isSprayed) {
        const barW = 74;
        const barH = 16;
        const barY = -prop.height / 2 - 24 + bounce;

        // Container capsule
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-barW / 2, barY, barW, barH, 8);
        ctx.fill();
        ctx.stroke();

        // Progress Fill Bar
        const fillW = Math.max(4, ((barW - 6) * sprayProgress) / 100);
        ctx.fillStyle = sprayProgress > 80 ? '#22c55e' : '#ec4899';
        ctx.beginPath();
        ctx.roundRect(-barW / 2 + 3, barY + 3, fillW, barH - 6, 5);
        ctx.fill();

        // Tagging text
        ctx.font = 'bold 8.5px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`TAG ${Math.round(sprayProgress)}%`, 0, barY + 11.5);
      }
      break;
    }

    case 'tp_tree': {
      // Trunk base
      ctx.fillStyle = '#5c3d2e';
      ctx.beginPath();
      ctx.arc(0, 0, prop.radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Large lush leafy canopy
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, 0, prop.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(-prop.radius * 0.25, -prop.radius * 0.25, prop.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      // Draped Toilet Paper rolls!
      const tpCount = prop.extra?.tpCount || 0;
      if (tpCount > 0) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        for (let i = 0; i < tpCount; i++) {
          const a = (i * 1.3) % (Math.PI * 2);
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (prop.radius * 0.2), Math.sin(a) * (prop.radius * 0.2));
          ctx.quadraticCurveTo(
            Math.cos(a + 0.5) * (prop.radius * 0.7),
            Math.sin(a + 0.5) * (prop.radius * 0.7),
            Math.cos(a + 0.8) * (prop.radius * 1.15),
            Math.sin(a + 0.8) * (prop.radius * 1.15)
          );
          ctx.stroke();
        }
      }
      break;
    }

    case 'leaf_pile': {
      // Colorful autumn leaf mound
      const colors = ['#ea580c', '#c2410c', '#d97706', '#ca8a04', '#9a3412'];
      colors.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(
          (idx - 2) * 5,
          (idx % 2 === 0 ? 3 : -3),
          prop.radius * (0.8 - idx * 0.1),
          prop.radius * (0.6 - idx * 0.08),
          idx * 0.4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
      break;
    }

    case 'bush': {
      // Dense round leafy bush
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(-10, 0, 16, 0, Math.PI * 2);
      ctx.arc(10, 0, 16, 0, Math.PI * 2);
      ctx.arc(0, -6, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(-5, -6, 12, 0, Math.PI * 2);
      ctx.arc(5, -4, 10, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'banana_peel': {
      // Slippery cartoon banana peel
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Peel flaps
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-10, -6, -12, 4);
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(10, -6, 12, 4);
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(0, 10, 0, 14);
      ctx.stroke();

      // Brown tip
      ctx.fillStyle = '#713f12';
      ctx.fillRect(-1.5, -7, 3, 3);
      break;
    }

    case 'decoy_prop': {
      // Boombox radio
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-16, -10, 32, 20, 4);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Speakers
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-8, 0, 5, 0, Math.PI * 2);
      ctx.arc(8, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // Pulsating audio wave rings
      const pulse = (Math.sin(gameTime * 20) + 1) * 3;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-8, 0, 6 + pulse, 0, Math.PI * 2);
      ctx.arc(8, 0, 6 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Music notes floating up
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('♫', -4, -14);
      break;
    }

    case 'buster_ball': {
      // Red rubber bouncy ball
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, prop.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // White shine
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(-prop.radius * 0.35, -prop.radius * 0.35, prop.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'dog_house': {
      // Wooden doghouse
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-prop.width / 2, -prop.height / 2 + 10, prop.width, prop.height - 10);

      // Peaked roof
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-prop.width / 2 - 4, -prop.height / 2 + 10);
      ctx.lineTo(0, -prop.height / 2 - 8);
      ctx.lineTo(prop.width / 2 + 4, -prop.height / 2 + 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Doorway arch
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 8, 10, Math.PI, 0);
      ctx.lineTo(10, prop.height / 2);
      ctx.lineTo(-10, prop.height / 2);
      ctx.closePath();
      ctx.fill();

      // Bone plaque
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 8px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BUSTER', 0, -4);
      break;
    }
  }

  ctx.restore();
}

export function renderNPC(ctx: CanvasRenderingContext2D, npc: NPC, gameTime: number) {
  ctx.save();
  ctx.translate(npc.x, npc.y);

  // Vision Cone / Telegraph when investigating or chasing
  if (npc.state === 'INVESTIGATING' || npc.state === 'CHASING') {
    ctx.fillStyle = npc.state === 'CHASING' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(234, 179, 8, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const startA = npc.facing - npc.visionCone.fov / 2;
    const endA = npc.facing + npc.visionCone.fov / 2;
    ctx.arc(0, 0, npc.visionCone.distance, startA, endA);
    ctx.closePath();
    ctx.fill();
  }

  // Drop Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.ellipse(0, npc.radius + 2, npc.radius * 1.1, npc.radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  const walkBob = Math.sin(npc.walkFrame * 8) * 3;

  if (npc.type === 'henderson') {
    // Mr. Henderson in blue plaid bathrobe & bunny slippers
    ctx.fillStyle = '#1e3a8a'; // Bathrobe
    ctx.beginPath();
    ctx.roundRect(-13, -12 + walkBob, 26, 26, 6);
    ctx.fill();

    // Belt tie
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(-13, 0 + walkBob, 26, 2);

    // Slippers
    ctx.fillStyle = '#fbcfe8'; // Pink bunny slippers
    ctx.fillRect(-10, 16 + walkBob, 8, 6);
    ctx.fillRect(2, 16 + walkBob, 8, 6);

    // Head with balding white fringe
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -20 + walkBob, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0'; // White hair tufts
    ctx.beginPath();
    ctx.arc(-11, -21 + walkBob, 4, 0, Math.PI * 2);
    ctx.arc(11, -21 + walkBob, 4, 0, Math.PI * 2);
    ctx.fill();

    // Rolled-up newspaper in hand
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.fillRect(12, -10 + walkBob, 6, 18);
    ctx.strokeRect(12, -10 + walkBob, 6, 18);
  } else if (npc.type === 'gable') {
    // Mrs. Gable in knit cardigan and pearls
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.roundRect(-12, -12 + walkBob, 24, 25, 6);
    ctx.fill();

    // Pearls
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -8 + walkBob, 3, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -20 + walkBob, 10, 0, Math.PI * 2);
    ctx.fill();

    // Curled grey hair
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, -24 + walkBob, 11, Math.PI, 0);
    ctx.fill();

    // Cordless telephone in hand
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(11, -26 + walkBob, 4, 14);
  } else if (npc.type === 'higgins') {
    // Officer Higgins on Police Bicycle
    // Bicycle Wheels
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-16, 12, 10, 0, Math.PI * 2);
    ctx.arc(16, 12, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Bicycle Frame
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-16, 12);
    ctx.lineTo(0, 4);
    ctx.lineTo(16, 12);
    ctx.moveTo(0, 4);
    ctx.lineTo(0, -8);
    ctx.stroke();

    // Officer Torso
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-10, -18 + walkBob, 20, 18);

    // High vis belt
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-10, -8 + walkBob, 20, 4);

    // Head & Helmet
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -26 + walkBob, 9, 0, Math.PI * 2);
    ctx.fill();

    // Helmet with Flashing blue light
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -29 + walkBob, 10, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = Math.sin(gameTime * 20) > 0 ? '#38bdf8' : '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -35 + walkBob, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (npc.type === 'buster') {
    // Buster the Bulldog
    // Body (Brown with white chest patch)
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, 2 + walkBob, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // White chest patch
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(4, 2 + walkBob, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Paws
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-10, 8 + walkBob, 5, 6);
    ctx.fillRect(4, 8 + walkBob, 5, 6);

    // Head
    ctx.beginPath();
    ctx.arc(8, -6 + walkBob, 9, 0, Math.PI * 2);
    ctx.fill();

    // Floppy ears
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(4, -12 + walkBob, 4, 6, -0.4, 0, Math.PI * 2);
    ctx.ellipse(12, -12 + walkBob, 4, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Snout & Nose
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(13, -4 + walkBob, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a'; // Nose
    ctx.beginPath();
    ctx.arc(15, -5 + walkBob, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.arc(8, -8 + walkBob, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Red Collar
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(5, -1 + walkBob, 6, 3);

    // Wagging tail
    const wag = Math.sin(gameTime * 25) * 8;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, 0 + walkBob);
    ctx.lineTo(-18, -4 + wag + walkBob);
    ctx.stroke();
  }

  // Stunned spinning stars above head if stunned
  if (npc.stunTimer > 0) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px sans-serif';
    const starAngle = gameTime * 8;
    for (let i = 0; i < 3; i++) {
      const a = starAngle + (i * Math.PI * 2) / 3;
      ctx.fillText('★', Math.cos(a) * 16, -45 + Math.sin(a) * 6 + walkBob);
    }
  }

  // Alert Bubble Icon above head
  if (npc.state === 'CHASING') {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -44 + walkBob, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 0, -39 + walkBob);
  } else if (npc.state === 'INVESTIGATING') {
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, -44 + walkBob, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', 0, -39 + walkBob);
  }

  // Shout Speech Bubble
  if (npc.shoutTimer > 0 && npc.shoutText) {
    ctx.font = 'bold 12px Bricolage Grotesque, Outfit, sans-serif';
    const textWidth = ctx.measureText(npc.shoutText).width;
    const boxW = textWidth + 18;
    const boxH = 24;

    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -74 + walkBob, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // Bubble pointer
    ctx.beginPath();
    ctx.moveTo(-4, -50 + walkBob);
    ctx.lineTo(0, -44 + walkBob);
    ctx.lineTo(4, -50 + walkBob);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = npc.type === 'buster' ? '#d97706' : '#dc2626';
    ctx.textAlign = 'center';
    ctx.fillText(npc.shoutText, 0, -58 + walkBob);
  }

  ctx.restore();
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    switch (p.type) {
      case 'trash':
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        break;

      case 'leaf':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'water':
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'tp_ribbon':
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.quadraticCurveTo(0, 4, 8, -4);
        ctx.stroke();
        break;

      case 'star':
        ctx.fillStyle = '#fbbf24';
        ctx.font = `${Math.floor(p.size * 2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('★', 0, p.size * 0.7);
        break;

      case 'heart':
        ctx.fillStyle = '#f43f5e';
        ctx.font = `${Math.floor(p.size * 2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('♥', 0, p.size * 0.7);
        break;

      case 'dust':
        ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'note':
        ctx.fillStyle = '#eab308';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('♪', 0, 0);
        break;

      case 'confetti':
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        break;

      case 'smoke':
        ctx.fillStyle = 'rgba(168, 85, 247, 0.35)'; // Purple-tinted stink cloud
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'paint':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  });
}

export function renderFloatingTexts(ctx: CanvasRenderingContext2D, texts: import('./types').FloatingText[]) {
  texts.forEach((ft) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
    ctx.translate(ft.x, ft.y);
    ctx.scale(ft.scale, ft.scale);

    ctx.font = 'bold 14px Bricolage Grotesque, Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, 0, 0);
    ctx.fillText(ft.text, 0, 0);

    ctx.restore();
  });
}
