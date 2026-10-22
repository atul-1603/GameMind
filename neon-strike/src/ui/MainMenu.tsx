import React, { useState } from 'react';
import { useGameStore } from '../game/gameStore';
import { MISSIONS } from '../game/arenaDefinitions';
import { Play, Cpu, Shield, Settings, Info, ChevronRight } from 'lucide-react';

export const MainMenu: React.FC = () => {
  const { setScreen, setGameState, setCurrentMission, resetMission } = useGameStore();
  const [showMissionSelect, setShowMissionSelect] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const startMission = (missionId: number) => {
    setCurrentMission(missionId);
    resetMission();
    setGameState('playing');
    setScreen('campaign');
  };

  return (
    <div style={containerStyle}>
      {/* Background ambient neon glow effects */}
      <div style={ambientGlowLeft} />
      <div style={ambientGlowRight} />

      {/* Main Header / Title */}
      <div style={headerStyle}>
        <div style={badgeStyle}>
          <Cpu size={14} color="var(--neon-cyan)" />
          <span>DAA ALGORITHMS & 3D COMBAT SYSTEM</span>
        </div>
        <h1 style={titleStyle}>
          NEON <span style={{ color: 'var(--neon-cyan)', textShadow: '0 0 25px var(--neon-cyan-glow)' }}>STRIKE</span>
        </h1>
        <p style={subtitleStyle}>3D AI COMBAT ARENA • REAL-TIME GRAPH SEARCH & TACTICAL PRUNING</p>
      </div>

      {/* Navigation Buttons */}
      <div style={menuActionsStyle}>
        <button
          className="cyber-btn"
          style={{ width: '320px', padding: '16px 24px' }}
          onClick={() => setShowMissionSelect(true)}
        >
          <Play size={20} />
          <span>PLAY CAMPAIGN</span>
        </button>

        <button
          className="cyber-btn cyber-btn-secondary"
          style={{ width: '320px', padding: '16px 24px' }}
          onClick={() => setScreen('lab')}
        >
          <Cpu size={20} />
          <span>AI ALGORITHM LAB</span>
        </button>

        <button
          className="cyber-btn cyber-btn-orange"
          style={{ width: '320px', padding: '16px 24px' }}
          onClick={() => setScreen('tactical')}
        >
          <Shield size={20} />
          <span>TACTICAL SIMULATION</span>
        </button>

        <div style={{ display: 'flex', gap: '16px', width: '320px' }}>
          <button
            className="cyber-btn"
            style={{ flex: 1, padding: '12px 16px', fontSize: '0.85rem' }}
            onClick={() => setScreen('settings')}
          >
            <Settings size={18} />
            <span>CONFIG</span>
          </button>
          <button
            className="cyber-btn"
            style={{ flex: 1, padding: '12px 16px', fontSize: '0.85rem' }}
            onClick={() => setShowControls(true)}
          >
            <Info size={18} />
            <span>GUIDE</span>
          </button>
        </div>
      </div>

      {/* Mission Select Modal */}
      {showMissionSelect && (
        <div style={modalBackdropStyle} onClick={() => setShowMissionSelect(false)}>
          <div className="cyber-panel" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.4rem' }}>
                MISSION DEPLOYMENT
              </h2>
              <button
                style={closeBtnStyle}
                onClick={() => setShowMissionSelect(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {MISSIONS.map((m) => (
                <div
                  key={m.id}
                  style={missionCardStyle}
                  onClick={() => startMission(m.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--neon-cyan)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                        SECTOR 0{m.id}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>{m.name}</h3>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '4px' }}>
                      {m.briefing}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--neon-yellow)' }}>
                      <span>Hostiles: {m.enemies.length}</span>
                      <span>Grid: {m.gridWidth}×{m.gridHeight}</span>
                      <span>Pickups: {m.pickups.length}</span>
                    </div>
                  </div>
                  <ChevronRight size={24} color="var(--neon-cyan)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls & Instructions Modal */}
      {showControls && (
        <div style={modalBackdropStyle} onClick={() => setShowControls(false)}>
          <div className="cyber-panel" style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.4rem' }}>
                TACTICAL OPERATIVE CONTROLS
              </h2>
              <button style={closeBtnStyle} onClick={() => setShowControls(false)}>
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem' }}>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>W A S D</span>
                <span>Tactical Locomotion</span>
              </div>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>MOUSE</span>
                <span>Aim & Reticle Orient</span>
              </div>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>LMB</span>
                <span>Discharge Plasma Blaster</span>
              </div>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>RMB</span>
                <span>Focus Aim / ADS</span>
              </div>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>SPACE</span>
                <span>Thruster Jump</span>
              </div>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>SHIFT</span>
                <span>Sprint</span>
              </div>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>R</span>
                <span>Reload Plasma Cell</span>
              </div>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>TAB</span>
                <span>Toggle Live AI Graph Vis</span>
              </div>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>ESC</span>
                <span>Tactical Pause</span>
              </div>
              <div style={controlRowStyle}>
                <span style={keyBadgeStyle}>E</span>
                <span>Interact / Extract</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer information */}
      <div style={footerStyle}>
        <span>GameMind DAA Project: BFS • DFS • Dijkstra • A* • Greedy Best-First • Minimax • Alpha-Beta</span>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  background: 'radial-gradient(circle at center, #0f172a 0%, #060911 100%)',
  overflow: 'hidden',
};

const ambientGlowLeft: React.CSSProperties = {
  position: 'absolute',
  top: '20%',
  left: '10%',
  width: '350px',
  height: '350px',
  background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
  filter: 'blur(40px)',
  pointerEvents: 'none',
};

const ambientGlowRight: React.CSSProperties = {
  position: 'absolute',
  bottom: '20%',
  right: '10%',
  width: '400px',
  height: '400px',
  background: 'radial-gradient(circle, rgba(176, 38, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
  filter: 'blur(50px)',
  pointerEvents: 'none',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '40px',
  zIndex: 10,
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 14px',
  background: 'rgba(0, 240, 255, 0.08)',
  border: '1px solid rgba(0, 240, 255, 0.3)',
  borderRadius: '20px',
  color: 'var(--neon-cyan)',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.8rem',
  letterSpacing: '1.5px',
  marginBottom: '14px',
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '4rem',
  fontWeight: 900,
  letterSpacing: '6px',
  color: '#ffffff',
  textTransform: 'uppercase',
  lineHeight: 1.1,
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.9rem',
  color: 'var(--text-dim)',
  letterSpacing: '3px',
  marginTop: '10px',
};

const menuActionsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  zIndex: 10,
};

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
};

const modalContentStyle: React.CSSProperties = {
  width: '560px',
  maxWidth: '90vw',
  padding: '30px',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-dim)',
  fontSize: '1.4rem',
  cursor: 'pointer',
};

const missionCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(0, 240, 255, 0.2)',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const controlRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: 'rgba(255, 255, 255, 0.02)',
  padding: '10px 14px',
  borderRadius: '4px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
};

const keyBadgeStyle: React.CSSProperties = {
  background: 'rgba(0, 240, 255, 0.15)',
  border: '1px solid var(--neon-cyan)',
  color: 'var(--neon-cyan)',
  padding: '4px 10px',
  borderRadius: '4px',
  fontFamily: 'var(--font-mono)',
  fontWeight: 700,
  fontSize: '0.85rem',
  minWidth: '55px',
  textAlign: 'center',
};

const footerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '20px',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  color: 'rgba(255, 255, 255, 0.35)',
  letterSpacing: '1px',
};
