import type { GridCoord, GridMap, GridNode, AlgorithmType, PathResult } from '../algorithms/pathTypes';
import type { ArenaMissionConfig } from '../game/arenaDefinitions';
import { obstacleToAABB } from '../game/collision';
import { findPathBFS } from '../algorithms/bfs';
import { findPathDFS } from '../algorithms/dfs';
import { findPathDijkstra } from '../algorithms/dijkstra';
import { findPathAStar } from '../algorithms/astar';
import { findPathGreedyBestFirst } from '../algorithms/greedyBestFirst';

export function worldToGrid(wx: number, wz: number, map: GridMap): GridCoord {
  const gx = Math.floor((wx - map.originX) / map.cellSize);
  const gz = Math.floor((wz - map.originZ) / map.cellSize);
  return {
    x: Math.max(0, Math.min(map.width - 1, gx)),
    z: Math.max(0, Math.min(map.height - 1, gz)),
  };
}

export function gridToWorld(gx: number, gz: number, map: GridMap): { x: number; z: number } {
  return {
    x: map.originX + (gx + 0.5) * map.cellSize,
    z: map.originZ + (gz + 0.5) * map.cellSize,
  };
}

/**
 * Builds a discrete logical navigation grid aligned with physical 3D arena boundaries and obstacles.
 */
export function buildGridMapFromArena(mission: ArenaMissionConfig, safetyMargin = 0.5): GridMap {
  const grid: GridNode[][] = [];

  for (let z = 0; z < mission.gridHeight; z++) {
    const row: GridNode[] = [];
    for (let x = 0; x < mission.gridWidth; x++) {
      const worldPos = {
        x: mission.originX + (x + 0.5) * mission.cellSize,
        z: mission.originZ + (z + 0.5) * mission.cellSize,
      };

      let walkable = true;
      let cost = 1.0;

      // Check against all physical obstacles with safety padding
      for (const obs of mission.obstacles) {
        const aabb = obstacleToAABB(obs);
        const minX = aabb.minX - safetyMargin;
        const maxX = aabb.maxX + safetyMargin;
        const minZ = aabb.minZ - safetyMargin;
        const maxZ = aabb.maxZ + safetyMargin;

        if (
          worldPos.x >= minX &&
          worldPos.x <= maxX &&
          worldPos.z >= minZ &&
          worldPos.z <= maxZ
        ) {
          walkable = false;
          break;
        }
      }

      // Check if near cover spot
      let isCover = false;
      for (const cs of mission.coverSpots) {
        const dist = Math.hypot(worldPos.x - cs.x, worldPos.z - cs.z);
        if (dist <= mission.cellSize * 0.8) {
          isCover = true;
          cost = 0.7; // Cover areas have lower cost incentive
          break;
        }
      }

      row.push({
        x,
        z,
        walkable,
        cost,
        isCover,
      });
    }
    grid.push(row);
  }

  return {
    width: mission.gridWidth,
    height: mission.gridHeight,
    cellSize: mission.cellSize,
    originX: mission.originX,
    originZ: mission.originZ,
    grid,
  };
}

/**
 * Executes the selected DAA pathfinding algorithm on the logical grid map.
 */
export function runPathfinding(
  algorithm: AlgorithmType,
  gridMap: GridMap,
  start: GridCoord,
  goal: GridCoord,
  allowDiagonals = false
): PathResult {
  switch (algorithm) {
    case 'bfs':
      return findPathBFS(gridMap, start, goal, allowDiagonals);
    case 'dfs':
      return findPathDFS(gridMap, start, goal, allowDiagonals);
    case 'dijkstra':
      return findPathDijkstra(gridMap, start, goal, allowDiagonals);
    case 'astar':
      return findPathAStar(gridMap, start, goal, allowDiagonals);
    case 'greedy':
      return findPathGreedyBestFirst(gridMap, start, goal, allowDiagonals);
    default:
      return findPathAStar(gridMap, start, goal, allowDiagonals);
  }
}
