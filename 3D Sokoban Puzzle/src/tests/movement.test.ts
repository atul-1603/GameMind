import { describe, expect, it } from 'vitest';
import { GameState } from '../game/gameState';
import { LevelDefinition } from '../types/game';

describe('Movement & Game Mechanics', () => {
  const testLevel: LevelDefinition = {
    id: 99,
    name: 'Test Level',
    difficulty: 'Beginner',
    width: 5,
    height: 5,
    walls: [
      { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
      { r: 4, c: 0 }, { r: 4, c: 1 }, { r: 4, c: 2 }, { r: 4, c: 3 }, { r: 4, c: 4 },
      { r: 1, c: 0 }, { r: 2, c: 0 }, { r: 3, c: 0 },
      { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 },
    ],
    targets: [{ r: 2, c: 3 }],
    crates: [{ r: 2, c: 2 }],
    playerStart: { r: 2, c: 1 },
    description: 'Unit test level',
  };

  it('allows legal movement into empty floor tiles', () => {
    const game = new GameState(testLevel);
    expect(game.player).toEqual({ r: 2, c: 1 });

    // Move UP into empty space
    const res = game.tryMove('UP');
    expect(res.success).toBe(true);
    expect(res.isPush).toBe(false);
    expect(game.player).toEqual({ r: 1, c: 1 });
    expect(game.moveCount).toBe(1);
  });

  it('blocks movement into walls', () => {
    const game = new GameState(testLevel);
    // Move LEFT directly into the outer wall (r: 2, c: 0)
    const res = game.tryMove('LEFT');
    expect(res.success).toBe(false);
    expect(game.player).toEqual({ r: 2, c: 1 });
    expect(game.moveCount).toBe(0);
  });

  it('allows pushing a crate into empty space or target', () => {
    const game = new GameState(testLevel);
    // Push crate at (2, 2) to the RIGHT onto target (2, 3)
    const res = game.tryMove('RIGHT');
    expect(res.success).toBe(true);
    expect(res.isPush).toBe(true);
    expect(game.player).toEqual({ r: 2, c: 2 });
    expect(game.crates[0]).toEqual({ r: 2, c: 3 });
    expect(game.moveCount).toBe(1);
    expect(game.pushCount).toBe(1);
  });

  it('blocks pushing a crate into a wall', () => {
    const game = new GameState(testLevel);
    // Crate is pushed to (2, 3)
    game.tryMove('RIGHT');
    // Now attempting to push crate from (2, 3) into wall (2, 4)
    const res = game.tryMove('RIGHT');
    expect(res.success).toBe(false);
    expect(game.player).toEqual({ r: 2, c: 2 });
    expect(game.crates[0]).toEqual({ r: 2, c: 3 });
  });

  it('detects win condition when all crates are on targets', () => {
    const game = new GameState(testLevel);
    expect(game.isWon()).toBe(false);
    game.tryMove('RIGHT'); // crate placed on (2, 3)
    expect(game.isWon()).toBe(true);
  });

  it('supports undoing moves and resets game state accurately', () => {
    const game = new GameState(testLevel);
    game.tryMove('RIGHT');
    expect(game.player).toEqual({ r: 2, c: 2 });
    expect(game.crates[0]).toEqual({ r: 2, c: 3 });
    expect(game.moveCount).toBe(1);
    expect(game.pushCount).toBe(1);

    const undid = game.undo();
    expect(undid).toBe(true);
    expect(game.player).toEqual({ r: 2, c: 1 });
    expect(game.crates[0]).toEqual({ r: 2, c: 2 });
    expect(game.moveCount).toBe(0);
    expect(game.pushCount).toBe(0);

    // Reset test
    game.tryMove('UP');
    game.tryMove('RIGHT');
    game.reset();
    expect(game.player).toEqual({ r: 2, c: 1 });
    expect(game.crates[0]).toEqual({ r: 2, c: 2 });
    expect(game.moveCount).toBe(0);
  });
});
