import { describe, it, expect } from 'vitest';
import type { GridMap, GridNode } from '../algorithms/pathTypes';
import { findPathBFS } from '../algorithms/bfs';
import { findPathDFS } from '../algorithms/dfs';
import { findPathDijkstra } from '../algorithms/dijkstra';
import { findPathAStar } from '../algorithms/astar';
import { findPathGreedyBestFirst } from '../algorithms/greedyBestFirst';
import { buildGridMapFromArena, worldToGrid, gridToWorld } from '../ai/navigation';
import { MISSIONS } from '../game/arenaDefinitions';

// Helper to create a test grid of width x height
function createTestGrid(
  width: number,
  height: number,
  blockedCoords: Array<[number, number]> = [],
  weights: Record<string, number> = {}
): GridMap {
  const grid: GridNode[][] = [];
  const blockedSet = new Set(blockedCoords.map(([x, z]) => `${x},${z}`));

  for (let z = 0; z < height; z++) {
    const row: GridNode[] = [];
    for (let x = 0; x < width; x++) {
      const key = `${x},${z}`;
      row.push({
        x,
        z,
        walkable: !blockedSet.has(key),
        cost: weights[key] ?? 1.0,
      });
    }
    grid.push(row);
  }

  return {
    width,
    height,
    cellSize: 1,
    originX: 0,
    originZ: 0,
    grid,
  };
}

describe('Phase 3: DAA Pathfinding Algorithm Implementations', () => {
  // Simple 10x10 grid with a wall in the middle
  // Wall from (5, 2) to (5, 7)
  const wallCoords: Array<[number, number]> = [
    [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7]
  ];

  it('BFS returns an optimal shortest path on unweighted grid', () => {
    const map = createTestGrid(10, 10, wallCoords);
    const start = { x: 2, z: 5 };
    const goal = { x: 8, z: 5 };

    const result = findPathBFS(map, start, goal);

    expect(result.success).toBe(true);
    expect(result.isOptimal).toBe(true);
    expect(result.path.length).toBeGreaterThan(0);
    expect(result.path[0]).toEqual(start);
    expect(result.path[result.path.length - 1]).toEqual(goal);

    // Verify none of the path nodes hit the wall
    for (const node of result.path) {
      expect(map.grid[node.z][node.x].walkable).toBe(true);
    }
  });

  it('DFS returns a valid contiguous path when one exists', () => {
    const map = createTestGrid(10, 10, wallCoords);
    const start = { x: 2, z: 5 };
    const goal = { x: 8, z: 5 };

    const result = findPathDFS(map, start, goal);

    expect(result.success).toBe(true);
    expect(result.isOptimal).toBe(false); // DFS does not guarantee shortest path
    expect(result.path[0]).toEqual(start);
    expect(result.path[result.path.length - 1]).toEqual(goal);

    // Verify continuity of path (each step must be adjacent)
    for (let i = 0; i < result.path.length - 1; i++) {
      const cur = result.path[i];
      const next = result.path[i + 1];
      const dist = Math.abs(cur.x - next.x) + Math.abs(cur.z - next.z);
      expect(dist).toBe(1);
    }
  });

  it("Dijkstra's Algorithm finds the minimum-cost path around weighted hazardous zones", () => {
    // 5x5 grid with heavy penalty on direct path
    // Direct path row z=2 has high cost 10.0, detour row z=0 has cost 1.0
    const highCostWeights: Record<string, number> = {
      '1,2': 10, '2,2': 10, '3,2': 10,
    };
    const map = createTestGrid(5, 5, [], highCostWeights);
    const start = { x: 0, z: 2 };
    const goal = { x: 4, z: 2 };

    const result = findPathDijkstra(map, start, goal);

    expect(result.success).toBe(true);
    expect(result.isOptimal).toBe(true);
    // Path should divert around high-cost row z=2
    const usedHighCostCell = result.path.some((n) => n.z === 2 && n.x >= 1 && n.x <= 3);
    expect(usedHighCostCell).toBe(false);
  });

  it('A* Search finds the optimal path with fewer node expansions than Dijkstra', () => {
    const map = createTestGrid(20, 20, wallCoords);
    const start = { x: 2, z: 5 };
    const goal = { x: 18, z: 5 };

    const astarResult = findPathAStar(map, start, goal);
    const dijkstraResult = findPathDijkstra(map, start, goal);

    expect(astarResult.success).toBe(true);
    expect(dijkstraResult.success).toBe(true);

    // Both should find optimal total cost
    expect(astarResult.totalCost).toBe(dijkstraResult.totalCost);

    // A* guided by heuristic expands fewer nodes than uninformed Dijkstra
    expect(astarResult.expandedCount).toBeLessThan(dijkstraResult.expandedCount);
  });

  it('Greedy Best-First Search returns a valid path towards goal', () => {
    const map = createTestGrid(10, 10, wallCoords);
    const start = { x: 2, z: 5 };
    const goal = { x: 8, z: 5 };

    const result = findPathGreedyBestFirst(map, start, goal);

    expect(result.success).toBe(true);
    expect(result.path[0]).toEqual(start);
    expect(result.path[result.path.length - 1]).toEqual(goal);
  });

  it('correctly reports failure and success=false for unreachable targets', () => {
    // Completely enclose goal inside a wall
    const blockedGoalWall: Array<[number, number]> = [
      [7, 4], [8, 4], [9, 4],
      [7, 5],          [9, 5],
      [7, 6], [8, 6], [9, 6],
    ];
    const map = createTestGrid(10, 10, blockedGoalWall);
    const start = { x: 0, z: 0 };
    const goal = { x: 8, z: 5 }; // trapped inside wall

    const bfsRes = findPathBFS(map, start, goal);
    const astarRes = findPathAStar(map, start, goal);
    const dijkstraRes = findPathDijkstra(map, start, goal);

    expect(bfsRes.success).toBe(false);
    expect(bfsRes.path.length).toBe(0);

    expect(astarRes.success).toBe(false);
    expect(astarRes.path.length).toBe(0);

    expect(dijkstraRes.success).toBe(false);
    expect(dijkstraRes.path.length).toBe(0);
  });

  it('builds navigation grid from physical arena definition and converts coordinates', () => {
    const mission = MISSIONS[0]; // Sector 01 Training Grounds
    const navGrid = buildGridMapFromArena(mission);

    expect(navGrid.width).toBe(mission.gridWidth);
    expect(navGrid.height).toBe(mission.gridHeight);

    // Center player spawn coordinate to grid
    const spawnGrid = worldToGrid(mission.playerSpawn.x, mission.playerSpawn.z, navGrid);
    expect(spawnGrid.x).toBeGreaterThanOrEqual(0);
    expect(spawnGrid.x).toBeLessThan(navGrid.width);
    expect(spawnGrid.z).toBeGreaterThanOrEqual(0);
    expect(spawnGrid.z).toBeLessThan(navGrid.height);

    // Convert back from grid to world
    const worldBack = gridToWorld(spawnGrid.x, spawnGrid.z, navGrid);
    expect(Math.abs(worldBack.x - mission.playerSpawn.x)).toBeLessThanOrEqual(mission.cellSize);
    expect(Math.abs(worldBack.z - mission.playerSpawn.z)).toBeLessThanOrEqual(mission.cellSize);
  });
});
