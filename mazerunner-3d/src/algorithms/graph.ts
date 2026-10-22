import { MazeGrid, Point2D } from '../maze/mazeTypes';

export function pointToKey(p: Point2D): string {
  return `${p.x},${p.y}`;
}

export function keyToPoint(key: string): Point2D {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

/**
 * 4-directional cardinal neighbors: UP (0, -1), RIGHT (1, 0), DOWN (0, 1), LEFT (-1, 0).
 */
export const CARDINAL_DIRECTIONS: Point2D[] = [
  { x: 0, y: -1 }, // North
  { x: 1, y: 0 },  // East
  { x: 0, y: 1 },  // South
  { x: -1, y: 0 }, // West
];

/**
 * Returns valid, non-wall walkable neighbors for a given cell in the maze.
 */
export function getWalkableNeighbors(maze: MazeGrid, cell: Point2D): Point2D[] {
  const neighbors: Point2D[] = [];
  for (const dir of CARDINAL_DIRECTIONS) {
    const nx = cell.x + dir.x;
    const ny = cell.y + dir.y;

    if (nx >= 0 && nx < maze.width && ny >= 0 && ny < maze.height) {
      const targetCell = maze.cells[ny][nx];
      if (targetCell.type !== 'WALL') {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }
  return neighbors;
}

/**
 * Returns the traversal cost to move onto a target cell.
 * Normal: 1
 * Difficult terrain: 3
 * Hazardous terrain: 5
 */
export function getCellCost(maze: MazeGrid, cell: Point2D): number {
  const target = maze.cells[cell.y]?.[cell.x];
  if (!target) return 1;
  return target.cost || 1;
}

/**
 * Admissible Manhattan Distance heuristic for 4-directional grid:
 * h(a, b) = |a.x - b.x| + |a.y - b.y|
 * Since the minimum edge cost in the maze is 1 (normal tile),
 * Manhattan distance * min_cost = Manhattan distance * 1, which is always <= actual true shortest path cost.
 * Therefore, h(n) is strictly admissible and consistent.
 */
export function manhattanDistance(a: Point2D, b: Point2D): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Reconstructs the path from start to target using the parent pointer map.
 */
export function reconstructPath(
  parentMap: Map<string, Point2D>,
  start: Point2D,
  target: Point2D
): Point2D[] {
  const path: Point2D[] = [];
  let currKey = pointToKey(target);
  const startKey = pointToKey(start);

  while (currKey) {
    const point = keyToPoint(currKey);
    path.push(point);
    if (currKey === startKey) break;

    const parent = parentMap.get(currKey);
    if (!parent) break;
    currKey = pointToKey(parent);
  }

  path.reverse();
  return path;
}

/**
 * Calculates total path movement cost.
 */
export function calculatePathCost(maze: MazeGrid, path: Point2D[]): number {
  if (path.length <= 1) return 0;
  let total = 0;
  // Starting cell cost is 0 since you are already on it; costs are incurred when moving into next cells.
  for (let i = 1; i < path.length; i++) {
    total += getCellCost(maze, path[i]);
  }
  return total;
}
