import * as THREE from 'three';
import { MaterialPalette, createCharacterFaceTexture } from './materials';

/**
 * Procedural low-poly composite character builder for:
 * - Leo & Milo (Playable duo)
 * - Mr. Henderson & Mrs. Gable (Neighborhood residents)
 * - Officer Higgins on his Bicycle Patrol
 * - Officer Vance (Mansion Gate Guard)
 * - Bruno (Estate German Shepherd) & Buster (Yard Bulldog) & Cleo (Alley Cat)
 * - Rivals Ziggy & Dex (Rival Pranksters)
 */

export interface CharacterMeshHandle {
  root: THREE.Group;
  head: THREE.Group;
  torso: THREE.Mesh;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  shadowDisc: THREE.Mesh;
  sprayCan?: THREE.Group;
  accessory?: THREE.Object3D;
  updateAnimation: (
    walkFrame: number,
    isMoving: boolean,
    isSprinting: boolean,
    isKicking: boolean,
    isSpraying: boolean,
    isLookout: boolean,
    facingAngle: number,
    yElevation: number,
    squashStretch?: { sx: number; sy: number }
  ) => void;
}

export interface BicycleMeshHandle extends CharacterMeshHandle {
  frontWheel: THREE.Mesh;
  backWheel: THREE.Mesh;
  pedals: THREE.Group;
  sirenLight: THREE.Mesh;
}

export class ActorBuilder {
  private materials: MaterialPalette;

  constructor(materials: MaterialPalette) {
    this.materials = materials;
  }

