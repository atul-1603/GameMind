import confetti from 'canvas-confetti';
import { create } from 'zustand';
import { executeSearch } from '../algorithms/searchRunner';
import { SearchStats } from '../algorithms/searchTypes';
import { getLowestEmptyRow, isValidMove } from '../game/board';
import {
  applyMove,
  createInitialGameState,
  GameEngineState,
  undoLastMove,
} from '../game/gameRules';
import {
  AgentConfig,
  AIDifficulty,
  AIAlgorithm,
  BoardState,
  GameMode,
  GameStatus,
  MoveRecord,
  PlayerId,
  WinInfo,
} from '../game/gameTypes';
import { soundManager } from './useSound';

export type AppTheme = 'cyber' | 'arcade' | 'slate' | 'emerald';

export interface GameStoreState {
  // Navigation & Mode
  activeTab: 'play' | 'lab' | 'theory' | 'settings';
  gameMode: GameMode;

  // Authoritative Game Engine State
  board: BoardState;
  currentPlayer: PlayerId;
  status: GameStatus;
  winner: PlayerId | null;
  winInfo: WinInfo | null;
  moves: MoveRecord[];
  moveCount: number;

  // AI & Automation
  isAIThinking: boolean;
  humanPlayer: PlayerId;
  aiDifficulty: AIDifficulty;
  aiAlgorithm: AIAlgorithm;
  useMoveOrdering: boolean;
  lastAISearchStats: SearchStats | null;
  lastMoveExplanation: string | null;
  proposedAIMove: number | null;

  // AI vs AI Mode Settings
  agent1: AgentConfig;
  agent2: AgentConfig;
  isEvERunning: boolean;
  evESpeed: number;

  // UI & Accessibility Settings
  theme: AppTheme;
  soundEnabled: boolean;
  discSymbols: boolean;
  animationSpeed: 'fast' | 'normal' | 'smooth';
  ghostCol: number | null;

  // Actions
  setActiveTab: (tab: 'play' | 'lab' | 'theory' | 'settings') => void;
  setGameMode: (mode: GameMode) => void;
  startNewGame: () => void;
  makePlayerMove: (col: number) => Promise<void>;
  undo: () => void;
  setHumanPlayer: (p: PlayerId) => void;
  setAIDifficulty: (diff: AIDifficulty) => void;
  setAIAlgorithm: (algo: AIAlgorithm) => void;
  setUseMoveOrdering: (val: boolean) => void;
  setGhostCol: (col: number | null) => void;
  setTheme: (theme: AppTheme) => void;
  setSoundEnabled: (val: boolean) => void;
  setDiscSymbols: (val: boolean) => void;
  setAnimationSpeed: (spd: 'fast' | 'normal' | 'smooth') => void;
  setAgent1: (config: Partial<AgentConfig>) => void;
  setAgent2: (config: Partial<AgentConfig>) => void;
  setEvERunning: (running: boolean) => void;
  setEvESpeed: (speed: number) => void;
  stepEvE: () => Promise<void>;
  requestAIHint: () => Promise<void>;
}

const DIFFICULTY_MAP: Record<AIDifficulty, { depth: number; useOrdering: boolean }> = {
  easy: { depth: 2, useOrdering: false },
  medium: { depth: 4, useOrdering: true },
  hard: { depth: 6, useOrdering: true },
};

