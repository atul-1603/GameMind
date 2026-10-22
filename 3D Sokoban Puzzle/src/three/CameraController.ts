import * as THREE from 'three';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  public target: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // Spherical Coordinates
  private radius: number = 10;
  private targetRadius: number = 10;
  private minRadius: number = 4;
  private maxRadius: number = 25;

  private theta: number = Math.PI / 4; // Azimuthal angle
  private targetTheta: number = Math.PI / 4;

  private phi: number = Math.PI / 3.2; // Polar angle
  private targetPhi: number = Math.PI / 3.2;
  private minPhi: number = 0.2;
  private maxPhi: number = Math.PI / 2.1;

  private isDragging: boolean = false;
  private previousMousePosition = { x: 0, y: 0 };

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.domElement = domElement;

    this.bindEvents();
    this.updateCamera();
  }

  public frameLevel(width: number, height: number): void {
    this.target.set((width - 1) / 2, 0.4, (height - 1) / 2);
    const maxDim = Math.max(width, height);
    this.targetRadius = Math.max(7, maxDim * 1.6);
    this.radius = this.targetRadius;
    this.targetTheta = Math.PI / 4;
    this.targetPhi = Math.PI / 3.2;
    this.theta = this.targetTheta;
    this.phi = this.targetPhi;
    this.updateCamera();
  }

  public resetView(): void {
    this.targetTheta = Math.PI / 4;
    this.targetPhi = Math.PI / 3.2;
  }

  public zoomIn(): void {
    this.targetRadius = Math.max(this.minRadius, this.targetRadius - 1.5);
  }

  public zoomOut(): void {
    this.targetRadius = Math.min(this.maxRadius, this.targetRadius + 1.5);
  }

  public rotateLeft(): void {
    this.targetTheta += Math.PI / 6;
  }

  public rotateRight(): void {
    this.targetTheta -= Math.PI / 6;
  }

  private bindEvents(): void {
    const onMouseDown = (e: MouseEvent) => {
      // Left or right click drag rotates
      if (e.button === 0 || e.button === 2) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.targetTheta -= deltaX * 0.007;
      this.targetPhi = Math.max(
        this.minPhi,
        Math.min(this.maxPhi, this.targetPhi + deltaY * 0.007)
      );

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      this.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.005;
      this.targetRadius = Math.max(
        this.minRadius,
        Math.min(this.maxRadius, this.targetRadius + zoomDelta)
      );
    };

    // Touch support for tablets/mobile
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;
        this.targetTheta -= deltaX * 0.007;
        this.targetPhi = Math.max(
          this.minPhi,
          Math.min(this.maxPhi, this.targetPhi + deltaY * 0.007)
        );
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = (touchStartDist - dist) * 0.01;
        this.targetRadius = Math.max(
          this.minRadius,
          Math.min(this.maxRadius, this.targetRadius + factor)
        );
        touchStartDist = dist;
      }
    };

    const onTouchEnd = () => {
      this.isDragging = false;
      touchStartDist = 0;
    };

    this.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    this.domElement.addEventListener('wheel', onWheel, { passive: false });
    this.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
  }

  public update(delta: number): void {
    // Smooth damping
    const damping = Math.min(1.0, 10.0 * delta);
    this.theta = THREE.MathUtils.lerp(this.theta, this.targetTheta, damping);
    this.phi = THREE.MathUtils.lerp(this.phi, this.targetPhi, damping);
    this.radius = THREE.MathUtils.lerp(this.radius, this.targetRadius, damping);

    this.updateCamera();
  }

  private updateCamera(): void {
    const x = this.target.x + this.radius * Math.sin(this.phi) * Math.sin(this.theta);
    const y = this.target.y + this.radius * Math.cos(this.phi);
    const z = this.target.z + this.radius * Math.sin(this.phi) * Math.cos(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }
}
