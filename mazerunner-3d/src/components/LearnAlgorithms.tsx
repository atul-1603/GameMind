import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Code2,
  Cpu,
  GitBranch,
  HelpCircle,
  Network,
  Scale,
  Sparkles,
} from 'lucide-react';
import { ALGORITHM_DETAILS, AlgorithmType } from '../algorithms';
import { useGameStore } from '../game/gameState';

const SECTIONS = [
  { id: 'GRAPH_MODEL', title: '1. Graph Representation of Mazes', icon: Network },
  { id: 'ALGO_DEEP_DIVE', title: '2. The 5 Core DAA Algorithms', icon: Cpu },
  { id: 'OPTIMALITY_PROOFS', title: '3. Optimality & Admissibility', icon: Scale },
  { id: 'COMPLEXITY_MATRIX', title: '4. Complexity & Data Structures', icon: GitBranch },
];

export const LearnAlgorithms: React.FC = () => {
  const { setScreen } = useGameStore();
  const [activeSection, setActiveSection] = useState<string>('GRAPH_MODEL');
  const [selectedAlgoTab, setSelectedAlgoTab] = useState<AlgorithmType>('ASTAR');

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('MAIN_MENU')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Main Menu
          </button>
          <div className="h-5 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base font-bold text-white tracking-wide">
              GameMind DAA Theory — Algorithmic Game Intelligence
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeSection === sec.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {sec.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-8 max-w-6xl mx-auto space-y-8 text-slate-300 text-sm leading-relaxed">
        {/* Section 1: Graph Representation */}
        {activeSection === 'GRAPH_MODEL' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                <Network className="w-5 h-5 text-cyan-400" /> Transforming a 3D Labyrinth into a Graph
              </h2>
              <p>
                In algorithmic pathfinding, a continuous three-dimensional labyrinth is discretized into a formal graph
                <span className="font-mono text-cyan-300"> G = (V, E)</span>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="text-cyan-400 font-bold font-mono mb-1">Vertices (V)</div>
                  <p className="text-xs text-slate-400">
                    Each walkable cell <span className="font-mono text-white">(x, y)</span> on the grid is a graph node. Walls are excluded from the vertex set. Total vertices{' '}
                    <span className="font-mono text-cyan-300">|V| ≤ Width × Height</span>.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-bold font-mono mb-1">Edges (E)</div>
                  <p className="text-xs text-slate-400">
                    An undirected edge exists between two adjacent walkable cells if orthogonal movement (North, East, South, West) is unobstructed. Maximum degree per node is 4, so{' '}
                    <span className="font-mono text-amber-300">|E| ≤ 4|V|</span>.
                  </p>
                </div>
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="text-emerald-400 font-bold font-mono mb-1">Edge Weights (w)</div>
                  <p className="text-xs text-slate-400">
                    Traversing from cell <span className="font-mono text-white">u</span> to <span className="font-mono text-white">v</span> incurs cost <span className="font-mono text-emerald-300">w(u, v)</span>. Normal tiles cost 1; cyber-sludge terrain costs 3; hazardous energy grids cost 5.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Parent Pointers & Route Reconstruction</h3>
              <p>
                Every algorithm maintains a <span className="font-mono text-cyan-300">parent: Map&lt;Node, Node&gt;</span>. When a node <span className="font-mono text-white">v</span> is discovered or relaxed via neighbor <span className="font-mono text-white">u</span>, we store <span className="font-mono text-white">parent[v] = u</span>.
              </p>
              <p>
                Once the target exit is dequeued, the solution trajectory is reconstructed by iteratively following parent pointers back to the start node in <span className="font-mono text-amber-300">O(L)</span> time, where <span className="font-mono text-white">L</span> is the path length, and reversing the sequence.
              </p>
            </div>
          </div>
        )}

        {/* Section 2: Algorithm Deep Dive */}
        {activeSection === 'ALGO_DEEP_DIVE' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Tabs for each algorithm */}
            <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
              {(['ASTAR', 'BFS', 'DIJKSTRA', 'GREEDY_BEST_FIRST', 'DFS'] as AlgorithmType[]).map((algo) => (
                <button
                  key={algo}
                  onClick={() => setSelectedAlgoTab(algo)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-mono transition-all ${
                    selectedAlgoTab === algo
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>

            {/* Algorithm Detail Card */}
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-cyan-300">
                    {ALGORITHM_DETAILS[selectedAlgoTab].fullName}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Primary Data Structure: <span className="font-mono text-amber-300">{ALGORITHM_DETAILS[selectedAlgoTab].dataStructure}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                    Time: {ALGORITHM_DETAILS[selectedAlgoTab].timeComplexity}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
                    Space: {ALGORITHM_DETAILS[selectedAlgoTab].spaceComplexity}
                  </span>
                </div>
              </div>

              <p className="text-slate-300 text-sm">
                {ALGORITHM_DETAILS[selectedAlgoTab].description}
              </p>

              {/* Pseudocode Box */}
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                  <Code2 className="w-4 h-4 text-cyan-400" /> Formal Pseudocode
                </div>
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
                  {ALGORITHM_DETAILS[selectedAlgoTab].pseudocode}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Optimality: </span>
                  <span className="text-emerald-400 font-bold">{ALGORITHM_DETAILS[selectedAlgoTab].optimality}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Completeness: </span>
                  <span className="text-cyan-400 font-bold">{ALGORITHM_DETAILS[selectedAlgoTab].completeness}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Optimality & Admissibility */}
        {activeSection === 'OPTIMALITY_PROOFS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" /> Why is A* Guaranteed to be Optimal?
              </h2>
              <p>
                A* evaluates nodes using the evaluation function:
                <span className="block my-2 text-center text-base font-mono font-bold text-cyan-400 bg-slate-950/80 py-2 rounded-xl border border-slate-800">
                  f(n) = g(n) + h(n)
                </span>
                Where:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 pl-2">
                <li><strong className="text-white">g(n):</strong> Exact accumulated movement cost from start node to current node <span className="font-mono">n</span>.</li>
                <li><strong className="text-white">h(n):</strong> Heuristic estimate of remaining traversal cost from <span className="font-mono">n</span> to the goal.</li>
                <li><strong className="text-white">f(n):</strong> Estimated total cost of the cheapest solution path through <span className="font-mono">n</span>.</li>
              </ul>

              <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-500/30 text-xs space-y-2">
                <div className="font-bold text-cyan-300 font-mono">The Admissibility Condition:</div>
                <p>
                  A heuristic <span className="font-mono text-amber-300">h(n)</span> is <strong>admissible</strong> if it never overestimates the true minimum remaining cost <span className="font-mono text-white">h*(n)</span> to reach the goal:
                </p>
                <p className="font-mono text-cyan-400 font-bold text-center">
                  0 ≤ h(n) ≤ h*(n)  for all n
                </p>
                <p>
                  In a 4-directional grid with minimum edge cost = 1, the <strong>Manhattan distance</strong>:
                  <br />
                  <span className="font-mono text-white">h(n) = |x_n - x_exit| + |y_n - y_exit|</span> is strictly admissible because any valid path must make at least that many orthogonal steps to bridge the coordinate displacement.
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white">Why DFS Fails to Find the Shortest Path</h3>
              <p className="text-xs text-slate-300">
                DFS expands the first legal branch deep into the graph before backtracking. In a labyrinth with alternative routes or loops, DFS commits to whatever path it encounters first. Even if an exit portal is situated just two tiles to the right of the start position, DFS might explore a 100-step dead-end corridor around the perimeter, reporting a massively bloated path.
              </p>
            </div>
          </div>
        )}

        {/* Section 4: Complexity Matrix */}
        {activeSection === 'COMPLEXITY_MATRIX' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-cyan-400" /> Theoretical vs Empirical Complexity Matrix
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="pb-3">Algorithm</th>
                      <th className="pb-3">Data Structure</th>
                      <th className="pb-3">Worst-Case Time</th>
                      <th className="pb-3">Worst-Case Space</th>
                      <th className="pb-3">Unweighted Shortest</th>
                      <th className="pb-3">Weighted Optimal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="py-3 font-bold text-blue-400">BFS</td>
                      <td className="py-3 text-slate-300">FIFO Queue</td>
                      <td className="py-3 text-amber-400">O(|V| + |E|)</td>
                      <td className="py-3 text-amber-400">O(|V|)</td>
                      <td className="py-3 text-emerald-400 font-bold">YES (Guaranteed)</td>
                      <td className="py-3 text-red-400">NO (Ignores costs)</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-red-400">DFS</td>
                      <td className="py-3 text-slate-300">LIFO Stack</td>
                      <td className="py-3 text-amber-400">O(|V| + |E|)</td>
                      <td className="py-3 text-amber-400">O(|V|)</td>
                      <td className="py-3 text-red-400">NO</td>
                      <td className="py-3 text-red-400">NO</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-purple-400">Dijkstra</td>
                      <td className="py-3 text-slate-300">Min-Heap PQ</td>
                      <td className="py-3 text-amber-400">O((|V|+|E|) log |V|)</td>
                      <td className="py-3 text-amber-400">O(|V|)</td>
                      <td className="py-3 text-emerald-400 font-bold">YES</td>
                      <td className="py-3 text-emerald-400 font-bold">YES (Min Cost)</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-cyan-400">A* Search</td>
                      <td className="py-3 text-slate-300">Min-Heap PQ</td>
                      <td className="py-3 text-amber-400">O((|V|+|E|) log |V|)</td>
                      <td className="py-3 text-amber-400">O(|V|)</td>
                      <td className="py-3 text-emerald-400 font-bold">YES (with h)</td>
                      <td className="py-3 text-emerald-400 font-bold">YES (Admissible)</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-bold text-amber-400">Greedy Best-First</td>
                      <td className="py-3 text-slate-300">Min-Heap PQ</td>
                      <td className="py-3 text-amber-400">O((|V|+|E|) log |V|)</td>
                      <td className="py-3 text-amber-400">O(|V|)</td>
                      <td className="py-3 text-amber-400">Suboptimal</td>
                      <td className="py-3 text-red-400">NO</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
