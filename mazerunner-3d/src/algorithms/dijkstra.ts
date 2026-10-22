import { MazeGrid, Point2D } from '../maze/mazeTypes';
import { AlgorithmResult, ExplorationStep } from './algorithmTypes';
import {
  calculatePathCost,
  getCellCost,
  getWalkableNeighbors,
  pointToKey,
  reconstructPath,
} from './graph';
import { PriorityQueue } from './priorityQueue';

export function runDijkstra(maze: MazeGrid, start: Point2D, target: Point2D): AlgorithmResult {
  const startTime = performance.now();
  const pq = new PriorityQueue<Point2D>();
  const dist = new Map<string, number>();
  const parentMap = new Map<string, Point2D>();
  const visited = new Set<string>();
  const explorationSteps: ExplorationStep[] = [];

  let expandedCount = 0;
  let generatedCount = 0;
  let maxFrontierSize = 0;
  let stepCounter = 0;

  const startKey = pointToKey(start);
  const targetKey = pointToKey(target);

  dist.set(startKey, 0);
  pq.push(start, 0);
  generatedCount++;
  maxFrontierSize = 1;

  explorationSteps.push({
    type: 'FRONTIER_ADD',
    cell: start,
    gCost: 0,
    stepNumber: ++stepCounter,
  });

  let found = false;

  while (!pq.isEmpty()) {
    if (pq.size() > maxFrontierSize) {
      maxFrontierSize = pq.size();
    }

    const current = pq.pop()!;
    const currKey = pointToKey(current);

    if (visited.has(currKey)) {
      continue;
    }
    visited.add(currKey);
    expandedCount++;

    const currentDist = dist.get(currKey) ?? 0;

    explorationSteps.push({
      type: 'NODE_EXPAND',
      cell: current,
      gCost: currentDist,
      stepNumber: ++stepCounter,
    });

    if (currKey === targetKey) {
      found = true;
      break;
    }

    const neighbors = getWalkableNeighbors(maze, current);
    for (const neighbor of neighbors) {
      const nKey = pointToKey(neighbor);
      if (visited.has(nKey)) continue;

      const edgeCost = getCellCost(maze, neighbor);
      const newCost = currentDist + edgeCost;
      const oldCost = dist.get(nKey) ?? Infinity;

      if (newCost < oldCost) {
        dist.set(nKey, newCost);
        parentMap.set(nKey, current);
        pq.push(neighbor, newCost);
        generatedCount++;

        explorationSteps.push({
          type: 'FRONTIER_ADD',
          cell: neighbor,
          parent: current,
          gCost: newCost,
          stepNumber: ++stepCounter,
        });
      }
    }
  }

  const executionTimeMs = performance.now() - startTime;

  if (found) {
    const path = reconstructPath(parentMap, start, target);
    explorationSteps.push({
      type: 'PATH_FOUND',
      cell: target,
      stepNumber: ++stepCounter,
    });

    return {
      algorithm: 'DIJKSTRA',
      status: 'FOUND',
      path,
      pathLength: path.length,
      totalCost: calculatePathCost(maze, path),
      expandedCount,
      generatedCount,
      executionTimeMs,
      maxFrontierSize,
      isOptimal: true, // Always optimal for non-negative edge costs
      explorationSteps,
      start,
      target,
    };
  }

  return {
    algorithm: 'DIJKSTRA',
    status: 'UNREACHABLE',
    path: [],
    pathLength: 0,
    totalCost: 0,
    expandedCount,
    generatedCount,
    executionTimeMs,
    maxFrontierSize,
    isOptimal: false,
    explorationSteps,
    start,
    target,
  };
}
