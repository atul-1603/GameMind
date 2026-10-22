import {
  cloneBoard,
  createEmptyBoard,
  dropDisc,
  getLowestEmptyRow,
  isBoardFull,
  isValidMove,
} from './board';
import {
  BoardState,
  GameStatus,
  MoveRecord,
  PlayerId,
  WinInfo,
} from './gameTypes';
import { checkWinAfterMove } from './winDetection';

export interface GameEngineState {
  board: BoardState;
  currentPlayer: PlayerId;
  status: GameStatus;
  winner: PlayerId | null;
  winInfo: WinInfo | null;
  moves: MoveRecord[];
  moveCount: number;
}

/**
 * Creates an initial clean game state.
 */
export function createInitialGameState(startingPlayer: PlayerId = 1): GameEngineState {
  return {
    board: createEmptyBoard(),
    currentPlayer: startingPlayer,
    status: 'playing',
    winner: null,
    winInfo: null,
    moves: [],
    moveCount: 0,
  };
}

/**
 * Executes a move in the given column.
 * Returns the updated game state.
 * Throws an error if the move is invalid or the game is already over.
 */
export function applyMove(
  state: GameEngineState,
  col: number,
  explanation?: string,
  evalScore?: number
): GameEngineState {
  if (state.status !== 'playing') {
    throw new Error(`Cannot make a move when game status is ${state.status}.`);
  }

  if (!isValidMove(state.board, col)) {
    throw new Error(`Column ${col} is already full or out of bounds.`);
  }

  const { newBoard, row } = dropDisc(state.board, col, state.currentPlayer);
  const win = checkWinAfterMove(newBoard, row, col, state.currentPlayer);

  const moveRecord: MoveRecord = {
    player: state.currentPlayer,
    col,
    row,
    timestamp: Date.now(),
    moveNumber: state.moveCount + 1,
    explanation,
    evalScore,
  };

  if (win) {
    return {
      board: newBoard,
      currentPlayer: state.currentPlayer,
      status: 'won',
      winner: state.currentPlayer,
      winInfo: win,
      moves: [...state.moves, moveRecord],
      moveCount: state.moveCount + 1,
    };
  }

  if (isBoardFull(newBoard)) {
    return {
      board: newBoard,
      currentPlayer: state.currentPlayer,
      status: 'draw',
      winner: null,
      winInfo: null,
      moves: [...state.moves, moveRecord],
      moveCount: state.moveCount + 1,
    };
  }

  const nextPlayer: PlayerId = state.currentPlayer === 1 ? 2 : 1;

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    status: 'playing',
    winner: null,
    winInfo: null,
    moves: [...state.moves, moveRecord],
    moveCount: state.moveCount + 1,
  };
}

/**
 * Undoes the last move (or last two moves if in PvE) safely.
 */
export function undoLastMove(state: GameEngineState): GameEngineState {
  if (state.moves.length === 0) return state;

  const newMoves = state.moves.slice(0, -1);
  const newBoard = createEmptyBoard();

  for (const m of newMoves) {
    const r = getLowestEmptyRow(newBoard, m.col);
    if (r !== -1) {
      newBoard[r][m.col] = m.player;
    }
  }

  const nextPlayer: PlayerId =
    newMoves.length === 0
      ? 1
      : newMoves[newMoves.length - 1].player === 1
      ? 2
      : 1;

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    status: 'playing',
    winner: null,
    winInfo: null,
    moves: newMoves,
    moveCount: newMoves.length,
  };
}
