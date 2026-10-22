import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Edit3,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { executeSearch } from '../algorithms/searchRunner';
import { SearchStats, VizNode } from '../algorithms/searchTypes';
import { cloneBoard, createEmptyBoard, isValidMove } from '../game/board';
import { BoardState, CellValue, COLS, PlayerId, ROWS } from '../game/gameTypes';
import { ComparisonCharts } from './ComparisonCharts';
import { SearchTreeVisualization } from './SearchTreeVisualization';

// Curated Educational DAA Board Presets
const PRESETS: Record<string, { name: string; desc: string; setup: () => BoardState }> = {
  empty: {
    name: 'Empty Board (Opening)',
    desc: 'Unconstrained 42-cell tree search demonstrating maximum branching factor.',
    setup: () => createEmptyBoard(),
  },
  midgame: {
    name: 'Mid-Game Center Battle',
    desc: 'Developing lines around columns 2, 3, and 4 with tactical tension.',
    setup: () => {
      const b = createEmptyBoard();
      b[5][3] = 1;
      b[5][2] = 2;
      b[4][3] = 1;
      b[5][4] = 2;
      b[4][2] = 1;
      b[5][1] = 2;
      return b;
    },
  },
  immediateWin: {
    name: 'Immediate Win Puzzle',
    desc: 'Player 1 has 3 connected horizontally (cols 0, 1, 2) and can win in col 3.',
    setup: () => {
      const b = createEmptyBoard();
      b[5][0] = 1;
      b[5][1] = 1;
      b[5][2] = 1;
      b[5][4] = 2;
      b[5][5] = 2;
      return b;
    },
  },
  defensiveBlock: {
    name: 'Defensive Block Puzzle',
    desc: 'Opponent (Player 2) has 3 in a row vertically in column 4; AI must block immediately.',
    setup: () => {
      const b = createEmptyBoard();
      b[5][4] = 2;
      b[4][4] = 2;
      b[3][4] = 2;
      b[5][2] = 1;
      b[5][3] = 1;
      return b;
    },
  },
  tacticalFork: {
    name: 'Tactical Fork (Double Threat)',
    desc: 'Setting up simultaneous threats that guarantee victory on subsequent plies.',
    setup: () => {
      const b = createEmptyBoard();
      b[5][1] = 1;
      b[5][2] = 1;
      b[5][5] = 2;
      b[4][2] = 1;
      b[4][3] = 2;
      return b;
    },
  },
};

