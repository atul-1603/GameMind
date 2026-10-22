/**
 * NEON STRIKE: 3D AI COMBAT ARENA
 * Core pathfinding and graph data types for DAA algorithm laboratory and in-game navigation.
 */

export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar' | 'greedy';

export interface GridCoord {
  x: number;
  z: number;
}

export interface GridNode extends GridCoord {
  walkable: boolean;
  cost: number; // For Dijkstra / A* weighted terrain (default 1.0)
  isCover?: boolean; // Tactical cover location for Guardian/Hunter
}

export interface PathResult {
  algorithm: AlgorithmType;
  path: GridCoord[];
  visitedNodes: GridCoord[];
  expandedCount: number;
  generatedCount: number;
  maxFrontierSize: number;
  executionTimeMs: number;
  pathLength: number;
  totalCost: number;
  isOptimal: boolean;
  success: boolean;
}

export interface GridMap {
  width: number;
  height: number;
  cellSize: number;
  originX: number;
  originZ: number;
  grid: GridNode[][]; // [z][x]
}

export interface AlgorithmMetrics {
  name: string;
  expandedCount: number;
  generatedCount: number;
  executionTimeMs: number;
  pathLength: number;
  totalCost: number;
  maxFrontierSize: number;
  isOptimal: boolean;
}
