import React from 'react';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  Compass,
  Cpu,
  Play,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '../game/gameState';
import { LEVEL_DEFINITIONS } from '../maze/levelDefinitions';

interface MainMenuProps {
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onOpenSettings }) => {
  const { setScreen, setLevel, currentLevelId } = useGameStore();

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col justify-between p-8 select-none overflow-y-auto">
      {/* Background Cyber Grid Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,240,255,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a15_1px,transparent_1px),linear-gradient(to_bottom,#0f172a15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Tag */}
      <div className="relative z-10 flex justify-between items-center w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-500/30 rounded-full text-[11px] font-mono text-cyan-400">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>GameMind • Design & Analysis of Algorithms Project</span>
        </div>
        <div className="text-xs font-mono text-slate-500">v1.0.0 Cyber Matrix</div>
      </div>

      {/* Center Hero */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-6 max-w-4xl mx-auto space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Real-time 3D Labyrinth Exploration & Autonomous AI Solvers</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 drop-shadow-sm">
            MAZERUNNER 3D
          </h1>
          <div className="text-lg md:text-xl font-light text-slate-300 tracking-wide">
            Escape the Labyrinth
          </div>
          <p className="max-w-xl mx-auto text-xs md:text-sm text-slate-400 leading-relaxed">
            Traverse tall metallic corridors, collect cyber orbs, and unravel algorithmic pathfinding.
            Watch BFS, DFS, Dijkstra, A*, and Greedy Best-First navigate the exact labyrinth in real-time.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setScreen('GAMEPLAY')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/25 active:scale-95 transition-all flex items-center gap-2.5"
          >
            <Play className="w-5 h-5 fill-current" /> Enter Labyrinth
          </button>

          <button
            onClick={() => setScreen('ALGO_LAB')}
            className="px-6 py-4 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Algorithm Lab
          </button>

          <button
            onClick={() => setScreen('LEARN')}
            className="px-6 py-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-fuchsia-400" /> Learn DAA Theory
          </button>

          <button
            onClick={onOpenSettings}
            className="p-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Level Selector Cards */}
        <div className="w-full pt-6">
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-3 font-semibold text-left">
            Select Initial Sector
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {LEVEL_DEFINITIONS.map((lvl) => {
              const isSelected = currentLevelId === lvl.id;
              return (
                <div
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400/80 shadow-lg shadow-cyan-500/15'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      Sector {lvl.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {lvl.width}x{lvl.height}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white mb-0.5">{lvl.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                    {lvl.subtitle}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center w-full max-w-6xl mx-auto text-[11px] font-mono text-slate-500 pt-4 border-t border-slate-900">
        <div>React • TypeScript • Three.js • Vitest • Zero External Assets</div>
        <div className="text-cyan-500/70">BFS • DFS • Dijkstra • A* Search • Greedy Best-First</div>
      </div>
    </div>
  );
};
