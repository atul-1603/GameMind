import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../game/gameStore';
import { MISSIONS } from '../game/arenaDefinitions';
import { recordMissionCompletion } from '../game/missionManager';
import { Trophy, Skull, RotateCcw, ArrowRight, Home, Crosshair, ShieldAlert, Clock, Cpu } from 'lucide-react';

export const MissionComplete: React.FC = () => {
  const {
    gameState,
    missionStats,
    settings,
    resetMission,
    setCurrentMission,
    currentMissionIndex,
    setScreen,
  } = useGameStore();

  const isVictory = gameState === 'victory';

  const accuracy =
    missionStats.shotsFired > 0
      ? Math.round((missionStats.shotsHit / missionStats.shotsFired) * 100)
      : 0;

  useEffect(() => {
    if (isVictory) {
      recordMissionCompletion(currentMissionIndex, missionStats.timeElapsed, accuracy);

      // Trigger celebratory sci-fi confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#b026ff', '#00ff66', '#ffffff'],
        });
      } catch {
        // Ignore if unavailable
      }
    }
  }, [isVictory, currentMissionIndex, missionStats.timeElapsed, accuracy]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextMission = () => {
    const nextId = currentMissionIndex + 1;
    if (MISSIONS.some((m) => m.id === nextId)) {
      setCurrentMission(nextId);
      resetMission();
    }
  };

  const handleRetry = () => {
    resetMission();
  };

  const handleReturnMenu = () => {
    setScreen('menu');
  };

  const hasNextMission = isVictory && currentMissionIndex < MISSIONS.length;

  return (
    <div style={backdropStyle}>
      <div className="cyber-panel" style={panelStyle}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          {isVictory ? (
            <>
              <Trophy size={48} color="var(--neon-green)" style={{ marginBottom: '10px' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-green)', fontSize: '2rem', letterSpacing: '2px' }}>
                MISSION ACCOMPLISHED
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '6px' }}>
                Sector 0{currentMissionIndex} cleared. All hostiles eliminated and extraction point secured.
              </p>
            </>
          ) : (
            <>
              <Skull size={48} color="var(--neon-red)" style={{ marginBottom: '10px' }} />
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-red)', fontSize: '2rem', letterSpacing: '2px' }}>
                OPERATIVE COMPROMISED
              </h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '6px' }}>
                Exosuit structural integrity reached zero. Tactical reboot required.
              </p>
            </>
          )}
        </div>

        {/* Tactical Performance Metrics Grid */}
        <div style={statsGridStyle}>
          <div style={statBoxStyle}>
            <div style={statLabelStyle}>
              <Crosshair size={15} color="var(--neon-cyan)" />
              <span>ELIMINATIONS</span>
            </div>
            <span style={statValueStyle}>
              {missionStats.kills} / {missionStats.totalEnemies}
            </span>
          </div>

          <div style={statBoxStyle}>
            <div style={statLabelStyle}>
              <Crosshair size={15} color="var(--neon-cyan)" />
              <span>FIRE ACCURACY</span>
            </div>
            <span style={statValueStyle}>{accuracy}%</span>
          </div>

          <div style={statBoxStyle}>
            <div style={statLabelStyle}>
              <ShieldAlert size={15} color="var(--neon-orange)" />
              <span>DAMAGE TAKEN</span>
            </div>
            <span style={{ ...statValueStyle, color: 'var(--neon-orange)' }}>
              {Math.round(missionStats.damageReceived)} HP
            </span>
          </div>

          <div style={statBoxStyle}>
            <div style={statLabelStyle}>
              <Clock size={15} color="var(--neon-yellow)" />
              <span>TIME ELAPSED</span>
            </div>
            <span style={{ ...statValueStyle, color: 'var(--neon-yellow)' }}>
              {formatTime(missionStats.timeElapsed)}
            </span>
          </div>
        </div>

        {/* Algorithm used by AI */}
        <div style={algoBannerStyle}>
          <Cpu size={16} color="var(--neon-cyan)" />
          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>AI ENEMY PATHFINDING ALGORITHM:</span>
          <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
            {settings.activeAlgorithm.toUpperCase()}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {hasNextMission && (
            <button
              className="cyber-btn"
              style={{ flex: 1, padding: '14px 20px', background: 'linear-gradient(135deg, rgba(0, 255, 102, 0.25), rgba(0, 240, 255, 0.25))', borderColor: 'var(--neon-green)' }}
              onClick={handleNextMission}
            >
              <ArrowRight size={18} /> NEXT SECTOR
            </button>
          )}

          <button
            className="cyber-btn cyber-btn-secondary"
            style={{ flex: 1, padding: '14px 20px' }}
            onClick={handleRetry}
          >
            <RotateCcw size={18} /> RETRY MISSION
          </button>

          <button
            className="cyber-btn"
            style={{ padding: '14px 20px' }}
            onClick={handleReturnMenu}
          >
            <Home size={18} /> MENU
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
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
};

const panelStyle: React.CSSProperties = {
  width: '560px',
  maxWidth: '92vw',
  padding: '36px',
};

const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: '20px',
};

const statBoxStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '4px',
  padding: '12px 16px',
};

const statLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.78rem',
  color: 'var(--text-dim)',
  letterSpacing: '1px',
};

const statValueStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '1.4rem',
  fontWeight: 800,
  color: '#ffffff',
  marginTop: '4px',
};

const algoBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(0, 240, 255, 0.05)',
  border: '1px solid rgba(0, 240, 255, 0.2)',
  padding: '10px 16px',
  borderRadius: '4px',
};
