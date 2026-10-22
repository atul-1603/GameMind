import React from 'react';
import { History, X } from 'lucide-react';
import { useGameStore } from '../hooks/useGame';

export const MoveHistory: React.FC = () => {
  const { moves, discSymbols } = useGameStore();

  if (moves.length === 0) return null;

  return (
    <div className="glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <History className="w-4 h-4 text-sky-400" />
          <span>Move History Timeline</span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {moves.length} {moves.length === 1 ? 'ply' : 'plies'} played
        </span>
      </div>

      <div className="max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-1 text-xs">
        {moves
          .slice()
          .reverse()
          .map((m) => (
            <div
              key={`move-rec-${m.moveNumber}`}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-slate-500 w-5 text-right font-bold">
                  #{m.moveNumber}
                </span>

                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    m.player === 1
                      ? 'bg-red-500 shadow-sm shadow-red-500/50'
                      : 'bg-yellow-400 shadow-sm shadow-yellow-500/50'
                  }`}
                >
                  {discSymbols && (
                    <span className="text-[9px] text-white font-extrabold leading-none">
                      {m.player === 1 ? '×' : '•'}
                    </span>
                  )}
                </div>

                <span className="font-mono text-slate-300">
                  Col {m.col + 1}
                  <span className="text-slate-500 text-[11px] ml-1">
                    (row {m.row + 1})
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 max-w-[55%] truncate">
                {m.explanation ? (
                  <span
                    className="text-[11px] text-sky-300/80 truncate italic"
                    title={m.explanation}
                  >
                    {m.explanation}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Player drop
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