export const useGameStore = create<GameStoreState>((set, get) => {
  const initial = createInitialGameState(1);

  return {
    activeTab: 'play',
    gameMode: 'pve',

    board: initial.board,
    currentPlayer: initial.currentPlayer,
    status: initial.status,
    winner: initial.winner,
    winInfo: initial.winInfo,
    moves: initial.moves,
    moveCount: initial.moveCount,

    isAIThinking: false,
    humanPlayer: 1,
    aiDifficulty: 'medium',
    aiAlgorithm: 'alphabeta',
    useMoveOrdering: true,
    lastAISearchStats: null,
    lastMoveExplanation: null,
    proposedAIMove: null,

    agent1: {
      algorithm: 'alphabeta',
      depth: 4,
      useMoveOrdering: true,
      useTransposition: true,
      name: 'Agent Red (α-β)',
    },
    agent2: {
      algorithm: 'minimax',
      depth: 3,
      useMoveOrdering: false,
      useTransposition: false,
      name: 'Agent Yellow (Minimax)',
    },
    isEvERunning: false,
    evESpeed: 700,

    theme: 'cyber',
    soundEnabled: true,
    discSymbols: true,
    animationSpeed: 'normal',
    ghostCol: null,

    setActiveTab: (tab) => {
      soundManager.playClick();
      set({ activeTab: tab });
    },

    setGameMode: (mode) => {
      soundManager.playClick();
      set({ gameMode: mode, isEvERunning: false, proposedAIMove: null });
      get().startNewGame();
    },

    startNewGame: () => {
      soundManager.playClick();
      const nextInitial = createInitialGameState(1);
      set({
        board: nextInitial.board,
        currentPlayer: nextInitial.currentPlayer,
        status: nextInitial.status,
        winner: nextInitial.winner,
        winInfo: nextInitial.winInfo,
        moves: nextInitial.moves,
        moveCount: nextInitial.moveCount,
        isAIThinking: false,
        lastAISearchStats: null,
        lastMoveExplanation: null,
        proposedAIMove: null,
        isEvERunning: false,
      });

      // If PvE and human is Player 2, AI takes the opening move immediately
      const { gameMode, humanPlayer } = get();
      if (gameMode === 'pve' && humanPlayer === 2) {
        setTimeout(() => {
          triggerAIMove(1);
        }, 300);
      }
    },

    setHumanPlayer: (p) => {
      soundManager.playClick();
      set({ humanPlayer: p });
      get().startNewGame();
    },

    setAIDifficulty: (diff) => {
      soundManager.playClick();
      set({
        aiDifficulty: diff,
        useMoveOrdering: DIFFICULTY_MAP[diff].useOrdering,
      });
    },

    setAIAlgorithm: (algo) => {
      soundManager.playClick();
      set({ aiAlgorithm: algo });
    },

    setUseMoveOrdering: (val) => set({ useMoveOrdering: val }),

    setGhostCol: (col) => set({ ghostCol: col }),

    setTheme: (theme) => {
      soundManager.playClick();
      set({ theme });
    },

    setSoundEnabled: (val) => {
      soundManager.enabled = val;
      set({ soundEnabled: val });
    },

    setDiscSymbols: (val) => set({ discSymbols: val }),

    setAnimationSpeed: (spd) => set({ animationSpeed: spd }),

    setAgent1: (config) =>
      set((state) => ({ agent1: { ...state.agent1, ...config } })),

    setAgent2: (config) =>
      set((state) => ({ agent2: { ...state.agent2, ...config } })),

    setEvERunning: (running) => {
      soundManager.playClick();
      set({ isEvERunning: running });
      if (running) {
        runEvELoop();
      }
    },

    setEvESpeed: (speed) => set({ evESpeed: speed }),

    undo: () => {
      const { status, isAIThinking, gameMode } = get();
      if (status === 'idle' || isAIThinking) return;

      soundManager.playClick();
      let stateSnapshot: GameEngineState = {
        board: get().board,
        currentPlayer: get().currentPlayer,
        status: get().status,
        winner: get().winner,
        winInfo: get().winInfo,
        moves: get().moves,
        moveCount: get().moveCount,
      };

      // In PvE mode, undo 2 moves (AI move and player move) if possible
      if (gameMode === 'pve') {
        stateSnapshot = undoLastMove(stateSnapshot);
        if (stateSnapshot.moves.length > 0 && stateSnapshot.currentPlayer !== get().humanPlayer) {
          stateSnapshot = undoLastMove(stateSnapshot);
        }
      } else {
        stateSnapshot = undoLastMove(stateSnapshot);
      }

      set({
        board: stateSnapshot.board,
        currentPlayer: stateSnapshot.currentPlayer,
        status: stateSnapshot.status,
        winner: stateSnapshot.winner,
        winInfo: stateSnapshot.winInfo,
        moves: stateSnapshot.moves,
        moveCount: stateSnapshot.moveCount,
        lastMoveExplanation: null,
        proposedAIMove: null,
      });
    },

    requestAIHint: async () => {
      const { board, currentPlayer, status, isAIThinking } = get();
      if (status !== 'playing' || isAIThinking) return;

      set({ isAIThinking: true });
      try {
        const { result, explanation } = await executeSearch(
          board,
          currentPlayer,
          'alphabeta',
          { depth: 4, useMoveOrdering: true }
        );
        set({
          proposedAIMove: result.bestMove,
          lastMoveExplanation: `Hint recommendation: ${explanation}`,
        });
        soundManager.playClick();
      } finally {
        set({ isAIThinking: false });
      }
    },

    makePlayerMove: async (col: number) => {
      const {
        board,
        status,
        currentPlayer,
        gameMode,
        humanPlayer,
        isAIThinking,
      } = get();

      if (status !== 'playing' || isAIThinking) return;
      if (!isValidMove(board, col)) {
        soundManager.playError();
        return;
      }

      // In PvE mode, prevent player from moving during AI's turn
      if (gameMode === 'pve' && currentPlayer !== humanPlayer) {
        return;
      }

      // Execute Player Move
      soundManager.playDrop(col);
      const stateSnapshot: GameEngineState = {
        board: get().board,
        currentPlayer: get().currentPlayer,
        status: get().status,
        winner: get().winner,
        winInfo: get().winInfo,
        moves: get().moves,
        moveCount: get().moveCount,
      };

      const updated = applyMove(stateSnapshot, col);

      set({
        board: updated.board,
        currentPlayer: updated.currentPlayer,
        status: updated.status,
        winner: updated.winner,
        winInfo: updated.winInfo,
        moves: updated.moves,
        moveCount: updated.moveCount,
        proposedAIMove: null,
      });

      if (updated.status === 'won') {
        soundManager.playWin();
        triggerConfetti();
        return;
      }

      if (updated.status === 'draw') {
        soundManager.playDraw();
        return;
      }

      // If PvE, trigger AI move automatically
      if (gameMode === 'pve' && updated.currentPlayer !== humanPlayer) {
        const aiPlayer: PlayerId = humanPlayer === 1 ? 2 : 1;
        await triggerAIMove(aiPlayer);
      }
    },

    stepEvE: async () => {
      const { status, currentPlayer, isAIThinking } = get();
      if (status !== 'playing' || isAIThinking) return;
      await triggerEvEStep(currentPlayer);
    },
  };
});

