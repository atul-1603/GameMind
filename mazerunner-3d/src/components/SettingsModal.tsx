import React from 'react';
import { Monitor, Sliders, Volume2, X } from 'lucide-react';
import { GraphicsQuality, useGameStore } from '../game/gameState';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    graphicsQuality,
    setGraphicsQuality,
    mouseSensitivity,
    setMouseSensitivity,
    soundEnabled,
    setSoundEnabled,
    cameraMode,
    setCameraMode,
    weightedMode,
    setWeightedMode,
  } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
            <Sliders className="w-4 h-4 text-cyan-400" /> System Settings & Controls
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Graphics Quality */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold">
              Graphics Quality Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setGraphicsQuality(q)}
                  className={`py-2 rounded-xl font-bold font-mono transition-all ${
                    graphicsQuality === q
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Low: no shadows, optimized for older laptops. High: 2K soft shadows & dust.
            </div>
          </div>

          {/* Mouse Sensitivity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 font-semibold">Mouse Look Sensitivity</span>
              <span className="font-mono text-cyan-400">{mouseSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.4}
              max={2.8}
              step={0.1}
              value={mouseSensitivity}
              onChange={(e) => setMouseSensitivity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Camera View Mode */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-semibold">Default Camera Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCameraMode('FIRST_PERSON')}
                className={`py-2 rounded-xl font-bold font-mono transition-all ${
                  cameraMode === 'FIRST_PERSON'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                First-Person View
              </button>
              <button
                onClick={() => setCameraMode('BIRDS_EYE')}
                className={`py-2 rounded-xl font-bold font-mono transition-all ${
                  cameraMode === 'BIRDS_EYE'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Bird's-Eye Mode
              </button>
            </div>
          </div>

          {/* Weighted Terrain Mode Toggle */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Weighted Terrain Mode</div>
              <div className="text-[10px] text-slate-500">
                Adds sludge (cost 3) & hazards (cost 5)
              </div>
            </div>
            <input
              type="checkbox"
              checked={weightedMode}
              onChange={(e) => setWeightedMode(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Sound FX Toggle */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="font-semibold text-slate-200">Procedural Audio FX</div>
                <div className="text-[10px] text-slate-500">Web Audio synthesizer</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
        >
          Save & Return
        </button>
      </div>
    </div>
  );
};
