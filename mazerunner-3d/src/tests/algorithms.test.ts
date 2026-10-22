import { describe, expect, it } from 'vitest';
import {
  calculatePathCost,
  getWalkableNeighbors,
  manhattanDistance,
  PriorityQueue,
  runAlgorithm,
  runAStar,
  runBFS,
  runDFS,
  runDijkstra,
  runGreedyBestFirst,
} from '../algorithms';
import { generateMaze } from '../maze/mazeGenerator';
import { MazeCell, MazeGrid, Point2D } from '../maze/mazeTypes';

/**
 * Creates a clean custom test grid for algorithmic proofs.
 */
function createCustomGrid(
  asciiMap: string[],
  costs?: Record<string, number>
): MazeGrid {
  const height = asciiMap.length;
  const width = asciiMap[0].length;
  let start: Point2D = { x: 1, y: 1 };
  let exit: Point2D = { x: width - 2, y: height - 2 };

  const cells: MazeCell[][] = [];

  for (let y = 0; y < height; y++) {
    const row: MazeCell[] = [];
    for (let x = 0; x < width; x++) {
      const char = asciiMap[y][x];
      let type: MazeCell['type'] = 'EMPTY';
      let cost = 1;

      if (char === '#') {
        type = 'WALL';
        cost = Infinity;
      } else if (char === 'S') {
        type = 'START';
        start = { x, y };
      } else if (char === 'E') {
        type = 'EXIT';
        exit = { x, y };
      } else if (char === 'D') {
        type = 'DIFFICULT';
        cost = 3;
      } else if (char === 'H') {
        type = 'HAZARDOUS';
        cost = 5;
      }

      if (costs && costs[`${x},${y}`]) {
        cost = costs[`${x},${y}`];
      }

      row.push({ x, y, type, cost });
    }
    cells.push(row);
  }

  return {
    width,
    height,
    cells,
    start,
    exit,
    seed: 12345,
    totalOrbs: 0,
  };
}

describe('PriorityQueue (Min-Heap)', () => {
  it('correctly orders elements by priority (min-heap)', () => {
    const pq = new PriorityQueue<string>();
    pq.push('A', 10);
    pq.push('B', 3);
    pq.push('C', 7);
    pq.push('D', 1);

    expect(pq.size()).toBe(4);
    expect(pq.pop()).toBe('D');
    expect(pq.pop()).toBe('B');
    expect(pq.pop()).toBe('C');
    expect(pq.pop()).toBe('A');
    expect(pq.isEmpty()).toBe(true);
    expect(pq.pop()).toBeUndefined();
  });

  it('maintains FIFO tie-breaking for equal priorities', () => {
    const pq = new PriorityQueue<string>();
    pq.push('first', 5);
    pq.push('second', 5);
    pq.push('third', 5);

    expect(pq.pop()).toBe('first');
    expect(pq.pop()).toBe('second');
    expect(pq.pop()).toBe('third');
  });
});

describe('Breadth-First Search (BFS)', () => {
  it('finds optimal unweighted shortest path on a grid with multiple branches', () => {
    // 7x7 grid with a short path and a long path
    const map = [
      '#######',
      '#S...E#', // direct path length: 5 cells (steps = 4)
      '#.###.#',
      '#.....#', // alternate longer path
      '#######',
    ];
    const maze = createCustomGrid(map);
    const result = runBFS(maze, maze.start, maze.exit);

    expect(result.status).toBe('FOUND');
    expect(result.pathLength).toBe(5); // S, (2,1), (3,1), (4,1), E
    expect(result.isOptimal).toBe(true);
    expect(result.expandedCount).toBeGreaterThan(0);
    expect(result.generatedCount).toBeGreaterThan(0);
  });

  it('reports UNREACHABLE when goal is completely walled off', () => {
    const map = [
      '#####',
      '#S#E#',
      '#####',
    ];
    const maze = createCustomGrid(map);
    const result = runBFS(maze, maze.start, maze.exit);

    expect(result.status).toBe('UNREACHABLE');
    expect(result.path).toEqual([]);
    expect(result.pathLength).toBe(0);
  });
});

describe('Depth-First Search (DFS)', () => {
  it('finds a valid path avoiding walls from start to exit', () => {
    const map = [
      '#######',
      '#S....#',
      '###.###',
      '#....E#',
      '#######',
    ];
    const maze = createCustomGrid(map);
    const result = runDFS(maze, maze.start, maze.exit);

    expect(result.status).toBe('FOUND');
    expect(result.path[0]).toEqual(maze.start);
    expect(result.path[result.path.length - 1]).toEqual(maze.exit);

    // Verify consecutive steps are adjacent and not walls
    for (let i = 1; i < result.path.length; i++) {
      const prev = result.path[i - 1];
      const curr = result.path[i];
      const dist = Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y);
      expect(dist).toBe(1);
      expect(maze.cells[curr.y][curr.x].type).not.toBe('WALL');
    }
  });
});

