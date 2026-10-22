import React from 'react';
import { X, Layers, CheckCircle2 } from 'lucide-react';
import { LevelDefinition } from '../types/game';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  levels: LevelDefinition[];
  currentLevelId: number;
  onSelectLevel: (levelId: number) => void;
  completedLevels: Set<number>;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  levels,
  currentLevelId,
  onSelectLevel,
  completedLevels,
}) => {
  if (!isOpen) return null;

  const getDifficultyStyle = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return { color: '#34d399', background: 'rgba(6, 78, 59, 0.6)', border: '1px solid rgba(5, 150, 105, 0.7)' };
      case 'Easy':
        return { color: '#38bdf8', background: 'rgba(12, 74, 110, 0.6)', border: '1px solid rgba(2, 132, 199, 0.7)' };
      case 'Medium':
        return { color: '#fbbf24', background: 'rgba(120, 53, 15, 0.6)', border: '1px solid rgba(217, 119, 6, 0.7)' };
      case 'Challenging':
        return { color: '#fb923c', background: 'rgba(124, 45, 18, 0.6)', border: '1px solid rgba(234, 88, 12, 0.7)' };
      case 'Expert':
        return { color: '#f43f5e', background: 'rgba(136, 19, 55, 0.6)', border: '1px solid rgba(225, 29, 72, 0.7)' };
      default:
        return { color: '#94a3b8', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(51, 65, 85, 0.7)' };
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-dialog" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Select Puzzle Chamber</h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Level List */}
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {levels.map(lvl => {
            const isCurrent = lvl.id === currentLevelId;
            const isCompleted = completedLevels.has(lvl.id);

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: isCurrent ? '2px solid #38bdf8' : '1px solid #334155',
                  background: isCurrent ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.75)',
                  boxShadow: isCurrent ? '0 0 16px rgba(56, 189, 248, 0.3)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 700, color: '#94a3b8' }}>
                    Chamber {lvl.id}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {isCompleted && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          fontSize: '0.65rem',
                          color: '#34d399',
                          background: 'rgba(6, 78, 59, 0.7)',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px',
                        }}
                      >
                        <CheckCircle2 style={{ width: '12px', height: '12px' }} /> Done
                      </span>
                    )}
                    <span
                      style={{
                        ...getDifficultyStyle(lvl.difficulty),
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '9999px',
                      }}
                    >
                      {lvl.difficulty}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{lvl.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>{lvl.description}</div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid #1e293b',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    color: '#94a3b8',
                  }}
                >
                  <span>Crates: <strong style={{ color: '#f8fafc' }}>{lvl.crates.length}</strong></span>
                  <span>Grid: <strong style={{ color: '#f8fafc' }}>{lvl.width}&times;{lvl.height}</strong></span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
