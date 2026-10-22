import type { GridCoord, GridMap, PathResult } from './pathTypes';
import { coordKey, getNeighbors, reconstructPath } from './graphUtils';

/**
 * Depth-First Search (DFS)
 * Uses an explicit LIFO stack to explore along each branch as deeply as possible.
 * Does NOT guarantee a shortest path or minimum cost.
 */
export function findPathDFS(
  gridMap: GridMap,
  start: GridCoord,
  goal: GridCoord,
  allowDiagonals = false,
  maxExpansions = 10000
): PathResult {
  const startTime = performance.now();

  const stack: GridCoord[] = [];
  const visited = new Set<string>();
  const parentMap = new Map<string, GridCoord>();
  const visitedNodes: GridCoord[] = [];

  let expandedCount = 0;
  let generatedCount = 0;
  let maxFrontierSize = 0;

  const startKey = coordKey(start.x, start.z);
  const goalKey = coordKey(goal.x, goal.z);

  // Check validity
  if (
    !gridMap.grid[start.z]?.[start.x]?.walkable ||
    !gridMap.grid[goal.z]?.[goal.x]?.walkable
  ) {
    return {
      algorithm: 'dfs',
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

  stack.push(start);
  visited.add(startKey);
  visitedNodes.push(start);
  generatedCount++;
  maxFrontierSize = 1;

  let found = false;

  while (stack.length > 0 && expandedCount < maxExpansions) {
    maxFrontierSize = Math.max(maxFrontierSize, stack.length);
    const current = stack.pop()!;
    expandedCount++;

    const currentKey = coordKey(current.x, current.z);

    if (currentKey === goalKey) {
      found = true;
      break;
    }

    const neighbors = getNeighbors(gridMap, current, allowDiagonals);
    for (const neighbor of neighbors) {
      const nKey = coordKey(neighbor.x, neighbor.z);
      if (!visited.has(nKey)) {
        visited.add(nKey);
        visitedNodes.push(neighbor);
        parentMap.set(nKey, current);
        stack.push(neighbor);
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
      algorithm: 'dfs',
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
    algorithm: 'dfs',
    path,
    visitedNodes,
    expandedCount,
    generatedCount,
    maxFrontierSize,
    executionTimeMs: endTime - startTime,
    pathLength: path.length,
    totalCost,
    isOptimal: false, // DFS explicitly does not guarantee optimality
    success: true,
  };
}
