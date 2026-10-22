import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { GameHUD } from './components/GameHUD';
import { OnScreenControls } from './components/OnScreenControls';
import { SolverPanel } from './components/SolverPanel';
import { AlgorithmLab } from './components/AlgorithmLab';
import { LevelSelectModal } from './components/LevelSelectModal';
import { TutorialModal } from './components/TutorialModal';
import { TheoryModal } from './components/TheoryModal';
import { WinModal } from './components/WinModal';
import { GameState } from './game/gameState';
import { LEVELS } from './game/levelData';
import { GameScene } from './three/GameScene';
import { Direction } from './types/game';
import { AlgorithmType, SolverResult } from './types/solver';
import { runSolver } from './algorithms/solverRunner';

export function App() {
  const queryTab = new URLSearchParams(window.location.search).get('tab') as
    | 'play'
    | 'lab'
    | 'theory'
    | null;
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState<'play' | 'lab' | 'theory'>(queryTab ?? 'play');

  // Modals
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());

  // Game & Timer State
  const currentLevel = LEVELS[currentLevelIndex];
  const [gameState, setGameState] = useState<GameState>(() => new GameState(currentLevel));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Sync trigger counter for forced re-renders
  const [, setTick] = useState(0);
  const rerender = () => setTick(t => t + 1);

  // 3D Scene Container Ref
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<GameScene | null>(null);

  // AI Solver State
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('ASTAR');
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStepIndex, setPlaybackStepIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackTimerRef = useRef<number | null>(null);

  // Initialize or reload 3D Scene
  useEffect(() => {
    if (!mountRef.current) return;

    if (!sceneRef.current) {
      sceneRef.current = new GameScene(mountRef.current, currentLevel);
    } else {
      sceneRef.current.loadLevel(currentLevel);
    }

    const newGame = new GameState(currentLevel);
    setGameState(newGame);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setIsWinModalOpen(false);
    setSolverResult(null);
    setIsPlaying(false);
    setPlaybackStepIndex(0);
    rerender();
  }, [currentLevelIndex]);

  // Timer interval
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Handle movement
  const handleMove = useCallback(
    (direction: Direction) => {
      if (isPlaying || isWinModalOpen) return;

      const res = gameState.tryMove(direction);
      if (res.success && sceneRef.current) {
        sceneRef.current.updateGameState(
          gameState.player,
          gameState.crates,
          gameState.targetsSet,
          direction
        );

        if (gameState.isWon()) {
          setIsTimerRunning(false);
          setIsWinModalOpen(true);
          setCompletedLevels(prev => new Set(prev).add(currentLevel.id));
          sceneRef.current.triggerWinCelebration(gameState.crates);
        }

        rerender();
      }
    },
    [gameState, isPlaying, isWinModalOpen, currentLevel.id]
  );

  // Handle Undo
  const handleUndo = useCallback(() => {
    if (isPlaying || isWinModalOpen) return;
    if (gameState.undo() && sceneRef.current) {
      sceneRef.current.updateGameState(
        gameState.player,
        gameState.crates,
        gameState.targetsSet,
        undefined,
        false
      );
      rerender();
    }
  }, [gameState, isPlaying, isWinModalOpen]);

  // Handle Reset
  const handleReset = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    }
    gameState.reset();
    if (sceneRef.current) {
      sceneRef.current.updateGameState(
        gameState.player,
        gameState.crates,
        gameState.targetsSet,
        undefined,
        true
      );
    }
    setElapsedSeconds(0);
    setIsTimerRunning(true);
    setIsWinModalOpen(false);
    setPlaybackStepIndex(0);
    rerender();
  }, [gameState, isPlaying]);

  // Handle Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside form element or modal is active
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') {
        return;
      }
      if (isLevelSelectOpen || isTutorialOpen || isTheoryOpen) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove('RIGHT');
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey || !e.shiftKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleReset();
          break;
        case 'q':
        case 'Q':
          sceneRef.current?.rotateLeft();
          break;
        case 'e':
        case 'E':
          sceneRef.current?.rotateRight();
          break;
        case '+':
        case '=':
          sceneRef.current?.zoomIn();
          break;
        case '-':
        case '_':
          sceneRef.current?.zoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleMove,
    handleUndo,
    handleReset,
    isLevelSelectOpen,
    isTutorialOpen,
    isTheoryOpen,
  ]);

  // Solve current state using AI
  const handleSolve = () => {
    setIsSolving(true);
    setIsPlaying(false);
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);

    setTimeout(() => {
      try {
        const result = runSolver(
          selectedAlgorithm,
          currentLevel,
          gameState.player,
          gameState.crates
        );
        setSolverResult(result);
        setPlaybackStepIndex(0);
      } finally {
        setIsSolving(false);
      }
    }, 50);
  };

  // Step next in solution
  const handleStepNext = useCallback(() => {
    if (!solverResult || solverResult.status !== 'SOLVED') return;
    if (playbackStepIndex >= solverResult.actions.length) return;

    const action = solverResult.actions[playbackStepIndex];
    const res = gameState.tryMove(action.direction);

    if (res.success && sceneRef.current) {
      sceneRef.current.updateGameState(
        gameState.player,
        gameState.crates,
        gameState.targetsSet,
        action.direction
      );

      if (gameState.isWon()) {
        setIsTimerRunning(false);
        setIsWinModalOpen(true);
        setCompletedLevels(prev => new Set(prev).add(currentLevel.id));
        sceneRef.current.triggerWinCelebration(gameState.crates);
      }
    }

    setPlaybackStepIndex(idx => idx + 1);
    rerender();
  }, [solverResult, playbackStepIndex, gameState, currentLevel.id]);

  // Play / Pause automated solution playback
  useEffect(() => {
    if (!isPlaying) {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
      return;
    }

    if (!solverResult || playbackStepIndex >= solverResult.actions.length) {
      setIsPlaying(false);
      return;
    }

    const delay = Math.max(120, 400 / playbackSpeed);

    playbackTimerRef.current = window.setTimeout(() => {
      handleStepNext();
    }, delay);

    return () => {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [isPlaying, playbackStepIndex, solverResult, playbackSpeed, handleStepNext]);

  const handleResetPlayback = () => {
    setIsPlaying(false);
    if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    handleReset();
    setPlaybackStepIndex(0);
  };

  const handleNextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(idx => idx + 1);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0f1d' }}>
      {/* 1. Header Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={tab => {
          if (tab === 'theory') {
            setIsTheoryOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        currentLevelName={currentLevel.name}
        onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />

      {/* 2. 3D Canvas Viewport */}
      <div
        ref={mountRef}
        style={{ width: '100%', height: '100%', cursor: 'grab', outline: 'none' }}
      />

      {/* 3. In-Game HUD & Controls (When in Play Mode) */}
      {currentTab === 'play' && (
        <>
          <GameHUD
            level={currentLevel}
            moveCount={gameState.moveCount}
            pushCount={gameState.pushCount}
            cratesPlaced={gameState.crates.length - gameState.cratesRemaining()}
            totalCrates={gameState.crates.length}
            elapsedSeconds={elapsedSeconds}
            isDeadlocked={gameState.isDeadlocked()}
            canUndo={gameState.moveHistory.length > 0}
            onUndo={handleUndo}
            onReset={handleReset}
            onCameraReset={() => sceneRef.current?.resetCamera()}
            onCameraZoomIn={() => sceneRef.current?.zoomIn()}
            onCameraZoomOut={() => sceneRef.current?.zoomOut()}
            onCameraRotateLeft={() => sceneRef.current?.rotateLeft()}
            onCameraRotateRight={() => sceneRef.current?.rotateRight()}
          />

          <OnScreenControls onMove={handleMove} disabled={isPlaying || isWinModalOpen} />

          <SolverPanel
            selectedAlgorithm={selectedAlgorithm}
            onChangeAlgorithm={setSelectedAlgorithm}
            onSolve={handleSolve}
            solverResult={solverResult}
            isSolving={isSolving}
            isPlaying={isPlaying}
            currentStepIndex={playbackStepIndex}
            totalSteps={solverResult?.actions.length ?? 0}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onStepNext={handleStepNext}
            onResetPlayback={handleResetPlayback}
            playbackSpeed={playbackSpeed}
            onChangeSpeed={setPlaybackSpeed}
          />
        </>
      )}

      {/* 4. Algorithm Lab Mode Overlay */}
      {currentTab === 'lab' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: 'rgba(2, 6, 23, 0.88)',
            backdropFilter: 'blur(12px)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <AlgorithmLab
            level={currentLevel}
            onApplySolution={(algo, res) => {
              setSelectedAlgorithm(algo);
              setSolverResult(res);
              setCurrentTab('play');
            }}
          />
        </div>
      )}

      {/* 5. Modals */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        onClose={() => setIsLevelSelectOpen(false)}
        levels={LEVELS}
        currentLevelId={currentLevel.id}
        onSelectLevel={id => {
          const idx = LEVELS.findIndex(l => l.id === id);
          if (idx !== -1) setCurrentLevelIndex(idx);
        }}
        completedLevels={completedLevels}
      />

      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <TheoryModal isOpen={isTheoryOpen} onClose={() => setIsTheoryOpen(false)} />

      <WinModal
        isOpen={isWinModalOpen}
        level={currentLevel}
        moveCount={gameState.moveCount}
        pushCount={gameState.pushCount}
        elapsedSeconds={elapsedSeconds}
        hasNextLevel={currentLevelIndex < LEVELS.length - 1}
        onNextLevel={handleNextLevel}
        onRestart={handleReset}
      />
    </div>
  );
}
export default App;
