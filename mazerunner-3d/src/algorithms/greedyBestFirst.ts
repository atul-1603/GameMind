import { MazeGrid, Point2D } from '../maze/mazeTypes';
import { AlgorithmResult, ExplorationStep } from './algorithmTypes';
import {
  calculatePathCost,
  getWalkableNeighbors,
  manhattanDistance,
  pointToKey,
  reconstructPath,
} from './graph';
import { PriorityQueue } from './priorityQueue';

export function runGreedyBestFirst(
  maze: MazeGrid,
  start: Point2D,
  target: Point2D
): AlgorithmResult {
  const startTime = performance.now();
  const pq = new PriorityQueue<Point2D>();
  const parentMap = new Map<string, Point2D>();
  const visited = new Set<string>();
  const explorationSteps: ExplorationStep[] = [];

  let expandedCount = 0;
  let generatedCount = 0;
  let maxFrontierSize = 0;
  let stepCounter = 0;

  const startKey = pointToKey(start);
  const targetKey = pointToKey(target);

  const startH = manhattanDistance(start, target);
  pq.push(start, startH);
  visited.add(startKey);
  generatedCount++;
  maxFrontierSize = 1;

  explorationSteps.push({
    type: 'FRONTIER_ADD',
    cell: start,
    hCost: startH,
    stepNumber: ++stepCounter,
  });

  let found = false;

  while (!pq.isEmpty()) {
    if (pq.size() > maxFrontierSize) {
      maxFrontierSize = pq.size();
    }

    const current = pq.pop()!;
    const currKey = pointToKey(current);
    expandedCount++;

    const currentH = manhattanDistance(current, target);

    explorationSteps.push({
      type: 'NODE_EXPAND',
      cell: current,
      hCost: currentH,
      stepNumber: ++stepCounter,
    });

    if (currKey === targetKey) {
      found = true;
      break;
    }

    const neighbors = getWalkableNeighbors(maze, current);
    for (const neighbor of neighbors) {
      const nKey = pointToKey(neighbor);
      if (!visited.has(nKey)) {
        visited.add(nKey);
        parentMap.set(nKey, current);
        const h = manhattanDistance(neighbor, target);
        pq.push(neighbor, h);
        generatedCount++;

        explorationSteps.push({
          type: 'FRONTIER_ADD',
          cell: neighbor,
          parent: current,
          hCost: h,
          stepNumber: ++stepCounter,
        });

        if (nKey === targetKey) {
          found = true;
          expandedCount++;
          explorationSteps.push({
            type: 'NODE_EXPAND',
            cell: neighbor,
            hCost: 0,
            stepNumber: ++stepCounter,
          });
          break;
        }
      }
    }

    if (found) break;
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
      algorithm: 'GREEDY_BEST_FIRST',
      status: 'FOUND',
      path,
      pathLength: path.length,
      totalCost: calculatePathCost(maze, path),
      expandedCount,
      generatedCount,
      executionTimeMs,
      maxFrontierSize,
      isOptimal: false, // Greedy BF search is not optimal
      explorationSteps,
      start,
      target,
    };
  }

  return {
    algorithm: 'GREEDY_BEST_FIRST',
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
