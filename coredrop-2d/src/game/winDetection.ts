import {
  BoardState,
  COLS,
  Coordinate,
  PlayerId,
  ROWS,
  WIN_LENGTH,
  WinInfo,
} from './gameTypes';

export interface Window4 {
  coords: Coordinate[];
  direction: 'horizontal' | 'vertical' | 'diagonal-up' | 'diagonal-down';
}

/**
 * Pre-generate all 69 possible 4-in-a-row windows on a 6x7 grid:
 * - 24 Horizontal
 * - 21 Vertical
 * - 12 Diagonal Down-Right (\)
 * - 12 Diagonal Up-Right (/)
 */
export const ALL_WINDOWS: Window4[] = (() => {
  const windows: Window4[] = [];

  // 1. Horizontal windows (6 rows * 4 start cols = 24)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - WIN_LENGTH; c++) {
      windows.push({
        direction: 'horizontal',
        coords: [
          { row: r, col: c },
          { row: r, col: c + 1 },
          { row: r, col: c + 2 },
          { row: r, col: c + 3 },
        ],
      });
    }
  }

  // 2. Vertical windows (3 start rows * 7 cols = 21)
  for (let r = 0; r <= ROWS - WIN_LENGTH; r++) {
    for (let c = 0; c < COLS; c++) {
      windows.push({
        direction: 'vertical',
        coords: [
          { row: r, col: c },
          { row: r + 1, col: c },
          { row: r + 2, col: c },
          { row: r + 3, col: c },
        ],
      });
    }
  }

  // 3. Diagonal Down-Right (\) (3 start rows * 4 start cols = 12)
  for (let r = 0; r <= ROWS - WIN_LENGTH; r++) {
    for (let c = 0; c <= COLS - WIN_LENGTH; c++) {
      windows.push({
        direction: 'diagonal-down',
        coords: [
          { row: r, col: c },
          { row: r + 1, col: c + 1 },
          { row: r + 2, col: c + 2 },
          { row: r + 3, col: c + 3 },
        ],
      });
    }
  }

  // 4. Diagonal Up-Right (/) (3 start rows * 4 start cols = 12)
  for (let r = WIN_LENGTH - 1; r < ROWS; r++) {
    for (let c = 0; c <= COLS - WIN_LENGTH; c++) {
      windows.push({
        direction: 'diagonal-up',
        coords: [
          { row: r, col: c },
          { row: r - 1, col: c + 1 },
          { row: r - 2, col: c + 2 },
          { row: r - 3, col: c + 3 },
        ],
      });
    }
  }

  return windows;
})();

/**
 * Checks if any player has connected 4 discs on the entire board.
 * Returns full WinInfo if a win is found, or null otherwise.
 */
export function checkWin(board: BoardState): WinInfo | null {
  for (let i = 0; i < ALL_WINDOWS.length; i++) {
    const win = ALL_WINDOWS[i];
    const c0 = board[win.coords[0].row][win.coords[0].col];
    if (c0 === 0) continue;

    if (
      c0 === board[win.coords[1].row][win.coords[1].col] &&
      c0 === board[win.coords[2].row][win.coords[2].col] &&
      c0 === board[win.coords[3].row][win.coords[3].col]
    ) {
      return {
        winner: c0 as PlayerId,
        winningCells: win.coords,
        direction: win.direction,
      };
    }
  }
  return null;
}

/**
 * Fast boolean check if a specific player has won.
 */
export function checkWinForPlayer(board: BoardState, player: PlayerId): boolean {
  for (let i = 0; i < ALL_WINDOWS.length; i++) {
    const win = ALL_WINDOWS[i];
    if (
      board[win.coords[0].row][win.coords[0].col] === player &&
      board[win.coords[1].row][win.coords[1].col] === player &&
      board[win.coords[2].row][win.coords[2].col] === player &&
      board[win.coords[3].row][win.coords[3].col] === player
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Localized check after placing a disc at (row, col) for player.
 * Checks only horizontal, vertical, and two diagonals through (row, col).
 */
export function checkWinAfterMove(
  board: BoardState,
  row: number,
  col: number,
  player: PlayerId
): WinInfo | null {
  const directions: Array<{
    dr: number;
    dc: number;
    name: 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up';
  }> = [
    { dr: 0, dc: 1, name: 'horizontal' },
    { dr: 1, dc: 0, name: 'vertical' },
    { dr: 1, dc: 1, name: 'diagonal-down' },
    { dr: -1, dc: 1, name: 'diagonal-up' },
  ];

  for (const { dr, dc, name } of directions) {
    const matchedCoords: Coordinate[] = [{ row, col }];

    // Forward direction
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      matchedCoords.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    // Backward direction
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
      matchedCoords.push({ row: r, col: c });
      r -= dr;
      c -= dc;
    }

    if (matchedCoords.length >= 4) {
      // Pick 4 contiguous coordinates that include (row, col)
      // Sort by row then col for deterministic ordering
      matchedCoords.sort((a, b) => (a.row === b.row ? a.col - b.col : a.row - b.row));
      return {
        winner: player,
        winningCells: matchedCoords.slice(0, 4),
        direction: name,
      };
    }
  }

  return null;
}
