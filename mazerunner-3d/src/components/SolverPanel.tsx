import React, { useEffect } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FastForward,
  Info,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { ALGORITHM_DETAILS, AlgorithmType } from '../algorithms';
import { useGameStore } from '../game/gameState';

const ALGORITHMS: { type: AlgorithmType; label: string; tag: string }[] = [
  { type: 'ASTAR', label: 'A* Search', tag: 'Optimal & Guided' },
  { type: 'BFS', label: 'Breadth-First (BFS)', tag: 'Optimal Unweighted' },
  { type: 'DIJKSTRA', label: 'Dijkstra', tag: 'Optimal Weighted' },
  { type: 'GREEDY_BEST_FIRST', label: 'Greedy Best-First', tag: 'Fast Heuristic' },
  { type: 'DFS', label: 'Depth-First (DFS)', tag: 'Non-Optimal Stack' },
];

export const SolverPanel: React.FC = () => {
  const {
    aiSolver,
    closeAISolver,
    setSelectedAlgorithm,
    solveMazeWithAI,
    stepVisualization,
    setPlayingVisualization,
    setPlaybackSpeed,
    toggleShowExploration,
    toggleShowFinalRoute,
    executeAISolution,
    stopAIExecution,
    resetAISolver,
  } = useGameStore();

  const details = ALGORITHM_DETAILS[aiSolver.selectedAlgorithm];

  // Visualizer timer loop
  useEffect(() => {
    if (!aiSolver.isPlayingVisualization || !aiSolver.result) return;

    const totalSteps = aiSolver.result.explorationSteps.length;
    if (aiSolver.currentStepIndex >= totalSteps) {
      setPlayingVisualization(false);
      return;
    }

    // Interval based on speed
    const stepDelta = Math.max(1, Math.floor(aiSolver.playbackSpeed / 2));
    const delay = Math.max(16, Math.floor(250 / aiSolver.playbackSpeed));

    const timer = setInterval(() => {
      const state = useGameStore.getState().aiSolver;
      if (state.currentStepIndex + stepDelta >= totalSteps) {
        stepVisualization(totalSteps - state.currentStepIndex);
        setPlayingVisualization(false);
      } else {
        stepVisualization(stepDelta);
      }
    }, delay);

    return () => clearInterval(timer);
  }, [
    aiSolver.isPlayingVisualization,
    aiSolver.currentStepIndex,
    aiSolver.playbackSpeed,
    aiSolver.result,
    stepVisualization,
    setPlayingVisualization,
  ]);

  if (!aiSolver.isOpen) return null;

  return (
    <div className="absolute top-20 right-6 w-96 max-h-[85vh] bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col z-40 text-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-sm tracking-wide text-cyan-300">
            Algorithmic Solver & Visualizer
          </h2>
        </div>
        <button
          onClick={closeAISolver}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Algorithm Selection */}
        <div>
          <label className="block text-[11px] font-mono text-cyan-400/90 uppercase mb-1.5 font-semibold">
            Select Algorithm
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {ALGORITHMS.map((algo) => (
              <button
                key={algo.type}
                onClick={() => setSelectedAlgorithm(algo.type)}
                className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                  aiSolver.selectedAlgorithm === algo.type
                    ? 'bg-cyan-950/60 border-cyan-400/80 text-white shadow-md shadow-cyan-950/40'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold">{algo.label}</div>
                  <div className="text-[10px] text-cyan-400/70">{algo.tag}</div>
                </div>
                {aiSolver.selectedAlgorithm === algo.type && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm Quick Info */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-slate-300 space-y-1">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Structure:</span>
            <span className="font-mono text-cyan-300">{details.dataStructure}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Time Complexity:</span>
            <span className="font-mono text-amber-300">{details.timeComplexity}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Space Complexity:</span>
            <span className="font-mono text-amber-300">{details.spaceComplexity}</span>
          </div>
        </div>

        {/* Action Button: Solve Maze */}
        <div className="flex gap-2">
          <button
            onClick={solveMazeWithAI}
            className="flex-1 py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-current" />
            Compute Path from Player
          </button>
          {aiSolver.result && (
            <button
              onClick={resetAISolver}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 transition-colors"
              title="Reset Search"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Metrics Dashboard */}
        {aiSolver.result && (
          <div className="space-y-3 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Performance Telemetry
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  aiSolver.result.status === 'FOUND'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {aiSolver.result.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Execution Time</div>
                <div className="font-mono text-sm font-bold text-amber-400">
                  {aiSolver.result.executionTimeMs.toFixed(2)} ms
                </div>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Expanded Nodes</div>
                <div className="font-mono text-sm font-bold text-cyan-400">
                  {aiSolver.result.expandedCount}
                </div>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Path Length (steps)</div>
                <div className="font-mono text-sm font-bold text-emerald-400">
                  {aiSolver.result.pathLength}
                </div>
              </div>
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[10px]">Total Traversal Cost</div>
                <div className="font-mono text-sm font-bold text-violet-400">
                  {aiSolver.result.totalCost}
                </div>
              </div>
            </div>

            {/* Stepper & Playback Controls */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Exploration Step:</span>
                <span className="font-mono text-cyan-400">
                  {aiSolver.currentStepIndex} / {aiSolver.result.explorationSteps.length}
                </span>
              </div>

              {/* Progress Slider */}
              <input
                type="range"
                min={0}
                max={aiSolver.result.explorationSteps.length}
                value={aiSolver.currentStepIndex}
                onChange={(e) => {
                  const target = parseInt(e.target.value, 10);
                  stepVisualization(target - aiSolver.currentStepIndex);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="flex items-center justify-between gap-1.5">
                <button
                  onClick={() => stepVisualization(-1)}
                  disabled={aiSolver.currentStepIndex <= 0}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPlayingVisualization(!aiSolver.isPlayingVisualization)}
                  className="flex-1 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold text-white flex items-center justify-center gap-1.5 shadow"
                >
                  {aiSolver.isPlayingVisualization ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" /> Play Search
                    </>
                  )}
                </button>

                <button
                  onClick={() => stepVisualization(1)}
                  disabled={aiSolver.currentStepIndex >= aiSolver.result.explorationSteps.length}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Preset Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <FastForward className="w-3 h-3" /> Speed:
                </span>
                <div className="flex gap-1">
                  {[1, 5, 15, 40].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        aiSolver.playbackSpeed === s
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Execute Route in 3D */}
            <div className="pt-1">
              {aiSolver.isExecutingPath ? (
                <button
                  onClick={stopAIExecution}
                  className="w-full py-2.5 px-3 bg-red-600/90 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  <Pause className="w-4 h-4 fill-current" /> Stop AI Execution
                </button>
              ) : (
                <button
                  onClick={executeAISolution}
                  disabled={aiSolver.result.path.length === 0}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Execute Route in 3D
                </button>
              )}
            </div>

            {/* Visual Toggles */}
            <div className="flex gap-2">
              <button
                onClick={toggleShowExploration}
                className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] flex items-center justify-center gap-1.5 transition-colors ${
                  aiSolver.showExploration
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {aiSolver.showExploration ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                Explored Cells
              </button>
              <button
                onClick={toggleShowFinalRoute}
                className={`flex-1 py-1.5 px-2 rounded-lg border text-[10px] flex items-center justify-center gap-1.5 transition-colors ${
                  aiSolver.showFinalRoute
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {aiSolver.showFinalRoute ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                Final Route
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[10px] space-y-1.5 text-slate-400">
          <div className="font-semibold text-slate-300 flex items-center gap-1">
            <Info className="w-3 h-3 text-cyan-400" /> Map Legend
          </div>
          <div className="grid grid-cols-2 gap-y-1 gap-x-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
              <span>Explored / Visited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
              <span>Current Frontier</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />
              <span>Final Solution Route</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 inline-block" />
              <span>Exit Portal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
