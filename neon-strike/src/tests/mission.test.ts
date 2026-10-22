import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCampaignProgress,
  recordMissionCompletion,
  getMissionConfig,
  clearCampaignProgress,
} from '../game/missionManager';
import { MISSIONS } from '../game/arenaDefinitions';

describe('Phase 5: Mission Progression & Campaign Manager', () => {
  beforeEach(() => {
    clearCampaignProgress();
  });

  it('initializes with Sector 1 unlocked by default', () => {
    const progress = loadCampaignProgress();
    expect(progress.unlockedMissions).toContain(1);
    expect(progress.completedMissions.length).toBe(0);
  });

  it('unlocks Sector 2 upon completing Sector 1', () => {
    const progress = recordMissionCompletion(1, 45.2, 85);
    expect(progress.completedMissions).toContain(1);
    expect(progress.unlockedMissions).toContain(2);
    expect(progress.bestTimes[1]).toBe(45.2);
    expect(progress.bestAccuracy[1]).toBe(85);
  });

  it('updates best times and accuracy when a superior run is completed', () => {
    recordMissionCompletion(1, 50.0, 70);
    const updated = recordMissionCompletion(1, 38.5, 92);

    expect(updated.bestTimes[1]).toBe(38.5);
    expect(updated.bestAccuracy[1]).toBe(92);
  });

  it('preserves existing records if a subsequent run is slower or less accurate', () => {
    recordMissionCompletion(1, 35.0, 95);
    const subsequent = recordMissionCompletion(1, 42.0, 80);

    expect(subsequent.bestTimes[1]).toBe(35.0);
    expect(subsequent.bestAccuracy[1]).toBe(95);
  });

  it('retrieves valid arena configurations for all campaign sectors', () => {
    for (const m of MISSIONS) {
      const config = getMissionConfig(m.id);
      expect(config.id).toBe(m.id);
      expect(config.enemies.length).toBeGreaterThan(0);
      expect(config.obstacles.length).toBeGreaterThan(0);
      expect(config.pickups.length).toBeGreaterThan(0);
      expect(config.extractionZone.radius).toBeGreaterThan(0);
    }
  });
});
