import type { EnemyArchetype } from '../game/arenaDefinitions';

export type EnemyAIState =
  | 'PATROL'
  | 'INVESTIGATE'
  | 'CHASE'
  | 'ATTACK'
  | 'TAKE_COVER'
  | 'FLANK'
  | 'RETREAT'
  | 'DEAD';

export interface EnemyStateContext {
  archetype: EnemyArchetype;
  currentHealth: number;
  maxHealth: number;
  distanceToPlayer: number;
  hasLineOfSight: boolean;
  timeSinceLastSeen: number; // in seconds
  inCover: boolean;
  nearbyCoverDistance: number;
}

export interface StateTransitionResult {
  nextState: EnemyAIState;
  reason: string;
}

/**
 * Deterministic State Machine evaluation for Enemy AI.
 */
export function evaluateEnemyState(
  currentState: EnemyAIState,
  ctx: EnemyStateContext
): StateTransitionResult {
  if (ctx.currentHealth <= 0 || currentState === 'DEAD') {
    return { nextState: 'DEAD', reason: 'Unit neutralized' };
  }

  const healthRatio = ctx.currentHealth / ctx.maxHealth;

  // Archetype parameters
  const attackRange = ctx.archetype === 'scout' ? 14 : ctx.archetype === 'guardian' ? 18 : 16;
  const criticalHealthThreshold = ctx.archetype === 'guardian' ? 0.35 : 0.25;

  switch (currentState) {
    case 'PATROL': {
      if (ctx.hasLineOfSight) {
        if (ctx.distanceToPlayer <= attackRange) {
          return { nextState: 'ATTACK', reason: 'Target acquired in combat range' };
        }
        return { nextState: 'CHASE', reason: 'Target sighted at distance' };
      }
      return { nextState: 'PATROL', reason: 'Continuing patrol route' };
    }

    case 'CHASE': {
      if (healthRatio <= criticalHealthThreshold && ctx.nearbyCoverDistance < 12) {
        return { nextState: 'TAKE_COVER', reason: 'Exosuit integrity compromised' };
      }

      if (ctx.hasLineOfSight && ctx.distanceToPlayer <= attackRange) {
        if (ctx.archetype === 'hunter' && Math.random() < 0.4) {
          return { nextState: 'FLANK', reason: 'Hunter initiating flanking vector' };
        }
        return { nextState: 'ATTACK', reason: 'Entered effective firing range' };
      }

      if (!ctx.hasLineOfSight && ctx.timeSinceLastSeen > 0.5) {
        return { nextState: 'INVESTIGATE', reason: 'Lost target line of sight' };
      }

      return { nextState: 'CHASE', reason: 'Pursuing target' };
    }

    case 'ATTACK': {
      if (healthRatio <= criticalHealthThreshold && ctx.nearbyCoverDistance < 12) {
        return { nextState: 'TAKE_COVER', reason: 'Critical damage received' };
      }

      if (!ctx.hasLineOfSight) {
        return { nextState: 'INVESTIGATE', reason: 'Target broke line of sight' };
      }

      if (ctx.distanceToPlayer > attackRange * 1.2) {
        return { nextState: 'CHASE', reason: 'Target moved out of effective range' };
      }

      if (ctx.archetype === 'hunter' && ctx.distanceToPlayer < 8) {
        return { nextState: 'FLANK', reason: 'Target too close, repositioning for flank' };
      }

      return { nextState: 'ATTACK', reason: 'Engaging target with plasma fire' };
    }

    case 'TAKE_COVER': {
      if (ctx.inCover && healthRatio > criticalHealthThreshold) {
        if (ctx.hasLineOfSight) {
          return { nextState: 'ATTACK', reason: 'Shields stabilized, returning fire from cover' };
        }
        return { nextState: 'CHASE', reason: 'Shields stabilized, pursuing target' };
      }

      if (healthRatio <= 0.15 && ctx.archetype === 'scout') {
        return { nextState: 'RETREAT', reason: 'Scout unit disengaging' };
      }

      return { nextState: 'TAKE_COVER', reason: 'Holding defensive cover position' };
    }

    case 'FLANK': {
      if (!ctx.hasLineOfSight && ctx.timeSinceLastSeen > 4.0) {
        return { nextState: 'INVESTIGATE', reason: 'Target lost during flanking maneuver' };
      }

      if (ctx.hasLineOfSight && ctx.distanceToPlayer <= attackRange) {
        return { nextState: 'ATTACK', reason: 'Flanking vector achieved, firing' };
      }

      return { nextState: 'FLANK', reason: 'Executing tactical flank route' };
    }

    case 'INVESTIGATE': {
      if (ctx.hasLineOfSight) {
        return { nextState: 'CHASE', reason: 'Target re-acquired during investigation' };
      }

      if (ctx.timeSinceLastSeen > 6.0) {
        return { nextState: 'PATROL', reason: 'Investigation expired, resuming patrol' };
      }

      return { nextState: 'INVESTIGATE', reason: 'Scanning last known location' };
    }

    case 'RETREAT': {
      if (ctx.distanceToPlayer > 22) {
        return { nextState: 'PATROL', reason: 'Escaped danger zone, regrouping' };
      }
      return { nextState: 'RETREAT', reason: 'Falling back from hostile fire' };
    }

    default:
      return { nextState: 'PATROL', reason: 'Default state fallback' };
  }
}