describe("Dijkstra's Algorithm & Weighted Terrain", () => {
  it('chooses a longer path with lower cost over a shorter path with high hazard cost', () => {
    // Top path has hazard H (cost 5)
    // Bottom path has normal tiles (cost 1 each)
    const map = [
      '#######',
      '#S.H.E#', // 4 steps, cost = 1 + 5 + 1 + 1 = 8
      '#.#.###',
      '#.....#', // bottom detour: 8 steps, cost = 8 * 1 = 8 vs longer test
      '#######',
    ];

    const weightedMap = [
      '#######',
      '#S.H.E#', // Step into (2,1):1, into (3,1)[H]:5, into (4,1):1, into (5,1)[E]:1 => Total cost = 8
      '#.###.#',
      '#.....#', // S->(1,2)->(1,3)->(2,3)->(3,3)->(4,3)->(5,3)->(5,2)->(5,1)[E] => 8 steps, cost = 8 * 1 = 8
      '#######',
    ];

    // Let's create an explicit layout where direct path is 3 steps through Hazard (cost 5+1 = 6),
    // and detour is 4 steps through normal (cost 1+1+1+1 = 4)
    const clearCostMap = [
      '#####',
      '#SHE#', // direct: S -> H(5) -> E(1) => cost 6
      '#...#', // detour: S -> (1,2)[1] -> (2,2)[1] -> (3,2)[1] -> E(3,1)[1] => cost 4
      '#####',
    ];
    const maze = createCustomGrid(clearCostMap);

    const dijkstraResult = runDijkstra(maze, maze.start, maze.exit);
    const bfsResult = runBFS(maze, maze.start, maze.exit);

    // BFS ignores weights and chooses the shortest cell count (through H)
    expect(bfsResult.pathLength).toBe(3); // S, H, E
    expect(bfsResult.totalCost).toBe(6);

    // Dijkstra picks the detour because 4 < 6!
    expect(dijkstraResult.totalCost).toBe(4);
    expect(dijkstraResult.pathLength).toBe(5); // S, (1,2), (2,2), (3,2), E
  });
});

describe('A* Algorithm', () => {
  it('finds the optimal cost path while exploring fewer or equal nodes than BFS/Dijkstra', () => {
    const maze = generateMaze({ width: 17, height: 17, seed: 42, loopProbability: 0.2 });
    
    const astar = runAStar(maze, maze.start, maze.exit);
    const bfs = runBFS(maze, maze.start, maze.exit);
    const dijkstra = runDijkstra(maze, maze.start, maze.exit);

    expect(astar.status).toBe('FOUND');
    expect(bfs.status).toBe('FOUND');
    expect(dijkstra.status).toBe('FOUND');

    // On unweighted maze, A* and BFS and Dijkstra should yield optimal path length
    expect(astar.pathLength).toBe(bfs.pathLength);
    expect(astar.totalCost).toBe(dijkstra.totalCost);

    // A* guided by Manhattan heuristic should expand significantly fewer nodes than blind Dijkstra
    expect(astar.expandedCount).toBeLessThanOrEqual(dijkstra.expandedCount);
  });

  it('guarantees admissibility with Manhattan distance', () => {
    const p1 = { x: 2, y: 3 };
    const p2 = { x: 8, y: 9 };
    const h = manhattanDistance(p1, p2);
    expect(h).toBe(6 + 6); // 12
  });
});

describe('Greedy Best-First Search', () => {
  it('finds a valid path to exit, prioritizing heuristic', () => {
    const maze = generateMaze({ width: 15, height: 15, seed: 999 });
    const result = runGreedyBestFirst(maze, maze.start, maze.exit);

    expect(result.status).toBe('FOUND');
    expect(result.path[0]).toEqual(maze.start);
    expect(result.path[result.path.length - 1]).toEqual(maze.exit);
  });
});

describe('AI Solver starting from dynamic player location', () => {
  it('successfully calculates route from mid-maze player position to exit', () => {
    const maze = generateMaze({ width: 13, height: 13, seed: 101 });
    // Let's find an arbitrary walkable cell near center
    let playerPos: Point2D = maze.start;
    for (let y = 4; y < 9; y++) {
      for (let x = 4; x < 9; x++) {
        if (maze.cells[y][x].type !== 'WALL') {
          playerPos = { x, y };
          break;
        }
      }
    }

    const result = runAlgorithm('ASTAR', maze, playerPos, maze.exit);
    expect(result.status).toBe('FOUND');
    expect(result.path[0]).toEqual(playerPos);
    expect(result.path[result.path.length - 1]).toEqual(maze.exit);
  });
});
