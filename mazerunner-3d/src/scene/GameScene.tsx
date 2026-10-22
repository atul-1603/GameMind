import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { resolveMovement } from '../game/collision';
import { useGameStore } from '../game/gameState';
import { ThreeSceneManager } from './ThreeSceneManager';

export const GameScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<ThreeSceneManager | null>(null);

  // Zustand Store selectors
  const {
    maze,
    player,
    cameraMode,
    isPaused,
    isWon,
    graphicsQuality,
    mouseSensitivity,
    aiSolver,
    toggleCameraMode,
    setPaused,
    setWon,
    setPointerLocked,
    updatePlayerPosition,
    addStep,
    collectOrbAt,
    restartLevel,
    executeAISolution,
    stopAIExecution,
    setExecutionPathIndex,
  } = useGameStore();

  // Keyboard input state
  const keys = useRef<{ [key: string]: boolean }>({});
  const lastStepTime = useRef<number>(0);
  const playerVelocityY = useRef<number>(0);
  const isGrounded = useRef<boolean>(true);

  // Local state for on-screen tutorial/help
  const [showHelp, setShowHelp] = useState(false);

  // 1. Initialize ThreeSceneManager
  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new ThreeSceneManager(containerRef.current);
    manager.setQuality(graphicsQuality);
    manager.rebuildMaze(maze);
    sceneManagerRef.current = manager;

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Update maze when level or seed changes
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.rebuildMaze(maze);
    }
  }, [maze]);

  // Update graphics quality
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setQuality(graphicsQuality);
    }
  }, [graphicsQuality]);

  // Update 3D Algorithm visualization overlay
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateVisualization(
        aiSolver.result,
        aiSolver.currentStepIndex,
        aiSolver.showExploration,
        aiSolver.showFinalRoute
      );
    }
  }, [
    aiSolver.result,
    aiSolver.currentStepIndex,
    aiSolver.showExploration,
    aiSolver.showFinalRoute,
  ]);

  // Trigger celebratory confetti on victory
  useEffect(() => {
    if (isWon) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#bf00ff', '#00ff88', '#ffbb00'],
      });
    }
  }, [isWon]);

  // 2. Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      keys.current[e.code] = true;

      if (e.code === 'KeyM') {
        toggleCameraMode();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        setPaused(!isPaused);
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      } else if (e.code === 'KeyR') {
        restartLevel();
      } else if (e.code === 'KeyH') {
        setShowHelp((prev) => !prev);
      } else if (e.code === 'Space' && isGrounded.current && !isPaused && !isWon) {
        playerVelocityY.current = 4.2;
        isGrounded.current = false;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPaused, isWon, toggleCameraMode, setPaused, restartLevel]);

  // 3. Pointer Lock & Mouse Look
  useEffect(() => {
    const dom = containerRef.current;
    if (!dom) return;

    const handleClick = () => {
      if (cameraMode === 'FIRST_PERSON' && !isPaused && !isWon) {
        dom.requestPointerLock?.();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === dom && !isPaused && !isWon) {
        const sens = 0.0022 * mouseSensitivity;
        let newYaw = player.yaw + e.movementX * sens;
        let newPitch = player.pitch - e.movementY * sens;

        // Clamp pitch to prevent camera flipping
        const maxPitch = (85 * Math.PI) / 180;
        newPitch = Math.max(-maxPitch, Math.min(maxPitch, newPitch));

        updatePlayerPosition(
          player.x,
          player.z,
          player.y,
          newYaw,
          newPitch,
          player.gridX,
          player.gridY
        );
      }
    };

    const handleLockChange = () => {
      const isLocked = document.pointerLockElement === dom;
      setPointerLocked(isLocked);
    };

    dom.addEventListener('click', handleClick);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handleLockChange);

    return () => {
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [
    cameraMode,
    isPaused,
    isWon,
    mouseSensitivity,
    player.yaw,
    player.pitch,
    player.x,
    player.z,
    player.y,
    player.gridX,
    player.gridY,
    setPointerLocked,
    updatePlayerPosition,
  ]);

  // 4. Main Animation & Physics Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = useGameStore.getState();

      if (!state.isPaused && !state.isWon) {
        state.incrementTime(deltaTime);

        // A. Handle AI Solution Path Playback Execution
        if (state.aiSolver.isExecutingPath && state.aiSolver.result?.path) {
          const path = state.aiSolver.result.path;
          const targetIndex = state.aiSolver.executionPathIndex;

          if (targetIndex < path.length) {
            const targetCell = path[targetIndex];
            const dx = targetCell.x - state.player.x;
            const dz = targetCell.y - state.player.z;
            const dist = Math.hypot(dx, dz);

            const aiSpeed = 4.5 * deltaTime;
            if (dist < 0.1) {
              // Reached next waypoint
              state.setExecutionPathIndex(targetIndex + 1);
              state.addStep();
              // Check orb
              state.collectOrbAt(targetCell.x, targetCell.y);
              if (sceneManagerRef.current) {
                sceneManagerRef.current.removeOrbMesh(targetCell.x, targetCell.y);
              }
            } else {
              const moveX = (dx / dist) * Math.min(dist, aiSpeed);
              const moveZ = (dz / dist) * Math.min(dist, aiSpeed);
              const facingYaw = Math.atan2(dx, dz);

              state.updatePlayerPosition(
                state.player.x + moveX,
                state.player.z + moveZ,
                0.5,
                facingYaw,
                0,
                Math.round(state.player.x),
                Math.round(state.player.z)
              );
            }
          } else {
            // Finished route
            state.stopAIExecution();
            state.setWon(true);
          }
        }
        // B. Manual Player Movement & Physics
        else {
          let moveFwd = 0;
          let moveRight = 0;

          if (keys.current['KeyW'] || keys.current['ArrowUp']) moveFwd += 1;
          if (keys.current['KeyS'] || keys.current['ArrowDown']) moveFwd -= 1;
          if (keys.current['KeyD'] || keys.current['ArrowRight']) moveRight += 1;
          if (keys.current['KeyA'] || keys.current['ArrowLeft']) moveRight -= 1;

          const isMoving = moveFwd !== 0 || moveRight !== 0;
          const isSprinting = !!keys.current['ShiftLeft'] || !!keys.current['ShiftRight'];
          const baseSpeed = 4.2;
          const speed = (isSprinting ? baseSpeed * 1.5 : baseSpeed) * deltaTime;

          if (isMoving) {
            // Cancel conflicting AI route playback if user takes manual control
            if (state.aiSolver.isExecutingPath) {
              state.stopAIExecution();
            }

            // Calculate movement vector aligned with camera yaw
            const sinYaw = Math.sin(state.player.yaw);
            const cosYaw = Math.cos(state.player.yaw);

            const dirX = sinYaw * moveFwd + cosYaw * moveRight;
            const dirZ = cosYaw * moveFwd - sinYaw * moveRight;
            const len = Math.hypot(dirX, dirZ);

            if (len > 0) {
              const normX = (dirX / len) * speed;
              const normZ = (dirZ / len) * speed;

              // Sliding collision against maze walls
              const collision = resolveMovement(
                state.maze,
                state.player.x,
                state.player.z,
                normX,
                normZ
              );

              // Jump gravity
              if (!isGrounded.current) {
                playerVelocityY.current -= 12 * deltaTime;
              }
              let newY = state.player.y + playerVelocityY.current * deltaTime;
              if (newY <= 0.5) {
                newY = 0.5;
                playerVelocityY.current = 0;
                isGrounded.current = true;
              }

              const newGridX = Math.round(collision.newX);
              const newGridY = Math.round(collision.newZ);

              state.updatePlayerPosition(
                collision.newX,
                collision.newZ,
                newY,
                state.player.yaw,
                state.player.pitch,
                newGridX,
                newGridY
              );

              // Add step count periodically while moving
              if (currentTime - lastStepTime.current > (isSprinting ? 280 : 420)) {
                state.addStep();
                lastStepTime.current = currentTime;
              }

              // Check orb pickup
              if (collision.pickedUpOrb) {
                state.collectOrbAt(collision.pickedUpOrb.x, collision.pickedUpOrb.y);
                if (sceneManagerRef.current) {
                  sceneManagerRef.current.removeOrbMesh(
                    collision.pickedUpOrb.x,
                    collision.pickedUpOrb.y
                  );
                }
              }

              // Check victory
              if (collision.reachedExit) {
                state.setWon(true);
              }
            }
          }
        }
      }

      // Update Three.js scene rendering
      if (sceneManagerRef.current) {
        sceneManagerRef.current.update(
          deltaTime,
          state.player.x,
          state.player.z,
          state.player.y,
          state.player.yaw,
          state.player.pitch,
          state.cameraMode,
          state.maze.width,
          state.maze.height
        );
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* Crosshair (First-Person Mode) */}
      {cameraMode === 'FIRST_PERSON' && !isPaused && !isWon && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-2.5 h-2.5 border border-cyan-400/80 rounded-full bg-cyan-400/20 backdrop-blur-sm" />
        </div>
      )}

      {/* Click to Lock Pointer Overlay Hint */}
      {cameraMode === 'FIRST_PERSON' &&
        !isPaused &&
        !isWon &&
        !document.pointerLockElement && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/85 backdrop-blur-md border border-cyan-500/40 rounded-full text-cyan-300 text-xs font-mono tracking-wider shadow-lg pointer-events-none animate-pulse">
            Click to engage mouse-look • [M] Bird's-Eye Mode
          </div>
        )}

      {/* On-screen touch/mouse directional navigation buttons (accessibility & assistance) */}
      <div className="absolute bottom-6 left-6 flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity pointer-events-auto">
        <button
          onClick={() => {
            const state = useGameStore.getState();
            const collision = resolveMovement(state.maze, state.player.x, state.player.z, 0, -0.6);
            state.updatePlayerPosition(
              collision.newX,
              collision.newZ,
              state.player.y,
              state.player.yaw,
              state.player.pitch,
              Math.round(collision.newX),
              Math.round(collision.newZ)
            );
            state.addStep();
          }}
          className="w-10 h-10 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm shadow hover:bg-cyan-950 active:scale-95"
          title="Move North"
        >
          ▲
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              const state = useGameStore.getState();
              const collision = resolveMovement(state.maze, state.player.x, state.player.z, -0.6, 0);
              state.updatePlayerPosition(
                collision.newX,
                collision.newZ,
                state.player.y,
                state.player.yaw,
                state.player.pitch,
                Math.round(collision.newX),
                Math.round(collision.newZ)
              );
              state.addStep();
            }}
            className="w-10 h-10 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm shadow hover:bg-cyan-950 active:scale-95"
            title="Move West"
          >
            ◀
          </button>
          <button
            onClick={() => {
              const state = useGameStore.getState();
              const collision = resolveMovement(state.maze, state.player.x, state.player.z, 0, 0.6);
              state.updatePlayerPosition(
                collision.newX,
                collision.newZ,
                state.player.y,
                state.player.yaw,
                state.player.pitch,
                Math.round(collision.newX),
                Math.round(collision.newZ)
              );
              state.addStep();
            }}
            className="w-10 h-10 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm shadow hover:bg-cyan-950 active:scale-95"
            title="Move South"
          >
            ▼
          </button>
          <button
            onClick={() => {
              const state = useGameStore.getState();
              const collision = resolveMovement(state.maze, state.player.x, state.player.z, 0.6, 0);
              state.updatePlayerPosition(
                collision.newX,
                collision.newZ,
                state.player.y,
                state.player.yaw,
                state.player.pitch,
                Math.round(collision.newX),
                Math.round(collision.newZ)
              );
              state.addStep();
            }}
            className="w-10 h-10 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-sm shadow hover:bg-cyan-950 active:scale-95"
            title="Move East"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};
