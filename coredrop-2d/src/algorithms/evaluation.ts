import { BoardState, COLS, PlayerId, ROWS } from '../game/gameTypes';
import { ALL_WINDOWS, checkWinAfterMove } from '../game/winDetection';
import { dropDisc, getLowestEmptyRow, isValidMove } from '../game/board';

export const WIN_SCORE = 100000;
export const THREE_AI_SCORE = 120;
export const TWO_AI_SCORE = 12;
export const THREE_OPP_PENALTY = 140;
export const TWO_OPP_PENALTY = 14;
export const CENTER_COL_WEIGHT = 6;
export const ADJ_COL_WEIGHT = 3;

/**
 * Evaluates the board heuristic score from the perspective of aiPlayer.
 * Positive score favors aiPlayer, negative score favors opponent.
 */
export function evaluateBoard(board: BoardState, aiPlayer: PlayerId): number {
  const oppPlayer: PlayerId = aiPlayer === 1 ? 2 : 1;
  let score = 0;

  // 1. Positional Central Dominance (Column 3 is pivotal in Connect Four)
  const centerCol = 3;
  let aiCenter = 0;
  let oppCenter = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerCol] === aiPlayer) aiCenter++;
    else if (board[r][centerCol] === oppPlayer) oppCenter++;
  }
  score += (aiCenter - oppCenter) * CENTER_COL_WEIGHT;

  // Columns 2 and 4 slight positional bias
  for (let r = 0; r < ROWS; r++) {
    if (board[r][2] === aiPlayer) score += ADJ_COL_WEIGHT;
    else if (board[r][2] === oppPlayer) score -= ADJ_COL_WEIGHT;

    if (board[r][4] === aiPlayer) score += ADJ_COL_WEIGHT;
    else if (board[r][4] === oppPlayer) score -= ADJ_COL_WEIGHT;
  }

  // 2. Score all 69 four-cell windows
  for (let i = 0; i < ALL_WINDOWS.length; i++) {
    const coords = ALL_WINDOWS[i].coords;
    let aiCount = 0;
    let oppCount = 0;
    let emptyCount = 0;

    for (let j = 0; j < 4; j++) {
      const val = board[coords[j].row][coords[j].col];
      if (val === aiPlayer) aiCount++;
      else if (val === oppPlayer) oppCount++;
      else emptyCount++;
    }

    if (aiCount === 4) {
      return WIN_SCORE;
    } else if (oppCount === 4) {
      return -WIN_SCORE;
    } else if (aiCount === 3 && emptyCount === 1) {
      score += THREE_AI_SCORE;
    } else if (aiCount === 2 && emptyCount === 2) {
      score += TWO_AI_SCORE;
    }

    if (oppCount === 3 && emptyCount === 1) {
      score -= THREE_OPP_PENALTY;
    } else if (oppCount === 2 && emptyCount === 2) {
      score -= TWO_OPP_PENALTY;
    }
  }

  return score;
}

/**
 * Generates an empirically accurate rationale for the chosen move based on
 * actual board state analysis rather than random text.
 */
export function explainMove(
  board: BoardState,
  col: number,
  player: PlayerId
): string {
  if (!isValidMove(board, col)) return 'Move selected.';

  const oppPlayer: PlayerId = player === 1 ? 2 : 1;
  const row = getLowestEmptyRow(board, col);

  // 1. Immediate Win Check
  const win = checkWinAfterMove(board, row, col, player);
  if (win) {
    return `Winning move: completes 4-in-a-row ${win.direction} connection.`;
  }

  // 2. Immediate Block of Opponent Win
  const oppWin = checkWinAfterMove(board, row, col, oppPlayer);
  if (oppWin) {
    return `Defensive move: blocks opponent's immediate ${oppWin.direction} winning threat.`;
  }

  // 3. Simulated move consequences
  const { newBoard } = dropDisc(board, col, player);

  // Check how many 3-in-a-row threats this created
  let newThreats = 0;
  for (const win of ALL_WINDOWS) {
    let pCount = 0;
    let eCount = 0;
    for (const c of win.coords) {
      if (newBoard[c.row][c.col] === player) pCount++;
      else if (newBoard[c.row][c.col] === 0) eCount++;
    }
    if (pCount === 3 && eCount === 1) {
      newThreats++;
    }
  }

  if (newThreats >= 2) {
    return `Tactical fork: creates ${newThreats} simultaneous 4-in-a-row winning threats.`;
  }

  if (col === 3) {
    return 'Positional control: locks the center column to maximize diagonal & horizontal lines.';
  }

  if (newThreats === 1) {
    return 'Offensive move: builds a 3-disc alignment with an open winning threat.';
  }

  return 'Strategic development: advances board control while denying opponent expansion.';
}
