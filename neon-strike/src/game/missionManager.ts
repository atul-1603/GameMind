import { MISSIONS, type ArenaMissionConfig } from './arenaDefinitions';

export interface CampaignProgress {
  unlockedMissions: number[]; // e.g. [1, 2, 3]
  completedMissions: number[];
  bestTimes: Record<number, number>;
  bestAccuracy: Record<number, number>;
}

const STORAGE_KEY = 'neon_strike_campaign_progress';
let memoryCache: CampaignProgress | null = null;

export function clearCampaignProgress(): void {
  memoryCache = null;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

export function loadCampaignProgress(): CampaignProgress {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        memoryCache = JSON.parse(saved);
        return memoryCache!;
      }
    }
  } catch {
    // Fallback if localStorage unavailable
  }

  memoryCache = {
    unlockedMissions: [1],
    completedMissions: [],
    bestTimes: {},
    bestAccuracy: {},
  };
  return memoryCache;
}

export function saveCampaignProgress(progress: CampaignProgress): void {
  memoryCache = progress;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  } catch {
    // Ignore
  }
}

export function recordMissionCompletion(
  missionId: number,
  timeElapsed: number,
  accuracy: number
): CampaignProgress {
  const current = loadCampaignProgress();

  if (!current.completedMissions.includes(missionId)) {
    current.completedMissions.push(missionId);
  }

  // Unlock next mission
  const nextMissionId = missionId + 1;
  const exists = MISSIONS.some((m) => m.id === nextMissionId);
  if (exists && !current.unlockedMissions.includes(nextMissionId)) {
    current.unlockedMissions.push(nextMissionId);
  }

  // Update best records
  const prevBestTime = current.bestTimes[missionId];
  if (prevBestTime === undefined || timeElapsed < prevBestTime) {
    current.bestTimes[missionId] = timeElapsed;
  }

  const prevBestAcc = current.bestAccuracy[missionId];
  if (prevBestAcc === undefined || accuracy > prevBestAcc) {
    current.bestAccuracy[missionId] = accuracy;
  }

  saveCampaignProgress(current);
  return current;
}

export function getMissionConfig(missionId: number): ArenaMissionConfig {
  return MISSIONS.find((m) => m.id === missionId) || MISSIONS[0];
}
