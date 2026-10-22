import { describe, expect, it } from 'vitest';
import { solveAStar } from '../algorithms/astar';
import { GameState } from '../game/gameState';
import { LEVELS } from '../game/levelData';

describe('Level Integrity & Solvability', () => {
  it('all levels have matching crates and targets counts', () => {
    for (const lvl of LEVELS) {
      expect(lvl.crates.length).toBeGreaterThan(0);
      expect(lvl.targets.length).toBeGreaterThan(0);
      expect(lvl.crates.length).toBe(lvl.targets.length);
    }
  });

  it('no level starts in an invalid overlapping position', () => {
    for (const lvl of LEVELS) {
      const wallKeys = new Set(lvl.walls.map(w => `${w.r},${w.c}`));
      const playerKey = `${lvl.playerStart.r},${lvl.playerStart.c}`;

      // Player must not start in a wall
      expect(wallKeys.has(playerKey)).toBe(false);

      // Crates must not start in walls
      for (const crate of lvl.crates) {
        const crateKey = `${crate.r},${crate.c}`;
        expect(wallKeys.has(crateKey)).toBe(false);
        // Player must not start on a crate
        expect(playerKey).not.toBe(crateKey);
      }
    }
  });

  // Test solvability for levels using A*
  LEVELS.forEach((lvl) => {
    it(`Level ${lvl.id}: "${lvl.name}" has a verified solvable solution`, () => {
      const result = solveAStar(lvl, undefined, undefined, { timeLimitMs: 5000 });
      expect(result.status).toBe('SOLVED');
      expect(result.actions.length).toBeGreaterThan(0);

      // Verify that executing actions leads to victory
      const game = new GameState(lvl);
      for (const action of result.actions) {
        const stepRes = game.tryMove(action.direction);
        expect(stepRes.success).toBe(true);
      }
      expect(game.isWon()).toBe(true);
    });
  });
});
