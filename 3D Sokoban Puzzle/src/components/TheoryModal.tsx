import React, { useState } from 'react';
import { X, BookOpen, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'complexity' | 'pseudocode'>('concepts');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-dialog" style={{ maxWidth: '880px' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                padding: '0.5rem',
                borderRadius: '8px',
                background: 'rgba(6, 78, 59, 0.7)',
                border: '1px solid rgba(5, 150, 105, 0.7)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                DAA Theory &amp; Algorithmic Analysis
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Academic foundations: State-space formulation, heuristics, and search proofs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div
          style={{
            padding: '0.5rem 1.5rem',
            background: 'rgba(2, 6, 23, 0.7)',
            borderBottom: '1px solid #334155',
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <button
            onClick={() => setActiveTab('concepts')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'concepts' ? '#059669' : 'transparent',
              color: activeTab === 'concepts' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            Core Concepts &amp; State Space
          </button>
          <button
            onClick={() => setActiveTab('complexity')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'complexity' ? '#059669' : 'transparent',
              color: activeTab === 'complexity' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            Complexity &amp; Optimality Proofs
          </button>
          <button
            onClick={() => setActiveTab('pseudocode')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'pseudocode' ? '#059669' : 'transparent',
              color: activeTab === 'pseudocode' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.2s',
            }}
          >
            Search Pseudocode
          </button>
        </div>

        {/* Content Area */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
          {activeTab === 'concepts' && (
            <>
              {/* 1. Formal State Space */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Compass style={{ width: '18px', height: '18px', color: '#34d399' }} />
                  1. Formal Search State Formulation
                </h3>
                <p>
                  In Sokoban, a search state S is mathematically defined as an ordered tuple:
                </p>
                <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.75rem', color: '#38bdf8' }}>
                  {'S = (p, C) where p ∈ ℤ² is player coordinate, and C = {c₁, c₂, ..., cₖ} is crate coordinates.'}
                </div>
                <p>
                  Because crates are identical in identity, swapping two crates produces an identical physical state.
                  To ensure a <strong>canonical bijection</strong> and prevent redundant permutations in the hash map,
                  crates are lexicographically sorted:
                </p>
                <div style={{ background: '#020617', padding: '0.75rem', borderRadius: '8px', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  {'key(S) = `${p.r},${p.c}|${sort(C).map(c => `${c.r},${c.c}`).join(";")}`'}
                </div>
              </div>

              {/* 2. Successor Generation & Sokoban Physics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck style={{ width: '18px', height: '18px', color: '#38bdf8' }} />
                  2. Successor Generation &amp; Non-Invertible Moves
                </h3>
                <p>
                  {'From any state S, legal actions are A ∈ {UP, DOWN, LEFT, RIGHT}. For displacement vector d:'}
                </p>
                <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>
                    <strong>Empty Walk:</strong> If (p + d) is not a wall and not occupied by a crate, S&apos; = (p + d, C). Unit cost = 1.
                  </li>
                  <li>
                    <strong>Crate Push:</strong> If (p + d) contains a crate and (p + 2d) is empty floor/target, the crate is pushed to (p + 2d).
                  </li>
                  <li>
                    <strong>Non-Pullable Physics:</strong> Crates can never be pulled. Once a crate is moved, the player must physically walk around it to push it back.
                  </li>
                </ul>
              </div>

              {/* 3. Deadlock Detection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 style={{ width: '18px', height: '18px', color: '#fbbf24' }} />
                  3. Corner Deadlock Pruning
                </h3>
                <p>
                  A non-target tile flanked by two orthogonal walls (e.g., Up &amp; Left) forms a corner deadlock.
                  Once a crate enters this tile, no legal push can ever displace it. States where any crate occupies an
                  unsolvable corner are immediately pruned during successor generation, cutting off exponentially massive dead branches.
                </p>
              </div>
            </>
          )}

          {activeTab === 'complexity' && (
            <>
              {/* Complexity Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  Theoretical Complexity vs. Practical Performance
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="lab-table" style={{ background: 'rgba(2, 6, 23, 0.6)', borderRadius: '8px', border: '1px solid #334155' }}>
                    <thead>
                      <tr>
                        <th>Algorithm</th>
                        <th>Time Complexity</th>
                        <th>Space Complexity</th>
                        <th>Optimal (Moves)?</th>
                        <th>Complete?</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: '#60a5fa', fontWeight: 700 }}>BFS</td>
                        <td>O(b<sup>d</sup>)</td>
                        <td>O(b<sup>d</sup>)</td>
                        <td style={{ color: '#34d399' }}>Yes (Unit cost)</td>
                        <td style={{ color: '#34d399' }}>Yes</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#fbbf24', fontWeight: 700 }}>DFS</td>
                        <td>O(b<sup>m</sup>)</td>
                        <td>O(b &middot; m)</td>
                        <td style={{ color: '#fb7185' }}>No</td>
                        <td style={{ color: '#fbbf24' }}>No (bounded limit)</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#38bdf8', fontWeight: 700 }}>A* Search</td>
                        <td>O(b<sup>d</sup>) worst, O(b<sup>d*</sup>) with h</td>
                        <td>O(b<sup>d</sup>)</td>
                        <td style={{ color: '#34d399' }}>Yes (Admissible h)</td>
                        <td style={{ color: '#34d399' }}>Yes</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#34d399', fontWeight: 700 }}>Greedy Best-First</td>
                        <td>O(b<sup>m</sup>) worst</td>
                        <td>O(b &middot; m)</td>
                        <td style={{ color: '#fb7185' }}>No</td>
                        <td style={{ color: '#fbbf24' }}>No (greedy detours)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Where b is the effective branching factor (&le; 4), d is optimal solution depth, and m is maximum search depth.
                </p>
              </div>

              {/* Heuristic Admissibility Proof */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ fontWeight: 700, color: '#ffffff' }}>
                  Theorem: Admissibility of Minimum Bipartite Manhattan Matching
                </h4>
                <p>
                  {'Let C = {c₁, ..., cₖ} be crates and T = {t₁, ..., tₖ} be targets. The heuristic is defined as:'}
                </p>
                <div style={{ background: '#020617', padding: '0.6rem', borderRadius: '6px', fontFamily: 'monospace', color: '#38bdf8', fontSize: '0.8rem' }}>
                  {'h(n) = min_π ∑ ||cᵢ - t_π(i)||₁'}
                </div>
                <p>
                  <strong>Proof of Admissibility (h(n) &le; h*(n)):</strong> Every crate c requires at least
                  its Manhattan distance pushes to reach its assigned target pad. Because each crate push consumes
                  at least 1 player step and movement costs are non-negative, the total optimal movement cost
                  satisfies h*(n) &ge; h(n). Therefore, h(n) never overestimates the actual cost, guaranteeing
                  that A* returns an optimal solution.
                </p>
              </div>
            </>
          )}

          {activeTab === 'pseudocode' && (
            <div style={{ background: '#020617', padding: '1rem', borderRadius: '10px', border: '1px solid #1e293b', fontFamily: 'monospace', fontSize: '0.75rem', overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>// A* Search Algorithm</span>
                <pre style={{ color: '#cbd5e1', marginTop: '0.35rem' }}>
{`function A_STAR(level, startState):
    openSet = new PriorityQueue(ordered by f(n) = g(n) + h(n))
    gScore = new Map() // stateKey -> min cost
    gScore.set(encode(startState), 0)
    openSet.push(Node(startState, g=0, h=heuristic(startState)))

    while openSet is not empty:
        current = openSet.pop()
        if isGoal(current.state):
            return reconstructPath(current)

        for succ in getSuccessors(current.state):
            if isDeadlock(succ.state): continue
            tentativeG = current.g + 1
            if tentativeG < gScore.get(encode(succ.state)):
                gScore.set(encode(succ.state), tentativeG)
                succNode = Node(succ.state, g=tentativeG, h=heuristic(succ.state), parent=current)
                openSet.push(succNode)`}
                </pre>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #1e293b' }}>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>// Breadth-First Search (BFS)</span>
                <pre style={{ color: '#cbd5e1', marginTop: '0.35rem' }}>
{`function BFS(level, startState):
    queue = new FIFOQueue()
    visited = new Set([encode(startState)])
    queue.push(Node(startState, parent=null))

    while queue is not empty:
        current = queue.shift()
        for succ in getSuccessors(current.state):
            if encode(succ.state) not in visited:
                visited.add(encode(succ.state))
                child = Node(succ.state, parent=current)
                if isGoal(succ.state):
                    return reconstructPath(child)
                queue.push(child)`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
