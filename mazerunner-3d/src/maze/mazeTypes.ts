export type CellType = 
  | 'WALL'
  | 'EMPTY'
  | 'START'
  | 'EXIT'
  | 'DIFFICULT'   // Movement cost: 3 (e.g. cyber sludge / mud)
  | 'HAZARDOUS'   // Movement cost: 5 (e.g. energy hazard grid)
  | 'ORB';        // Collectible energy orb (cost: 1)

export interface Point2D {
  x: number;
  y: number;
}

export interface MazeCell {
  x: number;
  y: number;
  type: CellType;
  cost: number;
  visited?: boolean;
  hasOrb?: boolean;
}

export interface MazeGrid {
  width: number;
  height: number;
  cells: MazeCell[][];
  start: Point2D;
  exit: Point2D;
  seed: number;
  totalOrbs: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  loopProbability: number;
  hasWeightedTerrain: boolean;
  orbCount: number;
  description: string;
}
