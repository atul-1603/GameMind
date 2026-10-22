import React from 'react';
import {
  Award,
  BarChart3,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useGameStore } from '../hooks/useGame';

export const GameOverModal: React.FC = () => {
  const {
    status,
    winner,
    winInfo,
    moveCount,
    moves,
    gameMode,
    humanPlayer,
    aiDifficulty,
    aiAlgorithm,
    startNewGame,
    setActiveTab,
    setHumanPlayer,
  } = useGameStore();

  if (status !== 'won' && status !== 'draw') return null;

  const isWin = status === 'won';
  const isHumanWinner =
    gameMode === 'pve' && isWin && winner === humanPlayer;
  const isAIWinner =
    gameMode === 'pve' && isWin && winner !== humanPlayer;

  const matchDurationSeconds =
    moves.length >= 2
      ? Math.round(
          (moves[moves.length - 1].timestamp - moves[0].timestamp) / 1000
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel max-w-md w-full p-6 text-center flex flex-col items-center gap-4 border-2 border-sky-500/40 shadow-2xl shadow-sky-500/20">
        {/* Victory Icon / Aura */}
        <div className="relative">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
              isWin
                ? winner === 1
                  ? 'bg-gradient-to-tr from-red-600 to-rose-400 text-white shadow-red-500/40 ring-4 ring-red-400/30'
                  : 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-900 shadow-amber-500/40 ring-4 ring-yellow-400/30'
                : 'bg-slate-700 text-slate-300 ring-4 ring-slate-600/30'
            }`}
          >
            {isWin ? (
              <Trophy className="w-9 h-9 animate-bounce" />
            ) : (
              <HelpCircle className="w-9 h-9" />
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-heading font-extrabold text-white">
            {isWin ? (
              gameMode === 'pve' ? (
                isHumanWinner ? (
                  <span className="text-emerald-400">Victory! You Outsmarted the AI</span>
                ) : (
                  <span className="text-red-400">Defeat! AI Outcalculated You</span>
                )
              ) : (
                <span>
                  Player {winner} ({winner === 1 ? 'Red' : 'Yellow'}) Won!
                </span>
              )
            ) : (
              <span className="text-amber-300">Stalemate! Game Drawn</span>
            )}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            {isWin
              ? `Connected four discs along a ${winInfo?.direction} vector in ${moveCount} plies.`
              : 'All 42 cells on the grid were occupied without a 4-in-a-row alignment.'}
          </p>
        </div>

        {/* Match Statistics Card */}
        <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">
              Total Moves
            </span>
            <span className="text-sm font-bold text-slate-200">{moveCount}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">
              Duration
            </span>
            <span className="text-sm font-bold text-slate-200">
              {matchDurationSeconds}s
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">
              {gameMode === 'pve' ? 'Difficulty' : 'Mode'}
            </span>
            <span className="text-sm font-bold text-sky-400 capitalize">
              {gameMode === 'pve' ? aiDifficulty : gameMode}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-2 pt-2">
          <button onClick={startNewGame} className="btn-primary w-full justify-center py-2.5">
            <RotateCcw className="w-4 h-4" />
            <span>Play Rematch</span>
          </button>

          {gameMode === 'pve' && (
            <button
              onClick={() => {
                setHumanPlayer(humanPlayer === 1 ? 2 : 1);
              }}
              className="btn-secondary w-full justify-center py-2 text-xs"
            >
              <span>
                Switch Sides (Play as {humanPlayer === 1 ? 'Yellow (2nd)' : 'Red (1st)'})
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('lab')}
            className="btn-secondary w-full justify-center py-2 text-xs text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
          >
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Open in Algorithm Lab</span>
          </button>
        </div>
      </div>
    </div>
  );
};