async function triggerAIMove(aiPlayer: PlayerId) {
  const store = useGameStore.getState();
  if (store.status !== 'playing') return;

  useGameStore.setState({ isAIThinking: true });

  try {
    const diff = store.aiDifficulty;
    const config = DIFFICULTY_MAP[diff];
    const algo = store.aiAlgorithm;

    const { result, explanation } = await executeSearch(
      store.board,
      aiPlayer,
      algo,
      {
        depth: config.depth,
        useMoveOrdering: config.useOrdering,
        useTransposition: true,
      }
    );

    const currentState: GameEngineState = {
      board: useGameStore.getState().board,
      currentPlayer: useGameStore.getState().currentPlayer,
      status: useGameStore.getState().status,
      winner: useGameStore.getState().winner,
      winInfo: useGameStore.getState().winInfo,
      moves: useGameStore.getState().moves,
      moveCount: useGameStore.getState().moveCount,
    };

    if (currentState.status !== 'playing') return;

    soundManager.playDrop(result.bestMove);
    const updated = applyMove(
      currentState,
      result.bestMove,
      explanation,
      result.score
    );

    useGameStore.setState({
      board: updated.board,
      currentPlayer: updated.currentPlayer,
      status: updated.status,
      winner: updated.winner,
      winInfo: updated.winInfo,
      moves: updated.moves,
      moveCount: updated.moveCount,
      lastAISearchStats: result.stats,
      lastMoveExplanation: explanation,
      isAIThinking: false,
    });

    if (updated.status === 'won') {
      soundManager.playWin();
      triggerConfetti();
    } else if (updated.status === 'draw') {
      soundManager.playDraw();
    }
  } catch (err) {
    console.error('AI Move Error:', err);
    useGameStore.setState({ isAIThinking: false });
  }
}

async function triggerEvEStep(player: PlayerId) {
  const store = useGameStore.getState();
  if (store.status !== 'playing') return;

  const agentConfig = player === 1 ? store.agent1 : store.agent2;
  useGameStore.setState({ isAIThinking: true });

  try {
    const { result, explanation } = await executeSearch(
      store.board,
      player,
      agentConfig.algorithm,
      {
        depth: agentConfig.depth,
        useMoveOrdering: agentConfig.useMoveOrdering,
        useTransposition: agentConfig.useTransposition,
      }
    );

    const currentState: GameEngineState = {
      board: useGameStore.getState().board,
      currentPlayer: useGameStore.getState().currentPlayer,
      status: useGameStore.getState().status,
      winner: useGameStore.getState().winner,
      winInfo: useGameStore.getState().winInfo,
      moves: useGameStore.getState().moves,
      moveCount: useGameStore.getState().moveCount,
    };

    soundManager.playDrop(result.bestMove);
    const updated = applyMove(
      currentState,
      result.bestMove,
      explanation,
      result.score
    );

    useGameStore.setState({
      board: updated.board,
      currentPlayer: updated.currentPlayer,
      status: updated.status,
      winner: updated.winner,
      winInfo: updated.winInfo,
      moves: updated.moves,
      moveCount: updated.moveCount,
      lastAISearchStats: result.stats,
      lastMoveExplanation: `${agentConfig.name}: ${explanation}`,
      isAIThinking: false,
    });

    if (updated.status === 'won') {
      soundManager.playWin();
      triggerConfetti();
      useGameStore.setState({ isEvERunning: false });
    } else if (updated.status === 'draw') {
      soundManager.playDraw();
      useGameStore.setState({ isEvERunning: false });
    }
  } catch (e) {
    console.error('EvE error:', e);
    useGameStore.setState({ isAIThinking: false, isEvERunning: false });
  }
}

async function runEvELoop() {
  while (useGameStore.getState().isEvERunning) {
    const store = useGameStore.getState();
    if (store.status !== 'playing') {
      useGameStore.setState({ isEvERunning: false });
      break;
    }
    await triggerEvEStep(store.currentPlayer);
    const speed = useGameStore.getState().evESpeed;
    await new Promise((resolve) => setTimeout(resolve, speed));
  }
}

function triggerConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#eab308', '#38bdf8', '#818cf8', '#10b981'],
    });
  } catch (e) {}
}
