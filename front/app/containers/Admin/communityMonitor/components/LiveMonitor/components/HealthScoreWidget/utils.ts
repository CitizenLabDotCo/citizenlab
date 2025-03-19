import { Locale } from '@citizenlab/cl2-component-library';

import { Categories, QuarterScores } from 'api/community_monitor_scores/types';

import { QuarterlyScores } from './types';

// transformSentimentScoreData:
// Transform the sentiment score data object into a more usable format with arrays.
export function transformSentimentScoreData(
  scoreResults:
    | {
        overall?: QuarterScores;
        categories?: Categories;
      }
    | undefined,
  locale: Locale
): QuarterlyScores | null {
  if (!scoreResults || !scoreResults.overall || !scoreResults.categories) {
    return null;
  }

  const overallHealthScores = Object.entries(scoreResults.overall).map(
    ([period, score]) => ({ period, score: Number(score) })
  );

  const categoryHealthScores = Object.entries(
    scoreResults.categories.averages
  ).map(([category, scores]) => {
    const localizedLabel =
      scoreResults.categories?.multilocs[category][locale] || category;

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

  return { overallHealthScores, categoryHealthScores };
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
