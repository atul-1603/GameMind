import React from 'react';
import { useGameStore } from '../game/gameStore';
import { Shield, Zap, Target, Cpu, Clock } from 'lucide-react';

interface GameHUDProps {
  isPointerLocked: boolean;
  onRequestPointerLock: () => void;
  isAiming: boolean;
  isShooting: boolean;
  hitMarkerVisible: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  isPointerLocked,
  onRequestPointerLock,
  isAiming,
  hitMarkerVisible,
}) => {
  const {
    playerHealth,
    playerMaxHealth,
    playerAmmo,
    playerMaxAmmo,
    isReloading,
    missionStats,
    settings,
  } = useGameStore();

  const healthPercent = Math.max(0, Math.min(100, (playerHealth / playerMaxHealth) * 100));
  const ammoPercent = Math.max(0, Math.min(100, (playerAmmo / playerMaxAmmo) * 100));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={hudContainerStyle}>
      {/* Click-to-lock mouse pointer prompt */}
      {!isPointerLocked && (
        <div style={pointerPromptOverlayStyle} onClick={onRequestPointerLock}>
          <div className="cyber-panel" style={{ padding: '24px 36px', textAlign: 'center', cursor: 'pointer' }}>
            <Target size={40} color="var(--neon-cyan)" style={{ marginBottom: '12px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', fontSize: '1.4rem' }}>
              CLICK TO ENGAGE COMBAT RETICLE
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '6px' }}>
              WASD Move • Mouse Aim • LMB Fire • RMB Focus Aim • Shift Sprint • Space Jump • ESC Pause
            </p>
          </div>
        </div>
      )}

      {/* Top Header: Mission Objective & Timer */}
      <div style={topBarStyle}>
        <div className="cyber-panel" style={objectivePanelStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={16} color="var(--neon-cyan)" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#fff', letterSpacing: '1px' }}>
              {missionStats.missionName.toUpperCase()}
            </span>
          </div>
          <p style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', marginTop: '2px' }}>
            {missionStats.objectiveText}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Active AI Algorithm Indicator */}
          <div className="cyber-panel" style={statBadgeStyle}>
            <Cpu size={14} color="var(--neon-cyan)" />
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>AI SEARCH:</span>
            <span style={{ color: 'var(--neon-cyan)', fontWeight: 800 }}>
              {settings.activeAlgorithm.toUpperCase()}
            </span>
          </div>

          {/* Enemies Remaining */}
          <div className="cyber-panel" style={statBadgeStyle}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>HOSTILES:</span>
            <span style={{ color: missionStats.enemiesRemaining > 0 ? 'var(--neon-orange)' : 'var(--neon-green)', fontWeight: 800 }}>
              {missionStats.enemiesRemaining} / {missionStats.totalEnemies}
            </span>
          </div>

          {/* Mission Timer */}
          <div className="cyber-panel" style={statBadgeStyle}>
            <Clock size={14} color="var(--neon-yellow)" />
            <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {formatTime(missionStats.timeElapsed)}
            </span>
          </div>
        </div>
      </div>

      {/* Center Dynamic Crosshair */}
      <div style={crosshairContainerStyle}>
        {/* Reticle Ticks */}
        <div
          style={{
            ...reticleTickStyle,
            top: isAiming ? '-12px' : '-20px',
            left: '-1px',
            width: '2px',
            height: '10px',
          }}
        />
        <div
          style={{
            ...reticleTickStyle,
            bottom: isAiming ? '-12px' : '-20px',
            left: '-1px',
            width: '2px',
            height: '10px',
          }}
        />
        <div
          style={{
            ...reticleTickStyle,
            left: isAiming ? '-12px' : '-20px',
            top: '-1px',
            width: '10px',
            height: '2px',
          }}
        />
        <div
          style={{
            ...reticleTickStyle,
            right: isAiming ? '-12px' : '-20px',
            top: '-1px',
            width: '10px',
            height: '2px',
          }}
        />
        {/* Center dot */}
        <div style={centerDotStyle} />

        {/* Hit marker X indicator */}
        {hitMarkerVisible && (
          <div style={hitMarkerStyle}>
            <div style={hitLineLeft} />
            <div style={hitLineRight} />
          </div>
        )}
      </div>

      {/* Bottom Bar: Health and Weapon Status */}
      <div style={bottomBarStyle}>
        {/* Health Panel */}
        <div className="cyber-panel" style={vitalsPanelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} color="var(--neon-cyan)" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: '#fff' }}>EXOSUIT INTEGRITY</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: healthPercent < 30 ? 'var(--neon-red)' : 'var(--neon-cyan)', fontWeight: 700 }}>
              {Math.round(playerHealth)} HP
            </span>
          </div>
          {/* Health Bar Track */}
          <div style={barTrackStyle}>
            <div
              style={{
                ...barFillStyle,
                width: `${healthPercent}%`,
                background:
                  healthPercent < 30
                    ? 'var(--neon-red)'
                    : healthPercent < 60
                    ? 'var(--neon-orange)'
                    : 'linear-gradient(90deg, #00b0ff, var(--neon-cyan))',
                boxShadow: healthPercent < 30 ? '0 0 10px var(--neon-red)' : '0 0 10px var(--neon-cyan-glow)',
              }}
            />
          </div>
        </div>

        {/* Weapon / Plasma Ammo Panel */}
        <div className="cyber-panel" style={weaponPanelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} color="var(--neon-yellow)" />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: '#fff' }}>PLASMA CELL</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#fff', fontWeight: 800 }}>
              {isReloading ? (
                <span style={{ color: 'var(--neon-yellow)', fontSize: '0.85rem' }}>RECHARGING...</span>
              ) : (
                `${playerAmmo} / ${playerMaxAmmo}`
              )}
            </span>
          </div>
          {/* Ammo Bar Track */}
          <div style={barTrackStyle}>
            <div
              style={{
                ...barFillStyle,
                width: `${ammoPercent}%`,
                background: isReloading ? 'var(--neon-yellow)' : 'linear-gradient(90deg, #b026ff, var(--neon-yellow))',
                boxShadow: '0 0 10px var(--neon-cyan-glow)',
              }}
            />
          </div>
          {playerAmmo <= 5 && !isReloading && (
            <span style={reloadAlertStyle}>PRESS [R] TO RELOAD</span>
          )}
        </div>
      </div>
    </div>
  );
};

const hudContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '24px',
  zIndex: 20,
};

const pointerPromptOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
  zIndex: 50,
};

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
};

const objectivePanelStyle: React.CSSProperties = {
  padding: '12px 20px',
  minWidth: '320px',
};

const statBadgeStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 16px',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.9rem',
};

const crosshairContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40px',
  height: '40px',
  pointerEvents: 'none',
};

const reticleTickStyle: React.CSSProperties = {
  position: 'absolute',
  backgroundColor: 'rgba(0, 240, 255, 0.85)',
  boxShadow: '0 0 6px var(--neon-cyan)',
  transition: 'all 0.08s ease',
};

const centerDotStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '4px',
  height: '4px',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: '0 0 6px var(--neon-cyan)',
};

const hitMarkerStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '24px',
  height: '24px',
  transform: 'translate(-50%, -50%)',
};

const hitLineLeft: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  left: '11px',
  width: '2px',
  height: '24px',
  backgroundColor: 'var(--neon-red)',
  transform: 'rotate(45deg)',
  boxShadow: '0 0 8px var(--neon-red)',
};

const hitLineRight: React.CSSProperties = {
  position: 'absolute',
  top: '0',
  left: '11px',
  width: '2px',
  height: '24px',
  backgroundColor: 'var(--neon-red)',
  transform: 'rotate(-45deg)',
  boxShadow: '0 0 8px var(--neon-red)',
};

const bottomBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  width: '100%',
};

const vitalsPanelStyle: React.CSSProperties = {
  width: '280px',
  padding: '14px 18px',
};

const weaponPanelStyle: React.CSSProperties = {
  width: '280px',
  padding: '14px 18px',
  position: 'relative',
};

const barTrackStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '4px',
  overflow: 'hidden',
};

const barFillStyle: React.CSSProperties = {
  height: '100%',
  transition: 'width 0.15s ease',
};

const reloadAlertStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-26px',
  right: '18px',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  color: 'var(--neon-yellow)',
  letterSpacing: '1px',
  animation: 'pulse 1s infinite alternate',
};
