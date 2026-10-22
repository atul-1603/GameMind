import { Point2D } from '../maze/mazeTypes';

export type AlgorithmType = 'BFS' | 'DFS' | 'DIJKSTRA' | 'ASTAR' | 'GREEDY_BEST_FIRST';

export type SearchStatus = 'IDLE' | 'SEARCHING' | 'FOUND' | 'UNREACHABLE' | 'TIMEOUT';

export type ExplorationEventType = 'FRONTIER_ADD' | 'NODE_EXPAND' | 'PATH_FOUND';

export interface ExplorationStep {
  type: ExplorationEventType;
  cell: Point2D;
  parent?: Point2D;
  gCost?: number;
  hCost?: number;
  fCost?: number;
  stepNumber: number;
}

export interface AlgorithmResult {
  algorithm: AlgorithmType;
  status: SearchStatus;
  path: Point2D[];
  pathLength: number;
  totalCost: number;
  expandedCount: number;
  generatedCount: number;
  executionTimeMs: number;
  maxFrontierSize: number;
  isOptimal: boolean;
  explorationSteps: ExplorationStep[];
  start: Point2D;
  target: Point2D;
}

export interface AlgorithmDetails {
  name: string;
  fullName: string;
  dataStructure: string;
  timeComplexity: string;
  spaceComplexity: string;
  optimality: string;
  completeness: string;
  description: string;
  pseudocode: string;
}
