import { Coord, Direction, LevelDefinition, MoveStep } from '../types/game';
import { DIRECTIONS } from './constants';
import { hasDeadlock } from './deadlock';

export interface GameSnapshot {
  player: Coord;
  crates: Coord[];
  moveCount: number;
  pushCount: number;
}

export class GameState {
  public level: LevelDefinition;
  public player: Coord;
  public crates: Coord[];
  public wallsSet: Set<string>;
  public targetsSet: Set<string>;
  public moveHistory: MoveStep[] = [];
  public moveCount: number = 0;
  public pushCount: number = 0;

  constructor(level: LevelDefinition) {
    this.level = level;
    this.player = { ...level.playerStart };
    this.crates = level.crates.map(c => ({ ...c }));
    this.wallsSet = new Set(level.walls.map(w => `${w.r},${w.c}`));
    this.targetsSet = new Set(level.targets.map(t => `${t.r},${t.c}`));
  }

  public reset(): void {
    this.player = { ...this.level.playerStart };
    this.crates = this.level.crates.map(c => ({ ...c }));
    this.moveHistory = [];
    this.moveCount = 0;
    this.pushCount = 0;
  }

  public findCrateIndexAt(r: number, c: number): number {
    return this.crates.findIndex(crate => crate.r === r && crate.c === c);
  }

  public isWall(r: number, c: number): boolean {
    return this.wallsSet.has(`${r},${c}`);
  }

  public isTarget(r: number, c: number): boolean {
    return this.targetsSet.has(`${r},${c}`);
  }

  public isCrateOnTarget(crate: Coord): boolean {
    return this.targetsSet.has(`${crate.r},${crate.c}`);
  }

  public cratesRemaining(): number {
    let unplaced = 0;
    for (const crate of this.crates) {
      if (!this.isCrateOnTarget(crate)) {
        unplaced++;
      }
    }
    return unplaced;
  }

  public isWon(): boolean {
    return this.cratesRemaining() === 0;
  }

  public isDeadlocked(): boolean {
    return hasDeadlock(this.crates, this.wallsSet, this.targetsSet);
  }

  public tryMove(direction: Direction): {
    success: boolean;
    isPush: boolean;
    step?: MoveStep;
  } {
    const { dr, dc } = DIRECTIONS[direction];
    const newPlayerR = this.player.r + dr;
    const newPlayerC = this.player.c + dc;

    // Check if player runs into wall
    if (this.isWall(newPlayerR, newPlayerC)) {
      return { success: false, isPush: false };
    }

    // Check if crate is in front of player
    const crateIndex = this.findCrateIndexAt(newPlayerR, newPlayerC);
    if (crateIndex !== -1) {
      // Trying to push crate
      const newCrateR = newPlayerR + dr;
      const newCrateC = newPlayerC + dc;

      // Cannot push crate into wall or another crate
      if (this.isWall(newCrateR, newCrateC) || this.findCrateIndexAt(newCrateR, newCrateC) !== -1) {
        return { success: false, isPush: false };
      }

      // Legal push!
      const step: MoveStep = {
        direction,
        dr,
        dc,
        pushedCrateIndex: crateIndex,
        previousPlayer: { ...this.player },
        previousCrates: this.crates.map(c => ({ ...c })),
      };

      this.crates[crateIndex] = { r: newCrateR, c: newCrateC };
      this.player = { r: newPlayerR, c: newPlayerC };
      this.moveHistory.push(step);
      this.moveCount++;
      this.pushCount++;

      return { success: true, isPush: true, step };
    }

    // Normal player step without push
    const step: MoveStep = {
      direction,
      dr,
      dc,
      previousPlayer: { ...this.player },
      previousCrates: this.crates.map(c => ({ ...c })),
    };

    this.player = { r: newPlayerR, c: newPlayerC };
    this.moveHistory.push(step);
    this.moveCount++;

    return { success: true, isPush: false, step };
  }

  public undo(): boolean {
    if (this.moveHistory.length === 0) return false;
    const lastStep = this.moveHistory.pop()!;
    this.player = { ...lastStep.previousPlayer };
    this.crates = lastStep.previousCrates.map(c => ({ ...c }));
    this.moveCount--;
    if (lastStep.pushedCrateIndex !== undefined) {
      this.pushCount--;
    }
    return true;
  }
}
