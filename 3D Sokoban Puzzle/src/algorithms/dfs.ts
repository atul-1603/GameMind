import { Coord, LevelDefinition } from '../types/game';
import { SolverAction, SolverOptions, SolverResult } from '../types/solver';
import {
  encodeState,
  getSuccessors,
  isGoalState,
  SearchNode,
  SearchState,
  sortCrates,
} from './state';

export function solveDFS(
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
      algorithm: 'DFS',
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

  const rootNode: SearchNode = {
    state: initialState,
    parent: null,
    action: null,
    g: 0,
    h: 0,
    f: 0,
    pushes: 0,
  };

  const stack: SearchNode[] = [rootNode];
  // Track visited along current search or global visited
  const visited = new Set<string>([startKey]);

  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;

  while (stack.length > 0) {
    if (stack.length > maxFrontierSize) {
      maxFrontierSize = stack.length;
    }

    if (nodesExpanded > maxNodes) {
      return {
        algorithm: 'DFS',
        status: 'LIMIT_EXCEEDED',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: 0,
        cratePushes: 0,
        actions: [],
        isOptimal: false,
        notes: `DFS reached the safety expansion limit of ${maxNodes} nodes. Search is incomplete.`,
      };
    }

    if (performance.now() - startTime > timeLimitMs) {
      return {
        algorithm: 'DFS',
        status: 'TIMEOUT',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: 0,
        cratePushes: 0,
        actions: [],
        isOptimal: false,
        notes: `DFS search timed out after ${timeLimitMs}ms. Search is incomplete.`,
      };
    }

    const current = stack.pop()!;
    nodesExpanded++;

    // If goal reached
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
        algorithm: 'DFS',
        status: 'SOLVED',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: actions.length,
        cratePushes: current.pushes,
        actions,
        isOptimal: false, // DFS does not guarantee shortest path
        notes: 'DFS dives deep down paths before backtracking; solution is not guaranteed to be optimal.',
      };
    }

    const successors = getSuccessors(current.state, wallsSet, targetsSet, pruneDeadlocks);

    // Push successors to stack
    for (const succ of successors) {
      const succKey = encodeState(succ.state.player, succ.state.crates);

      if (!visited.has(succKey)) {
        visited.add(succKey);
        nodesGenerated++;

        const childNode: SearchNode = {
          state: succ.state,
          parent: current,
          action: succ.action,
          g: current.g + 1,
          h: 0,
          f: current.g + 1,
          pushes: current.pushes + (succ.action.isPush ? 1 : 0),
        };

        stack.push(childNode);
      }
    }
  }

  return {
    algorithm: 'DFS',
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
