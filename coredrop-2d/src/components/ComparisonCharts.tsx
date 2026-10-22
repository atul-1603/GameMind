import React from 'react';
import { BarChart3, TrendingDown, Zap } from 'lucide-react';
import { SearchStats } from '../algorithms/searchTypes';

interface Props {
  minimaxStats: SearchStats | null;
  alphaBetaStats: SearchStats | null;
}

export const ComparisonCharts: React.FC<Props> = ({
  minimaxStats,
  alphaBetaStats,
}) => {
  if (!minimaxStats && !alphaBetaStats) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400 text-sm">
        Run a comparison benchmark to generate live empirical charts.
      </div>
    );
  }

  const mmNodes = minimaxStats?.nodesVisited ?? 0;
  const abNodes = alphaBetaStats?.nodesVisited ?? 0;
  const maxNodes = Math.max(mmNodes, abNodes, 1);

  const mmTime = minimaxStats?.executionTimeMs ?? 0;
  const abTime = alphaBetaStats?.executionTimeMs ?? 0;
  const maxTime = Math.max(mmTime, abTime, 1);

  const mmTerm = minimaxStats?.terminalEvaluated ?? 0;
  const abTerm = alphaBetaStats?.terminalEvaluated ?? 0;
  const maxTerm = Math.max(mmTerm, abTerm, 1);

  const nodeSavingsPct =
    mmNodes > 0 && abNodes > 0
      ? Math.max(0, Math.round(((mmNodes - abNodes) / mmNodes) * 100))
      : 0;

  const timeSavingsPct =
    mmTime > 0 && abTime > 0
      ? Math.max(0, Math.round(((mmTime - abTime) / mmTime) * 100))
      : 0;

  return (
    <div className="glass-panel p-5 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h4 className="font-heading font-bold text-lg text-white">
              Empirical Performance Analytics
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real benchmark measurements recorded from identical board state at depth{' '}
            {minimaxStats?.depth ?? alphaBetaStats?.depth}.
          </p>
        </div>

        {nodeSavingsPct > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold animate-pulse">
            <TrendingDown className="w-4 h-4" />
            <span>{nodeSavingsPct}% Node Reduction via Alpha-Beta</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Nodes Visited */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nodes Visited
              </span>
              <span className="text-[11px] font-mono text-sky-400 font-semibold">
                Lower is better
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Total game-tree vertices explored during search.
            </p>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs">
            {/* Minimax Bar */}
            {minimaxStats && (
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Pure Minimax</span>
                  <span className="font-bold text-slate-200">
                    {mmNodes.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(mmNodes / maxNodes) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Alpha-Beta Bar */}
            {alphaBetaStats && (
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Alpha-Beta Pruning</span>
                  <span className="font-bold text-emerald-400">
                    {abNodes.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(abNodes / maxNodes) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metric 2: Execution Time */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Execution Time
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Milliseconds
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Time spent traversing game tree in V8 engine.
            </p>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs">
            {minimaxStats && (
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Pure Minimax</span>
                  <span className="font-bold text-slate-200">{mmTime} ms</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(mmTime / maxTime) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {alphaBetaStats && (
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Alpha-Beta Pruning</span>
                  <span className="font-bold text-emerald-400">{abTime} ms</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(abTime / maxTime) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metric 3: Terminal Evaluations & Pruning */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Terminal Evaluations
              </span>
              <span className="text-[11px] font-mono text-amber-400 font-semibold">
                Leaf Nodes
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Positions evaluated at tree cutoff or win/draw.
            </p>
          </div>

          <div className="flex flex-col gap-3 font-mono text-xs">
            {minimaxStats && (
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Minimax Leaves</span>
                  <span className="font-bold text-slate-200">
                    {mmTerm.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(mmTerm / maxTerm) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {alphaBetaStats && (
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Alpha-Beta Leaves</span>
                  <span className="font-bold text-emerald-400">
                    {abTerm.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(abTerm / maxTerm) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
