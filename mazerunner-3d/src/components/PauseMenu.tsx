import React from 'react';
import {
  BarChart3,
  BookOpen,
  Home,
  Play,
  RotateCcw,
  Settings,
} from 'lucide-react';
import { useGameStore } from '../game/gameState';

interface PauseMenuProps {
  onOpenSettings: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onOpenSettings }) => {
  const { isPaused, setPaused, restartLevel, setScreen } = useGameStore();

  if (!isPaused) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col items-center space-y-4">
        <h2 className="text-xl font-black text-cyan-300 tracking-wider uppercase font-mono">
          System Suspended
        </h2>
        <div className="text-xs text-slate-400 text-center">
          Gameplay is paused. Select an option to proceed.
        </div>

        <div className="flex flex-col gap-2 w-full pt-2">
          <button
            onClick={() => setPaused(false)}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Play className="w-4 h-4 fill-current" /> Resume Exploration
          </button>

          <button
            onClick={() => {
              restartLevel();
              setPaused(false);
            }}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <RotateCcw className="w-4 h-4" /> Restart Sector
          </button>

          <button
            onClick={() => {
              setPaused(false);
              setScreen('ALGO_LAB');
            }}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Algorithm Lab
          </button>

          <button
            onClick={() => {
              setPaused(false);
              setScreen('LEARN');
            }}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <BookOpen className="w-4 h-4 text-fuchsia-400" /> Learn DAA Algorithms
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Settings className="w-4 h-4" /> Settings
          </button>

          <button
            onClick={() => {
              setPaused(false);
              setScreen('MAIN_MENU');
            }}
            className="w-full py-2.5 px-4 bg-red-950/40 hover:bg-red-900/60 text-red-300 font-semibold rounded-xl border border-red-900/40 transition-colors flex items-center justify-center gap-2 text-xs mt-2"
          >
            <Home className="w-4 h-4" /> Return to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
