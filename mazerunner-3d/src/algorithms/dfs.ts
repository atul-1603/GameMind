import { MazeGrid, Point2D } from '../maze/mazeTypes';
import { AlgorithmResult, ExplorationStep } from './algorithmTypes';
import {
  calculatePathCost,
  getWalkableNeighbors,
  pointToKey,
  reconstructPath,
} from './graph';

export interface DFSOptions {
  maxExpansions?: number;
}

export function runDFS(
  maze: MazeGrid,
  start: Point2D,
  target: Point2D,
  options?: DFSOptions
): AlgorithmResult {
  const startTime = performance.now();
  const maxExpansions = options?.maxExpansions ?? 100000;
  
  const stack: Point2D[] = [];
  const visited = new Set<string>();
  const parentMap = new Map<string, Point2D>();
  const explorationSteps: ExplorationStep[] = [];

  let expandedCount = 0;
  let generatedCount = 0;
  let maxFrontierSize = 0;
  let stepCounter = 0;

  const targetKey = pointToKey(target);

  stack.push(start);
  generatedCount++;
  maxFrontierSize = 1;

  explorationSteps.push({
    type: 'FRONTIER_ADD',
    cell: start,
    stepNumber: ++stepCounter,
  });

  let found = false;
  let timedOut = false;

  while (stack.length > 0) {
    if (stack.length > maxFrontierSize) {
      maxFrontierSize = stack.length;
    }

    if (expandedCount >= maxExpansions) {
      timedOut = true;
      break;
    }

    const current = stack.pop()!;
    const currKey = pointToKey(current);

    if (visited.has(currKey)) {
      continue;
    }

    visited.add(currKey);
    expandedCount++;

    explorationSteps.push({
      type: 'NODE_EXPAND',
      cell: current,
      stepNumber: ++stepCounter,
    });

    if (currKey === targetKey) {
      found = true;
      break;
    }

    const neighbors = getWalkableNeighbors(maze, current);
    // Push neighbors in reverse order so first neighbor is visited next
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      const nKey = pointToKey(neighbor);
      if (!visited.has(nKey)) {
        if (!parentMap.has(nKey)) {
          parentMap.set(nKey, current);
        }
        stack.push(neighbor);
        generatedCount++;

        explorationSteps.push({
          type: 'FRONTIER_ADD',
          cell: neighbor,
          parent: current,
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
      algorithm: 'DFS',
      status: 'FOUND',
      path,
      pathLength: path.length,
      totalCost: calculatePathCost(maze, path),
      expandedCount,
      generatedCount,
      executionTimeMs,
      maxFrontierSize,
      isOptimal: false, // DFS does not guarantee shortest or least-cost path
      explorationSteps,
      start,
      target,
    };
  }

  return {
    algorithm: 'DFS',
    status: timedOut ? 'TIMEOUT' : 'UNREACHABLE',
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
