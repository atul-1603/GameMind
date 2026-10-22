import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from '../game/board';
import { runMinimax } from '../algorithms/minimax';
import { runAlphaBeta } from '../algorithms/alphaBeta';
import { WIN_SCORE } from '../algorithms/evaluation';

describe('Alpha-Beta Pruning Algorithm', () => {
  it('returns the exact same optimal score and move as Minimax under identical conditions', () => {
    const board = createEmptyBoard();
    // Setup a mid-game tactical position
    board[5][3] = 1;
    board[5][2] = 2;
    board[4][3] = 1;
    board[5][4] = 2;

    const depth = 3;
    const minimaxRes = runMinimax(board, 1, { depth, useMoveOrdering: false });
    const alphaBetaRes = runAlphaBeta(board, 1, { depth, useMoveOrdering: false, useTransposition: false });

    expect(alphaBetaRes.bestMove).toBe(minimaxRes.bestMove);
    expect(alphaBetaRes.score).toBe(minimaxRes.score);
  });

  it('visits fewer nodes than Minimax due to pruning', () => {
    const board = createEmptyBoard();
    board[5][3] = 1;
    board[5][2] = 2;
    board[4][3] = 1;
    board[5][4] = 2;

    const depth = 3;
    const minimaxRes = runMinimax(board, 1, { depth, useMoveOrdering: false });
    const alphaBetaRes = runAlphaBeta(board, 1, { depth, useMoveOrdering: false, useTransposition: false });

    expect(alphaBetaRes.stats.nodesVisited).toBeLessThan(minimaxRes.stats.nodesVisited);
    expect(alphaBetaRes.stats.prunedBranches).toBeGreaterThan(0);
  });

  it('move ordering dramatically enhances pruning efficiency in Alpha-Beta', () => {
    const board = createEmptyBoard();
    board[5][3] = 1;
    board[5][2] = 2;

    const depth = 4;
    const withoutOrdering = runAlphaBeta(board, 1, { depth, useMoveOrdering: false, useTransposition: false });
    const withOrdering = runAlphaBeta(board, 1, { depth, useMoveOrdering: true, useTransposition: false });

    // With center-first ordering, Alpha-Beta searches high-value moves earlier, cutting more branches!
    expect(withOrdering.stats.nodesVisited).toBeLessThanOrEqual(withoutOrdering.stats.nodesVisited);
    // Both must yield the same optimal score
    expect(withOrdering.score).toBe(withoutOrdering.score);
  });

  it('detects immediate winning move and immediate block with Alpha-Beta', () => {
    const board = createEmptyBoard();
    board[5][0] = 1;
    board[5][1] = 1;
    board[5][2] = 1;

    const winRes = runAlphaBeta(board, 1, { depth: 2, useMoveOrdering: true });
    expect(winRes.bestMove).toBe(3);
    expect(winRes.score).toBeGreaterThanOrEqual(WIN_SCORE);

    // Opponent threat
    const board2 = createEmptyBoard();
    board2[5][0] = 2;
    board2[5][1] = 2;
    board2[5][2] = 2;

    const blockRes = runAlphaBeta(board2, 1, { depth: 2, useMoveOrdering: true });
    expect(blockRes.bestMove).toBe(3);
  });
});
