import { describe, expect, it } from 'vitest';
import { createEmptyBoard, dropDisc } from '../game/board';
import { applyMove, createInitialGameState } from '../game/gameRules';
import { checkWin, checkWinAfterMove, checkWinForPlayer } from '../game/winDetection';

describe('Win and Draw Detection', () => {
  it('detects a horizontal 4-in-a-row win', () => {
    let board = createEmptyBoard();
    // Drop 4 discs for Player 1 along bottom row (row 5, cols 0..3)
    for (let c = 0; c < 4; c++) {
      board[5][c] = 1;
    }
    const win = checkWin(board);
    expect(win).not.toBeNull();
    expect(win?.winner).toBe(1);
    expect(win?.direction).toBe('horizontal');
    expect(win?.winningCells.length).toBe(4);
    expect(checkWinForPlayer(board, 1)).toBe(true);
    expect(checkWinForPlayer(board, 2)).toBe(false);
  });

  it('detects a vertical 4-in-a-row win', () => {
    let board = createEmptyBoard();
    // Drop 4 discs for Player 2 in col 2 (rows 5, 4, 3, 2)
    for (let r = 5; r >= 2; r--) {
      board[r][2] = 2;
    }
    const win = checkWin(board);
    expect(win).not.toBeNull();
    expect(win?.winner).toBe(2);
    expect(win?.direction).toBe('vertical');
    expect(checkWinForPlayer(board, 2)).toBe(true);
  });

  it('detects a diagonal-down (\\) win', () => {
    let board = createEmptyBoard();
    // Coords: (2, 0), (3, 1), (4, 2), (5, 3)
    board[2][0] = 1;
    board[3][1] = 1;
    board[4][2] = 1;
    board[5][3] = 1;

    const win = checkWin(board);
    expect(win).not.toBeNull();
    expect(win?.winner).toBe(1);
    expect(win?.direction).toBe('diagonal-down');
  });

  it('detects a diagonal-up (/) win', () => {
    let board = createEmptyBoard();
    // Coords: (5, 0), (4, 1), (3, 2), (2, 3)
    board[5][0] = 2;
    board[4][1] = 2;
    board[3][2] = 2;
    board[2][3] = 2;

    const win = checkWin(board);
    expect(win).not.toBeNull();
    expect(win?.winner).toBe(2);
    expect(win?.direction).toBe('diagonal-up');
  });

  it('ends game in draw when board is full without a winner', () => {
    // Fill board with known draw pattern
    let state = createInitialGameState(1);
    // Draw pattern for Connect Four (e.g. alternating columns with shifted pairs)
    const pattern = [
      [1, 1, 1, 2, 1, 1, 1],
      [2, 2, 2, 1, 2, 2, 2],
      [1, 1, 1, 2, 1, 1, 1],
      [2, 2, 2, 1, 2, 2, 2],
      [1, 1, 1, 2, 1, 1, 1],
      [2, 2, 2, 1, 2, 2, 2],
    ];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        state.board[r][c] = pattern[r][c] as any;
      }
    }
    const win = checkWin(state.board);
    expect(win).toBeNull();
  });
});
