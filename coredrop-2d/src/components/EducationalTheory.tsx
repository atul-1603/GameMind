import React from 'react';
import {
  BookOpen,
  CheckCircle,
  Code2,
  Cpu,
  Layers,
  Scissors,
  TrendingDown,
  Zap,
} from 'lucide-react';

export const EducationalTheory: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto py-2">
      {/* Hero Header */}
      <div className="glass-panel p-6 border-l-4 border-l-sky-500 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-sky-400" />
          <h2 className="text-2xl font-heading font-extrabold text-white">
            DAA Theory & Curriculum: Adversarial Game Intelligence
          </h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          Course companion module for <strong>Design and Analysis of Algorithms (DAA)</strong>.
          Explore the formal mathematical foundation, asymptotic complexity derivations,
          pseudocode, and heuristic evaluation of Minimax and Alpha-Beta Pruning.
        </p>
      </div>

      {/* 1. Problem Formulation & State Space */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-lg font-heading">
          <Layers className="w-5 h-5" />
          <h3>1. Problem Formulation & State Space Complexity</h3>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed space-y-3">
          <p>
            Connect Four is a two-player, zero-sum, perfect-information, sequential adversarial game.
            The game is played on a vertical grid of <strong>7 columns</strong> and <strong>6 rows</strong> (42 total slots)
            under the physical constraint of gravity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Board Dimensions</span>
              <span className="text-sm font-bold text-sky-300">7 cols × 6 rows (42 cells)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Legal State Space</span>
              <span className="text-sm font-bold text-indigo-300">~ 4.53 × 10¹² positions</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Game-Tree Complexity</span>
              <span className="text-sm font-bold text-amber-300">~ 10²¹ nodes</span>
            </div>
          </div>
          <p>
            Because the entire game tree of ~10²¹ nodes cannot be solved exhaustively in real-time,
            algorithms must use depth-bounded heuristic search with optimization techniques like
            branch-and-bound pruning.
          </p>
        </div>
      </div>

      {/* 2. Minimax Algorithm */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg font-heading">
          <Cpu className="w-5 h-5" />
          <h3>2. The Minimax Algorithm</h3>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed space-y-3">
          <p>
            The <strong>Minimax theorem</strong> (von Neumann, 1928) models optimal decision making
            under the assumption of an equally rational opponent who seeks to minimize our payoff.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-sky-300 border border-slate-800">
            {`V(s) = 
  Utility(s)                      if Terminal(s) or DepthCutoff(s)
  max_{a ∈ Actions(s)} V(Result(s, a))  if Player(s) = MAX (AI)
  min_{a ∈ Actions(s)} V(Result(s, a))  if Player(s) = MIN (Opponent)`}
          </div>

          <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider pt-2">
            Minimax Pseudocode
          </h4>
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-xs font-mono overflow-x-auto border border-slate-800">
{`function minimax(node, depth, isMaximizing):
    if depth == 0 or isTerminal(node):
        return evaluateHeuristic(node)
        
    if isMaximizing:
        maxEval = -INFINITY
        for each child in getValidMoves(node):
            eval = minimax(child, depth - 1, false)
            maxEval = max(maxEval, eval)
        return maxEval
    else:
        minEval = +INFINITY
        for each child in getValidMoves(node):
            eval = minimax(child, depth - 1, true)
            minEval = min(minEval, eval)
        return minEval`}
          </pre>
        </div>
      </div>

      {/* 3. Alpha-Beta Pruning */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-lg font-heading">
          <Scissors className="w-5 h-5" />
          <h3>3. Alpha-Beta Pruning Optimization</h3>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed space-y-3">
          <p>
            <strong>Alpha-Beta Pruning</strong> is a branch-and-bound optimization that computes the
            identical mathematical Minimax decision while pruning subtrees that are guaranteed not to
            affect the final choice.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-300">
            <li>
              <strong>α (Alpha)</strong>: The highest (best) value that the maximizing player is guaranteed
              to achieve along the current search path. (Initial value: -∞)
            </li>
            <li>
              <strong>β (Beta)</strong>: The lowest (best) value that the minimizing player is guaranteed
              to achieve along the current search path. (Initial value: +∞)
            </li>
            <li>
              <strong>Cutoff Condition (β ≤ α)</strong>: As soon as the minimizing child score drops below
              or equals α, or a maximizing score exceeds β, the parent player would never permit this branch.
              The remaining siblings are pruned immediately.
            </li>
          </ul>

          <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider pt-2">
            Alpha-Beta Pruning Pseudocode
          </h4>
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-xs font-mono overflow-x-auto border border-slate-800">
{`function alphabeta(node, depth, alpha, beta, isMaximizing):
    if depth == 0 or isTerminal(node):
        return evaluateHeuristic(node)
        
    if isMaximizing:
        maxEval = -INFINITY
        for each child in getValidMoves(node):
            eval = alphabeta(child, depth - 1, alpha, beta, false)
            maxEval = max(maxEval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break // Beta cutoff (pruned branch)
        return maxEval
    else:
        minEval = +INFINITY
        for each child in getValidMoves(node):
            eval = alphabeta(child, depth - 1, alpha, beta, true)
            minEval = min(minEval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break // Alpha cutoff (pruned branch)
        return minEval`}
          </pre>
        </div>
      </div>

      {/* 4. Asymptotic Time & Space Complexity */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg font-heading">
          <TrendingDown className="w-5 h-5" />
          <h3>4. Asymptotic Time & Space Complexity Analysis</h3>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed space-y-3">
          <p>
            Let <code className="text-sky-300 font-mono">b</code> be the effective branching factor
            (b ≤ 7 in Connect Four) and <code className="text-sky-300 font-mono">d</code> be the search depth.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-3">Algorithm</th>
                  <th className="py-2 px-3">Best-Case Time</th>
                  <th className="py-2 px-3">Average-Case Time</th>
                  <th className="py-2 px-3">Worst-Case Time</th>
                  <th className="py-2 px-3">Space Complexity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-indigo-400 font-sans">Pure Minimax</td>
                  <td className="py-2.5 px-3">Θ(bᵈ)</td>
                  <td className="py-2.5 px-3">Θ(bᵈ)</td>
                  <td className="py-2.5 px-3">O(bᵈ)</td>
                  <td className="py-2.5 px-3 text-emerald-300">O(b · d)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-bold text-emerald-400 font-sans">Alpha-Beta (Perfect Order)</td>
                  <td className="py-2.5 px-3 text-emerald-300 font-bold">O(b^(d/2))</td>
                  <td className="py-2.5 px-3 text-sky-300">O(b^(3d/4))</td>
                  <td className="py-2.5 px-3">O(bᵈ)</td>
                  <td className="py-2.5 px-3 text-emerald-300">O(b · d)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed">
            <strong>Theoretical Significance of O(b^(d/2)):</strong> In the optimal case where best moves
            are evaluated first, Alpha-Beta searches the equivalent of a game tree at twice the depth
            in the same computation time as pure Minimax!
          </div>
        </div>
      </div>

      {/* 5. Heuristic Evaluation Formulation */}
      <div className="glass-panel p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-lg font-heading">
          <Code2 className="w-5 h-5" />
          <h3>5. The 69-Window Heuristic Evaluation Function</h3>
        </div>
        <div className="text-sm text-slate-300 leading-relaxed space-y-3">
          <p>
            On a 6×7 Connect Four board, there are exactly <strong>69</strong> overlapping four-cell windows:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300 font-mono">
            <li>Horizontal: 6 rows × 4 starting columns = <strong>24 windows</strong></li>
            <li>Vertical: 3 starting rows × 7 columns = <strong>21 windows</strong></li>
            <li>Diagonal Down-Right (\): 3 rows × 4 columns = <strong>12 windows</strong></li>
            <li>Diagonal Up-Right (/): 3 rows × 4 columns = <strong>12 windows</strong></li>
            <li>Total: 24 + 21 + 12 + 12 = <strong>69 four-cell windows</strong></li>
          </ul>

          <p className="text-xs text-slate-300 pt-2">
            The heuristic scores every window based on disc counts:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">4 AI Discs</span>
              <span className="font-bold text-emerald-400">+100,000 (Win)</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">3 AI + 1 Empty</span>
              <span className="font-bold text-sky-300">+120 (Threat)</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">3 Opp + 1 Empty</span>
              <span className="font-bold text-red-400">-140 (Block Alert)</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Center Column</span>
              <span className="font-bold text-amber-300">+6 per disc</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
