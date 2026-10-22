import * as THREE from 'three';
import { Coord } from '../types/game';
import { createCrateMaterial } from './materials';
import { ParticleSystem } from './particles';

interface CrateInstance {
  group: THREE.Group;
  coreMesh: THREE.Mesh;
  currentX: number;
  currentZ: number;
  targetX: number;
  targetZ: number;
  moveProgress: number;
  onTarget: boolean;
}

export class CrateRenderer {
  public group: THREE.Group;
  private crates: CrateInstance[] = [];
  private particleSystem: ParticleSystem;
  private moveSpeed: number = 7.5;

  constructor(particleSystem: ParticleSystem) {
    this.group = new THREE.Group();
    this.particleSystem = particleSystem;
  }

  private buildCrateMesh(onTarget: boolean): { group: THREE.Group; coreMesh: THREE.Mesh } {
    const crateGroup = new THREE.Group();

    // 1. Core Crate Block
    const coreGeo = new THREE.BoxGeometry(0.74, 0.74, 0.74);
    const coreMat = createCrateMaterial(onTarget);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = 0.37;
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    crateGroup.add(coreMesh);

    // 2. High-tech Outer Framing / Corners
    const frameGeo = new THREE.BoxGeometry(0.78, 0.78, 0.78);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // slate-800
      roughness: 0.5,
      metalness: 0.8,
      wireframe: true,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.y = 0.37;
    crateGroup.add(frameMesh);

    return { group: crateGroup, coreMesh };
  }

  public initCrates(initialPositions: Coord[], targetsSet: Set<string>): void {
    // Clear existing
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.crates = [];

    for (const pos of initialPositions) {
      const onTarget = targetsSet.has(`${pos.r},${pos.c}`);
      const { group, coreMesh } = this.buildCrateMesh(onTarget);

      group.position.set(pos.c, 0, pos.r);
      this.group.add(group);

      this.crates.push({
        group,
        coreMesh,
        currentX: pos.c,
        currentZ: pos.r,
        targetX: pos.c,
        targetZ: pos.r,
        moveProgress: 1.0,
        onTarget,
      });
    }
  }

  public syncPositions(crates: Coord[], targetsSet: Set<string>, immediate: boolean = false): void {
    for (let i = 0; i < crates.length; i++) {
      const cPos = crates[i];
      let instance = this.crates[i];

      if (!instance) {
        // Create if missing
        const onTarget = targetsSet.has(`${cPos.r},${cPos.c}`);
        const { group, coreMesh } = this.buildCrateMesh(onTarget);
        group.position.set(cPos.c, 0, cPos.r);
        this.group.add(group);
        instance = {
          group,
          coreMesh,
          currentX: cPos.c,
          currentZ: cPos.r,
          targetX: cPos.c,
          targetZ: cPos.r,
          moveProgress: 1.0,
          onTarget,
        };
        this.crates.push(instance);
      }

      const wasOnTarget = instance.onTarget;
      const nowOnTarget = targetsSet.has(`${cPos.r},${cPos.c}`);

      if (immediate) {
        instance.currentX = cPos.c;
        instance.currentZ = cPos.r;
        instance.targetX = cPos.c;
        instance.targetZ = cPos.r;
        instance.moveProgress = 1.0;
        instance.group.position.set(cPos.c, 0, cPos.r);
      } else if (instance.targetX !== cPos.c || instance.targetZ !== cPos.r) {
        instance.currentX = instance.group.position.x;
        instance.currentZ = instance.group.position.z;
        instance.targetX = cPos.c;
        instance.targetZ = cPos.r;
        instance.moveProgress = 0.0;
      }

      if (wasOnTarget !== nowOnTarget) {
        instance.onTarget = nowOnTarget;
        instance.coreMesh.material = createCrateMaterial(nowOnTarget);

        if (nowOnTarget) {
          // Burst of particles celebrating crate on target!
          this.particleSystem.burst(
            new THREE.Vector3(cPos.c, 0.4, cPos.r),
            24,
            0x38bdf8
          );
        }
      }
    }
  }

  public isMoving(): boolean {
    return this.crates.some(c => c.moveProgress < 1.0);
  }

  public update(delta: number): void {
    for (const c of this.crates) {
      if (c.moveProgress < 1.0) {
        c.moveProgress = Math.min(1.0, c.moveProgress + this.moveSpeed * delta);
        const t = 1 - Math.pow(1 - c.moveProgress, 2);

        c.group.position.x = THREE.MathUtils.lerp(c.currentX, c.targetX, t);
        c.group.position.z = THREE.MathUtils.lerp(c.currentZ, c.targetZ, t);

        // Small slide compression / bounce
        const hop = Math.sin(c.moveProgress * Math.PI) * 0.05;
        c.group.position.y = hop;
      }
    }
  }
}
