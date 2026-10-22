import type { GridCoord, GridMap, PathResult } from './pathTypes';
import { coordKey, getNeighbors, reconstructPath, manhattanDistance, euclideanDistance } from './graphUtils';
import { MinPriorityQueue } from './priorityQueue';

/**
 * A* Search Algorithm
 * Combines exact path cost g(n) with an admissible heuristic h(n): f(n) = g(n) + h(n).
 * Guarantees optimal paths with significantly reduced node expansion compared to uninformed search.
 */
export function findPathAStar(
  gridMap: GridMap,
  start: GridCoord,
  goal: GridCoord,
  allowDiagonals = false
): PathResult {
  const startTime = performance.now();

  const pq = new MinPriorityQueue<GridCoord>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const parentMap = new Map<string, GridCoord>();
  const visited = new Set<string>();
  const visitedNodes: GridCoord[] = [];

  let expandedCount = 0;
  let generatedCount = 0;
  let maxFrontierSize = 0;

  const startKey = coordKey(start.x, start.z);
  const goalKey = coordKey(goal.x, goal.z);

  // Validate start and goal
  if (
    !gridMap.grid[start.z]?.[start.x]?.walkable ||
    !gridMap.grid[goal.z]?.[goal.x]?.walkable
  ) {
    return {
      algorithm: 'astar',
      path: [],
      visitedNodes: [],
      expandedCount: 0,
      generatedCount: 0,
      maxFrontierSize: 0,
      executionTimeMs: performance.now() - startTime,
      pathLength: 0,
      totalCost: 0,
      isOptimal: false,
      success: false,
    };
  }

  const heuristic = (c: GridCoord) =>
    allowDiagonals ? euclideanDistance(c, goal) : manhattanDistance(c, goal);

  gScore.set(startKey, 0);
  const initialF = heuristic(start);
  fScore.set(startKey, initialF);
  pq.enqueue(start, initialF);
  generatedCount++;
  maxFrontierSize = 1;

  let found = false;

  while (!pq.isEmpty()) {
    maxFrontierSize = Math.max(maxFrontierSize, pq.size);
    const current = pq.dequeue()!;
    const currentKey = coordKey(current.x, current.z);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    visitedNodes.push(current);
    expandedCount++;

    if (currentKey === goalKey) {
      found = true;
      break;
    }

    const currentG = gScore.get(currentKey)!;
    const neighbors = getNeighbors(gridMap, current, allowDiagonals);

    for (const neighbor of neighbors) {
      const nKey = coordKey(neighbor.x, neighbor.z);
      if (visited.has(nKey)) continue;

      const cellCost = gridMap.grid[neighbor.z][neighbor.x].cost || 1.0;
      const isDiag = neighbor.x !== current.x && neighbor.z !== current.z;
      const stepCost = isDiag ? cellCost * 1.414 : cellCost;
      const tentativeG = currentG + stepCost;

      const existingG = gScore.get(nKey);
      if (existingG === undefined || tentativeG < existingG) {
        parentMap.set(nKey, current);
        gScore.set(nKey, tentativeG);
        const f = tentativeG + heuristic(neighbor);
        fScore.set(nKey, f);
        pq.enqueue(neighbor, f);
        generatedCount++;
      }
    }
  }

  const endTime = performance.now();

  if (!found) {
    return {
      algorithm: 'astar',
      path: [],
      visitedNodes,
      expandedCount,
      generatedCount,
      maxFrontierSize,
      executionTimeMs: endTime - startTime,
      pathLength: 0,
      totalCost: 0,
      isOptimal: false,
      success: false,
    };
  }

  const path = reconstructPath(parentMap, start, goal);
  const totalCost = gScore.get(goalKey) ?? 0;

  return {
    algorithm: 'astar',
    path,
    visitedNodes,
    expandedCount,
    generatedCount,
    maxFrontierSize,
    executionTimeMs: endTime - startTime,
    pathLength: path.length,
    totalCost,
    isOptimal: true,
    success: true,
  };
}
