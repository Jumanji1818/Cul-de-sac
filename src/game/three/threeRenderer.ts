import * as THREE from 'three';
import { MaterialPalette } from './materials';
import { WorldBuilder } from './worldBuilder';
import { ActorBuilder, CharacterMeshHandle, BicycleMeshHandle } from './actorBuilder';
import { PropBuilder, PropMeshHandle } from './propBuilder';
import { Player, Prop, NPC, Particle, FloatingText, GameMode } from '../types';
import { to3DX, to3DZ } from './constants';
import { ScreenShaker } from '../physics';

/**
 * Checks if the WebGL context is a software renderer (SwiftShader, llvmpipe, etc.)
 */
function isSoftwareGl(gl: WebGLRenderingContext | WebGL2RenderingContext): boolean {
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  if (!debugInfo) return false;
  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
  return /swiftshader|llvmpipe|softpipe|mesa.*software/i.test(renderer);
}

export class ThreeRenderer {
  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  public materials: MaterialPalette;
  public worldBuilder: WorldBuilder;
  public actorBuilder: ActorBuilder;
  public propBuilder: PropBuilder;

  // Actor & Prop Handle Maps
  private leoHandle: CharacterMeshHandle | null = null;
  private miloHandle: CharacterMeshHandle | null = null;
  private npcHandles: Map<string, CharacterMeshHandle | BicycleMeshHandle> = new Map();
  private propHandles: Map<string, PropMeshHandle> = new Map();

  // 3D Particles
  private particleGroup: THREE.Group;
  private activeParticleSprites: THREE.Sprite[] = [];
  private particleMaterialPool: Map<string, THREE.SpriteMaterial> = new Map();

  // Floating Text Billboards
  private textGroup: THREE.Group;
  private textSprites: Map<string, THREE.Sprite> = new Map();

  // Third-Person Camera State & Modes
  public cameraMode: 'OVERVIEW' | 'FOLLOW' = 'OVERVIEW';
  public cameraYaw: number = 0; // Horizontal orbit angle (radians)
  public targetYaw: number = 0;
  public cameraPitch: number = 0.70; // Comfortable elevated ~40° angle for high neighborhood visibility
  public targetPitch: number = 0.70;
  public cameraDistance: number = 21.0; // Clean 21m distance to easily spot neighbors, props & streets
  public targetDistance: number = 21.0;
  public minDistance: number = 12.0;
  public maxDistance: number = 32.0;
  private currentCamTarget: THREE.Vector3 = new THREE.Vector3(0, 1.6, 0);

  // Smooth alignment tracking
  private manualCameraTimer: number = 0;
  private sustainedMoveTimer: number = 0;
  private lastFacingAngle: number = 0;

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  // Atmosphere & Weather
  public currentAtmosphere: 'day' | 'sunset' | 'night' = 'day';
  public currentWeather: 'clear' | 'rain' = 'clear';
  private rainLines: THREE.LineSegments | null = null;

