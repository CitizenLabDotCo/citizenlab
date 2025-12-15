import { DemographicOption } from 'api/phase_insights/types';

import { Localize } from 'hooks/useLocalize';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

// Predefined age ranges for birthyear clustering
const AGE_RANGES = ['16-24', '25-34', '35-44', '45-54', '55-64', '65+'];

// Special key for users without demographic data + offline votes
const BLANK_KEY = '_blank';

/**
 * Get demographic keys in display order
 * For birthyear: predefined age ranges + _blank
 * For other demographics (gender, domicile): from backend options sorted by ordering + _blank
 * _blank is always added at the end to show users without data and offline votes
 */
export const getDemographicKeys = (
  clusterBy: string | undefined,
  options: Record<string, DemographicOption> | undefined
): string[] => {
  if (!clusterBy) return [];

  if (clusterBy === 'birthyear') {
    return [...AGE_RANGES, BLANK_KEY];
  }

  if (!options) return [];

  const sortedKeys = Object.entries(options)
    .sort(([, a], [, b]) => a.ordering - b.ordering)
    .map(([key]) => key);

  return [...sortedKeys, BLANK_KEY];
};

export const getDemographicLabel = (
  key: string,
  clusterBy: string | undefined,
  options: Record<string, DemographicOption> | undefined,
  localize: Localize,
  formatMessage?: (message: MessageDescriptor) => string
): string => {
  // Handle _blank key - users without demographic data + offline votes
  if (key === BLANK_KEY) {
    return formatMessage
      ? formatMessage(messages.unknownDemographic)
      : 'Unknown';
  }

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
