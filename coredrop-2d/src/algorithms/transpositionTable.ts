import { BoardState } from '../game/gameTypes';
import { serializeBoard } from '../game/board';

export type TTFlag = 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND';

export interface TTEntry {
  depth: number;
  score: number;
  flag: TTFlag;
  bestMove: number;
}

export class TranspositionTable {
  private table = new Map<string, TTEntry>();
  private readonly maxEntries: number;

  constructor(maxEntries: number = 200000) {
    this.maxEntries = maxEntries;
  }

  public get(board: BoardState, playerPerspective: number): TTEntry | undefined {
    const key = `${playerPerspective}:${serializeBoard(board)}`;
    return this.table.get(key);
  }

  public set(
    board: BoardState,
    playerPerspective: number,
    depth: number,
    score: number,
    flag: TTFlag,
    bestMove: number
  ): void {
    if (this.table.size >= this.maxEntries) {
      // Clear half or clear all to prevent memory bloat
      this.table.clear();
    }
    const key = `${playerPerspective}:${serializeBoard(board)}`;
    this.table.set(key, { depth, score, flag, bestMove });
  }

  public clear(): void {
    this.table.clear();
  }

  public get size(): number {
    return this.table.size;
  }
}
