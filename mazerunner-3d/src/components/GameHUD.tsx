import React from 'react';
import {
  BrainCircuit,
  Compass,
  Eye,
  Footprints,
  HelpCircle,
  Pause,
  RotateCcw,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { LEVEL_DEFINITIONS } from '../maze/levelDefinitions';
import { MiniMap } from './MiniMap';

interface GameHUDProps {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ onOpenSettings, onOpenHelp }) => {
  const {
    currentLevelId,
    maze,
    player,
    cameraMode,
    toggleCameraMode,
    isPaused,
    setPaused,
    restartLevel,
    soundEnabled,
    setSoundEnabled,
    openAISolver,
    aiSolver,
  } = useGameStore();

  const levelDef =
    LEVEL_DEFINITIONS.find((l) => l.id === currentLevelId) || LEVEL_DEFINITIONS[0];

  // Format elapsed time MM:SS.S
  const minutes = Math.floor(player.timeElapsed / 60);
  const seconds = Math.floor(player.timeElapsed % 60);
  const tenths = Math.floor((player.timeElapsed * 10) % 10);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}.${tenths}`;

  // Manhattan distance to exit
  const distRemaining =
    Math.abs(Math.round(player.x) - maze.exit.x) +
    Math.abs(Math.round(player.z) - maze.exit.y);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 select-none z-30">
      {/* Top Header Row */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Mission & Level Stats */}
        <div className="flex flex-col gap-2">
          <div className="p-3.5 bg-slate-900/85 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-2xl flex items-center gap-4 pointer-events-auto">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Level {levelDef.id} • {levelDef.name}
              </div>
              <div className="text-xs font-semibold text-slate-200">
                {levelDef.subtitle}
              </div>
            </div>

            <div className="h-7 w-[1px] bg-slate-800" />

            {/* Timer */}
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Elapsed</span>
              <span className="font-mono text-sm font-bold text-amber-400">
                {formattedTime}
              </span>
            </div>

            <div className="h-7 w-[1px] bg-slate-800" />

            {/* Steps */}
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-400 uppercase">Steps</span>
                <span className="font-mono text-sm font-bold text-cyan-300">
                  {player.steps}
                </span>
              </div>
            </div>

            <div className="h-7 w-[1px] bg-slate-800" />

            {/* Distance to Exit */}
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-400 uppercase">To Portal</span>
                <span className="font-mono text-sm font-bold text-emerald-300">
                  {distRemaining}m
                </span>
              </div>
            </div>

            {/* Orbs Collected */}
            {maze.totalOrbs > 0 && (
              <>
                <div className="h-7 w-[1px] bg-slate-800" />
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Orbs</span>
                    <span className="font-mono text-sm font-bold text-fuchsia-300">
                      {player.orbsCollected}/{maze.totalOrbs}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Controls & MiniMap */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Action buttons bar */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/85 backdrop-blur-xl border border-cyan-500/40 rounded-2xl shadow-xl">
            <button
              onClick={openAISolver}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                aiSolver.isOpen
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              AI Solver
            </button>

            <button
              onClick={toggleCameraMode}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title={`Switch to ${
                cameraMode === 'FIRST_PERSON' ? "Bird's-Eye Mode [M]" : 'First-Person Mode [M]'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={restartLevel}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Restart Level [R]"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cyan-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenHelp}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Help & Controls [H]"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPaused(!isPaused)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Pause [P / Esc]"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {/* MiniMap */}
          <MiniMap />
        </div>
      </div>

      {/* Bottom Hint Strip */}
      <div className="flex justify-center w-full">
        <div className="px-4 py-1.5 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-4">
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-400 font-bold">
              WASD
            </kbd>{' '}
            Move
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-400 font-bold">
              Shift
            </kbd>{' '}
            Sprint
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-400 font-bold">
              M
            </kbd>{' '}
            View Mode
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-400 font-bold">
              P
            </kbd>{' '}
            Pause
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-400 font-bold">
              H
            </kbd>{' '}
            Help
          </span>
        </div>
      </div>
    </div>
  );
};
