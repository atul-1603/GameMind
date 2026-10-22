import { BoardState, PlayerId } from '../game/gameTypes';

export interface SearchStats {
  algorithm: 'minimax' | 'alphabeta';
  depth: number;
  bestMove: number;
  optimalScore: number;
  nodesVisited: number;
  terminalEvaluated: number;
  prunedBranches: number;
  executionTimeMs: number;
  maxDepthReached: number;
  moveScores: { col: number; score: number }[];
  effectiveBranchingFactor?: number;
}

export interface SearchOptions {
  depth: number;
  useMoveOrdering?: boolean;
  useTransposition?: boolean;
  collectEvents?: boolean;
  maxVizNodes?: number;
}

export interface VizNode {
  id: string;
  parentId: string | null;
  depth: number;
  col: number | null;
  player: PlayerId;
  isMaximizing: boolean;
  score: number | null;
  alpha?: number;
  beta?: number;
  pruned: boolean;
  isTerminal?: boolean;
  boardSnippet?: string;
  children: VizNode[];
}

export interface SearchResult {
  bestMove: number;
  score: number;
  stats: SearchStats;
  vizTree?: VizNode;
}
