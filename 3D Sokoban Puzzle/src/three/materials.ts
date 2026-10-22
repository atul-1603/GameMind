import * as THREE from 'three';

/**
 * Creates procedural textures and materials for DimensionShift
 */

export function createFloorMaterial(): THREE.MeshStandardMaterial {
  // Create a subtle high-tech grid texture procedurally on canvas
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(0, 0, 128, 128);

  ctx.strokeStyle = '#1e293b'; // slate-800
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 124, 124);

  // Center subtle cross
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, 56);
  ctx.lineTo(64, 72);
  ctx.moveTo(56, 64);
  ctx.lineTo(72, 64);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  return new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.7,
    metalness: 0.2,
  });
}

export function createWallMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x334155, // slate-700
    roughness: 0.4,
    metalness: 0.5,
    flatShading: true,
  });
}

export function createWallTopMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x475569, // slate-600
    roughness: 0.3,
    metalness: 0.6,
  });
}

export function createTargetMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x06b6d4, // Cyan glow
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.8,
  });
}

export function createTargetRingMaterial(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    wireframe: true,
    transparent: true,
    opacity: 0.8,
  });
}

export function createCrateMaterial(onTarget: boolean): THREE.MeshStandardMaterial {
  if (onTarget) {
    return new THREE.MeshStandardMaterial({
      color: 0x0284c7, // vibrant active blue/cyan
      emissive: 0x38bdf8,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.7,
    });
  }

  return new THREE.MeshStandardMaterial({
    color: 0xd97706, // amber-600 crate
    emissive: 0x78350f,
    emissiveIntensity: 0.2,
    roughness: 0.4,
    metalness: 0.6,
  });
}

export function createPlayerBodyMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x6366f1, // Indigo robot body
    roughness: 0.3,
    metalness: 0.7,
  });
}

export function createPlayerVisorMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x10b981, // Emerald neon visor
    emissive: 0x34d399,
    emissiveIntensity: 1.0,
    roughness: 0.1,
    metalness: 0.9,
  });
}
