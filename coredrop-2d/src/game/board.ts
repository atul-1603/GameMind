import { BoardState, CellValue, COLS, PlayerId, ROWS } from './gameTypes';

/**
 * Creates a clean 6x7 Connect Four board filled with 0 (empty).
 * Row 0 is the top row, Row 5 is the floor (lowest row).
 */
export function createEmptyBoard(): BoardState {
  const board: BoardState = [];
  for (let r = 0; r < ROWS; r++) {
    board.push(new Array<CellValue>(COLS).fill(0));
  }
  return board;
}

/**
 * Deep clones the board matrix.
 */
export function cloneBoard(board: BoardState): BoardState {
  return board.map((row) => [...row]);
}

/**
 * Finds the lowest available row index in the given column.
 * Returns -1 if the column is completely full.
 */
export function getLowestEmptyRow(board: BoardState, col: number): number {
  if (col < 0 || col >= COLS) return -1;
  // Scan from the bottom row up to the top
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      return r;
    }
  }
  return -1;
}

/**
 * Checks whether a disc can be dropped into the given column.
 */
export function isValidMove(board: BoardState, col: number): boolean {
  if (col < 0 || col >= COLS) return false;
  return board[0][col] === 0;
}

/**
 * Returns an array of column indices [0..6] that can accept a disc.
 */
export function getValidMoves(board: BoardState): number[] {
  const valid: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) {
      valid.push(c);
    }
  }
  return valid;
}

/**
 * Returns true if all 42 cells are occupied.
 */
export function isBoardFull(board: BoardState): boolean {
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) return false;
  }
  return true;
}

/**
 * Pure function: drops a disc in the specified column and returns a new board state.
 * Throws an error if the column is full or invalid.
 */
export function dropDisc(
  board: BoardState,
  col: number,
  player: PlayerId
): { newBoard: BoardState; row: number } {
  const row = getLowestEmptyRow(board, col);
  if (row === -1) {
    throw new Error(`Column ${col} is already full or invalid.`);
  }
  const newBoard = cloneBoard(board);
  newBoard[row][col] = player;
  return { newBoard, row };
}

/**
 * Fast string serialization for transposition table caching.
 */
export function serializeBoard(board: BoardState): string {
  let s = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      s += board[r][c];
    }
  }
  return s;
}
