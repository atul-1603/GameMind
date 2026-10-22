import { Coord, Direction } from '../types/game';
import { DIRECTIONS, DIRECTION_LIST } from '../game/constants';
import { hasDeadlock } from '../game/deadlock';

export interface SearchState {
  player: Coord;
  crates: Coord[]; // canonically sorted
}

export interface SearchNode {
  state: SearchState;
  parent: SearchNode | null;
  action: {
    direction: Direction;
    dr: number;
    dc: number;
    isPush: boolean;
  } | null;
  g: number; // cost from start
  h: number; // heuristic to goal
  f: number; // g + h
  pushes: number;
}

/**
 * Creates a unique, canonical string key for a state.
 * Crates are sorted by (r, c) so permutation does not generate duplicate keys.
 */
export function encodeState(player: Coord, crates: Coord[]): string {
  // Sort crates canonically
  const sorted = [...crates].sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));
  const cratesStr = sorted.map(c => `${c.r},${c.c}`).join(';');
  return `${player.r},${player.c}|${cratesStr}`;
}

/**
 * Sorts crates canonically
 */
export function sortCrates(crates: Coord[]): Coord[] {
  return [...crates].sort((a, b) => (a.r !== b.r ? a.r - b.r : a.c - b.c));
}

/**
 * Checks if all crates are on target positions
 */
export function isGoalState(crates: Coord[], targetsSet: Set<string>): boolean {
  for (const crate of crates) {
    if (!targetsSet.has(`${crate.r},${crate.c}`)) {
      return false;
    }
  }
  return true;
}

export interface Successor {
  state: SearchState;
  action: {
    direction: Direction;
    dr: number;
    dc: number;
    isPush: boolean;
  };
}

/**
 * Generates all legal successor states adhering to Sokoban rules.
 */
export function getSuccessors(
  currentState: SearchState,
  wallsSet: Set<string>,
  targetsSet: Set<string>,
  pruneDeadlocks: boolean = false
): Successor[] {
  const successors: Successor[] = [];
  const { player, crates } = currentState;

  // Set for fast crate lookup
  const crateSet = new Set(crates.map(c => `${c.r},${c.c}`));

  for (const dir of DIRECTION_LIST) {
    const { dr, dc } = DIRECTIONS[dir];
    const newPr = player.r + dr;
    const newPc = player.c + dc;
    const newPlayerKey = `${newPr},${newPc}`;

    // Cannot step into wall
    if (wallsSet.has(newPlayerKey)) {
      continue;
    }

    // Check if stepping onto a crate
    if (crateSet.has(newPlayerKey)) {
      // Pushing crate
      const newCr = newPr + dr;
      const newCc = newPc + dc;
      const newCrateKey = `${newCr},${newCc}`;

      // Cannot push crate into wall or another crate
      if (wallsSet.has(newCrateKey) || crateSet.has(newCrateKey)) {
        continue;
      }

      // Create new crates array
      const newCrates = crates.map(c => {
        if (c.r === newPr && c.c === newPc) {
          return { r: newCr, c: newCc };
        }
        return { ...c };
      });

      // Optional deadlock pruning for corners
      if (pruneDeadlocks && hasDeadlock(newCrates, wallsSet, targetsSet)) {
        continue;
      }

      successors.push({
        state: {
          player: { r: newPr, c: newPc },
          crates: sortCrates(newCrates),
        },
        action: {
          direction: dir,
          dr,
          dc,
          isPush: true,
        },
      });
    } else {
      // Normal walk
      successors.push({
        state: {
          player: { r: newPr, c: newPc },
          crates: crates.map(c => ({ ...c })), // crates unchanged
        },
        action: {
          direction: dir,
          dr,
          dc,
          isPush: false,
        },
      });
    }
  }

  return successors;
}
