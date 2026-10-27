import * as THREE from 'three';
import { MaterialPalette } from './materials';
import { HOUSES, WALLS, House, WallSegment } from '../map';
import { to3DX, to3DZ } from './constants';

/**
 * Builds the complete 3D suburban cul-de-sac environment.
 * Generates terrain, roads, sidewalks, 7 detailed houses, fences, streetlights, park pond & court.
 */
export class WorldBuilder {
  private materials: MaterialPalette;
  public rootGroup: THREE.Group;
  public duckMeshes: THREE.Group[] = [];
  public streetLightGlows: THREE.Mesh[] = [];
  public grandOakTPStreamers: THREE.Mesh[] = [];

  constructor(materials: MaterialPalette) {
    this.materials = materials;
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'SuburbanWorld';

    this.buildTerrainAndRoads();
    this.buildHouses();
    this.buildFencesAndWalls();
    this.buildCentralPark();
    this.buildStreetlights();
    this.buildNeighborhoodTrees();
    this.buildFireHydrants();
  }

  // --- Terrain, Roads, and Sidewalks ---
  private buildTerrainAndRoads() {
    // 1. Vast Suburban Grass Base (350m x 260m)
    const grassGeo = new THREE.PlaneGeometry(360, 280, 8, 8);
    const grassMesh = new THREE.Mesh(grassGeo, this.materials.grass);
    grassMesh.rotation.x = -Math.PI / 2;
    grassMesh.position.set(0, -0.05, 0);
    grassMesh.receiveShadow = true;
    this.rootGroup.add(grassMesh);

    // 2. North Maple Way Road (Z: -48, width 18m, X from -140 to +90)
    const northRoadGeo = new THREE.PlaneGeometry(240, 18);
    const northRoad = new THREE.Mesh(northRoadGeo, this.materials.road);
    northRoad.rotation.x = -Math.PI / 2;
    northRoad.position.set(-20, 0.01, -48);
    northRoad.receiveShadow = true;
    this.rootGroup.add(northRoad);

    // North Maple Way - North Sidewalk & Curb (along house front yards)
    const nWalkNGeo = new THREE.BoxGeometry(240, 0.15, 3.5);
    const nWalkN = new THREE.Mesh(nWalkNGeo, this.materials.sidewalk);
    nWalkN.position.set(-20, 0.08, -58.5);
    nWalkN.receiveShadow = true;
    this.rootGroup.add(nWalkN);

    const nCurbNGeo = new THREE.BoxGeometry(240, 0.18, 0.35);
    const nCurbN = new THREE.Mesh(nCurbNGeo, this.materials.curb);
    nCurbN.position.set(-20, 0.09, -57.0);
    this.rootGroup.add(nCurbN);

    // North Maple Way - South Sidewalk & Curb (facing central park)
    const nWalkSGeo = new THREE.BoxGeometry(240, 0.15, 3.5);
    const nWalkS = new THREE.Mesh(nWalkSGeo, this.materials.sidewalk);
    nWalkS.position.set(-20, 0.08, -37.5);
    nWalkS.receiveShadow = true;
    this.rootGroup.add(nWalkS);

    const nCurbSGeo = new THREE.BoxGeometry(240, 0.18, 0.35);
    const nCurbS = new THREE.Mesh(nCurbSGeo, this.materials.curb);
    nCurbS.position.set(-20, 0.09, -39.0);
    this.rootGroup.add(nCurbS);

    // 3. South Maple Way Road (Z: +48, width 18m, X from -140 to +90)
    const southRoadGeo = new THREE.PlaneGeometry(240, 18);
    const southRoad = new THREE.Mesh(southRoadGeo, this.materials.road);
    southRoad.rotation.x = -Math.PI / 2;
    southRoad.position.set(-20, 0.01, 48);
    southRoad.receiveShadow = true;
    this.rootGroup.add(southRoad);

    // South Maple Way - North Sidewalk & Curb
    const sWalkNGeo = new THREE.BoxGeometry(240, 0.15, 3.5);
    const sWalkN = new THREE.Mesh(sWalkNGeo, this.materials.sidewalk);
    sWalkN.position.set(-20, 0.08, 37.5);
    sWalkN.receiveShadow = true;
    this.rootGroup.add(sWalkN);

    const sCurbNGeo = new THREE.BoxGeometry(240, 0.18, 0.35);
    const sCurbN = new THREE.Mesh(sCurbNGeo, this.materials.curb);
    sCurbN.position.set(-20, 0.09, 39.0);
    this.rootGroup.add(sCurbN);

    // South Maple Way - South Sidewalk & Curb (along South houses)
    const sWalkSGeo = new THREE.BoxGeometry(240, 0.15, 3.5);
    const sWalkS = new THREE.Mesh(sWalkSGeo, this.materials.sidewalk);
    sWalkS.position.set(-20, 0.08, 58.5);
    sWalkS.receiveShadow = true;
    this.rootGroup.add(sWalkS);

    const sCurbSGeo = new THREE.BoxGeometry(240, 0.18, 0.35);
    const sCurbS = new THREE.Mesh(sCurbSGeo, this.materials.curb);
    sCurbS.position.set(-20, 0.09, 57.0);
    this.rootGroup.add(sCurbS);

    // 4. West Connector Avenue (linking North and South streets: X = -135, Z from -48 to +48)
    const westAveGeo = new THREE.PlaneGeometry(18, 114);
    const westAve = new THREE.Mesh(westAveGeo, this.materials.road);
    westAve.rotation.x = -Math.PI / 2;
    westAve.position.set(-135, 0.011, 0);
    westAve.receiveShadow = true;
    this.rootGroup.add(westAve);

    // 5. East Cul-de-Sac Roundabout Bulb (Circle at east end)
    const bulbGeo = new THREE.CircleGeometry(46, 32);
    const bulbMesh = new THREE.Mesh(bulbGeo, this.materials.road);
    bulbMesh.rotation.x = -Math.PI / 2;
    bulbMesh.position.set(100, 0.012, 0);
    bulbMesh.receiveShadow = true;
    this.rootGroup.add(bulbMesh);

    // Roundabout Center Island (Green lawn circle)
    const islandGeo = new THREE.CylinderGeometry(18, 18, 0.25, 32);
    const islandMesh = new THREE.Mesh(islandGeo, this.materials.darkGrass);
    islandMesh.position.set(100, 0.12, 0);
    islandMesh.receiveShadow = true;
    this.rootGroup.add(islandMesh);

    // Island Curb
    const islandCurbGeo = new THREE.TorusGeometry(18, 0.35, 8, 32);
    const islandCurb = new THREE.Mesh(islandCurbGeo, this.materials.curb);
    islandCurb.rotation.x = Math.PI / 2;
    islandCurb.position.set(100, 0.15, 0);
    this.rootGroup.add(islandCurb);

    // East curve connection paths
    const eastTurnNorthGeo = new THREE.PlaneGeometry(28, 50);
    const eastTurnNorth = new THREE.Mesh(eastTurnNorthGeo, this.materials.road);
    eastTurnNorth.rotation.x = -Math.PI / 2;
    eastTurnNorth.position.set(90, 0.011, -25);
    this.rootGroup.add(eastTurnNorth);

    const eastTurnSouthGeo = new THREE.PlaneGeometry(28, 50);
    const eastTurnSouth = new THREE.Mesh(eastTurnSouthGeo, this.materials.road);
    eastTurnSouth.rotation.x = -Math.PI / 2;
    eastTurnSouth.position.set(90, 0.011, 25);
    this.rootGroup.add(eastTurnSouth);

    // 6. Central Boulevard (Z = 0, connecting park to west avenue & roundabout)
    const centerRoadGeo = new THREE.PlaneGeometry(220, 16);
    const centerRoad = new THREE.Mesh(centerRoadGeo, this.materials.road);
    centerRoad.rotation.x = -Math.PI / 2;
    centerRoad.position.set(-20, 0.01, 0);
    centerRoad.receiveShadow = true;
    this.rootGroup.add(centerRoad);
  }

