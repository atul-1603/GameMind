import { describe, it, expect } from 'vitest';
import {
  obstacleToAABB,
  resolvePlayerCollisions,
  rayIntersectsAABB,
  castRayAgainstObstacles,
} from '../game/collision';
import type { ArenaObstacle } from '../game/arenaDefinitions';

describe('Phase 2: Combat and Collision Physics System', () => {
  const sampleObstacle: ArenaObstacle = {
    x: 0,
    z: 0,
    width: 4,
    depth: 4,
    height: 3,
    type: 'wall',
  };

  it('correctly computes AABB bounds from obstacle definition', () => {
    const box = obstacleToAABB(sampleObstacle);
    expect(box.minX).toBe(-2);
    expect(box.maxX).toBe(2);
    expect(box.minZ).toBe(-2);
    expect(box.maxZ).toBe(2);
    expect(box.minY).toBe(0);
    expect(box.maxY).toBe(3);
  });

  it('prevents player from walking inside obstacles', () => {
    const arenaBounds = { minX: -20, maxX: 20, minZ: -20, maxZ: 20 };
    const radius = 0.5;

    // Moving from outside (x: -5, z: 0) directly towards center (x: 0, z: 0)
    const result = resolvePlayerCollisions(
      -5,
      0,
      0,
      0,
      radius,
      arenaBounds,
      [sampleObstacle]
    );

    expect(result.collided).toBe(true);
    // Player should be stopped at the boundary (minX - radius = -2 - 0.5 = -2.5)
    expect(result.x).toBeCloseTo(-2.5, 1);
  });

  it('clamps player within arena perimeter boundaries', () => {
    const arenaBounds = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
    const radius = 0.5;

    // Moving far beyond the west boundary
    const resultWest = resolvePlayerCollisions(
      -9,
      0,
      -15,
      0,
      radius,
      arenaBounds,
      []
    );
    expect(resultWest.collided).toBe(true);
    expect(resultWest.x).toBe(-9.5); // minX + radius

    // Moving far beyond the north boundary
    const resultNorth = resolvePlayerCollisions(
      0,
      -9,
      0,
      -20,
      radius,
      arenaBounds,
      []
    );
    expect(resultNorth.collided).toBe(true);
    expect(resultNorth.z).toBe(-9.5);
  });

  it('detects ray-AABB intersections for plasma blaster projectiles', () => {
    const box = obstacleToAABB(sampleObstacle);

    // Ray starting at (0, 1.5, -10) pointing in +Z direction (towards the box)
    const rayHit = rayIntersectsAABB(
      { x: 0, y: 1.5, z: -10 },
      { x: 0, y: 0, z: 1 },
      box
    );

    expect(rayHit.hit).toBe(true);
    expect(rayHit.distance).toBe(8); // from z=-10 to z=-2 is distance 8
    expect(rayHit.normal.z).toBe(-1); // hit front facing normal
  });

  it('verifies ray correctly misses obstacles when pointing away', () => {
    const box = obstacleToAABB(sampleObstacle);

    // Ray starting at (0, 1.5, -10) pointing in -Z direction (away from the box)
    const rayHit = rayIntersectsAABB(
      { x: 0, y: 1.5, z: -10 },
      { x: 0, y: 0, z: -1 },
      box
    );

    expect(rayHit.hit).toBe(false);
  });

  it('identifies the closest obstacle when casting rays against multiple walls', () => {
    const obstacles: ArenaObstacle[] = [
      { x: 0, z: 10, width: 2, depth: 2, height: 3, type: 'wall' }, // closer wall at z=9
      { x: 0, z: 20, width: 2, depth: 2, height: 3, type: 'wall' }, // further wall at z=19
    ];

    const hit = castRayAgainstObstacles(
      { x: 0, y: 1.5, z: 0 },
      { x: 0, y: 0, z: 1 },
      50,
      obstacles
    );

    expect(hit.hit).toBe(true);
    expect(hit.distance).toBe(9); // hits front of first obstacle at z=9
    expect(hit.point.z).toBeCloseTo(9, 1);
    expect(hit.obstacle?.z).toBe(10);
  });
});
