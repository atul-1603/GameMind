import React, { useState } from 'react';
import {
  Play,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Activity,
} from 'lucide-react';
import { runAllSolvers } from '../algorithms/solverRunner';
import { LevelDefinition } from '../types/game';
import { AlgorithmType, SolverResult } from '../types/solver';

interface AlgorithmLabProps {
  level: LevelDefinition;
  onApplySolution?: (algorithm: AlgorithmType, result: SolverResult) => void;
}

export const AlgorithmLab: React.FC<AlgorithmLabProps> = ({ level, onApplySolution }) => {
  const [results, setResults] = useState<Record<AlgorithmType, SolverResult> | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const handleRunComparison = () => {
    setIsRunning(true);
    setTimeout(() => {
      try {
        const benchResults = runAllSolvers(level);
        setResults(benchResults);
      } finally {
        setIsRunning(false);
      }
    }, 50);
  };

  React.useEffect(() => {
    handleRunComparison();
  }, [level]);

  const getAlgorithmBadge = (algo: AlgorithmType) => {
    switch (algo) {
      case 'ASTAR':
        return { color: '#38bdf8', background: 'rgba(12, 74, 110, 0.6)', border: '1px solid rgba(2, 132, 199, 0.7)' };
      case 'BFS':
        return { color: '#60a5fa', background: 'rgba(30, 58, 138, 0.6)', border: '1px solid rgba(37, 99, 235, 0.7)' };
      case 'GREEDY':
        return { color: '#34d399', background: 'rgba(6, 78, 59, 0.6)', border: '1px solid rgba(5, 150, 105, 0.7)' };
      case 'DFS':
        return { color: '#fbbf24', background: 'rgba(120, 53, 15, 0.6)', border: '1px solid rgba(217, 119, 6, 0.7)' };
    }
  };

  const getAlgorithmFullName = (algo: AlgorithmType) => {
    switch (algo) {
      case 'ASTAR':
        return 'A* Search (f = g + h)';
      case 'BFS':
        return 'Breadth-First Search (BFS)';
      case 'GREEDY':
        return 'Greedy Best-First (h only)';
      case 'DFS':
        return 'Depth-First Search (DFS)';
    }
  };

  const renderBarChart = (
    metricKey: 'executionTimeMs' | 'nodesExpanded' | 'solutionLength' | 'maxFrontierSize',
    label: string,
    unit: string
  ) => {
    if (!results) return null;

    const data = (['ASTAR', 'BFS', 'GREEDY', 'DFS'] as AlgorithmType[]).map(algo => {
      const res = results[algo];
      const val = res ? res[metricKey] : 0;
      return {
        algo,
        val: typeof val === 'number' ? val : 0,
        status: res?.status ?? 'UNSOLVED',
      };
    });

    const maxVal = Math.max(...data.map(d => d.val), 1);

    return (
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '1rem',
          borderRadius: '10px',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{label}</h4>
          <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#94a3b8' }}>Unit: {unit}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {data.map(({ algo, val, status }) => {
            const percentage = Math.min(100, Math.max(4, (val / maxVal) * 100));
            const isSolved = status === 'SOLVED';

            return (
              <div key={algo} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        ...getAlgorithmBadge(algo),
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '4px',
                      }}
                    >
                      {algo}
                    </span>
                    <span style={{ color: '#cbd5e1' }}>{getAlgorithmFullName(algo)}</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', color: '#ffffff', fontWeight: 700 }}>
                    {isSolved
                      ? metricKey === 'executionTimeMs'
                        ? `${val.toFixed(2)} ms`
                        : val.toLocaleString()
                      : status}
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    background: '#020617',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    border: '1px solid #1e293b',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      borderRadius: '5px',
                      background:
                        algo === 'ASTAR'
                          ? 'linear-gradient(90deg, #0284c7, #38bdf8)'
                          : algo === 'BFS'
                          ? 'linear-gradient(90deg, #2563eb, #6366f1)'
                          : algo === 'GREEDY'
                          ? 'linear-gradient(90deg, #059669, #34d399)'
                          : 'linear-gradient(90deg, #d97706, #fbbf24)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="lab-container">
      {/* Header and Controls */}
      <div className="glass-panel lab-header-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Algorithm Comparison Lab
            </h2>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.5)',
                fontWeight: 700,
              }}
            >
              Benchmark Mode
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Comparing search algorithms against Chamber {level.id}: &ldquo;{level.name}&rdquo; from identical initial states.
          </p>
        </div>

        <div>
          <button
            onClick={handleRunComparison}
            disabled={isRunning}
            className="btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
          >
            {isRunning ? (
              <>
                <Activity style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                <span>Running Benchmark...</span>
              </>
            ) : (
              <>
                <Play style={{ width: '16px', height: '16px', fill: '#ffffff' }} />
                <span>Run Full Comparison</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Table */}
      {results && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div
            style={{
              padding: '0.85rem 1.25rem',
              background: 'rgba(15, 23, 42, 0.95)',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff' }}>
                Observed Performance Metrics
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              High-resolution timer (performance.now())
            </span>
          </div>

          <div className="lab-table-container">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Time (ms)</th>
                  <th style={{ textAlign: 'right' }}>Expanded</th>
                  <th style={{ textAlign: 'right' }}>Generated</th>
                  <th style={{ textAlign: 'right' }}>Moves</th>
                  <th style={{ textAlign: 'right' }}>Pushes</th>
                  <th style={{ textAlign: 'right' }}>Max Frontier</th>
                  <th style={{ textAlign: 'center' }}>Optimal</th>
                  {onApplySolution && <th style={{ textAlign: 'center' }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {(['ASTAR', 'BFS', 'GREEDY', 'DFS'] as AlgorithmType[]).map(algo => {
                  const res = results[algo];
                  const isSolved = res.status === 'SOLVED';

                  return (
                    <tr key={algo}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              ...getAlgorithmBadge(algo),
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                            }}
                          >
                            {algo}
                          </span>
                          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#f8fafc' }}>
                            {getAlgorithmFullName(algo)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            color: isSolved ? '#34d399' : '#fbbf24',
                            background: isSolved ? 'rgba(6, 78, 59, 0.6)' : 'rgba(120, 53, 15, 0.6)',
                            border: `1px solid ${isSolved ? 'rgba(5, 150, 105, 0.7)' : 'rgba(217, 119, 6, 0.7)'}`,
                          }}
                        >
                          {isSolved ? (
                            <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                          ) : (
                            <AlertTriangle style={{ width: '12px', height: '12px' }} />
                          )}
                          {res.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                        {res.executionTimeMs.toFixed(2)}
                      </td>

                      <td style={{ textAlign: 'right', color: '#cbd5e1' }}>
                        {res.nodesExpanded.toLocaleString()}
                      </td>

                      <td style={{ textAlign: 'right', color: '#94a3b8' }}>
                        {res.nodesGenerated.toLocaleString()}
                      </td>

                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#ffffff' }}>
                        {isSolved ? res.solutionLength : '—'}
                      </td>

                      <td style={{ textAlign: 'right', color: '#f59e0b' }}>
                        {isSolved ? res.cratePushes : '—'}
                      </td>

                      <td style={{ textAlign: 'right', color: '#a5b4fc' }}>
                        {res.maxFrontierSize.toLocaleString()}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            background: res.isOptimal ? 'rgba(6, 78, 59, 0.6)' : 'rgba(51, 65, 85, 0.6)',
                            color: res.isOptimal ? '#34d399' : '#94a3b8',
                          }}
                        >
                          {res.isOptimal ? 'Yes (Strict)' : 'No'}
                        </span>
                      </td>

                      {onApplySolution && (
                        <td style={{ textAlign: 'center' }}>
                          {isSolved && (
                            <button
                              onClick={() => onApplySolution(algo, res)}
                              className="btn-secondary"
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.7rem' }}
                            >
                              Load in Game
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Visual Charts Grid */}
      {results && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {renderBarChart('executionTimeMs', 'Execution Time', 'Milliseconds (ms)')}
          {renderBarChart('nodesExpanded', 'Explored / Expanded States', 'Search Nodes')}
          {renderBarChart('solutionLength', 'Solution Length (Moves)', 'Player Steps')}
          {renderBarChart('maxFrontierSize', 'Max Frontier Size (Memory Proxy)', 'Queue/Stack Size')}
        </div>
      )}

      {/* Academic Insights & Theoretical Analysis */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info style={{ width: '18px', height: '18px', color: '#818cf8' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            Algorithmic Behavior &amp; Empirical Observations
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.5' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.4rem' }}>
              A* vs. Breadth-First Search (BFS)
            </h4>
            <p>
              While both BFS and A* guarantee an optimal path under unit step costs, BFS expands in blind spherical contours (O(b^d)). A* uses the admissible bipartite Manhattan matching heuristic to prune irrelevant states, achieving dramatic efficiency gains.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#34d399', fontWeight: 700, marginBottom: '0.4rem' }}>
              Greedy Best-First vs. A* Search
            </h4>
            <p>
              Greedy Best-First prioritizes purely on h(n), discarding accumulated path cost g(n). It rushes directly toward intermediate crate targets, which often leads to sub-optimal detours.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '0.4rem' }}>
              Depth-First Search (DFS) Divergence
            </h4>
            <p>
              DFS explores deep trajectories. Because Sokoban has cyclic paths and deep branch depths, DFS easily spends thousands of steps wandering before finding a non-optimal goal.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
            <h4 style={{ color: '#f43f5e', fontWeight: 700, marginBottom: '0.4rem' }}>
              Deadlock Pruning Efficiency
            </h4>
            <p>
              Sokoban has irreversible transitions. Once a crate enters a non-target corner, it can never be pulled out. Identifying corner deadlocks immediately prunes dead subtrees from the search space.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
