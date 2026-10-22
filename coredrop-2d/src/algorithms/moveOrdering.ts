import { BoardState, COLS } from '../game/gameTypes';
import { isValidMove } from '../game/board';

/**
 * Center-out preference: 3 (center), then 2, 4, 1, 5, 0, 6.
 */
export const CENTER_FIRST_ORDER = [3, 2, 4, 1, 5, 0, 6];

/**
 * Returns valid moves ordered either by strategic center-first preference or by sequential column order.
 */
export function getOrderedValidMoves(
  board: BoardState,
  useMoveOrdering: boolean = true
): number[] {
  const order = useMoveOrdering ? CENTER_FIRST_ORDER : [0, 1, 2, 3, 4, 5, 6];
  const validMoves: number[] = [];

  for (let i = 0; i < order.length; i++) {
    const col = order[i];
    if (isValidMove(board, col)) {
      validMoves.push(col);
    }
  }

  return validMoves;
}
