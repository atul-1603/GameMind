import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCcw, Footprints, Clock, Target } from 'lucide-react';
import { LevelDefinition } from '../types/game';

interface WinModalProps {
  isOpen: boolean;
  level: LevelDefinition;
  moveCount: number;
  pushCount: number;
  elapsedSeconds: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  level,
  moveCount,
  pushCount,
  elapsedSeconds,
  hasNextLevel,
  onNextLevel,
  onRestart,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#10b981', '#6366f1', '#f59e0b'],
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div
        className="glass-panel-glow animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.25rem',
          borderRadius: '16px',
        }}
      >
        {/* Trophy Icon */}
        <div className="brand-icon-box" style={{ width: '64px', height: '64px', borderRadius: '16px' }}>
          <Trophy style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
        </div>

        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#38bdf8',
            }}
          >
            Chamber Completed!
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            {level.name}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            All quantum containment cores are securely locked on targets.
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            background: 'rgba(2, 6, 23, 0.7)',
            padding: '0.75rem',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            fontFamily: 'monospace',
          }}
        >
          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
              <Footprints style={{ width: '12px', height: '12px', color: '#38bdf8' }} /> Moves
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
              {moveCount}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
              <Target style={{ width: '12px', height: '12px', color: '#f59e0b' }} /> Pushes
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
              {pushCount}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
              <Clock style={{ width: '12px', height: '12px', color: '#818cf8' }} /> Time
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#cbd5e1', marginTop: '0.2rem' }}>
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button onClick={onRestart} className="btn-secondary" style={{ flex: 1, padding: '0.65rem' }}>
            <RotateCcw style={{ width: '15px', height: '15px' }} /> Replay
          </button>

          {hasNextLevel ? (
            <button onClick={onNextLevel} className="btn-primary" style={{ flex: 1, padding: '0.65rem' }}>
              <span>Next Chamber</span>
              <ArrowRight style={{ width: '15px', height: '15px' }} />
            </button>
          ) : (
            <button onClick={onRestart} className="btn-primary" style={{ flex: 1, padding: '0.65rem' }}>
              <span>Finish Game</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
