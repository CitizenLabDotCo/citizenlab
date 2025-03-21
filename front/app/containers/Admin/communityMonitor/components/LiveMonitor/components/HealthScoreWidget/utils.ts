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

export const filterDataBySelectedQuarter = (
  quarterlyScores: QuarterlyScores | null,
  selectedYear: string,
  selectedQuarter: string
) => {
  if (!quarterlyScores) return null;

  // Get the index of the currently selected quarter, so we can filter the data
  const indexSelectedQuarter = quarterlyScores.overallHealthScores.findIndex(
    (score) => {
      return score.period === `${selectedYear}-${selectedQuarter}`;
    }
  );
  const minIndexToKeep = indexSelectedQuarter - 4;

  // Filter each group of scores to only include the last 5 quarters from the selected quarter
  const filteredOverallHealthScores =
    quarterlyScores.overallHealthScores.filter(
      (_score, index) =>
        index >= minIndexToKeep && index <= indexSelectedQuarter
    );

  const filteredCategoryHealthScores = quarterlyScores.categoryHealthScores.map(
    (category) => {
      const filteredScores = category.scores.filter(
        (_score, index) =>
          index >= minIndexToKeep && index <= indexSelectedQuarter
      );
      return {
        ...category,
        scores: filteredScores,
      };
    }
  );
  const filteredTotalHealthScoreCounts =
    quarterlyScores.totalHealthScoreCounts.filter(
      (_score, index) =>
        index >= minIndexToKeep && index <= indexSelectedQuarter
    );

  return {
    overallHealthScores: filteredOverallHealthScores,
    categoryHealthScores: filteredCategoryHealthScores,
    totalHealthScoreCounts: filteredTotalHealthScoreCounts,
  };
};

