import { create } from 'zustand';
import { AlgorithmResult, AlgorithmType, runAlgorithm } from '../algorithms';
import { LEVEL_DEFINITIONS } from '../maze/levelDefinitions';
import { generateMaze } from '../maze/mazeGenerator';
import { MazeGrid, Point2D } from '../maze/mazeTypes';
import { sound } from '../utils/audio';

export type AppScreen = 'MAIN_MENU' | 'GAMEPLAY' | 'ALGO_LAB' | 'LEARN' | 'SETTINGS';
export type CameraMode = 'FIRST_PERSON' | 'BIRDS_EYE';
export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PlayerState {
  x: number;
  z: number;
  y: number;
  yaw: number;
  pitch: number;
  gridX: number;
  gridY: number;
  steps: number;
  orbsCollected: number;
  timeElapsed: number;
  isMoving: boolean;
  isSprinting: boolean;
}

export interface AISolverState {
  isOpen: boolean;
  selectedAlgorithm: AlgorithmType;
  result: AlgorithmResult | null;
  currentStepIndex: number;
  isPlayingVisualization: boolean;
  playbackSpeed: number; // 1x, 2x, 5x, 10x, 25x, 50x
  isExecutingPath: boolean;
  executionPathIndex: number;
  showExploration: boolean;
  showFinalRoute: boolean;
}

export interface GameStore {
  // Navigation & Screens
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;

  // Level & Maze
  currentLevelId: number;
  maze: MazeGrid;
  customSeed: number | null;
  setLevel: (levelId: number) => void;
  restartLevel: () => void;
  generateNewSeed: () => void;
  setWeightedMode: (enabled: boolean) => void;
  weightedMode: boolean;

  // Player
  player: PlayerState;
  updatePlayerPosition: (
    x: number,
    z: number,
    y: number,
    yaw: number,
    pitch: number,
    gridX: number,
    gridY: number
  ) => void;
  addStep: () => void;
  collectOrbAt: (gridX: number, gridY: number) => void;
  resetPlayerToStart: () => void;

  // Camera & Game Loop
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  toggleCameraMode: () => void;
  isPaused: boolean;
  setPaused: (paused: boolean) => void;
  isWon: boolean;
  setWon: (won: boolean) => void;
  isPointerLocked: boolean;
  setPointerLocked: (locked: boolean) => void;

  // Settings
  graphicsQuality: GraphicsQuality;
  mouseSensitivity: number;
  soundEnabled: boolean;
  setGraphicsQuality: (q: GraphicsQuality) => void;
  setMouseSensitivity: (s: number) => void;
  setSoundEnabled: (enabled: boolean) => void;

  // AI Solver
  aiSolver: AISolverState;
  openAISolver: () => void;
  closeAISolver: () => void;
  setSelectedAlgorithm: (algo: AlgorithmType) => void;
  solveMazeWithAI: () => void;
  stepVisualization: (delta: number) => void;
  setPlayingVisualization: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleShowExploration: () => void;
  toggleShowFinalRoute: () => void;
  executeAISolution: () => void;
  stopAIExecution: () => void;
  setExecutionPathIndex: (index: number) => void;
  resetAISolver: () => void;

  // Timer
  incrementTime: (deltaSeconds: number) => void;
}

function initMazeForLevel(levelId: number, seed?: number, weighted?: boolean): MazeGrid {
  const def = LEVEL_DEFINITIONS.find((l) => l.id === levelId) || LEVEL_DEFINITIONS[0];
  const useSeed = seed ?? (1000 + levelId * 777);
  return generateMaze({
    width: def.width,
    height: def.height,
    seed: useSeed,
    loopProbability: def.loopProbability,
    hasWeightedTerrain: weighted !== undefined ? weighted : def.hasWeightedTerrain,
    orbCount: def.orbCount,
  });
}

