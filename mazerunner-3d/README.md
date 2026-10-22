# MazeRunner 3D — Escape the Labyrinth
**Part of GameMind — Algorithmic Game Intelligence (Design and Analysis of Algorithms Course Project)**

---

## 🎮 Overview

**MazeRunner 3D: Escape the Labyrinth** is an interactive, browser-playable 3D maze exploration game and empirical algorithm benchmarking laboratory built with **React**, **TypeScript**, **Three.js**, **Zustand**, and **Vitest**.

The player navigates an atmospheric cyber labyrinth, discovering illuminated exit portals and collecting energy orbs. At any moment, players can activate the **AI Solver** to compute, visualize, and execute real-time pathfinding routes from their dynamic position using five core DAA algorithms implemented completely from scratch.

---

## 🚀 Key Features

1. **Genuinely 3D Labyrinth Exploration**:
   - First-Person camera with Pointer Lock mouse-look, smooth WASD movement, sprint, and hop.
   - Continuous circle-AABB sliding collision detection prevents wall penetration and corner snagging.
   - Dynamic Three.js lighting: metallic wall bevels, glowing neon edge trims, player flashlight, rotating portal energy rings, and volumetric depth fog.
   - Real-time Bird's-Eye camera inspection mode (`M`).

2. **Core DAA Algorithms Implemented from Scratch**:
   - **Breadth-First Search (BFS)**: Level-by-level exploration using a FIFO queue; guaranteed unweighted shortest paths ($O(|V| + |E|)$).
   - **Depth-First Search (DFS)**: Deep branch exploration using an iterative LIFO stack with cycle prevention and expansion bounds ($O(|V| + |E|)$).
   - **Dijkstra's Algorithm**: Lowest-cost pathfinding via a binary min-heap Priority Queue; optimal for variable non-negative edge costs ($O((|V| + |E|) \log |V|)$).
   - **A\* Search**: Heuristic search combining accumulated cost $g(n)$ with admissible Manhattan distance $h(n)$ ($f(n) = g(n) + h(n)$); explores significantly fewer nodes while maintaining optimality ($O((|V| + |E|) \log |V|)$).
   - **Greedy Best-First Search**: Heuristic-guided priority queue ordered by $h(n)$ alone; fast exploration demonstrating vulnerability to cul-de-sacs and suboptimality.

3. **Seeded Procedural Maze Generator**:
   - Deterministic Mulberry32 PRNG ensures identical mazes given the same seed.
   - Randomized backtracker generation with configurable braid loops, chambers, energy orb placement, and weighted terrain (cyber sludge: cost 3, energy hazard: cost 5).
   - Automated solvability verification guarantees start/exit integrity and boundary containment.
   - 5 built-in sectors with increasing dimension and complexity (11x11 to 35x35).

4. **Interactive AI Solver & 3D Route Playback**:
   - Dynamic search origin begins at the player's current grid position.
   - Step-by-step slider, play/pause controls, speed presets (1x–40x), and color-coded map legends.
   - **Execute Route in 3D**: Autopilots player character smoothly through the computed path.

5. **Algorithm Lab & Comparative Benchmarks**:
   - Head-to-head empirical testing on identical maze layouts and start/target coordinates.
   - Telemetry matrix measuring real execution time (ms), expanded nodes, generated nodes, path length, total cost, and max frontier size (memory proxy).
   - Interactive 2D/3D visual inspection canvas and comparative bar charts.

6. **Educational DAA Theory Reference**:
   - In-app curriculum detailing graph modeling of labyrinths ($G=(V, E)$), parent pointers, proofs of admissibility ($h(n) \le h^*(n)$), formal pseudocode, and theoretical vs. empirical complexity trade-offs.

---

## 🛠️ Technology Stack

- **Core**: React 19, TypeScript 6.0, Vite 8.3
- **Graphics**: Three.js (r186) with ACES Filmic Tone Mapping & PCF Soft Shadows
- **State Management**: Zustand
- **Audio**: Web Audio API (procedural synthesis, zero external sound files)
- **Testing**: Vitest
- **Icons & Visuals**: Lucide React, Canvas Confetti

---

## 📦 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Run

```bash
# Navigate to project directory
cd mazerunner-3d

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5174` (or port indicated in the terminal) in any modern browser.

### Run Automated Tests

```bash
npm test
```

Runs the 18 Vitest suites verifying maze generation reproducibility, solvability on all 5 levels, BFS shortest path, DFS legal traversal, Dijkstra weighted cost minimization, A* admissibility, and continuous collision detection.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🕹️ Controls

| Key | Action |
| --- | --- |
| **W / A / S / D** | Move Forward / Left / Backward / Right |
| **Mouse** | Look around (click canvas to engage Pointer Lock) |
| **Shift** | Sprint (1.5x speed) |
| **Space** | Hop / Mini-Jump |
| **M** | Toggle Bird's-Eye / First-Person Camera |
| **P / Escape** | Pause / Resume Game |
| **R** | Restart Current Sector |
| **H** | Toggle Help & Controls Overlay |

---

## 📊 Complexity Comparison Matrix

| Algorithm | Data Structure | Time Complexity | Space Complexity | Unweighted Shortest? | Weighted Optimal? |
|---|---|---|---|:---:|:---:|
| **BFS** | FIFO Queue | $O(\|V\| + \|E\|)$ | $O(\|V\|)$ | **YES** | NO |
| **DFS** | LIFO Stack | $O(\|V\| + \|E\|)$ | $O(\|V\|)$ | NO | NO |
| **Dijkstra** | Min-Heap PQ | $O((\|V\| + \|E\|) \log \|V\|)$ | $O(\|V\|)$ | **YES** | **YES** |
| **A\* Search** | Min-Heap PQ | $O((\|V\| + \|E\|) \log \|V\|)$ | $O(\|V\|)$ | **YES** | **YES** |
| **Greedy Best-First** | Min-Heap PQ | $O((\|V\| + \|E\|) \log \|V\|)$ | $O(\|V\|)$ | Suboptimal | NO |

---

## 📝 License
Academic project for Design and Analysis of Algorithms (DAA) Course — GameMind.
