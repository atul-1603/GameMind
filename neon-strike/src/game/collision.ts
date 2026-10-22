import type { ArenaObstacle } from './arenaDefinitions';

export interface AABB {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface RayHit {
  hit: boolean;
  point: { x: number; y: number; z: number };
  normal: { x: number; y: number; z: number };
  distance: number;
  obstacle?: ArenaObstacle;
}

export function obstacleToAABB(obs: ArenaObstacle): AABB {
  const halfW = obs.width / 2;
  const halfD = obs.depth / 2;
  return {
    minX: obs.x - halfW,
    maxX: obs.x + halfW,
    minY: 0,
    maxY: obs.height,
    minZ: obs.z - halfD,
    maxZ: obs.z + halfD,
  };
}

/**
 * Resolves player horizontal movement against arena obstacles using swept/clamped circle-AABB collision.
 */
export function resolvePlayerCollisions(
  currX: number,
  currZ: number,
  targetX: number,
  targetZ: number,
  radius: number,
  arenaBounds: { minX: number; maxX: number; minZ: number; maxZ: number },
  obstacles: ArenaObstacle[]
): { x: number; z: number; collided: boolean } {
  let resolvedX = targetX;
  let resolvedZ = targetZ;
  let collided = false;

  // Arena perimeter bounds clamping
  const boundedMinX = arenaBounds.minX + radius;
  const boundedMaxX = arenaBounds.maxX - radius;
  const boundedMinZ = arenaBounds.minZ + radius;
  const boundedMaxZ = arenaBounds.maxZ - radius;

  if (resolvedX < boundedMinX) {
    resolvedX = boundedMinX;
    collided = true;
  } else if (resolvedX > boundedMaxX) {
    resolvedX = boundedMaxX;
    collided = true;
  }

  if (resolvedZ < boundedMinZ) {
    resolvedZ = boundedMinZ;
    collided = true;
  } else if (resolvedZ > boundedMaxZ) {
    resolvedZ = boundedMaxZ;
    collided = true;
  }

  // Check collision against each obstacle along X and Z separately for smooth sliding along walls
  for (const obs of obstacles) {
    const box = obstacleToAABB(obs);

    // Expand box by radius
    const expMinX = box.minX - radius;
    const expMaxX = box.maxX + radius;
    const expMinZ = box.minZ - radius;
    const expMaxZ = box.maxZ + radius;

    // Check if target point is inside expanded box
    if (
      resolvedX >= expMinX &&
      resolvedX <= expMaxX &&
      resolvedZ >= expMinZ &&
      resolvedZ <= expMaxZ
    ) {
      collided = true;

      // Determine which axis was crossed from curr to target
      const prevInX = currX >= expMinX && currX <= expMaxX;
      const prevInZ = currZ >= expMinZ && currZ <= expMaxZ;

      if (!prevInX && prevInZ) {
        // Came from outside along X, block X
        resolvedX = currX < box.minX ? expMinX : expMaxX;
      } else if (prevInX && !prevInZ) {
        // Came from outside along Z, block Z
        resolvedZ = currZ < box.minZ ? expMinZ : expMaxZ;
      } else {
        // Find closest face to push out
        const distMinX = Math.abs(resolvedX - expMinX);
        const distMaxX = Math.abs(resolvedX - expMaxX);
        const distMinZ = Math.abs(resolvedZ - expMinZ);
        const distMaxZ = Math.abs(resolvedZ - expMaxZ);

        const minDist = Math.min(distMinX, distMaxX, distMinZ, distMaxZ);

        if (minDist === distMinX) resolvedX = expMinX;
        else if (minDist === distMaxX) resolvedX = expMaxX;
        else if (minDist === distMinZ) resolvedZ = expMinZ;
        else resolvedZ = expMaxZ;
      }
    }
  }

  return { x: resolvedX, z: resolvedZ, collided };
}

/**
 * Fast ray-AABB slab intersection test for bullets and line-of-sight checks.
 */
export function rayIntersectsAABB(
  rayOrigin: { x: number; y: number; z: number },
  rayDir: { x: number; y: number; z: number },
  box: AABB
): { hit: boolean; distance: number; normal: { x: number; y: number; z: number } } {
  let tmin = -Infinity;
  let tmax = Infinity;
  let normal = { x: 0, y: 0, z: 0 };

  const axes: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z'];
  const minBounds = { x: box.minX, y: box.minY, z: box.minZ };
  const maxBounds = { x: box.maxX, y: box.maxY, z: box.maxZ };

  for (const axis of axes) {
    const origin = rayOrigin[axis];
    const dir = rayDir[axis];
    const minVal = minBounds[axis];
    const maxVal = maxBounds[axis];

    if (Math.abs(dir) < 1e-6) {
      if (origin < minVal || origin > maxVal) {
        return { hit: false, distance: 0, normal: { x: 0, y: 0, z: 0 } };
      }
    } else {
      let t1 = (minVal - origin) / dir;
      let t2 = (maxVal - origin) / dir;
      let nAxis = -1;

      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
        nAxis = 1;
      }

      if (t1 > tmin) {
        tmin = t1;
        normal = { x: 0, y: 0, z: 0 };
        normal[axis] = nAxis;
      }
      tmax = Math.min(tmax, t2);

      if (tmin > tmax || tmax < 0) {
        return { hit: false, distance: 0, normal: { x: 0, y: 0, z: 0 } };
      }
    }
  }

  return {
    hit: tmin >= 0,
    distance: tmin,
    normal,
  };
}

/**
 * Casts a ray against all obstacles and finds the closest collision.
 */
export function castRayAgainstObstacles(
  origin: { x: number; y: number; z: number },
  dir: { x: number; y: number; z: number },
  maxDist: number,
  obstacles: ArenaObstacle[]
): RayHit {
  let closestDist = maxDist;
  let hitResult: RayHit = {
    hit: false,
    point: {
      x: origin.x + dir.x * maxDist,
      y: origin.y + dir.y * maxDist,
      z: origin.z + dir.z * maxDist,
    },
    normal: { x: 0, y: 1, z: 0 },
    distance: maxDist,
  };

  for (const obs of obstacles) {
    const box = obstacleToAABB(obs);
    const test = rayIntersectsAABB(origin, dir, box);

    if (test.hit && test.distance < closestDist && test.distance > 0.01) {
      closestDist = test.distance;
      hitResult = {
        hit: true,
        point: {
          x: origin.x + dir.x * test.distance,
          y: origin.y + dir.y * test.distance,
          z: origin.z + dir.z * test.distance,
        },
        normal: test.normal,
        distance: test.distance,
        obstacle: obs,
      };
    }
  }

  return hitResult;
}
