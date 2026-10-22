import { Coord, Direction } from './game';

export type AlgorithmType = 'BFS' | 'DFS' | 'ASTAR' | 'GREEDY';

export interface SolverAction {
  direction: Direction;
  dr: number;
  dc: number;
  isPush: boolean;
  playerPos: Coord;
  cratesPos: Coord[];
}

export interface SolverResult {
  algorithm: AlgorithmType;
  status: 'SOLVED' | 'UNSOLVABLE' | 'TIMEOUT' | 'LIMIT_EXCEEDED' | 'ERROR';
  executionTimeMs: number;
  nodesExpanded: number;
  nodesGenerated: number;
  maxFrontierSize: number;
  solutionLength: number; // total player moves
  cratePushes: number;
  actions: SolverAction[];
  isOptimal: boolean;
  notes?: string;
}

export interface SolverOptions {
  timeLimitMs?: number;
  maxNodes?: number;
  pruneDeadlocks?: boolean;
}
