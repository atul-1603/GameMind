import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Scissors,
  Zap,
} from 'lucide-react';
import { VizNode } from '../algorithms/searchTypes';

interface Props {
  rootNode: VizNode | null;
  algorithmName: string;
  depth: number;
}

interface FlattenedStep {
  node: VizNode;
  stepIndex: number;
}

export const SearchTreeVisualization: React.FC<Props> = ({
  rootNode,
  algorithmName,
  depth,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(300); // ms per step
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Flatten the tree in preorder traversal
  const steps = useMemo<FlattenedStep[]>(() => {
    if (!rootNode) return [];
    const result: FlattenedStep[] = [];
    let counter = 0;

    function traverse(node: VizNode) {
      result.push({ node, stepIndex: counter++ });
      for (const child of node.children) {
        traverse(child);
      }
    }

    traverse(rootNode);
    return result;
  }, [rootNode]);

  // Set activeStep to the end initially when a new tree is loaded
  useEffect(() => {
    if (steps.length > 0) {
      setActiveStep(steps.length - 1);
      setSelectedNodeId(steps[steps.length - 1].node.id);
    }
  }, [steps]);

  // Autoplay timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          setSelectedNodeId(steps[next].node.id);
          return next;
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps, playbackSpeed]);

  if (!rootNode || steps.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400 text-sm">
        Run Minimax or Alpha-Beta with visualization enabled to inspect the game tree.
      </div>
    );
  }

  const currentNode = steps[activeStep]?.node ?? rootNode;

  // Set of node IDs visible at active step
  const visibleNodeIds = new Set<string>();
  for (let i = 0; i <= activeStep; i++) {
    visibleNodeIds.add(steps[i].node.id);
  }

  // Recursive tree rendering function
  const renderSubtree = (node: VizNode) => {
    const isVisible = visibleNodeIds.has(node.id);
    const isCurrent = node.id === currentNode.id;
    const isSelected = node.id === selectedNodeId;

    if (!isVisible) return null;

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Box */}
        <div
          onClick={() => setSelectedNodeId(node.id)}
          className={`cursor-pointer px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex flex-col items-center gap-0.5 ${
            node.pruned
              ? 'bg-red-950/70 border-red-500/50 text-red-300'
              : node.isTerminal
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
              : node.isMaximizing
              ? 'bg-blue-950/70 border-blue-500/40 text-blue-200'
              : 'bg-amber-950/70 border-amber-500/40 text-amber-200'
          } ${
            isCurrent
              ? 'ring-2 ring-sky-400 scale-105 shadow-lg shadow-sky-500/30'
              : ''
          } ${isSelected ? 'border-white' : ''}`}
        >
          <div className="flex items-center gap-1 font-bold">
            {node.pruned && <Scissors className="w-3 h-3 text-red-400" />}
            <span>
              {node.col !== null ? `Col ${node.col + 1}` : 'Root'}
            </span>
            <span className="text-[10px] text-slate-400">
              {node.isMaximizing ? 'MAX' : 'MIN'}
            </span>
          </div>

          <div className="text-[10px] flex items-center gap-1.5 text-slate-300">
            <span>
              V: {node.score !== null ? (node.score > 90000 ? '+WIN' : node.score < -90000 ? '-WIN' : node.score) : '?'}
            </span>
            {node.alpha !== undefined && node.beta !== undefined && (
              <span className="text-[9px] text-slate-400">
                [α:{node.alpha > 90000 ? '∞' : node.alpha < -90000 ? '-∞' : node.alpha}, β:{node.beta > 90000 ? '∞' : node.beta < -90000 ? '-∞' : node.beta}]
              </span>
            )}
          </div>
        </div>

        {/* Children branch connector */}
        {node.children.some((c) => visibleNodeIds.has(c.id)) && (
          <div className="flex flex-col items-center w-full">
            <div className="w-0.5 h-3 bg-slate-700" />
            <div className="flex items-start justify-center gap-2 pt-1 border-t border-slate-700">
              {node.children.map((child) => renderSubtree(child))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-sky-400" />
            <h4 className="font-heading font-bold text-base text-white">
              Search Tree Interactive Visualizer
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Bounded game-tree explorer: Max/Min node alternations, evaluation scores, and pruned branches.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveStep(0);
              setIsPlaying(false);
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setActiveStep((prev) => Math.max(0, prev - 1));
              setIsPlaying(false);
            }}
            disabled={activeStep === 0}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            title="Step Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setActiveStep((prev) => Math.min(steps.length - 1, prev + 1));
              setIsPlaying(false);
            }}
            disabled={activeStep >= steps.length - 1}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
            title="Step Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-slate-400 ml-2">
            Step {activeStep + 1} / {steps.length}
          </span>
        </div>
      </div>

      {/* Selected Node Details Bar */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-sans">Active Node:</span>
          <span className="font-bold text-sky-400">
            {currentNode.col !== null ? `Column ${currentNode.col + 1}` : 'Root State'}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            Depth: {currentNode.depth}
          </span>
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              currentNode.isMaximizing ? 'bg-blue-900/80 text-blue-300' : 'bg-amber-900/80 text-amber-300'
            }`}
          >
            {currentNode.isMaximizing ? 'MAXIMIZING (AI)' : 'MINIMIZING (Opponent)'}
          </span>
          {currentNode.pruned && (
            <span className="px-2 py-0.5 rounded bg-red-900/80 text-red-300 font-bold flex items-center gap-1">
              <Scissors className="w-3 h-3" /> PRUNED BRANCH
            </span>
          )}
        </div>

        {currentNode.alpha !== undefined && currentNode.beta !== undefined && (
          <div className="flex items-center gap-2 text-slate-400">
            <span>
              α = <strong className="text-sky-300">{currentNode.alpha}</strong>
            </span>
            <span>
              β = <strong className="text-amber-300">{currentNode.beta}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Visual Tree Rendering Canvas / Container */}
      <div className="w-full overflow-x-auto p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 min-h-[280px] flex justify-center">
        {renderSubtree(rootNode)}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-600/80 border border-blue-400" />
          <span>Maximizing Node (AI)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-600/80 border border-amber-400" />
          <span>Minimizing Node (Opponent)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-700/80 border border-red-500" />
          <span>Pruned / Cutoff Branch (β ≤ α)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-600/80 border border-emerald-400" />
          <span>Terminal State (Win / Draw)</span>
        </div>
      </div>
    </div>
  );
};
