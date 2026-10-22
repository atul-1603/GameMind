import React from 'react';
import { useGameStore } from './game/gameStore';
import { MainMenu } from './ui/MainMenu';
import { Settings } from './ui/Settings';
import { AlgorithmLab } from './ui/AlgorithmLab';
import { TacticalSimulation } from './ui/TacticalSimulation';
import { GameScene } from './scene/GameScene';

export const App: React.FC = () => {
  const { currentScreen, currentMissionIndex } = useGameStore();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="scanlines" />

      {currentScreen === 'menu' && <MainMenu />}
      {currentScreen === 'campaign' && <GameScene key={currentMissionIndex} />}
      {currentScreen === 'lab' && <AlgorithmLab />}
      {currentScreen === 'tactical' && <TacticalSimulation />}
      {currentScreen === 'settings' && <Settings />}
    </div>
  );
};

export default App;
