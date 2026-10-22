import * as THREE from 'three';
import { AlgorithmResult } from '../algorithms';
import { CameraMode, GraphicsQuality } from '../game/gameState';
import { MazeGrid, Point2D } from '../maze/mazeTypes';

export class ThreeSceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLDivElement;

  // Meshes & Groups
  private mazeGroup = new THREE.Group();
  private orbsGroup = new THREE.Group();
  private visualizationGroup = new THREE.Group();
  private portalGroup = new THREE.Group();
  private playerGroup = new THREE.Group();
  private playerLeftLeg!: THREE.Mesh;
  private playerRightLeg!: THREE.Mesh;
  private playerLeftArm!: THREE.Mesh;
  private playerRightArm!: THREE.Mesh;

  private flashlight: THREE.PointLight;
  private playerSpotlight: THREE.SpotLight;
  private dirLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  // Particle systems
  private portalParticles: THREE.Points;
  private floatingDust: THREE.Points;

  // Camera animation state
  private currentCameraPos = new THREE.Vector3();
  private currentCameraTarget = new THREE.Vector3();
  private currentMaze: MazeGrid | null = null;

  constructor(container: HTMLDivElement) {
    this.container = container;

    // 1. Scene & Lighting (Crystal clear visibility - no dark obscuring fog)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060c18);
    // Subtle distance fog so distant blocks are visible across the entire labyrinth
    this.scene.fog = new THREE.Fog(0x060c18, 45, 180);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    container.appendChild(this.renderer.domElement);

    // 4. Lights: Vibrant, high-visibility illumination for all corridors and blocks
    this.ambientLight = new THREE.AmbientLight(0x32476b, 2.0);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0x99ccff, 2.4);
    this.dirLight.position.set(30, 50, 30);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 160;
    const shadowSize = 45;
    this.dirLight.shadow.camera.left = -shadowSize;
    this.dirLight.shadow.camera.right = shadowSize;
    this.dirLight.shadow.camera.top = shadowSize;
    this.dirLight.shadow.camera.bottom = -shadowSize;
    this.scene.add(this.dirLight);

    // Player localized glowing light & forward headlight
    this.flashlight = new THREE.PointLight(0x00f0ff, 4.0, 14, 1.4);
    this.flashlight.castShadow = false;
    this.scene.add(this.flashlight);

    this.playerSpotlight = new THREE.SpotLight(0x00f0ff, 5.0, 18, Math.PI / 4, 0.4, 1.2);
    this.playerSpotlight.castShadow = false;
    this.scene.add(this.playerSpotlight);
    this.scene.add(this.playerSpotlight.target);

    // 5. Build Futuristic Cyber-Runner Player Avatar
    this.buildPlayerAvatar();
    this.scene.add(this.playerGroup);

    // Groups
    this.scene.add(this.mazeGroup);
    this.scene.add(this.orbsGroup);
    this.scene.add(this.portalGroup);
    this.scene.add(this.visualizationGroup);

    // Ambient floating dust particles
    this.floatingDust = this.createDustParticles();
    this.scene.add(this.floatingDust);

    // Exit portal particle system
    this.portalParticles = this.createPortalParticles();
    this.portalGroup.add(this.portalParticles);

    // Window Resize Handler
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);
  }

  /**
   * Constructs an attractive futuristic cybernetic runner avatar
   */
  private buildPlayerAvatar(): void {
    // Clear any previous children
    while (this.playerGroup.children.length > 0) {
      this.playerGroup.remove(this.playerGroup.children[0]);
    }

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.2,
    });

    const neonCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d9ff,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });

    const neonPurpleMat = new THREE.MeshStandardMaterial({
      color: 0xbf00ff,
      emissive: 0xa000dd,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    });

    // 1. Torso & Cybernetic Armor
    const torsoGeo = new THREE.BoxGeometry(0.32, 0.46, 0.22);
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 0.72;
    torso.castShadow = true;
    this.playerGroup.add(torso);

    // 2. Chest Power Core / Arc Reactor (glowing cyan circle on chest)
    const coreGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.04, 16);
    coreGeo.rotateX(Math.PI / 2);
    const core = new THREE.Mesh(coreGeo, neonCyanMat);
    core.position.set(0, 0.74, 0.115);
    this.playerGroup.add(core);

    // 3. Cyber Helmet / Head
    const headGeo = new THREE.BoxGeometry(0.22, 0.24, 0.24);
    const head = new THREE.Mesh(headGeo, armorMat);
    head.position.y = 1.08;
    head.castShadow = true;
    this.playerGroup.add(head);

    // 4. Glowing Neon Visor (front facing)
    const visorGeo = new THREE.BoxGeometry(0.2, 0.08, 0.05);
    const visor = new THREE.Mesh(visorGeo, neonCyanMat);
    visor.position.set(0, 1.08, 0.115);
    this.playerGroup.add(visor);

    // 5. Cyber Jetpack / Thrusters on back
    const jetpackGeo = new THREE.BoxGeometry(0.24, 0.32, 0.1);
    const jetpack = new THREE.Mesh(jetpackGeo, armorMat);
    jetpack.position.set(0, 0.74, -0.14);
    this.playerGroup.add(jetpack);

    const thrusterGeo = new THREE.CylinderGeometry(0.04, 0.055, 0.12, 12);
    const leftThruster = new THREE.Mesh(thrusterGeo, neonPurpleMat);
    leftThruster.position.set(-0.08, 0.58, -0.14);
    this.playerGroup.add(leftThruster);

    const rightThruster = new THREE.Mesh(thrusterGeo, neonPurpleMat);
    rightThruster.position.set(0.08, 0.58, -0.14);
    this.playerGroup.add(rightThruster);

    // 6. Shoulders & Arms
    const armGeo = new THREE.BoxGeometry(0.09, 0.36, 0.11);
    this.playerLeftArm = new THREE.Mesh(armGeo, armorMat);
    this.playerLeftArm.position.set(-0.22, 0.68, 0);
    this.playerLeftArm.castShadow = true;
    this.playerGroup.add(this.playerLeftArm);

    this.playerRightArm = new THREE.Mesh(armGeo, armorMat);
    this.playerRightArm.position.set(0.22, 0.68, 0);
    this.playerRightArm.castShadow = true;
    this.playerGroup.add(this.playerRightArm);

    // 7. Cybernetic Legs
    const legGeo = new THREE.BoxGeometry(0.11, 0.46, 0.13);
    this.playerLeftLeg = new THREE.Mesh(legGeo, armorMat);
    this.playerLeftLeg.position.set(-0.09, 0.24, 0);
    this.playerLeftLeg.castShadow = true;
    this.playerGroup.add(this.playerLeftLeg);

    this.playerRightLeg = new THREE.Mesh(legGeo, armorMat);
    this.playerRightLeg.position.set(0.09, 0.24, 0);
    this.playerRightLeg.castShadow = true;
    this.playerGroup.add(this.playerRightLeg);

    // 8. Ground Neon Circle Shadow / Indicator
    const ringGeo = new THREE.RingGeometry(0.26, 0.32, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.02;
    this.playerGroup.add(ring);
  }

  private createDustParticles(): THREE.Points {
    const count = 400;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = Math.random() * 5;
      positions[i + 2] = (Math.random() - 0.5) * 60;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x00e1ff,
      size: 0.05,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Points(geo, mat);
  }

  private createPortalParticles(): THREE.Points {
    const count = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.2 + Math.random() * 0.75;
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = 0.2 + Math.random() * 2.2;
      positions[i + 2] = Math.sin(angle) * radius;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xbf00ff,
      size: 0.09,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    return new THREE.Points(geo, mat);
  }

  public rebuildMaze(maze: MazeGrid): void {
    this.currentMaze = maze;

    // Clear previous maze geometry
    while (this.mazeGroup.children.length > 0) {
      const obj = this.mazeGroup.children[0];
      this.mazeGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }
    while (this.orbsGroup.children.length > 0) {
      const obj = this.orbsGroup.children[0];
      this.orbsGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }
    while (this.portalGroup.children.length > 1) {
      const obj = this.portalGroup.children[1];
      this.portalGroup.remove(obj);
    }

    const wallHeight = 2.4;
    const wallGeo = new THREE.BoxGeometry(1, wallHeight, 1);

    // Wall Material: metallic dark panel with bevel and bright edge visibility
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x141d2e,
      metalness: 0.85,
      roughness: 0.25,
    });

    // Count walls for InstancedMesh
    let wallCount = 0;
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        if (maze.cells[y][x].type === 'WALL') wallCount++;
      }
    }

    const wallInstances = new THREE.InstancedMesh(wallGeo, wallMat, wallCount);
    wallInstances.castShadow = true;
    wallInstances.receiveShadow = true;

    // Glowing vibrant neon edge trim on top of every wall block
    const trimGeo = new THREE.BoxGeometry(0.96, 0.08, 0.96);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00bfff,
      emissiveIntensity: 1.8,
      roughness: 0.1,
    });
    const trimInstances = new THREE.InstancedMesh(trimGeo, trimMat, wallCount);

    const dummy = new THREE.Object3D();
    let idx = 0;

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        if (maze.cells[y][x].type === 'WALL') {
          dummy.position.set(x, wallHeight / 2, y);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          wallInstances.setMatrixAt(idx, dummy.matrix);

          dummy.position.set(x, wallHeight + 0.04, y);
          dummy.updateMatrix();
          trimInstances.setMatrixAt(idx, dummy.matrix);

          idx++;
        }
      }
    }

    wallInstances.instanceMatrix.needsUpdate = true;
    trimInstances.instanceMatrix.needsUpdate = true;
    this.mazeGroup.add(wallInstances);
    this.mazeGroup.add(trimInstances);

    // 2. Floor tiles with high contrast
    const floorGeo = new THREE.PlaneGeometry(1, 1);
    floorGeo.rotateX(-Math.PI / 2);

    const normalFloorMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      roughness: 0.65,
      metalness: 0.35,
    });

    const difficultFloorMat = new THREE.MeshStandardMaterial({
      color: 0x4d3200,
      emissive: 0xffaa00,
      emissiveIntensity: 0.45,
      roughness: 0.8,
    });

    const hazardousFloorMat = new THREE.MeshStandardMaterial({
      color: 0x5c0d20,
      emissive: 0xff0044,
      emissiveIntensity: 0.65,
      roughness: 0.4,
    });

    // Create floor meshes
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const cell = maze.cells[y][x];
        if (cell.type !== 'WALL') {
          let mat = normalFloorMat;
          if (cell.type === 'DIFFICULT') mat = difficultFloorMat;
          if (cell.type === 'HAZARDOUS') mat = hazardousFloorMat;

          const tile = new THREE.Mesh(floorGeo, mat);
          tile.position.set(x, 0, y);
          tile.receiveShadow = true;
          this.mazeGroup.add(tile);
        }
      }
    }

    // 3. Grid line overlay for sci-fi floor aesthetics
    const gridHelper = new THREE.GridHelper(
      Math.max(maze.width, maze.height),
      Math.max(maze.width, maze.height),
      0x00f0ff,
      0x192b47
    );
    gridHelper.position.set(maze.width / 2 - 0.5, 0.005, maze.height / 2 - 0.5);
    this.mazeGroup.add(gridHelper);

    // 4. Start Pad
    const startPadGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.08, 24);
    const startPadMat = new THREE.MeshStandardMaterial({
      color: 0x0099ff,
      emissive: 0x0066ff,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
    const startPad = new THREE.Mesh(startPadGeo, startPadMat);
    startPad.position.set(maze.start.x, 0.04, maze.start.y);
    this.mazeGroup.add(startPad);

    // 5. Exit Portal Geometry
    this.buildExitPortal(maze.exit);

    // 6. Energy Orbs
    this.buildEnergyOrbs(maze);
  }

  private buildExitPortal(exit: Point2D): void {
    const portalBaseGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.1, 32);
    const portalBaseMat = new THREE.MeshStandardMaterial({
      color: 0x230c3d,
      emissive: 0x9400d3,
      emissiveIntensity: 1.4,
      metalness: 0.9,
    });
    const baseMesh = new THREE.Mesh(portalBaseGeo, portalBaseMat);
    baseMesh.position.set(exit.x, 0.05, exit.y);
    this.portalGroup.add(baseMesh);

    // Rotating Torus Rings
    const ringGeo = new THREE.TorusGeometry(0.42, 0.04, 16, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0xbf00ff,
      emissiveIntensity: 2.2,
      metalness: 0.9,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.name = 'portalRing1';
    ring1.position.set(exit.x, 1.15, exit.y);
    this.portalGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
    ring2.name = 'portalRing2';
    ring2.position.set(exit.x, 1.15, exit.y);
    ring2.rotation.y = Math.PI / 2;
    this.portalGroup.add(ring2);

    // Radiant vertical light beacon
    const beaconLight = new THREE.PointLight(0xbf00ff, 5.0, 14, 1.4);
    beaconLight.position.set(exit.x, 1.3, exit.y);
    this.portalGroup.add(beaconLight);

    this.portalParticles.position.set(exit.x, 0, exit.y);
  }

  private buildEnergyOrbs(maze: MazeGrid): void {
    const orbGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      emissive: 0x00ffaa,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.5,
    });

    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        if (maze.cells[y][x].hasOrb) {
          const orb = new THREE.Mesh(orbGeo, orbMat);
          orb.position.set(x, 0.6, y);
          orb.userData = { gridX: x, gridY: y, initialY: 0.6 };
          this.orbsGroup.add(orb);
        }
      }
    }
  }

  public removeOrbMesh(gridX: number, gridY: number): void {
    for (let i = this.orbsGroup.children.length - 1; i >= 0; i--) {
      const orb = this.orbsGroup.children[i] as THREE.Mesh;
      if (orb.userData.gridX === gridX && orb.userData.gridY === gridY) {
        this.orbsGroup.remove(orb);
        break;
      }
    }
  }

  /**
   * Updates dynamic 3D Search Visualization (Visited nodes, Frontier nodes, and Final Neon Route)
   */
  public updateVisualization(
    result: AlgorithmResult | null,
    stepIndex: number,
    showExploration: boolean,
    showFinalRoute: boolean
  ): void {
    // Clear previous visualization elements
    while (this.visualizationGroup.children.length > 0) {
      const obj = this.visualizationGroup.children[0];
      this.visualizationGroup.remove(obj);
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
    }

    if (!result) return;

    // 1. Render Explored and Frontier Tiles up to stepIndex
    if (showExploration && result.explorationSteps.length > 0) {
      const exploredSet = new Set<string>();
      const frontierSet = new Set<string>();

      const activeSteps = result.explorationSteps.slice(0, stepIndex);
      for (const step of activeSteps) {
        const key = `${step.cell.x},${step.cell.y}`;
        if (step.type === 'NODE_EXPAND') {
          frontierSet.delete(key);
          exploredSet.add(key);
        } else if (step.type === 'FRONTIER_ADD') {
          if (!exploredSet.has(key)) {
            frontierSet.add(key);
          }
        }
      }

      const tileGeo = new THREE.PlaneGeometry(0.85, 0.85);
      tileGeo.rotateX(-Math.PI / 2);

      const exploredMat = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.42,
      });

      const frontierMat = new THREE.MeshBasicMaterial({
        color: 0xffbb00,
        transparent: true,
        opacity: 0.6,
      });

      // Highlight Explored Cells
      for (const key of exploredSet) {
        const [x, y] = key.split(',').map(Number);
        const mesh = new THREE.Mesh(tileGeo, exploredMat);
        mesh.position.set(x, 0.02, y);
        this.visualizationGroup.add(mesh);
      }

      // Highlight Current Frontier Cells
      for (const key of frontierSet) {
        const [x, y] = key.split(',').map(Number);
        const mesh = new THREE.Mesh(tileGeo, frontierMat);
        mesh.position.set(x, 0.025, y);
        this.visualizationGroup.add(mesh);
      }
    }

    // 2. Render Final Solution Route Ribbon
    if (showFinalRoute && result.path.length > 1) {
      const points: THREE.Vector3[] = result.path.map(
        (p) => new THREE.Vector3(p.x, 0.12, p.y)
      );

      // Neon Tube / Curve
      const curve = new THREE.CatmullRomCurve3(points);
      curve.curveType = 'catmullrom';
      curve.tension = 0.2;

      const tubeGeo = new THREE.TubeGeometry(curve, points.length * 4, 0.065, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ff88,
        emissiveIntensity: 2.8,
        roughness: 0.1,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      this.visualizationGroup.add(tubeMesh);

      // Node waypoint markers along path
      const waypointGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12);
      const waypointMat = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
      for (const p of result.path) {
        const wp = new THREE.Mesh(waypointGeo, waypointMat);
        wp.position.set(p.x, 0.13, p.y);
        this.visualizationGroup.add(wp);
      }
    }
  }

  public update(
    deltaTime: number,
    playerX: number,
    playerZ: number,
    playerY: number,
    playerYaw: number,
    playerPitch: number,
    cameraMode: CameraMode,
    mazeWidth: number,
    mazeHeight: number
  ): void {
    const time = performance.now() * 0.001;

    // 1. Update Player Avatar Position & Orientation
    this.playerGroup.position.set(playerX, playerY, playerZ);
    // Orient player avatar to face the movement/aim yaw
    this.playerGroup.rotation.y = playerYaw;
    this.playerGroup.visible = true; // Player is always visible in both FPV and Bird's-Eye!

    // Subtle limb running animation
    if (this.playerLeftLeg && this.playerRightLeg) {
      const legSwing = Math.sin(time * 12) * 0.35;
      this.playerLeftLeg.rotation.x = legSwing;
      this.playerRightLeg.rotation.x = -legSwing;
      this.playerLeftArm.rotation.x = -legSwing * 0.8;
      this.playerRightArm.rotation.x = legSwing * 0.8;
    }

    // Update Player Lantern & Headlight
    this.flashlight.position.set(playerX, playerY + 0.8, playerZ);
    this.playerSpotlight.position.set(playerX, playerY + 1.1, playerZ);
    this.playerSpotlight.target.position.set(
      playerX + Math.sin(playerYaw) * 6,
      playerY + 0.6 + Math.sin(playerPitch) * 4,
      playerZ + Math.cos(playerYaw) * 6
    );

    // 2. Animate Exit Portal rings and particles
    const ring1 = this.portalGroup.getObjectByName('portalRing1');
    const ring2 = this.portalGroup.getObjectByName('portalRing2');
    if (ring1) ring1.rotation.z += deltaTime * 1.8;
    if (ring2) ring2.rotation.x += deltaTime * 2.2;

    // Bob energy orbs
    this.orbsGroup.children.forEach((orb) => {
      const mesh = orb as THREE.Mesh;
      mesh.rotation.y += deltaTime * 2.5;
      mesh.position.y = mesh.userData.initialY + Math.sin(time * 3 + mesh.userData.gridX) * 0.08;
    });

    // 3. Camera Positioning: First-Person Follow View (FPV with player clearly visible in front)
    if (cameraMode === 'FIRST_PERSON') {
      // Over-the-shoulder / forward chase FPV camera:
      // Positioned behind the player so the player avatar is always visible running forward
      let followDist = 1.35;
      const followHeight = 1.55;

      // Wall avoidance for camera so camera doesn't clip behind a wall
      if (this.currentMaze) {
        const testCamX = playerX - Math.sin(playerYaw) * followDist;
        const testCamZ = playerZ - Math.cos(playerYaw) * followDist;
        const cellX = Math.round(testCamX);
        const cellZ = Math.round(testCamZ);
        if (
          cellX >= 0 &&
          cellX < this.currentMaze.width &&
          cellZ >= 0 &&
          cellZ < this.currentMaze.height &&
          this.currentMaze.cells[cellZ][cellX].type === 'WALL'
        ) {
          // Close camera tighter if wall is immediately behind
          followDist = 0.7;
        }
      }

      const camX = playerX - Math.sin(playerYaw) * followDist;
      const camY = playerY + followHeight + Math.sin(playerPitch) * 0.35;
      const camZ = playerZ - Math.cos(playerYaw) * followDist;

      // Look forward into the corridor
      const lookDist = 12.0;
      const lookTarget = new THREE.Vector3(
        playerX + Math.sin(playerYaw) * Math.cos(playerPitch) * lookDist,
        playerY + 1.1 + Math.sin(playerPitch) * lookDist,
        playerZ + Math.cos(playerYaw) * Math.cos(playerPitch) * lookDist
      );

      this.camera.position.set(camX, camY, camZ);
      this.camera.lookAt(lookTarget);
    } else {
      // Bird's-Eye Mode: elevated overview looking down at the entire labyrinth
      const centerX = mazeWidth / 2 - 0.5;
      const centerZ = mazeHeight / 2 - 0.5;
      const elevation = Math.max(mazeWidth, mazeHeight) * 1.05;

      const targetPos = new THREE.Vector3(centerX, elevation, centerZ + elevation * 0.35);
      const targetLook = new THREE.Vector3(centerX, 0, centerZ);

      this.currentCameraPos.lerp(targetPos, deltaTime * 5.0);
      this.currentCameraTarget.lerp(targetLook, deltaTime * 5.0);

      this.camera.position.copy(this.currentCameraPos);
      this.camera.lookAt(this.currentCameraTarget);
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  public setQuality(quality: GraphicsQuality): void {
    if (quality === 'LOW') {
      this.renderer.shadowMap.enabled = false;
      this.dirLight.castShadow = false;
      this.renderer.setPixelRatio(1.0);
      this.floatingDust.visible = false;
    } else if (quality === 'MEDIUM') {
      this.renderer.shadowMap.enabled = true;
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.set(1024, 1024);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.floatingDust.visible = true;
    } else {
      this.renderer.shadowMap.enabled = true;
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.set(2048, 2048);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.floatingDust.visible = true;
    }
  }

  private onWindowResize(): void {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
