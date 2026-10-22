export interface Coord {
  r: number; // row / Z coordinate in 3D
  c: number; // column / X coordinate in 3D
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface MoveStep {
  direction: Direction;
  dr: number;
  dc: number;
  pushedCrateIndex?: number; // index of crate if a crate was pushed
  previousPlayer: Coord;
  previousCrates: Coord[];
}

export type TileType = 'FLOOR' | 'WALL' | 'TARGET';

export interface LevelDefinition {
  id: number;
  name: string;
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Challenging' | 'Expert';
  width: number;
  height: number;
  walls: Coord[];
  targets: Coord[];
  crates: Coord[];
  playerStart: Coord;
  description: string;
  parMoves?: number;
}
