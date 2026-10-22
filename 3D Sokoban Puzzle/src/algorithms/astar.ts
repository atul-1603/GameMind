import { Coord, LevelDefinition } from '../types/game';
import { SolverAction, SolverOptions, SolverResult } from '../types/solver';
import { calculateHeuristic } from './heuristic';
import { PriorityQueue } from './priorityQueue';
import {
  encodeState,
  getSuccessors,
  isGoalState,
  SearchNode,
  SearchState,
  sortCrates,
} from './state';

export function solveAStar(
  level: LevelDefinition,
  initialPlayer: Coord = level.playerStart,
  initialCrates: Coord[] = level.crates,
  options: SolverOptions = {}
): SolverResult {
  const startTime = performance.now();
  const timeLimitMs = options.timeLimitMs ?? 8000;
  const maxNodes = options.maxNodes ?? 150000;
  const pruneDeadlocks = options.pruneDeadlocks ?? true;

  const wallsSet = new Set(level.walls.map(w => `${w.r},${w.c}`));
  const targetsSet = new Set(level.targets.map(t => `${t.r},${t.c}`));

  const initialState: SearchState = {
    player: { ...initialPlayer },
    crates: sortCrates(initialCrates),
  };

  const startKey = encodeState(initialState.player, initialState.crates);

  if (isGoalState(initialState.crates, targetsSet)) {
    return {
      algorithm: 'ASTAR',
      status: 'SOLVED',
      executionTimeMs: performance.now() - startTime,
      nodesExpanded: 0,
      nodesGenerated: 1,
      maxFrontierSize: 1,
      solutionLength: 0,
      cratePushes: 0,
      actions: [],
      isOptimal: true,
      notes: 'Initial state is already at the goal.',
    };
  }

  const initialH = calculateHeuristic(initialState.crates, level.targets);
  const rootNode: SearchNode = {
    state: initialState,
    parent: null,
    action: null,
    g: 0,
    h: initialH,
    f: initialH,
    pushes: 0,
  };

  // Min-heap ordered by f(n); if f is equal, break ties by lower h(n)
  const openSet = new PriorityQueue<SearchNode>((a, b) => {
    if (a.f !== b.f) return a.f - b.f;
    return a.h - b.h;
  });

  openSet.push(rootNode);

  // gScore map stores the minimum known cost to reach each encoded state
  const gScore = new Map<string, number>();
  gScore.set(startKey, 0);

  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;

  while (!openSet.isEmpty()) {
    if (openSet.size() > maxFrontierSize) {
      maxFrontierSize = openSet.size();
    }

    if (nodesExpanded > maxNodes) {
      return {
        algorithm: 'ASTAR',
        status: 'LIMIT_EXCEEDED',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: 0,
        cratePushes: 0,
        actions: [],
        isOptimal: false,
        notes: `A* expansion limit of ${maxNodes} nodes reached.`,
      };
    }

    if (performance.now() - startTime > timeLimitMs) {
      return {
        algorithm: 'ASTAR',
        status: 'TIMEOUT',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: 0,
        cratePushes: 0,
        actions: [],
        isOptimal: false,
        notes: `A* search timed out after ${timeLimitMs}ms.`,
      };
    }

    const current = openSet.pop()!;
    const currentKey = encodeState(current.state.player, current.state.crates);

    // If we've already found a strictly better path to this state, skip
    const recordedG = gScore.get(currentKey);
    if (recordedG !== undefined && current.g > recordedG) {
      continue;
    }

    nodesExpanded++;

    // Goal reached
    if (isGoalState(current.state.crates, targetsSet)) {
      const actions: SolverAction[] = [];
      let curr: SearchNode | null = current;
      while (curr && curr.action) {
        actions.unshift({
          direction: curr.action.direction,
          dr: curr.action.dr,
          dc: curr.action.dc,
          isPush: curr.action.isPush,
          playerPos: curr.state.player,
          cratesPos: curr.state.crates,
        });
        curr = curr.parent;
      }

      return {
        algorithm: 'ASTAR',
        status: 'SOLVED',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: actions.length,
        cratePushes: current.pushes,
        actions,
        isOptimal: true,
        notes: 'A* uses an admissible Manhattan matching heuristic to guarantee an optimal solution with directed exploration.',
      };
    }

    const successors = getSuccessors(current.state, wallsSet, targetsSet, pruneDeadlocks);

    for (const succ of successors) {
      const tentativeG = current.g + 1;
      const succKey = encodeState(succ.state.player, succ.state.crates);
      const existingG = gScore.get(succKey);

      if (existingG === undefined || tentativeG < existingG) {
        gScore.set(succKey, tentativeG);
        nodesGenerated++;

        const h = calculateHeuristic(succ.state.crates, level.targets);
        const childNode: SearchNode = {
          state: succ.state,
          parent: current,
          action: succ.action,
          g: tentativeG,
          h,
          f: tentativeG + h,
          pushes: current.pushes + (succ.action.isPush ? 1 : 0),
        };

        openSet.push(childNode);
      }
    }
  }

  return {
    algorithm: 'ASTAR',
    status: 'UNSOLVABLE',
    executionTimeMs: performance.now() - startTime,
    nodesExpanded,
    nodesGenerated,
    maxFrontierSize,
    solutionLength: 0,
    cratePushes: 0,
    actions: [],
    isOptimal: false,
    notes: 'Exhausted reachable states without finding a goal.',
  };
}
