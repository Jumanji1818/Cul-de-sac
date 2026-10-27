import * as THREE from 'three';
import { MaterialPalette, createGraffitiTexture, createGraffitiWallTexture } from './materials';
import { Prop } from '../types';

export interface PropMeshHandle {
  root: THREE.Group;
  propId: string;
  type: string;
  lid?: THREE.Mesh;
  body?: THREE.Mesh;
  wheels?: THREE.Mesh[];
  graffitiDecal?: THREE.Mesh;
  headlights?: THREE.Mesh[];
  waterSpray?: THREE.Points;
  shadowDisc: THREE.Mesh;
  update: (prop: Prop, time: number) => void;
}

export class PropBuilder {
  private materials: MaterialPalette;

  constructor(materials: MaterialPalette) {
    this.materials = materials;
  }

  public createPropMesh(prop: Prop): PropMeshHandle {
    switch (prop.type) {
      case 'car':
        return this.createCarMesh(prop);
      case 'trash_can':
      case 'recycle_bin':
        return this.createTrashCanMesh(prop);
      case 'sprinkler':
        return this.createSprinklerMesh(prop);
      case 'flamingo':
        return this.createFlamingoMesh(prop);
      case 'gnome':
        return this.createGnomeMesh(prop);
      case 'bush':
        return this.createBushMesh(prop);
      case 'banana_peel':
        return this.createBananaPeelMesh(prop);
      case 'decoy_prop':
        return this.createDecoyMesh(prop);
      case 'buster_ball':
        return this.createBusterBallMesh(prop);
      case 'graffiti_wall':
        return this.createGraffitiWallMesh(prop);
      case 'sausage_plate':
        return this.createSausagePlateMesh(prop);
      case 'firework_box':
        return this.createFireworkBoxMesh(prop);
      case 'pool':
        return this.createPoolMesh(prop);
      case 'tennis_court':
        return this.createTennisCourtMesh(prop);
      default:
        return this.createGenericPropMesh(prop);
    }
  }

  // --- 3D PARKED CAR (Supports Spray Painting, Alarm Flashing, Bouncing) ---
  private createCarMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `Car_${prop.id}`;

    const colorHex = prop.extra?.color || '#dc2626';
    const bodyMat = this.materials.getCarPaint(colorHex);

