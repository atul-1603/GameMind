import React from 'react';
import {
  Accessibility,
  Eye,
  Gauge,
  Moon,
  Palette,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { AppTheme, useGameStore } from '../hooks/useGame';

export const SettingsModal: React.FC = () => {
  const {
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    discSymbols,
    setDiscSymbols,
    animationSpeed,
    setAnimationSpeed,
  } = useGameStore();

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-2 flex flex-col gap-6">
      <div className="glass-panel p-6 border-l-4 border-l-indigo-500 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-heading font-extrabold text-white">
              Application Settings & Accessibility
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure visuals, audio, physics speed, and accessibility preferences.
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 flex flex-col gap-6">
        {/* Theme Picker */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Palette className="w-4 h-4 text-sky-400" />
            <span>Arena Theme & Colorway</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'cyber', name: 'Cyber Indigo', desc: 'Vibrant neon cyan & deep navy', border: 'border-blue-500' },
              { id: 'arcade', name: 'Midnight Arcade', desc: 'Retro violet & royal blue', border: 'border-purple-500' },
              { id: 'slate', name: 'Titanium Slate', desc: 'Minimal dark matte slate', border: 'border-slate-500' },
              { id: 'emerald', name: 'Emerald Matrix', desc: 'Deep forest jade & amber', border: 'border-emerald-500' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id as AppTheme)}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  theme === t.id
                    ? `${t.border} bg-slate-800/80 ring-2 ring-sky-400/40 text-white`
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-bold text-xs text-slate-200">{t.name}</div>
                <div className="text-[11px] text-slate-400 mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">
                Procedural Sound Synthesis (Web Audio)
              </div>
              <div className="text-xs text-slate-400">
                Acoustic disc-dropping resonance, win fanfare, and tactile UI clicks.
              </div>
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              soundEnabled
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        {/* Accessibility: Disc Symbols Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Accessibility className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">
                Color-Blind Disc Pattern Overlay
              </div>
              <div className="text-xs text-slate-400">
                Renders geometric cross (×) and circle (•) symbols directly on discs.
              </div>
            </div>
          </div>

          <button
            onClick={() => setDiscSymbols(!discSymbols)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              discSymbols
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {discSymbols ? 'Symbols On' : 'Plain Discs'}
          </button>
        </div>

        {/* Animation Speed */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-200">
                Disc Gravity Physics & Animation
              </div>
              <div className="text-xs text-slate-400">
                Control the drop speed and bounce dampening curve.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['fast', 'normal', 'smooth'] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setAnimationSpeed(spd)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                  animationSpeed === spd
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
