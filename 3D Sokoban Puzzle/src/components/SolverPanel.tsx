import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AlgorithmType, SolverResult } from '../types/solver';

interface SolverPanelProps {
  selectedAlgorithm: AlgorithmType;
  onChangeAlgorithm: (algo: AlgorithmType) => void;
  onSolve: () => void;
  solverResult: SolverResult | null;
  isSolving: boolean;
  isPlaying: boolean;
  currentStepIndex: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onStepNext: () => void;
  onResetPlayback: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const SolverPanel: React.FC<SolverPanelProps> = ({
  selectedAlgorithm,
  onChangeAlgorithm,
  onSolve,
  solverResult,
  isSolving,
  isPlaying,
  currentStepIndex,
  totalSteps,
  onPlay,
  onPause,
  onStepNext,
  onResetPlayback,
  playbackSpeed,
  onChangeSpeed,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="solver-bottom-right">
      <div className="glass-panel-glow" style={{ overflow: 'hidden' }}>
        {/* Panel Header */}
        <div className="solver-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
              AI Solver Assistant
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="btn-icon"
            style={{ width: '28px', height: '28px', background: 'transparent', border: 'none' }}
            title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
          >
            {isCollapsed ? (
              <ChevronUp style={{ width: '16px', height: '16px' }} />
            ) : (
              <ChevronDown style={{ width: '16px', height: '16px' }} />
            )}
          </button>
        </div>

        {/* Panel Body */}
        {!isCollapsed && (
          <div className="solver-body">
            {/* Algorithm Selector & Solve Trigger */}
            <div className="solver-input-row">
              <select
                value={selectedAlgorithm}
                onChange={e => onChangeAlgorithm(e.target.value as AlgorithmType)}
                disabled={isPlaying || isSolving}
                className="solver-select"
              >
                <option value="ASTAR">A* Search (Optimal &amp; Heuristic)</option>
                <option value="BFS">Breadth-First Search (Shortest Path)</option>
                <option value="GREEDY">Greedy Best-First (Fast Heuristic)</option>
                <option value="DFS">Depth-First Search (Deep Branching)</option>
              </select>

              <button
                onClick={onSolve}
                disabled={isSolving || isPlaying}
                className="btn-primary"
                style={{ padding: '0.45rem 0.85rem', whiteSpace: 'nowrap' }}
              >
                <Sparkles style={{ width: '14px', height: '14px' }} />
                <span>{isSolving ? 'Solving...' : 'Solve'}</span>
              </button>
            </div>

            {/* Results & Metrics */}
            {solverResult && (
              <div className="solver-results-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {solverResult.status === 'SOLVED' ? (
                      <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
                    ) : (
                      <AlertCircle style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                    )}
                    <span
                      style={{
                        fontWeight: 700,
                        color: solverResult.status === 'SOLVED' ? '#34d399' : '#fbbf24',
                        fontSize: '0.75rem',
                      }}
                    >
                      {solverResult.status}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: '#38bdf8',
                    }}
                  >
                    <Clock style={{ width: '12px', height: '12px' }} />
                    <span>{solverResult.executionTimeMs.toFixed(2)} ms</span>
                  </div>
                </div>

                {/* Metrics Breakdown */}
                {solverResult.status === 'SOLVED' && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.4rem',
                      paddingTop: '0.4rem',
                      borderTop: '1px solid #334155',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                    }}
                  >
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.3rem', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Moves</div>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{solverResult.solutionLength}</div>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.3rem', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Pushes</div>
                      <div style={{ fontWeight: 700, color: '#f59e0b' }}>{solverResult.cratePushes}</div>
                    </div>
                    <div style={{ background: 'rgba(2, 6, 23, 0.6)', padding: '0.3rem', borderRadius: '4px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Expanded</div>
                      <div style={{ fontWeight: 700, color: '#a5b4fc' }}>{solverResult.nodesExpanded}</div>
                    </div>
                  </div>
                )}

                {solverResult.notes && (
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.2rem' }}>
                    {solverResult.notes}
                  </div>
                )}
              </div>
            )}

            {/* Playback Controls (if solution exists) */}
            {solverResult && solverResult.status === 'SOLVED' && totalSteps > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(51, 65, 85, 0.7)',
                }}
              >
                {/* Progress bar */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      color: '#94a3b8',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <span>Solution Step</span>
                    <span>
                      {currentStepIndex} / {totalSteps}
                    </span>
                  </div>
                  <div className="solver-progress-bar-bg">
                    <div
                      className="solver-progress-bar-fill"
                      style={{
                        width: `${(currentStepIndex / totalSteps) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Control Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {isPlaying ? (
                    <button
                      onClick={onPause}
                      className="btn-secondary"
                      style={{ flex: 1, color: '#fcd34d' }}
                    >
                      <Pause style={{ width: '14px', height: '14px' }} /> Pause
                    </button>
                  ) : (
                    <button
                      onClick={onPlay}
                      disabled={currentStepIndex >= totalSteps}
                      className="btn-primary"
                      style={{ flex: 1 }}
                    >
                      <Play style={{ width: '14px', height: '14px' }} /> Play Solution
                    </button>
                  )}

                  <button
                    onClick={onStepNext}
                    disabled={isPlaying || currentStepIndex >= totalSteps}
                    className="btn-secondary"
                    title="Next Step"
                  >
                    <SkipForward style={{ width: '14px', height: '14px' }} /> Step
                  </button>

                  <button
                    onClick={onResetPlayback}
                    className="btn-icon"
                    style={{ width: '32px', height: '32px' }}
                    title="Reset to beginning of solution"
                  >
                    <RotateCcw style={{ width: '14px', height: '14px' }} />
                  </button>

                  {/* Playback Speed selector */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      background: '#0f172a',
                      padding: '0.2rem 0.35rem',
                      borderRadius: '6px',
                      border: '1px solid #334155',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                    }}
                  >
                    {[1, 2, 4].map(s => (
                      <button
                        key={s}
                        onClick={() => onChangeSpeed(s)}
                        style={{
                          background: playbackSpeed === s ? '#38bdf8' : 'transparent',
                          color: playbackSpeed === s ? '#0f172a' : '#94a3b8',
                          fontWeight: playbackSpeed === s ? 700 : 400,
                          padding: '0.15rem 0.35rem',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
