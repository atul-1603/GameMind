import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types/game';

interface OnScreenControlsProps {
  onMove: (dir: Direction) => void;
  disabled?: boolean;
}

export const OnScreenControls: React.FC<OnScreenControlsProps> = ({ onMove, disabled }) => {
  return (
    <div className="controls-bottom-left">
      <div className="glass-panel dpad-container">
        {/* UP */}
        <button
          onClick={() => onMove('UP')}
          disabled={disabled}
          className="dpad-btn"
          title="Move Up (W / Up Arrow)"
        >
          <ArrowUp style={{ width: '20px', height: '20px' }} />
        </button>

        {/* LEFT, DOWN, RIGHT */}
        <div className="dpad-row">
          <button
            onClick={() => onMove('LEFT')}
            disabled={disabled}
            className="dpad-btn"
            title="Move Left (A / Left Arrow)"
          >
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </button>
          <button
            onClick={() => onMove('DOWN')}
            disabled={disabled}
            className="dpad-btn"
            title="Move Down (S / Down Arrow)"
          >
            <ArrowDown style={{ width: '20px', height: '20px' }} />
          </button>
          <button
            onClick={() => onMove('RIGHT')}
            disabled={disabled}
            className="dpad-btn"
            title="Move Right (D / Right Arrow)"
          >
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
