import React from 'react';
import {
  RotateCcw,
  Undo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  AlertTriangle,
  Clock,
  Target,
  Footprints,
} from 'lucide-react';
import { LevelDefinition } from '../types/game';

interface GameHUDProps {
  level: LevelDefinition;
  moveCount: number;
  pushCount: number;
  cratesPlaced: number;
  totalCrates: number;
  elapsedSeconds: number;
  isDeadlocked: boolean;
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onCameraReset: () => void;
  onCameraZoomIn: () => void;
  onCameraZoomOut: () => void;
  onCameraRotateLeft: () => void;
  onCameraRotateRight: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  moveCount,
  pushCount,
  cratesPlaced,
  totalCrates,
  elapsedSeconds,
  isDeadlocked,
  canUndo,
  onUndo,
  onReset,
  onCameraReset,
  onCameraZoomIn,
  onCameraZoomOut,
  onCameraRotateLeft,
  onCameraRotateRight,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getDifficultyStyle = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return { color: '#34d399', background: 'rgba(6, 78, 59, 0.6)', borderColor: 'rgba(5, 150, 105, 0.7)' };
      case 'Easy':
        return { color: '#38bdf8', background: 'rgba(12, 74, 110, 0.6)', borderColor: 'rgba(2, 132, 199, 0.7)' };
      case 'Medium':
        return { color: '#fbbf24', background: 'rgba(120, 53, 15, 0.6)', borderColor: 'rgba(217, 119, 6, 0.7)' };
      case 'Challenging':
        return { color: '#fb923c', background: 'rgba(124, 45, 18, 0.6)', borderColor: 'rgba(234, 88, 12, 0.7)' };
      case 'Expert':
        return { color: '#f43f5e', background: 'rgba(136, 19, 55, 0.6)', borderColor: 'rgba(225, 29, 72, 0.7)' };
      default:
        return { color: '#94a3b8', background: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(51, 65, 85, 0.7)' };
    }
  };

  return (
    <>
      {/* Top Left: Level Info & Metrics */}
      <div className="hud-left">
        <div className="glass-panel hud-card">
          <div className="hud-level-header">
            <div>
              <div className="hud-level-num">Chamber {level.id}</div>
              <div className="hud-level-name">{level.name}</div>
            </div>
            <span className="hud-difficulty-badge" style={getDifficultyStyle(level.difficulty)}>
              {level.difficulty}
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hud-metrics-grid">
            <div className="hud-metric-box">
              <div className="hud-metric-label">
                <Footprints style={{ width: '12px', height: '12px', color: '#38bdf8' }} /> Moves
              </div>
              <div className="hud-metric-val" style={{ color: '#ffffff' }}>
                {moveCount}
              </div>
            </div>

            <div className="hud-metric-box">
              <div className="hud-metric-label">Pushes</div>
              <div className="hud-metric-val" style={{ color: '#f59e0b' }}>
                {pushCount}
              </div>
            </div>

            <div className="hud-metric-box">
              <div className="hud-metric-label">
                <Target style={{ width: '12px', height: '12px', color: '#10b981' }} /> Goals
              </div>
              <div className="hud-metric-val" style={{ color: '#10b981' }}>
                {cratesPlaced}/{totalCrates}
              </div>
            </div>

            <div className="hud-metric-box">
              <div className="hud-metric-label">
                <Clock style={{ width: '12px', height: '12px', color: '#818cf8' }} /> Time
              </div>
              <div className="hud-metric-val" style={{ color: '#cbd5e1' }}>
                {formatTime(elapsedSeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Deadlock Alert Notification */}
        {isDeadlocked && (
          <div className="hud-deadlock-alert">
            <AlertTriangle style={{ width: '20px', height: '20px', color: '#f43f5e', flexShrink: 0 }} />
            <div>
              <strong>Deadlock Detected:</strong> Crate trapped in corner! Press <strong>Undo (Z)</strong> or <strong>Restart (R)</strong>.
            </div>
          </div>
        )}
      </div>

      {/* Top Right: Game Action Bar & Camera Controls */}
      <div className="hud-right">
        <div className="glass-panel hud-btn-group">
          <button onClick={onUndo} disabled={!canUndo} className="btn-icon" title="Undo Move (Z)">
            <Undo2 style={{ width: '16px', height: '16px' }} />
          </button>
          <button
            onClick={onReset}
            className="btn-icon"
            style={{ color: '#fb7185' }}
            title="Restart Level (R)"
          >
            <RotateCcw style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Camera Toolbox */}
        <div className="glass-panel hud-camera-group">
          <button onClick={onCameraRotateLeft} className="btn-icon" title="Rotate Left (Q)">
            <RotateCcw style={{ width: '15px', height: '15px' }} />
          </button>
          <button onClick={onCameraRotateRight} className="btn-icon" title="Rotate Right (E)">
            <RotateCw style={{ width: '15px', height: '15px' }} />
          </button>
          <button onClick={onCameraZoomIn} className="btn-icon" title="Zoom In (+)">
            <ZoomIn style={{ width: '15px', height: '15px' }} />
          </button>
          <button onClick={onCameraZoomOut} className="btn-icon" title="Zoom Out (-)">
            <ZoomOut style={{ width: '15px', height: '15px' }} />
          </button>
          <button
            onClick={onCameraReset}
            className="btn-icon"
            style={{ color: '#38bdf8' }}
            title="Reset Camera View"
          >
            <Maximize2 style={{ width: '15px', height: '15px' }} />
          </button>
        </div>
      </div>
    </>
  );
};
