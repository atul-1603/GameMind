import React from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Cpu,
  Gamepad2,
  Moon,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppTheme, useGameStore } from '../hooks/useGame';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    gameMode,
    setGameMode,
    soundEnabled,
    setSoundEnabled,
    theme,
    setTheme,
    startNewGame,
  } = useGameStore();

  const handleThemeCycle = () => {
    const themes: AppTheme[] = ['cyber', 'arcade', 'slate', 'emerald'];
    const nextIdx = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIdx]);
    document.body.setAttribute('data-theme', themes[nextIdx]);
  };

  return (
    <header className="app-header w-full border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,15,26,0.85)] backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/30">
            <div className="w-5 h-5 rounded-full bg-red-500 shadow-inner flex items-center justify-center border border-white/40">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                CoreDrop <span className="text-sky-400">2D</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-semibold">
                AI Arena
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Design & Analysis of Algorithms · Connect Four Intelligence
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'play'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Play Arena</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'lab'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Algorithm Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'theory'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>DAA Theory</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Quick Utility Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            onClick={handleThemeCycle}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors border border-slate-700/50 flex items-center gap-1.5"
            title="Cycle Theme"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="capitalize">{theme}</span>
          </button>

          <button
            onClick={startNewGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors border border-slate-700/60 shadow-sm"
            title="Restart Match"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
