import { MazeCell, MazeGrid, Point2D } from './mazeTypes';
import { validateMazeSolvability } from './mazeValidation';

/**
 * High-quality seeded pseudo-random number generator (Mulberry32).
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }

  public shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
}

export interface GeneratorOptions {
  width: number;
  height: number;
  seed?: number;
  loopProbability?: number; // 0 to 1, creates loops/alternative routes
  hasWeightedTerrain?: boolean;
  orbCount?: number;
  chambersCount?: number;
}

/**
 * Generates a full 3D maze grid using Seeded Randomized Backtracking with loop carving.
 */
export function generateMaze(options: GeneratorOptions): MazeGrid {
  // Ensure dimensions are odd for proper grid wall/passage structure
  const width = options.width % 2 === 0 ? options.width + 1 : options.width;
  const height = options.height % 2 === 0 ? options.height + 1 : options.height;
  const seed = options.seed !== undefined ? options.seed : Math.floor(Math.random() * 1000000);
  const rng = new SeededRandom(seed);
  const loopProbability = options.loopProbability ?? 0.15;
  const hasWeightedTerrain = options.hasWeightedTerrain ?? false;
  const targetOrbs = options.orbCount ?? 3;
  const chambersCount = options.chambersCount ?? Math.floor(Math.min(width, height) / 8);

  // Initialize all cells as WALL
  const cells: MazeCell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: MazeCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        x,
        y,
        type: 'WALL',
        cost: Infinity,
      });
    }
    cells.push(row);
  }

  // 1. Carve open chambers if requested (for larger levels)
  for (let c = 0; c < chambersCount; c++) {
    const chamberW = rng.nextInt(3, 5);
    const chamberH = rng.nextInt(3, 5);
    // Align to odd indices
    const cx = (rng.nextInt(1, Math.floor((width - chamberW - 2) / 2)) * 2) + 1;
    const cy = (rng.nextInt(1, Math.floor((height - chamberH - 2) / 2)) * 2) + 1;

    for (let dy = 0; dy < chamberH; dy++) {
      for (let dx = 0; dx < chamberW; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
          cells[ny][nx].type = 'EMPTY';
          cells[ny][nx].cost = 1;
        }
      }
    }
  }

  // 2. Randomized Depth-First Search with backtracking
  const stack: Point2D[] = [];
  const start: Point2D = { x: 1, y: 1 };
  cells[start.y][start.x].type = 'START';
  cells[start.y][start.x].cost = 1;

  stack.push(start);

  const directions = [
    { dx: 0, dy: -2 }, // North
    { dx: 2, dy: 0 },  // East
    { dx: 0, dy: 2 },  // South
    { dx: -2, dy: 0 }, // West
  ];

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const unvisitedNeighbors: { next: Point2D; wall: Point2D }[] = [];

    for (const dir of directions) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const wx = current.x + dir.dx / 2;
      const wy = current.y + dir.dy / 2;

      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
        if (cells[ny][nx].type === 'WALL') {
          unvisitedNeighbors.push({
            next: { x: nx, y: ny },
            wall: { x: wx, y: wy },
          });
        }
      }
    }

    if (unvisitedNeighbors.length > 0) {
      rng.shuffle(unvisitedNeighbors);
      const chosen = unvisitedNeighbors[0];

      // Carve wall and target cell
      cells[chosen.wall.y][chosen.wall.x].type = 'EMPTY';
      cells[chosen.wall.y][chosen.wall.x].cost = 1;

      cells[chosen.next.y][chosen.next.x].type = 'EMPTY';
      cells[chosen.next.y][chosen.next.x].cost = 1;

      stack.push(chosen.next);
    } else {
      stack.pop();
    }
  }

  // 3. Add Loops (Braiding) to create alternative routes and interesting algorithm trade-offs
  if (loopProbability > 0) {
    for (let y = 2; y < height - 2; y += 2) {
      for (let x = 2; x < width - 2; x += 2) {
        if (cells[y][x].type === 'WALL' && rng.next() < loopProbability) {
          // Check if knocking down this wall connects two distinct passages
          const horizontal = cells[y][x - 1].type !== 'WALL' && cells[y][x + 1].type !== 'WALL';
          const vertical = cells[y - 1][x].type !== 'WALL' && cells[y + 1][x].type !== 'WALL';
          if (horizontal || vertical) {
            cells[y][x].type = 'EMPTY';
            cells[y][x].cost = 1;
          }
        }
      }
    }
  }

  // 4. Place Exit Portal in bottom-right walkable region
  let exit: Point2D = { x: width - 2, y: height - 2 };
  // Find closest walkable cell to bottom-right corner
  let bestDist = Infinity;
  for (let y = height - 2; y >= Math.max(1, height - 6); y--) {
    for (let x = width - 2; x >= Math.max(1, width - 6); x--) {
      if (cells[y][x].type !== 'WALL' && (x !== start.x || y !== start.y)) {
        const d = (width - 1 - x) + (height - 1 - y);
        if (d < bestDist) {
          bestDist = d;
          exit = { x, y };
        }
      }
    }
  }
  cells[exit.y][exit.x].type = 'EXIT';
  cells[exit.y][exit.x].cost = 1;

  // 5. Place Weighted Terrain if requested (swamps/mud and hazard grids)
  if (hasWeightedTerrain) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        if (cells[y][x].type === 'EMPTY') {
          // Do not place hazards immediately adjacent to start or exit
          const distStart = Math.abs(x - start.x) + Math.abs(y - start.y);
          const distExit = Math.abs(x - exit.x) + Math.abs(y - exit.y);
          if (distStart > 2 && distExit > 2) {
            const roll = rng.next();
            if (roll < 0.12) {
              cells[y][x].type = 'DIFFICULT';
              cells[y][x].cost = 3;
            } else if (roll < 0.17) {
              cells[y][x].type = 'HAZARDOUS';
              cells[y][x].cost = 5;
            }
          }
        }
      }
    }
  }

  // 6. Place Collectible Energy Orbs in dead-ends or corridors
  let placedOrbs = 0;
  const deadEnds: Point2D[] = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (cells[y][x].type === 'EMPTY') {
        let wallCount = 0;
        if (cells[y - 1][x].type === 'WALL') wallCount++;
        if (cells[y + 1][x].type === 'WALL') wallCount++;
        if (cells[y][x - 1].type === 'WALL') wallCount++;
        if (cells[y][x + 1].type === 'WALL') wallCount++;

        if (wallCount >= 3) {
          deadEnds.push({ x, y });
        }
      }
    }
  }

  rng.shuffle(deadEnds);
  for (const de of deadEnds) {
    if (placedOrbs >= targetOrbs) break;
    cells[de.y][de.x].type = 'ORB';
    cells[de.y][de.x].hasOrb = true;
    placedOrbs++;
  }

  // If not enough dead-ends, place in random open cells
  if (placedOrbs < targetOrbs) {
    for (let y = 1; y < height - 1 && placedOrbs < targetOrbs; y++) {
      for (let x = 1; x < width - 1 && placedOrbs < targetOrbs; x++) {
        if (cells[y][x].type === 'EMPTY' && rng.next() < 0.08) {
          cells[y][x].type = 'ORB';
          cells[y][x].hasOrb = true;
          placedOrbs++;
        }
      }
    }
  }

  const mazeGrid: MazeGrid = {
    width,
    height,
    cells,
    start,
    exit,
    seed,
    totalOrbs: placedOrbs,
  };

  // 7. Validate Solvability
  const validation = validateMazeSolvability(mazeGrid);
  if (!validation.isSolvable) {
    // Carve a guaranteed fallback direct path from start to exit
    carveGuaranteedPath(mazeGrid, start, exit);
  }

  return mazeGrid;
}

/**
 * Fallback fail-safe: carves a simple L-shape or direct corridor to guarantee 100% solvability.
 */
function carveGuaranteedPath(maze: MazeGrid, start: Point2D, exit: Point2D): void {
  let cx = start.x;
  let cy = start.y;

  while (cx !== exit.x) {
    cx += cx < exit.x ? 1 : -1;
    if (maze.cells[cy][cx].type === 'WALL') {
      maze.cells[cy][cx].type = 'EMPTY';
      maze.cells[cy][cx].cost = 1;
    }
  }

  while (cy !== exit.y) {
    cy += cy < exit.y ? 1 : -1;
    if (maze.cells[cy][cx].type === 'WALL') {
      maze.cells[cy][cx].type = 'EMPTY';
      maze.cells[cy][cx].cost = 1;
    }
  }

  maze.cells[exit.y][exit.x].type = 'EXIT';
  maze.cells[exit.y][exit.x].cost = 1;
}
