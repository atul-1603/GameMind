import type { EnemyArchetype, CoverSpot } from '../game/arenaDefinitions';
import type { GridCoord, GridMap, AlgorithmType } from '../algorithms/pathTypes';
import type { EnemyAIState, EnemyStateContext } from './enemyStateMachine';
import { evaluateEnemyState } from './enemyStateMachine';
import { checkLineOfSight } from './perception';
import { worldToGrid, gridToWorld, runPathfinding } from './navigation';
import { resolvePlayerCollisions } from '../game/collision';
import type { ArenaObstacle } from '../game/arenaDefinitions';
import type { Projectile } from '../game/combatSystem';

export interface EnemyInstance {
  id: string;
  archetype: EnemyArchetype;
  state: EnemyAIState;
  position: { x: number; y: number; z: number };
  yaw: number;
  health: number;
  maxHealth: number;
  speed: number;
  attackRange: number;
  damage: number;
  fireCooldown: number;
  lastFireTime: number;
  patrolRoute: GridCoord[];
  patrolIndex: number;
  currentPath: GridCoord[];
  waypointIndex: number;
  lastKnownPlayerPos: { x: number; z: number } | null;
  timeSinceLastSeen: number;
  lastPathCalcTime: number;
  lastPathCalcPlayerPos: { x: number; z: number };
}

export function createEnemyInstance(
  id: string,
  archetype: EnemyArchetype,
  startPos: { x: number; y: number; z: number },
  patrolRoute: GridCoord[]
): EnemyInstance {
  let maxHealth = 70;
  let speed = 2.8;
  let damage = 12;
  let fireCooldown = 0.8;
  let attackRange = 14;

  if (archetype === 'guardian') {
    maxHealth = 160;
    speed = 1.8;
    damage = 25;
    fireCooldown = 1.6;
    attackRange = 18;
  } else if (archetype === 'hunter') {
    maxHealth = 110;
    speed = 2.3;
    damage = 18;
    fireCooldown = 1.1;
    attackRange = 16;
  }

  return {
    id,
    archetype,
    state: 'PATROL',
    position: { ...startPos },
    yaw: 0,
    health: maxHealth,
    maxHealth,
    speed,
    attackRange,
    damage,
    fireCooldown,
    lastFireTime: 0,
    patrolRoute,
    patrolIndex: 0,
    currentPath: [],
    waypointIndex: 0,
    lastKnownPlayerPos: null,
    timeSinceLastSeen: 999,
    lastPathCalcTime: 0,
    lastPathCalcPlayerPos: { x: 0, z: 0 },
  };
}

export interface EnemyUpdateOutput {
  spawnedProjectiles: Projectile[];
}

/**
 * Updates a single enemy instance's perception, state machine, pathfinding, movement, and attacks.
 */
