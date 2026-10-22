import React from 'react';
import { X, HelpCircle, ShieldAlert, Cpu, Gamepad2 } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-dialog" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <HelpCircle style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>How to Play DimensionShift</h2>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Tutorial Content */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
          {/* Rules */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>
              <Gamepad2 style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
              <span>Core Sokoban Rules</span>
            </div>
            <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.6' }}>
              <li>You control the quantum drone (blue robot with glowing emerald visor).</li>
              <li>Walk adjacent to a crate and step into it to <strong>push</strong> it forward.</li>
              <li><strong>Crates cannot be pulled!</strong> You can only push crates into empty floor or target tiles.</li>
              <li>You cannot push two crates simultaneously, nor push a crate into a wall.</li>
              <li><strong>Victory:</strong> Place every crate onto a glowing neon containment pad.</li>
            </ul>
          </div>

          {/* Controls */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: '0.5rem' }}>
              Keyboard &amp; Mouse Controls
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
              <div style={{ background: '#020617', padding: '0.5rem', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Move Drone</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>WASD / Arrow Keys</span>
              </div>
              <div style={{ background: '#020617', padding: '0.5rem', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Undo Move</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>Z / Ctrl+Z</span>
              </div>
              <div style={{ background: '#020617', padding: '0.5rem', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Restart Level</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>R</span>
              </div>
              <div style={{ background: '#020617', padding: '0.5rem', borderRadius: '6px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Camera Orbit</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>Drag / Q, E</span>
              </div>
            </div>
          </div>

          {/* Deadlock Warning */}
          <div style={{ background: 'rgba(136, 19, 55, 0.4)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.5)', color: '#ffe4e6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#fb7185', marginBottom: '0.35rem' }}>
              <ShieldAlert style={{ width: '16px', height: '16px' }} />
              <span>Beware of Irreversible Deadlocks</span>
            </div>
            <p style={{ lineHeight: '1.4' }}>
              If a crate is pushed into a corner without a target, it can never be pulled back out!
              The game will display a real-time deadlock alert. Use <strong>Undo (Z)</strong> immediately to recover.
            </p>
          </div>

          {/* AI Solver */}
          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '1rem', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.35rem' }}>
              <Cpu style={{ width: '16px', height: '16px', color: '#34d399' }} />
              <span>Using the AI Assistant</span>
            </div>
            <p style={{ lineHeight: '1.4' }}>
              Stuck on a tricky level? Open the <strong>AI Solver Assistant</strong> on the bottom right.
              Choose between <strong>A*</strong>, <strong>BFS</strong>, <strong>Greedy</strong>, or <strong>DFS</strong>,
              click <strong>Solve</strong>, and watch the AI step through or playback the verified solution in 3D!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
