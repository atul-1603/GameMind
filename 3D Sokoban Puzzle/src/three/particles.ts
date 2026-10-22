import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  public group: THREE.Group;
  private particles: Particle[] = [];
  private sphereGeo: THREE.SphereGeometry;
  private particleMat: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.sphereGeo = new THREE.SphereGeometry(0.06, 6, 6);
    this.particleMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
    });
  }

  public burst(pos: THREE.Vector3, count: number = 20, colorHex: number = 0x38bdf8): void {
    const mat = this.particleMat.clone();
    mat.color.setHex(colorHex);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.sphereGeo, mat);
      mesh.position.copy(pos);

      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 1.2 + Math.random() * 2.0;

      const vx = speed * Math.sin(phi) * Math.cos(theta);
      const vy = (speed * 0.8 * Math.cos(phi)) + 1.5; // bias upwards
      const vz = speed * Math.sin(phi) * Math.sin(theta);

      this.group.add(mesh);
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(vx, vy, vz),
        life: 0,
        maxLife: 0.6 + Math.random() * 0.4,
      });
    }
  }

  public update(delta: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      // Physics update
      p.mesh.position.addScaledVector(p.velocity, delta);
      p.velocity.y -= 5.0 * delta; // gravity

      const progress = p.life / p.maxLife;
      const scale = Math.max(0, 1 - progress);
      p.mesh.scale.set(scale, scale, scale);
    }
  }

  public clear(): void {
    for (const p of this.particles) {
      this.group.remove(p.mesh);
    }
    this.particles = [];
  }
}
