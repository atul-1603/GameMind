import * as THREE from 'three';
import { LevelDefinition } from '../types/game';
import {
  createFloorMaterial,
  createTargetMaterial,
  createTargetRingMaterial,
  createWallMaterial,
  createWallTopMaterial,
} from './materials';

interface TargetInstance {
  padMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
  initialScale: number;
}

export class BoardRenderer {
  public group: THREE.Group;
  private targets: TargetInstance[] = [];

  constructor() {
    this.group = new THREE.Group();
  }

  public buildLevel(level: LevelDefinition): void {
    // Clear previous children
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.targets = [];

    const wallMat = createWallMaterial();
    const wallTopMat = createWallTopMaterial();
    const floorMat = createFloorMaterial();
    const targetMat = createTargetMaterial();
    const targetRingMat = createTargetRingMaterial();

    // 1. Build Floor Tiles for the entire bounding box
    const tileGeo = new THREE.BoxGeometry(0.98, 0.1, 0.98);
    for (let r = 0; r < level.height; r++) {
      for (let c = 0; c < level.width; c++) {
        const floorMesh = new THREE.Mesh(tileGeo, floorMat);
        floorMesh.position.set(c, -0.05, r);
        floorMesh.receiveShadow = true;
        this.group.add(floorMesh);
      }
    }

    // 2. Build Walls
    const wallGeo = new THREE.BoxGeometry(0.96, 0.95, 0.96);
    const wallTopGeo = new THREE.BoxGeometry(1.0, 0.08, 1.0);

    for (const w of level.walls) {
      const wallGroup = new THREE.Group();

      const mainWall = new THREE.Mesh(wallGeo, wallMat);
      mainWall.position.set(0, 0.475, 0);
      mainWall.castShadow = true;
      mainWall.receiveShadow = true;
      wallGroup.add(mainWall);

      const topTrim = new THREE.Mesh(wallTopGeo, wallTopMat);
      topTrim.position.set(0, 0.96, 0);
      topTrim.castShadow = true;
      wallGroup.add(topTrim);

      wallGroup.position.set(w.c, 0, w.r);
      this.group.add(wallGroup);
    }

    // 3. Build Glowing Target Pads
    const padGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.06, 16);
    const ringGeo = new THREE.RingGeometry(0.25, 0.38, 16);
    ringGeo.rotateX(-Math.PI / 2);

    for (const t of level.targets) {
      const pad = new THREE.Mesh(padGeo, targetMat);
      pad.position.set(t.c, 0.03, t.r);
      pad.receiveShadow = true;
      this.group.add(pad);

      const ring = new THREE.Mesh(ringGeo, targetRingMat);
      ring.position.set(t.c, 0.07, t.r);
      this.group.add(ring);

      this.targets.push({
        padMesh: pad,
        ringMesh: ring,
        initialScale: 1.0,
      });
    }

    // 4. Subtle Base Platform underneath
    const baseGeo = new THREE.BoxGeometry(level.width + 1.2, 0.4, level.height + 1.2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.9,
      metalness: 0.1,
    });
    const basePlatform = new THREE.Mesh(baseGeo, baseMat);
    basePlatform.position.set((level.width - 1) / 2, -0.3, (level.height - 1) / 2);
    basePlatform.receiveShadow = true;
    this.group.add(basePlatform);
  }

  public update(_delta: number, elapsed: number): void {
    // Animate target ring pulsing
    for (const target of this.targets) {
      const pulse = 1.0 + Math.sin(elapsed * 4.0) * 0.12;
      target.ringMesh.scale.set(pulse, 1, pulse);
      target.ringMesh.rotation.y = elapsed * 0.8;
    }
  }
}