export const AlgorithmLab: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(PRESETS.midgame.setup());
  const [selectedPreset, setSelectedPreset] = useState<string>('midgame');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [aiPlayer, setAiPlayer] = useState<PlayerId>(1);
  const [searchDepth, setSearchDepth] = useState<number>(4);
  const [useMoveOrdering, setUseMoveOrdering] = useState<boolean>(true);
  const [useTransposition, setUseTransposition] = useState<boolean>(true);

  const [minimaxStats, setMinimaxStats] = useState<SearchStats | null>(null);
  const [alphaBetaStats, setAlphaBetaStats] = useState<SearchStats | null>(null);
  const [vizTree, setVizTree] = useState<VizNode | null>(null);
  const [vizAlgorithm, setVizAlgorithm] = useState<string>('Alpha-Beta');

  const [isRunningMinimax, setIsRunningMinimax] = useState<boolean>(false);
  const [isRunningAlphaBeta, setIsRunningAlphaBeta] = useState<boolean>(false);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    setIsEditing(false);
    setBoard(PRESETS[key].setup());
    setMinimaxStats(null);
    setAlphaBetaStats(null);
    setVizTree(null);
    setLastExplanation(null);
  };

  const handleCellClickEdit = (r: number, c: number) => {
    if (!isEditing) return;
    const nextVal: CellValue =
      board[r][c] === 0 ? 1 : board[r][c] === 1 ? 2 : 0;
    const newB = cloneBoard(board);
    newB[r][c] = nextVal;
    setBoard(newB);
  };

  const handleRunMinimax = async () => {
    setIsRunningMinimax(true);
    try {
      const { result, explanation } = await executeSearch(
        board,
        aiPlayer,
        'minimax',
        {
          depth: searchDepth,
          useMoveOrdering,
          collectEvents: true,
        }
      );
      setMinimaxStats(result.stats);
      setLastExplanation(explanation);
      if (result.vizTree) {
        setVizTree(result.vizTree);
        setVizAlgorithm('Pure Minimax');
      }
    } finally {
      setIsRunningMinimax(false);
    }
  };

  const handleRunAlphaBeta = async () => {
    setIsRunningAlphaBeta(true);
    try {
      const { result, explanation } = await executeSearch(
        board,
        aiPlayer,
        'alphabeta',
        {
          depth: searchDepth,
          useMoveOrdering,
          useTransposition,
          collectEvents: true,
        }
      );
      setAlphaBetaStats(result.stats);
      setLastExplanation(explanation);
      if (result.vizTree) {
        setVizTree(result.vizTree);
        setVizAlgorithm('Alpha-Beta Pruning');
      }
    } finally {
      setIsRunningAlphaBeta(false);
    }
  };

  const handleCompareBoth = async () => {
    setIsRunningMinimax(true);
    setIsRunningAlphaBeta(true);
    try {
      // Run Minimax first
      const mm = await executeSearch(board, aiPlayer, 'minimax', {
        depth: searchDepth,
        useMoveOrdering,
        collectEvents: false,
      });
      setMinimaxStats(mm.result.stats);

      // Run Alpha-Beta next on identical position & depth
      const ab = await executeSearch(board, aiPlayer, 'alphabeta', {
        depth: searchDepth,
        useMoveOrdering,
        useTransposition,
        collectEvents: true,
      });
      setAlphaBetaStats(ab.result.stats);
      setLastExplanation(ab.explanation);
      if (ab.result.vizTree) {
        setVizTree(ab.result.vizTree);
        setVizAlgorithm('Alpha-Beta Pruning');
      }
    } finally {
      setIsRunningMinimax(false);
      setIsRunningAlphaBeta(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto py-2">
      {/* Hero Header */}
      <div className="glass-panel p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-indigo-500">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-heading font-extrabold text-white">
              Algorithm Lab: Empirical Game-Tree Benchmarking
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Directly test and contrast <strong>Minimax</strong> and{' '}
            <strong>Alpha-Beta Pruning</strong> on identical board states. Measure
            nodes visited, cutoffs, effective branching factor, and search execution time.
          </p>
        </div>

        <button
          onClick={handleCompareBoth}
          disabled={isRunningMinimax || isRunningAlphaBeta}
          className="btn-primary py-2.5 px-5 text-sm shadow-indigo-600/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>Compare Both Algorithms</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Positions & Board View */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Preset Selector */}
          <div className="glass-panel p-4 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Select Test Board Position
            </span>

            <div className="flex flex-col gap-1.5">
              {Object.entries(PRESETS).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`p-2.5 rounded-xl text-left transition-all border ${
                    selectedPreset === key && !isEditing
                      ? 'bg-blue-600/20 border-blue-500/50 text-white'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.desc}
                  </div>
                </button>
              ))}

              {/* Custom Editor Button */}
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setSelectedPreset('');
                }}
                className={`p-2.5 rounded-xl text-left transition-all border flex items-center justify-between ${
                  isEditing
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Interactive Custom Board Editor</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Click slots directly to place Red or Yellow discs.
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {isEditing ? 'Editing Active' : 'Toggle'}
                </span>
              </button>
            </div>
          </div>

          {/* Mini Board Visualization */}
          <div className="glass-panel p-4 flex flex-col items-center gap-3">
            <div className="flex items-center justify-between w-full text-xs text-slate-400">
              <span>Position Preview (6×7)</span>
              {isEditing && (
                <span className="text-amber-400 font-mono text-[11px]">
                  Click cells to cycle: Empty → Red → Yellow
                </span>
              )}
            </div>

            <div className="p-3 bg-blue-950/40 rounded-2xl border-2 border-blue-900/80 shadow-inner">
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: ROWS }).map((_, r) =>
                  Array.from({ length: COLS }).map((_, c) => {
                    const val = board[r][c];
                    return (
                      <div
                        key={`lab-cell-${r}-${c}`}
                        onClick={() => handleCellClickEdit(r, c)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                          isEditing ? 'cursor-pointer hover:ring-2 hover:ring-white' : ''
                        } ${
                          val === 1
                            ? 'bg-red-500 shadow-md shadow-red-500/40'
                            : val === 2
                            ? 'bg-yellow-400 shadow-md shadow-yellow-500/40'
                            : 'bg-slate-900 border border-slate-800'
                        }`}
                      >
                        {val === 1 && (
                          <span className="text-[10px] text-white font-bold">×</span>
                        )}
                        {val === 2 && (
                          <div className="w-2 h-2 rounded-full border border-white" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column Indices */}
            <div className="grid grid-cols-7 gap-1.5 w-full text-center text-[10px] font-mono text-slate-500">
              {Array.from({ length: COLS }).map((_, c) => (
                <span key={`col-idx-${c}`}>C{c + 1}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Search Parameters & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel p-5 flex flex-col gap-5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              2. Search Parameters & Controls
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Depth Selector Slider */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Search Depth (d)</span>
                  <span className="font-mono text-sky-400 font-bold text-sm">
                    {searchDepth} plies
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={searchDepth}
                  onChange={(e) => setSearchDepth(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>d=1 (Instant)</span>
                  <span>d=4 (Tactical)</span>
                  <span>d=7 (Deep Vision)</span>
                </div>
              </div>

              {/* AI Perspective Picker */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-2">
                <span className="text-xs text-slate-300 font-semibold">
                  Maximizing AI Player Perspective
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setAiPlayer(1)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                      aiPlayer === 1
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    <span>Player 1 (Red)</span>
                  </button>

                  <button
                    onClick={() => setAiPlayer(2)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                      aiPlayer === 2
                        ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                    <span>Player 2 (Yellow)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Algorithmic Optimization Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900/80">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Move Ordering (Center First)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Examines columns [3, 2, 4, 1, 5, 0, 6]
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={useMoveOrdering}
                  onChange={(e) => setUseMoveOrdering(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:bg-slate-900/80">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Transposition Table Cache
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Memoizes identical states with bounds
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={useTransposition}
                  onChange={(e) => setUseTransposition(e.target.checked)}
                  className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Launch Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleRunMinimax}
                disabled={isRunningMinimax || isRunningAlphaBeta}
                className="btn-secondary py-2.5 px-4 text-xs font-semibold flex-1 justify-center"
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Run Minimax (d={searchDepth})</span>
              </button>

              <button
                onClick={handleRunAlphaBeta}
                disabled={isRunningMinimax || isRunningAlphaBeta}
                className="btn-primary py-2.5 px-4 text-xs font-semibold flex-1 justify-center"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Run Alpha-Beta (d={searchDepth})</span>
              </button>
            </div>
          </div>

          {/* Empirical Explanation Banner */}
          {lastExplanation && (
            <div className="glass-panel p-3.5 bg-sky-950/30 border border-sky-500/30 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-sky-300 block">
                  AI Tactical Decision Rationale:
                </span>
                <p className="text-xs text-slate-200 mt-0.5 font-sans leading-relaxed">
                  {lastExplanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Metrics Table */}
      {(minimaxStats || alphaBetaStats) && (
        <div className="glass-panel p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <span>Comparative Benchmarking Matrix</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Depth = {searchDepth} · Perspective: Player {aiPlayer}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Chosen Column</th>
                  <th className="py-2.5 px-3">Optimal Score</th>
                  <th className="py-2.5 px-3">Nodes Visited</th>
                  <th className="py-2.5 px-3">Terminal Leaves</th>
                  <th className="py-2.5 px-3">Pruned Branches</th>
                  <th className="py-2.5 px-3">Branching Factor (b*)</th>
                  <th className="py-2.5 px-3">Execution Time</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {minimaxStats && (
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-sans font-semibold text-indigo-400 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      Pure Minimax
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      Column {minimaxStats.bestMove + 1}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-300">
                      {minimaxStats.optimalScore > 90000
                        ? '+WIN'
                        : minimaxStats.optimalScore < -90000
                        ? '-LOSS'
                        : minimaxStats.optimalScore}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-200">
                      {minimaxStats.nodesVisited.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {minimaxStats.terminalEvaluated.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-500">0 (No Pruning)</td>
                    <td className="py-3 px-3 text-slate-300">
                      {minimaxStats.effectiveBranchingFactor}
                    </td>
                    <td className="py-3 px-3 text-indigo-300">
                      {minimaxStats.executionTimeMs} ms
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        Completed
                      </span>
                    </td>
                  </tr>
                )}

                {alphaBetaStats && (
                  <tr className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-sans font-semibold text-emerald-400 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      Alpha-Beta Pruning
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      Column {alphaBetaStats.bestMove + 1}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-300">
                      {alphaBetaStats.optimalScore > 90000
                        ? '+WIN'
                        : alphaBetaStats.optimalScore < -90000
                        ? '-LOSS'
                        : alphaBetaStats.optimalScore}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-300">
                      {alphaBetaStats.nodesVisited.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {alphaBetaStats.terminalEvaluated.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-400">
                      {alphaBetaStats.prunedBranches.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {alphaBetaStats.effectiveBranchingFactor}
                    </td>
                    <td className="py-3 px-3 text-emerald-300 font-bold">
                      {alphaBetaStats.executionTimeMs} ms
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        Completed
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparative Charts */}
      <ComparisonCharts
        minimaxStats={minimaxStats}
        alphaBetaStats={alphaBetaStats}
      />

      {/* Interactive Search Tree Visualizer */}
      <SearchTreeVisualization
        rootNode={vizTree}
        algorithmName={vizAlgorithm}
        depth={searchDepth}
      />
    </div>
  );
};