export function updateEnemy(
  enemy: EnemyInstance,
  dt: number,
  playerPos: { x: number; y: number; z: number },
  navGrid: GridMap,
  obstacles: ArenaObstacle[],
  coverSpots: CoverSpot[],
  activeAlgorithm: AlgorithmType,
  arenaBounds: { minX: number; maxX: number; minZ: number; maxZ: number }
): EnemyUpdateOutput {
  const output: EnemyUpdateOutput = { spawnedProjectiles: [] };

  if (enemy.health <= 0 || enemy.state === 'DEAD') {
    enemy.state = 'DEAD';
    return output;
  }

  const now = performance.now() / 1000;

  // 1. Perception: Check line of sight to player
  const perception = checkLineOfSight(enemy.position, playerPos, obstacles, 35);
  if (perception.hasLineOfSight) {
    enemy.timeSinceLastSeen = 0;
    enemy.lastKnownPlayerPos = { x: playerPos.x, z: playerPos.z };
  } else {
    enemy.timeSinceLastSeen += dt;
  }

  // 2. Cover evaluation
  let nearestCoverDist = 999;
  let inCover = false;
  for (const cs of coverSpots) {
    const d = Math.hypot(enemy.position.x - cs.x, enemy.position.z - cs.z);
    if (d < nearestCoverDist) nearestCoverDist = d;
    if (d < 1.2) inCover = true;
  }

  // 3. State Machine transition
  const context: EnemyStateContext = {
    archetype: enemy.archetype,
    currentHealth: enemy.health,
    maxHealth: enemy.maxHealth,
    distanceToPlayer: perception.distance,
    hasLineOfSight: perception.hasLineOfSight,
    timeSinceLastSeen: enemy.timeSinceLastSeen,
    inCover,
    nearbyCoverDistance: nearestCoverDist,
  };

  const transition = evaluateEnemyState(enemy.state, context);
  enemy.state = transition.nextState;

  if (enemy.state === 'DEAD') {
    return output;
  }

  // 4. Determine navigation target position
  let targetWorldPos: { x: number; z: number } | null = null;

  switch (enemy.state) {
    case 'PATROL': {
      if (enemy.patrolRoute.length > 0) {
        const targetGrid = enemy.patrolRoute[enemy.patrolIndex % enemy.patrolRoute.length];
        targetWorldPos = gridToWorld(targetGrid.x, targetGrid.z, navGrid);
      }
      break;
    }

    case 'CHASE': {
      targetWorldPos = { x: playerPos.x, z: playerPos.z };
      break;
    }

    case 'INVESTIGATE': {
      if (enemy.lastKnownPlayerPos) {
        targetWorldPos = enemy.lastKnownPlayerPos;
      }
      break;
    }

    case 'TAKE_COVER': {
      // Find closest cover spot
      let closestCover: CoverSpot | null = null;
      let minD = 999;
      for (const cs of coverSpots) {
        const d = Math.hypot(enemy.position.x - cs.x, enemy.position.z - cs.z);
        if (d < minD) {
          minD = d;
          closestCover = cs;
        }
      }
      if (closestCover) {
        targetWorldPos = { x: closestCover.x, z: closestCover.z };
      }
      break;
    }

    case 'FLANK': {
      // Choose an offset flanking position to the left or right of the player
      const angle = Math.atan2(enemy.position.z - playerPos.z, enemy.position.x - playerPos.x) + Math.PI / 2;
      targetWorldPos = {
        x: playerPos.x + Math.cos(angle) * 10,
        z: playerPos.z + Math.sin(angle) * 10,
      };
      break;
    }

    case 'RETREAT': {
      // Move directly away from player
      const dirX = enemy.position.x - playerPos.x;
      const dirZ = enemy.position.z - playerPos.z;
      const len = Math.hypot(dirX, dirZ) || 1;
      targetWorldPos = {
        x: enemy.position.x + (dirX / len) * 8,
        z: enemy.position.z + (dirZ / len) * 8,
      };
      break;
    }

    case 'ATTACK': {
      // In attack state, face player and hold position or strafe slightly
      targetWorldPos = null;
      break;
    }
  }

  // 5. Path calculation using active DAA algorithm
  const distPlayerMoved = Math.hypot(
    playerPos.x - enemy.lastPathCalcPlayerPos.x,
    playerPos.z - enemy.lastPathCalcPlayerPos.z
  );

  const shouldRecalculatePath =
    targetWorldPos &&
    (enemy.currentPath.length === 0 ||
      enemy.waypointIndex >= enemy.currentPath.length ||
      now - enemy.lastPathCalcTime > 1.2 ||
      (enemy.state === 'CHASE' && distPlayerMoved > 2.0));

  if (shouldRecalculatePath && targetWorldPos) {
    const startGrid = worldToGrid(enemy.position.x, enemy.position.z, navGrid);
    const goalGrid = worldToGrid(targetWorldPos.x, targetWorldPos.z, navGrid);

    const pathResult = runPathfinding(activeAlgorithm, navGrid, startGrid, goalGrid, true);

    if (pathResult.success && pathResult.path.length > 0) {
      enemy.currentPath = pathResult.path;
      enemy.waypointIndex = 0;
      enemy.lastPathCalcTime = now;
      enemy.lastPathCalcPlayerPos = { x: playerPos.x, z: playerPos.z };

    }
  }

  // 6. Waypoint Following & Locomotion
  if (enemy.currentPath.length > 0 && enemy.waypointIndex < enemy.currentPath.length) {
    const nextWaypointGrid = enemy.currentPath[enemy.waypointIndex];
    const nextWaypointWorld = gridToWorld(nextWaypointGrid.x, nextWaypointGrid.z, navGrid);

    const toWpX = nextWaypointWorld.x - enemy.position.x;
    const toWpZ = nextWaypointWorld.z - enemy.position.z;
    const distToWp = Math.hypot(toWpX, toWpZ);

    if (distToWp < 0.8) {
      enemy.waypointIndex++;
      if (enemy.state === 'PATROL' && enemy.waypointIndex >= enemy.currentPath.length) {
        enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolRoute.length;
      }
    } else {
      const moveDirX = toWpX / distToWp;
      const moveDirZ = toWpZ / distToWp;

      // Rotate body towards movement direction
      enemy.yaw = Math.atan2(-moveDirX, -moveDirZ);

      const targetX = enemy.position.x + moveDirX * enemy.speed * dt;
      const targetZ = enemy.position.z + moveDirZ * enemy.speed * dt;

      // Obstacle collision resolution
      const resolved = resolvePlayerCollisions(
        enemy.position.x,
        enemy.position.z,
        targetX,
        targetZ,
        0.55,
        arenaBounds,
        obstacles
      );

      enemy.position.x = resolved.x;
      enemy.position.z = resolved.z;
    }
  }

  // 7. Combat Attack Execution
  if (enemy.state === 'ATTACK' || (perception.hasLineOfSight && perception.distance <= enemy.attackRange && (enemy.state === 'CHASE' || enemy.state === 'TAKE_COVER'))) {
    // Face player
    const toPlayerX = playerPos.x - enemy.position.x;
    const toPlayerZ = playerPos.z - enemy.position.z;
    enemy.yaw = Math.atan2(-toPlayerX, -toPlayerZ);

    if (now - enemy.lastFireTime >= enemy.fireCooldown) {
      enemy.lastFireTime = now;

      // Fire projectile towards player
      const dirX = perception.direction.x;
      const dirY = perception.direction.y;
      const dirZ = perception.direction.z;
      const boltSpeed = 45;

      const bulletColor = enemy.archetype === 'guardian' ? '#ffe600' : enemy.archetype === 'hunter' ? '#b026ff' : '#ff5500';

      const proj: Projectile = {
        id: `enemy_proj_${enemy.id}_${Date.now()}`,
        x: enemy.position.x,
        y: enemy.position.y + 1.1,
        z: enemy.position.z,
        vx: dirX * boltSpeed,
        vy: dirY * boltSpeed,
        vz: dirZ * boltSpeed,
        life: 2.0,
        maxLife: 2.0,
        isEnemy: true,
        damage: enemy.damage,
        color: bulletColor,
      };

      output.spawnedProjectiles.push(proj);
    }
  }

  return output;
}
