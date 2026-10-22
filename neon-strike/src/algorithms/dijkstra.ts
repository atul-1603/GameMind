import type { GridCoord, GridMap, PathResult } from './pathTypes';
import { coordKey, getNeighbors, reconstructPath } from './graphUtils';
import { MinPriorityQueue } from './priorityQueue';

/**
 * Dijkstra's Algorithm
 * Uses a min-priority queue ordered by accumulated path cost g(n).
 * Guarantees finding the minimum-cost path on graphs with non-negative edge weights.
 */
export function findPathDijkstra(
  gridMap: GridMap,
  start: GridCoord,
  goal: GridCoord,
  allowDiagonals = false
): PathResult {
  const startTime = performance.now();

  const pq = new MinPriorityQueue<GridCoord>();
  const dist = new Map<string, number>();
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
      algorithm: 'dijkstra',
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

  dist.set(startKey, 0);
  pq.enqueue(start, 0);
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

    const currentDist = dist.get(currentKey)!;
    const neighbors = getNeighbors(gridMap, current, allowDiagonals);

    for (const neighbor of neighbors) {
      const nKey = coordKey(neighbor.x, neighbor.z);
      if (visited.has(nKey)) continue;

      const cellCost = gridMap.grid[neighbor.z][neighbor.x].cost || 1.0;
      // Step distance: 1.414 for diagonal, 1.0 for orthogonal
      const isDiag = neighbor.x !== current.x && neighbor.z !== current.z;
      const stepCost = isDiag ? cellCost * 1.414 : cellCost;
      const newDist = currentDist + stepCost;

      const existingDist = dist.get(nKey);
      if (existingDist === undefined || newDist < existingDist) {
        dist.set(nKey, newDist);
        parentMap.set(nKey, current);
        pq.enqueue(neighbor, newDist);
        generatedCount++;
      }
    }
  }

  const endTime = performance.now();

  if (!found) {
    return {
      algorithm: 'dijkstra',
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
  const totalCost = dist.get(goalKey) ?? 0;

  return {
    algorithm: 'dijkstra',
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
