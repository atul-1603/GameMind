import type { GridCoord } from '../algorithms/pathTypes';

export interface CoverSpot {
  x: number;
  z: number;
  height: number;
}

export interface PickupLocation {
  id: string;
  type: 'health' | 'ammo';
  x: number;
  z: number;
  amount: number;
}

export type EnemyArchetype = 'scout' | 'guardian' | 'hunter';

export interface EnemySpawnConfig {
  id: string;
  type: EnemyArchetype;
  position: { x: number; y: number; z: number };
  patrolRoute: GridCoord[];
}

export interface ArenaObstacle {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  type: 'wall' | 'pillar' | 'barrier' | 'crate' | 'reactor';
}

export interface ArenaMissionConfig {
  id: number;
  name: string;
  briefing: string;
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  originX: number;
  originZ: number;
  playerSpawn: { x: number; y: number; z: number };
  extractionZone: { x: number; z: number; radius: number };
  obstacles: ArenaObstacle[];
  coverSpots: CoverSpot[];
  pickups: PickupLocation[];
  enemies: EnemySpawnConfig[];
}

export const MISSIONS: ArenaMissionConfig[] = [
  {
    id: 1,
    name: 'Training Grounds',
    briefing: 'Calibrate combat systems in the neon simulation chamber. Eliminate 3 agile Scout combat drones.',
    gridWidth: 20,
    gridHeight: 20,
    cellSize: 2,
    originX: -20,
    originZ: -20,
    playerSpawn: { x: 0, y: 1, z: 14 },
    extractionZone: { x: 0, z: -14, radius: 2.5 },
    obstacles: [
      // Central pillars and low barriers
      { x: -6, z: 0, width: 2, depth: 6, height: 3, type: 'wall' },
      { x: 6, z: 0, width: 2, depth: 6, height: 3, type: 'wall' },
      { x: 0, z: 4, width: 4, depth: 1.5, height: 1.2, type: 'barrier' },
      { x: 0, z: -4, width: 4, depth: 1.5, height: 1.2, type: 'barrier' },
      { x: -10, z: -8, width: 2, depth: 2, height: 2, type: 'crate' },
      { x: 10, z: -8, width: 2, depth: 2, height: 2, type: 'crate' },
      { x: -10, z: 8, width: 2, depth: 2, height: 2, type: 'crate' },
      { x: 10, z: 8, width: 2, depth: 2, height: 2, type: 'crate' },
    ],
    coverSpots: [
      { x: -4, z: 4, height: 1.2 },
      { x: 4, z: 4, height: 1.2 },
      { x: -4, z: -4, height: 1.2 },
      { x: 4, z: -4, height: 1.2 },
    ],
    pickups: [
      { id: 'p1_h1', type: 'health', x: -12, z: 0, amount: 40 },
      { id: 'p1_a1', type: 'ammo', x: 12, z: 0, amount: 60 },
      { id: 'p1_a2', type: 'ammo', x: 0, z: 0, amount: 45 },
    ],
    enemies: [
      {
        id: 'scout_1',
        type: 'scout',
        position: { x: -8, y: 1, z: -8 },
        patrolRoute: [{ x: 5, z: 5 }, { x: 9, z: 5 }, { x: 9, z: 9 }, { x: 5, z: 9 }],
      },
      {
        id: 'scout_2',
        type: 'scout',
        position: { x: 8, y: 1, z: -8 },
        patrolRoute: [{ x: 14, z: 5 }, { x: 11, z: 5 }, { x: 11, z: 9 }, { x: 14, z: 9 }],
      },
      {
        id: 'scout_3',
        type: 'scout',
        position: { x: 0, y: 1, z: -10 },
        patrolRoute: [{ x: 8, z: 4 }, { x: 12, z: 4 }, { x: 10, z: 7 }],
      },
    ],
  },
  {
    id: 2,
    name: 'Neon Outpost',
    briefing: 'Infiltrate the forward garrison. Heavy Guardians hold defensive cover while Hunter bots coordinate flanking maneuvers.',
    gridWidth: 26,
    gridHeight: 26,
    cellSize: 2,
    originX: -26,
    originZ: -26,
    playerSpawn: { x: 0, y: 1, z: 20 },
    extractionZone: { x: 0, z: -20, radius: 3 },
    obstacles: [
      // Corridor layout with tactical chokepoints
      { x: -10, z: 8, width: 12, depth: 2, height: 4, type: 'wall' },
      { x: 10, z: 8, width: 12, depth: 2, height: 4, type: 'wall' },
      { x: 0, z: 0, width: 4, depth: 4, height: 4, type: 'pillar' },
      { x: -14, z: -4, width: 2, depth: 10, height: 3.5, type: 'wall' },
      { x: 14, z: -4, width: 2, depth: 10, height: 3.5, type: 'wall' },
      { x: -6, z: -10, width: 6, depth: 1.5, height: 1.5, type: 'barrier' },
      { x: 6, z: -10, width: 6, depth: 1.5, height: 1.5, type: 'barrier' },
      { x: -6, z: 14, width: 2, depth: 2, height: 2, type: 'crate' },
      { x: 6, z: 14, width: 2, depth: 2, height: 2, type: 'crate' },
      { x: -18, z: 0, width: 3, depth: 3, height: 2, type: 'crate' },
      { x: 18, z: 0, width: 3, depth: 3, height: 2, type: 'crate' },
    ],
    coverSpots: [
      { x: -6, z: -8, height: 1.5 },
      { x: 6, z: -8, height: 1.5 },
      { x: -3, z: 2, height: 3 },
      { x: 3, z: 2, height: 3 },
    ],
    pickups: [
      { id: 'p2_h1', type: 'health', x: -16, z: 10, amount: 50 },
      { id: 'p2_h2', type: 'health', x: 16, z: -12, amount: 50 },
      { id: 'p2_a1', type: 'ammo', x: 0, z: 2, amount: 60 },
      { id: 'p2_a2', type: 'ammo', x: 16, z: 10, amount: 60 },
    ],
    enemies: [
      {
        id: 'outpost_scout_1',
        type: 'scout',
        position: { x: -12, y: 1, z: 0 },
        patrolRoute: [{ x: 7, z: 13 }, { x: 7, z: 8 }],
      },
      {
        id: 'outpost_guardian_1',
        type: 'guardian',
        position: { x: -6, y: 1, z: -12 },
        patrolRoute: [{ x: 10, z: 7 }, { x: 10, z: 5 }],
      },
      {
        id: 'outpost_guardian_2',
        type: 'guardian',
        position: { x: 6, y: 1, z: -12 },
        patrolRoute: [{ x: 16, z: 7 }, { x: 16, z: 5 }],
      },
      {
        id: 'outpost_hunter_1',
        type: 'hunter',
        position: { x: 12, y: 1, z: 0 },
        patrolRoute: [{ x: 19, z: 13 }, { x: 19, z: 8 }],
      },
    ],
  },
  {
    id: 3,
    name: 'Reactor Siege',
    briefing: 'Deep within the subterranean energy core. Hostile AI forces have fortified the central fusion reactor. Clear the sector.',
    gridWidth: 32,
    gridHeight: 32,
    cellSize: 2,
    originX: -32,
    originZ: -32,
    playerSpawn: { x: 0, y: 1, z: 26 },
    extractionZone: { x: 0, z: -26, radius: 3.5 },
    obstacles: [
      // Central glowing reactor core and surrounding containment barriers
      { x: 0, z: 0, width: 8, depth: 8, height: 6, type: 'reactor' },
      { x: -12, z: 0, width: 2, depth: 14, height: 4, type: 'wall' },
      { x: 12, z: 0, width: 2, depth: 14, height: 4, type: 'wall' },
      { x: 0, z: 14, width: 14, depth: 2, height: 4, type: 'wall' },
      { x: 0, z: -14, width: 14, depth: 2, height: 4, type: 'wall' },
      // Ring barriers
      { x: -8, z: 8, width: 3, depth: 3, height: 3, type: 'pillar' },
      { x: 8, z: 8, width: 3, depth: 3, height: 3, type: 'pillar' },
      { x: -8, z: -8, width: 3, depth: 3, height: 3, type: 'pillar' },
      { x: 8, z: -8, width: 3, depth: 3, height: 3, type: 'pillar' },
      // Low cover
      { x: -6, z: 20, width: 5, depth: 1.5, height: 1.4, type: 'barrier' },
      { x: 6, z: 20, width: 5, depth: 1.5, height: 1.4, type: 'barrier' },
      { x: -20, z: -4, width: 4, depth: 2, height: 2, type: 'crate' },
      { x: 20, z: -4, width: 4, depth: 2, height: 2, type: 'crate' },
    ],
    coverSpots: [
      { x: -6, z: 18, height: 1.4 },
      { x: 6, z: 18, height: 1.4 },
      { x: -8, z: 6, height: 3 },
      { x: 8, z: 6, height: 3 },
      { x: -8, z: -6, height: 3 },
      { x: 8, z: -6, height: 3 },
    ],
    pickups: [
      { id: 'p3_h1', type: 'health', x: -22, z: 0, amount: 60 },
      { id: 'p3_h2', type: 'health', x: 22, z: 0, amount: 60 },
      { id: 'p3_a1', type: 'ammo', x: 0, z: 18, amount: 80 },
      { id: 'p3_a2', type: 'ammo', x: 0, z: -18, amount: 80 },
    ],
    enemies: [
      {
        id: 'reactor_scout_1',
        type: 'scout',
        position: { x: -18, y: 1, z: 12 },
        patrolRoute: [{ x: 7, z: 22 }, { x: 7, z: 16 }],
      },
      {
        id: 'reactor_scout_2',
        type: 'scout',
        position: { x: 18, y: 1, z: 12 },
        patrolRoute: [{ x: 25, z: 22 }, { x: 25, z: 16 }],
      },
      {
        id: 'reactor_hunter_1',
        type: 'hunter',
        position: { x: -16, y: 1, z: -10 },
        patrolRoute: [{ x: 8, z: 11 }, { x: 12, z: 11 }],
      },
      {
        id: 'reactor_hunter_2',
        type: 'hunter',
        position: { x: 16, y: 1, z: -10 },
        patrolRoute: [{ x: 24, z: 11 }, { x: 20, z: 11 }],
      },
      {
        id: 'reactor_guardian_1',
        type: 'guardian',
        position: { x: 0, y: 1, z: -8 },
        patrolRoute: [{ x: 14, z: 12 }, { x: 18, z: 12 }],
      },
    ],
  },
];
