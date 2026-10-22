import { Coord, LevelDefinition } from '../types/game';

interface RawLevel {
  id: number;
  name: string;
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Challenging' | 'Expert';
  description: string;
  grid: string[];
}

const RAW_LEVELS: RawLevel[] = [
  {
    id: 1,
    name: "First Push",
    difficulty: "Beginner",
    description: "Welcome to DimensionShift! Flank the quantum core and push it down onto the containment tile.",
    grid: [
      "#######",
      "#     #",
      "# @$  #",
      "#  .  #",
      "#######"
    ]
  },
  {
    id: 2,
    name: "The Corridors",
    difficulty: "Easy",
    description: "Navigate around the partition to push the core along the corridor into position.",
    grid: [
      "#######",
      "#  .  #",
      "#  $  #",
      "#  @  #",
      "#     #",
      "#######"
    ]
  },
  {
    id: 3,
    name: "Twin Cores",
    difficulty: "Medium",
    description: "Two crates, two targets. Be mindful of order so you don't block yourself.",
    grid: [
      "#######",
      "#  .  #",
      "# $#$ #",
      "# .@  #",
      "#######"
    ]
  },
  {
    id: 4,
    name: "Corner Caution",
    difficulty: "Medium",
    description: "Watch out for unrecoverable deadlocks! Never push a crate into a corner without a target.",
    grid: [
      "#######",
      "#  #  #",
      "# @$ .#",
      "#  $ .#",
      "#  #  #",
      "#######"
    ]
  },
  {
    id: 5,
    name: "Storage Room",
    difficulty: "Challenging",
    description: "Three cores must find their respective containment pads. Careful path planning is required.",
    grid: [
      "########",
      "#  ..  #",
      "#  $$  #",
      "# @ $  #",
      "#   .  #",
      "########"
    ]
  },
  {
    id: 6,
    name: "Dimension Vault",
    difficulty: "Expert",
    description: "A compact labyrinth requiring foresight. Both human players and search algorithms will be tested.",
    grid: [
      "########",
      "#   .  #",
      "# #$#  #",
      "# .$@  #",
      "#  $#  #",
      "#   .  #",
      "########"
    ]
  }
];

export function parseLevel(raw: RawLevel): LevelDefinition {
  const height = raw.grid.length;
  const width = Math.max(...raw.grid.map(row => row.length));

  const walls: Coord[] = [];
  const targets: Coord[] = [];
  const crates: Coord[] = [];
  let playerStart: Coord = { r: 0, c: 0 };

  for (let r = 0; r < height; r++) {
    const row = raw.grid[r];
    for (let c = 0; c < row.length; c++) {
      const char = row[c];
      if (char === '#') {
        walls.push({ r, c });
      } else if (char === '.') {
        targets.push({ r, c });
      } else if (char === '$') {
        crates.push({ r, c });
      } else if (char === '*') {
        crates.push({ r, c });
        targets.push({ r, c });
      } else if (char === '@') {
        playerStart = { r, c };
      } else if (char === '+') {
        playerStart = { r, c };
        targets.push({ r, c });
      }
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    difficulty: raw.difficulty,
    width,
    height,
    walls,
    targets,
    crates,
    playerStart,
    description: raw.description,
  };
}

export const LEVELS: LevelDefinition[] = RAW_LEVELS.map(parseLevel);
