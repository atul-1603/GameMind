import React from 'react';
import {
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  HelpCircle,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Undo2,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { AIDifficulty, AIAlgorithm, GameMode, PlayerId } from '../game/gameTypes';
import { useGameStore } from '../hooks/useGame';

export const GameHUD: React.FC = () => {
  const {
    gameMode,
    setGameMode,
    currentPlayer,
    status,
    isAIThinking,
    humanPlayer,
    setHumanPlayer,
    aiDifficulty,
    setAIDifficulty,
    aiAlgorithm,
    setAIAlgorithm,
    moveCount,
    moves,
    lastAISearchStats,
    lastMoveExplanation,
    startNewGame,
    undo,
    requestAIHint,
    agent1,
    agent2,
    setAgent1,
    setAgent2,
    isEvERunning,
    setEvERunning,
    stepEvE,
    evESpeed,
    setEvESpeed,
  } = useGameStore();

  const isHumanTurn =
    gameMode === 'pvp' || (gameMode === 'pve' && currentPlayer === humanPlayer);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Mode Switcher */}
      <div className="glass-panel p-1.5 flex items-center justify-between gap-1">
        <button
          onClick={() => setGameMode('pve')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            gameMode === 'pve'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Player vs AI</span>
        </button>

        <button
          onClick={() => setGameMode('pvp')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            gameMode === 'pvp'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Local 2P</span>
        </button>

        <button
          onClick={() => setGameMode('eve')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            gameMode === 'eve'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>AI vs AI</span>
        </button>
      </div>

      {/* Turn Banner */}
      <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-sky-500">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform ${
              currentPlayer === 1
                ? 'bg-gradient-to-tr from-red-600 to-red-400 shadow-red-500/30 ring-2 ring-red-400/50'
                : 'bg-gradient-to-tr from-yellow-500 to-amber-300 shadow-yellow-500/30 ring-2 ring-yellow-400/50'
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white/30 border border-white/50" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Current Turn
              </span>
              <span className="text-xs font-mono text-slate-500">
                Move #{moveCount + 1}
              </span>
            </div>
            <div className="font-heading font-bold text-lg text-white flex items-center gap-2">
              {currentPlayer === 1 ? (
                <span className="text-red-400">
                  {gameMode === 'pve'
                    ? humanPlayer === 1
                      ? 'Player 1 (You)'
                      : 'AI Opponent (Red)'
                    : gameMode === 'eve'
                    ? agent1.name
                    : 'Player 1 (Red)'}
                </span>
              ) : (
                <span className="text-amber-400">
                  {gameMode === 'pve'
                    ? humanPlayer === 2
                      ? 'Player 2 (You)'
                      : 'AI Opponent (Yellow)'
                    : gameMode === 'eve'
                    ? agent2.name
                    : 'Player 2 (Yellow)'}
                </span>
              )}

              {isAIThinking && (
                <span className="inline-flex items-center gap-1 text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30 animate-pulse">
                  <Zap className="w-3 h-3 animate-spin" />
                  Thinking...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {gameMode !== 'eve' && (
            <>
              <button
                onClick={undo}
                disabled={moveCount === 0 || isAIThinking || status !== 'playing'}
                className="btn-secondary py-1.5 px-3 text-xs"
                title="Undo Move"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Undo</span>
              </button>

              <button
                onClick={requestAIHint}
                disabled={!isHumanTurn || isAIThinking || status !== 'playing'}
                className="btn-secondary py-1.5 px-3 text-xs text-sky-300 border-sky-500/30 hover:bg-sky-500/10"
                title="Get AI Hint"
              >
                <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Hint</span>
              </button>
            </>
          )}

          <button
            onClick={startNewGame}
            className="btn-secondary py-1.5 px-3 text-xs text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
            title="Restart Match"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* Mode Specific Controls & Settings */}
      {gameMode === 'pve' && (
        <div className="glass-panel p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Player Side Picker */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Your Side:</span>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setHumanPlayer(1)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    humanPlayer === 1
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Red (1st)
                </button>
                <button
                  onClick={() => setHumanPlayer(2)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    humanPlayer === 2
                      ? 'bg-amber-500 text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Yellow (2nd)
                </button>
              </div>
            </div>

            {/* AI Algorithm Picker */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Algorithm:</span>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setAIAlgorithm('alphabeta')}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    aiAlgorithm === 'alphabeta'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Alpha-Beta (α-β)
                </button>
                <button
                  onClick={() => setAIAlgorithm('minimax')}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    aiAlgorithm === 'minimax'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Minimax
                </button>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Difficulty:</span>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setAIDifficulty(diff)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                      aiDifficulty === diff
                        ? diff === 'easy'
                          ? 'bg-emerald-600 text-white'
                          : diff === 'medium'
                          ? 'bg-blue-600 text-white'
                          : 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI vs AI EvE Controls */}
      {gameMode === 'eve' && (
        <div className="glass-panel p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent 1 Configuration */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-red-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Agent 1 (Red)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Depth {agent1.depth}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={agent1.algorithm}
                  onChange={(e) =>
                    setAgent1({ algorithm: e.target.value as AIAlgorithm })
                  }
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg p-1.5 text-xs"
                >
                  <option value="alphabeta">Alpha-Beta (α-β)</option>
                  <option value="minimax">Pure Minimax</option>
                </select>
                <select
                  value={agent1.depth}
                  onChange={(e) => setAgent1({ depth: Number(e.target.value) })}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg p-1.5 text-xs"
                >
                  {[1, 2, 3, 4, 5, 6].map((d) => (
                    <option key={`a1-d-${d}`} value={d}>
                      Depth {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Agent 2 Configuration */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  Agent 2 (Yellow)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Depth {agent2.depth}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={agent2.algorithm}
                  onChange={(e) =>
                    setAgent2({ algorithm: e.target.value as AIAlgorithm })
                  }
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg p-1.5 text-xs"
                >
                  <option value="alphabeta">Alpha-Beta (α-β)</option>
                  <option value="minimax">Pure Minimax</option>
                </select>
                <select
                  value={agent2.depth}
                  onChange={(e) => setAgent2({ depth: Number(e.target.value) })}
                  className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg p-1.5 text-xs"
                >
                  {[1, 2, 3, 4, 5, 6].map((d) => (
                    <option key={`a2-d-${d}`} value={d}>
                      Depth {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Execution Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEvERunning(!isEvERunning)}
                disabled={status !== 'playing'}
                className={`btn-primary py-2 px-4 text-xs ${
                  isEvERunning
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isEvERunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Match</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Auto-Play Match</span>
                  </>
                )}
              </button>

              <button
                onClick={stepEvE}
                disabled={isEvERunning || isAIThinking || status !== 'playing'}
                className="btn-secondary py-2 px-3 text-xs"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Step Single Turn</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Speed:</span>
              <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800">
                {[
                  { label: 'Fast (300ms)', val: 300 },
                  { label: 'Normal (700ms)', val: 700 },
                  { label: 'Slow (1.2s)', val: 1200 },
                ].map((s) => (
                  <button
                    key={s.val}
                    onClick={() => setEvESpeed(s.val)}
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      evESpeed === s.val
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live AI Reasoning Metrics Card */}
      {lastAISearchStats && (
        <div className="glass-panel p-3.5 flex flex-col gap-2 bg-slate-900/60 border border-sky-500/20">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
              <Brain className="w-3.5 h-3.5" />
              <span>AI Tactical Evaluation</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {lastAISearchStats.algorithm === 'alphabeta'
                ? 'Alpha-Beta Search'
                : 'Minimax Search'}{' '}
              (d = {lastAISearchStats.depth})
            </span>
          </div>

          {lastMoveExplanation && (
            <p className="text-xs text-slate-200 bg-sky-950/30 p-2 rounded-lg border border-sky-500/20 leading-relaxed font-sans">
              💡 {lastMoveExplanation}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
            <div className="p-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">
                Nodes Visited
              </span>
              <span className="text-xs font-bold text-sky-300">
                {lastAISearchStats.nodesVisited.toLocaleString()}
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">
                Pruned Cutoffs
              </span>
              <span className="text-xs font-bold text-amber-300">
                {lastAISearchStats.prunedBranches.toLocaleString()}
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">
                Search Time
              </span>
              <span className="text-xs font-bold text-emerald-300">
                {lastAISearchStats.executionTimeMs} ms
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">
                Position Score
              </span>
              <span
                className={`text-xs font-bold ${
                  lastAISearchStats.optimalScore >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {lastAISearchStats.optimalScore > 90000
                  ? '+WIN'
                  : lastAISearchStats.optimalScore < -90000
                  ? '-LOSS'
                  : lastAISearchStats.optimalScore}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
