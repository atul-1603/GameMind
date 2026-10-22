import type { ArenaObstacle } from '../game/arenaDefinitions';
import { castRayAgainstObstacles } from '../game/collision';

export interface PerceptionResult {
  hasLineOfSight: boolean;
  distance: number;
  direction: { x: number; y: number; z: number };
}

/**
 * Checks whether an enemy has clear line-of-sight to the player without wall obstruction.
 */
export function checkLineOfSight(
  enemyPos: { x: number; y: number; z: number },
  playerPos: { x: number; y: number; z: number },
  obstacles: ArenaObstacle[],
  maxVisionRange = 25
): PerceptionResult {
  const dx = playerPos.x - enemyPos.x;
  const dy = (playerPos.y + 1.0) - (enemyPos.y + 1.0); // Eye-level height
  const dz = playerPos.z - enemyPos.z;
  const distance = Math.hypot(dx, dy, dz);

  if (distance > maxVisionRange || distance < 0.001) {
    return {
      hasLineOfSight: false,
      distance,
      direction: { x: 0, y: 0, z: 0 },
    };
  }

  const dir = {
    x: dx / distance,
    y: dy / distance,
    z: dz / distance,
  };

  const eyeOrigin = {
    x: enemyPos.x,
    y: enemyPos.y + 1.0,
    z: enemyPos.z,
  };

  const rayHit = castRayAgainstObstacles(eyeOrigin, dir, distance, obstacles);

  // If ray hit an obstacle closer than player distance, line of sight is obstructed
  const hasLineOfSight = !rayHit.hit || rayHit.distance >= distance - 0.2;

  return {
    hasLineOfSight,
    distance,
    direction: dir,
  };
}
