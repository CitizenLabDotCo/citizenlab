import { FormatMessage } from 'typings';

import { DemographicOption } from 'api/phase_insights/types';
import { VotingIdeaResult } from 'api/phase_insights/voting_insights/types';

import { Localize } from 'hooks/useLocalize';

import messages from './messages';

// Special key for users without demographic data + offline votes
const BLANK_KEY = '_blank';

/**
 * Get demographic keys in display order
 * For birthyear: extract keys from ideas series data (backend provides age ranges dynamically)
 * For other demographics (gender, domicile): from backend options sorted by ordering
 * _blank is always added at the end to show users without data and offline votes
 */
export const getDemographicKeys = (
  clusterBy: string | undefined,
  options: Record<string, DemographicOption> | undefined,
  ideas?: VotingIdeaResult[]
): string[] => {
  if (!clusterBy) return [];

  if (clusterBy === 'birthyear') {
    // Extract age range keys from the first idea's series (backend provides these dynamically)
    const firstIdeaWithSeries = ideas?.find((idea) => idea.series);
    if (!firstIdeaWithSeries?.series) return [];

    const keys = Object.keys(firstIdeaWithSeries.series).filter(
      (key) => key !== BLANK_KEY
    );
    return [...keys, BLANK_KEY];
  }

  if (!options) return [];

  const sortedKeys = Object.entries(options)
    .sort(([, a], [, b]) => a.ordering - b.ordering)
    .map(([key]) => key);

  return [...sortedKeys, BLANK_KEY];
};

export const getDemographicLabel = (
  key: string,
  options: Record<string, DemographicOption> | undefined,
  localize: Localize,
  formatMessage: FormatMessage
): string => {
  if (key === BLANK_KEY) {
    return formatMessage(messages.unknownDemographic);
  }

  if (options?.[key]) {
    return localize(options[key].title_multiloc);
  }

  // For birthyear age ranges or unknown keys, just return the key as-is
  return key;
};

/**
 * Calculate bar percentages for progress bar display
 * The bar represents the idea's share of total votes (percentage),
 * split into online and offline portions
 */
export const getScaledPercentages = (
  online: number,
  offline: number,
  percentage: number | null
): { onlinePct: number; offlinePct: number } => {
  const total = online + offline;
  const totalPercentage = percentage ?? 0;

  if (total === 0) {
    return { onlinePct: 0, offlinePct: 0 };
  }

  // Split the total percentage into online and offline portions
  const onlinePct = (online / total) * totalPercentage;
  const offlinePct = (offline / total) * totalPercentage;

  return { onlinePct, offlinePct };
};
