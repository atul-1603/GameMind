import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from '../game/board';
import { runMinimax } from '../algorithms/minimax';
import { WIN_SCORE } from '../algorithms/evaluation';

describe('Minimax Search Algorithm', () => {
  it('seizes an immediate winning move at depth 1', () => {
    const board = createEmptyBoard();
    // AI (Player 1) has 3 in a row horizontally at row 5: cols 0, 1, 2
    board[5][0] = 1;
    board[5][1] = 1;
    board[5][2] = 1;

    // Col 3 should complete the 4-in-a-row win
    const result = runMinimax(board, 1, { depth: 1, useMoveOrdering: false });
    expect(result.bestMove).toBe(3);
    expect(result.score).toBeGreaterThanOrEqual(WIN_SCORE);
  });

  it('blocks an immediate opponent winning threat at depth 2', () => {
    const board = createEmptyBoard();
    // Opponent (Player 2) has 3 in a row horizontally at row 5: cols 0, 1, 2
    // If AI does not play col 3, Player 2 will win on their next turn!
    board[5][0] = 2;
    board[5][1] = 2;
    board[5][2] = 2;

    const result = runMinimax(board, 1, { depth: 2, useMoveOrdering: false });
    expect(result.bestMove).toBe(3);
  });

  it('blocks an opponent vertical winning stack', () => {
    const board = createEmptyBoard();
    // Opponent (Player 2) stacked 3 in column 4: rows 5, 4, 3
    board[5][4] = 2;
    board[4][4] = 2;
    board[3][4] = 2;

    // AI (Player 1) must place in column 4 (row 2) to block vertical win
    const result = runMinimax(board, 1, { depth: 2, useMoveOrdering: false });
    expect(result.bestMove).toBe(4);
  });

  it('never modifies caller board state during recursive search', () => {
    const board = createEmptyBoard();
    board[5][3] = 1;
    board[5][2] = 2;

    const originalJson = JSON.stringify(board);
    runMinimax(board, 1, { depth: 3, useMoveOrdering: false });
    expect(JSON.stringify(board)).toBe(originalJson);
  });

  it('records correct search statistics (nodesVisited, depth, executionTime)', () => {
    const board = createEmptyBoard();
    const result = runMinimax(board, 1, { depth: 2, useMoveOrdering: false });
    expect(result.stats.nodesVisited).toBeGreaterThan(0);
    expect(result.stats.depth).toBe(2);
    expect(result.stats.prunedBranches).toBe(0); // Minimax does not prune
    expect(result.stats.moveScores.length).toBe(7);
  });
});
