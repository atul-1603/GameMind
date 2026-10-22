import * as THREE from 'three';
import { Coord, Direction, LevelDefinition } from '../types/game';
import { BoardRenderer } from './BoardRenderer';
import { CameraController } from './CameraController';
import { CrateRenderer } from './CrateRenderer';
import { ParticleSystem } from './particles';
import { PlayerRenderer } from './PlayerRenderer';

export class GameScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cameraController: CameraController;

  private boardRenderer: BoardRenderer;
  private playerRenderer: PlayerRenderer;
  private crateRenderer: CrateRenderer;
  private particleSystem: ParticleSystem;

  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  private isDestroyed: boolean = false;
  private resizeObserver: ResizeObserver | null = null;

  constructor(container: HTMLElement, level: LevelDefinition) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d); // Deep futuristic slate/navy
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.035);

    // 2. Camera
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // 4. Camera Controller
    this.cameraController = new CameraController(this.camera, this.renderer.domElement);
    this.cameraController.frameLevel(level.width, level.height);

    // 5. Lighting
    this.setupLighting(level);

    // 6. Sub-systems
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.group);

    this.boardRenderer = new BoardRenderer();
    this.scene.add(this.boardRenderer.group);

    this.crateRenderer = new CrateRenderer(this.particleSystem);
    this.scene.add(this.crateRenderer.group);

    this.playerRenderer = new PlayerRenderer(level.playerStart);
    this.scene.add(this.playerRenderer.group);

    // Initialize board
    this.loadLevel(level);

    // 7. Handle resize
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // 8. Start loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting(level: LevelDefinition): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.55);
    this.scene.add(ambientLight);

    // Main Directional Light (Sun/Spot)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(level.width + 4, 12, level.height + 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    const d = Math.max(level.width, level.height) * 1.5;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Subtle Cyan Rim/Accent light
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.6);
    rimLight.position.set(-6, 8, -6);
    this.scene.add(rimLight);

    // Subtle Indigo fill
    const fillLight = new THREE.DirectionalLight(0x6366f1, 0.4);
    fillLight.position.set(0, -5, 0);
    this.scene.add(fillLight);
  }

  public loadLevel(level: LevelDefinition): void {
    this.boardRenderer.buildLevel(level);
    const targetsSet = new Set(level.targets.map(t => `${t.r},${t.c}`));
    this.crateRenderer.initCrates(level.crates, targetsSet);
    this.playerRenderer.setGridTarget(level.playerStart, undefined, true);
    this.cameraController.frameLevel(level.width, level.height);
    this.particleSystem.clear();
  }

  public updateGameState(
    playerPos: Coord,
    cratesPos: Coord[],
    targetsSet: Set<string>,
    direction?: Direction,
    immediate: boolean = false
  ): void {
    this.playerRenderer.setGridTarget(playerPos, direction, immediate);
    this.crateRenderer.syncPositions(cratesPos, targetsSet, immediate);
  }

  public triggerWinCelebration(crates: Coord[]): void {
    for (const crate of crates) {
      this.particleSystem.burst(
        new THREE.Vector3(crate.c, 0.5, crate.r),
        35,
        0x10b981 // Emerald green
      );
    }
  }

  public resetCamera(): void {
    this.cameraController.resetView();
  }

  public zoomIn(): void {
    this.cameraController.zoomIn();
  }

  public zoomOut(): void {
    this.cameraController.zoomOut();
  }

  public rotateLeft(): void {
    this.cameraController.rotateLeft();
  }

  public rotateRight(): void {
    this.cameraController.rotateRight();
  }

  public isBusyAnimating(): boolean {
    return this.playerRenderer.isMoving() || this.crateRenderer.isMoving();
  }

  private handleResize(): void {
    if (this.isDestroyed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate(): void {
    if (this.isDestroyed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    this.playerRenderer.update(delta, elapsed);
    this.crateRenderer.update(delta);
    this.boardRenderer.update(delta, elapsed);
    this.particleSystem.update(delta);
    this.cameraController.update(delta);

    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