  // --- 7 Detailed Suburban Houses ---
  private buildHouses() {
    HOUSES.forEach((house) => {
      const houseGroup = this.createHouseMesh(house);
      this.rootGroup.add(houseGroup);
    });
  }

  private createHouseMesh(house: House): THREE.Group {
    const group = new THREE.Group();
    group.name = `House_${house.id}_${house.owner}`;

    const posX = to3DX(house.x + house.width / 2);
    const posZ = to3DZ(house.y + house.height / 2);
    const w = house.width * 0.1;
    const d = house.height * 0.1;
    const bodyHeight = 7.5;

    // Siding & Roof Materials
    const sidingMat = this.materials.getHouseSiding(house.color);
    const roofMat = this.materials.getHouseRoof(house.roofColor);

    // 1. Concrete Foundation Slab
    const slabGeo = new THREE.BoxGeometry(w + 1, 0.4, d + 1);
    const slabMesh = new THREE.Mesh(slabGeo, this.materials.curb);
    slabMesh.position.set(0, 0.2, 0);
    slabMesh.receiveShadow = true;
    group.add(slabMesh);

    // 2. Main House Body
    const bodyGeo = new THREE.BoxGeometry(w, bodyHeight, d);
    const bodyMesh = new THREE.Mesh(bodyGeo, sidingMat);
    bodyMesh.position.set(0, bodyHeight / 2 + 0.4, 0);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    group.add(bodyMesh);

    // 3. Pitched Gable Roof
    const roofHeight = 4.2;
    const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.72, roofHeight, 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position.set(0, bodyHeight + 0.4 + roofHeight / 2, 0);
    roofMesh.castShadow = true;
    group.add(roofMesh);

    // 4. Brick Chimney
    const chimneyGeo = new THREE.BoxGeometry(1.4, 3.2, 1.4);
    const chimneyMesh = new THREE.Mesh(chimneyGeo, this.materials.brickWall);
    chimneyMesh.position.set(w * 0.25, bodyHeight + 0.4 + roofHeight * 0.7, -d * 0.2);
    chimneyMesh.castShadow = true;
    group.add(chimneyMesh);

    // 5. Front Porch & Entrance Door
    const isNorthSide = house.y < 1100;
    const frontZ = isNorthSide ? d / 2 + 1.2 : -d / 2 - 1.2;

    const porchGeo = new THREE.BoxGeometry(7, 0.4, 3.5);
    const porchMesh = new THREE.Mesh(porchGeo, this.materials.curb);
    porchMesh.position.set(0, 0.2, frontZ);
    group.add(porchMesh);

    // Porch Roof Canopy
    const canopyGeo = new THREE.BoxGeometry(7.4, 0.4, 3.8);
    const canopyMesh = new THREE.Mesh(canopyGeo, roofMat);
    canopyMesh.position.set(0, 4.2, frontZ);
    group.add(canopyMesh);

    // Porch Pillars (Classical Marble Columns for Mansions, Wood for houses)
    const isMansion = house.id === 4 || house.id === 7;
    const pillarMat = isMansion ? this.materials.mansionMarble : this.materials.woodFence;
    const pillarRadius = isMansion ? 0.32 : 0.18;
    const pillarGeo = new THREE.CylinderGeometry(pillarRadius, pillarRadius * 1.15, 4.2, 12);

    const pillarLeft = new THREE.Mesh(pillarGeo, pillarMat);
    pillarLeft.position.set(-3.2, 2.3, frontZ + 1.4 * (isNorthSide ? 1 : -1));
    pillarLeft.castShadow = true;
    group.add(pillarLeft);

    const pillarRight = new THREE.Mesh(pillarGeo, pillarMat);
    pillarRight.position.set(3.2, 2.3, frontZ + 1.4 * (isNorthSide ? 1 : -1));
    pillarRight.castShadow = true;
    group.add(pillarRight);

    // Front Door (Golden double doors for mansion, mahogany for houses)
    const doorGeo = new THREE.BoxGeometry(2.4, 3.8, 0.2);
    const doorMat = isMansion ? this.materials.goldRail : new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 2.1, isNorthSide ? d / 2 + 0.05 : -d / 2 - 0.05);
    group.add(doorMesh);

