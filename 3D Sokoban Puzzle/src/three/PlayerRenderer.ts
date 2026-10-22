import * as THREE from 'three';
import { Coord, Direction } from '../types/game';
import { createPlayerBodyMaterial, createPlayerVisorMaterial } from './materials';

export class PlayerRenderer {
  public group: THREE.Group;
  private currentGridPos: Coord;
  private targetGridPos: Coord;
  private moveProgress: number = 1.0;
  private moveSpeed: number = 8.0; // grid cells per second
  private targetRotationY: number = 0;
  private bodyMesh: THREE.Mesh;
  private visorMesh: THREE.Mesh;
  private hoverRing: THREE.Mesh;

  constructor(initialPos: Coord) {
    this.currentGridPos = { ...initialPos };
    this.targetGridPos = { ...initialPos };

    this.group = new THREE.Group();
    this.group.position.set(initialPos.c, 0, initialPos.r);

    const bodyMat = createPlayerBodyMaterial();
    const visorMat = createPlayerVisorMaterial();

    // 1. Lower repulsor/legs
    const hoverGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.15, 12);
    this.hoverRing = new THREE.Mesh(hoverGeo, bodyMat);
    this.hoverRing.position.y = 0.15;
    this.group.add(this.hoverRing);

    // 2. Torso
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.45, 0.4);
    this.bodyMesh = new THREE.Mesh(torsoGeo, bodyMat);
    this.bodyMesh.position.y = 0.45;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // 3. Head & Visor
    const headGeo = new THREE.BoxGeometry(0.38, 0.3, 0.32);
    const headMesh = new THREE.Mesh(headGeo, bodyMat);
    headMesh.position.y = 0.85;
    headMesh.castShadow = true;
    this.group.add(headMesh);

    // Glowing Visor
    const visorGeo = new THREE.BoxGeometry(0.3, 0.12, 0.08);
    this.visorMesh = new THREE.Mesh(visorGeo, visorMat);
    this.visorMesh.position.set(0, 0.87, 0.16); // facing +Z initially
    this.group.add(this.visorMesh);

    // Antenna
    const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6);
    const antMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.position.set(0, 1.08, 0);
    this.group.add(ant);

    const tipGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const tip = new THREE.Mesh(tipGeo, visorMat);
    tip.position.set(0, 1.18, 0);
    this.group.add(tip);
  }

  public setGridTarget(pos: Coord, direction?: Direction, immediate: boolean = false): void {
    if (immediate) {
      this.currentGridPos = { ...pos };
      this.targetGridPos = { ...pos };
      this.moveProgress = 1.0;
      this.group.position.set(pos.c, 0, pos.r);
      return;
    }

    this.currentGridPos = {
      c: this.group.position.x,
      r: this.group.position.z,
    };
    this.targetGridPos = { ...pos };
    this.moveProgress = 0.0;

    if (direction) {
      switch (direction) {
        case 'DOWN':
          this.targetRotationY = 0;
          break;
        case 'UP':
          this.targetRotationY = Math.PI;
          break;
        case 'RIGHT':
          this.targetRotationY = Math.PI / 2;
          break;
        case 'LEFT':
          this.targetRotationY = -Math.PI / 2;
          break;
      }
    }
  }

  public isMoving(): boolean {
    return this.moveProgress < 1.0;
  }

  public update(delta: number, elapsed: number): void {
    // Rotation smoothing
    this.group.rotation.y = THREE.MathUtils.lerp(
      this.group.rotation.y,
      this.targetRotationY,
      Math.min(1.0, 14.0 * delta)
    );

    // Position interpolation
    if (this.moveProgress < 1.0) {
      this.moveProgress = Math.min(1.0, this.moveProgress + this.moveSpeed * delta);
      // Smooth ease-out curve
      const t = 1 - Math.pow(1 - this.moveProgress, 2);

      const targetX = this.targetGridPos.c;
      const targetZ = this.targetGridPos.r;

      this.group.position.x = THREE.MathUtils.lerp(this.currentGridPos.c, targetX, t);
      this.group.position.z = THREE.MathUtils.lerp(this.currentGridPos.r, targetZ, t);

      // Bounce/hop during step
      const hop = Math.sin(this.moveProgress * Math.PI) * 0.2;
      this.group.position.y = hop;
    } else {
      // Idle gentle hover bobbing
      const idleBob = Math.sin(elapsed * 3.5) * 0.04;
      this.group.position.y = idleBob;
    }
  }
}
