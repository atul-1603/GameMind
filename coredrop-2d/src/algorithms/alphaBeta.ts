import { cloneBoard, getLowestEmptyRow, isBoardFull } from '../game/board';
import { BoardState, PlayerId } from '../game/gameTypes';
import { checkWinAfterMove } from '../game/winDetection';
import { evaluateBoard, WIN_SCORE } from './evaluation';
import { getOrderedValidMoves } from './moveOrdering';
import { SearchOptions, SearchResult, SearchStats, VizNode } from './searchTypes';
import { TranspositionTable } from './transpositionTable';

/**
 * Alpha-Beta Pruning search algorithm for Connect Four.
 */
export function runAlphaBeta(
  initialBoard: BoardState,
  aiPlayer: PlayerId,
  options: SearchOptions,
  sharedTT?: TranspositionTable
): SearchResult {
  const startTime = performance.now();
  const board = cloneBoard(initialBoard);
  const oppPlayer: PlayerId = aiPlayer === 1 ? 2 : 1;
  const useMoveOrdering = options.useMoveOrdering ?? true;
  const useTransposition = options.useTransposition ?? false;
  const maxDepth = options.depth;
  const collectEvents = options.collectEvents ?? false;
  const maxVizDepth = Math.min(maxDepth, 3);

  const tt = sharedTT ?? (useTransposition ? new TranspositionTable() : null);

  let nodesVisited = 0;
  let terminalEvaluated = 0;
  let prunedBranches = 0;
  let maxDepthReached = 0;
  let vizNodeCounter = 0;

  const rootVizNode: VizNode | undefined = collectEvents
    ? {
        id: 'node-root',
        parentId: null,
        depth: 0,
        col: null,
        player: aiPlayer,
        isMaximizing: true,
        score: null,
        alpha: -Infinity,
        beta: Infinity,
        pruned: false,
        children: [],
      }
    : undefined;

  function alphaBetaRecursive(
    currentDepth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    lastRow: number | null,
    lastCol: number | null,
    parentViz?: VizNode
  ): number {
    nodesVisited++;
    if (currentDepth > maxDepthReached) {
      maxDepthReached = currentDepth;
    }

    const prevPlayer: PlayerId = isMaximizing ? oppPlayer : aiPlayer;

    // Check if previous move led to win
    if (lastRow !== null && lastCol !== null) {
      if (checkWinAfterMove(board, lastRow, lastCol, prevPlayer)) {
        terminalEvaluated++;
        const score = prevPlayer === aiPlayer
          ? WIN_SCORE + (maxDepth - currentDepth) * 100
          : -WIN_SCORE - (maxDepth - currentDepth) * 100;
        if (parentViz) {
          parentViz.score = score;
          parentViz.alpha = alpha;
          parentViz.beta = beta;
          parentViz.isTerminal = true;
        }
        return score;
      }
    }

    // Check draw or depth cutoff
    if (isBoardFull(board)) {
      terminalEvaluated++;
      if (parentViz) {
        parentViz.score = 0;
        parentViz.alpha = alpha;
        parentViz.beta = beta;
        parentViz.isTerminal = true;
      }
      return 0;
    }

    if (currentDepth >= maxDepth) {
      terminalEvaluated++;
      const score = evaluateBoard(board, aiPlayer);
      if (parentViz) {
        parentViz.score = score;
        parentViz.alpha = alpha;
        parentViz.beta = beta;
        parentViz.isTerminal = true;
      }
      return score;
    }

    // Check Transposition Table
    const remainingDepth = maxDepth - currentDepth;
    if (tt) {
      const entry = tt.get(board, aiPlayer);
      if (entry && entry.depth >= remainingDepth) {
        if (entry.flag === 'EXACT') {
          return entry.score;
        } else if (entry.flag === 'LOWERBOUND' && entry.score >= beta) {
          return entry.score;
        } else if (entry.flag === 'UPPERBOUND' && entry.score <= alpha) {
          return entry.score;
        }
      }
    }

    const validMoves = getOrderedValidMoves(board, useMoveOrdering);
    if (validMoves.length === 0) {
      terminalEvaluated++;
      const score = evaluateBoard(board, aiPlayer);
      if (parentViz) {
        parentViz.score = score;
        parentViz.alpha = alpha;
        parentViz.beta = beta;
      }
      return score;
    }

    const currentPlayer = isMaximizing ? aiPlayer : oppPlayer;
    let localBestMove = validMoves[0];

    if (isMaximizing) {
      let maxEval = -Infinity;
      let currentAlpha = alpha;

      for (let i = 0; i < validMoves.length; i++) {
        const col = validMoves[i];
        const row = getLowestEmptyRow(board, col);
        if (row === -1) continue;

        board[row][col] = currentPlayer;

        let childViz: VizNode | undefined;
        if (collectEvents && currentDepth < maxVizDepth && parentViz) {
          childViz = {
            id: `node-${++vizNodeCounter}`,
            parentId: parentViz.id,
            depth: currentDepth + 1,
            col,
            player: currentPlayer,
            isMaximizing: false,
            score: null,
            alpha: currentAlpha,
            beta: beta,
            pruned: false,
            children: [],
          };
          parentViz.children.push(childViz);
        }

        const evaluation = alphaBetaRecursive(
          currentDepth + 1,
          currentAlpha,
          beta,
          false,
          row,
          col,
          childViz
        );

        board[row][col] = 0;

        if (evaluation > maxEval) {
          maxEval = evaluation;
          localBestMove = col;
        }

        if (evaluation > currentAlpha) {
          currentAlpha = evaluation;
        }

        // Alpha-Beta Cutoff
        if (beta <= currentAlpha) {
          prunedBranches++;
          // Mark remaining untraversed sibling moves as pruned for visualizer
          if (collectEvents && currentDepth < maxVizDepth && parentViz) {
            for (let j = i + 1; j < validMoves.length; j++) {
              parentViz.children.push({
                id: `node-${++vizNodeCounter}-pruned`,
                parentId: parentViz.id,
                depth: currentDepth + 1,
                col: validMoves[j],
                player: currentPlayer,
                isMaximizing: false,
                score: null,
                alpha: currentAlpha,
                beta: beta,
                pruned: true,
                children: [],
              });
            }
          }
          break;
        }
      }

      if (tt) {
        const flag =
          maxEval <= alpha
            ? 'UPPERBOUND'
            : maxEval >= beta
            ? 'LOWERBOUND'
            : 'EXACT';
        tt.set(board, aiPlayer, remainingDepth, maxEval, flag, localBestMove);
      }

      if (parentViz) {
        parentViz.score = maxEval;
        parentViz.alpha = currentAlpha;
        parentViz.beta = beta;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      let currentBeta = beta;

      for (let i = 0; i < validMoves.length; i++) {
        const col = validMoves[i];
        const row = getLowestEmptyRow(board, col);
        if (row === -1) continue;

        board[row][col] = currentPlayer;

        let childViz: VizNode | undefined;
        if (collectEvents && currentDepth < maxVizDepth && parentViz) {
          childViz = {
            id: `node-${++vizNodeCounter}`,
            parentId: parentViz.id,
            depth: currentDepth + 1,
            col,
            player: currentPlayer,
            isMaximizing: true,
            score: null,
            alpha: alpha,
            beta: currentBeta,
            pruned: false,
            children: [],
          };
          parentViz.children.push(childViz);
        }

        const evaluation = alphaBetaRecursive(
          currentDepth + 1,
          alpha,
          currentBeta,
          true,
          row,
          col,
          childViz
        );

        board[row][col] = 0;

        if (evaluation < minEval) {
          minEval = evaluation;
          localBestMove = col;
        }

        if (evaluation < currentBeta) {
          currentBeta = evaluation;
        }

        // Alpha-Beta Cutoff
        if (currentBeta <= alpha) {
          prunedBranches++;
          // Mark remaining untraversed sibling moves as pruned for visualizer
          if (collectEvents && currentDepth < maxVizDepth && parentViz) {
            for (let j = i + 1; j < validMoves.length; j++) {
              parentViz.children.push({
                id: `node-${++vizNodeCounter}-pruned`,
                parentId: parentViz.id,
                depth: currentDepth + 1,
                col: validMoves[j],
                player: currentPlayer,
                isMaximizing: true,
                score: null,
                alpha: alpha,
                beta: currentBeta,
                pruned: true,
                children: [],
              });
            }
          }
          break;
        }
      }

      if (tt) {
        const flag =
          minEval <= alpha
            ? 'UPPERBOUND'
            : minEval >= beta
            ? 'LOWERBOUND'
            : 'EXACT';
        tt.set(board, aiPlayer, remainingDepth, minEval, flag, localBestMove);
      }

      if (parentViz) {
        parentViz.score = minEval;
        parentViz.alpha = alpha;
        parentViz.beta = currentBeta;
      }
      return minEval;
    }
  }

  // Root level: search candidate columns
  const rootMoves = getOrderedValidMoves(board, useMoveOrdering);
  if (rootMoves.length === 0) {
    throw new Error('No valid moves available on this board.');
  }

  let bestMove = rootMoves[0];
  let bestScore = -Infinity;
  let rootAlpha = -Infinity;
  const rootBeta = Infinity;
  const moveScores: { col: number; score: number }[] = [];

  for (let i = 0; i < rootMoves.length; i++) {
    const col = rootMoves[i];
    const row = getLowestEmptyRow(board, col);
    if (row === -1) continue;

    board[row][col] = aiPlayer;

    let childViz: VizNode | undefined;
    if (collectEvents && rootVizNode) {
      childViz = {
        id: `node-${++vizNodeCounter}`,
        parentId: rootVizNode.id,
        depth: 1,
        col,
        player: aiPlayer,
        isMaximizing: false,
        score: null,
        alpha: rootAlpha,
        beta: rootBeta,
        pruned: false,
        children: [],
      };
      rootVizNode.children.push(childViz);
    }

    const score = alphaBetaRecursive(
      1,
      rootAlpha,
      rootBeta,
      false,
      row,
      col,
      childViz
    );

    board[row][col] = 0;
    moveScores.push({ col, score });

    if (score > bestScore) {
      bestScore = score;
      bestMove = col;
    }

    if (score > rootAlpha) {
      rootAlpha = score;
    }
  }

  if (rootVizNode) {
    rootVizNode.score = bestScore;
    rootVizNode.alpha = rootAlpha;
  }

  const executionTimeMs = performance.now() - startTime;
  const effectiveBranchingFactor =
    maxDepth > 0 ? Math.pow(Math.max(1, nodesVisited), 1 / maxDepth) : 1;

  const stats: SearchStats = {
    algorithm: 'alphabeta',
    depth: maxDepth,
    bestMove,
    optimalScore: bestScore,
    nodesVisited,
    terminalEvaluated,
    prunedBranches,
    executionTimeMs: Math.round(executionTimeMs * 100) / 100,
    maxDepthReached,
    moveScores,
    effectiveBranchingFactor: Math.round(effectiveBranchingFactor * 100) / 100,
  };

  return {
    bestMove,
    score: bestScore,
    stats,
    vizTree: rootVizNode,
  };
}
