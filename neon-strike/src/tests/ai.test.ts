import { describe, it, expect } from 'vitest';
import { checkLineOfSight } from '../ai/perception';
import { evaluateEnemyState, type EnemyStateContext } from '../ai/enemyStateMachine';
import { createEnemyInstance } from '../ai/enemyController';
import type { ArenaObstacle } from '../game/arenaDefinitions';

describe('Phase 4: Enemy AI Architecture, Perception & State Machine', () => {
  const wall: ArenaObstacle = {
    x: 0,
    z: 0,
    width: 6,
    depth: 2,
    height: 4,
    type: 'wall',
  };

  it('detects unobstructed line of sight when no obstacles are present', () => {
    const enemyPos = { x: 0, y: 1, z: 10 };
    const playerPos = { x: 0, y: 1, z: 2 };

    const result = checkLineOfSight(enemyPos, playerPos, []);
    expect(result.hasLineOfSight).toBe(true);
    expect(result.distance).toBeCloseTo(8, 1);
  });

  it('detects obstructed line of sight when a solid wall is in between', () => {
    // Enemy at z=5, Wall at z=0 (depth 2 => z=-1 to +1), Player at z=-5
    const enemyPos = { x: 0, y: 1, z: 5 };
    const playerPos = { x: 0, y: 1, z: -5 };

    const result = checkLineOfSight(enemyPos, playerPos, [wall]);
    expect(result.hasLineOfSight).toBe(false);
  });

  it('transitions PATROL -> CHASE when player is sighted at distance', () => {
    const ctx: EnemyStateContext = {
      archetype: 'scout',
      currentHealth: 70,
      maxHealth: 70,
      distanceToPlayer: 22,
      hasLineOfSight: true,
      timeSinceLastSeen: 0,
      inCover: false,
      nearbyCoverDistance: 10,
    };

    const res = evaluateEnemyState('PATROL', ctx);
    expect(res.nextState).toBe('CHASE');
  });

  it('transitions CHASE -> ATTACK when target enters effective combat range', () => {
    const ctx: EnemyStateContext = {
      archetype: 'scout',
      currentHealth: 70,
      maxHealth: 70,
      distanceToPlayer: 10, // within attackRange 14
      hasLineOfSight: true,
      timeSinceLastSeen: 0,
      inCover: false,
      nearbyCoverDistance: 10,
    };

    const res = evaluateEnemyState('CHASE', ctx);
    expect(res.nextState).toBe('ATTACK');
  });

  it('transitions ATTACK -> INVESTIGATE when target breaks line of sight', () => {
    const ctx: EnemyStateContext = {
      archetype: 'scout',
      currentHealth: 70,
      maxHealth: 70,
      distanceToPlayer: 10,
      hasLineOfSight: false,
      timeSinceLastSeen: 0.1,
      inCover: false,
      nearbyCoverDistance: 10,
    };

    const res = evaluateEnemyState('ATTACK', ctx);
    expect(res.nextState).toBe('INVESTIGATE');
  });

  it('transitions ATTACK -> TAKE_COVER when health is critically compromised', () => {
    const ctx: EnemyStateContext = {
      archetype: 'guardian',
      currentHealth: 30, // 30/160 < 0.35 threshold
      maxHealth: 160,
      distanceToPlayer: 10,
      hasLineOfSight: true,
      timeSinceLastSeen: 0,
      inCover: false,
      nearbyCoverDistance: 5,
    };

    const res = evaluateEnemyState('ATTACK', ctx);
    expect(res.nextState).toBe('TAKE_COVER');
  });

  it('transitions to DEAD when health reaches zero', () => {
    const ctx: EnemyStateContext = {
      archetype: 'hunter',
      currentHealth: 0,
      maxHealth: 110,
      distanceToPlayer: 10,
      hasLineOfSight: true,
      timeSinceLastSeen: 0,
      inCover: false,
      nearbyCoverDistance: 10,
    };

    const res = evaluateEnemyState('ATTACK', ctx);
    expect(res.nextState).toBe('DEAD');
  });

  it('initializes Scout, Guardian, and Hunter with distinct role properties', () => {
    const scout = createEnemyInstance('s1', 'scout', { x: 0, y: 1, z: 0 }, []);
    const guardian = createEnemyInstance('g1', 'guardian', { x: 0, y: 1, z: 0 }, []);
    const hunter = createEnemyInstance('h1', 'hunter', { x: 0, y: 1, z: 0 }, []);

    // Scout is fast and lightly armored
    expect(scout.speed).toBeGreaterThan(guardian.speed);
    expect(scout.maxHealth).toBeLessThan(guardian.maxHealth);

    // Guardian has highest health and damage
    expect(guardian.maxHealth).toBeGreaterThan(hunter.maxHealth);
    expect(guardian.damage).toBeGreaterThan(scout.damage);

    // Hunter has balanced pursuer specs
    expect(hunter.speed).toBeGreaterThan(guardian.speed);
    expect(hunter.maxHealth).toBeGreaterThan(scout.maxHealth);
  });
});
