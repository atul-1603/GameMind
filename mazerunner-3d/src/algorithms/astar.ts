import { MazeGrid, Point2D } from '../maze/mazeTypes';
import { AlgorithmResult, ExplorationStep } from './algorithmTypes';
import {
  calculatePathCost,
  getCellCost,
  getWalkableNeighbors,
  manhattanDistance,
  pointToKey,
  reconstructPath,
} from './graph';
import { PriorityQueue } from './priorityQueue';

export function runAStar(maze: MazeGrid, start: Point2D, target: Point2D): AlgorithmResult {
  const startTime = performance.now();
  const pq = new PriorityQueue<Point2D>();
  const gScore = new Map<string, number>();
  const parentMap = new Map<string, Point2D>();
  const closedSet = new Set<string>();
  const explorationSteps: ExplorationStep[] = [];

  let expandedCount = 0;
  let generatedCount = 0;
  let maxFrontierSize = 0;
  let stepCounter = 0;

  const startKey = pointToKey(start);
  const targetKey = pointToKey(target);

  gScore.set(startKey, 0);
  const startH = manhattanDistance(start, target);
  // f(n) = g(n) + h(n). Add a tiny tie-breaker: f + h * 0.001 to break ties toward goal
  pq.push(start, startH);
  generatedCount++;
  maxFrontierSize = 1;

  explorationSteps.push({
    type: 'FRONTIER_ADD',
    cell: start,
    gCost: 0,
    hCost: startH,
    fCost: startH,
    stepNumber: ++stepCounter,
  });

  let found = false;

  while (!pq.isEmpty()) {
    if (pq.size() > maxFrontierSize) {
      maxFrontierSize = pq.size();
    }

    const current = pq.pop()!;
    const currKey = pointToKey(current);

    if (closedSet.has(currKey)) {
      continue;
    }
    closedSet.add(currKey);
    expandedCount++;

    const currentG = gScore.get(currKey) ?? 0;
    const currentH = manhattanDistance(current, target);
    const currentF = currentG + currentH;

    explorationSteps.push({
      type: 'NODE_EXPAND',
      cell: current,
      gCost: currentG,
      hCost: currentH,
      fCost: currentF,
      stepNumber: ++stepCounter,
    });

    if (currKey === targetKey) {
      found = true;
      break;
    }

    const neighbors = getWalkableNeighbors(maze, current);
    for (const neighbor of neighbors) {
      const nKey = pointToKey(neighbor);
      if (closedSet.has(nKey)) continue;

      const edgeCost = getCellCost(maze, neighbor);
      const tentativeG = currentG + edgeCost;
      const prevG = gScore.get(nKey) ?? Infinity;

      if (tentativeG < prevG) {
        gScore.set(nKey, tentativeG);
        parentMap.set(nKey, current);

        const h = manhattanDistance(neighbor, target);
        const f = tentativeG + h;
        // Priority includes slight weight for lower h as tie-breaker
        const priority = f + h * 0.0001;

        pq.push(neighbor, priority);
        generatedCount++;

        explorationSteps.push({
          type: 'FRONTIER_ADD',
          cell: neighbor,
          parent: current,
          gCost: tentativeG,
          hCost: h,
          fCost: f,
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
      algorithm: 'ASTAR',
      status: 'FOUND',
      path,
      pathLength: path.length,
      totalCost: calculatePathCost(maze, path),
      expandedCount,
      generatedCount,
      executionTimeMs,
      maxFrontierSize,
      isOptimal: true, // Admissible Manhattan heuristic guarantees optimality on 4-directional grid
      explorationSteps,
      start,
      target,
    };
  }

  return {
    algorithm: 'ASTAR',
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
