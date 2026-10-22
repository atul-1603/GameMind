import { describe, expect, it } from 'vitest';
import {
  createEmptyBoard,
  dropDisc,
  getLowestEmptyRow,
  isBoardFull,
  isValidMove,
} from '../game/board';
import { applyMove, createInitialGameState, undoLastMove } from '../game/gameRules';
import { COLS, ROWS } from '../game/gameTypes';

describe('Game Rules and Board Mechanics', () => {
  it('creates an empty 6x7 board with all cells initialized to 0', () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(ROWS);
    expect(board[0].length).toBe(COLS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        expect(board[r][c]).toBe(0);
      }
    }
  });

  it('correctly calculates lowest empty row with gravity', () => {
    const board = createEmptyBoard();
    // Empty column 3 has lowest empty row at index 5 (floor)
    expect(getLowestEmptyRow(board, 3)).toBe(5);

    board[5][3] = 1;
    expect(getLowestEmptyRow(board, 3)).toBe(4);

    board[4][3] = 2;
    expect(getLowestEmptyRow(board, 3)).toBe(3);
  });

  it('drops disc into the lowest available row', () => {
    const board = createEmptyBoard();
    const { newBoard, row } = dropDisc(board, 0, 1);
    expect(row).toBe(5);
    expect(newBoard[5][0]).toBe(1);
    expect(board[5][0]).toBe(0); // Immutability preserved
  });

  it('rejects moves in full columns', () => {
    let board = createEmptyBoard();
    for (let i = 0; i < ROWS; i++) {
      expect(isValidMove(board, 2)).toBe(true);
      const res = dropDisc(board, 2, 1);
      board = res.newBoard;
    }
    expect(isValidMove(board, 2)).toBe(false);
    expect(getLowestEmptyRow(board, 2)).toBe(-1);
    expect(() => dropDisc(board, 2, 2)).toThrow();
  });

  it('alternates players on successive legal moves in game engine', () => {
    let state = createInitialGameState(1);
    expect(state.currentPlayer).toBe(1);

    state = applyMove(state, 3);
    expect(state.currentPlayer).toBe(2);
    expect(state.moveCount).toBe(1);

    state = applyMove(state, 3);
    expect(state.currentPlayer).toBe(1);
    expect(state.moveCount).toBe(2);
  });

  it('supports undoing moves and restoring previous board state', () => {
    let state = createInitialGameState(1);
    state = applyMove(state, 3); // Player 1 drops in col 3, row 5
    state = applyMove(state, 3); // Player 2 drops in col 3, row 4

    expect(state.board[5][3]).toBe(1);
    expect(state.board[4][3]).toBe(2);
    expect(state.currentPlayer).toBe(1);

    state = undoLastMove(state);
    expect(state.currentPlayer).toBe(2);
    expect(state.board[4][3]).toBe(0);
    expect(state.board[5][3]).toBe(1);

    state = undoLastMove(state);
    expect(state.currentPlayer).toBe(1);
    expect(state.board[5][3]).toBe(0);
  });
});
