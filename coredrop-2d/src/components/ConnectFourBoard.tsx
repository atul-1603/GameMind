import React, { useState } from 'react';
import { ArrowDown, Check, Lock, Sparkles, X } from 'lucide-react';
import { getLowestEmptyRow, isValidMove } from '../game/board';
import { COLS, Coordinate, ROWS } from '../game/gameTypes';
import { useGameStore } from '../hooks/useGame';

export const ConnectFourBoard: React.FC = () => {
  const {
    board,
    currentPlayer,
    status,
    winInfo,
    moves,
    isAIThinking,
    humanPlayer,
    gameMode,
    makePlayerMove,
    ghostCol,
    setGhostCol,
    proposedAIMove,
    discSymbols,
  } = useGameStore();

  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const lastMove = moves.length > 0 ? moves[moves.length - 1] : null;

  const isWinningCell = (r: number, c: number): boolean => {
    if (!winInfo) return false;
    return winInfo.winningCells.some(
      (cell: Coordinate) => cell.row === r && cell.col === c
    );
  };

  const isColumnDisabled = (col: number): boolean => {
    if (status !== 'playing') return true;
    if (isAIThinking) return true;
    if (gameMode === 'pve' && currentPlayer !== humanPlayer) return true;
    if (gameMode === 'eve') return true;
    return !isValidMove(board, col);
  };

  const handleColumnClick = (col: number) => {
    if (isColumnDisabled(col)) return;
    makePlayerMove(col);
  };

  const activeGhostCol = hoveredCol !== null ? hoveredCol : ghostCol;
  const ghostTargetRow =
    activeGhostCol !== null ? getLowestEmptyRow(board, activeGhostCol) : -1;

  return (
    <div className="board-container select-none max-w-full overflow-hidden p-2">
      {/* Column Hover & Drop Selectors */}
      <div className="grid grid-cols-7 gap-2 sm:gap-2.5 mb-2 w-full max-w-[520px]">
        {Array.from({ length: COLS }).map((_, c) => {
          const disabled = isColumnDisabled(c);
          const isFull = !isValidMove(board, c);
          const isHovered = activeGhostCol === c;
          const isAIHint = proposedAIMove === c;

          return (
            <button
              key={`col-btn-${c}`}
              onClick={() => handleColumnClick(c)}
              onMouseEnter={() => setHoveredCol(c)}
              onMouseLeave={() => setHoveredCol(null)}
              disabled={disabled}
              className={`col-selector-btn h-11 rounded-xl transition-all duration-200 flex flex-col items-center justify-center ${
                isHovered && !disabled
                  ? 'bg-sky-500/20 border border-sky-400/40 shadow-lg shadow-sky-500/20 scale-105'
                  : 'bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/80'
              } ${disabled && !isFull ? 'opacity-40 cursor-not-allowed' : ''} ${
                isFull ? 'border-red-500/20 bg-red-950/20' : ''
              }`}
              title={
                isFull
                  ? `Column ${c + 1} is full`
                  : `Drop disc into column ${c + 1}`
              }
            >
              {isFull ? (
                <Lock className="w-3.5 h-3.5 text-red-400/60" />
              ) : isAIHint ? (
                <div className="flex flex-col items-center">
                  <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
                  <span className="text-[9px] font-mono font-bold text-sky-300">
                    BEST
                  </span>
                </div>
              ) : (
                <ArrowDown
                  className={`w-4 h-4 col-arrow transition-transform duration-200 ${
                    isHovered
                      ? currentPlayer === 1
                        ? 'text-red-400 translate-y-1'
                        : 'text-amber-400 translate-y-1'
                      : 'text-slate-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main 7x6 Frame */}
      <div className="board-frame max-w-[520px] w-full">
        <div className="board-grid">
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const cellVal = board[r][c];
              const isWin = isWinningCell(r, c);
              const isLast = lastMove && lastMove.row === r && lastMove.col === c;
              const isGhost =
                activeGhostCol === c &&
                ghostTargetRow === r &&
                cellVal === 0 &&
                !isColumnDisabled(c);
              const isHint =
                proposedAIMove === c &&
                getLowestEmptyRow(board, c) === r &&
                cellVal === 0;

              return (
                <div
                  key={`cell-${r}-${c}`}
                  onClick={() => handleColumnClick(c)}
                  onMouseEnter={() => setHoveredCol(c)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className={`cell-slot cursor-pointer ${
                    isWin ? 'cell-winning' : ''
                  } ${isHint ? 'cell-ai-hint' : ''}`}
                >
                  {/* Occupied Disc */}
                  {cellVal !== 0 && (
                    <div
                      className={`disc ${
                        cellVal === 1 ? 'disc-red' : 'disc-yellow'
                      } ${isLast ? 'disc-drop-anim' : ''}`}
                    >
                      {/* Accessibility Symbol */}
                      {discSymbols && (
                        <div className="text-white/80 font-bold pointer-events-none drop-shadow">
                          {cellVal === 1 ? (
                            <X className="w-5 h-5 stroke-[2.5]" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/90 bg-white/20" />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ghost Disc Preview */}
                  {isGhost && (
                    <div
                      className={`disc ghost-disc ${
                        currentPlayer === 1 ? 'disc-red' : 'disc-yellow'
                      }`}
                    >
                      {discSymbols && (
                        <div className="text-white/60 font-bold pointer-events-none">
                          {currentPlayer === 1 ? (
                            <X className="w-4 h-4 stroke-[2]" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border-2 border-white/70" />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Column coordinate labels below board */}
      <div className="grid grid-cols-7 gap-2 sm:gap-2.5 mt-2.5 w-full max-w-[520px] px-2 text-center text-xs font-mono font-semibold text-slate-500">
        {Array.from({ length: COLS }).map((_, c) => (
          <span
            key={`col-label-${c}`}
            className={activeGhostCol === c ? 'text-sky-400 font-bold' : ''}
          >
            C{c + 1}
          </span>
        ))}
      </div>
    </div>
  );
};
