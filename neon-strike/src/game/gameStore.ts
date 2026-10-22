import { create } from 'zustand';
import type { AlgorithmType, GridCoord } from '../algorithms/pathTypes';

export type ScreenType = 'menu' | 'campaign' | 'lab' | 'tactical' | 'settings';
export type GamePlayState = 'ready' | 'playing' | 'paused' | 'victory' | 'defeat';
export type GraphicsQuality = 'low' | 'medium' | 'high';
export type AIDifficulty = 'normal' | 'hard' | 'adaptive';

export interface AIDiagnosticInfo {
  enemyId: string;
  state: string;
  algorithm: AlgorithmType;
  path: GridCoord[];
  visitedNodes: GridCoord[];
  currentWaypointIndex: number;
  targetPos: { x: number; z: number };
  cost: number;
}

export interface GameSettings {
  mouseSensitivity: number;
  graphicsQuality: GraphicsQuality;
  soundVolume: number;
  aiVisualization: boolean;
  activeAlgorithm: AlgorithmType;
  aiDifficulty: AIDifficulty;
}

export interface MissionStats {
  missionId: number;
  missionName: string;
  enemiesRemaining: number;
  totalEnemies: number;
  objectiveText: string;
  extractionActive: boolean;
  timeElapsed: number;
  shotsFired: number;
  shotsHit: number;
  damageReceived: number;
  kills: number;
}

interface GameStoreState {
  currentScreen: ScreenType;
  gameState: GamePlayState;
  currentMissionIndex: number;
  
  // Player state
  playerHealth: number;
  playerMaxHealth: number;
  playerAmmo: number;
  playerMaxAmmo: number;
  isReloading: boolean;

  // Mission & statistics
  missionStats: MissionStats;

  // Settings
  settings: GameSettings;

  // AI & Diagnostics
  diagnosticsOverlayVisible: boolean;
  aiDiagnostics: Record<string, AIDiagnosticInfo>;

  // Actions
  setScreen: (screen: ScreenType) => void;
  setGameState: (state: GamePlayState) => void;
  setCurrentMission: (missionIndex: number) => void;
  updatePlayerHealth: (delta: number) => void;
  setPlayerAmmo: (ammo: number) => void;
  setIsReloading: (isReloading: boolean) => void;
  recordShot: (hit: boolean) => void;
  recordDamageReceived: (amount: number) => void;
  recordKill: () => void;
  updateTimeElapsed: (dt: number) => void;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  toggleDiagnostics: () => void;
  updateAIDiagnostic: (info: AIDiagnosticInfo) => void;
  removeAIDiagnostic: (enemyId: string) => void;
  resetMission: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  currentScreen: 'menu',
  gameState: 'ready',
  currentMissionIndex: 1,

  playerHealth: 100,
  playerMaxHealth: 100,
  playerAmmo: 30,
  playerMaxAmmo: 30,
  isReloading: false,

  missionStats: {
    missionId: 1,
    missionName: 'Training Grounds',
    enemiesRemaining: 4,
    totalEnemies: 4,
    objectiveText: 'Eliminate training combat scouts and reach extraction point.',
    extractionActive: false,
    timeElapsed: 0,
    shotsFired: 0,
    shotsHit: 0,
    damageReceived: 0,
    kills: 0,
  },

  settings: {
    mouseSensitivity: 1.0,
    graphicsQuality: 'high',
    soundVolume: 0.7,
    aiVisualization: false,
    activeAlgorithm: 'astar',
    aiDifficulty: 'normal',
  },

  diagnosticsOverlayVisible: false,
  aiDiagnostics: {},

  setScreen: (screen) => set({ currentScreen: screen }),
  setGameState: (state) => set({ gameState: state }),
  setCurrentMission: (missionIndex) => set({ currentMissionIndex: missionIndex }),
  
  updatePlayerHealth: (delta) =>
    set((state) => {
      const newHealth = Math.max(0, Math.min(state.playerMaxHealth, state.playerHealth + delta));
      return {
        playerHealth: newHealth,
        gameState: newHealth <= 0 ? 'defeat' : state.gameState,
      };
    }),

  setPlayerAmmo: (ammo) => set({ playerAmmo: ammo }),
  setIsReloading: (isReloading) => set({ isReloading }),

  recordShot: (hit) =>
    set((state) => ({
      missionStats: {
        ...state.missionStats,
        shotsFired: state.missionStats.shotsFired + 1,
        shotsHit: hit ? state.missionStats.shotsHit + 1 : state.missionStats.shotsHit,
      },
    })),

  recordDamageReceived: (amount) =>
    set((state) => ({
      missionStats: {
        ...state.missionStats,
        damageReceived: state.missionStats.damageReceived + amount,
      },
    })),

  recordKill: () =>
    set((state) => {
      const remaining = Math.max(0, state.missionStats.enemiesRemaining - 1);
      const isComplete = remaining === 0;
      return {
        missionStats: {
          ...state.missionStats,
          enemiesRemaining: remaining,
          kills: state.missionStats.kills + 1,
          extractionActive: isComplete,
          objectiveText: isComplete
            ? 'Arena Cleared! Proceed immediately to the extraction beacon.'
            : state.missionStats.objectiveText,
        },
      };
    }),

  updateTimeElapsed: (dt) =>
    set((state) => ({
      missionStats: {
        ...state.missionStats,
        timeElapsed: state.missionStats.timeElapsed + dt,
      },
    })),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  toggleDiagnostics: () =>
    set((state) => ({
      diagnosticsOverlayVisible: !state.diagnosticsOverlayVisible,
      settings: {
        ...state.settings,
        aiVisualization: !state.diagnosticsOverlayVisible,
      },
    })),

  updateAIDiagnostic: (info) =>
    set((state) => ({
      aiDiagnostics: {
        ...state.aiDiagnostics,
        [info.enemyId]: info,
      },
    })),

  removeAIDiagnostic: (enemyId) =>
    set((state) => {
      const copy = { ...state.aiDiagnostics };
      delete copy[enemyId];
      return { aiDiagnostics: copy };
    }),

  resetMission: () =>
    set((state) => ({
      playerHealth: 100,
      playerAmmo: 30,
      isReloading: false,
      gameState: 'playing',
      missionStats: {
        ...state.missionStats,
        enemiesRemaining: state.missionStats.totalEnemies,
        timeElapsed: 0,
        shotsFired: 0,
        shotsHit: 0,
        damageReceived: 0,
        kills: 0,
        extractionActive: false,
      },
      aiDiagnostics: {},
    })),
}));
