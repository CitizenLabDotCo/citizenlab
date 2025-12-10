import { DemographicOption } from 'api/phase_insights/types';

import { Localize } from 'hooks/useLocalize';

// Predefined age ranges for birthyear clustering
const AGE_RANGES = ['16-24', '25-34', '35-44', '45-54', '55-64', '65+'];

/**
 * Get demographic keys in display order
 * For birthyear: predefined age ranges
 * For other demographics (gender, domicile): from backend options sorted by ordering
 */
export const getDemographicKeys = (
  clusterBy: string | undefined,
  options: Record<string, DemographicOption> | undefined
): string[] => {
  if (!clusterBy) return [];

  if (clusterBy === 'birthyear') {
    return AGE_RANGES;
  }

  if (!options) return [];

  return Object.entries(options)
    .sort(([, a], [, b]) => a.ordering - b.ordering)
    .map(([key]) => key);
};

export const getDemographicLabel = (
  key: string,
  clusterBy: string | undefined,
  options: Record<string, DemographicOption> | undefined,
  localize: Localize
): string => {
  if (clusterBy === 'birthyear') {
    return key;
  }

  if (options?.[key]) {
    return localize(options[key].title_multiloc);
  }

  return key;
};

/**
 * Calculate bar percentages scaled to maxVotes
 * Returns online and offline percentages for progress bar display
 */
export const getScaledPercentages = (
  online: number,
  offline: number,
  maxVotes: number
): { onlinePct: number; offlinePct: number } => {
  const total = online + offline;
  const scaleFactor = maxVotes > 0 ? total / maxVotes : 0;
  const onlinePct = total > 0 ? (online / total) * 100 * scaleFactor : 0;
  const offlinePct = total > 0 ? (offline / total) * 100 * scaleFactor : 0;
  return { onlinePct, offlinePct };
};
