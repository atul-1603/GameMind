import React from 'react';
import { useGameStore } from '../game/gameStore';
import { ArrowLeft, Cpu } from 'lucide-react';

export const AlgorithmLab: React.FC = () => {
  const { setScreen } = useGameStore();

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="cyber-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px' }}>
        <Cpu size={48} color="var(--neon-cyan)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--neon-cyan)', marginBottom: '12px' }}>
          AI ALGORITHM LABORATORY
        </h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '24px' }}>
          Phase 1 Architecture Initialized. The comprehensive laboratory will benchmark BFS, DFS, Dijkstra, A*, and Greedy Best-First Search across empirical and theoretical metrics.
        </p>
        <button className="cyber-btn" onClick={() => setScreen('menu')}>
          <ArrowLeft size={16} /> BACK TO MAIN MENU
        </button>
      </div>
    </div>
  );
};
