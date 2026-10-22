import React from 'react';
import {
  ArrowRight,
  Award,
  BarChart3,
  Compass,
  Footprints,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { LEVEL_DEFINITIONS } from '../maze/levelDefinitions';

export const VictoryScreen: React.FC = () => {
  const {
    isWon,
    setWon,
    currentLevelId,
    setLevel,
    restartLevel,
    player,
    maze,
    setScreen,
    aiSolver,
  } = useGameStore();

  if (!isWon) return null;

  const currentLevelDef =
    LEVEL_DEFINITIONS.find((l) => l.id === currentLevelId) || LEVEL_DEFINITIONS[0];
  const nextLevel = LEVEL_DEFINITIONS.find((l) => l.id === currentLevelId + 1);

  const minutes = Math.floor(player.timeElapsed / 60);
  const seconds = Math.floor(player.timeElapsed % 60);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}s`;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/50 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 text-slate-100 flex flex-col items-center text-center">
        {/* Glow Trophy Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-600 p-0.5 shadow-xl shadow-cyan-500/30 mb-4 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-cyan-400" />
          </div>
        </div>

        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold mb-1">
          Labyrinth Escaped!
        </div>
        <h2 className="text-2xl font-black text-white tracking-wide mb-1">
          {currentLevelDef.name} Conquered
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          You successfully traversed the futuristic matrix to reach the extraction portal.
        </p>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Elapsed Time</span>
            <span className="text-base font-bold font-mono text-amber-400">
              {formattedTime}
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Steps Taken</span>
            <span className="text-base font-bold font-mono text-cyan-400">
              {player.steps}
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Orbs Collected</span>
            <span className="text-base font-bold font-mono text-fuchsia-400">
              {player.orbsCollected} / {maze.totalOrbs}
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Navigation Method</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {aiSolver.result ? `${aiSolver.selectedAlgorithm} AI` : 'Manual Pilot'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {nextLevel ? (
            <button
              onClick={() => {
                setLevel(nextLevel.id);
                setWon(false);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Advance to Level {nextLevel.id}: {nextLevel.name} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 bg-fuchsia-950/40 rounded-xl border border-fuchsia-500/30 text-fuchsia-300 text-xs font-bold font-mono">
              ★ All 5 Labyrinth Sectors Completed! Outstanding Navigator! ★
            </div>
          )}

          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                restartLevel();
                setWon(false);
              }}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay Sector
            </button>

            <button
              onClick={() => {
                setWon(false);
                setScreen('ALGO_LAB');
              }}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" /> Algorithm Lab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
