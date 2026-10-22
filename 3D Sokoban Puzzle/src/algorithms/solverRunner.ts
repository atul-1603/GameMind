import { Coord, LevelDefinition } from '../types/game';
import { AlgorithmType, SolverOptions, SolverResult } from '../types/solver';
import { solveAStar } from './astar';
import { solveBFS } from './bfs';
import { solveDFS } from './dfs';
import { solveGreedyBestFirst } from './greedyBestFirst';

export function runSolver(
  algorithm: AlgorithmType,
  level: LevelDefinition,
  initialPlayer?: Coord,
  initialCrates?: Coord[],
  options?: SolverOptions
): SolverResult {
  const p = initialPlayer ?? level.playerStart;
  const c = initialCrates ?? level.crates;

  switch (algorithm) {
    case 'BFS':
      return solveBFS(level, p, c, options);
    case 'DFS':
      return solveDFS(level, p, c, options);
    case 'ASTAR':
      return solveAStar(level, p, c, options);
    case 'GREEDY':
      return solveGreedyBestFirst(level, p, c, options);
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
}

export function runAllSolvers(
  level: LevelDefinition,
  initialPlayer?: Coord,
  initialCrates?: Coord[],
  options?: SolverOptions
): Record<AlgorithmType, SolverResult> {
  const p = initialPlayer ?? level.playerStart;
  const c = initialCrates ?? level.crates;

  // Run in a controlled sequence to measure high-resolution timing fairly
  const bfs = solveBFS(level, p, c, options);
  const dfs = solveDFS(level, p, c, options);
  const astar = solveAStar(level, p, c, options);
  const greedy = solveGreedyBestFirst(level, p, c, options);

  return {
    BFS: bfs,
    DFS: dfs,
    ASTAR: astar,
    GREEDY: greedy,
  };
}