    // Ground shadow
    const shadowGeo = new THREE.PlaneGeometry(10.5, 5.5);
    const shadow = new THREE.Mesh(shadowGeo, this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const carBody = new THREE.Group();
    carBody.position.y = 0.55;
    root.add(carBody);

    // Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(9.6, 1.3, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.65;
    chassis.castShadow = true;
    carBody.add(chassis);

    // Cabin / Roof
    const cabinGeo = new THREE.BoxGeometry(5.2, 1.4, 3.8);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(-0.4, 2.0, 0);
    cabin.castShadow = true;
    carBody.add(cabin);

    // Windshield & Windows
    const glassGeo = new THREE.BoxGeometry(5.25, 1.25, 3.85);
    const glass = new THREE.Mesh(glassGeo, this.materials.carGlass);
    glass.position.set(-0.4, 1.95, 0);
    carBody.add(glass);

    // 4 Wheels
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.45, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const wheelPositions = [
      { x: 2.8, z: 2.2 },
      { x: -2.8, z: 2.2 },
      { x: 2.8, z: -2.2 },
      { x: -2.8, z: -2.2 },
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeo, this.materials.carTire);
      wheel.position.set(pos.x, 0.7, pos.z);
      wheels.push(wheel);
      root.add(wheel);
    });

    // Headlights (Off by default, blink yellow when alarm sounds)
    const headlights: THREE.Mesh[] = [];
    const headGeo = new THREE.BoxGeometry(0.2, 0.4, 0.7);

    const leftHead = new THREE.Mesh(headGeo, this.materials.carHeadlightOff);
    leftHead.position.set(4.82, 0.9, 1.4);
    carBody.add(leftHead);
    headlights.push(leftHead);

    const rightHead = new THREE.Mesh(headGeo, this.materials.carHeadlightOff);
    rightHead.position.set(4.82, 0.9, -1.4);
    carBody.add(rightHead);
    headlights.push(rightHead);

    // Graffiti Decal Plane (Visible on driver and passenger side when sprayed)
    const graffitiGeo = new THREE.PlaneGeometry(4.8, 1.8);
    const graffitiMat = new THREE.MeshBasicMaterial({
      map: createGraffitiTexture(prop.extra?.graffitiType || 'DOUBLE TROUBLE!'),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const graffitiDecal = new THREE.Mesh(graffitiGeo, graffitiMat);
    graffitiDecal.position.set(-0.2, 0.8, 2.22);
    carBody.add(graffitiDecal);

    // Update function
    const update = (p: Prop, time: number) => {
      // Check if sprayed
      const sprayProgress = p.extra?.sprayProgress || 0;
      if (sprayProgress > 0) {
        graffitiMat.opacity = Math.min(1.0, sprayProgress / 100);
      }

      // Check if alarm triggered
      const isAlarm = p.state === 'active' && (p.extra?.alarmTime || 0) > 0;
      if (isAlarm) {
        const isBlink = Math.floor(time * 12) % 2 === 0;
        headlights.forEach((h) => {
          h.material = isBlink ? this.materials.carHeadlightOn : this.materials.carHeadlightOff;
        });
        // Chassis bouncy alarm vibration
        carBody.position.y = 0.55 + Math.sin(time * 28) * 0.12;
      } else {
        headlights.forEach((h) => {
          h.material = this.materials.carHeadlightOff;
        });
        carBody.position.y = 0.55;
      }
    };

    return {
      root,
      propId: prop.id,
      type: prop.type,
      body: chassis,
      wheels,
      graffitiDecal,
      headlights,
      shadowDisc: shadow,
      update,
    };
  }

  // --- TRASH CAN & RECYCLE BIN ---
  private createTrashCanMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `Trash_${prop.id}`;

    const isRecycle = prop.type === 'recycle_bin';
    const mat = isRecycle ? this.materials.trashPlastic : this.materials.trashMetal;

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.85, 16), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const canAnchor = new THREE.Group();
    root.add(canAnchor);

    // Corrugated cylindrical body
    const canGeo = new THREE.CylinderGeometry(0.65, 0.55, 1.6, 12);
    const body = new THREE.Mesh(canGeo, mat);
    body.position.y = 0.8;
    body.castShadow = true;
    canAnchor.add(body);

    // Lid (removable physics lid)
    const lidGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.15, 12);
    const lid = new THREE.Mesh(lidGeo, mat);
    lid.position.y = 1.65;
    lid.castShadow = true;
    canAnchor.add(lid);

    // Handle on lid
    const handleGeo = new THREE.TorusGeometry(0.12, 0.03, 6, 8);
    const handle = new THREE.Mesh(handleGeo, mat);
    handle.position.y = 1.75;
    canAnchor.add(handle);

    const update = (p: Prop, _time: number) => {
      if (p.state === 'knocked') {
        // Tipped on side with physics rotation
        canAnchor.rotation.z = Math.PI / 2.2;
        canAnchor.position.y = 0.35;
        lid.position.set(0.6, 0.4, 0.3);
        lid.rotation.x = 0.4;
      } else {
        canAnchor.rotation.z = 0;
        canAnchor.position.y = 0;
        lid.position.set(0, 1.65, 0);
        lid.rotation.x = 0;
      }
    };

    return { root, propId: prop.id, type: prop.type, body, lid, shadowDisc: shadow, update };
  }

  // --- LAWN SPRINKLER (Emits 3D Water Spray Arc) ---
  private createSprinklerMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `Sprinkler_${prop.id}`;

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.4, 12), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    // Brass base
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.2, 8);
    const base = new THREE.Mesh(baseGeo, this.materials.sprinklerBrass);
    base.position.y = 0.1;
    root.add(base);

    // Rotating nozzle
    const nozzleGroup = new THREE.Group();
    nozzleGroup.position.y = 0.25;
    const nozzleGeo = new THREE.BoxGeometry(0.6, 0.08, 0.08);
    const nozzle = new THREE.Mesh(nozzleGeo, this.materials.sprinklerBrass);
    nozzleGroup.add(nozzle);
    root.add(nozzleGroup);

    // 3D Water Spray Droplets (Point cloud)
    const particleCount = 60;
    const waterGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0.25;
      positions[i * 3 + 2] = 0;
    }
    waterGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const waterMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
    });
    const waterSpray = new THREE.Points(waterGeo, waterMat);
    waterSpray.visible = false;
    root.add(waterSpray);

    const update = (p: Prop, time: number) => {
      const isActive = p.state === 'active';
      waterSpray.visible = isActive;

      if (isActive) {
        nozzleGroup.rotation.y = time * 12;

        // Animate water arcs
        const posAttr = waterGeo.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const t = ((time * 3 + i / particleCount) % 1.0);
          const dist = t * 4.5;
          const sprayAngle = nozzleGroup.rotation.y + (i % 2 === 0 ? 0 : Math.PI);
          array[i * 3] = Math.cos(sprayAngle) * dist;
          array[i * 3 + 1] = 0.25 + Math.sin(t * Math.PI) * 1.8;
          array[i * 3 + 2] = Math.sin(sprayAngle) * dist;
        }
        posAttr.needsUpdate = true;
      }
    };

    return { root, propId: prop.id, type: prop.type, waterSpray, shadowDisc: shadow, update };
  }

  // --- LAWN FLAMINGO ---
  private createFlamingoMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `Flamingo_${prop.id}`;

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.35, 12), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const flamingoGroup = new THREE.Group();
    root.add(flamingoGroup);

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const body = new THREE.Mesh(bodyGeo, this.materials.flamingoPink);
    body.scale.set(1.4, 0.9, 0.9);
    body.position.y = 1.0;
    flamingoGroup.add(body);

    // Curved S-Neck
    const neckGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.75, 6);
    const neck = new THREE.Mesh(neckGeo, this.materials.flamingoPink);
    neck.position.set(0.35, 1.4, 0);
    neck.rotation.z = -0.35;
    flamingoGroup.add(neck);

    // Head & Beak
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), this.materials.flamingoPink);
    head.position.set(0.5, 1.8, 0);
    flamingoGroup.add(head);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 6), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    beak.rotation.z = -Math.PI / 2.4;
    beak.position.set(0.68, 1.75, 0);
    flamingoGroup.add(beak);

    // Wire Legs stuck into grass
    const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.0, 4);
    const lLeg = new THREE.Mesh(legGeo, wireMat);
    lLeg.position.set(-0.08, 0.5, 0);
    flamingoGroup.add(lLeg);

    const rLeg = new THREE.Mesh(legGeo, wireMat);
    rLeg.position.set(0.08, 0.5, 0);
    flamingoGroup.add(rLeg);

    const update = (p: Prop, _time: number) => {
      if (p.state === 'knocked') {
        flamingoGroup.rotation.z = Math.PI / 2;
        flamingoGroup.position.y = -0.3;
      } else {
        flamingoGroup.rotation.z = 0;
        flamingoGroup.position.y = 0;
      }
    };

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update };
  }

  // --- GARDEN GNOME ---
  private createGnomeMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `Gnome_${prop.id}`;

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 10), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const gnomeGroup = new THREE.Group();
    root.add(gnomeGroup);

    // Blue tunic body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0x2563eb }));
    body.position.y = 0.25;
    gnomeGroup.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }));
    head.position.y = 0.58;
    gnomeGroup.add(head);

    // White Beard
    const beard = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.28, 6), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    beard.rotation.x = Math.PI;
    beard.position.set(0, 0.5, 0.12);
    gnomeGroup.add(beard);

    // Pointy Red Hat
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 8), this.materials.gnomeRed);
    hat.position.y = 0.88;
    gnomeGroup.add(hat);

    const update = (p: Prop, _time: number) => {
      if (p.state === 'knocked') {
        gnomeGroup.rotation.z = Math.PI / 2;
        gnomeGroup.position.y = -0.15;
      } else {
        gnomeGroup.rotation.z = 0;
        gnomeGroup.position.y = 0;
      }
    };

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update };
  }

  // --- SNEAKING BUSH (Volumetric Low-Poly Shrub) ---
  private createBushMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `Bush_${prop.id}`;

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.4, 16), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bushGroup = new THREE.Group();
    root.add(bushGroup);

    // 3 Overlapping leafy spheres
    const leafMat = this.materials.hedge;
    const centerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), leafMat);
    centerSphere.position.y = 1.0;
    centerSphere.castShadow = true;
    bushGroup.add(centerSphere);

    const leftSphere = new THREE.Mesh(new THREE.SphereGeometry(0.9, 7, 5), leafMat);
    leftSphere.position.set(-0.8, 0.8, 0.2);
    bushGroup.add(leftSphere);

    const rightSphere = new THREE.Mesh(new THREE.SphereGeometry(0.9, 7, 5), leafMat);
    rightSphere.position.set(0.8, 0.8, -0.2);
    bushGroup.add(rightSphere);

    const update = (p: Prop, time: number) => {
      // If someone is hiding inside, gently rustle
      if (p.state === 'active') {
        bushGroup.rotation.y = Math.sin(time * 12) * 0.06;
        bushGroup.scale.set(1.0 + Math.sin(time * 16) * 0.04, 1.0, 1.0);
      } else {
        bushGroup.rotation.y = 0;
        bushGroup.scale.set(1, 1, 1);
      }
    };

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update };
  }

  // --- BANANA PEEL ---
  private createBananaPeelMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `BananaPeel_${prop.id}`;

    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const peelGeo = new THREE.BoxGeometry(0.4, 0.08, 0.4);
    const peel = new THREE.Mesh(peelGeo, yellowMat);
    peel.position.y = 0.04;
    root.add(peel);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.25, 8), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    root.add(shadow);

    const update = (p: Prop, time: number) => {
      if (p.extra?.slipped) {
        root.rotation.y += 0.2;
        root.position.y = 0.5 + Math.sin(time * 10) * 0.2;
      }
    };

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update };
  }

  // --- DECOY PROP (Ticking device with pulsing red LED) ---
  private createDecoyMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `Decoy_${prop.id}`;

    const boxGeo = new THREE.BoxGeometry(0.6, 0.4, 0.4);
    const box = new THREE.Mesh(boxGeo, this.materials.lamppost);
    box.position.y = 0.2;
    root.add(box);

    const ledGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(0, 0.45, 0);
    root.add(led);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.35, 10), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    root.add(shadow);

    const update = (_p: Prop, time: number) => {
      const pulse = Math.sin(time * 15) > 0;
      ledMat.color.setHex(pulse ? 0xef4444 : 0x7f1d1d);
      root.position.y = Math.sin(time * 8) * 0.04;
    };

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update };
  }

  // --- BUSTER'S RED BALL ---
  private createBusterBallMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `BusterBall_${prop.id}`;

    const ballMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), ballMat);
    ball.position.y = 0.35;
    ball.castShadow = true;
    root.add(ball);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.3, 10), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    root.add(shadow);

    const update = (p: Prop, _time: number) => {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 5) {
        ball.rotation.x += speed * 0.02;
        ball.rotation.z += speed * 0.02;
      }
    };

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update };
  }

  // --- MANSION GRAFFITI WALL (Sprayable rich estate wall) ---
  private createGraffitiWallMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `GraffitiWall_${prop.id}`;

    const wallWidth = Math.max(8, prop.width * 0.1);
    const wallHeight = 4.2;

    // Stone / Stucco Base Wall
    const wallGeo = new THREE.BoxGeometry(wallWidth, wallHeight, 1.2);
    const wall = new THREE.Mesh(wallGeo, this.materials.mansionStucco);
    wall.position.y = wallHeight / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    root.add(wall);

    // Marble Crown Molding Trim
    const crownGeo = new THREE.BoxGeometry(wallWidth + 0.4, 0.4, 1.4);
    const crown = new THREE.Mesh(crownGeo, this.materials.mansionMarble);
    crown.position.y = wallHeight + 0.2;
    root.add(crown);

    // Foundation Base
    const baseGeo = new THREE.BoxGeometry(wallWidth + 0.2, 0.5, 1.35);
    const base = new THREE.Mesh(baseGeo, this.materials.mansionMarble);
    base.position.y = 0.25;
    root.add(base);

    // Graffiti Decal Mesh on Wall Face
    const tag = prop.extra?.graffitiType || 'CHAOS CITY';
    const muralTexture = createGraffitiWallTexture(tag);
    const decalGeo = new THREE.PlaneGeometry(wallWidth * 0.85, 2.8);
    const decalMat = new THREE.MeshBasicMaterial({
      map: muralTexture,
      transparent: true,
      depthWrite: false,
    });
    const graffitiDecal = new THREE.Mesh(decalGeo, decalMat);
    graffitiDecal.position.set(0, wallHeight * 0.55, 0.62);
    graffitiDecal.visible = Boolean(prop.extra?.isSprayed);
    root.add(graffitiDecal);

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(wallWidth, 1.8), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    root.add(shadow);

    const update = (p: Prop, time: number) => {
      graffitiDecal.visible = Boolean(p.extra?.isSprayed);
      if (p.extra?.sprayProgress && !p.extra?.isSprayed) {
        // Flickering spray progress preview
        graffitiDecal.visible = Math.sin(time * 25) > 0;
      }
    };

    return { root, propId: prop.id, type: prop.type, graffitiDecal, shadowDisc: shadow, update };
  }

  // --- SAUSAGE PLATE (Dog/Pet distraction) ---
  private createSausagePlateMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `SausagePlate_${prop.id}`;

    // White Ceramic Plate
    const plateGeo = new THREE.CylinderGeometry(0.8, 0.65, 0.12, 16);
    const plate = new THREE.Mesh(plateGeo, this.materials.mansionMarble);
    plate.position.y = 0.06;
    plate.castShadow = true;
    root.add(plate);

    // 3 Savory Red Sausages
    const sGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const sGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 8);
      sGeo.rotateZ(Math.PI / 2);
      const sausage = new THREE.Mesh(sGeo, this.materials.sausageMeat);
      const angle = (i * Math.PI * 2) / 3;
      sausage.position.set(Math.cos(angle) * 0.25, 0.16, Math.sin(angle) * 0.25);
      sausage.rotation.y = angle;
      sGroup.add(sausage);
    }
    root.add(sGroup);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.75, 12), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    root.add(shadow);

    const update = (p: Prop, _time: number) => {
      if (p.state === 'knocked') {
        sGroup.rotation.y += 0.05;
        sGroup.position.y = Math.max(0, sGroup.position.y - 0.01);
      }
    };

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update };
  }

  // --- FIREWORK CRATE (Explosive distraction launcher) ---
  private createFireworkBoxMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `FireworkBox_${prop.id}`;

    // Gold/Red Rocket Crate
    const boxGeo = new THREE.BoxGeometry(1.6, 1.4, 1.6);
    const box = new THREE.Mesh(boxGeo, this.materials.fireworkGold);
    box.position.y = 0.7;
    box.castShadow = true;
    root.add(box);

    // Multi-shot launch tubes
    for (let x = -0.4; x <= 0.4; x += 0.4) {
      for (let z = -0.4; z <= 0.4; z += 0.4) {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8), this.materials.gnomeRed);
        tube.position.set(x, 1.45, z);
        root.add(tube);
      }
    }

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.2, 12), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    root.add(shadow);

    const update = (p: Prop, time: number) => {
      if (p.state === 'triggered') {
        box.position.y = 0.7 + Math.sin(time * 30) * 0.08;
      }
    };

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update };
  }

  // --- LUXURY SWIMMING POOL (Billionaire Heights) ---
  private createPoolMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `Pool_${prop.id}`;

    const pw = prop.width * 0.1;
    const pd = prop.height * 0.1;

    // Stone Coping Rim
    const rimGeo = new THREE.BoxGeometry(pw + 1.2, 0.4, pd + 1.2);
    const rim = new THREE.Mesh(rimGeo, this.materials.mansionMarble);
    rim.position.y = 0.2;
    root.add(rim);

    // Shimmering Pool Water
    const waterGeo = new THREE.PlaneGeometry(pw, pd);
    const water = new THREE.Mesh(waterGeo, this.materials.poolWater);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.32;
    root.add(water);

    // Diving Board
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 3.5), this.materials.sidewalk);
    board.position.set(-pw * 0.35, 0.8, -pd * 0.45);
    root.add(board);

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(pw + 1.6, pd + 1.6), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    root.add(shadow);

    const update = (_p: Prop, time: number) => {
      water.position.y = 0.32 + Math.sin(time * 2.5) * 0.03;
    };

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update };
  }

  // --- PRIVATE TENNIS COURT (Billionaire Heights) ---
  private createTennisCourtMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `TennisCourt_${prop.id}`;

    const tw = prop.width * 0.1;
    const td = prop.height * 0.1;

    // Green Court Slab
    const courtGeo = new THREE.BoxGeometry(tw, 0.15, td);
    const court = new THREE.Mesh(courtGeo, this.materials.tennisGreen);
    court.position.y = 0.08;
    root.add(court);

    // White Baseline Lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const baseline = new THREE.Mesh(new THREE.BoxGeometry(tw - 1.5, 0.16, 0.2), lineMat);
    baseline.position.set(0, 0.09, -td * 0.45);
    root.add(baseline);

    const baseline2 = new THREE.Mesh(new THREE.BoxGeometry(tw - 1.5, 0.16, 0.2), lineMat);
    baseline2.position.set(0, 0.09, td * 0.45);
    root.add(baseline2);

    // Center Net
    const netGeo = new THREE.BoxGeometry(tw - 0.5, 1.2, 0.1);
    const net = new THREE.Mesh(netGeo, this.materials.woodFence);
    net.position.y = 0.7;
    root.add(net);

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(tw + 0.8, td + 0.8), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    root.add(shadow);

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update: () => {} };
  }

  // --- GENERIC PROP FALLBACK ---
  private createGenericPropMesh(prop: Prop): PropMeshHandle {
    const root = new THREE.Group();
    root.name = `Generic_${prop.id}`;

    const geo = new THREE.BoxGeometry(prop.width * 0.1, 1.2, prop.height * 0.1);
    const mesh = new THREE.Mesh(geo, this.materials.trashMetal);
    mesh.position.y = 0.6;
    mesh.castShadow = true;
    root.add(mesh);

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 8), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    root.add(shadow);

    return { root, propId: prop.id, type: prop.type, shadowDisc: shadow, update: () => {} };
  }
}
