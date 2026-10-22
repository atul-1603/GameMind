import { describe, expect, it } from 'vitest';
import { createEmptyBoard } from '../game/board';
import {
  evaluateBoard,
  explainMove,
  WIN_SCORE,
} from '../algorithms/evaluation';

describe('Heuristic Evaluation and Move Explanation', () => {
  it('returns 0 for a blank symmetrical empty board', () => {
    const board = createEmptyBoard();
    const scoreP1 = evaluateBoard(board, 1);
    const scoreP2 = evaluateBoard(board, 2);
    expect(scoreP1).toBe(0);
    expect(scoreP2).toBe(0);
  });

  it('rewards center column control', () => {
    const board = createEmptyBoard();
    board[5][3] = 1; // Center column disc for Player 1
    const p1Score = evaluateBoard(board, 1);
    const p2Score = evaluateBoard(board, 2);
    expect(p1Score).toBeGreaterThan(0);
    expect(p2Score).toBeLessThan(0);
  });

  it('dominates with terminal win over any heuristic partial count', () => {
    const board = createEmptyBoard();
    // 4 in a row for Player 1
    board[5][0] = 1;
    board[5][1] = 1;
    board[5][2] = 1;
    board[5][3] = 1;

    const score = evaluateBoard(board, 1);
    expect(score).toBe(WIN_SCORE);
  });

  it('generates accurate empirical move explanations', () => {
    const board = createEmptyBoard();
    board[5][0] = 1;
    board[5][1] = 1;
    board[5][2] = 1;

    // Col 3 completes win
    const expWin = explainMove(board, 3, 1);
    expect(expWin).toContain('Winning move');

    // Col 3 blocks opponent win
    const boardOpp = createEmptyBoard();
    boardOpp[5][0] = 2;
    boardOpp[5][1] = 2;
    boardOpp[5][2] = 2;
    const expBlock = explainMove(boardOpp, 3, 1);
    expect(expBlock).toContain('Defensive move');
    expect(expBlock).toContain('blocks');
  });
});
