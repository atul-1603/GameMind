import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../game/gameState';

export const MiniMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { maze, player, aiSolver, cameraMode } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cellW = w / maze.width;
    const cellH = h / maze.height;

    // 1. Draw Maze Grid cells
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        const cell = maze.cells[y][x];
        if (cell.type === 'WALL') {
          ctx.fillStyle = '#111827';
        } else if (cell.type === 'DIFFICULT') {
          ctx.fillStyle = '#78350f'; // Dark amber
        } else if (cell.type === 'HAZARDOUS') {
          ctx.fillStyle = '#831843'; // Deep crimson
        } else {
          ctx.fillStyle = '#030712'; // Walkable dark
        }
        ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);

        // Draw orb
        if (cell.hasOrb) {
          ctx.fillStyle = '#00ffcc';
          ctx.beginPath();
          ctx.arc((x + 0.5) * cellW, (y + 0.5) * cellH, cellW * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw AI Exploration steps if enabled
    if (aiSolver.showExploration && aiSolver.result) {
      const activeSteps = aiSolver.result.explorationSteps.slice(
        0,
        aiSolver.currentStepIndex
      );

      for (const step of activeSteps) {
        if (step.type === 'NODE_EXPAND') {
          ctx.fillStyle = 'rgba(0, 163, 255, 0.45)';
          ctx.fillRect(step.cell.x * cellW, step.cell.y * cellH, cellW, cellH);
        } else if (step.type === 'FRONTIER_ADD') {
          ctx.fillStyle = 'rgba(255, 187, 0, 0.6)';
          ctx.fillRect(step.cell.x * cellW, step.cell.y * cellH, cellW, cellH);
        }
      }
    }

    // 3. Draw AI Solution Path if enabled
    if (aiSolver.showFinalRoute && aiSolver.result?.path) {
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = Math.max(2, cellW * 0.4);
      ctx.beginPath();
      aiSolver.result.path.forEach((p, idx) => {
        const px = (p.x + 0.5) * cellW;
        const py = (p.y + 0.5) * cellH;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // 4. Draw Start
    ctx.fillStyle = '#0088ff';
    ctx.fillRect(
      maze.start.x * cellW + cellW * 0.2,
      maze.start.y * cellH + cellH * 0.2,
      cellW * 0.6,
      cellH * 0.6
    );

    // 5. Draw Exit Portal
    ctx.fillStyle = '#bf00ff';
    ctx.beginPath();
    ctx.arc(
      (maze.exit.x + 0.5) * cellW,
      (maze.exit.y + 0.5) * cellH,
      cellW * 0.45,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // 6. Draw Player Marker with directional heading arrow
    const playerCanvasX = (player.x + 0.5) * cellW;
    const playerCanvasY = (player.z + 0.5) * cellH;

    ctx.save();
    ctx.translate(playerCanvasX, playerCanvasY);
    // Yaw rotates around Y in Three.js (clockwise from +Z towards +X)
    ctx.rotate(player.yaw);

    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(3, cellW * 0.4), 0, Math.PI * 2);
    ctx.fill();

    // Direction line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, Math.max(6, cellW * 0.8));
    ctx.stroke();

    ctx.restore();
  }, [maze, player, aiSolver, cameraMode]);

  return (
    <div className="relative p-2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col items-center">
      <div className="flex items-center justify-between w-full px-1 mb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
        <span>Tactical Radar</span>
        <span className="text-slate-400">
          {maze.width}x{maze.height}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="rounded-lg bg-black border border-slate-800 shadow-inner"
      />
    </div>
  );
};