// For testing while in development.
// For testing while in development.
export const sentimentScoresMockData = {
  overallHealthScores: [
    { period: '2022-1', score: 2.4 },
    { period: '2022-2', score: 3.6 },
    { period: '2022-3', score: 2.9 },
    { period: '2022-4', score: 3.1 },
    { period: '2023-1', score: 3.2 },
    { period: '2023-2', score: 3.9 },
    { period: '2023-3', score: 3.5 },
    { period: '2023-4', score: 3.7 },
    { period: '2024-1', score: 2.1 },
    { period: '2024-2', score: 4.0 },
    { period: '2024-3', score: 3.0 },
    { period: '2024-4', score: 3.4 },
    { period: '2025-1', score: 4.3 },
  ],
  categoryHealthScores: [
    {
      category: 'quality_of_life',
      localizedLabel: 'Quality of life',
      scores: [
        { period: '2022-1', score: 1.9 },
        { period: '2022-2', score: 3.3 },
        { period: '2022-3', score: 2.7 },
        { period: '2022-4', score: 3.0 },
        { period: '2023-1', score: 2.6 },
        { period: '2023-2', score: 3.5 },
        { period: '2023-3', score: 3.1 },
        { period: '2023-4', score: 3.3 },
        { period: '2024-1', score: 1.5 },
        { period: '2024-2', score: 3.8 },
        { period: '2024-3', score: 2.0 },
        { period: '2024-4', score: 2.2 },
        { period: '2025-1', score: 3 },
      ],
    },
    {
      category: 'service_delivery',
      localizedLabel: 'Service delivery',
      scores: [
        { period: '2022-1', score: 2.4 },
        { period: '2022-2', score: 4.1 },
        { period: '2022-3', score: 3.3 },
        { period: '2022-4', score: 3.5 },
        { period: '2023-1', score: 2.8 },
        { period: '2023-2', score: 4.0 },
        { period: '2023-3', score: 3.6 },
        { period: '2023-4', score: 3.8 },
        { period: '2024-1', score: 2.9 },
        { period: '2024-2', score: 4.5 },
        { period: '2024-3', score: 3.1 },
        { period: '2024-4', score: 3 },
        { period: '2025-1', score: 3.5 },
      ],
    },
    {
      category: 'governance_and_trust',
      localizedLabel: 'Governance and trust',
      scores: [
        { period: '2022-1', score: 2.1 },
        { period: '2022-2', score: 4.0 },
        { period: '2022-3', score: 1.8 },
        { period: '2022-4', score: 2.5 },
        { period: '2023-1', score: 3.0 },
        { period: '2023-2', score: 4.4 },
        { period: '2023-3', score: 2.3 },
        { period: '2023-4', score: 3.1 },
        { period: '2024-1', score: 2.3 },
        { period: '2024-2', score: 4.9 },
        { period: '2024-3', score: 1.2 },
        { period: '2024-4', score: 2 },
        { period: '2025-1', score: 5 },
      ],
    },
  ],
  totalHealthScoreCounts: [
    {
      period: '2022-1',
      totals: [
        { sentimentValue: '1', count: 8 },
        { sentimentValue: '2', count: 6 },
        { sentimentValue: '3', count: 10 },
        { sentimentValue: '4', count: 7 },
        { sentimentValue: '5', count: 9 },
      ],
    },
    {
      period: '2022-2',
      totals: [
        { sentimentValue: '1', count: 10 },
        { sentimentValue: '2', count: 7 },
        { sentimentValue: '3', count: 11 },
        { sentimentValue: '4', count: 6 },
        { sentimentValue: '5', count: 8 },
      ],
    },
    {
      period: '2022-3',
      totals: [
        { sentimentValue: '1', count: 9 },
        { sentimentValue: '2', count: 8 },
        { sentimentValue: '3', count: 12 },
        { sentimentValue: '4', count: 5 },
        { sentimentValue: '5', count: 10 },
      ],
    },
    {
      period: '2022-4',
      totals: [
        { sentimentValue: '1', count: 6 },
        { sentimentValue: '2', count: 10 },
        { sentimentValue: '3', count: 14 },
        { sentimentValue: '4', count: 4 },
        { sentimentValue: '5', count: 9 },
      ],
    },
    {
      period: '2023-1',
      totals: [
        { sentimentValue: '1', count: 11 },
        { sentimentValue: '2', count: 5 },
        { sentimentValue: '3', count: 8 },
        { sentimentValue: '4', count: 9 },
        { sentimentValue: '5', count: 10 },
      ],
    },
    {
      period: '2023-2',
      totals: [
        { sentimentValue: '1', count: 7 },
        { sentimentValue: '2', count: 12 },
        { sentimentValue: '3', count: 13 },
        { sentimentValue: '4', count: 6 },
        { sentimentValue: '5', count: 8 },
      ],
    },
    {
      period: '2023-3',
      totals: [
        { sentimentValue: '1', count: 15 },
        { sentimentValue: '2', count: 4 },
        { sentimentValue: '3', count: 9 },
        { sentimentValue: '4', count: 7 },
        { sentimentValue: '5', count: 11 },
      ],
    },
    {
      period: '2023-4',
      totals: [
        { sentimentValue: '1', count: 12 },
        { sentimentValue: '2', count: 6 },
        { sentimentValue: '3', count: 10 },
        { sentimentValue: '4', count: 8 },
        { sentimentValue: '5', count: 9 },
      ],
    },
    {
      period: '2024-1',
      totals: [
        { sentimentValue: '1', count: 9 },
        { sentimentValue: '2', count: 5 },
        { sentimentValue: '3', count: 12 },
        { sentimentValue: '4', count: 6 },
        { sentimentValue: '5', count: 11 },
      ],
    },
    {
      period: '2024-2',
      totals: [
        { sentimentValue: '1', count: 14 },
        { sentimentValue: '2', count: 4 },
        { sentimentValue: '3', count: 10 },
        { sentimentValue: '4', count: 8 },
        { sentimentValue: '5', count: 9 },
      ],
    },
  ],
};
