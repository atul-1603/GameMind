import React from 'react';
import { AlgorithmLab } from './components/AlgorithmLab';
import { ConnectFourBoard } from './components/ConnectFourBoard';
import { EducationalTheory } from './components/EducationalTheory';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { MoveHistory } from './components/MoveHistory';
import { Navbar } from './components/Navbar';
import { SettingsModal } from './components/SettingsModal';
import { useGameStore } from './hooks/useGame';

export const App: React.FC = () => {
  const { activeTab } = useGameStore();

  return (
    <div className="app-shell min-h-screen flex flex-col font-sans antialiased">
      <Navbar />

      <main className="app-main flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {activeTab === 'play' && (
          <div className="play-layout grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
            <section className="board-stage lg:col-span-7 flex flex-col items-center justify-center w-full">
              <div className="section-heading section-heading-board">
                <div>
                  <span className="eyebrow">Live match</span>
                  <h1>Drop four. Read the board.</h1>
                  <p>Choose a column to place your disc and build a line before the AI does.</p>
                </div>
                <div className="board-status-dot" aria-hidden="true" />
              </div>
              <ConnectFourBoard />
            </section>

            <aside className="control-rail lg:col-span-5 flex flex-col gap-4 w-full">
              <GameHUD />
              <MoveHistory />
            </aside>
          </div>
        )}

        {activeTab === 'lab' && <AlgorithmLab />}

        {activeTab === 'theory' && <EducationalTheory />}

        {activeTab === 'settings' && <SettingsModal />}
      </main>

      <GameOverModal />

      <footer className="app-footer w-full border-t border-[rgba(255,255,255,0.06)] py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>CoreDrop 2D: Connect Four AI Arena · GameMind DAA</span>
          <span>Zero external dependencies · Built with React 19, TypeScript & Vitest</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
