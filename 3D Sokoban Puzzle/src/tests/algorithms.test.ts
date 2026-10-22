import { describe, expect, it } from 'vitest';
import { solveAStar } from '../algorithms/astar';
import { solveBFS } from '../algorithms/bfs';
import { solveDFS } from '../algorithms/dfs';
import { solveGreedyBestFirst } from '../algorithms/greedyBestFirst';
import { encodeState } from '../algorithms/state';
import { GameState } from '../game/gameState';
import { isCornerDeadlock } from '../game/deadlock';
import { parseLevel } from '../game/levelData';
import { LevelDefinition } from '../types/game';

describe('Search Algorithms & DAA Requirements', () => {
  const smallPuzzle: LevelDefinition = parseLevel({
    id: 101,
    name: 'Small Puzzle',
    difficulty: 'Beginner',
    description: 'A simple solvable test puzzle',
    grid: [
      '#######',
      '#     #',
      '# @$  #',
      '#  .  #',
      '#######',
    ],
  });

  it('generates stable state keys regardless of crate permutation', () => {
    const p = { r: 1, c: 1 };
    const crates1 = [{ r: 2, c: 2 }, { r: 1, c: 2 }];
    const crates2 = [{ r: 1, c: 2 }, { r: 2, c: 2 }];

    const key1 = encodeState(p, crates1);
    const key2 = encodeState(p, crates2);
    expect(key1).toEqual(key2);
  });

  it('detects corner deadlocks accurately', () => {
    const walls = new Set(['0,0', '0,1', '0,2', '1,0', '2,0']);
    const targets = new Set(['1,2']);

    // Tile (1, 1) has walls at UP (0,1) and LEFT (1,0) -> Corner deadlock!
    expect(isCornerDeadlock(1, 1, walls, targets)).toBe(true);

    // Tile (1, 2) is a target -> NOT a deadlock even if in a corner
    expect(isCornerDeadlock(1, 2, walls, targets)).toBe(false);
  });

  it('BFS finds the shortest solution on small puzzle', () => {
    const result = solveBFS(smallPuzzle);
    expect(result.status).toBe('SOLVED');
    expect(result.isOptimal).toBe(true);
    expect(result.solutionLength).toBeGreaterThan(0);
    expect(result.actions.length).toBe(result.solutionLength);

    // Replay actions through GameState to guarantee 100% legal execution
    const game = new GameState(smallPuzzle);
    for (const action of result.actions) {
      const moveRes = game.tryMove(action.direction);
      expect(moveRes.success).toBe(true);
    }
    expect(game.isWon()).toBe(true);
  });

  it('A* finds an optimal solution matching BFS on small puzzle', () => {
    const bfsRes = solveBFS(smallPuzzle);
    const astarRes = solveAStar(smallPuzzle);

    expect(astarRes.status).toBe('SOLVED');
    expect(astarRes.isOptimal).toBe(true);
    expect(astarRes.solutionLength).toBe(bfsRes.solutionLength);

    // Replay actions through GameState
    const game = new GameState(smallPuzzle);
    for (const action of astarRes.actions) {
      const moveRes = game.tryMove(action.direction);
      expect(moveRes.success).toBe(true);
    }
    expect(game.isWon()).toBe(true);
  });

  it('Greedy Best-First finds a valid solution', () => {
    const greedyRes = solveGreedyBestFirst(smallPuzzle);
    expect(greedyRes.status).toBe('SOLVED');
    expect(greedyRes.solutionLength).toBeGreaterThan(0);

    const game = new GameState(smallPuzzle);
    for (const action of greedyRes.actions) {
      const moveRes = game.tryMove(action.direction);
      expect(moveRes.success).toBe(true);
    }
    expect(game.isWon()).toBe(true);
  });

  it('DFS finds a valid solution when within search limit', () => {
    const dfsRes = solveDFS(smallPuzzle, undefined, undefined, { maxNodes: 10000 });
    expect(dfsRes.status).toBe('SOLVED');
    expect(dfsRes.solutionLength).toBeGreaterThan(0);

    const game = new GameState(smallPuzzle);
    for (const action of dfsRes.actions) {
      const moveRes = game.tryMove(action.direction);
      expect(moveRes.success).toBe(true);
    }
    expect(game.isWon()).toBe(true);
  });
});
