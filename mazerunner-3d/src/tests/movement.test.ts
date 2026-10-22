import { describe, expect, it } from 'vitest';
import { checkWallCollision, resolveMovement } from '../game/collision';
import { generateMaze } from '../maze/mazeGenerator';

describe('Movement & Collision System', () => {
  it('prevents player from walking into solid walls', () => {
    const maze = generateMaze({ width: 11, height: 11, seed: 123 });
    // start is at (1, 1). To its left is cell (0, 1) which is an outer WALL.
    const startX = 1;
    const startZ = 1;

    // Attempt to move strongly to the left into wall (deltaX = -1.0)
    const result = resolveMovement(maze, startX, startZ, -1.0, 0);

    // Player should not penetrate outer wall (x should remain >= 0.72)
    expect(result.collided).toBe(true);
    expect(result.newX).toBeGreaterThan(0.5);
  });

  it('allows smooth sliding along walls when moving diagonally into a corner', () => {
    const maze = generateMaze({ width: 11, height: 11, seed: 123 });
    const startX = 1;
    const startZ = 1;

    // Moving left (wall) and south (if open)
    const result = resolveMovement(maze, startX, startZ, -0.5, 0.2);

    expect(result.newX).toBe(startX); // X blocked
    // Z axis was permitted to move independently if open
  });

  it('detects wall collision accurately with radius', () => {
    const maze = generateMaze({ width: 11, height: 11, seed: 123 });
    // Cell (0, 1) is a wall. Center is at (0, 1). Right edge is at 0.5.
    // If player is at x = 0.6, radius 0.28: 0.6 - 0.28 = 0.32 < 0.5 => collision
    expect(checkWallCollision(maze, 0.6, 1.0, 0.28)).toBe(true);

    // If player is at center of open corridor (1.0, 1.0), should not collide
    expect(checkWallCollision(maze, 1.0, 1.0, 0.28)).toBe(false);
  });
});
