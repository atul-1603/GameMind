import { describe, expect, it } from 'vitest';
import { LEVEL_DEFINITIONS } from '../maze/levelDefinitions';
import { generateMaze } from '../maze/mazeGenerator';
import { validateMazeSolvability } from '../maze/mazeValidation';

describe('Maze Generator & Validation', () => {
  it('generates reproducible mazes with the same seed', () => {
    const seed = 987654;
    const maze1 = generateMaze({ width: 15, height: 15, seed });
    const maze2 = generateMaze({ width: 15, height: 15, seed });

    expect(maze1.width).toBe(maze2.width);
    expect(maze1.height).toBe(maze2.height);
    expect(maze1.start).toEqual(maze2.start);
    expect(maze1.exit).toEqual(maze2.exit);

    for (let y = 0; y < maze1.height; y++) {
      for (let x = 0; x < maze1.width; x++) {
        expect(maze1.cells[y][x].type).toBe(maze2.cells[y][x].type);
        expect(maze1.cells[y][x].cost).toBe(maze2.cells[y][x].cost);
      }
    }
  });

  it('generates different layouts with different seeds', () => {
    const mazeA = generateMaze({ width: 15, height: 15, seed: 111 });
    const mazeB = generateMaze({ width: 15, height: 15, seed: 222 });

    let diffCount = 0;
    for (let y = 0; y < mazeA.height; y++) {
      for (let x = 0; x < mazeA.width; x++) {
        if (mazeA.cells[y][x].type !== mazeB.cells[y][x].type) {
          diffCount++;
        }
      }
    }
    expect(diffCount).toBeGreaterThan(5);
  });

  it('guarantees outer boundaries are solid walls', () => {
    const maze = generateMaze({ width: 17, height: 17, seed: 555 });
    for (let x = 0; x < maze.width; x++) {
      expect(maze.cells[0][x].type).toBe('WALL');
      expect(maze.cells[maze.height - 1][x].type).toBe('WALL');
    }
    for (let y = 0; y < maze.height; y++) {
      expect(maze.cells[y][0].type).toBe('WALL');
      expect(maze.cells[y][maze.width - 1].type).toBe('WALL');
    }
  });

  it('ensures start and exit are always walkable and not walls', () => {
    const maze = generateMaze({ width: 21, height: 21, seed: 777 });
    expect(maze.cells[maze.start.y][maze.start.x].type).not.toBe('WALL');
    expect(maze.cells[maze.exit.y][maze.exit.x].type).not.toBe('WALL');
  });

  it('passes automated solvability test on all 5 predefined levels', () => {
    for (const level of LEVEL_DEFINITIONS) {
      const maze = generateMaze({
        width: level.width,
        height: level.height,
        seed: 42 + level.id,
        loopProbability: level.loopProbability,
        hasWeightedTerrain: level.hasWeightedTerrain,
        orbCount: level.orbCount,
      });

      const validation = validateMazeSolvability(maze);
      expect(validation.isSolvable).toBe(true);
      expect(validation.startValid).toBe(true);
      expect(validation.exitValid).toBe(true);
      expect(validation.boundariesIntact).toBe(true);
      expect(validation.shortestPathLength).toBeGreaterThan(0);
      expect(validation.errors).toEqual([]);
    }
  });
});
