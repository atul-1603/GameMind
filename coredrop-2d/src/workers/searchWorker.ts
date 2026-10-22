import { runAlphaBeta } from '../algorithms/alphaBeta';
import { explainMove } from '../algorithms/evaluation';
import { runMinimax } from '../algorithms/minimax';
import { SearchOptions, SearchResult } from '../algorithms/searchTypes';
import { BoardState, PlayerId } from '../game/gameTypes';

export interface WorkerRequest {
  id: string;
  board: BoardState;
  aiPlayer: PlayerId;
  algorithm: 'minimax' | 'alphabeta';
  options: SearchOptions;
}

export interface WorkerResponse {
  id: string;
  result: SearchResult;
  explanation: string;
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, board, aiPlayer, algorithm, options } = e.data;

  let result: SearchResult;
  if (algorithm === 'minimax') {
    result = runMinimax(board, aiPlayer, options);
  } else {
    result = runAlphaBeta(board, aiPlayer, options);
  }

  const explanation = explainMove(board, result.bestMove, aiPlayer);

  const response: WorkerResponse = {
    id,
    result,
    explanation,
  };

  self.postMessage(response);
};
