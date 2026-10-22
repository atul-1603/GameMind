import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BarChart3,
  CheckCircle2,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  AlgorithmResult,
  AlgorithmType,
  runAlgorithm,
} from '../algorithms';
import { useGameStore } from '../game/gameState';
import { LEVEL_DEFINITIONS } from '../maze/levelDefinitions';
import { generateMaze } from '../maze/mazeGenerator';
import { MazeGrid } from '../maze/mazeTypes';
import { ComparisonCharts } from './ComparisonCharts';

const ALGO_ORDER: AlgorithmType[] = [
  'ASTAR',
  'BFS',
  'DIJKSTRA',
  'GREEDY_BEST_FIRST',
  'DFS',
];

export const AlgorithmLab: React.FC = () => {
  const { setScreen } = useGameStore();

  const [selectedLevelId, setSelectedLevelId] = useState<number>(3);
  const [useWeighted, setUseWeighted] = useState<boolean>(false);
  const [labMaze, setLabMaze] = useState<MazeGrid>(() => {
    const def = LEVEL_DEFINITIONS.find((l) => l.id === 3)!;
    return generateMaze({
      width: def.width,
      height: def.height,
      seed: 8888,
      loopProbability: def.loopProbability,
      hasWeightedTerrain: false,
    });
  });

  const [benchmarkResults, setBenchmarkResults] = useState<AlgorithmResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedAlgoReplay, setSelectedAlgoReplay] = useState<AlgorithmResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate / regenerate maze when level or weighted setting changes
  const handleRegenerate = (levelId: number, weighted: boolean, newSeed?: boolean) => {
    const def = LEVEL_DEFINITIONS.find((l) => l.id === levelId) || LEVEL_DEFINITIONS[2];
    const seed = newSeed ? Math.floor(Math.random() * 1000000) : 8888 + levelId * 100;
    const newMaze = generateMaze({
      width: def.width,
      height: def.height,
      seed,
      loopProbability: def.loopProbability,
      hasWeightedTerrain: weighted,
    });
    setLabMaze(newMaze);
    setBenchmarkResults([]);
    setSelectedAlgoReplay(null);
  };

  // Run benchmark across all 5 algorithms sequentially
  const runFullBenchmark = () => {
    setIsRunning(true);
    setBenchmarkResults([]);

    setTimeout(() => {
      const results: AlgorithmResult[] = [];
      for (const algo of ALGO_ORDER) {
        // Run fresh instance on exact same maze and start/exit
        const res = runAlgorithm(algo, labMaze, labMaze.start, labMaze.exit);
        results.push(res);
      }
      setBenchmarkResults(results);
      setSelectedAlgoReplay(results[0]);
      setIsRunning(false);
    }, 50);
  };

  // Auto-run benchmark on first load
  useEffect(() => {
    runFullBenchmark();
  }, [labMaze]);

  // Render canvas replay of selected algorithm's path and exploration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !labMaze) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cellW = w / labMaze.width;
    const cellH = h / labMaze.height;

    // Draw Maze Grid
    for (let y = 0; y < labMaze.height; y++) {
      for (let x = 0; x < labMaze.width; x++) {
        const cell = labMaze.cells[y][x];
        if (cell.type === 'WALL') {
          ctx.fillStyle = '#0f172a';
        } else if (cell.type === 'DIFFICULT') {
          ctx.fillStyle = '#78350f';
        } else if (cell.type === 'HAZARDOUS') {
          ctx.fillStyle = '#831843';
        } else {
          ctx.fillStyle = '#020617';
        }
        ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
      }
    }

    // Draw Explored Nodes of selected algorithm
    if (selectedAlgoReplay) {
      for (const step of selectedAlgoReplay.explorationSteps) {
        if (step.type === 'NODE_EXPAND') {
          ctx.fillStyle = 'rgba(0, 163, 255, 0.35)';
          ctx.fillRect(step.cell.x * cellW, step.cell.y * cellH, cellW, cellH);
        }
      }

      // Draw Solution Path
      if (selectedAlgoReplay.path.length > 0) {
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = Math.max(2, cellW * 0.35);
        ctx.beginPath();
        selectedAlgoReplay.path.forEach((p, idx) => {
          const px = (p.x + 0.5) * cellW;
          const py = (p.y + 0.5) * cellH;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
    }

    // Start & Exit markers
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(
      labMaze.start.x * cellW + cellW * 0.2,
      labMaze.start.y * cellH + cellH * 0.2,
      cellW * 0.6,
      cellH * 0.6
    );

    ctx.fillStyle = '#bf00ff';
    ctx.beginPath();
    ctx.arc(
      (labMaze.exit.x + 0.5) * cellW,
      (labMaze.exit.y + 0.5) * cellH,
      cellW * 0.4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [labMaze, selectedAlgoReplay]);

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Navbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('MAIN_MENU')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Main Menu
          </button>
          <div className="h-5 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-wide">
              Algorithm Lab — Empirical Performance Benchmarking
            </h1>
          </div>
        </div>

        {/* Level & Controls */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {LEVEL_DEFINITIONS.map((def) => (
              <button
                key={def.id}
                onClick={() => {
                  setSelectedLevelId(def.id);
                  handleRegenerate(def.id, useWeighted, false);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedLevelId === def.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Lvl {def.id}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <input
              type="checkbox"
              checked={useWeighted}
              onChange={(e) => {
                setUseWeighted(e.target.checked);
                handleRegenerate(selectedLevelId, e.target.checked, false);
              }}
              className="accent-cyan-400"
            />
            <span className="text-slate-300">Weighted Terrain (Mud/Hazards)</span>
          </label>

          <button
            onClick={() => handleRegenerate(selectedLevelId, useWeighted, true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New Layout
          </button>

          <button
            onClick={runFullBenchmark}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            {isRunning ? 'Benchmarking...' : 'Run Benchmark'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Results Table & Mini Visualizer Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparison Table (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <h2 className="font-bold text-sm text-cyan-300 tracking-wide uppercase font-mono">
                    Benchmarking Telemetry Matrix
                  </h2>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Maze Size: {labMaze.width}x{labMaze.height} • Seed: {labMaze.seed}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="pb-2.5 font-semibold">Algorithm</th>
                      <th className="pb-2.5 font-semibold">Status</th>
                      <th className="pb-2.5 font-semibold text-right">Time (ms)</th>
                      <th className="pb-2.5 font-semibold text-right">Expanded</th>
                      <th className="pb-2.5 font-semibold text-right">Generated</th>
                      <th className="pb-2.5 font-semibold text-right">Path Steps</th>
                      <th className="pb-2.5 font-semibold text-right">Total Cost</th>
                      <th className="pb-2.5 font-semibold text-right">Max Frontier</th>
                      <th className="pb-2.5 font-semibold text-center">Optimality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {benchmarkResults.map((r) => {
                      const isSelected = selectedAlgoReplay?.algorithm === r.algorithm;
                      return (
                        <tr
                          key={r.algorithm}
                          onClick={() => setSelectedAlgoReplay(r)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-cyan-950/50 text-white font-bold'
                              : 'hover:bg-slate-800/40 text-slate-300'
                          }`}
                        >
                          <td className="py-2.5 font-semibold flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor:
                                  r.algorithm === 'ASTAR'
                                    ? '#00f0ff'
                                    : r.algorithm === 'BFS'
                                    ? '#3b82f6'
                                    : r.algorithm === 'DIJKSTRA'
                                    ? '#a855f7'
                                    : r.algorithm === 'GREEDY_BEST_FIRST'
                                    ? '#f59e0b'
                                    : '#ef4444',
                              }}
                            />
                            {r.algorithm}
                          </td>
                          <td className="py-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              {r.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right text-amber-400 font-bold">
                            {r.executionTimeMs.toFixed(2)}
                          </td>
                          <td className="py-2.5 text-right text-cyan-400">
                            {r.expandedCount}
                          </td>
                          <td className="py-2.5 text-right text-slate-400">
                            {r.generatedCount}
                          </td>
                          <td className="py-2.5 text-right text-emerald-400 font-bold">
                            {r.pathLength}
                          </td>
                          <td className="py-2.5 text-right text-violet-400 font-bold">
                            {r.totalCost}
                          </td>
                          <td className="py-2.5 text-right text-slate-400">
                            {r.maxFrontierSize}
                          </td>
                          <td className="py-2.5 text-center">
                            {r.isOptimal ? (
                              <span className="text-emerald-400 font-bold">✓ Optimal</span>
                            ) : (
                              <span className="text-amber-400 font-medium">Suboptimal</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>* Click any row above to inspect its exploration map on the right.</span>
              <span className="text-slate-500">
                Frontier size indicates memory complexity proxy.
              </span>
            </div>
          </div>

          {/* Right: Interactive 2D Search Replay Map */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between mb-3">
              <div className="text-xs font-mono font-bold text-cyan-400 uppercase">
                {selectedAlgoReplay ? `${selectedAlgoReplay.algorithm} Path & Coverage` : 'Visual Inspection'}
              </div>
              {selectedAlgoReplay && (
                <div className="text-[10px] font-mono text-emerald-400">
                  {selectedAlgoReplay.pathLength} steps • {selectedAlgoReplay.expandedCount} visited
                </div>
              )}
            </div>

            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="rounded-xl bg-black border border-slate-800 shadow-inner max-w-full"
            />

            <div className="w-full mt-3 text-[10px] text-slate-400 flex justify-between items-center px-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500/80 rounded-sm inline-block" /> Explored
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-sm inline-block" /> Path
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-sm inline-block" /> Start
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-fuchsia-500 rounded-sm inline-block" /> Exit
              </span>
            </div>
          </div>
        </div>

        {/* Comparative Graphical Bar Charts */}
        <ComparisonCharts results={benchmarkResults} />

        {/* DAA Algorithmic Insights & Analysis */}
        <div className="p-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-cyan-300 font-mono uppercase tracking-wider">
              Empirical DAA Comparative Insights
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
              <div className="font-bold text-cyan-400 font-mono">A* vs BFS & Dijkstra</div>
              <p>
                In unweighted mazes, BFS, Dijkstra, and A* all discover an optimal
                shortest path. However, while Dijkstra and BFS blindly radiate outwards
                in all directions, A* uses the Manhattan distance heuristic{' '}
                <span className="text-amber-300 font-mono">h(n)</span> to orient the
                search frontier towards the exit, typically expanding 40%–70% fewer
                nodes.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
              <div className="font-bold text-amber-400 font-mono">Greedy Best-First Pitfalls</div>
              <p>
                Greedy Best-First orders its priority queue purely by{' '}
                <span className="text-amber-300 font-mono">h(n)</span>. While very fast in
                open corridors, it can be misled into deep cul-de-sacs that aim directly
                at the exit coordinate, resulting in suboptimal solution paths with unnecessary
                detours.
              </p>
            </div>

            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
              <div className="font-bold text-red-400 font-mono">DFS Path Length Anomaly</div>
              <p>
                Because DFS plunges down the first available branch using a LIFO stack,
                it does not guarantee an optimal path. In mazes with loops and multiple
                corridors, DFS often snakes across the entire labyrinth, generating paths
                2x to 5x longer than BFS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
