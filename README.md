# GameMind — Algorithmic Game Intelligence

Welcome to **GameMind**, a collection of interactive 3D browser games and algorithm visualization projects developed for the **Design and Analysis of Algorithms (DAA)** curriculum.

---

## 🎮 Projects in this Repository

### 1. [MazeRunner 3D: Escape the Labyrinth](./mazerunner-3d)
A complete, browser-playable 3D maze game and empirical algorithm benchmarking laboratory.
- **Technologies**: React 19, TypeScript, Three.js, Zustand, Vitest, Tailwind CSS.
- **Core Algorithms (implemented from scratch in TypeScript)**:
  - **Breadth-First Search (BFS)**: Unweighted shortest paths via FIFO queue ($O(|V| + |E|)$).
  - **Depth-First Search (DFS)**: Deep branch exploration via iterative LIFO stack ($O(|V| + |E|)$).
  - **Dijkstra's Algorithm**: Weighted minimum-cost routing via binary min-heap Priority Queue ($O((|V| + |E|) \log |V|)$).
  - **A\* Search**: Heuristic search combining accumulated cost with admissible Manhattan distance ($f(n) = g(n) + h(n)$) ($O((|V| + |E|) \log |V|)$).
  - **Greedy Best-First Search**: Pure heuristic prioritization via Priority Queue ($O((|V| + |E|) \log |V|)$).
- **Features**: First-person follow perspective (FPV) with visible animated cybernetic player avatar, continuous collision detection, real-time 3D search overlay, autopilot path execution, Algorithm Lab benchmarking matrix & comparative charts, and an in-app DAA theory curriculum.

### 2. [Neon Strike 3D Arena](./neon-strike)
An action-packed 3D neon cyberpunk arena game featuring real-time physics, enemy bots, and procedural graphics.
- **Technologies**: React, TypeScript, Three.js, React Three Fiber / Drei, Zustand.

### 3. [3D Sokoban Puzzle](./3D%20Sokoban%20Puzzle)
A 3D spatial puzzle game based on the classic Sokoban box-pushing mechanics, demonstrating state-space search and heuristic evaluation.

---

## 🚀 Getting Started

Each project is fully standalone and can be run locally:

### Run MazeRunner 3D
```bash
cd mazerunner-3d
npm install
npm run dev
```

### Run Neon Strike
```bash
cd neon-strike
npm install
npm run dev
```

### Run 3D Sokoban Puzzle
```bash
cd "3D Sokoban Puzzle"
npm install
npm run dev
```