    // Doorbell Glowing Buzzer (Right next to door)
    const buzzerGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 8);
    const buzzerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const buzzerMesh = new THREE.Mesh(buzzerGeo, buzzerMat);
    buzzerMesh.rotation.x = Math.PI / 2;
    buzzerMesh.position.set(1.4, 2.2, isNorthSide ? d / 2 + 0.1 : -d / 2 - 0.1);
    group.add(buzzerMesh);

    // Illuminated Porch Lantern
    const lanternGeo = new THREE.BoxGeometry(0.5, 0.8, 0.5);
    const lanternMesh = new THREE.Mesh(lanternGeo, this.materials.lampGlow);
    lanternMesh.position.set(-1.4, 3.0, isNorthSide ? d / 2 + 0.4 : -d / 2 - 0.4);
    group.add(lanternMesh);

    // Front Windows with Cozy Warm Light & Trim Shutters
    const winGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const winLeft = new THREE.Mesh(winGeo, this.materials.windowLit);
    winLeft.position.set(-w * 0.3, 3.2, isNorthSide ? d / 2 + 0.02 : -d / 2 - 0.02);
    if (!isNorthSide) winLeft.rotation.y = Math.PI;
    group.add(winLeft);

    const winRight = new THREE.Mesh(winGeo, this.materials.windowLit);
    winRight.position.set(w * 0.3, 3.2, isNorthSide ? d / 2 + 0.02 : -d / 2 - 0.02);
    if (!isNorthSide) winRight.rotation.y = Math.PI;
    group.add(winRight);

    // Concrete Driveway Leading to Street
    const streetZ = isNorthSide ? -48 : 48;
    const houseFrontZ = posZ + (isNorthSide ? d / 2 : -d / 2);
    const drivewayLength = Math.max(6, Math.abs(streetZ - houseFrontZ));
    const drivewayGeo = new THREE.PlaneGeometry(8, drivewayLength);
    const drivewayMesh = new THREE.Mesh(drivewayGeo, this.materials.curb);
    drivewayMesh.rotation.x = -Math.PI / 2;
    const driveZ = (houseFrontZ + streetZ) / 2;
    drivewayMesh.position.set(posX + w * 0.28, 0.02, driveZ);
    this.rootGroup.add(drivewayMesh);

    // Curbside Wooden Mailbox
    const mailbox = new THREE.Group();
    const mbPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6), this.materials.woodFence);
    mbPost.position.y = 0.7;
    mailbox.add(mbPost);

    const mbBox = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.7), this.materials.trashMetal);
    mbBox.position.set(0, 1.4, 0);
    mailbox.add(mbBox);

    const mbFlag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.1), this.materials.gnomeRed);
    mbFlag.position.set(0.24, 1.45, 0.2);
    mailbox.add(mbFlag);

    const mbZ = isNorthSide ? streetZ - 1.6 : streetZ + 1.6;
    mailbox.position.set(posX + w * 0.3 + 3.2, 0, mbZ);
    this.rootGroup.add(mailbox);

    group.position.set(posX, 0, posZ);
    return group;
  }

  // --- Fences, Walls, and Hedges ---
  private buildFencesAndWalls() {
    WALLS.forEach((wall: WallSegment) => {
      const x1 = to3DX(wall.x1);
      const z1 = to3DZ(wall.y1);
      const x2 = to3DX(wall.x2);
      const z2 = to3DZ(wall.y2);

      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dz, dx);

      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;

      let wallMesh: THREE.Mesh;
      if (wall.type === 'hedge') {
        const geo = new THREE.BoxGeometry(len, 2.2, 1.4);
        wallMesh = new THREE.Mesh(geo, this.materials.hedge);
        wallMesh.position.set(midX, 1.1, midZ);
        wallMesh.rotation.y = -angle;
      } else if (wall.type === 'brick') {
        const geo = new THREE.BoxGeometry(len, 2.5, 0.8);
        wallMesh = new THREE.Mesh(geo, this.materials.brickWall);
        wallMesh.position.set(midX, 1.25, midZ);
        wallMesh.rotation.y = -angle;
      } else {
        // Picket fence
        const geo = new THREE.BoxGeometry(len, 1.6, 0.25);
        wallMesh = new THREE.Mesh(geo, this.materials.woodFence);
        wallMesh.position.set(midX, 0.8, midZ);
        wallMesh.rotation.y = -angle;
      }

      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      this.rootGroup.add(wallMesh);
    });
  }

  // --- Central Park Area: Duck Pond, Basketball Court, Gazebo & Grand Oak ---
  private buildCentralPark() {
    const parkGroup = new THREE.Group();
    parkGroup.name = 'CentralPark';

    // In 2D: Central Park is in the middle-north (around X=1600, Y=1100-1300)
    // 3D coordinates: around X=0, Z=-5 to +5
    // 1. Duck Pond
    const pondGeo = new THREE.CylinderGeometry(14, 15, 0.6, 32);
    const pondWater = new THREE.Mesh(pondGeo, this.materials.water);
    pondWater.position.set(-65, 0.15, 45);
    parkGroup.add(pondWater);

    // Stone rim around pond
    const pondRimGeo = new THREE.TorusGeometry(14.8, 0.6, 8, 32);
    const pondRim = new THREE.Mesh(pondRimGeo, this.materials.curb);
    pondRim.rotation.x = Math.PI / 2;
    pondRim.position.set(-65, 0.35, 45);
    parkGroup.add(pondRim);

    // Floating 3D Rubber Ducks
    for (let i = 0; i < 3; i++) {
      const duck = this.createDuckMesh();
      const angle = (i * Math.PI * 2) / 3;
      duck.position.set(-65 + Math.cos(angle) * 6, 0.45, 45 + Math.sin(angle) * 6);
      duck.rotation.y = angle + Math.PI / 2;
      this.duckMeshes.push(duck);
      parkGroup.add(duck);
    }

    // 2. Basketball Court (Asphalt pad, painted lines, hoop & backboard)
    const courtGeo = new THREE.BoxGeometry(20, 0.1, 14);
    const courtMesh = new THREE.Mesh(courtGeo, this.materials.asphaltCourt);
    courtMesh.position.set(50, 0.05, 52);
    courtMesh.receiveShadow = true;
    parkGroup.add(courtMesh);

    // Basketball Hoop Structure
    const hoopPoleGeo = new THREE.CylinderGeometry(0.18, 0.18, 6.5, 8);
    const hoopPole = new THREE.Mesh(hoopPoleGeo, this.materials.lamppost);
    hoopPole.position.set(50, 3.25, 45.2);
    parkGroup.add(hoopPole);

    // Backboard
    const backboardGeo = new THREE.BoxGeometry(3.2, 2.2, 0.15);
    const backboardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const backboard = new THREE.Mesh(backboardGeo, backboardMat);
    backboard.position.set(50, 5.8, 45.5);
    parkGroup.add(backboard);

    // Rim
    const rimGeo = new THREE.TorusGeometry(0.65, 0.05, 8, 16);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xea580c });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(50, 5.2, 46.2);
    parkGroup.add(rim);

    // 3. Park Gazebo
    const gazeboGroup = this.createGazeboMesh();
    gazeboGroup.position.set(0, 0, 54);
    parkGroup.add(gazeboGroup);

    // 4. The Grand Community Oak Tree (For TP rolling prank!)
    const oakGroup = this.createGrandOakMesh();
    oakGroup.position.set(-15, 0, 50);
    parkGroup.add(oakGroup);

    this.rootGroup.add(parkGroup);
  }

  private createDuckMesh(): THREE.Group {
    const duck = new THREE.Group();
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });

    // Duck body
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), yellowMat);
    body.scale.set(1.3, 0.9, 1.0);
    duck.add(body);

    // Duck head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), yellowMat);
    head.position.set(0.4, 0.35, 0);
    duck.add(head);

    // Duck beak
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), orangeMat);
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.7, 0.32, 0);
    duck.add(beak);

    return duck;
  }

  private createGazeboMesh(): THREE.Group {
    const gazebo = new THREE.Group();
    // Octagonal deck
    const deckGeo = new THREE.CylinderGeometry(6, 6.2, 0.4, 8);
    const deck = new THREE.Mesh(deckGeo, this.materials.curb);
    deck.position.y = 0.2;
    gazebo.add(deck);

    // Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.16, 0.16, 3.8, 8);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const pillar = new THREE.Mesh(pillarGeo, this.materials.woodFence);
      pillar.position.set(Math.cos(angle) * 5.2, 2.1, Math.sin(angle) * 5.2);
      gazebo.add(pillar);
    }

    // Gazebo Roof
    const roofGeo = new THREE.ConeGeometry(7.2, 3.5, 8);
    const roof = new THREE.Mesh(roofGeo, this.materials.getHouseRoof('#047857'));
    roof.position.y = 5.6;
    gazebo.add(roof);

    return gazebo;
  }

  private createGrandOakMesh(): THREE.Group {
    const oak = new THREE.Group();
    oak.name = 'GrandOak';

    // Massive gnarly trunk
    const trunkGeo = new THREE.CylinderGeometry(1.4, 2.2, 6.5, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.treeTrunk);
    trunk.position.y = 3.25;
    trunk.castShadow = true;
    oak.add(trunk);

    // Foliage canopy clusters
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8, flatShading: true });
    const canopy1 = new THREE.Mesh(new THREE.SphereGeometry(4.8, 8, 6), foliageMat);
    canopy1.position.set(0, 8.5, 0);
    canopy1.castShadow = true;
    oak.add(canopy1);

    const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(3.6, 8, 6), foliageMat);
    canopy2.position.set(-3.2, 7.5, 2.2);
    canopy2.castShadow = true;
    oak.add(canopy2);

    const canopy3 = new THREE.Mesh(new THREE.SphereGeometry(3.8, 8, 6), foliageMat);
    canopy3.position.set(3.4, 7.8, -1.8);
    canopy3.castShadow = true;
    oak.add(canopy3);

    // TP Streamers (toilet paper ribbons dangling)
    const tpMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    for (let i = 0; i < 5; i++) {
      const streamerGeo = new THREE.PlaneGeometry(0.3, 4.5);
      const streamer = new THREE.Mesh(streamerGeo, tpMat);
      const angle = (i * Math.PI * 2) / 5;
      streamer.position.set(Math.cos(angle) * 3.5, 5.5, Math.sin(angle) * 3.5);
      streamer.visible = false; // Turned on when TP objective progresses!
      this.grandOakTPStreamers.push(streamer);
      oak.add(streamer);
    }

    return oak;
  }

  // --- Streetlights along Maple Way Sidewalks & Roundabout ---
  private buildStreetlights() {
    const lightPositions = [
      // Along North Maple Way curb (z: -38)
      { x: -115, z: -38 },
      { x: -55, z: -38 },
      { x: 5, z: -38 },
      { x: 65, z: -38 },
      // Along South Maple Way curb (z: 38)
      { x: -115, z: 38 },
      { x: -55, z: 38 },
      { x: 5, z: 38 },
      { x: 65, z: 38 },
      // Roundabout cul-de-sac perimeter
      { x: 110, z: -25 },
      { x: 110, z: 25 },
      // West Avenue
      { x: -125, z: -15 },
      { x: -125, z: 15 },
    ];

    lightPositions.forEach((pos) => {
      const lamp = this.createStreetlightMesh();
      lamp.position.set(pos.x, 0, pos.z);
      // Face towards road
      if (pos.z < 0) lamp.rotation.y = Math.PI;
      this.rootGroup.add(lamp);
    });
  }

  private createStreetlightMesh(): THREE.Group {
    const lamp = new THREE.Group();

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.0, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.lamppost);
    pole.position.y = 3.5;
    pole.castShadow = true;
    lamp.add(pole);

    // Curved arm
    const armGeo = new THREE.BoxGeometry(1.6, 0.14, 0.14);
    const arm = new THREE.Mesh(armGeo, this.materials.lamppost);
    arm.position.set(0.7, 7.0, 0);
    lamp.add(arm);

    // Lantern Head
    const headGeo = new THREE.CylinderGeometry(0.35, 0.2, 0.6, 6);
    const head = new THREE.Mesh(headGeo, this.materials.lamppost);
    head.position.set(1.4, 6.7, 0);
    lamp.add(head);

    // Glowing Bulb
    const bulbGeo = new THREE.SphereGeometry(0.24, 8, 8);
    const bulb = new THREE.Mesh(bulbGeo, this.materials.lampGlow);
    bulb.position.set(1.4, 6.4, 0);
    this.streetLightGlows.push(bulb);
    lamp.add(bulb);

    return lamp;
  }

  // --- Neighborhood Shade & Maple Trees ---
  private buildNeighborhoodTrees() {
    const treePositions = [
      // North sidewalk lawn strips
      { x: -130, z: -62, autumn: false, scale: 1.1 },
      { x: -85, z: -62, autumn: true, scale: 0.95 },
      { x: -30, z: -62, autumn: false, scale: 1.2 },
      { x: 30, z: -62, autumn: true, scale: 1.0 },
      { x: 80, z: -62, autumn: false, scale: 1.15 },
      // South sidewalk lawn strips
      { x: -130, z: 62, autumn: true, scale: 1.0 },
      { x: -85, z: 62, autumn: false, scale: 1.1 },
      { x: -30, z: 62, autumn: true, scale: 0.9 },
      { x: 30, z: 62, autumn: false, scale: 1.25 },
      { x: 80, z: 62, autumn: true, scale: 1.05 },
      // Central Park groves
      { x: -90, z: 30, autumn: false, scale: 1.3 },
      { x: -45, z: 25, autumn: true, scale: 1.1 },
      { x: 25, z: 30, autumn: false, scale: 1.2 },
      { x: 85, z: 20, autumn: true, scale: 1.15 },
      // Roundabout island trees
      { x: 100, z: -6, autumn: false, scale: 1.0 },
      { x: 104, z: 5, autumn: true, scale: 0.95 },
    ];

    treePositions.forEach((tp) => {
      const tree = this.createSuburbanTree(tp.autumn, tp.scale);
      tree.position.set(tp.x, 0, tp.z);
      this.rootGroup.add(tree);
    });
  }

  private createSuburbanTree(isAutumn: boolean, scale: number = 1.0): THREE.Group {
    const tree = new THREE.Group();
    tree.scale.set(scale, scale, scale);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.5, 4.5, 7);
    const trunk = new THREE.Mesh(trunkGeo, this.materials.treeTrunk);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage (low-poly cluster of spheres)
    const leafMat = isAutumn ? this.materials.treeLeavesAutumn : this.materials.treeLeaves;

    const c1 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 7, 6), leafMat);
    c1.position.set(0, 5.0, 0);
    c1.castShadow = true;
    tree.add(c1);

    const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 6, 5), leafMat);
    c2.position.set(1.1, 4.2, 0.7);
    c2.castShadow = true;
    tree.add(c2);

    const c3 = new THREE.Mesh(new THREE.SphereGeometry(1.9, 6, 5), leafMat);
    c3.position.set(-1.0, 4.5, -0.6);
    c3.castShadow = true;
    tree.add(c3);

    return tree;
  }

  // --- Curbside Fire Hydrants ---
  private buildFireHydrants() {
    const hydrantPositions = [
      { x: -95, z: -37.5 },
      { x: 15, z: -37.5 },
      { x: -70, z: 37.5 },
      { x: 45, z: 37.5 },
      { x: 98, z: -15 },
    ];

    hydrantPositions.forEach((pos) => {
      const hydrant = this.createHydrantMesh();
      hydrant.position.set(pos.x, 0.15, pos.z);
      this.rootGroup.add(hydrant);
    });
  }

  private createHydrantMesh(): THREE.Group {
    const h = new THREE.Group();

    // Body
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 1.1, 8);
    const body = new THREE.Mesh(bodyGeo, this.materials.gnomeRed);
    body.position.y = 0.55;
    body.castShadow = true;
    h.add(body);

    // Top dome
    const domeGeo = new THREE.SphereGeometry(0.25, 8, 6);
    const dome = new THREE.Mesh(domeGeo, this.materials.gnomeRed);
    dome.position.y = 1.1;
    h.add(dome);

    // Top nut
    const nutGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 5);
    const nut = new THREE.Mesh(nutGeo, this.materials.trashMetal);
    nut.position.y = 1.35;
    h.add(nut);

    // Side nozzles
    const nozzleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6);
    const nozzle = new THREE.Mesh(nozzleGeo, this.materials.trashMetal);
    nozzle.rotation.z = Math.PI / 2;
    nozzle.position.set(0, 0.7, 0);
    h.add(nozzle);

    return h;
  }

  public update(time: number, tpCount: number = 0) {
    // Animate ducks bobbing on water
    this.duckMeshes.forEach((duck, idx) => {
      duck.position.y = 0.45 + Math.sin(time * 2.5 + idx * 1.5) * 0.08;
      duck.rotation.y += 0.005;
    });

    // Update TP ribbons visibility on Grand Oak
    this.grandOakTPStreamers.forEach((streamer, idx) => {
      streamer.visible = idx < tpCount;
      if (streamer.visible) {
        streamer.rotation.z = Math.sin(time * 2 + idx) * 0.08;
      }
    });
  }

  public dispose() {
    this.rootGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
      }
    });
  }
}

