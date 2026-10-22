import { Coord } from '../types/game';

/**
 * Checks if a tile is a static wall
 */
export function isWall(r: number, c: number, wallsSet: Set<string>): boolean {
  return wallsSet.has(`${r},${c}`);
}

/**
 * Pre-computes simple corner deadlocks for a given level layout.
 * Any non-target tile where two adjacent orthogonal neighbors are walls is a corner deadlock.
 */
export function isCornerDeadlock(
  r: number,
  c: number,
  wallsSet: Set<string>,
  targetsSet: Set<string>
): boolean {
  const key = `${r},${c}`;
  if (targetsSet.has(key)) return false; // Targets in corners are fine!
  if (wallsSet.has(key)) return false;

  const up = isWall(r - 1, c, wallsSet);
  const down = isWall(r + 1, c, wallsSet);
  const left = isWall(r, c - 1, wallsSet);
  const right = isWall(r, c + 1, wallsSet);

  if ((up && left) || (up && right) || (down && left) || (down && right)) {
    return true;
  }

  return false;
}

/**
 * Checks if any crate in the current state is trapped in a deadlock.
 */
export function hasDeadlock(
  crates: Coord[],
  wallsSet: Set<string>,
  targetsSet: Set<string>
): boolean {
  for (const crate of crates) {
    if (isCornerDeadlock(crate.r, crate.c, wallsSet, targetsSet)) {
      return true;
    }
  }
  return false;
}
