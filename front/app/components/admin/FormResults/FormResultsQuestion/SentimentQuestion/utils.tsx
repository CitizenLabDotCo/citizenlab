import { colors } from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import { Multiloc } from 'typings';

import { ResultUngrouped } from 'api/survey_results/types';

export type SentimentAnswer = {
  answer: number | null;
  count?: number;
  percentage: number;
  label?: Multiloc;
};

export type SentimentAnswers = SentimentAnswer[] | undefined;

// parseResult:
// Parses survey results and extracts sentiment-related data.
export const parseResult = (result: ResultUngrouped): SentimentAnswers => {
  return result.answers?.map(({ answer, count }) => ({
    answer: answer ? parseInt(answer.toString(), 10) : null,
    count,
    percentage: Math.round((count / result.questionResponseCount) * 100),
    label: answer ? result.multilocs?.answer[answer].title_multiloc : undefined,
  }));
};

// getSentimentGroupColour:
// Retrieves the corresponding color for a sentiment group (low, neutral, high).
export const getSentimentGroupColour = (
  sentimentGroup: string
): string | undefined =>
  ({
    low: colors.red400,
    neutral: colors.grey400,
    high: colors.green400,
  }[sentimentGroup]);

// getSentimentValueColour:
// Retrieves the corresponding color for a specific sentiment value (1-5).
export const getSentimentValueColour = (answer: number): string | undefined =>
  ({
    1: colors.red400,
    2: lighten(0.2, colors.red400),
    3: colors.grey400,
    4: lighten(0.2, colors.green400),
    5: colors.green400,
  }[answer]);

// getPercentageDifference:
// Calculates the percentage difference between two periods.
export const getPercentageDifference = (
  thisPeriodAvg?: number | null,
  lastPeriodAvg?: number | null
): number | null => {
  if (!thisPeriodAvg || !lastPeriodAvg) {
    return null;
  }

  return lastPeriodAvg === 0
    ? 0
    : ((thisPeriodAvg - lastPeriodAvg) / lastPeriodAvg) * 100;
};

// getTrendColorName:
// Determines the trend color based on percentage difference.
export const getTrendColorName = (
  percentageDifference: number
): 'green500' | 'red400' | 'grey700' => {
  if (percentageDifference > 0) {
    return 'green500'; // Positive trend
  } else if (percentageDifference < 0) {
    return 'red400'; // Negative trend
  }
  return 'grey700'; // No change
};
