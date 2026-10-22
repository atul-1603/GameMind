export const ROWS = 6;
export const COLS = 7;
export const WIN_LENGTH = 4;

export type CellValue = 0 | 1 | 2; // 0 = empty, 1 = Red (Player 1), 2 = Yellow (Player 2)
export type PlayerId = 1 | 2;

export interface Coordinate {
  row: number;
  col: number;
}

export type BoardState = CellValue[][];

export type GameStatus = 'idle' | 'playing' | 'won' | 'draw';

export interface WinInfo {
  winner: PlayerId;
  winningCells: Coordinate[];
  direction: 'horizontal' | 'vertical' | 'diagonal-up' | 'diagonal-down';
}

export interface MoveRecord {
  player: PlayerId;
  col: number;
  row: number;
  timestamp: number;
  moveNumber: number;
  explanation?: string;
  evalScore?: number;
}

export type GameMode = 'pve' | 'pvp' | 'eve' | 'lab';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type AIAlgorithm = 'minimax' | 'alphabeta';

export interface AgentConfig {
  algorithm: AIAlgorithm;
  depth: number;
  useMoveOrdering: boolean;
  useTransposition: boolean;
  name: string;
}
