import React from 'react';
import { HelpCircle, Sparkles, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
            <HelpCircle className="w-4 h-4 text-cyan-400" /> How to Play & Controls
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Controls Table */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="font-bold text-cyan-400 font-mono uppercase text-[11px] mb-1">
              Keyboard & Mouse Bindings
            </div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Movement:</span>
                <span className="font-mono text-cyan-300 font-bold">W / A / S / D</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Look Around:</span>
                <span className="font-mono text-cyan-300 font-bold">Mouse (Click to lock)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sprint:</span>
                <span className="font-mono text-cyan-300 font-bold">Shift</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hop / Jump:</span>
                <span className="font-mono text-cyan-300 font-bold">Space</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Toggle View:</span>
                <span className="font-mono text-cyan-300 font-bold">M (Bird's-Eye)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Pause / Menu:</span>
                <span className="font-mono text-cyan-300 font-bold">P or Esc</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Restart Level:</span>
                <span className="font-mono text-cyan-300 font-bold">R</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Toggle Help:</span>
                <span className="font-mono text-cyan-300 font-bold">H</span>
              </div>
            </div>
          </div>

          {/* Objectives */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 font-mono uppercase text-[11px] mb-1">
              Objectives & AI Intelligence
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>1. Escape the Labyrinth:</strong> Find the luminous violet portal to advance through all 5 sectors.
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong>2. Collect Energy Orbs:</strong> Gather glowing cyan spheres hidden at dead-ends for bonus score.
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong>3. AI Solver:</strong> At any time, open the <strong>AI Solver</strong> to run BFS, DFS, Dijkstra, A*, or Greedy Best-First starting from your exact current position. You can step through the search or click <strong>Execute Route</strong> to watch the AI autopilot you to freedom!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          Understood • Back to Labyrinth
        </button>
      </div>
    </div>
  );
};
