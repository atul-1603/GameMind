import React from 'react';
import { useGameStore } from '../game/gameStore';
import { Play, RotateCcw, Settings, Home, ShieldAlert } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onResume }) => {
  const { setScreen, setGameState, resetMission, missionStats } = useGameStore();

  const handleRestart = () => {
    resetMission();
    onResume();
  };

  const handleAbort = () => {
    setGameState('ready');
    setScreen('menu');
  };

  return (
    <div style={backdropStyle}>
      <div className="cyber-panel" style={modalStyle}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <ShieldAlert size={36} color="var(--neon-orange)" style={{ marginBottom: '8px' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '1.6rem', letterSpacing: '2px' }}>
            TACTICAL PAUSE
          </h2>
          <p style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', marginTop: '4px' }}>
            SECTOR: {missionStats.missionName.toUpperCase()}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="cyber-btn" onClick={onResume}>
            <Play size={18} /> RESUME OPERATION
          </button>

          <button className="cyber-btn cyber-btn-secondary" onClick={handleRestart}>
            <RotateCcw size={18} /> RESTART MISSION
          </button>

          <button className="cyber-btn" onClick={() => setScreen('settings')}>
            <Settings size={18} /> CONFIGURATION
          </button>

          <button className="cyber-btn cyber-btn-orange" onClick={handleAbort}>
            <Home size={18} /> ABORT TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

const backdropStyle: React.CSSProperties = {
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

const modalStyle: React.CSSProperties = {
  width: '420px',
  maxWidth: '90vw',
  padding: '32px',
};
