import { colors, Locale } from '@citizenlab/cl2-component-library';

import { CommunityMonitorSentimentScoreAttributes } from 'api/community_monitor_scores/types';

import { QuarterlyScores } from './types';

export const categoryColors = {
  overall: colors.green400,
  quality_of_life: colors.teal400,
  service_delivery: colors.blue400,
  governance_and_trust: colors.brown,
  other: colors.grey700,
};

// transformSentimentScoreData:
// Transform the sentiment score data object into a more usable format with arrays.
export function transformSentimentScoreData(
  scoreResults: CommunityMonitorSentimentScoreAttributes | undefined,
  locale: Locale
): QuarterlyScores | null {
  if (!scoreResults || !scoreResults.overall || !scoreResults.categories) {
    return null;
  }

  // Generate array for overall health scores
  const overallHealthScores = Object.entries(scoreResults.overall.averages).map(
    ([period, score]) => ({ period, score: Number(score) })
  );

  // Generate array for total health score counts
  const totalHealthScoreCounts = Object.entries(
    scoreResults.overall.totals
  ).map(([period, totalsPerSentimentValue]) => ({
    period,
    totals: Object.entries(totalsPerSentimentValue).map(
      ([sentimentValue, count]) => ({ sentimentValue, count: Number(count) })
    ),
  }));

  // Generate array for category health scores
  const categoryHealthScores = Object.entries(
    scoreResults.categories.averages
  ).map(([category, scores]) => {
    const localizedLabel =
      scoreResults.categories?.multilocs[category]?.[locale] || category;

    const scoreEntries = Object.entries(scores).map(([period, score]) => ({
      period,
      score,
    }));

    return {
      category,
      localizedLabel,
      scores: scoreEntries,
    };
  });

  return { overallHealthScores, categoryHealthScores, totalHealthScoreCounts };
}

// getYearFilter:
// Get the current year based on the date. If a year is provided in the URL, use that instead.
export const getYearFilter = (search: URLSearchParams) => {
  const year = search.get('year');
  if (year) {
    return year;
  }

  const date = new Date();
  return date.getFullYear().toString();
};

// getQuarterFilter:
// Get the current quarter based on the date. If a quarter is provided in the URL, use that instead.
export const getQuarterFilter = (search: URLSearchParams) => {
  const quarter = search.get('quarter');
  if (quarter) {
    return quarter;
  }

  const date = new Date();
  return Math.floor(date.getMonth() / 3 + 1).toString();
};