  // Touch & Pointer Orbit Controls
  private isPointerDown: boolean = false;
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // 1. Initialize WebGLRenderer directly on canvas
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });

    const gl = this.renderer.getContext();
    const softwareGl = gl ? isSoftwareGl(gl) : false;

    this.renderer.setPixelRatio(softwareGl ? 1.0 : Math.min(window.devicePixelRatio || 1, 2.0));
    this.renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    if (!softwareGl) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x93c5fd); // Cheerful suburban blue sky
    this.scene.fog = new THREE.Fog(0x93c5fd, 65, 300); // Clear visibility of houses and neighbors

    const aspect = (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(54, aspect, 0.5, 450);

    // 3. Lighting
    this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x3f7c32, 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    this.dirLight.position.set(60, 90, 40);
    this.dirLight.castShadow = !softwareGl;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 250;
    this.dirLight.shadow.camera.left = -90;
    this.dirLight.shadow.camera.right = 90;
    this.dirLight.shadow.camera.top = 90;
    this.dirLight.shadow.camera.bottom = -90;
    this.scene.add(this.dirLight);

    // 4. Subsystem Builders
    this.materials = new MaterialPalette();
    this.worldBuilder = new WorldBuilder(this.materials);
    this.scene.add(this.worldBuilder.rootGroup);

    this.actorBuilder = new ActorBuilder(this.materials);
    this.propBuilder = new PropBuilder(this.materials);

    // Particle & Text Groups
    this.particleGroup = new THREE.Group();
    this.particleGroup.name = 'Particles3D';
    this.scene.add(this.particleGroup);

    this.textGroup = new THREE.Group();
    this.textGroup.name = 'TextBillboards3D';
    this.scene.add(this.textGroup);

    // 5. Stylized Rain System
    const rainCount = 450;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 6);
    for (let i = 0; i < rainCount; i++) {
      const rx = (Math.random() - 0.5) * 70;
      const ry = Math.random() * 28;
      const rz = (Math.random() - 0.5) * 70;
      const idx = i * 6;
      rainPositions[idx] = rx;
      rainPositions[idx + 1] = ry;
      rainPositions[idx + 2] = rz;
      rainPositions[idx + 3] = rx - 0.15;
      rainPositions[idx + 4] = ry - 0.9;
      rainPositions[idx + 5] = rz - 0.15;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    this.rainLines = new THREE.LineSegments(rainGeo, rainMat);
    this.rainLines.visible = false;
    this.scene.add(this.rainLines);

    // 6. Setup Camera Orbit Event Listeners
    this.setupOrbitControls();
  }

  private setupOrbitControls() {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: true });
  }

  private handlePointerDown = (e: PointerEvent) => {
    // Drag camera if on upper half/right side or using middle/right click
    if (e.clientX > window.innerWidth * 0.35 || e.clientY < window.innerHeight * 0.65 || e.button === 2) {
      this.isPointerDown = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
      this.manualCameraTimer = 3.5;
    }
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    const dx = e.clientX - this.prevPointerX;
    const dy = e.clientY - this.prevPointerY;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;

    this.manualCameraTimer = 3.5;
    this.targetYaw -= dx * 0.007;
    this.cameraYaw = this.targetYaw;
    this.targetPitch = Math.max(0.35, Math.min(1.22, this.targetPitch + dy * 0.005));
    this.cameraPitch = this.targetPitch;
  };

  private handlePointerUp = () => {
    this.isPointerDown = false;
  };

  private handleWheel = (e: WheelEvent) => {
    this.zoom(e.deltaY * 0.015);
  };

  /** Mobile touch camera rotate delta */
  public addCameraRotationDelta(dx: number, dy: number) {
    this.manualCameraTimer = 3.5;
    this.targetYaw -= dx * 0.007;
    this.cameraYaw = this.targetYaw;
    this.targetPitch = Math.max(0.35, Math.min(1.22, this.targetPitch + dy * 0.005));
    this.cameraPitch = this.targetPitch;
  }

  /** Zoom in or out smoothly */
  public zoom(delta: number) {
    this.targetDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.targetDistance + delta));
  }

  /** Snap camera directly behind current player heading */
  public snapBehindPlayer(facingAngle: number) {
    this.targetYaw = -facingAngle + Math.PI / 2;
    this.cameraYaw = this.targetYaw;
    this.manualCameraTimer = 0;
  }

  /** Reset camera to high-visibility overview position */
  public resetCamera() {
    this.targetYaw = 0;
    this.cameraYaw = 0;
    this.targetPitch = 0.70;
    this.cameraPitch = 0.70;
    this.targetDistance = 21.0;
    this.manualCameraTimer = 0;
  }

  /** Toggle between Overview (stable) and Follow (rear auto-align) */
  public toggleCameraMode(): 'OVERVIEW' | 'FOLLOW' {
    this.cameraMode = this.cameraMode === 'OVERVIEW' ? 'FOLLOW' : 'OVERVIEW';
    if (this.cameraMode === 'OVERVIEW') {
      this.resetCamera();
    }
    return this.cameraMode;
  }

  public setAtmosphere(atmosphere: 'day' | 'sunset' | 'night' = 'day', weather: 'clear' | 'rain' = 'clear') {
    this.currentAtmosphere = atmosphere;
    this.currentWeather = weather;

    let skyHex = 0x93c5fd;
    let fogNear = 65;
    let fogFar = 300;
    let hemiSky = 0xddeeff;
    let hemiGround = 0x3f7c32;
    let hemiIntensity = 0.85;
    let dirColor = 0xfffaed;
    let dirIntensity = 1.4;

    if (atmosphere === 'sunset') {
      skyHex = 0xf97316;
      fogNear = 50;
      fogFar = 260;
      hemiSky = 0xfed7aa;
      hemiGround = 0x7c2d12;
      hemiIntensity = 0.75;
      dirColor = 0xfbbf24;
      dirIntensity = 1.25;
    } else if (atmosphere === 'night') {
      skyHex = 0x0f172a;
      fogNear = 40;
      fogFar = 200;
      hemiSky = 0x312e81;
      hemiGround = 0x090d16;
      hemiIntensity = 0.35;
      dirColor = 0x818cf8;
      dirIntensity = 0.45;
    }

    if (weather === 'rain') {
      skyHex = atmosphere === 'night' ? 0x080e1a : 0x64748b;
      fogNear = 30;
      fogFar = 180;
      dirIntensity *= 0.65;
      hemiIntensity *= 0.7;
    }

    (this.scene.background as THREE.Color).setHex(skyHex);
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.setHex(skyHex);
      this.scene.fog.near = fogNear;
      this.scene.fog.far = fogFar;
    }
    this.hemiLight.color.setHex(hemiSky);
    this.hemiLight.groundColor.setHex(hemiGround);
    this.hemiLight.intensity = hemiIntensity;
    this.dirLight.color.setHex(dirColor);
    this.dirLight.intensity = dirIntensity;

    if (this.rainLines) {
      this.rainLines.visible = weather === 'rain';
    }
  }

  private updateRain(delta: number) {
    if (!this.rainLines || !this.rainLines.visible) return;
    this.rainLines.position.set(this.currentCamTarget.x, 0, this.currentCamTarget.z);
    const attr = this.rainLines.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const speed = 40 * delta;
    for (let i = 0; i < arr.length; i += 6) {
      arr[i + 1] -= speed;
      arr[i + 4] -= speed;
      if (arr[i + 4] < 0) {
        arr[i + 1] = 25 + Math.random() * 4;
        arr[i + 4] = arr[i + 1] - 0.9;
      }
    }
    attr.needsUpdate = true;
  }

  public resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // --- Primary 3D Render Loop Step ---
  public render(
    p1: Player,
    p2: Player,
    npcs: NPC[],
    props: Prop[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    gameMode: GameMode,
    screenShaker: ScreenShaker,
    simTime: number,
    tpCount: number = 0
  ) {
    // 1. Sync Players (Leo & Milo)
    this.syncPlayers(p1, p2, gameMode);

    // 2. Sync NPCs
    this.syncNPCs(npcs);

    // 3. Sync Props
    this.syncProps(props, simTime);

    // 4. Update World Elements (ducks, Grand Oak TP streamers)
    this.worldBuilder.update(simTime, tpCount);

    // 5. Update 3D Camera with Third-Person Follow & Shake
    this.updateCamera(p1, p2, gameMode, screenShaker);

    // 6. Update 3D Particles
    this.syncParticles(particles);

    // 7. Update 3D Floating Text Billboards
    this.syncFloatingTexts(floatingTexts);

    // 7.5. Update Rain Simulation
    this.updateRain(0.016);

    // 8. Render Frame
    this.renderer.render(this.scene, this.camera);
  }

  private syncPlayers(p1: Player, p2: Player, mode: GameMode) {
    // Leo (P1)
    if (!this.leoHandle) {
      this.leoHandle = this.actorBuilder.createLeoMesh(p1.capColor || '#ea580c', p1.jacketColor || '#06b6d4');
      this.scene.add(this.leoHandle.root);
    }
    const p1X = to3DX(p1.x);
    const p1Z = to3DZ(p1.y);
    const p1Elev = (p1 as any).yHeight || 0;
    this.leoHandle.root.position.set(p1X, 0, p1Z);
    this.leoHandle.root.visible = !p1.isHidden;
    this.leoHandle.updateAnimation(
      p1.walkFrame,
      p1.isMoving,
      p1.isSprinting,
      p1.kickCooldown > 0.15,
      Boolean(p1.isSpraying),
      false,
      p1.facing,
      p1Elev,
      p1.squashStretch
    );

    // Milo (AI Companion or P2 in Co-Op)
    if (!this.miloHandle) {
      this.miloHandle = this.actorBuilder.createMiloMesh('#7c3aed', '#eab308');
      this.scene.add(this.miloHandle.root);
    }
    const p2X = to3DX(p2.x);
    const p2Z = to3DZ(p2.y);
    const p2Elev = (p2 as any).yHeight || 0;
    this.miloHandle.root.position.set(p2X, 0, p2Z);
    this.miloHandle.root.visible = !p2.isHidden;
    this.miloHandle.updateAnimation(
      p2.walkFrame,
      p2.isMoving,
      p2.isSprinting,
      p2.kickCooldown > 0.15,
      Boolean(p2.isSpraying),
      Boolean(p2.isLookout),
      p2.facing,
      p2Elev,
      p2.squashStretch
    );
  }

  private syncNPCs(npcs: NPC[]) {
    npcs.forEach((npc) => {
      let handle = this.npcHandles.get(npc.id);
      if (!handle) {
        if (npc.type === 'higgins') {
          handle = this.actorBuilder.createHigginsBicycleMesh();
        } else if (npc.type === 'buster') {
          handle = this.actorBuilder.createBusterMesh();
        } else if (npc.type === 'guard') {
          handle = this.actorBuilder.createGuardMesh();
        } else if (npc.type === 'bruno') {
          handle = this.actorBuilder.createBrunoMesh();
        } else if (npc.type === 'cleo') {
          handle = this.actorBuilder.createCleoMesh();
        } else if (npc.type === 'gable') {
          handle = this.actorBuilder.createGableMesh();
        } else if (npc.type === 'rival_ziggy') {
          handle = this.actorBuilder.createRivalMesh('Ziggy', '#7c3aed', '#f59e0b');
        } else if (npc.type === 'rival_dex') {
          handle = this.actorBuilder.createRivalMesh('Dex', '#10b981', '#ef4444');
        } else {
          handle = this.actorBuilder.createHendersonMesh();
        }
        this.npcHandles.set(npc.id, handle);
        this.scene.add(handle.root);
      }

      const x = to3DX(npc.x);
      const z = to3DZ(npc.y);
      const elev = (npc as any).yHeight || 0;
      handle.root.position.set(x, 0, z);

      const isChasing = npc.state === 'CHASING';
      const isMoving = Math.sqrt(npc.vx * npc.vx + npc.vy * npc.vy) > 0.2;
      handle.updateAnimation(npc.walkFrame, isMoving, isChasing, false, false, false, npc.facing, elev);
    });
  }

  private syncProps(props: Prop[], time: number) {
    props.forEach((prop) => {
      let handle = this.propHandles.get(prop.id);
      if (!handle) {
        handle = this.propBuilder.createPropMesh(prop);
        this.propHandles.set(prop.id, handle);
        this.scene.add(handle.root);
      }

      const x = to3DX(prop.x);
      const z = to3DZ(prop.y);
      handle.root.position.set(x, 0, z);
      handle.root.rotation.y = -prop.rotation;
      handle.update(prop, time);
    });
  }

  private updateCamera(p1: Player, p2: Player, mode: GameMode, screenShaker: ScreenShaker) {
    // 1. Camera Yaw & Orientation Logic
    if (this.manualCameraTimer > 0) {
      this.manualCameraTimer -= 0.016;
    } else if (this.cameraMode === 'FOLLOW' && p1.isMoving) {
      // Gentle, intelligent alignment in Follow Mode
      const facingDiff = Math.abs(p1.facing - this.lastFacingAngle);
      if (facingDiff < 0.3) {
        this.sustainedMoveTimer += 0.016;
      } else {
        this.sustainedMoveTimer = Math.max(0, this.sustainedMoveTimer - 0.032);
      }
      this.lastFacingAngle = p1.facing;

      // Only gently align after moving forward for >0.4s to prevent disorienting wobbles
      if (this.sustainedMoveTimer > 0.4) {
        const desiredYaw = -p1.facing + Math.PI / 2;
        let diff = desiredYaw - this.cameraYaw;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        // Apply comfortable deadzone of ~20 degrees
        if (Math.abs(diff) > 0.35) {
          const smoothSpeed = p1.isSprinting ? 0.95 : 0.65;
          this.cameraYaw += diff * Math.min(1.0, 0.016 * smoothSpeed);
          this.targetYaw = this.cameraYaw;
        }
      }
    } else {
      this.sustainedMoveTimer = 0;
    }

    // Smoothly ease camera distance towards targetDistance
    let desiredDist = this.targetDistance;

    // Determine camera focus point
    const p1X = to3DX(p1.x);
    const p1Z = to3DZ(p1.y);
    let targetX = p1X;
    let targetZ = p1Z;
    let targetY = 1.6 + ((p1 as any).yHeight || 0) * 0.4;

    // In local co-op, center between Leo and Milo & dynamically expand distance so both stay on-screen
    if (mode === 'COOP' || mode === 'COOP_TRIALS') {
      const p2X = to3DX(p2.x);
      const p2Z = to3DZ(p2.y);
      targetX = (p1X + p2X) / 2;
      targetZ = (p1Z + p2Z) / 2;

      const coopDist = Math.hypot(p1X - p2X, p1Z - p2Z);
      desiredDist = Math.max(this.targetDistance, 20.0 + coopDist * 0.55);
    }

    this.cameraDistance = THREE.MathUtils.lerp(this.cameraDistance, desiredDist, 0.08);

    // Smooth lerp to target position (damping prevents jerky camera)
    this.currentCamTarget.x = THREE.MathUtils.lerp(this.currentCamTarget.x, targetX, 0.10);
    this.currentCamTarget.y = THREE.MathUtils.lerp(this.currentCamTarget.y, targetY, 0.10);
    this.currentCamTarget.z = THREE.MathUtils.lerp(this.currentCamTarget.z, targetZ, 0.10);

    // Calculate camera spherical offset
    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const camX = this.currentCamTarget.x + Math.sin(this.cameraYaw) * cosPitch * this.cameraDistance;
    const camY = this.currentCamTarget.y + sinPitch * this.cameraDistance;
    const camZ = this.currentCamTarget.z + Math.cos(this.cameraYaw) * cosPitch * this.cameraDistance;

    // Apply screen shake
    const shake = screenShaker.getOffset();
    this.camera.position.set(camX + shake.offsetX * 0.05, camY + shake.offsetY * 0.05, camZ);
    this.camera.lookAt(this.currentCamTarget);
  }

  // --- 3D Floating Particle Sprites ---
  private syncParticles(particles: Particle[]) {
    // Reset pooled sprites
    this.activeParticleSprites.forEach((sprite) => {
      sprite.visible = false;
    });

    particles.forEach((p, idx) => {
      let sprite = this.activeParticleSprites[idx];
      if (!sprite) {
        let mat = this.particleMaterialPool.get(p.color);
        if (!mat) {
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(32, 32, 28, 0, Math.PI * 2);
          ctx.fill();

          const tex = new THREE.CanvasTexture(canvas);
          mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
          this.particleMaterialPool.set(p.color, mat);
        }

        sprite = new THREE.Sprite(mat);
        this.activeParticleSprites.push(sprite);
        this.particleGroup.add(sprite);
      }

      sprite.visible = true;
      const x = to3DX(p.x);
      const z = to3DZ(p.y);
      const y = 1.0 + (p.size * 0.05);
      sprite.position.set(x, y, z);
      const scale = (p.size * 0.04) * (p.life / p.maxLife);
      sprite.scale.set(scale, scale, 1);
    });
  }

  // --- 3D Floating Text Billboards ---
  private syncFloatingTexts(floatingTexts: FloatingText[]) {
    // Hide current
    this.textSprites.forEach((s) => {
      s.visible = false;
    });

    floatingTexts.forEach((ft) => {
      let sprite = this.textSprites.get(ft.id);
      if (!sprite) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 80;
        const ctx = canvas.getContext('2d')!;

        ctx.font = 'bold 36px "Impact", "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(ft.text, 128, 40);
        ctx.fillStyle = ft.color || '#facc15';
        ctx.fillText(ft.text, 128, 40);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        sprite = new THREE.Sprite(mat);
        this.textSprites.set(ft.id, sprite);
        this.textGroup.add(sprite);
      }

      sprite.visible = true;
      const x = to3DX(ft.x);
      const z = to3DZ(ft.y);
      const y = 2.8 + (1 - ft.life / ft.maxLife) * 2.0;
      sprite.position.set(x, y, z);
      const scale = (ft.scale || 1.0) * 3.5;
      sprite.scale.set(scale, scale * 0.35, 1);
    });
  }

  public destroy() {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);

    this.worldBuilder.dispose();
    this.materials.dispose();
    this.renderer.dispose();
  }
}
