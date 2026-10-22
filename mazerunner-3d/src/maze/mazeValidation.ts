import { MazeGrid, Point2D } from './mazeTypes';

export interface MazeValidationResult {
  isSolvable: boolean;
  startValid: boolean;
  exitValid: boolean;
  boundariesIntact: boolean;
  reachableWalkableRatio: number;
  shortestPathLength: number;
  errors: string[];
}

export function validateMazeSolvability(maze: MazeGrid): MazeValidationResult {
  const errors: string[] = [];

  // Check boundaries
  let boundariesIntact = true;
  for (let x = 0; x < maze.width; x++) {
    if (maze.cells[0][x].type !== 'WALL' || maze.cells[maze.height - 1][x].type !== 'WALL') {
      boundariesIntact = false;
      errors.push('Outer horizontal perimeter boundary breached.');
      break;
    }
  }
  for (let y = 0; y < maze.height; y++) {
    if (maze.cells[y][0].type !== 'WALL' || maze.cells[y][maze.width - 1].type !== 'WALL') {
      boundariesIntact = false;
      errors.push('Outer vertical perimeter boundary breached.');
      break;
    }
  }

  // Check start & exit
  const startValid =
    maze.start.x > 0 &&
    maze.start.x < maze.width - 1 &&
    maze.start.y > 0 &&
    maze.start.y < maze.height - 1 &&
    maze.cells[maze.start.y][maze.start.x].type !== 'WALL';

  if (!startValid) {
    errors.push(`Start position (${maze.start.x}, ${maze.start.y}) is inside a wall or out of bounds.`);
  }

  const exitValid =
    maze.exit.x > 0 &&
    maze.exit.x < maze.width - 1 &&
    maze.exit.y > 0 &&
    maze.exit.y < maze.height - 1 &&
    maze.cells[maze.exit.y][maze.exit.x].type !== 'WALL';

  if (!exitValid) {
    errors.push(`Exit position (${maze.exit.x}, ${maze.exit.y}) is inside a wall or out of bounds.`);
  }

  // Flood fill / BFS reachability from start
  let totalWalkable = 0;
  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      if (maze.cells[y][x].type !== 'WALL') {
        totalWalkable++;
      }
    }
  }

  const visited = new Set<string>();
  const queue: { point: Point2D; dist: number }[] = [];
  const startKey = `${maze.start.x},${maze.start.y}`;
  const exitKey = `${maze.exit.x},${maze.exit.y}`;

  visited.add(startKey);
  queue.push({ point: maze.start, dist: 1 });

  let isSolvable = false;
  let shortestPathLength = 0;

  const dirs = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  while (queue.length > 0) {
    const { point, dist } = queue.shift()!;
    const key = `${point.x},${point.y}`;

    if (key === exitKey) {
      isSolvable = true;
      shortestPathLength = dist;
    }

    for (const d of dirs) {
      const nx = point.x + d.x;
      const ny = point.y + d.y;
      const nKey = `${nx},${ny}`;

      if (
        nx >= 0 &&
        nx < maze.width &&
        ny >= 0 &&
        ny < maze.height &&
        maze.cells[ny][nx].type !== 'WALL' &&
        !visited.has(nKey)
      ) {
        visited.add(nKey);
        queue.push({ point: { x: nx, y: ny }, dist: dist + 1 });
      }
    }
  }

  if (!isSolvable) {
    errors.push('No valid walkable path exists from start to exit.');
  }

  return {
    isSolvable,
    startValid,
    exitValid,
    boundariesIntact,
    reachableWalkableRatio: totalWalkable > 0 ? visited.size / totalWalkable : 0,
    shortestPathLength,
    errors,
  };
}
