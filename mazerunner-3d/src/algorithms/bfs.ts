import { MazeGrid, Point2D } from '../maze/mazeTypes';
import { AlgorithmResult, ExplorationStep } from './algorithmTypes';
import {
  calculatePathCost,
  getWalkableNeighbors,
  pointToKey,
  reconstructPath,
} from './graph';

export function runBFS(maze: MazeGrid, start: Point2D, target: Point2D): AlgorithmResult {
  const startTime = performance.now();
  const queue: Point2D[] = [];
  const visited = new Set<string>();
  const parentMap = new Map<string, Point2D>();
  const explorationSteps: ExplorationStep[] = [];

  let expandedCount = 0;
  let generatedCount = 0;
  let maxFrontierSize = 0;
  let stepCounter = 0;

  const startKey = pointToKey(start);
  const targetKey = pointToKey(target);

  queue.push(start);
  visited.add(startKey);
  generatedCount++;
  maxFrontierSize = 1;

  explorationSteps.push({
    type: 'FRONTIER_ADD',
    cell: start,
    stepNumber: ++stepCounter,
  });

  let found = false;

  while (queue.length > 0) {
    if (queue.length > maxFrontierSize) {
      maxFrontierSize = queue.length;
    }

    const current = queue.shift()!;
    expandedCount++;

    explorationSteps.push({
      type: 'NODE_EXPAND',
      cell: current,
      stepNumber: ++stepCounter,
    });

    if (pointToKey(current) === targetKey) {
      found = true;
      break;
    }

    const neighbors = getWalkableNeighbors(maze, current);
    for (const neighbor of neighbors) {
      const nKey = pointToKey(neighbor);
      if (!visited.has(nKey)) {
        visited.add(nKey);
        parentMap.set(nKey, current);
        queue.push(neighbor);
        generatedCount++;

        explorationSteps.push({
          type: 'FRONTIER_ADD',
          cell: neighbor,
          parent: current,
          stepNumber: ++stepCounter,
        });

        // Optimization: early exit check if target discovered
        if (nKey === targetKey) {
          found = true;
          expandedCount++; // counted as inspected
          explorationSteps.push({
            type: 'NODE_EXPAND',
            cell: neighbor,
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
      algorithm: 'BFS',
      status: 'FOUND',
      path,
      pathLength: path.length,
      totalCost: calculatePathCost(maze, path),
      expandedCount,
      generatedCount,
      executionTimeMs,
      maxFrontierSize,
      isOptimal: true, // Optimal for unweighted graphs (fewest steps)
      explorationSteps,
      start,
      target,
    };
  }

  return {
    algorithm: 'BFS',
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