export const useGameStore = create<GameStore>((set, get) => {
  const initialMaze = initMazeForLevel(1);

  return {
    screen: 'MAIN_MENU',
    setScreen: (screen) => {
      sound.playClick();
      set({ screen });
    },

    currentLevelId: 1,
    maze: initialMaze,
    customSeed: null,
    weightedMode: false,

    setLevel: (levelId) => {
      sound.playClick();
      const def = LEVEL_DEFINITIONS.find((l) => l.id === levelId) || LEVEL_DEFINITIONS[0];
      const newMaze = initMazeForLevel(levelId, undefined, get().weightedMode || def.hasWeightedTerrain);
      set({
        currentLevelId: levelId,
        maze: newMaze,
        isWon: false,
        isPaused: false,
        player: {
          x: newMaze.start.x,
          z: newMaze.start.y,
          y: 0.5,
          yaw: 0,
          pitch: 0,
          gridX: newMaze.start.x,
          gridY: newMaze.start.y,
          steps: 0,
          orbsCollected: 0,
          timeElapsed: 0,
          isMoving: false,
          isSprinting: false,
        },
        aiSolver: {
          ...get().aiSolver,
          result: null,
          currentStepIndex: 0,
          isPlayingVisualization: false,
          isExecutingPath: false,
        },
      });
    },

    restartLevel: () => {
      sound.playClick();
      const state = get();
      const newMaze = initMazeForLevel(state.currentLevelId, state.maze.seed, state.weightedMode);
      set({
        maze: newMaze,
        isWon: false,
        isPaused: false,
        player: {
          x: newMaze.start.x,
          z: newMaze.start.y,
          y: 0.5,
          yaw: 0,
          pitch: 0,
          gridX: newMaze.start.x,
          gridY: newMaze.start.y,
          steps: 0,
          orbsCollected: 0,
          timeElapsed: 0,
          isMoving: false,
          isSprinting: false,
        },
        aiSolver: {
          ...state.aiSolver,
          result: null,
          currentStepIndex: 0,
          isPlayingVisualization: false,
          isExecutingPath: false,
        },
      });
    },

    generateNewSeed: () => {
      sound.playClick();
      const state = get();
      const newSeed = Math.floor(Math.random() * 1000000);
      const newMaze = initMazeForLevel(state.currentLevelId, newSeed, state.weightedMode);
      set({
        customSeed: newSeed,
        maze: newMaze,
        isWon: false,
        isPaused: false,
        player: {
          x: newMaze.start.x,
          z: newMaze.start.y,
          y: 0.5,
          yaw: 0,
          pitch: 0,
          gridX: newMaze.start.x,
          gridY: newMaze.start.y,
          steps: 0,
          orbsCollected: 0,
          timeElapsed: 0,
          isMoving: false,
          isSprinting: false,
        },
        aiSolver: {
          ...state.aiSolver,
          result: null,
          currentStepIndex: 0,
          isPlayingVisualization: false,
          isExecutingPath: false,
        },
      });
    },

    setWeightedMode: (enabled) => {
      const state = get();
      const newMaze = initMazeForLevel(state.currentLevelId, state.maze.seed, enabled);
      set({ weightedMode: enabled, maze: newMaze });
    },

    player: {
      x: initialMaze.start.x,
      z: initialMaze.start.y,
      y: 0.5,
      yaw: 0,
      pitch: 0,
      gridX: initialMaze.start.x,
      gridY: initialMaze.start.y,
      steps: 0,
      orbsCollected: 0,
      timeElapsed: 0,
      isMoving: false,
      isSprinting: false,
    },

    updatePlayerPosition: (x, z, y, yaw, pitch, gridX, gridY) => {
      set((state) => ({
        player: {
          ...state.player,
          x,
          z,
          y,
          yaw,
          pitch,
          gridX,
          gridY,
        },
      }));
    },

    addStep: () => {
      set((state) => ({
        player: {
          ...state.player,
          steps: state.player.steps + 1,
        },
      }));
      sound.playStep();
    },

    collectOrbAt: (gridX, gridY) => {
      const state = get();
      const cell = state.maze.cells[gridY]?.[gridX];
      if (cell && cell.hasOrb) {
        cell.hasOrb = false;
        cell.type = 'EMPTY';
        sound.playOrbPickup();
        set((s) => ({
          player: {
            ...s.player,
            orbsCollected: s.player.orbsCollected + 1,
          },
        }));
      }
    },

    resetPlayerToStart: () => {
      const maze = get().maze;
      set((state) => ({
        player: {
          ...state.player,
          x: maze.start.x,
          z: maze.start.y,
          gridX: maze.start.x,
          gridY: maze.start.y,
        },
      }));
    },

    cameraMode: 'FIRST_PERSON',
    setCameraMode: (mode) => set({ cameraMode: mode }),
    toggleCameraMode: () =>
      set((state) => ({
        cameraMode: state.cameraMode === 'FIRST_PERSON' ? 'BIRDS_EYE' : 'FIRST_PERSON',
      })),

    isPaused: false,
    setPaused: (paused) => set({ isPaused: paused }),

    isWon: false,
    setWon: (won) => {
      if (won && !get().isWon) {
        sound.playVictory();
      }
      set({ isWon: won });
    },

    isPointerLocked: false,
    setPointerLocked: (locked) => set({ isPointerLocked: locked }),

    graphicsQuality: 'HIGH',
    mouseSensitivity: 1.2,
    soundEnabled: true,
    setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
    setMouseSensitivity: (mouseSensitivity) => set({ mouseSensitivity }),
    setSoundEnabled: (soundEnabled) => {
      sound.enabled = soundEnabled;
      set({ soundEnabled });
    },

    aiSolver: {
      isOpen: false,
      selectedAlgorithm: 'ASTAR',
      result: null,
      currentStepIndex: 0,
      isPlayingVisualization: false,
      playbackSpeed: 5,
      isExecutingPath: false,
      executionPathIndex: 0,
      showExploration: true,
      showFinalRoute: true,
    },

    openAISolver: () =>
      set((state) => ({
        aiSolver: { ...state.aiSolver, isOpen: true },
      })),
    closeAISolver: () =>
      set((state) => ({
        aiSolver: { ...state.aiSolver, isOpen: false },
      })),
    setSelectedAlgorithm: (selectedAlgorithm) =>
      set((state) => ({
        aiSolver: {
          ...state.aiSolver,
          selectedAlgorithm,
          result: null,
          currentStepIndex: 0,
          isPlayingVisualization: false,
          isExecutingPath: false,
        },
      })),

    solveMazeWithAI: () => {
      sound.playClick();
      const state = get();
      const playerPos: Point2D = {
        x: Math.max(1, Math.min(state.maze.width - 2, Math.round(state.player.x))),
        y: Math.max(1, Math.min(state.maze.height - 2, Math.round(state.player.z))),
      };

      // Ensure start cell is walkable; if player is slightly off, clamp to nearest walkable cell
      let startPoint = playerPos;
      if (state.maze.cells[startPoint.y][startPoint.x].type === 'WALL') {
        startPoint = state.maze.start;
      }

      const result = runAlgorithm(
        state.aiSolver.selectedAlgorithm,
        state.maze,
        startPoint,
        state.maze.exit
      );

      set({
        aiSolver: {
          ...state.aiSolver,
          result,
          currentStepIndex: result.explorationSteps.length, // Show full result by default
          isPlayingVisualization: false,
          isExecutingPath: false,
          executionPathIndex: 0,
        },
      });
    },

    stepVisualization: (delta) => {
      set((state) => {
        if (!state.aiSolver.result) return state;
        const totalSteps = state.aiSolver.result.explorationSteps.length;
        const nextIndex = Math.max(
          0,
          Math.min(totalSteps, state.aiSolver.currentStepIndex + delta)
        );
        sound.playAlgorithmStep();
        return {
          aiSolver: {
            ...state.aiSolver,
            currentStepIndex: nextIndex,
          },
        };
      });
    },

    setPlayingVisualization: (isPlayingVisualization) =>
      set((state) => ({
        aiSolver: {
          ...state.aiSolver,
          isPlayingVisualization,
          currentStepIndex:
            isPlayingVisualization && state.aiSolver.currentStepIndex >= (state.aiSolver.result?.explorationSteps.length ?? 0)
              ? 0
              : state.aiSolver.currentStepIndex,
        },
      })),

    setPlaybackSpeed: (playbackSpeed) =>
      set((state) => ({
        aiSolver: { ...state.aiSolver, playbackSpeed },
      })),

    toggleShowExploration: () =>
      set((state) => ({
        aiSolver: {
          ...state.aiSolver,
          showExploration: !state.aiSolver.showExploration,
        },
      })),

    toggleShowFinalRoute: () =>
      set((state) => ({
        aiSolver: {
          ...state.aiSolver,
          showFinalRoute: !state.aiSolver.showFinalRoute,
        },
      })),

    executeAISolution: () => {
      const state = get();
      if (!state.aiSolver.result || state.aiSolver.result.path.length === 0) return;
      sound.playClick();
      set({
        aiSolver: {
          ...state.aiSolver,
          isExecutingPath: true,
          executionPathIndex: 0,
          isPlayingVisualization: false,
        },
      });
    },

    stopAIExecution: () =>
      set((state) => ({
        aiSolver: {
          ...state.aiSolver,
          isExecutingPath: false,
        },
      })),

    setExecutionPathIndex: (index) =>
      set((state) => ({
        aiSolver: {
          ...state.aiSolver,
          executionPathIndex: index,
        },
      })),

    resetAISolver: () =>
      set((state) => ({
        aiSolver: {
          ...state.aiSolver,
          result: null,
          currentStepIndex: 0,
          isPlayingVisualization: false,
          isExecutingPath: false,
          executionPathIndex: 0,
        },
      })),

    incrementTime: (deltaSeconds) => {
      set((state) => ({
        player: {
          ...state.player,
          timeElapsed: state.player.timeElapsed + deltaSeconds,
        },
      }));
    },
  };
});
