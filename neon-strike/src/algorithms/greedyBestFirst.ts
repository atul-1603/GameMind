import type { GridCoord, GridMap, PathResult } from './pathTypes';
import { coordKey, getNeighbors, reconstructPath, manhattanDistance, euclideanDistance } from './graphUtils';
import { MinPriorityQueue } from './priorityQueue';

/**
 * Greedy Best-First Search
 * Uses the heuristic estimate h(n) alone to order the priority queue.
 * Greedily expands the node that appears closest to the goal.
 * Does NOT guarantee an optimal path.
 */
export function findPathGreedyBestFirst(
  gridMap: GridMap,
  start: GridCoord,
  goal: GridCoord,
  allowDiagonals = false
): PathResult {
  const startTime = performance.now();

  const pq = new MinPriorityQueue<GridCoord>();
  const parentMap = new Map<string, GridCoord>();
  const visited = new Set<string>();
  const visitedNodes: GridCoord[] = [];

  let expandedCount = 0;
  let generatedCount = 0;
  let maxFrontierSize = 0;

  const goalKey = coordKey(goal.x, goal.z);

  // Validate start and goal
  if (
    !gridMap.grid[start.z]?.[start.x]?.walkable ||
    !gridMap.grid[goal.z]?.[goal.x]?.walkable
  ) {
    return {
      algorithm: 'greedy',
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

  pq.enqueue(start, heuristic(start));
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

    const neighbors = getNeighbors(gridMap, current, allowDiagonals);

    for (const neighbor of neighbors) {
      const nKey = coordKey(neighbor.x, neighbor.z);
      if (!visited.has(nKey)) {
        if (!parentMap.has(nKey)) {
          parentMap.set(nKey, current);
        }
        pq.enqueue(neighbor, heuristic(neighbor));
        generatedCount++;

        if (nKey === goalKey) {
          found = true;
          break;
        }
      }
    }

    if (found) break;
  }

  const endTime = performance.now();

  if (!found) {
    return {
      algorithm: 'greedy',
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

  let totalCost = 0;
  for (let i = 1; i < path.length; i++) {
    const node = path[i];
    totalCost += gridMap.grid[node.z][node.x].cost || 1.0;
  }

  return {
    algorithm: 'greedy',
    path,
    visitedNodes,
    expandedCount,
    generatedCount,
    maxFrontierSize,
    executionTimeMs: endTime - startTime,
    pathLength: path.length,
    totalCost,
    isOptimal: false, // Greedy search is not guaranteed to be optimal
    success: true,
  };
}
