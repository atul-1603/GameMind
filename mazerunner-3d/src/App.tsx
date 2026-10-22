import React, { useState } from 'react';
import { AlgorithmLab } from './components/AlgorithmLab';
import { GameHUD } from './components/GameHUD';
import { HelpModal } from './components/HelpModal';
import { LearnAlgorithms } from './components/LearnAlgorithms';
import { MainMenu } from './components/MainMenu';
import { PauseMenu } from './components/PauseMenu';
import { SettingsModal } from './components/SettingsModal';
import { SolverPanel } from './components/SolverPanel';
import { VictoryScreen } from './components/VictoryScreen';
import { useGameStore } from './game/gameState';
import { GameScene } from './scene/GameScene';

export const App: React.FC = () => {
  const { screen } = useGameStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Screen Routing */}
      {screen === 'MAIN_MENU' && (
        <MainMenu onOpenSettings={() => setShowSettings(true)} />
      )}

      {screen === 'GAMEPLAY' && (
        <>
          <GameScene />
          <GameHUD
            onOpenSettings={() => setShowSettings(true)}
            onOpenHelp={() => setShowHelp(true)}
          />
          <SolverPanel />
          <PauseMenu onOpenSettings={() => setShowSettings(true)} />
          <VictoryScreen />
        </>
      )}

      {screen === 'ALGO_LAB' && <AlgorithmLab />}

      {screen === 'LEARN' && <LearnAlgorithms />}

      {/* Global Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
};

export default App;
