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

export function solveBFS(
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

  // If already at goal
  if (isGoalState(initialState.crates, targetsSet)) {
    return {
      algorithm: 'BFS',
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

  const queue: SearchNode[] = [rootNode];
  const visited = new Set<string>([startKey]);

  let nodesExpanded = 0;
  let nodesGenerated = 1;
  let maxFrontierSize = 1;

  while (queue.length > 0) {
    if (queue.length > maxFrontierSize) {
      maxFrontierSize = queue.length;
    }

    if (nodesExpanded > maxNodes) {
      return {
        algorithm: 'BFS',
        status: 'LIMIT_EXCEEDED',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: 0,
        cratePushes: 0,
        actions: [],
        isOptimal: false,
        notes: `Expansion limit of ${maxNodes} nodes reached.`,
      };
    }

    if (performance.now() - startTime > timeLimitMs) {
      return {
        algorithm: 'BFS',
        status: 'TIMEOUT',
        executionTimeMs: performance.now() - startTime,
        nodesExpanded,
        nodesGenerated,
        maxFrontierSize,
        solutionLength: 0,
        cratePushes: 0,
        actions: [],
        isOptimal: false,
        notes: `Search timed out after ${timeLimitMs}ms.`,
      };
    }

    const current = queue.shift()!;
    nodesExpanded++;

    const successors = getSuccessors(current.state, wallsSet, targetsSet, pruneDeadlocks);

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

        // Goal check
        if (isGoalState(succ.state.crates, targetsSet)) {
          // Reconstruct path
          const actions: SolverAction[] = [];
          let curr: SearchNode | null = childNode;
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
            algorithm: 'BFS',
            status: 'SOLVED',
            executionTimeMs: performance.now() - startTime,
            nodesExpanded,
            nodesGenerated,
            maxFrontierSize,
            solutionLength: actions.length,
            cratePushes: childNode.pushes,
            actions,
            isOptimal: true,
            notes: 'BFS explores state level-by-level, ensuring shortest path in player movements.',
          };
        }

        queue.push(childNode);
      }
    }
  }

  return {
    algorithm: 'BFS',
    status: 'UNSOLVABLE',
    executionTimeMs: performance.now() - startTime,
    nodesExpanded,
    nodesGenerated,
    maxFrontierSize,
    solutionLength: 0,
    cratePushes: 0,
    actions: [],
    isOptimal: false,
    notes: 'Exhausted all reachable states without finding a goal.',
  };
}
