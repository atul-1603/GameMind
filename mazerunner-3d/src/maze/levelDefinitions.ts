import { LevelDefinition } from './mazeTypes';

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  {
    id: 1,
    name: 'Beginner',
    subtitle: 'Corridors of Initiation',
    width: 11,
    height: 11,
    loopProbability: 0.05,
    hasWeightedTerrain: false,
    orbCount: 2,
    description:
      'A compact starter maze designed to introduce first-person navigation, movement controls, and basic BFS vs DFS pathfinding dynamics.',
  },
  {
    id: 2,
    name: 'Explorer',
    subtitle: 'Tangled Conduits',
    width: 17,
    height: 17,
    loopProbability: 0.12,
    hasWeightedTerrain: false,
    orbCount: 3,
    description:
      'Moderate complexity with branching intersections and longer dead-ends. Observe how A* and Greedy Best-First begin to diverge from blind searches.',
  },
  {
    id: 3,
    name: 'Labyrinth',
    subtitle: 'Braided Nexus',
    width: 23,
    height: 23,
    loopProbability: 0.22,
    hasWeightedTerrain: false,
    orbCount: 5,
    description:
      'A woven maze featuring intentional loops and multiple distinct routes to the portal. Highlight the non-optimality of DFS and Greedy searches.',
  },
  {
    id: 4,
    name: 'The Lost Sector',
    subtitle: 'Hazards & Chambers',
    width: 29,
    height: 29,
    loopProbability: 0.25,
    hasWeightedTerrain: true,
    orbCount: 6,
    description:
      'Features cyber-sludge (cost 3) and hazard grids (cost 5). Compare Dijkstra and A* against BFS to observe how weighted costs dictate the optimal path.',
  },
  {
    id: 5,
    name: 'The Final Escape',
    subtitle: 'Grand Cyber Labyrinth',
    width: 35,
    height: 35,
    loopProbability: 0.3,
    hasWeightedTerrain: true,
    orbCount: 8,
    description:
      'The ultimate labyrinth challenge. Large scale, multiple chambers, complex loop networks, and variable terrain. Benchmark all five algorithms head-to-head.',
  },
];
