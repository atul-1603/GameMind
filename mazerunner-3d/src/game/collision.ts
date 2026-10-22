import { MazeGrid, Point2D } from '../maze/mazeTypes';

export interface CollisionResult {
  newX: number;
  newZ: number;
  collided: boolean;
  reachedExit: boolean;
  pickedUpOrb: Point2D | null;
}

const PLAYER_RADIUS = 0.28; // Player bounding cylinder radius
const EXIT_REACH_RADIUS = 0.6; // Distance to portal center to trigger victory
const ORB_PICKUP_RADIUS = 0.55;

/**
 * Checks if a point (px, pz) with radius overlaps a wall cell.
 */
function isWall(maze: MazeGrid, cellX: number, cellZ: number): boolean {
  if (cellX < 0 || cellX >= maze.width || cellZ < 0 || cellZ >= maze.height) {
    return true; // Out of bounds is treated as wall
  }
  return maze.cells[cellZ][cellX].type === 'WALL';
}

/**
 * Resolves player movement with sliding collision detection against maze grid walls.
 */
export function resolveMovement(
  maze: MazeGrid,
  currX: number,
  currZ: number,
  deltaX: number,
  deltaZ: number
): CollisionResult {
  let resolvedX = currX;
  let resolvedZ = currZ;
  let collided = false;

  // 1. Try moving along X axis
  const targetX = currX + deltaX;
  if (!checkWallCollision(maze, targetX, resolvedZ, PLAYER_RADIUS)) {
    resolvedX = targetX;
  } else {
    collided = true;
  }

  // 2. Try moving along Z axis independently (Sliding response)
  const targetZ = currZ + deltaZ;
  if (!checkWallCollision(maze, resolvedX, targetZ, PLAYER_RADIUS)) {
    resolvedZ = targetZ;
  } else {
    collided = true;
  }

  // Check exit portal reach
  const distToExit = Math.hypot(resolvedX - maze.exit.x, resolvedZ - maze.exit.y);
  const reachedExit = distToExit < EXIT_REACH_RADIUS;

  // Check orb pickup
  let pickedUpOrb: Point2D | null = null;
  const gridX = Math.round(resolvedX);
  const gridZ = Math.round(resolvedZ);
  const cell = maze.cells[gridZ]?.[gridX];
  if (cell && cell.hasOrb) {
    const distToOrb = Math.hypot(resolvedX - gridX, resolvedZ - gridZ);
    if (distToOrb < ORB_PICKUP_RADIUS) {
      pickedUpOrb = { x: gridX, y: gridZ };
    }
  }

  return {
    newX: resolvedX,
    newZ: resolvedZ,
    collided,
    reachedExit,
    pickedUpOrb,
  };
}

/**
 * Circle-AABB overlap test against neighboring cells.
 */
export function checkWallCollision(
  maze: MazeGrid,
  px: number,
  pz: number,
  radius: number
): boolean {
  // Check the 3x3 surrounding cells
  const minX = Math.floor(px - radius);
  const maxX = Math.floor(px + radius);
  const minZ = Math.floor(pz - radius);
  const maxZ = Math.floor(pz + radius);

  for (let cz = minZ; cz <= maxZ; cz++) {
    for (let cx = minX; cx <= maxX; cx++) {
      if (isWall(maze, cx, cz)) {
        // Find closest point on cell box [cx - 0.5, cx + 0.5] x [cz - 0.5, cz + 0.5]
        // Note: cell centers are at integer coords (cx, cz), bounds are cx ± 0.5
        const boxMinX = cx - 0.5;
        const boxMaxX = cx + 0.5;
        const boxMinZ = cz - 0.5;
        const boxMaxZ = cz + 0.5;

        const closestX = Math.max(boxMinX, Math.min(px, boxMaxX));
        const closestZ = Math.max(boxMinZ, Math.min(pz, boxMaxZ));

        const distX = px - closestX;
        const distZ = pz - closestZ;
        const distSq = distX * distX + distZ * distZ;

        if (distSq < radius * radius) {
          return true; // Overlap detected
        }
      }
    }
  }

  return false;
}
