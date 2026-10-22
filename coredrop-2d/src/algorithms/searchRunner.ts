import { BoardState, PlayerId } from '../game/gameTypes';
import { runAlphaBeta } from './alphaBeta';
import { explainMove } from './evaluation';
import { runMinimax } from './minimax';
import { SearchOptions, SearchResult } from './searchTypes';

let workerInstance: Worker | null = null;
const pendingRequests = new Map<
  string,
  {
    resolve: (val: { result: SearchResult; explanation: string }) => void;
    reject: (err: any) => void;
  }
>();

function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return null;
  }
  if (!workerInstance) {
    try {
      workerInstance = new Worker(
        new URL('../workers/searchWorker.ts', import.meta.url),
        { type: 'module' }
      );
      workerInstance.onmessage = (e) => {
        const { id, result, explanation } = e.data;
        const pending = pendingRequests.get(id);
        if (pending) {
          pending.resolve({ result, explanation });
          pendingRequests.delete(id);
        }
      };
      workerInstance.onerror = (err) => {
        console.warn('Worker error, fallback to inline execution:', err);
        pendingRequests.forEach(({ reject }) => reject(err));
        pendingRequests.clear();
      };
    } catch (e) {
      console.warn('Worker initialization failed, fallback to main thread:', e);
      workerInstance = null;
    }
  }
  return workerInstance;
}

/**
 * Executes a search either in a background Web Worker or inline asynchronously.
 */
export async function executeSearch(
  board: BoardState,
  aiPlayer: PlayerId,
  algorithm: 'minimax' | 'alphabeta',
  options: SearchOptions
): Promise<{ result: SearchResult; explanation: string }> {
  const worker = getWorker();
  const requestId = `req-${Date.now()}-${Math.random()}`;

  if (worker) {
    return new Promise((resolve, reject) => {
      pendingRequests.set(requestId, { resolve, reject });
      worker.postMessage({
        id: requestId,
        board,
        aiPlayer,
        algorithm,
        options,
      });
    });
  }

  // Fallback: asynchronous execution on main thread with microtask yielding
  await new Promise((r) => setTimeout(r, 10));
  const result =
    algorithm === 'minimax'
      ? runMinimax(board, aiPlayer, options)
      : runAlphaBeta(board, aiPlayer, options);
  const explanation = explainMove(board, result.bestMove, aiPlayer);

  return { result, explanation };
}
