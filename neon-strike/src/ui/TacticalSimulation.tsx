import React from 'react';
import { useGameStore } from '../game/gameStore';
import { ArrowLeft, Shield } from 'lucide-react';

export const TacticalSimulation: React.FC = () => {
  const { setScreen } = useGameStore();

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="cyber-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px' }}>
        <Shield size={48} color="var(--neon-orange)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-orange)', marginBottom: '12px' }}>
          TACTICAL DECISION SIMULATION
        </h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>
          Phase 1 Architecture Initialized. Turn-based Minimax and Alpha-Beta Pruning decision matrix with tactical cover evaluation.
        </p>
        <button className="cyber-btn cyber-btn-orange" onClick={() => setScreen('menu')}>
          <ArrowLeft size={16} /> BACK TO MAIN MENU
        </button>
      </div>
    </div>
  );
};
