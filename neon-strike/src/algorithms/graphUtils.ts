import type { GridCoord, GridMap } from './pathTypes';

export function coordKey(x: number, z: number): string {
  return `${x},${z}`;
}

export function parseCoordKey(key: string): GridCoord {
  const parts = key.split(',');
  return { x: parseInt(parts[0], 10), z: parseInt(parts[1], 10) };
}

export function manhattanDistance(a: GridCoord, b: GridCoord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.z - b.z);
}

export function euclideanDistance(a: GridCoord, b: GridCoord): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

export function isValidCell(gridMap: GridMap, x: number, z: number): boolean {
  return (
    x >= 0 &&
    x < gridMap.width &&
    z >= 0 &&
    z < gridMap.height &&
    gridMap.grid[z] !== undefined &&
    gridMap.grid[z][x] !== undefined &&
    gridMap.grid[z][x].walkable
  );
}

export function getNeighbors(
  gridMap: GridMap,
  curr: GridCoord,
  allowDiagonals = false
): GridCoord[] {
  const neighbors: GridCoord[] = [];
  const dirs = [
    { x: 0, z: -1 }, // North
    { x: 1, z: 0 },  // East
    { x: 0, z: 1 },  // South
    { x: -1, z: 0 }, // West
  ];

  for (const d of dirs) {
    const nx = curr.x + d.x;
    const nz = curr.z + d.z;
    if (isValidCell(gridMap, nx, nz)) {
      neighbors.push({ x: nx, z: nz });
    }
  }

  if (allowDiagonals) {
    const diagDirs = [
      { x: 1, z: -1 },
      { x: 1, z: 1 },
      { x: -1, z: 1 },
      { x: -1, z: -1 },
    ];
    for (const d of diagDirs) {
      const nx = curr.x + d.x;
      const nz = curr.z + d.z;
      // Prevent corner cutting if both adjacent orthogonal cells are blocked
      if (
        isValidCell(gridMap, nx, nz) &&
        isValidCell(gridMap, curr.x + d.x, curr.z) &&
        isValidCell(gridMap, curr.x, curr.z + d.z)
      ) {
        neighbors.push({ x: nx, z: nz });
      }
    }
  }

  return neighbors;
}

export function reconstructPath(
  parentMap: Map<string, GridCoord>,
  start: GridCoord,
  goal: GridCoord
): GridCoord[] {
  const path: GridCoord[] = [];
  let current: GridCoord | undefined = goal;
  const startKey = coordKey(start.x, start.z);

  while (current) {
    path.push(current);
    const currKey = coordKey(current.x, current.z);
    if (currKey === startKey) break;
    current = parentMap.get(currKey);
  }

  return path.reverse();
}
