import React from 'react';
import { AlgorithmResult } from '../algorithms';

interface ComparisonChartsProps {
  results: AlgorithmResult[];
}

export const ComparisonCharts: React.FC<ComparisonChartsProps> = ({ results }) => {
  if (results.length === 0) return null;

  // Max values for normalization
  const maxTime = Math.max(...results.map((r) => r.executionTimeMs), 0.1);
  const maxExpanded = Math.max(...results.map((r) => r.expandedCount), 1);
  const maxCost = Math.max(...results.map((r) => r.totalCost), 1);

  const getAlgoColor = (algo: string) => {
    switch (algo) {
      case 'ASTAR':
        return '#00f0ff'; // Cyan
      case 'BFS':
        return '#3b82f6'; // Blue
      case 'DIJKSTRA':
        return '#a855f7'; // Purple
      case 'GREEDY_BEST_FIRST':
        return '#f59e0b'; // Amber
      case 'DFS':
        return '#ef4444'; // Red
      default:
        return '#64748b';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Execution Time Chart */}
      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
            Execution Time (ms)
          </div>
          <div className="text-[10px] text-slate-400 mb-3">
            Lower is faster in local JS engine
          </div>
        </div>

        <div className="space-y-2">
          {results.map((r) => {
            const pct = Math.max(4, (r.executionTimeMs / maxTime) * 100);
            return (
              <div key={r.algorithm} className="space-y-0.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-300 font-semibold">{r.algorithm}</span>
                  <span className="text-amber-400">{r.executionTimeMs.toFixed(2)} ms</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getAlgoColor(r.algorithm),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Expanded Nodes Chart */}
      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
            Expanded Nodes (Search Space)
          </div>
          <div className="text-[10px] text-slate-400 mb-3">
            Fewer expansions = tighter search focus
          </div>
        </div>

        <div className="space-y-2">
          {results.map((r) => {
            const pct = Math.max(4, (r.expandedCount / maxExpanded) * 100);
            return (
              <div key={r.algorithm} className="space-y-0.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-300 font-semibold">{r.algorithm}</span>
                  <span className="text-cyan-400">{r.expandedCount} nodes</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getAlgoColor(r.algorithm),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Total Traversal Cost Chart */}
      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
            Total Path Cost & Length
          </div>
          <div className="text-[10px] text-slate-400 mb-3">
            Evaluates path optimality
          </div>
        </div>

        <div className="space-y-2">
          {results.map((r) => {
            const pct = Math.max(4, (r.totalCost / maxCost) * 100);
            return (
              <div key={r.algorithm} className="space-y-0.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-300 font-semibold">{r.algorithm}</span>
                  <span className="text-emerald-400">
                    Cost: {r.totalCost} ({r.pathLength} steps)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getAlgoColor(r.algorithm),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
