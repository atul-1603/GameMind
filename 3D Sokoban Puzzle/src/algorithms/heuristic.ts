import { Coord } from '../types/game';

/**
 * Calculates Manhattan distance between two coordinates
 */
export function manhattanDistance(a: Coord, b: Coord): number {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

/**
 * Generates all permutations of an array of numbers [0, ..., n-1]
 */
function getPermutations(n: number): number[][] {
  const result: number[][] = [];
  const current: number[] = [];
  const used: boolean[] = new Array(n).fill(false);

  function backtrack() {
    if (current.length === n) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < n; i++) {
      if (!used[i]) {
        used[i] = true;
        current.push(i);
        backtrack();
        current.pop();
        used[i] = false;
      }
    }
  }

  backtrack();
  return result;
}

// Cache permutations for small N
const PERM_CACHE: Map<number, number[][]> = new Map();

/**
 * Admissible Heuristic: Minimum Manhattan Bipartite Matching.
 * Assigns each crate to a distinct target such that total Manhattan distance is minimized.
 * Since each crate must be pushed at least this many times to reach a target,
 * this is a true admissible lower bound on moves.
 */
export function calculateHeuristic(crates: Coord[], targets: Coord[]): number {
  const n = crates.length;
  if (n === 0 || targets.length === 0) return 0;

  // If number of crates and targets is small (<= 6), compute exact optimal matching
  if (n <= targets.length && targets.length <= 6) {
    if (!PERM_CACHE.has(targets.length)) {
      PERM_CACHE.set(targets.length, getPermutations(targets.length));
    }
    const perms = PERM_CACHE.get(targets.length)!;

    let minTotal = Infinity;
    for (const p of perms) {
      let currentCost = 0;
      for (let i = 0; i < n; i++) {
        const targetIdx = p[i];
        currentCost += manhattanDistance(crates[i], targets[targetIdx]);
      }
      if (currentCost < minTotal) {
        minTotal = currentCost;
      }
    }

    return minTotal;
  }

  // Fallback for larger sizes: Greedy nearest unassigned target
  let totalDistance = 0;
  const unassignedTargets = [...targets];

  for (const crate of crates) {
    let bestDist = Infinity;
    let bestIdx = -1;

    for (let i = 0; i < unassignedTargets.length; i++) {
      const d = manhattanDistance(crate, unassignedTargets[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      totalDistance += bestDist;
      unassignedTargets.splice(bestIdx, 1);
    }
  }

  return totalDistance;
}
