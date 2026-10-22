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

export function solveGreedyBestFirst(
  level: LevelDefinition,
  initialPlayer: Coord = level.playerStart,
  initialCrates: Coord[] = level.crates,
  options: SolverOptions = {}
): SolverResult {
  const startTime = performance.now();
  const timeLimitMs = options.timeLimitMs ?? 8000;
  const maxNodes = options.maxNodes ?? 100000;
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
      algorithm: 'GREEDY',
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

  // Min-heap ordered purely by heuristic h(n)
  const openSet = new PriorityQueue<SearchNode>((a, b) => {
    if (a.h !== b.h) return a.h - b.h;
    return a.g - b.g;
  });

  openSet.push(rootNode);

  const visited = new Set<string>([startKey]);

  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;

  while (!openSet.isEmpty()) {
    if (openSet.size() > maxFrontierSize) {
      maxFrontierSize = openSet.size();
    }

    if (nodesExpanded > maxNodes) {
      return {
        algorithm: 'GREEDY',
        status: 'LIMIT_EXCEEDED',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: 0,
        cratePushes: 0,
        actions: [],
        isOptimal: false,
        notes: `Greedy Best-First reached expansion limit of ${maxNodes} nodes.`,
      };
    }

    if (performance.now() - startTime > timeLimitMs) {
      return {
        algorithm: 'GREEDY',
        status: 'TIMEOUT',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: 0,
        cratePushes: 0,
        actions: [],
        isOptimal: false,
        notes: `Greedy Best-First search timed out after ${timeLimitMs}ms.`,
      };
    }

    const current = openSet.pop()!;
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
        algorithm: 'GREEDY',
        status: 'SOLVED',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: actions.length,
        cratePushes: current.pushes,
        actions,
        isOptimal: false,
        notes: 'Greedy Best-First focuses exclusively on minimizing the remaining estimated cost h(n); may produce non-optimal solutions.',
      };
    }

    const successors = getSuccessors(current.state, wallsSet, targetsSet, pruneDeadlocks);

    for (const succ of successors) {
      const succKey = encodeState(succ.state.player, succ.state.crates);

      if (!visited.has(succKey)) {
        visited.add(succKey);
        nodesGenerated++;

        const h = calculateHeuristic(succ.state.crates, level.targets);
        const childNode: SearchNode = {
          state: succ.state,
          parent: current,
          action: succ.action,
          g: current.g + 1,
          h,
          f: h,
          pushes: current.pushes + (succ.action.isPush ? 1 : 0),
        };

        openSet.push(childNode);
      }
    }
  }

  return {
    algorithm: 'GREEDY',
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