  // --- LEO: Cool, daring prankster with backwards cap & turquoise jacket ---
  public createLeoMesh(capColorHex: string = '#ea580c', jacketColorHex: string = '#06b6d4'): CharacterMeshHandle {
    const root = new THREE.Group();
    root.name = 'Leo';

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5 });
    const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(capColorHex), roughness: 0.5 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(jacketColorHex), roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    // Contact shadow
    const shadowGeo = new THREE.CircleGeometry(0.8, 16);
    const shadow = new THREE.Mesh(shadowGeo, this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    // Character body anchor
    const bodyAnchor = new THREE.Group();
    bodyAnchor.position.y = 0;
    root.add(bodyAnchor);

    // Torso (Turquoise Jacket with white tee)
    const torsoGeo = new THREE.BoxGeometry(0.9, 1.1, 0.55);
    const torso = new THREE.Mesh(torsoGeo, jacketMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    bodyAnchor.add(torso);

    // Inner tee
    const teeGeo = new THREE.PlaneGeometry(0.35, 0.7);
    const tee = new THREE.Mesh(teeGeo, whiteMat);
    tee.position.set(0, 1.35, 0.28);
    bodyAnchor.add(tee);

    // Head
    const head = new THREE.Group();
    head.position.set(0, 2.2, 0);

    const headGeo = new THREE.SphereGeometry(0.42, 10, 8);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    head.add(headMesh);

    // Backwards Baseball Cap
    const capGeo = new THREE.SphereGeometry(0.44, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.08;
    head.add(cap);

    // Cap Brim (facing backwards)
    const brimGeo = new THREE.BoxGeometry(0.45, 0.06, 0.35);
    const brim = new THREE.Mesh(brimGeo, capMat);
    brim.position.set(0, 0.12, -0.42);
    head.add(brim);

    // Cool sunglasses
    const shadesGeo = new THREE.BoxGeometry(0.5, 0.14, 0.08);
    const shadesMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const shades = new THREE.Mesh(shadesGeo, shadesMat);
    shades.position.set(0, 0.05, 0.4);
    head.add(shades);

    // Expressive cartoon face decal
    const faceTex = createCharacterFaceTexture('leo');
    const faceDecal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.55),
      new THREE.MeshBasicMaterial({ map: faceTex, transparent: true })
    );
    faceDecal.position.set(0, 0.02, 0.42);
    head.add(faceDecal);

    bodyAnchor.add(head);

    // Left Arm
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.6, 1.75, 0);
    const armGeo = new THREE.BoxGeometry(0.24, 0.85, 0.24);
    const lArmMesh = new THREE.Mesh(armGeo, jacketMat);
    lArmMesh.position.y = -0.4;
    leftArm.add(lArmMesh);
    bodyAnchor.add(leftArm);

    // Right Arm (holds spray can)
    const rightArm = new THREE.Group();
    rightArm.position.set(0.6, 1.75, 0);
    const rArmMesh = new THREE.Mesh(armGeo, jacketMat);
    rArmMesh.position.y = -0.4;
    rightArm.add(rArmMesh);

    // Spray Can Attached to Hand
    const sprayCan = new THREE.Group();
    const canGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.35, 8);
    const canMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.3, metalness: 0.5 });
    const canMesh = new THREE.Mesh(canGeo, canMat);
    sprayCan.add(canMesh);

    const tipGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 6);
    const tipMesh = new THREE.Mesh(tipGeo, whiteMat);
    tipMesh.position.y = 0.2;
    sprayCan.add(tipMesh);

    sprayCan.position.set(0, -0.75, 0.2);
    sprayCan.rotation.x = Math.PI / 3;
    sprayCan.visible = false; // Visible when spraying!
    rightArm.add(sprayCan);

    bodyAnchor.add(rightArm);

    // Left Leg
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.25, 0.85, 0);
    const legGeo = new THREE.BoxGeometry(0.28, 0.8, 0.28);
    const lLegMesh = new THREE.Mesh(legGeo, pantsMat);
    lLegMesh.position.y = -0.4;
    leftLeg.add(lLegMesh);

    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.45), shoeMat);
    lShoe.position.set(0, -0.8, 0.08);
    leftLeg.add(lShoe);
    bodyAnchor.add(leftLeg);

    // Right Leg
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.25, 0.85, 0);
    const rLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rLegMesh.position.y = -0.4;
    rightLeg.add(rLegMesh);

    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.45), shoeMat);
    rShoe.position.set(0, -0.8, 0.08);
    rightLeg.add(rShoe);
    bodyAnchor.add(rightLeg);

    // Animation Controller
    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isSprinting: boolean,
      isKicking: boolean,
      isSpraying: boolean,
      _isLookout: boolean,
      facingAngle: number,
      yElevation: number,
      squashStretch?: { sx: number; sy: number }
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      bodyAnchor.position.y = yElevation;

      if (squashStretch) {
        bodyAnchor.scale.set(squashStretch.sx, squashStretch.sy, squashStretch.sx);
      }

      sprayCan.visible = isSpraying;

      if (isKicking) {
        // High martial arts kick
        rightLeg.rotation.x = -Math.PI / 2.2;
        rightLeg.position.z = 0.4;
        leftLeg.rotation.x = 0.2;
        rightArm.rotation.x = Math.PI / 3;
        leftArm.rotation.x = -Math.PI / 3;
        torso.rotation.x = 0.2;
      } else if (isSpraying) {
        // Point spray can forward and shake
        rightArm.rotation.x = -Math.PI / 2.2;
        rightArm.rotation.z = -0.2;
        leftArm.rotation.x = 0.3;
        torso.rotation.y = 0.15;
        torso.position.y = 1.35 + Math.sin(walkFrame * 20) * 0.04;
        sprayCan.rotation.x = Math.PI / 2 + Math.sin(walkFrame * 30) * 0.1;
      } else if (isMoving) {
        const speed = isSprinting ? 1.6 : 1.0;
        const swing = Math.sin(walkFrame * 8 * speed) * (isSprinting ? 0.85 : 0.55);
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.9;
        rightArm.rotation.x = swing * 0.9;
        torso.rotation.x = isSprinting ? 0.3 : 0.08;
        torso.position.y = 1.35 + Math.abs(Math.sin(walkFrame * 8 * speed)) * 0.12;
      } else {
        // Idle breathing
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.x = Math.sin(walkFrame * 2) * 0.06;
        rightArm.rotation.x = -Math.sin(walkFrame * 2) * 0.06;
        torso.rotation.x = 0;
        torso.position.y = 1.35 + Math.sin(walkFrame * 3) * 0.03;
      }
    };

    return { root, head, torso, leftArm, rightArm, leftLeg, rightLeg, shadowDisc: shadow, sprayCan, updateAnimation };
  }

  // --- MILO: The quirky genius wingman with purple beanie, yellow hoodie & round glasses ---
  public createMiloMesh(beanieColorHex: string = '#7c3aed', hoodieColorHex: string = '#eab308'): CharacterMeshHandle {
    const root = new THREE.Group();
    root.name = 'Milo';

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.5 });
    const beanieMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(beanieColorHex), roughness: 0.6 });
    const hoodieMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hoodieColorHex), roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x14b8a6, roughness: 0.4 });

    const shadowGeo = new THREE.CircleGeometry(0.75, 16);
    const shadow = new THREE.Mesh(shadowGeo, this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyAnchor = new THREE.Group();
    root.add(bodyAnchor);

    // Torso (Oversized Hoodie)
    const torsoGeo = new THREE.BoxGeometry(0.85, 1.05, 0.58);
    const torso = new THREE.Mesh(torsoGeo, hoodieMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    bodyAnchor.add(torso);

    // Head
    const head = new THREE.Group();
    head.position.set(0, 2.05, 0);

    const headGeo = new THREE.SphereGeometry(0.4, 10, 8);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    head.add(headMesh);

    // Beanie
    const beanieGeo = new THREE.SphereGeometry(0.43, 10, 8, 0, Math.PI * 2, 0, Math.PI / 1.7);
    const beanie = new THREE.Mesh(beanieGeo, beanieMat);
    beanie.position.y = 0.06;
    head.add(beanie);

    // Fluffy Pom-Pom on top of beanie
    const pomGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const pomMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.9 });
    const pom = new THREE.Mesh(pomGeo, pomMat);
    pom.position.y = 0.52;
    head.add(pom);

    // Oversized Round Glasses
    const frameGeo = new THREE.TorusGeometry(0.12, 0.025, 6, 12);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const leftLens = new THREE.Mesh(frameGeo, frameMat);
    leftLens.position.set(-0.16, 0.05, 0.38);
    head.add(leftLens);

    const rightLens = new THREE.Mesh(frameGeo, frameMat);
    rightLens.position.set(0.16, 0.05, 0.38);
    head.add(rightLens);

    // Expressive cartoon face decal
    const faceTex = createCharacterFaceTexture('milo');
    const faceDecal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.52, 0.52),
      new THREE.MeshBasicMaterial({ map: faceTex, transparent: true })
    );
    faceDecal.position.set(0, 0.02, 0.40);
    head.add(faceDecal);

    bodyAnchor.add(head);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.22, 0.8, 0.22);
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.55, 1.65, 0);
    const lArmMesh = new THREE.Mesh(armGeo, hoodieMat);
    lArmMesh.position.y = -0.38;
    leftArm.add(lArmMesh);
    bodyAnchor.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.55, 1.65, 0);
    const rArmMesh = new THREE.Mesh(armGeo, hoodieMat);
    rArmMesh.position.y = -0.38;
    rightArm.add(rArmMesh);
    bodyAnchor.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.26, 0.75, 0.26);
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.22, 0.75, 0);
    const lLegMesh = new THREE.Mesh(legGeo, pantsMat);
    lLegMesh.position.y = -0.35;
    leftLeg.add(lLegMesh);
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.42), shoeMat);
    lShoe.position.set(0, -0.72, 0.06);
    leftLeg.add(lShoe);
    bodyAnchor.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.22, 0.75, 0);
    const rLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rLegMesh.position.y = -0.35;
    rightLeg.add(rLegMesh);
    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.42), shoeMat);
    rShoe.position.set(0, -0.72, 0.06);
    rightLeg.add(rShoe);
    bodyAnchor.add(rightLeg);

    // Animation Controller
    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isSprinting: boolean,
      isKicking: boolean,
      isSpraying: boolean,
      isLookout: boolean,
      facingAngle: number,
      yElevation: number,
      squashStretch?: { sx: number; sy: number }
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      bodyAnchor.position.y = yElevation;

      if (squashStretch) {
        bodyAnchor.scale.set(squashStretch.sx, squashStretch.sy, squashStretch.sx);
      }

      if (isLookout) {
        // Smart Lookout Pose: Looks nervously left and right with hands over eyes
        head.rotation.y = Math.sin(walkFrame * 6) * 0.7;
        rightArm.rotation.x = -Math.PI / 1.8;
        rightArm.rotation.z = -0.3;
        leftArm.rotation.x = -Math.PI / 1.8;
        leftArm.rotation.z = 0.3;
        torso.position.y = 1.25 + Math.sin(walkFrame * 8) * 0.05;
      } else if (isKicking) {
        rightLeg.rotation.x = -Math.PI / 2.4;
        leftLeg.rotation.x = 0.2;
        torso.rotation.x = 0.15;
      } else if (isSpraying) {
        rightArm.rotation.x = -Math.PI / 2;
        torso.rotation.y = 0.2;
      } else if (isMoving) {
        const speed = isSprinting ? 1.5 : 1.0;
        const swing = Math.sin(walkFrame * 8 * speed) * 0.6;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.8;
        rightArm.rotation.x = swing * 0.8;
        torso.position.y = 1.25 + Math.abs(Math.sin(walkFrame * 8 * speed)) * 0.1;
      } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0;
        rightArm.rotation.x = 0;
        torso.position.y = 1.25 + Math.sin(walkFrame * 2.5) * 0.02;
      }
    };

    return { root, head, torso, leftArm, rightArm, leftLeg, rightLeg, shadowDisc: shadow, updateAnimation };
  }

  // --- MR. HENDERSON: Grumpy neighbor with broom and sweater vest ---
  public createHendersonMesh(): CharacterMeshHandle {
    const root = new THREE.Group();
    root.name = 'Henderson';

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5d0b5, roughness: 0.6 });
    const vestMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.7 });

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.8, 16), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyAnchor = new THREE.Group();
    root.add(bodyAnchor);

    // Torso with Knit Vest
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.65), vestMat);
    torso.position.y = 1.4;
    torso.castShadow = true;
    bodyAnchor.add(torso);

    // Head with balding white tufts
    const head = new THREE.Group();
    head.position.set(0, 2.25, 0);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), skinMat);
    head.add(headMesh);

    // White side hair tufts
    const tuftGeo = new THREE.SphereGeometry(0.18, 6, 6);
    const lTuft = new THREE.Mesh(tuftGeo, hairMat);
    lTuft.position.set(-0.38, 0.05, 0);
    head.add(lTuft);

    const rTuft = new THREE.Mesh(tuftGeo, hairMat);
    rTuft.position.set(0.38, 0.05, 0);
    head.add(rTuft);

    bodyAnchor.add(head);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.24, 0.85, 0.24);
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.65, 1.8, 0);
    leftArm.add(new THREE.Mesh(armGeo, vestMat));
    bodyAnchor.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.65, 1.8, 0);
    rightArm.add(new THREE.Mesh(armGeo, vestMat));

    // Wooden Broom Prop
    const broom = new THREE.Group();
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
    const broomHandle = new THREE.Mesh(handleGeo, this.materials.treeTrunk);
    broomHandle.position.y = 0.4;
    broom.add(broomHandle);

    const strawGeo = new THREE.ConeGeometry(0.25, 0.5, 8);
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
    const broomStraw = new THREE.Mesh(strawGeo, strawMat);
    broomStraw.position.y = 1.35;
    broom.add(broomStraw);

    broom.rotation.x = Math.PI / 4;
    broom.position.set(0, -0.6, 0.3);
    rightArm.add(broom);

    bodyAnchor.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.3, 0.85, 0.3);
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.28, 0.85, 0);
    leftLeg.add(new THREE.Mesh(legGeo, pantsMat));
    bodyAnchor.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.28, 0.85, 0);
    rightLeg.add(new THREE.Mesh(legGeo, pantsMat));
    bodyAnchor.add(rightLeg);

    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isChasing: boolean,
      _kicking: boolean,
      _spraying: boolean,
      _lookout: boolean,
      facingAngle: number,
      yElevation: number
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      bodyAnchor.position.y = yElevation;

      if (isChasing) {
        // Angrily shaking broom in the air
        rightArm.rotation.x = -Math.PI / 1.5 + Math.sin(walkFrame * 12) * 0.4;
        leftArm.rotation.x = Math.sin(walkFrame * 10) * 0.6;
        const swing = Math.sin(walkFrame * 10) * 0.7;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        torso.rotation.x = 0.25;
      } else if (isMoving) {
        const swing = Math.sin(walkFrame * 5) * 0.45;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        leftArm.rotation.x = -swing * 0.6;
        rightArm.rotation.x = swing * 0.6;
      } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        rightArm.rotation.x = 0;
      }
    };

    return { root, head, torso, leftArm, rightArm, leftLeg, rightLeg, shadowDisc: shadow, updateAnimation };
  }

  // --- MRS. GABLE: Pink housecoat, hair rollers, wielding rolling pin ---
  public createGableMesh(): CharacterMeshHandle {
    const root = new THREE.Group();
    root.name = 'MrsGable';

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.6 });
    const robeMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.7 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const rollerMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4 });

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.8, 16), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyAnchor = new THREE.Group();
    root.add(bodyAnchor);

    // Housecoat Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.25, 0.7), robeMat);
    torso.position.y = 1.35;
    bodyAnchor.add(torso);

    // Head
    const head = new THREE.Group();
    head.position.set(0, 2.2, 0);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), skinMat);
    head.add(headMesh);

    // Gray curly hair with pink curlers
    const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.46, 8, 8, 0, Math.PI * 2, 0, Math.PI / 1.7), hairMat);
    head.add(hairMesh);

    // 4 Pink Rollers
    for (let i = 0; i < 4; i++) {
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 6), rollerMat);
      roller.rotation.z = Math.PI / 2;
      const angle = (i * Math.PI) / 3 - Math.PI / 3;
      roller.position.set(Math.sin(angle) * 0.4, 0.35, Math.cos(angle) * 0.35);
      head.add(roller);
    }
    bodyAnchor.add(head);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.24, 0.8, 0.24);
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.68, 1.75, 0);
    leftArm.add(new THREE.Mesh(armGeo, robeMat));
    bodyAnchor.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.68, 1.75, 0);
    rightArm.add(new THREE.Mesh(armGeo, robeMat));

    // Wooden Rolling Pin
    const pinGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 8);
    const pin = new THREE.Mesh(pinGeo, this.materials.treeTrunk);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(0, -0.5, 0.25);
    rightArm.add(pin);
    bodyAnchor.add(rightArm);

    // Legs / Robe Hem
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.26, 0.75, 0);
    leftLeg.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 0.28), skinMat));
    bodyAnchor.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.26, 0.75, 0);
    rightLeg.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.75, 0.28), skinMat));
    bodyAnchor.add(rightLeg);

    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isChasing: boolean,
      _kicking: boolean,
      _spraying: boolean,
      _lookout: boolean,
      facingAngle: number,
      yElevation: number
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      bodyAnchor.position.y = yElevation;

      if (isChasing) {
        rightArm.rotation.x = -Math.PI / 1.6 + Math.sin(walkFrame * 12) * 0.4;
        const swing = Math.sin(walkFrame * 9) * 0.65;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
      } else if (isMoving) {
        const swing = Math.sin(walkFrame * 5) * 0.4;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
      }
    };

    return { root, head, torso, leftArm, rightArm, leftLeg, rightLeg, shadowDisc: shadow, updateAnimation };
  }

  // --- OFFICER HIGGINS ON HIS BICYCLE PATROL ---
  public createHigginsBicycleMesh(): BicycleMeshHandle {
    const root = new THREE.Group();
    root.name = 'OfficerHigginsBicycle';

    const uniformMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5 });
    const bikeFrameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.8 });
    const tireMat = this.materials.carTire;

    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.2), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bikeGroup = new THREE.Group();
    root.add(bikeGroup);

    // Front Wheel
    const wheelGeo = new THREE.TorusGeometry(0.55, 0.08, 8, 20);
    const frontWheel = new THREE.Mesh(wheelGeo, tireMat);
    frontWheel.position.set(0, 0.55, 1.1);
    bikeGroup.add(frontWheel);

    // Back Wheel
    const backWheel = new THREE.Mesh(wheelGeo, tireMat);
    backWheel.position.set(0, 0.55, -1.1);
    bikeGroup.add(backWheel);

    // Bike Frame Bars
    const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6);
    const topTube = new THREE.Mesh(barGeo, bikeFrameMat);
    topTube.rotation.x = Math.PI / 2;
    topTube.position.set(0, 1.15, 0);
    bikeGroup.add(topTube);

    const downTube = new THREE.Mesh(barGeo, bikeFrameMat);
    downTube.rotation.x = Math.PI / 3.8;
    downTube.position.set(0, 0.85, 0.4);
    bikeGroup.add(downTube);

    // Handlebars
    const barCross = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.06), bikeFrameMat);
    barCross.position.set(0, 1.45, 0.95);
    bikeGroup.add(barCross);

    // Flashing Siren Beacon on rear rack
    const sirenGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.3, 8);
    const sirenMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const sirenLight = new THREE.Mesh(sirenGeo, sirenMat);
    sirenLight.position.set(0, 1.35, -1.1);
    bikeGroup.add(sirenLight);

    // Pedals
    const pedals = new THREE.Group();
    pedals.position.set(0, 0.55, 0);
    const crank = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.06), bikeFrameMat);
    pedals.add(crank);
    bikeGroup.add(pedals);

    // --- Officer Higgins Riding the Bike ---
    const rider = new THREE.Group();
    rider.position.set(0, 0.6, 0);
    bikeGroup.add(rider);

    // Torso (leaning slightly into handlebars)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.55), uniformMat);
    torso.position.set(0, 1.35, -0.15);
    torso.rotation.x = 0.25;
    rider.add(torso);

    // Police Cap & Head
    const head = new THREE.Group();
    head.position.set(0, 2.1, 0.05);
    head.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), skinMat));

    // Police peaked hat
    const hatGeo = new THREE.CylinderGeometry(0.46, 0.42, 0.25, 10);
    const hat = new THREE.Mesh(hatGeo, uniformMat);
    hat.position.y = 0.22;
    head.add(hat);

    // Gold Police Shield
    const badge = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.2), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    badge.position.set(0, 0.26, 0.45);
    head.add(badge);

    rider.add(head);

    // Arms gripping handlebars
    const armGeo = new THREE.BoxGeometry(0.22, 0.75, 0.22);
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.55, 1.6, 0);
    leftArm.rotation.x = -Math.PI / 3;
    leftArm.add(new THREE.Mesh(armGeo, uniformMat));
    rider.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.55, 1.6, 0);
    rightArm.rotation.x = -Math.PI / 3;
    rightArm.add(new THREE.Mesh(armGeo, uniformMat));
    rider.add(rightArm);

    // Legs pedaling
    const legGeo = new THREE.BoxGeometry(0.26, 0.7, 0.26);
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.25, 0.8, -0.15);
    leftLeg.add(new THREE.Mesh(legGeo, uniformMat));
    rider.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.25, 0.8, -0.15);
    rightLeg.add(new THREE.Mesh(legGeo, uniformMat));
    rider.add(rightLeg);

    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isChasing: boolean,
      _kicking: boolean,
      _spraying: boolean,
      _lookout: boolean,
      facingAngle: number,
      yElevation: number
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      root.position.y = yElevation;

      // Wheel & pedal rotation
      const spin = isMoving ? (isChasing ? 18 : 10) : 0;
      frontWheel.rotation.x += spin * 0.016;
      backWheel.rotation.x += spin * 0.016;
      pedals.rotation.x += spin * 0.016;

      // Flashing siren light (alternates red / blue)
      if (isChasing) {
        const isRed = Math.floor(walkFrame * 8) % 2 === 0;
        (sirenLight.material as THREE.MeshBasicMaterial).color.setHex(isRed ? 0xef4444 : 0x3b82f6);
      } else {
        (sirenLight.material as THREE.MeshBasicMaterial).color.setHex(0x3b82f6);
      }

      leftLeg.rotation.x = Math.sin(pedals.rotation.x) * 0.4;
      rightLeg.rotation.x = -Math.sin(pedals.rotation.x) * 0.4;
    };

    return {
      root,
      head,
      torso,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      shadowDisc: shadow,
      frontWheel,
      backWheel,
      pedals,
      sirenLight,
      updateAnimation,
    };
  }

  // --- BUSTER: Chunky English Bulldog ---
  public createBusterMesh(): CharacterMeshHandle {
    const root = new THREE.Group();
    root.name = 'BusterTheBulldog';

    const dogFurMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
    const whiteFurMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.7 });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.7, 16), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyAnchor = new THREE.Group();
    root.add(bodyAnchor);

    // Chunky Barrel Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 1.1), dogFurMat);
    torso.position.y = 0.55;
    torso.castShadow = true;
    bodyAnchor.add(torso);

    // White chest patch
    const chest = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.45), whiteFurMat);
    chest.position.set(0, 0.55, 0.56);
    bodyAnchor.add(chest);

    // Big wrinkly bulldog head
    const head = new THREE.Group();
    head.position.set(0, 0.85, 0.65);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.55), dogFurMat);
    head.add(headMesh);

    // Jowls / Muzzle
    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.28), whiteFurMat);
    muzzle.position.set(0, -0.1, 0.32);
    head.add(muzzle);

    // Floppy ears
    const earGeo = new THREE.BoxGeometry(0.18, 0.26, 0.08);
    const lEar = new THREE.Mesh(earGeo, dogFurMat);
    lEar.position.set(-0.35, 0.15, 0.05);
    lEar.rotation.z = 0.3;
    head.add(lEar);

    const rEar = new THREE.Mesh(earGeo, dogFurMat);
    rEar.position.set(0.35, 0.15, 0.05);
    rEar.rotation.z = -0.3;
    head.add(rEar);

    // Red Spiked Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 6, 12), collarMat);
    collar.position.set(0, -0.15, -0.1);
    head.add(collar);

    bodyAnchor.add(head);

    // Wagging tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.35, 6), dogFurMat);
    tail.rotation.x = -Math.PI / 4;
    tail.position.set(0, 0.7, -0.6);
    bodyAnchor.add(tail);

    // 4 Stubby scampering legs
    const legGeo = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const frontLeftLeg = new THREE.Group();
    frontLeftLeg.position.set(-0.3, 0.3, 0.35);
    frontLeftLeg.add(new THREE.Mesh(legGeo, dogFurMat));
    bodyAnchor.add(frontLeftLeg);

    const frontRightLeg = new THREE.Group();
    frontRightLeg.position.set(0.3, 0.3, 0.35);
    frontRightLeg.add(new THREE.Mesh(legGeo, dogFurMat));
    bodyAnchor.add(frontRightLeg);

    const backLeftLeg = new THREE.Group();
    backLeftLeg.position.set(-0.3, 0.3, -0.35);
    backLeftLeg.add(new THREE.Mesh(legGeo, dogFurMat));
    bodyAnchor.add(backLeftLeg);

    const backRightLeg = new THREE.Group();
    backRightLeg.position.set(0.3, 0.3, -0.35);
    backRightLeg.add(new THREE.Mesh(legGeo, dogFurMat));
    bodyAnchor.add(backRightLeg);

    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isChasing: boolean,
      _kicking: boolean,
      _spraying: boolean,
      _lookout: boolean,
      facingAngle: number,
      yElevation: number
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      bodyAnchor.position.y = yElevation;

      // Tail wagging
      tail.rotation.y = Math.sin(walkFrame * 15) * 0.5;

      if (isMoving) {
        const speed = isChasing ? 16 : 8;
        const swing = Math.sin(walkFrame * speed) * 0.6;
        frontLeftLeg.rotation.x = swing;
        frontRightLeg.rotation.x = -swing;
        backLeftLeg.rotation.x = -swing;
        backRightLeg.rotation.x = swing;
      } else {
        frontLeftLeg.rotation.x = 0;
        frontRightLeg.rotation.x = 0;
        backLeftLeg.rotation.x = 0;
        backRightLeg.rotation.x = 0;
      }
    };

    return {
      root,
      head,
      torso,
      leftArm: frontLeftLeg,
      rightArm: frontRightLeg,
      leftLeg: backLeftLeg,
      rightLeg: backRightLeg,
      shadowDisc: shadow,
      updateAnimation,
    };
  }

  // --- SECURITY GUARD: Officer Vance at the Billionaire Heights Estate ---
  public createGuardMesh(): CharacterMeshHandle {
    const root = new THREE.Group();
    root.name = 'SecurityGuard';

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.5 });
    const uniformMat = this.materials.guardNavy;
    const goldMat = this.materials.goldRail;
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    // Contact shadow
    const shadowGeo = new THREE.CircleGeometry(0.85, 16);
    const shadow = new THREE.Mesh(shadowGeo, this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyAnchor = new THREE.Group();
    root.add(bodyAnchor);

    // Torso (Navy Blazer with Tie & Gold Badge)
    const torsoGeo = new THREE.BoxGeometry(1.0, 1.25, 0.6);
    const torso = new THREE.Mesh(torsoGeo, uniformMat);
    torso.position.y = 1.45;
    torso.castShadow = true;
    bodyAnchor.add(torso);

    // White shirt collar
    const shirtGeo = new THREE.BoxGeometry(0.35, 0.3, 0.1);
    const shirt = new THREE.Mesh(shirtGeo, whiteMat);
    shirt.position.set(0, 1.95, 0.28);
    bodyAnchor.add(shirt);

    // Gold Security Star Badge
    const badgeGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 6);
    badgeGeo.rotateX(Math.PI / 2);
    const badge = new THREE.Mesh(badgeGeo, goldMat);
    badge.position.set(-0.3, 1.75, 0.32);
    bodyAnchor.add(badge);

    // Head
    const head = new THREE.Group();
    head.position.set(0, 2.35, 0);

    const headGeo = new THREE.SphereGeometry(0.44, 10, 8);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    head.add(headMesh);

    // Stern security eyebrows and aviator shades
    const shadesGeo = new THREE.BoxGeometry(0.52, 0.16, 0.1);
    const shades = new THREE.Mesh(shadesGeo, blackMat);
    shades.position.set(0, 0.06, 0.42);
    head.add(shades);

    // Security Visor Cap
    const capGeo = new THREE.CylinderGeometry(0.48, 0.44, 0.3, 16);
    const cap = new THREE.Mesh(capGeo, uniformMat);
    cap.position.y = 0.32;
    head.add(cap);

    // Gold Cap Badge
    const capBadge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.04), goldMat);
    capBadge.position.set(0, 0.34, 0.48);
    head.add(capBadge);

    // Black Visor Brim
    const visorGeo = new THREE.BoxGeometry(0.55, 0.06, 0.35);
    const visor = new THREE.Mesh(visorGeo, blackMat);
    visor.position.set(0, 0.2, 0.5);
    head.add(visor);

    bodyAnchor.add(head);

    // Left Arm
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.68, 1.85, 0);
    const armGeo = new THREE.BoxGeometry(0.26, 0.9, 0.26);
    const lArmMesh = new THREE.Mesh(armGeo, uniformMat);
    lArmMesh.position.y = -0.45;
    leftArm.add(lArmMesh);
    bodyAnchor.add(leftArm);

    // Right Arm with Flashlight
    const rightArm = new THREE.Group();
    rightArm.position.set(0.68, 1.85, 0);
    const rArmMesh = new THREE.Mesh(armGeo, uniformMat);
    rArmMesh.position.y = -0.45;
    rightArm.add(rArmMesh);

    // Heavy duty tactical flashlight
    const flashlight = new THREE.Group();
    flashlight.position.set(0, -0.9, 0.3);

    const flBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.45, 8), blackMat);
    flBody.rotation.x = Math.PI / 2;
    flashlight.add(flBody);

    const flHead = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.09, 0.15, 8), goldMat);
    flHead.rotation.x = Math.PI / 2;
    flHead.position.z = 0.28;
    flashlight.add(flHead);

    // Volumetric yellow light beam cone
    const beamGeo = new THREE.ConeGeometry(2.5, 12, 16, 1, true);
    beamGeo.rotateX(-Math.PI / 2);
    beamGeo.translate(0, 0, 6);
    const beam = new THREE.Mesh(beamGeo, this.materials.flashlightCone);
    flashlight.add(beam);

    rightArm.add(flashlight);
    bodyAnchor.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.3, 0.95, 0.32);
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.25, 0.85, 0);
    const lLegMesh = new THREE.Mesh(legGeo, uniformMat);
    lLegMesh.position.y = -0.45;
    leftLeg.add(lLegMesh);
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.5), blackMat);
    lShoe.position.set(0, -0.9, 0.1);
    leftLeg.add(lShoe);
    bodyAnchor.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.25, 0.85, 0);
    const rLegMesh = new THREE.Mesh(legGeo, uniformMat);
    rLegMesh.position.y = -0.45;
    rightLeg.add(rLegMesh);
    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.2, 0.5), blackMat);
    rShoe.position.set(0, -0.9, 0.1);
    rightLeg.add(rShoe);
    bodyAnchor.add(rightLeg);

    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isChasing: boolean,
      _isKicking: boolean,
      _isSpraying: boolean,
      _isLookout: boolean,
      facingAngle: number,
      yElevation: number
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      bodyAnchor.position.y = yElevation;

      if (isChasing) {
        // Aggressive forward beam aiming and power run
        rightArm.rotation.x = -Math.PI / 2.5;
        rightArm.rotation.y = -0.2;
        beam.visible = true;
        const swing = Math.sin(walkFrame * 14) * 0.9;
        leftArm.rotation.x = swing;
        leftLeg.rotation.x = -swing;
        rightLeg.rotation.x = swing;
        torso.rotation.x = 0.25;
      } else if (isMoving) {
        // Steady patrol sweeping flashlight left and right
        rightArm.rotation.x = -Math.PI / 3.5;
        rightArm.rotation.y = Math.sin(walkFrame * 3) * 0.4;
        const swing = Math.sin(walkFrame * 8) * 0.55;
        leftArm.rotation.x = -swing;
        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;
        torso.rotation.x = 0.08;
      } else {
        rightArm.rotation.x = -Math.PI / 4 + Math.sin(walkFrame * 2) * 0.1;
        leftArm.rotation.x = 0;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        torso.rotation.x = 0;
      }
    };

    return {
      root,
      head,
      torso,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      shadowDisc: shadow,
      updateAnimation,
    };
  }

  // --- BRUNO: German Shepherd Guard Dog at Billionaire Heights ---
  public createBrunoMesh(): CharacterMeshHandle {
    const root = new THREE.Group();
    root.name = 'Bruno_GermanShepherd';

    const furTan = this.materials.dogFurTan;
    const furBlack = this.materials.dogFurBlack;
    const tongueMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    // Contact shadow
    const shadowGeo = new THREE.CircleGeometry(1.1, 16);
    const shadow = new THREE.Mesh(shadowGeo, this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyAnchor = new THREE.Group();
    root.add(bodyAnchor);

    // Torso (Sleek, athletic chest & black saddle)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.75, 1.4);
    const torso = new THREE.Mesh(torsoGeo, furBlack);
    torso.position.y = 0.85;
    torso.castShadow = true;
    bodyAnchor.add(torso);

    // Underbelly (tan)
    const bellyGeo = new THREE.BoxGeometry(0.65, 0.25, 1.35);
    const belly = new THREE.Mesh(bellyGeo, furTan);
    belly.position.set(0, 0.55, 0);
    bodyAnchor.add(belly);

    // Neck & Head
    const head = new THREE.Group();
    head.position.set(0, 1.25, 0.7);

    const neckGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const neck = new THREE.Mesh(neckGeo, furTan);
    neck.position.set(0, 0, -0.15);
    head.add(neck);

    // Head base
    const headGeo = new THREE.BoxGeometry(0.55, 0.5, 0.6);
    const headMesh = new THREE.Mesh(headGeo, furTan);
    headMesh.position.set(0, 0.2, 0.1);
    head.add(headMesh);

    // Black muzzle
    const muzzleGeo = new THREE.BoxGeometry(0.35, 0.3, 0.45);
    const muzzle = new THREE.Mesh(muzzleGeo, furBlack);
    muzzle.position.set(0, 0.12, 0.48);
    head.add(muzzle);

    // Black nose tip
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.08), furBlack);
    nose.position.set(0, 0.24, 0.72);
    head.add(nose);

    // Pink panting tongue
    const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.25), tongueMat);
    tongue.position.set(0, 0.02, 0.52);
    head.add(tongue);

    // Pointed Triangular Ears
    const earGeo = new THREE.ConeGeometry(0.14, 0.4, 4);
    earGeo.rotateY(Math.PI / 4);

    const leftEar = new THREE.Mesh(earGeo, furBlack);
    leftEar.position.set(-0.2, 0.55, 0.05);
    leftEar.rotation.z = -0.15;
    head.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, furBlack);
    rightEar.position.set(0.2, 0.55, 0.05);
    rightEar.rotation.z = 0.15;
    head.add(rightEar);

    // Red Nylon Collar with Silver Tag
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 12), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
    collar.position.set(0, 0.02, 0);
    head.add(collar);

    bodyAnchor.add(head);

    // Bushy Tail
    const tail = new THREE.Group();
    tail.position.set(0, 0.95, -0.7);
    const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.8, 8), furBlack);
    tailMesh.rotation.x = -Math.PI / 3;
    tailMesh.position.set(0, 0.25, -0.3);
    tail.add(tailMesh);
    bodyAnchor.add(tail);

    // 4 Athletic Running Legs
    const legGeo = new THREE.BoxGeometry(0.2, 0.65, 0.22);

    const frontLeftLeg = new THREE.Group();
    frontLeftLeg.position.set(-0.26, 0.6, 0.5);
    const flMesh = new THREE.Mesh(legGeo, furTan);
    flMesh.position.y = -0.3;
    frontLeftLeg.add(flMesh);
    bodyAnchor.add(frontLeftLeg);

    const frontRightLeg = new THREE.Group();
    frontRightLeg.position.set(0.26, 0.6, 0.5);
    const frMesh = new THREE.Mesh(legGeo, furTan);
    frMesh.position.y = -0.3;
    frontRightLeg.add(frMesh);
    bodyAnchor.add(frontRightLeg);

    const backLeftLeg = new THREE.Group();
    backLeftLeg.position.set(-0.26, 0.6, -0.5);
    const blMesh = new THREE.Mesh(legGeo, furTan);
    blMesh.position.y = -0.3;
    backLeftLeg.add(blMesh);
    bodyAnchor.add(backLeftLeg);

    const backRightLeg = new THREE.Group();
    backRightLeg.position.set(0.26, 0.6, -0.5);
    const brMesh = new THREE.Mesh(legGeo, furTan);
    brMesh.position.y = -0.3;
    backRightLeg.add(brMesh);
    bodyAnchor.add(backRightLeg);

    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isChasing: boolean,
      _isKicking: boolean,
      _isSpraying: boolean,
      _isLookout: boolean,
      facingAngle: number,
      yElevation: number
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      bodyAnchor.position.y = yElevation;

      // Tail wagging
      tail.rotation.y = Math.sin(walkFrame * (isChasing ? 20 : 8)) * 0.6;

      if (isChasing) {
        // Fast galloping bounds
        const gallop = Math.sin(walkFrame * 18);
        frontLeftLeg.rotation.x = gallop * 0.85;
        frontRightLeg.rotation.x = -gallop * 0.85;
        backLeftLeg.rotation.x = -gallop * 0.85;
        backRightLeg.rotation.x = gallop * 0.85;
        bodyAnchor.position.y = yElevation + Math.abs(Math.sin(walkFrame * 18)) * 0.25;
        head.rotation.x = 0.2 + Math.sin(walkFrame * 18) * 0.15;
      } else if (isMoving) {
        const swing = Math.sin(walkFrame * 9) * 0.5;
        frontLeftLeg.rotation.x = swing;
        frontRightLeg.rotation.x = -swing;
        backLeftLeg.rotation.x = -swing;
        backRightLeg.rotation.x = swing;
        head.rotation.x = 0;
      } else {
        frontLeftLeg.rotation.x = 0;
        frontRightLeg.rotation.x = 0;
        backLeftLeg.rotation.x = 0;
        backRightLeg.rotation.x = 0;
        head.rotation.x = Math.sin(walkFrame * 3) * 0.08;
      }
    };

    return {
      root,
      head,
      torso,
      leftArm: frontLeftLeg,
      rightArm: frontRightLeg,
      leftLeg: backLeftLeg,
      rightLeg: backRightLeg,
      shadowDisc: shadow,
      updateAnimation,
    };
  }

  // --- CLEO: Cranky Yard Cat perched on fence ---
  public createCleoMesh(): CharacterMeshHandle {
    const root = new THREE.Group();
    root.name = 'Cleo_Cat';

    const furMat = this.materials.catCalico;
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x84cc16 });

    // Contact shadow
    const shadowGeo = new THREE.CircleGeometry(0.65, 16);
    const shadow = new THREE.Mesh(shadowGeo, this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyAnchor = new THREE.Group();
    root.add(bodyAnchor);

    // Torso (Sleek feline body with arched back)
    const torsoGeo = new THREE.BoxGeometry(0.45, 0.45, 0.9);
    const torso = new THREE.Mesh(torsoGeo, furMat);
    torso.position.y = 0.5;
    torso.castShadow = true;
    bodyAnchor.add(torso);

    // White chest patch
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.3), whiteMat);
    chest.position.set(0, 0.45, 0.35);
    bodyAnchor.add(chest);

    // Head
    const head = new THREE.Group();
    head.position.set(0, 0.75, 0.5);

    const headGeo = new THREE.SphereGeometry(0.28, 8, 8);
    const headMesh = new THREE.Mesh(headGeo, furMat);
    head.add(headMesh);

    // Green cat eyes
    const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const lEye = new THREE.Mesh(eyeGeo, eyeMat);
    lEye.position.set(-0.12, 0.05, 0.22);
    head.add(lEye);

    const rEye = new THREE.Mesh(eyeGeo, eyeMat);
    rEye.position.set(0.12, 0.05, 0.22);
    head.add(rEye);

    // Triangular Ears
    const earGeo = new THREE.ConeGeometry(0.09, 0.2, 4);
    const lEar = new THREE.Mesh(earGeo, furMat);
    lEar.position.set(-0.14, 0.3, 0);
    lEar.rotation.z = -0.2;
    head.add(lEar);

    const rEar = new THREE.Mesh(earGeo, furMat);
    rEar.position.set(0.14, 0.3, 0);
    rEar.rotation.z = 0.2;
    head.add(rEar);

    bodyAnchor.add(head);

    // Long Arching Tail
    const tail = new THREE.Group();
    tail.position.set(0, 0.6, -0.45);
    const tailMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.65, 8), furMat);
    tailMesh.rotation.x = Math.PI / 3;
    tailMesh.position.set(0, 0.25, -0.15);
    tail.add(tailMesh);
    bodyAnchor.add(tail);

    // 4 Paws
    const pawGeo = new THREE.BoxGeometry(0.14, 0.4, 0.14);

    const frontLeft = new THREE.Group();
    frontLeft.position.set(-0.16, 0.35, 0.3);
    const flP = new THREE.Mesh(pawGeo, whiteMat);
    flP.position.y = -0.18;
    frontLeft.add(flP);
    bodyAnchor.add(frontLeft);

    const frontRight = new THREE.Group();
    frontRight.position.set(0.16, 0.35, 0.3);
    const frP = new THREE.Mesh(pawGeo, whiteMat);
    frP.position.y = -0.18;
    frontRight.add(frP);
    bodyAnchor.add(frontRight);

    const backLeft = new THREE.Group();
    backLeft.position.set(-0.16, 0.35, -0.3);
    const blP = new THREE.Mesh(pawGeo, furMat);
    blP.position.y = -0.18;
    backLeft.add(blP);
    bodyAnchor.add(backLeft);

    const backRight = new THREE.Group();
    backRight.position.set(0.16, 0.35, -0.3);
    const brP = new THREE.Mesh(pawGeo, furMat);
    brP.position.y = -0.18;
    backRight.add(brP);
    bodyAnchor.add(backRight);

    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isChasing: boolean,
      _isKicking: boolean,
      _isSpraying: boolean,
      _isLookout: boolean,
      facingAngle: number,
      yElevation: number
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      bodyAnchor.position.y = yElevation;

      // Restless feline tail swish
      tail.rotation.z = Math.sin(walkFrame * 6) * 0.45;

      if (isChasing) {
        // Fast pouncing sprint
        const run = Math.sin(walkFrame * 18);
        frontLeft.rotation.x = run * 0.7;
        frontRight.rotation.x = -run * 0.7;
        backLeft.rotation.x = -run * 0.7;
        backRight.rotation.x = run * 0.7;
        torso.position.y = 0.5 + Math.abs(Math.sin(walkFrame * 18)) * 0.15;
      } else if (isMoving) {
        const sneak = Math.sin(walkFrame * 8) * 0.4;
        frontLeft.rotation.x = sneak;
        frontRight.rotation.x = -sneak;
        backLeft.rotation.x = -sneak;
        backRight.rotation.x = sneak;
      } else {
        frontLeft.rotation.x = 0;
        frontRight.rotation.x = 0;
        backLeft.rotation.x = 0;
        backRight.rotation.x = 0;
        head.rotation.y = Math.sin(walkFrame * 2) * 0.2;
      }
    };

    return {
      root,
      head,
      torso,
      leftArm: frontLeft,
      rightArm: frontRight,
      leftLeg: backLeft,
      rightLeg: backRight,
      shadowDisc: shadow,
      updateAnimation,
    };
  }

  // --- RIVALS: Ziggy & Dex (Cocky rival pranksters with spiky hair, bandanas & leather jackets) ---
  public createRivalMesh(name: string = 'Ziggy', jacketColorHex: string = '#7c3aed', hairColorHex: string = '#f59e0b'): CharacterMeshHandle {
    const root = new THREE.Group();
    root.name = `Rival_${name}`;

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.5 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(jacketColorHex), roughness: 0.5 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const hairMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(hairColorHex), roughness: 0.6 });

    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.8, 16), this.materials.shadowDisc);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    root.add(shadow);

    const bodyAnchor = new THREE.Group();
    root.add(bodyAnchor);

    // Biker/Rival Vest Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.15, 0.58), jacketMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    bodyAnchor.add(torso);

    // Skull emblem on back
    const skull = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 8),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    skull.position.set(0, 1.45, -0.3);
    skull.rotation.y = Math.PI;
    bodyAnchor.add(skull);

    // Head
    const head = new THREE.Group();
    head.position.set(0, 2.2, 0);
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), skinMat);
    headMesh.castShadow = true;
    head.add(headMesh);

    // Spiky Punk Hair
    for (let i = 0; i < 5; i++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 4), hairMat);
      spike.position.set((i - 2) * 0.12, 0.42, 0.05);
      spike.rotation.z = (i - 2) * -0.15;
      head.add(spike);
    }

    // Rival Sneer Face Decal
    const faceTex = createCharacterFaceTexture('rival');
    const faceDecal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.55),
      new THREE.MeshBasicMaterial({ map: faceTex, transparent: true })
    );
    faceDecal.position.set(0, 0.02, 0.42);
    head.add(faceDecal);

    bodyAnchor.add(head);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.24, 0.85, 0.24);
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.6, 1.75, 0);
    const lArmMesh = new THREE.Mesh(armGeo, jacketMat);
    lArmMesh.position.y = -0.4;
    leftArm.add(lArmMesh);
    bodyAnchor.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.6, 1.75, 0);
    const rArmMesh = new THREE.Mesh(armGeo, jacketMat);
    rArmMesh.position.y = -0.4;
    rightArm.add(rArmMesh);
    bodyAnchor.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.28, 0.9, 0.28);
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.25, 0.9, 0);
    const lLegMesh = new THREE.Mesh(legGeo, pantsMat);
    lLegMesh.position.y = -0.45;
    leftLeg.add(lLegMesh);
    bodyAnchor.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.25, 0.9, 0);
    const rLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rLegMesh.position.y = -0.45;
    rightLeg.add(rLegMesh);
    bodyAnchor.add(rightLeg);

    const updateAnimation = (
      walkFrame: number,
      isMoving: boolean,
      isChasing: boolean,
      _isKicking: boolean,
      _isSpraying: boolean,
      _isLookout: boolean,
      facingAngle: number,
      yElevation: number
    ) => {
      root.rotation.y = -facingAngle + Math.PI / 2;
      bodyAnchor.position.y = yElevation;

      if (isMoving) {
        // Cocky swagger walk
        const speed = isChasing ? 14 : 9;
        const swing = Math.sin(walkFrame * speed);
        leftLeg.rotation.x = swing * 0.7;
        rightLeg.rotation.x = -swing * 0.7;
        leftArm.rotation.x = -swing * 0.6;
        rightArm.rotation.x = swing * 0.6;
        head.rotation.y = Math.sin(walkFrame * 4) * 0.15;
      } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0;
        rightArm.rotation.x = 0;
        head.rotation.y = 0;
      }
    };

    return { root, head, torso, leftArm, rightArm, leftLeg, rightLeg, shadowDisc: shadow, updateAnimation };
  }
}
