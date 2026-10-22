import { cloneBoard, getLowestEmptyRow, isBoardFull } from '../game/board';
import { BoardState, PlayerId } from '../game/gameTypes';
import { checkWinAfterMove } from '../game/winDetection';
import { evaluateBoard, WIN_SCORE } from './evaluation';
import { getOrderedValidMoves } from './moveOrdering';
import { SearchOptions, SearchResult, SearchStats, VizNode } from './searchTypes';

/**
 * Pure Minimax algorithm without pruning for Connect Four.
 */
export function runMinimax(
  initialBoard: BoardState,
  aiPlayer: PlayerId,
  options: SearchOptions
): SearchResult {
  const startTime = performance.now();
  const board = cloneBoard(initialBoard);
  const oppPlayer: PlayerId = aiPlayer === 1 ? 2 : 1;
  const useMoveOrdering = options.useMoveOrdering ?? false;
  const maxDepth = options.depth;
  const collectEvents = options.collectEvents ?? false;
  const maxVizDepth = Math.min(maxDepth, 3);

  let nodesVisited = 0;
  let terminalEvaluated = 0;
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
        pruned: false,
        children: [],
      }
    : undefined;

  function minimaxRecursive(
    currentDepth: number,
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

    // Check if the move made to reach this state was a winning move
    if (lastRow !== null && lastCol !== null) {
      if (checkWinAfterMove(board, lastRow, lastCol, prevPlayer)) {
        terminalEvaluated++;
        const score = prevPlayer === aiPlayer
          ? WIN_SCORE + (maxDepth - currentDepth) * 100
          : -WIN_SCORE - (maxDepth - currentDepth) * 100;
        if (parentViz) {
          parentViz.score = score;
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
        parentViz.isTerminal = true;
      }
      return 0;
    }

    if (currentDepth >= maxDepth) {
      terminalEvaluated++;
      const score = evaluateBoard(board, aiPlayer);
      if (parentViz) {
        parentViz.score = score;
        parentViz.isTerminal = true;
      }
      return score;
    }

    const validMoves = getOrderedValidMoves(board, useMoveOrdering);
    if (validMoves.length === 0) {
      terminalEvaluated++;
      const score = evaluateBoard(board, aiPlayer);
      if (parentViz) parentViz.score = score;
      return score;
    }

    const currentPlayer = isMaximizing ? aiPlayer : oppPlayer;

    if (isMaximizing) {
      let maxEval = -Infinity;

      for (let i = 0; i < validMoves.length; i++) {
        const col = validMoves[i];
        const row = getLowestEmptyRow(board, col);
        if (row === -1) continue;

        // Make move
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
            pruned: false,
            children: [],
          };
          parentViz.children.push(childViz);
        }

        const evaluation = minimaxRecursive(
          currentDepth + 1,
          false,
          row,
          col,
          childViz
        );

        // Undo move
        board[row][col] = 0;

        if (evaluation > maxEval) {
          maxEval = evaluation;
        }
      }

      if (parentViz) parentViz.score = maxEval;
      return maxEval;
    } else {
      let minEval = Infinity;

      for (let i = 0; i < validMoves.length; i++) {
        const col = validMoves[i];
        const row = getLowestEmptyRow(board, col);
        if (row === -1) continue;

        // Make move
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
            pruned: false,
            children: [],
          };
          parentViz.children.push(childViz);
        }

        const evaluation = minimaxRecursive(
          currentDepth + 1,
          true,
          row,
          col,
          childViz
        );

        // Undo move
        board[row][col] = 0;

        if (evaluation < minEval) {
          minEval = evaluation;
        }
      }

      if (parentViz) parentViz.score = minEval;
      return minEval;
    }
  }

  // Root Level search: evaluate all valid top-level candidate columns
  const rootMoves = getOrderedValidMoves(board, useMoveOrdering);
  if (rootMoves.length === 0) {
    throw new Error('No valid moves available on this board.');
  }

  let bestMove = rootMoves[0];
  let bestScore = -Infinity;
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
        pruned: false,
        children: [],
      };
      rootVizNode.children.push(childViz);
    }

    const score = minimaxRecursive(1, false, row, col, childViz);
    board[row][col] = 0;

    moveScores.push({ col, score });

    if (score > bestScore) {
      bestScore = score;
      bestMove = col;
    }
  }

  if (rootVizNode) {
    rootVizNode.score = bestScore;
  }

  const executionTimeMs = performance.now() - startTime;
  const effectiveBranchingFactor =
    maxDepth > 0 ? Math.pow(Math.max(1, nodesVisited), 1 / maxDepth) : 1;

  const stats: SearchStats = {
    algorithm: 'minimax',
    depth: maxDepth,
    bestMove,
    optimalScore: bestScore,
    nodesVisited,
    terminalEvaluated,
    prunedBranches: 0,
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
