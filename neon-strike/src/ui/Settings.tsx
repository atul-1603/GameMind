import React from 'react';
import { useGameStore, type GraphicsQuality, type AIDifficulty } from '../game/gameStore';
import type { AlgorithmType } from '../algorithms/pathTypes';
import { Settings as SettingsIcon, Sliders, ArrowLeft, Eye, Volume2, Cpu, ShieldAlert } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings, setScreen } = useGameStore();

  return (
    <div style={containerStyle}>
      <div className="cyber-panel" style={panelStyle}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SettingsIcon size={24} color="var(--neon-cyan)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#fff' }}>
              SYSTEM CONFIGURATION
            </h2>
          </div>
          <button
            className="cyber-btn cyber-btn-secondary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            onClick={() => setScreen('menu')}
          >
            <ArrowLeft size={16} />
            <span>BACK TO MENU</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
          {/* Mouse Sensitivity */}
          <div style={settingRowStyle}>
            <div>
              <div style={labelStyle}>
                <Sliders size={16} color="var(--neon-cyan)" />
                <span>Mouse Sensitivity</span>
              </div>
              <p style={descStyle}>Adjust rotation and aiming responsiveness.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={settings.mouseSensitivity}
                onChange={(e) => updateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                style={sliderStyle}
              />
              <span style={valueBadgeStyle}>{settings.mouseSensitivity.toFixed(1)}x</span>
            </div>
          </div>

          {/* Sound Volume */}
          <div style={settingRowStyle}>
            <div>
              <div style={labelStyle}>
                <Volume2 size={16} color="var(--neon-cyan)" />
                <span>Master Audio Volume</span>
              </div>
              <p style={descStyle}>Controls blaster fire, impacts, and robotic audio cues.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                style={sliderStyle}
              />
              <span style={valueBadgeStyle}>{Math.round(settings.soundVolume * 100)}%</span>
            </div>
          </div>

          {/* Graphics Quality */}
          <div style={settingRowStyle}>
            <div>
              <div style={labelStyle}>
                <Cpu size={16} color="var(--neon-cyan)" />
                <span>Graphics Quality</span>
              </div>
              <p style={descStyle}>Dynamic shadows, lighting bloom, and particle density.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['low', 'medium', 'high'] as GraphicsQuality[]).map((quality) => (
                <button
                  key={quality}
                  style={{
                    ...pillBtnStyle,
                    ...(settings.graphicsQuality === quality ? activePillStyle : {}),
                  }}
                  onClick={() => updateSettings({ graphicsQuality: quality })}
                >
                  {quality.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* AI Pathfinding Algorithm */}
          <div style={settingRowStyle}>
            <div>
              <div style={labelStyle}>
                <Cpu size={16} color="var(--neon-cyan)" />
                <span>Enemy Pathfinding Algorithm</span>
              </div>
              <p style={descStyle}>The active graph search algorithm deployed by combat robots.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['astar', 'dijkstra', 'bfs', 'dfs', 'greedy'] as AlgorithmType[]).map((algo) => (
                <button
                  key={algo}
                  style={{
                    ...pillBtnStyle,
                    ...(settings.activeAlgorithm === algo ? activePillStyle : {}),
                  }}
                  onClick={() => updateSettings({ activeAlgorithm: algo })}
                >
                  {algo === 'astar' ? 'A*' : algo.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* AI Difficulty */}
          <div style={settingRowStyle}>
            <div>
              <div style={labelStyle}>
                <ShieldAlert size={16} color="var(--neon-orange)" />
                <span>AI Tactical Difficulty</span>
              </div>
              <p style={descStyle}>Governs enemy reaction time, accuracy, and flanking frequency.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['normal', 'hard', 'adaptive'] as AIDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  style={{
                    ...pillBtnStyle,
                    ...(settings.aiDifficulty === diff ? activeOrangePillStyle : {}),
                  }}
                  onClick={() => updateSettings({ aiDifficulty: diff })}
                >
                  {diff.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* AI Live Visualization Toggle */}
          <div style={settingRowStyle}>
            <div>
              <div style={labelStyle}>
                <Eye size={16} color="var(--neon-cyan)" />
                <span>Live AI Graph & Path Visualization</span>
              </div>
              <p style={descStyle}>Renders explored nodes, frontiers, and path vectors in 3D arena.</p>
            </div>
            <button
              style={{
                ...pillBtnStyle,
                ...(settings.aiVisualization ? activePillStyle : {}),
              }}
              onClick={() => updateSettings({ aiVisualization: !settings.aiVisualization })}
            >
              {settings.aiVisualization ? 'ENABLED [TAB]' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'radial-gradient(circle at center, #0f172a 0%, #060911 100%)',
};

const panelStyle: React.CSSProperties = {
  width: '750px',
  maxWidth: '92vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: '36px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
  paddingBottom: '16px',
};

const settingRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
  background: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '6px',
  border: '1px solid rgba(255, 255, 255, 0.04)',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: 'var(--font-display)',
  fontSize: '1rem',
  color: '#ffffff',
};

const descStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-dim)',
  marginTop: '4px',
};

const sliderStyle: React.CSSProperties = {
  accentColor: 'var(--neon-cyan)',
  cursor: 'pointer',
  width: '130px',
};

const valueBadgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  color: 'var(--neon-cyan)',
  fontSize: '0.9rem',
  minWidth: '45px',
  textAlign: 'right',
};

const pillBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  padding: '6px 14px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  background: 'rgba(255, 255, 255, 0.03)',
  color: 'var(--text-dim)',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const activePillStyle: React.CSSProperties = {
  border: '1px solid var(--neon-cyan)',
  background: 'rgba(0, 240, 255, 0.2)',
  color: '#ffffff',
  boxShadow: '0 0 10px var(--neon-cyan-glow)',
};

const activeOrangePillStyle: React.CSSProperties = {
  border: '1px solid var(--neon-orange)',
  background: 'rgba(255, 85, 0, 0.2)',
  color: '#ffffff',
  boxShadow: '0 0 10px var(--neon-orange-glow)',
};
